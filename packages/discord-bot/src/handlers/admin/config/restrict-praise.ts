import { UserModel } from 'api/dist/user/entities';
import { GuildMember } from 'discord.js';
import { UserRole } from 'api/dist/user/types';
import { notActivatedError, dmError } from '../../../utils/praiseEmbeds';
import { CommandHandler } from 'src/interfaces/CommandHandler';
import { getUserAccount } from 'src/utils/getUserAccount';
import { getSetting, putSetting } from 'src/utils/settings';

export const restrictPraiseHandler: CommandHandler = async (interaction) => {
  const { guild, member, channel } = interaction;

  if (!guild || !member || !channel) {
    await interaction.editReply(await dmError());
    return;
  }

  const userAccount = await getUserAccount(member as GuildMember);
  if (!userAccount.user) {
    await interaction.editReply(await notActivatedError());
    return;
  }
  const currentUser = await UserModel.findOne({ _id: userAccount.user });

  if (currentUser?.roles.includes(UserRole.ADMIN)) {
    const allowedChannelsList = (await getSetting(
      'PRAISE_ALLOWED_CHANNEL_IDS'
    )) as string;

    const channelId =
      channel.type === 'GUILD_PUBLIC_THREAD' ||
      channel.type === 'GUILD_PRIVATE_THREAD'
        ? channel?.parent?.id || channel.id
        : channel.id;

    await putSetting(
      'PRAISE_ALLOWED_CHANNEL_IDS',
      allowedChannelsList.indexOf(channelId) === -1
        ? `${allowedChannelsList}, ${channelId}`
        : allowedChannelsList
    );
  } else {
    await interaction.editReply({
      content:
        'You do not have the needed permissions to use this command. If you would like to perform admin actions, you would need to be granted an `ADMIN` role on the Praise Dashboard.',
    });
    return;
  }
};
