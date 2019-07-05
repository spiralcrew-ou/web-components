import { adapters, UprtclState } from './reducer';

export const contexts = adapters.contexts.selectors(
  (state: UprtclState) => state.contexts
);
export const perspectives = adapters.perspectives.selectors(
  (state: UprtclState) => state.perspectives
);
export const commits = adapters.commits.selectors(
  (state: UprtclState) => state.commits
);

export const selectContextPerspectives = (contextId: string) => (
  state: UprtclState
) =>
  perspectives
    .selectAll(state)
    .filter(perspective => perspective.contextId === contextId);

export const selectHead = (perspectiveId: string) => (state: UprtclState) =>
  state.heads[perspectiveId];

export default {
  contexts: contexts,
  perspectives: perspectives
};
