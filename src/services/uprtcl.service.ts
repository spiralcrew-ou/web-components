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
  getContextId(context: Context): Promise<string>;

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

   /** Context 
    * 
    * - timestamp: Unix epoch in miliseconds. Is final. Updating it changes the context ID.
    * - nonce: Free.  Is final. Updating it changes the context ID.
   */
  createContext(timestamp: number, nonce: number): Promise<string>;


   /** Perspective 
    * 
    * - contextId: Cannot be null. Is final. Updating it changes the perspective ID.
    * - name: Can be empty. Is final. Updating it changes the perspective ID.
    * - timestamp: Unix epoch in miliseconds.  Is final. Updating it changes the perspective ID.
    * - headId: id of the head commit to set as head. Is editable (changing it wont change the perspectiveID)
    * 
   */
  createPerspective(
    contextId: string,
    name: string,
    timestamp: number,
    headId: string
  ): Promise<string>;

  /** Commit
    * 
    * - timestamp: Unix epoch in miliseconds.  Is final. Updating it changes the commit ID.
    * - message: Can be empty. Is final. Updating it changes the commit ID.
    * - parentIds: Can be empty. Is final. Updating them changes the commit ID.
    * - headId: Id of the data. Cannot be empty. Is final. Updating it changes the commit ID.
    * 
   */
  createCommit(
    timestamp: number,
    message: string,
    parentsIds: string[],
    dataId: string
  ): Promise<string>;



  /** --------------- 
   * Object Cloner
   *
   *  "Cloners" create existing objects with an arbitary creatorId and an existing
   *  object ID. They MAY verify the object IDs consistency, but only if they can
   *  run its hash algorithms. They MAY reject objects that they cannot veriy.
   * 
   *  Its the duty of an upper layer to decide which ones of all the linked objects 
   *  are also cloned. Not all of them need to be cloned, so broken links MAY exist.
   *  (links to objects that the current platform does not contain). 
   * 
   * ----------------- */
  cloneContext(context: Context): Promise<string>;
  clonePerspective(perspective: Perspective): Promise<string>;
  cloneCommit(commit: Commit): Promise<string>;


  /** --------------- 
   * Support modifiers 
   * ---------------- */

   /** updateHead() set the head of a perspective to a given commitId 
    * - perspectiveId: ID of the perspective. Cannot be empty and most exist on the platform.
    * - commitId: ID of the commit. Cannot be empty but MAY not exist in the platform.
   */
  updateHead(
    perspectiveId: string,
    commitId: string
  ): Promise<void>;

}
