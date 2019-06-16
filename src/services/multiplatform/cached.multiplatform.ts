import { Multiplatform, DiscoveryProvider } from './multiplatform';
import { Dictionary } from '../../types';
import { TaskQueue } from './task.queue';

export class CachedMultiplatform<T> extends Multiplatform<T> {
  cacheService: T;

  taskQueue = new TaskQueue();

  constructor(
    serviceProviders: Dictionary<DiscoveryProvider<T>>,
    cacheService: T
  ) {
    super(serviceProviders);
    this.cacheService = cacheService;
  }

  protected async cachedDiscoverObject<O>(
    hash: string,
    getter: (service: T) => Promise<O>,
    cloner: (service: T, object: O) => Promise<any>,
    linksSelector: (object: O) => string[] = () => []
  ): Promise<O> {
    if (typeof hash !== 'string' || hash == null) {
      return null;
    }

    // If we have the object already cached, return it
    const cachedObject = await getter(this.cacheService);
    if (cachedObject) {
      return cachedObject;
    }

    // If not, discover the object...
    const object = await this.discoverObject(hash, getter, linksSelector);

    // ... and store it in the cache service
    await cloner(this.cacheService, object);

    // Return the object
    return object;
  }

  public async cachedCreateWithLinks<O>(
    serviceProvider: string,
    getter: (service: T, hash: string) => Promise<O>,
    creator: (service: T) => Promise<string>,
    cloner: (service: T, object: O) => Promise<any>,
    linksToObjects: string[]
  ): Promise<string> {
    const objectId = await creator(this.cacheService);

    const object = await getter(this.cacheService, objectId);

    const task = () =>
      this.createWithLinks(
        serviceProvider,
        service => cloner(service, object),
        linksToObjects
      ).then(() =>
        this.knownSources.addKnownSources(objectId, [serviceProvider])
      );

    this.taskQueue.queueTask(task);

    return objectId;
  }

  public async cachedUpdateWithLinks(
    serviceProvider: string,
    updater: (service: T) => Promise<void>,
    linksToObjects: string[]
  ): Promise<void> {
    await updater(this.cacheService);

    const task = () =>
      this.updateWithLinks(serviceProvider, updater, linksToObjects);
    this.taskQueue.queueTask(task);
  }
}
