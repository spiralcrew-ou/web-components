import { Entity } from './entity';
import { Dictionary } from './types';

export type EntityClass<T extends object> = new (object: T) => Entity<T>;

export class EntityRegistry {
  entities: Dictionary<EntityClass<object>> = {};

  registerEntity<T extends object>(name: string, entityClass: EntityClass<T>) {
    this.entities[name] = entityClass;
  }

  get<T extends object, E extends Entity<T>>(object: T): E {
    const entityName = Object.keys(this.entities).find(entityName =>
      new this.entities[entityName](object).isEntity()
    );

    return <E>new this.entities[entityName](object);
  }
}
