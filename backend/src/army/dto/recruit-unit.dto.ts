import { IsEnum, IsInt, Min, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UnitType } from '@core/enums/unit-type.enum';

export class RecruitUnitDto {
  @ApiProperty({ description: 'ID serwera', example: 1 })
  @IsInt()
  serverId: number;

  @ApiProperty({
    description: 'Typ jednostki do rekrutacji',
    enum: UnitType,
    example: UnitType.WARRIOR,
  })
  @IsEnum(UnitType, {
    message: `Typ jednostki musi być jednym z: ${Object.values(UnitType).join(', ')}`,
  })
  unitType: UnitType;

  @ApiProperty({
    description: 'Ilość jednostek do wytrenowania',
    example: 1,
    default: 1,
  })
  @IsInt()
  @IsPositive()
  @Min(1)
  amount: number;
}
