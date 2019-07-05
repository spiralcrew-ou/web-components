import { EntityRegistry } from './entity.registry';
import { TextNodeEntity, textNodeEntity } from './uprtcl/text-node.entity';
import { TextNode } from '../types';
import { uprtclMultiplatform } from '../services';

const registry = new EntityRegistry();

const TextNodeEntity = textNodeEntity(uprtclMultiplatform)
registry.registerEntity('text-node', TextNodeEntity);

const node: TextNode = {
  text: '',
  type: '',
  links: []
};

const s: TextNodeEntity = registry.get(node);
