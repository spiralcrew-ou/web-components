export interface WorkingData<T> {
  data: T;
  draft: T;
}

export interface DataService<T = any> {
  getWorkingData(dataId: string): Promise<WorkingData<T>>;
  createData(data: T): Promise<string>;
  updateDraft(dataId: string, draft: T): Promise<string>;
}