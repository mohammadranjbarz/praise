import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from '@discordjs/builders';
import logger from 'jet-logger';
import { allowPraiseHandler } from 'src/handlers/admin/config/allow-praise';
import { restrictPraiseHandler } from 'src/handlers/admin/config/restrict-praise';
import { announcementHandler } from '../handlers/admin/announce';
import { Command } from '../interfaces/Command';

export const admin: Command = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Commands to perform admin actions for Praise')
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName('announce')
        .setDescription(
          'Publish announcements distributed as direct messages to Praise users.'
        )
        .addStringOption((option) =>
          option
            .setName('message')
            .setDescription('The message content to publish.')
            .setRequired(true)
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName('config')
        .setDescription('Configure the praise system')
        .addSubcommand((subCommand) =>
          subCommand
            .setName('allow-praise')
            .setDescription('Allow praise in this channel.')
        )
        .addSubcommand((subCommand) =>
          subCommand
            .setName('restrict-praise')
            .setDescription('Restrict praise in this channel.')
        )
    ),

  async execute(interaction) {
    try {
      if (!interaction.isCommand() || interaction.commandName !== 'admin')
        return;

      const subCommand = interaction.options.getSubcommand();
      console.log(subCommand);

      await interaction.deferReply({ ephemeral: true });
      switch (subCommand) {
        case 'announce': {
          await announcementHandler(interaction);
          break;
        }
        case 'allow-praise': {
          await allowPraiseHandler(interaction);
          break;
        }
        case 'restrict-praise': {
          await restrictPraiseHandler(interaction);
          break;
        }
      }
    } catch (err) {
      logger.err(err);
    }
  },

  help: {
    name: 'admin',
    text: 'Command to perform admin actions in the Praise system and the PraiseBot\n\
  **Usage**: `/admin <announce|...>`\n',
    subCommands: [
      {
        name: 'announce',
        text: 'Command to publish announcements that are distributed as direct messages to Praise users.\n\
        Usage: `/admin announce message: <you have been selected for quantification...>`',
      },
    ],
  },
};
