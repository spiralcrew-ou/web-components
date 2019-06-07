import { Dictionary } from '../../types';
import { DiscoveryService } from '../discovery.service';
import { DiscoveryLocal } from '../local/discovery.local';

export class Multiplatform<T> {
  /**
   * Dictionary of service providers
   * Its key should be the identification of the source by other sources
   */
  serviceProviders: Dictionary<{ service: T; discovery: DiscoveryService }>;

  // Stores the known sources locally
  knownSources: DiscoveryService = new DiscoveryLocal();

  constructor(
    serviceProviders: Dictionary<{
      service: T;
      discovery: DiscoveryService;
    }>
  ) {
    this.serviceProviders = serviceProviders;
  }

  /**
   * Discover the sources of the given links from the discover service of the originSource
   * and store them locally for future operations
   */
  protected async discoverLinksSources(
    links: string[],
    originSource: string
  ): Promise<void> {
    const discoverService = this.serviceProviders[originSource].discovery;

    if (discoverService) {
      // Discover known sources of link from the discover service
      await Promise.all(
        links.map(async link => {
          if (link != null) {
            let knownSources = await this.knownSources.getKnownSources(link);
            if (!knownSources || knownSources.length === 0) {
              knownSources = await discoverService.getKnownSources(link);
            }
  
            // If there are no known sources, assume that the source of the object is the original source
            if (knownSources) {
              await this.knownSources.addKnownSources(link, knownSources);
            }
          }
        })
      );
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
  protected async discoverObject<O>(
    hash: string,
    getter: (service: T, hash: string) => Promise<O>,
    linksSelector: (object: O) => string[] = () => []
  ): Promise<O> {
    if (typeof hash !== 'string') {
      debugger;
    }

    // Retrieve the known sources from the local store
    const knownSources = await this.knownSources.getKnownSources(hash);

    // Iterate through the known sources until a source successfully returns the object
    for (const source of knownSources) {
      try {
        // Try to retrieve the object
        const object = await getter(
          this.serviceProviders[source].service,
          hash
        );

        if (object) {
          // Object retrieved successfully, discover the known sources of the links the object points to
          const links = linksSelector(object);
          await this.discoverLinksSources(links, source);

          return object;
        } else {
          const discoverService = this.serviceProviders[source].discovery;
          if (discoverService) {
            // The get call succeeded but didn't return the object, remove the source from the known sources
            await discoverService.removeKnownSource(hash, source);
          }
        }
      } catch (e) {
        // The get call failed, don't remove the known source as it could be a network error
        console.error(e);
      }
    }

    // All known sources failed, throw error
    throw new Error(`Object with hash ${hash} not found in any of the sources`);
  }

  /**
   * Retrieves the known source for the given hash, and uses the source's service provider to get the object
   * Finally, asks for the known sources of the links contained in the object
   *
   * @param hash: the hash of the object to be discovered
   * @param getter: function that executes the call to get the object from the hash
   * @param linksToObjects: function that gets the links from the retrieved object to ask for their sources
   * @returns the object retrieved
   */
  protected async discoverArray<O>(
    hash: string,
    getter: (service: T, hash: string) => Promise<Array<O>>,
    linksSelector: (object: O) => string[] = () => [],
    idSelector: (object: O) => string = o => o['id']
  ): Promise<Array<O>> {
    // Retrieve the known sources from the local store
    const knownSources = await this.knownSources.getKnownSources(hash);

    // Iterate through the known sources until a source successfully returns the array of objects
    for (const source of knownSources) {
      try {
        // Try to retrieve the object
        const array = await getter(this.serviceProviders[source].service, hash);

        if (array) {
          // Array retrieved successfully, iterate through the array
          for (const object of array) {
            // Store the object id to the add known sources
            const objectId = idSelector(object);
            await this.knownSources.addKnownSources(objectId, [source]);

            // Discover the known sources of the links the object points to
            const links = linksSelector(object);
            await this.discoverLinksSources(links, source);
          }

          return array;
        } else {
          const discoverService = this.serviceProviders[source].discovery;
          if (discoverService) {
            // The get call succeeded but didn't return the object, remove the source from the known sources
            discoverService.removeKnownSource(hash, source);
          }
        }
      } catch (e) {
        // The get call failed, don't remove the known source as it could be a network error
        console.error(e);
      }
    }

    // All known sources failed, throw error
    throw new Error(
      `Array with relation to hash ${hash} not found in any of the sources`
    );
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
  public async createWithLinks(
    serviceProvider: string,
    creator: (service: T) => Promise<string>,
    linksToObjects: string[]
  ): Promise<string> {
    // Create the object in the service provider
    const newHash = await creator(
      this.serviceProviders[serviceProvider].service
    );

    // Get the discovery service for the given service provider
    const discoveryService = this.serviceProviders[serviceProvider].discovery;
    // TODO: check if this known source should be source or serviceProvider
    // const source = await discoveryService.getOwnSource();

    // Add the newly created object to the local known sources
    await this.knownSources.addKnownSources(newHash, [serviceProvider]);

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
