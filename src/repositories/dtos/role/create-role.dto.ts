import { RoleEnum } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { FUNCTION_ERROR_CODE } from 'src/constants/consts';

export class CreateRoleDto {
  @IsNotEmpty({ message: FUNCTION_ERROR_CODE.ROL.ROL_ERR_001 })
  @IsEnum(RoleEnum, { message: FUNCTION_ERROR_CODE.ROL.ROL_ERR_002, each: true })
  role: RoleEnum;
}
