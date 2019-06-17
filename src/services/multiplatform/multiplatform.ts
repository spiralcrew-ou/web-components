import { Dictionary } from '../../types';
import { DiscoveryService } from '../discovery.service';
import { DiscoveryLocal } from '../local/discovery.local';

export interface DiscoveryProvider<T> {
  discovery: DiscoveryService;
  service: T;
}

export class Multiplatform<T> {
  /**
   * Dictionary of service providers
   * Its key should be the identification of the source by other sources
   */
  serviceProviders: Dictionary<DiscoveryProvider<T>>;

  // Stores the known sources locally
  knownSources: DiscoveryService = new DiscoveryLocal();

  constructor(serviceProviders: Dictionary<DiscoveryProvider<T>>) {
    this.serviceProviders = serviceProviders;
  }

  public async getKnownSources(hash: string): Promise<string[]> {
    return this.knownSources.getKnownSources(hash);
  }

  /**
   * Discover the sources of the given link from the discover service of the originSource
   * and store them locally for future operations
   */
  private async discoverLinkSources(
    serviceProvider: string,
    link: string
  ): Promise<void> {
    const discoverService = this.serviceProviders[serviceProvider].discovery;

    let knownSources = await this.knownSources.getKnownSources(link);
    if (!knownSources || knownSources.length === 0) {
      knownSources = await discoverService.getKnownSources(link);
    }

    // If there are no known sources, assume that the source of the object is the original source
    if (knownSources) {
      await this.knownSources.addKnownSources(link, knownSources);
    }
  }

  /**
   * Discover the sources of the given links from the discover service of the originSource
   * and store them locally for future operations
   */
  protected async discoverLinksSources(
    serviceProvider: string,
    links: string[]
  ): Promise<void> {
    const discoverService = this.serviceProviders[serviceProvider].discovery;

    if (discoverService) {
      // Discover known sources of link from the discover service
      await Promise.all(
        links
          .filter(link => link != null)
          .map(link => this.discoverLinkSources(serviceProvider, link))
      );
    }
  }

  /**
   * Removes the given known source from the given hash, if a discovery service from the source exists
   */
  private async removeKnownSource(source: string, hash: string): Promise<void> {
    const discoverService = this.serviceProviders[source].discovery;
    if (discoverService) {
      await discoverService.removeKnownSource(hash, source);
    }
  }

  protected async getFromSource<O>(
    source: string,
    getter: (service: T) => Promise<O>,
    linksSelector: (object: O) => string[] = () => []
  ): Promise<O> {
    // Try to retrieve the object
    const object = await getter(this.serviceProviders[source].service);

    if (object) {
      // Object retrieved successfully, discover the known sources of the links the object points to
      const links = linksSelector(object);
      await this.discoverLinksSources(source, links);
    }
    return object;
  }

  /**
   * Gets the object identified with the given hash from the given source
   */
  private async tryGetFromSource<O>(
    source: string,
    hash: string,
    getter: (service: T) => Promise<O>,
    linksSelector: (object: O) => string[] = () => []
  ): Promise<O> {
    try {
      const object = await this.getFromSource(source, getter, linksSelector);

      if (!object) {
        // The get call succeeded but didn't return the object, remove the source from the known sources
        await this.removeKnownSource(source, hash);
      }
      return object;
    } catch (e) {
      // The get call failed, don't remove the known source as it could be a network error
      console.error(e);
    }
  }

  /**
   * Retrieves the known source for the given hash, and uses the source's service provider to get the object
   * Finally, asks for the known sources of the links contained in the object
   *
   * @param hash: the hash of the object to be discovered
   * @param getter: function that executes the call to get the object from the hash
   * @param linksSelector: function that gets the links from the retrieved object to ask for their sources
   * @returns the object retrieved
   */
  protected async discover<O>(
    hash: string,
    getter: (service: T) => Promise<O>,
    linksSelector: (object: O) => string[] = () => []
  ): Promise<O> {
    if (typeof hash !== 'string') {
      return null;
    }

    // Retrieve the known sources from the local store
    const knownSources = await this.knownSources.getKnownSources(hash);

    // Iterate through the known sources until a source successfully returns the object
    for (const source of knownSources) {
      const object = await this.tryGetFromSource(
        source,
        hash,
        getter,
        linksSelector
      );
      if (object) return object;
    }

    // All known sources failed, throw error
    throw new Error(
      `Object with hash ${hash} not found in any of the known sources`
    );
  }

  /**
   * Retrieves the objects from all the service providers
   *
   * @param hash: the hash of the object to be discovered
   * @param getter: function that executes the call to get the object from the hash
   * @param linksToObjects: function that gets the links from the retrieved object to ask for their sources
   * @returns the array of objects retrieved
   */
  protected async getFromAllSources<O>(
    hash: string,
    getter: (service: T) => Promise<O>,
    linksSelector: (object: O) => string[] = () => [],
    idSelector: (object: O) => string = o => o['id']
  ): Promise<Array<O>> {
    if (typeof hash !== 'string') {
      return null;
    }

    let results = [];

    // Iterate through the known sources until a source successfully returns the array of objects
    for (const source of this.getServiceProviders()) {
      const object = await this.tryGetFromSource(
        source,
        hash,
        getter,
        linksSelector
      );
      if (object) {
        // If object is an array, we should add to the known sources each element of the array
        if (object instanceof Array) {
          const addToKnownSources = object.map(element =>
            this.knownSources.addKnownSources(idSelector(element), [source])
          );
          await Promise.all(addToKnownSources);
        } else {
          await this.knownSources.addKnownSources(hash, [source]);
        }

        results.push(object);
      }
    }

    return results;
  }

  /**
   * Executes the given modify function in the given service provider,
   * and stores the known sources of the given links on that service provider's discovery module
   */
  private async modifyWithLinks<S>(
    serviceProvider: string,
    modifier: (service: T) => Promise<S>,
    linksToObjects: string[]
  ): Promise<S> {
    // Execute the given modifier function in the service provider
    const newHash = await modifier(this.getServiceProvider(serviceProvider));

    // Get the discovery service for the given service provider
    const discoveryService = this.serviceProviders[serviceProvider].discovery;
    // TODO: check if this known source should be source or serviceProvider
    // const source = await discoveryService.getOwnSource();

    if (discoveryService) {
      // Stores the links contained in the object in the discovery service of the given service provider
      await Promise.all(
        linksToObjects.map(async link => {
          const knownLinkSources = await this.knownSources.getKnownSources(
            link
          );

          await discoveryService.addKnownSources(link, knownLinkSources);
        })
      );
    }

    return newHash;
  }

  /**
   * Creates the object in the given service provider,
   * stores it in the local known sources
   * and stores the known sources of its links in the discovery service of the given service provider
   *
   * @param serviceProvider
   * @param creator
   * @param linksToObjects
   * @returns the newly created hash of the object
   */
  protected async create(
    serviceProvider: string,
    creator: (service: T) => Promise<string>,
    linksToObjects: string[]
  ): Promise<string> {
    // Create the object in the service provider
    const newHash = await this.modifyWithLinks(
      serviceProvider,
      creator,
      linksToObjects
    );

    // Add the newly created object to the local known sources
    await this.knownSources.addKnownSources(newHash, [serviceProvider]);

    return newHash;
  }

  /**
   * Executes the given update function on the given service provider
   *
   * @param serviceProvider
   * @param updater
   * @param linksToObjects
   */
  public async update(
    serviceProvider: string,
    updater: (service: T) => Promise<void>,
    linksToObjects: string[]
  ): Promise<void> {
    return this.modifyWithLinks(serviceProvider, updater, linksToObjects);
  }

  /**
   * Returns the service provider identified by the given key
   */
  public getServiceProviders(): string[] {
    return Object.keys(this.serviceProviders);
  }

  /**
   * Returns the service provider identified by the given key
   */
  public getServiceProvider(serviceProvider: string): T {
    return this.serviceProviders[serviceProvider].service;
  }
}
