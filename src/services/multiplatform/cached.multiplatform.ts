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

  protected async cachedDiscover<O>(
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
    const object = await this.discover(hash, getter, linksSelector);

    // ... and store it in the cache service
    await cloner(this.cacheService, object);

    // Return the object
    return object;
  }

  /**
   * Fallback getter, executes the get function first in the server,
   * and if it fails, executes it in the cache service
   */
  protected async fallbackGet<O>(
    serviceProvider: string,
    getter: (service: T) => Promise<O>,
    linksSelector: (object: O) => string[]
  ): Promise<O> {
    try {
      const object = await this.getFromSource(
        serviceProvider,
        getter,
        linksSelector
      );

      return object;
    } catch (e) {
      return getter(this.cacheService);
    }
  }

  protected async optimisticCreate<O>(
    serviceProvider: string,
    object: O,
    creator: (service: T, object: O) => Promise<any>,
    linksToObjects: string[]
  ): Promise<string> {
    const objectId = await creator(this.cacheService, object);

    object['id'] = objectId;

    const task = () =>
      this.create(
        serviceProvider,
        service => creator(service, object),
        linksToObjects
      ).then(() =>
        this.knownSources.addKnownSources(objectId, [serviceProvider])
      );

    this.taskQueue.queueTask(task);

    return objectId;
  }

  protected async optimisticUpdate(
    serviceProvider: string,
    updater: (service: T) => Promise<void>,
    linksToObjects: string[]
  ): Promise<void> {
    await updater(this.cacheService);

    const task = () => this.update(serviceProvider, updater, linksToObjects);
    this.taskQueue.queueTask(task);
  }
}
