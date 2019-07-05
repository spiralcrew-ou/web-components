import { UprtclService } from './uprtcl.service';
import { DataService } from './data.service';
import { DraftService } from './draft.service';
import { EntityRegistry } from '../entities/entity.registry';
import { PerspectiveEntity } from '../entities/uprtcl/perspective.entity';

export class Uprtcl {
  constructor(
    protected registy: EntityRegistry,
    protected uprtcl: UprtclService,
    protected data: DataService,
    protected draft: DraftService
  ) {}

  async fork(pId: string) {
    const perspective = await this.uprtcl.getPerspective(pId);
    const entity: PerspectiveEntity = this.registy.get(perspective);
    entity.fork()
  }
}
