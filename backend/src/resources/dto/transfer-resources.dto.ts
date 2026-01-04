import { IsInt, IsOptional, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferResourcesDto {
  @ApiProperty({ description: 'ID użytkownika, który ma otrzymać surowce' })
  @IsNotEmpty()
  @IsInt()
  receiverId: number;

  @ApiProperty({ description: 'ID serwera, na którym odbywa się transfer' })
  @IsNotEmpty()
  @IsInt()
  serverId: number;

  @ApiProperty({ description: 'Ilość drewna', required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  wood?: number;

  @ApiProperty({ description: 'Ilość gliny', required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  clay?: number;

  @ApiProperty({ description: 'Ilość żelaza', required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  iron?: number;
}
