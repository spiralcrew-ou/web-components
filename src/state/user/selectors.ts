import { UserState } from './reducer';

export const selectEthAccount = () => (state: UserState) => state.ethAccount;
