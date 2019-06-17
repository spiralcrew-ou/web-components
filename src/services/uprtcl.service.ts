import { Commit, Perspective, Context } from '../types';

export interface UprtclService {
  /** ---------------
   * Basic Getters
   * ---------------- */
  getContext(contextId: string): Promise<Context>;
  getPerspective(perspectiveId: string): Promise<Perspective>;
  getCommit(commitId: string): Promise<Commit>;

  /** ---------------
   * Support getters
   * ---------------- */

  /** getRootContextId() returns the id of the root context of the authenticated
   * user on that platform. The root context of a user is unique and equal to
   * {"creatorId":userDid,"timestamp":"0","nonce":"0"}
   */
  getRootContextId(): Promise<string>;

  /** getContextId() returns the id of a given context using the platform native
   * hash algorithm, allowing the same context to exist with different IDs depending
   * on the hash algorithm (twin ids).
   */
  getContextPerspectives(contextId: string): Promise<Perspective[]>;

  /** ---------------
   * Object Creators
   *
   *  "Creators" create new objects using the authenticated user as creatorId
   *  and compute the ID of the object using the platform native hash algorithm.
   *
   * ----------------- */
  createContext(context: Context): Promise<string>;
  createPerspective(perspective: Perspective): Promise<string>;
  createCommit(commit: Commit): Promise<string>;

  /** ---------------
   * Support modifiers
   * ---------------- */

  /** updateHead() set the head of a perspective to a given commitId
   * - perspectiveId: ID of the perspective. Cannot be empty and must exist on the platform.
   * - commitId: ID of the commit. Cannot be empty but MAY not exist in the platform.
   */
  updateHead(perspectiveId: string, commitId: string): Promise<void>;

  /** getHead() get the head of a perspective to a given commitId
   * - perspectiveId: ID of the perspective. Cannot be empty and must exist on the platform.
   */
  getHead(perspectiveId: string): Promise<string>;
}
