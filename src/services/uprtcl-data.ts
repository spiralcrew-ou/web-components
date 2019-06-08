import { uprtclMultiplatform, dataMultiplatform } from './index';

export class UprtclData {

  uprtcl = uprtclMultiplatform;
  dataService = dataMultiplatform;

  async pretty(perspectiveId: string) {
    const perspective = await this.uprtcl.getPerspective(perspectiveId);
    const context = await this.uprtcl.getContext(perspective.contextId);
    const head = await this.uprtcl.getCommit(perspective.headId);
    const data = (head != null) ? await this.dataService.getData(head.dataId) : null;
    const draft = await this.dataService.getDraft(perspective.origin, perspectiveId);
    
    let logDraftLinks = `
            {`;

    for (let i=0; i<draft.links.length; i++) {
      const thisLog = await this.pretty(draft.links[i].link);
      logDraftLinks = logDraftLinks.concat(thisLog);
    };
    logDraftLinks.concat(`
            }`)

    const log = `
    {
      id: ${perspective.id},
      origin: ${perspective.origin},
      creatorId: ${perspective.creatorId},
      timestamp: ${perspective.timestamp},
      context: {
        id: ${context.id},
        creatorId: ${context.creatorId},
        timestamp: ${context.timestamp},
        nonce: ${context.nonce}
      },
      name: ${perspective.name},
      draft: ${draft != null ? `{
        text: ${draft.text},
        links: ${logDraftLinks}
      }` : 'null'}
      head: ${head != null ? `{
        id: ${head.id},
        creatorId: ${head.creatorId},
        timestamp: ${head.timestamp},
        message: ${head.message},
        parentsIds: ${head.parentsIds.toString},
        data: ${ (data != null) ? `{
          id: ${data.id},
          text: ${data.text},
          links: {
            ${data.links.map(async link => await this.pretty(link.link)).join(',')}
          }
        }` : 'null'}
      }` : 'null'}
    }`;

    return log;
  }
}

export const uprtclData = new UprtclData();