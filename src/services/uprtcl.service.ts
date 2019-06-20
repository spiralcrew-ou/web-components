import { Commit, Perspective, Context } from '../types';
import { CidCompatible } from './cid.service';

export interface UprtclService extends CidCompatible {

  /** ---------------
   * Basic Getters
   * ---------------- */
  getContext(contextId: string): Promise<Context>;
  getPerspective(perspectiveId: string): Promise<Perspective>;
  getCommit(commitId: string): Promise<Commit>;
  computeContextId(context: Context): Promise<string>;

  /** ---------------
   * Support getters
   * ---------------- */
  /** getContextPerspectives() returns all the perspectives associated to a 
   * context.
   * 
   * @param contextId The context id
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
