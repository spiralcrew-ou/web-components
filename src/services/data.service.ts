
export interface DataService {
  getData(dataId: string): Promise<any>;

  createData(data: any): Promise<string>;
}
