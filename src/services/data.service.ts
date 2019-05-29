export interface WorkingData<T> {
  data: T;
  draft: T;
}

export interface DataService<T = any> {
  getWorkingData(dataId: string): Promise<WorkingData<T>>;
  createData(data: T): Promise<string>;
  updateDraft(perspectiveId: string, draft: T): Promise<void>;
}