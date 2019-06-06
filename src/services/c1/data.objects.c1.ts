import { 
    Perspective as IPerspective,
    Context as IContext,
    Commit as ICommit
} from '../../types';

export class Perspective implements IPerspective {
    id: string;
    origin: string;
    creatorId: string;
    timestamp: number;
    contextId: string;
    name: string;
    headId: string;
}

export class Commit implements ICommit {
    id?: string;    creatorId: string;
    timestamp: number;
    message: string;
    parentsIds: string[];
    dataId: string;
}

export class Context implements IContext {
    id?: string;    
    creatorId: string;
    timestamp: number;
    nonce: number;
}