export interface Context {
  id?: string;
  creatorId: string;
  timestamp: number;
  nonce: number;
}

export interface Perspective {
  id: string;
  origin: string;
  creatorId: string;
  timestamp: number;
  contextId: string;
  name: string;
  headId: string;
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

export interface TextNode {
  id?: string;
  text: string;
  links: Array<{
    position?: Position;
    type?: string,
    link: string;
  }>;
}

export type Draft = {
  perspectiveId: string;
  dataId: string;
};

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
  links: Array<{
    position?: Position;
    type?: string,
    link: PerspectiveFull;
  }> = [];
}