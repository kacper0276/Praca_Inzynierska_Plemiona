import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class UpdateUserDeletionTimeDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deleteAt: Date | null;
}
