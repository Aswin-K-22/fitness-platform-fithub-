// backend/src/app/repositories/base.repository.ts
export interface IBaseRepository<T, ID = string> {
  create(data: T): Promise<T>;
  findById(id: ID): Promise<T | null>;
  findAll(skip: number, take: number): Promise<T[]>;
  update(id: ID, data: Partial<T>): Promise<T | null>;
  delete(id: ID): Promise<void>;
  count(): Promise<number>;
}