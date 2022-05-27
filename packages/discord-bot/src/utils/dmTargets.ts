import { PeriodModel } from 'api/dist/period/entities';
import { UserModel } from 'api/dist/user/entities';
import { UserRole, UserDocument } from 'api/dist/user/types';
import { UserAccountModel } from 'api/dist/useraccount/entities';
import { getPreviousPeriodEndDate } from 'api/dist/period/utils';
import {
  PeriodDocument,
  PeriodDetailsQuantifierDto,
} from 'api/dist/period/types';

import { CommandInteraction } from 'discord.js';
import { PraiseModel } from 'api/dist/praise/entities';
import { Buffer } from 'node:buffer';

const sendDMs = async (
  interaction: CommandInteraction,
  users: UserDocument[] | PeriodDetailsQuantifierDto[],
  message: string
): Promise<void> => {
  const successful = [];
  const failed = [];
  if (!users || users.length === 0) {
    await interaction.editReply(
      'Message not sent. No recipients matched filter.'
    );
  }

  for (const user of users) {
    const userAccount = await UserAccountModel.findOne({
      user: user._id,
    });
    const userId: string = userAccount?.accountId || 'oops';
    try {
      const discordUser = await interaction.guild?.members.fetch(userId);
      if (!discordUser) {
        failed.push(`<@!${userId}>`);
        continue;
      }
      await discordUser.send(message);
      successful.push(`${discordUser.user.tag}`);
    } catch (err) {
      failed.push(`<@!${userId}>`);
    }
  }
  const failedMsg = `Announcement could not be delivered to ${failed.length} users.`;
  const successMsg = `Announcement successfully delivered to ${successful.length} recipients.`;
  const content =
    successful.length === 0
      ? failedMsg
      : failed.length === 0
      ? successMsg
      : successMsg + '\n' + failedMsg;

  // TODO - Create a utility function to tabularise this data neatly
  let summary = `User\t\t\t\tStatus\n`;
  successful.forEach((username: string) => {
    summary += `${username}${new String(' ').repeat(
      32 - username.length
    )}Delivered\n`;
  });
  failed.forEach((username: string) => {
    summary += `${
      username.length <= 32
        ? username + new String(' ').repeat(24 - username.length)
        : username.slice(0, 28) + '... '
    }Not Delivered\n`;
  });

  await interaction.editReply({
    content: content,
    components: [],
    files: [
      {
        attachment: Buffer.from(summary, 'utf8'),
        name: 'announcement_summary.txt',
      },
    ],
  });
};

export const selectTargets = async (
  interaction: CommandInteraction,
  type: string,
  period: string | undefined,
  message: string
): Promise<void> => {
  switch (type) {
    case 'USERS': {
      const users = await UserModel.find({});
      await sendDMs(interaction, users, message);
      return;
    }
    case 'QUANTIFIERS': {
      const users = await UserModel.find({ roles: UserRole.QUANTIFIER });
      await sendDMs(interaction, users, message);
      return;
    }
    case 'ASSIGNED-QUANTIFIERS':
    case 'UNFINISHED-QUANTIFIERS': {
      const selectedPeriod = (await PeriodModel.findOne({
        name: period,
      })) as PeriodDocument;
      const previousPeriodEndDate = await getPreviousPeriodEndDate(
        selectedPeriod
      );
      const quantifiers: PeriodDetailsQuantifierDto[] =
        await PraiseModel.aggregate([
          {
            $match: {
              createdAt: {
                $gt: previousPeriodEndDate,
                $lte: selectedPeriod?.endDate,
              },
            },
          },
          { $unwind: '$quantifications' },
          {
            $addFields: {
              finished: {
                $or: [
                  { $ne: ['$quantifications.dismissed', false] },
                  { $gt: ['$quantifications.score', 0] },
                  { $gt: ['$quantifications.duplicatePraise', null] },
                ],
              },
            },
          },
          {
            $group: {
              _id: '$quantifications.quantifier',
              praiseCount: { $count: {} },
              finishedCount: { $sum: { $toInt: '$finished' } },
            },
          },
        ]);
      if (type === 'UNFINISHED-QUANTIFIERS') {
        await sendDMs(
          interaction,
          quantifiers.filter(
            (quantifier) => quantifier.finishedCount !== quantifier.praiseCount
          ),
          message
        );
        return;
      }
      await sendDMs(interaction, quantifiers, message);
      return;
    }
  }
  return;
};
