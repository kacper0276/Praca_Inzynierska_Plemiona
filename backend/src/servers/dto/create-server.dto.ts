import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ServerStatus } from '../enums/server-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServerDto {
  @IsString({ message: 'Nazwa serwera musi być ciągiem znaków.' })
  @IsNotEmpty({ message: 'Nazwa serwera nie może być pusta.' })
  @ApiProperty({
    example: 'Mój serwer produkcyjny',
    description: 'Unikalna, przyjazna dla użytkownika nazwa serwera',
    required: true,
  })
  name: string;

  @IsString({ message: 'Hostname musi być ciągiem znaków.' })
  @IsNotEmpty({ message: 'Hostname nie może być pusty.' })
  @ApiProperty({
    example: '192.168.1.100',
    description: 'Adres IP lub nazwa domenowa serwera',
    required: true,
  })
  hostname: string;

  @IsInt({ message: 'Port musi być liczbą całkowitą.' })
  @Min(1, { message: 'Numer portu nie może być mniejszy niż 1.' })
  @Max(65535, { message: 'Numer portu nie może być większy niż 65535.' })
  @ApiProperty({
    example: 8080,
    description: 'Port, na którym nasłuchuje serwer',
    required: true,
  })
  port: number;

  @IsOptional()
  @IsEnum(ServerStatus, {
    message: 'Status musi być jedną z dozwolonych wartości.',
  })
  @ApiProperty({
    description: 'Początkowy status serwera',
    enum: ServerStatus,
    default: ServerStatus.UNKNOWN,
    required: false,
  })
  status?: ServerStatus;
}
