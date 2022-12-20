import { Exclude, Transform } from 'class-transformer';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Types } from 'mongoose';
import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { AuthRole } from '@/auth/enums/auth-role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  constructor(partial?: Partial<User>) {
    if (partial) {
      Object.assign(this, partial);
      if (partial.accounts) {
        this.accounts = partial.accounts.map(
          (account) => new UserAccount(account),
        );
      }
    }
  }

  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  identityEthAddress: string;

  @Prop({ required: true })
  rewardsEthAddress: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({
    type: [
      {
        type: String,
        enum: [AuthRole],
      },
    ],
    default: [AuthRole.USER],
    enum: [AuthRole],
  })
  roles: string[];

  accounts: UserAccount[];

  @Exclude()
  @Prop()
  nonce?: string;

  @Exclude()
  @Prop()
  accessToken?: string;

  @Exclude()
  @Prop()
  refreshToken?: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('accounts', {
  ref: 'UserAccount',
  localField: '_id',
  foreignField: 'user',
});