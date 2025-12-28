import { Logger } from '@cipibot/logger';
import { DiscordAPIError } from '@discordjs/rest';
import { RESTJSONErrorCodes } from 'discord-api-types/v10';

export async function safeDiscordRequest<T>(
  request: () => Promise<T>,
  logger: Logger,
  context: object,
): Promise<T | null> {
  try {
    return await request();
  } catch (error) {
    if (error instanceof DiscordAPIError) {
      switch (error.code) {
        case RESTJSONErrorCodes.UnknownChannel:
        case RESTJSONErrorCodes.UnknownGuild:
        case RESTJSONErrorCodes.UnknownMessage:
        case RESTJSONErrorCodes.UnknownUser:
        case RESTJSONErrorCodes.UnknownMember:
        case RESTJSONErrorCodes.UnknownRole:
          logger.warn(
            context,
            `Discord resource no longer exists (Code: ${error.code}), skipping.`,
          );
          //TODO: Handle?
          return null;

        case RESTJSONErrorCodes.MissingPermissions:
        case RESTJSONErrorCodes.MissingAccess:
          logger.warn(context, `Missing permissions (Code: ${error.code}), skipping.`);
          return null;

        case RESTJSONErrorCodes.CannotSendMessagesToThisUser:
          logger.info(
            context,
            `Cannot send messages to this user (Code: ${error.code}), skipping.`,
          );
          return null;

      }
      logger.error({ ...context, apiError: error }, 'Discord API Error');
    }
    throw error;
  }
}
