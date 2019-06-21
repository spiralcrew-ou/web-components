import { IpfsClient } from "../../services/eth/ipfs.client";
import { CidConfig } from "../../services/cid.config";
import { TextNode } from "../../types";

export const test = async () => {
    let ipfsClient = new IpfsClient();

    let object : TextNode = {
        text: 'abc',
        type: 'par',
        links: []
    }

    let cidConfig = new CidConfig(
        'base58btc', 1, 'raw', 'sha2-256');

    let id = await ipfsClient.addObject(object, cidConfig);

    console.log(`[INIT TESTS] Id created ${id}`, object, cidConfig)

    let objectRead = await ipfsClient.get<TextNode>(id);

    console.log(`[INIT TESTS] Object read ${id}`, objectRead)

    if (objectRead.text != object.text) throw new Error('Unexpected text');
}