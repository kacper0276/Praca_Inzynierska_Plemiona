export abstract class BaseRepository<T> {
  abstract findAll(options?: any): Promise<T[]>;
  abstract findOne(where: Partial<T>, options?: any): Promise<T | null>;
  abstract findOneById(id: number, options?: any): Promise<T | null>;
  abstract create(data: Partial<T>): T;
  abstract update(id: number, data: Partial<T>): Promise<T>;
  abstract delete(id: number): Promise<void>;
  abstract save(data: Partial<T>): Promise<T>;
}
