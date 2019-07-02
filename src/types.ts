export interface Context {
  id?: string;
  creatorId: string;
  timestamp: number;
  nonce: number;
}

export interface Perspective {
  id?: string;
  origin: string;
  creatorId: string;
  timestamp: number;
  contextId: string;
  name: string;
}

export interface Commit {
  id?: string;
  creatorId: string;
  timestamp: number;
  message: string;
  parentsIds: Array<string>;
  dataId: string;
}

export interface Position {
  before?: string;
  after: string;
}

export const PropertyOrder = {
  Context: ['creatorId', 'timestamp', 'nonce'],
  Perspective: ['origin', 'creatorId', 'timestamp', 'contextId', 'name'],
  Commit: ['creatorId', 'timestamp', 'message', 'parentsIds', 'dataId'],
  TextNode: ['text', 'type', 'links']
};

export interface TextNode {
  id?: string;
  text: string;
  type: string;
  links: Array<{
    position?: Position;
    link: string;
  }>;
}

export type Dictionary<T> = { [key: string]: T };

export class ContextFull {
  id?: string;
  creatorId: string;
  timestamp: number;
  nonce: number;
}
export class PerspectiveFull {
  id: string;
  origin: string;
  creatorId: string;
  timestamp: number;
  context: Context;
  name: string;
  draft: TextNodeFull;
  head: CommitFull;
}

export class CommitFull {
  id?: string;
  creatorId: string;
  timestamp: number;
  message: string;
  parentsIds: Array<String> = [];
  data: TextNodeFull;
}

export class TextNodeFull {
  id?: string;
  text: string;
  type: string;
  links: Array<{
    position?: Position;
    link: PerspectiveFull;
  }> = [];
}

export class TextNodeTree {
  id?: string;
  text: string;
  type: string;
  links: Array<TextNodeTree> = [];
}


export enum NodeType {
  title = 'title',
  paragraph = 'paragraph'
}
export interface Block {
  id: string;
  children: string[];
  status: string;
  content: string;
  style: NodeType;
  serviceProvider: string;
  creatorId: string;
}
