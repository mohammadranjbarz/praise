import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  identityEthAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  signature: string;
}
