export abstract class BaseRepository<T> {
  abstract findAll(): Promise<T[]>;
  abstract findOne(id: number): Promise<T | null>;
  abstract create(entity: T): Promise<T>;
  abstract update(id: number, entity: Partial<T>): Promise<T>;
  abstract delete(id: number): Promise<void>;
}
