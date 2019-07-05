declare global {
  interface Window {
    process?: Object;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
}

import {
  createStore,
  compose,
  applyMiddleware,
  combineReducers,
  Reducer,
  StoreEnhancer
} from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import { lazyReducerEnhancer } from 'pwa-helpers/lazy-reducer-enhancer.js';
import { UprtclAction } from './uprtcl/actions';
import { DocumentAction } from './documents/actions';
import { DraftAction } from './drafts/actions';
import { DraftsState, draftsReducer } from './drafts/reducer';
import { DocumentsState, documentsReducer } from './documents/reducer';
import { UprtclState, uprtclReducer } from './uprtcl/reducer';
import { EditorState, editorReducer } from './editor/reducer';
import { ProvidersState, providersReducer } from './multiplatform/reducer';
import { configureUprtcl } from './uprtcl';
import { uprtclMultiplatform, dataMultiplatform } from '../services';
import { RecursiveContextMergeStrategy } from '../services/merge/recursive-context.merge.strategry';

// Overall state extends static states and partials lazy states.

const uprtclModule = configureUprtcl(
  uprtclMultiplatform,
  new RecursiveContextMergeStrategy(uprtclMultiplatform, dataMultiplatform)
);

export interface RootState {
  editor: EditorState;
  documents: DocumentsState;
  drafts: DraftsState;
  providers: ProvidersState;
  uprtcl: UprtclState;
}

export type RootAction = UprtclAction | DocumentAction | DraftAction;

// Sets up a Chrome extension for time travel debugging.
// See https://github.com/zalmoxisus/redux-devtools-extension for more information.
const devCompose: <Ext0, Ext1, StateExt0, StateExt1>(
  f1: StoreEnhancer<Ext0, StateExt0>,
  f2: StoreEnhancer<Ext1, StateExt1>
) => StoreEnhancer<Ext0 & Ext1, StateExt0 & StateExt1> =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Initializes the Redux store with a lazyReducerEnhancer (so that you can
// lazily add reducers after the store has been created) and redux-thunk (so
// that you can dispatch async actions). See the "Redux and state management"
// section of the wiki for more details:
// https://github.com/Polymer/pwa-starter-kit/wiki/4.-Redux-and-state-management
export const store = createStore(
  state => state as Reducer<RootState, RootAction>,
  devCompose(
    lazyReducerEnhancer(combineReducers),
    applyMiddleware(thunk as ThunkMiddleware<RootState, RootAction>)
  )
);

// Initially loaded reducers.
store.addReducers({
  editor: editorReducer,
  documents: documentsReducer,
  drafts: draftsReducer,
  providers: providersReducer,
  uprtcl: uprtclModule.reducer
});
