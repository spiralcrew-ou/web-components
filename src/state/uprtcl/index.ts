import { MergeStrategy } from '../../services/merge/merge.strategy';
import { ReduxModule } from '../types';
import { UprtclState, uprtclReducer } from './reducer';
import { UprtclAction, configureActions, UprtclActionCreators } from './actions';
import { UprtclService } from '../../services/uprtcl.service';
import selectors from './selectors';

export function configureUprtcl<D>(
  uprtcl: UprtclService,
  merge: MergeStrategy<D>
): ReduxModule<UprtclState, UprtclAction, UprtclActionCreators> {
  return {
    reducer: uprtclReducer,
    actions: configureActions(uprtcl, merge),
    selectors: selectors
  };
}
