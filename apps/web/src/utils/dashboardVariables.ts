import { VariableDef } from '@/types/variables';
import { UserVariables } from '@cipibot/templating/modules/common';
import { useAuthStore } from '@/stores/auth';

export const getCommonUserVars = (
  authStore: ReturnType<typeof useAuthStore>,
): VariableDef<UserVariables>[] => {
  return [
    {
      name: 'username',
      description: 'Username of the user',
      example: authStore.userName || 'Discord User',
    },
    { name: 'userId', description: 'ID of the user', example: authStore.user?.id || '123456789' },
    {
      name: 'userMention',
      description: 'Mention of the user',
      example: `@${authStore.userName || 'Discord User'}`,
    },
    {
      name: 'avatarUrl',
      description: 'URL of the user avatar',
      example:
        authStore.userAvatar ||
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Schweineschnitzel.jpg/2560px-Schweineschnitzel.jpg',
    },
  ];
};
