import { Commit, Perspective, Context } from '../types';

export interface UprtclService {
  /** Getters */

  getRootContext(): Promise<Context>;
  
  getContext(contextId: string): Promise<Context>;
  getContextId(context: Context): Promise<string>;

  getPerspective(perspectiveId: string): Promise<Perspective>;
  getCommit(commitId: string): Promise<Commit>;

  getContextPerspectives(contextId: string): Promise<Perspective[]>;

  /** Modifiers */

  // Contexts
  /**
   * Creates the context if necessary and returns its ID
   */
  createContext(context: Context): Promise<string>;

  // Perspectives
  createPerspective(
    contextId: string,
    name: string,
    headLink: string
  ): Promise<string>;
  createPerspectiveAndContent(
    context: Context,
    name: string,
    head: Commit
  ): Promise<string>;

  // Commit
  createCommit(
    perspectiveId: string,
    message: string,
    dataLink: string
  ): Promise<string>;
}
