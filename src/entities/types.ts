export type Dictionary<T> = { [key: string]: T };

export type Constructor<T> = new(...args: any[]) => T;
