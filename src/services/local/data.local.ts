import { DataService } from '../data.service';
import { WorkingData } from '../data.service';
import { TextNode } from '../../types';

export class DataLocal implements DataService {
  createData(data: TextNode): Promise<string> {
    console.log(data)
    throw new Error("Method not implemented.");
  }
  getWorkingData(dataId: string): Promise<WorkingData<TextNode>> {
    console.log(dataId);
    throw new Error("Method not implemented.");
  }
  updateDraft(dataId: string, draft: TextNode): Promise<void> {
    console.log(dataId);
    console.log(draft);
    throw new Error("Method not implemented.");
  }
}