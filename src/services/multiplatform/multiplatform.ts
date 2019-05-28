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
  private async discoverLinksSources(
    links: string[],
    originSource: string
  ): Promise<void> {
    const discoverService = this.serviceProviders[originSource].discovery;

    if (discoverService) {
      // Discover known sources of link from the discover service
      await Promise.all(
        links.map(async link => {
          let knownSources = await discoverService.getKnownSources(link);

          // If there are no known sources, assume that the source of the object is the original source
          if (!knownSources) {
            knownSources = [originSource];
          }

          await this.knownSources.addKnownSources(link, knownSources);
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
   * @param linksToDiscover: function that gets the links from the retrieved object to ask for their sources
   * @returns the object retrieved
   */
  protected async discover<O>(
    hash: string,
    getter: (service: T, hash: string) => Promise<O>,
    linksToDiscover: (object: O) => string[] = () => []
  ): Promise<O> {
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
        const discoverService = this.serviceProviders[source].discovery;

        if (object) {
          // Object retrieved successfully, discover the known sources of the links the object points to
          const links = linksToDiscover(object);
          this.discoverLinksSources(links, source);

          return object;
        } else {
          if (discoverService) {
            // The get call succeeded but didn't return the object, remove the source from the known sources
            discoverService.removeKnownSource(hash, source);
          }
        }
      } catch (e) {
        // The get call failed, do nothing (it could be a network error)
      }
    }

    // All known sources failed, throw error
    throw new Error(`Object with hash ${hash} not found in any of the sources`);
  }

  /**
   * Returns the service provider identified by the given key
   */
  public getServiceProvider(serviceProvider: string): T {
    return this.serviceProviders[serviceProvider].service;
  }
}
