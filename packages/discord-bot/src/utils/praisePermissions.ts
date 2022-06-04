import { CommandInteraction } from 'discord.js';
import { truncate } from 'fs';
import { getSetting } from '../utils/getSettings';

export const praiseAllowedInChannel = async (
  interaction: CommandInteraction,
  channelId: string
): Promise<boolean> => {
  const allowedInAllChannels = await getSetting(
    'PRAISE_ALLOWED_IN_ALL_CHANNELS'
  );
  const allowedChannelsList = (await getSetting(
    'PRAISE_ALLOWED_CHANNEL_IDS'
  )) as String;
  if (
    allowedInAllChannels === 'false' &&
    allowedChannelsList.indexOf(channelId) === -1
  ) {
    await interaction.editReply('Praise not allowed in this channel.');
    return false;
  } else {
    return true;
  }
};
