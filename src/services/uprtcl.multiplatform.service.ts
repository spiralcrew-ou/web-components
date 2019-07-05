import { UprtclService } from './uprtcl.service';
import { Context, Perspective, Commit } from '../types';


export interface UprtclMultiplatformService extends UprtclService {

  createContextIn(serviceProvider: string, context: Context): Promise<string>;
  createPerspectiveIn(
    serviceProvider: string,
    perspective: Perspective
  ): Promise<string>;
  createCommitIn(serviceProvider: string, commit: Commit): Promise<string>;

}