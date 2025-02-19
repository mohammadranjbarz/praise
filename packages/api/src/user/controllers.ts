import { Request } from 'express';
import { Types } from 'mongoose';
import { BadRequestError, NotFoundError } from '@/error/errors';
import { PeriodDocument, PeriodDateRange } from '@/period/types';
import {
  findActivePeriods,
  getPeriodDateRangeQuery,
} from '@/period/utils/core';
import { countPraiseWithinDateRanges } from '@/praise/utils/core';
import {
  QueryInputParsedQs,
  TypedRequestBody,
  TypedRequestQuery,
  TypedResponse,
} from '@/shared/types';
import { EventLogTypeKey } from '@/eventlog/types';
import { logEvent } from '@/eventlog/utils';
import { UserModel } from './entities';
import { userDetailTransformer, userListTransformer } from './transformers';
import {
  UpdateUserProfileInput,
  UserDocument,
  UserDto,
  UserRole,
  UserRoleChangeInput,
  UserDetailsDto,
} from './types';
import { findUser, getUserStats } from './utils/entity';

/**
 * Fetch all Users with their associated UserAccounts
 *
 * @param {TypedRequestQuery<QueryInputParsedQs>} req
 * @param {TypedResponse<UserDto[]>} res
 * @returns {Promise<void>}
 */
export const all = async (
  req: TypedRequestQuery<QueryInputParsedQs>,
  res: TypedResponse<UserDto[]>
): Promise<void> => {
  const users: UserDocument[] = await UserModel.aggregate([
    {
      $lookup: {
        from: 'useraccounts',
        localField: '_id',
        foreignField: 'user',
        as: 'accounts',
      },
    },
  ]);

  const usersTransformed = await userListTransformer(users);

  res.status(200).json(usersTransformed);
};

/**
 * Fetch a User with their associated UserAccounts
 *
 * @param {Request} req
 * @param {TypedResponse<UserDto>} res
 * @returns {Promise<void>}
 */
export const single = async (
  req: Request,
  res: TypedResponse<UserDetailsDto>
): Promise<void> => {
  const { id } = req.params;
  const user = await findUser(id);
  const userStats = await getUserStats(user);

  const userTransformed = userDetailTransformer(user, userStats);

  res.status(200).json(userTransformed);
};

/**
 * Update a User, adding an additional role
 *
 * @param {TypedRequestBody<UserRoleChangeInput>} req
 * @param {TypedResponse<UserDto>} res
 * @returns {Promise<void>}
 */
export const addRole = async (
  req: TypedRequestBody<UserRoleChangeInput>,
  res: TypedResponse<UserDto>
): Promise<void> => {
  const { id } = req.params;
  const user = await UserModel.findById(id);
  if (!user) throw new NotFoundError('User');

  const { role } = req.body;
  if (!role) throw new BadRequestError('Role is required');
  if (!(role in UserRole)) throw new BadRequestError('Invalid role');

  if (user.roles.includes(role))
    throw new BadRequestError(`User already has role ${role}`);

  user.roles.push(role);
  user.accessToken = undefined;
  user.nonce = undefined;
  await user.save();

  await logEvent(
    EventLogTypeKey.PERMISSION,
    `Added role "${role}" to user with id "${(
      user._id as Types.ObjectId
    ).toString()}"`,
    {
      userId: res.locals.currentUser._id,
    }
  );

  const userWithDetails = await findUser(id);
  const userStats = await getUserStats(user);

  const userTransformed = userDetailTransformer(userWithDetails, userStats);

  res.status(200).json(userTransformed);
};

/**
 * Update a User, removing a role
 *
 * @param {TypedRequestBody<UserRoleChangeInput>} req
 * @param {TypedResponse<UserDto>} res
 * @returns {Promise<void>}
 */
export const removeRole = async (
  req: TypedRequestBody<UserRoleChangeInput>,
  res: TypedResponse<UserDto>
): Promise<void> => {
  const { id } = req.params;
  const user = await UserModel.findById(id);
  if (!user) throw new NotFoundError('User');

  const { role } = req.body;
  if (!role) throw new BadRequestError('Role is required');
  if (!(role in UserRole)) throw new BadRequestError('Invalid role');

  if (role === UserRole.ADMIN) {
    const allAdmins = await UserModel.find({ roles: { $in: ['ADMIN'] } });
    if (allAdmins.length <= 1) {
      throw new BadRequestError("You can't remove the last admin!");
    }
  }

  const roleIndex = user.roles.indexOf(role);

  if (roleIndex === -1)
    throw new BadRequestError(`User does not have the role ${role}`);

  // If user is currently assigned to the active quantification round, and role is QUANTIFIER throw error
  const activePeriods: PeriodDocument[] = await findActivePeriods();

  if (role === UserRole.QUANTIFIER && activePeriods.length > 0) {
    const dateRanges: PeriodDateRange[] = await Promise.all(
      activePeriods.map((period) => getPeriodDateRangeQuery(period))
    );
    const assignedPraiseCount = await countPraiseWithinDateRanges(dateRanges, {
      'quantifications.quantifier': user._id,
    });
    if (assignedPraiseCount > 0)
      throw new BadRequestError(
        'Cannot remove quantifier currently assigned to quantification period'
      );
  }

  user.roles.splice(roleIndex, 1);
  user.accessToken = undefined;
  user.nonce = undefined;
  await user.save();

  await logEvent(
    EventLogTypeKey.PERMISSION,
    `Removed role "${role}" from user with id "${(
      user._id as Types.ObjectId
    ).toString()}`,
    {
      userId: res.locals.currentUser._id,
    }
  );

  const userWithDetails = await findUser(id);
  const userStats = await getUserStats(user);

  const userTransformed = userDetailTransformer(userWithDetails, userStats);
  res.status(200).json(userTransformed);
};

/**
 * Update a User Profile
 *
 * @param {TypedRequestBody<UpdateUserProfileInput>} req
 * @param {TypedResponse<UserDetailsDto>} res
 * @returns {Promise<void>}
 */
export const updateProfile = async (
  req: TypedRequestBody<UpdateUserProfileInput>,
  res: TypedResponse<UserDetailsDto>
): Promise<void> => {
  const user = res.locals.currentUser;
  if (!user) throw new NotFoundError('User');

  const { username, rewardsEthAddress } = req.body;

  // Check for duplicate username on username change
  if (username !== user.username) {
    const exists = await UserModel.count({ username });
    if (exists > 0) {
      throw new BadRequestError('Username already exist.');
    }
  }

  user.username = username;
  user.rewardsEthAddress = rewardsEthAddress;
  await user.save();

  await logEvent(
    EventLogTypeKey.PERMISSION,
    `Updated user profile for the user with id "${(
      user._id as Types.ObjectId
    ).toString()}"`,
    {
      userId: res.locals.currentUser._id,
    }
  );

  const userWithDetails = await findUser(user._id);
  const userStats = await getUserStats(user);

  const userTransformed = userDetailTransformer(userWithDetails, userStats);

  res.status(200).json(userTransformed);
};
