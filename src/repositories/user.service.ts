import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { BaseService } from 'src/_core/interfaces';
import { SYSTEM_ERROR_CODE } from 'src/constants/consts';
import { transformDtoToPlainObject } from 'src/shared/helpers/transform';
import { HashingService, PrismaService } from 'src/shared/providers';
import { CreateUserDto } from './dtos/user/create-user.dto';
import { UserDto } from './dtos/user/user.dto';
import { RoleEnum } from '@prisma/client';
import { RoleService } from './role.service';
import { FileService } from './file.service';
import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { UpdateUserDto } from './dtos/user/update-user.dto';
import { ppid } from 'process';

@Injectable()
export class UserService implements BaseService<UserDto> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly roleService: RoleService,
    private readonly hashingService: HashingService,
    private readonly fileService: FileService,
  ) {}
  async create(dto: CreateUserDto): Promise<UserDto | null> {
    try {
      const { email, password, confirmPassword, firstName, lastName, roleId, gender, ...restDto } = dto;
      const foundUser = await this.findOneByEmail(email);
      if (foundUser) {
        throw new UnprocessableEntityException(SYSTEM_ERROR_CODE.USER.USER_ERR_001);
      }

      const foundRole = !roleId ? await this.roleService.findOneByRoleName(RoleEnum.USER) : await this.roleService.findOneById(roleId);
      if (!foundRole) {
        throw new UnprocessableEntityException(SYSTEM_ERROR_CODE.USER.USER_ERR_002);
      }

      const hashPassword = await this.hashingService.hash(password);
      const hashConfirmPassword = await this.hashingService.hash(confirmPassword);
      const user = await this.prismaService.user.create({
        data: {
          email,
          firstName,
          lastName,
          password: hashPassword,
          confirmPassword: hashConfirmPassword,
          gender,
          ...restDto,
          role: {
            connect: {
              id: foundRole.id,
            },
          },
        },
      });

      return transformDtoToPlainObject(UserDto, user);
    } catch (error) {
      throw error;
    }
  }

  async findOneById(id: number): Promise<UserDto | null> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id },
        include: {
          role: true,
        },
      });

      if (!user) {
        return null;
      }

      return transformDtoToPlainObject(UserDto, user);
    } catch (error) {
      throw error;
    }
  }

  async findOneByEmail(email: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          email,
        },
        include: {
          role: true,
        },
      });

      if (!user) {
        return null;
      }

      return transformDtoToPlainObject(UserDto, user);
    } catch (error) {
      throw error;
    }
  }

  async updateAvatar(userId: number, files: Express.Multer.File[]): Promise<UserDto> {
    try {
      const foundUser = await this.findOneById(userId);
      if (!foundUser) {
        throw new UnprocessableEntityException(SYSTEM_ERROR_CODE.USER.USER_ERR_003);
      }

      const _files = await this.fileService.uploadFile(files, 'avatar');

      if (!_files) {
        throw new UnprocessableEntityException(SYSTEM_ERROR_CODE.FILE.FILE_ERR_001);
      }

      const updatedUser = await this.prismaService.user.update({
        where: { id: userId },
        data: {
          avatar: _files[0].secure_url,
        },
      });
      return transformDtoToPlainObject(UserDto, updatedUser);
    } catch (error) {
      throw error;
    }
  }
  async updateById(id: number, dto: UpdateUserDto): Promise<UserDto> {
    try {
      const foundUser = await this.findOneById(id);
      if (!foundUser) {
        throw new UnprocessableEntityException(SYSTEM_ERROR_CODE.USER.USER_ERR_003);
      }

      const updatedUser = await this.prismaService.user.update({
        where: { id },
        data: {
          ...dto,
        },
      });

      return transformDtoToPlainObject(UserDto, updatedUser);
    } catch (error) {
      throw error;
    }
  }
}
