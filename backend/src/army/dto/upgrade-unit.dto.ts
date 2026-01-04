import { IsEnum, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UnitType } from '@core/enums/unit-type.enum';

export class UpgradeUnitDto {
  @ApiProperty({ description: 'ID serwera', example: 1 })
  @IsInt()
  serverId: number;

  @ApiProperty({
    description: 'Typ jednostki do ulepszenia',
    enum: UnitType,
    example: UnitType.WARRIOR,
  })
  @IsEnum(UnitType)
  unitType: UnitType;
}
