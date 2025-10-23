import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ListReportsQueryDto {
  @ApiPropertyOptional({
    description: 'Filtruj zgłoszenia po ID zgłaszającego',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly reporterId?: number;

  @ApiPropertyOptional({
    description: 'Filtruj zgłoszenia po ID zgłaszanego użytkownika',
    example: 2,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly targetId?: number;
}
