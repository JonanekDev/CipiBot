import { getAvatarURL } from '@cipibot/discord-utils';

export interface UserVariables {
  username: string;
  userId: string;
  userMention: string;
  avatarUrl?: string;
}

export function createUserVariables(user: {
  userId: string;
  username: string;
  avatar?: string | null;
}): UserVariables {
  return {
    userId: user.userId,
    username: user.username,
    userMention: `<@${user.userId}>`,
    avatarUrl: getAvatarURL(user.userId, user.avatar),
  };
}
