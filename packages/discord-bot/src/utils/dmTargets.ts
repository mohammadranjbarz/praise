import { PeriodModel } from 'api/dist/period/entities';
import { periodSelectMenu } from './menus/periodSelectMenu';
import { UserModel } from 'api/dist/user/entities';
import { UserRole, UserDocument } from 'api/dist/user/types';
import { UserAccountModel } from 'api/dist/useraccount/entities';
import { getPreviousPeriodEndDate } from 'api/dist/period/utils';
import {
  PeriodDocument,
  PeriodDetailsQuantifierDto,
} from 'api/dist/period/types';

import { Message, MessageActionRow, CommandInteraction } from 'discord.js';
import { PraiseModel } from 'api/dist/praise/entities';

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
        failed.push(`<@!${userId}`);
        continue;
      }
      await discordUser.send(message);
      successful.push(`<@!${userId}>`);
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
  await interaction.editReply({
    content: content,
    components: [],
  });
};

export const dmTargets = async (
  interaction: CommandInteraction,
  type: string,
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
      const openPeriods = await PeriodModel.find({ status: 'QUANTIFY' });
      const periodMenuMsg = (await interaction.editReply({
        content: 'Which period are you referring to?',
        components: [
          new MessageActionRow().addComponents([periodSelectMenu(openPeriods)]),
        ],
      })) as Message;
      const collector = periodMenuMsg.createMessageComponentCollector({
        filter: (click) => click.user.id === interaction.user.id,
        time: 900000,
      });
      collector.on('collect', async (click) => {
        if (!click.isSelectMenu()) return;

        const selectedPeriod = (await PeriodModel.findOne({
          name: click.values[0],
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
              (quantifier) =>
                quantifier.finishedCount !== quantifier.praiseCount
            ),
            message
          );
          return;
        }
        await sendDMs(interaction, quantifiers, message);
      });
      collector.on('end', async (collected) => {
        if (collected.size === 0) {
          await interaction.followUp({
            content: 'Interaction timed out...',
            embeds: [],
            components: [],
          });
        }
      });
      return;
    }
  }
  return;
};
