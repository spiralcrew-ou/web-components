import { Reducer, AnyAction, ActionCreator } from 'redux';

type Dictionary<T> = { [key: string]: T };

type Selector<S> = ((...args) => (state: S) => any) | ((state: S) => any);

type Tree<L> = {
  [key: string]: L | Tree<L>;
};
type Selectors<S> = Tree<Selector<S>>;

export interface TypedActionCreator<A, T> {
  (args: T): A
}

export interface ReduxModule<S, A extends AnyAction, C extends Dictionary<TypedActionCreator<any, any>>> {
  reducer: Reducer<S, A>;
  selectors: Selectors<S>;
  actions: C;
}
