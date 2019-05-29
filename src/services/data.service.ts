export interface DataService<T = any> {
  getData(dataId: string): Promise<T>;

  createData(data: T): Promise<string>;
}