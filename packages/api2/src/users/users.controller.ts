import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UsersService } from './users.service';
import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ObjectIdPipe } from '../shared/pipes/object-id.pipe';
import { User } from './schemas/users.schema';
import { ApiParam } from '@nestjs/swagger';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { Permission } from '@/auth/enums/permission.enum';
import { PermissionsGuard } from '@/auth/guards/permissions.guard';
import { EventLogService } from '@/event-log/event-log.service';
import { RequestWithUser } from '@/auth/interfaces/request-with-user.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(PermissionsGuard)
@UseGuards(AuthGuard(['jwt', 'api-key']))
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly eventLogService: EventLogService,
  ) {}

  @Get()
  @Permissions(Permission.UsersFind)
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Permissions(Permission.UsersFind)
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id', ObjectIdPipe) id: Types.ObjectId): Promise<User> {
    const user = await this.usersService.findOneById(id);
    if (!user) throw new BadRequestException('User not found.');
    return user;
  }

  @Patch(':id')
  @Permissions(Permission.UsersFind)
  async updateProfile(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Request() request: RequestWithUser, //TODO: remove this, is this needed?
    @Body() user: User,
  ): Promise<User> {
    return this.usersService.update(id, user);
  }

  @Patch(':id/addRole')
  @Permissions(Permission.UsersManageRoles)
  @ApiParam({ name: 'id', type: String })
  async addRole(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Request() request: RequestWithUser,
    @Body() roleChange: UpdateUserRoleDto,
  ): Promise<User> {
    return this.usersService.addRole(id, roleChange);
  }

  @Patch(':id/removeRole')
  @Permissions(Permission.UsersManageRoles)
  @ApiParam({ name: 'id', type: String })
  async removeRole(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Request() request: RequestWithUser,
    @Body() roleChange: UpdateUserRoleDto,
  ): Promise<User> {
    return this.usersService.removeRole(id, roleChange);
  }
}