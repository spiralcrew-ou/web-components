import { LensCollectiveOne } from './lens.c1'
import { LensService } from '../lens.service';
import { Perspective, Context } from '../local/dataservices';
import { c1Cid as cidConfig } from './../local/cid.config';

const { Response, Request, Headers, fetch } = require('whatwg-fetch');
global['Response'] = Response;
global['Request'] = Request;
global['Headers'] = Headers;
global['fetch'] = fetch;

describe.skip('Lens Tests', () => {

  let lensService: LensService;
  let context: Context;  
  let perspective: Perspective;

  beforeAll(async () => {
    this.context = new Context('anon', 0, 0);
    await this.context.setId(cidConfig.base, cidConfig.version, cidConfig.codec, cidConfig.type);

    perspective = new Perspective('local', 'anon', 0, context.id, 'name', null);
    await perspective.setId(cidConfig.base, cidConfig.version, cidConfig.codec, cidConfig.type);
    console.log(perspective);
  })

  beforeEach(() => {
    lensService = new LensCollectiveOne();
  })

  it('should create a lens', async () => {
    await lensService.setLens(perspective.id, 'title');
    let lens = await lensService.getLens(perspective.id);
    expect(lens).toBe('title');
  })
})