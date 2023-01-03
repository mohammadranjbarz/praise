import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { Permission } from '../enums/permission.enum';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (
  ...permissions: Permission[]
): CustomDecorator<string> => SetMetadata(PERMISSIONS_KEY, permissions);
