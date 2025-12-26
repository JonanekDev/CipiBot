export function getAvatarURL(userId: string, avatar?: string | null): string {
  let avatarURL = `https://cdn.discordapp.com/`;
  if (avatar) {
    avatarURL += `avatars/${userId}/${avatar}.png`;
  } else {
    const id = BigInt(userId);
    const shifted = id >> 22n;
    const avatar = Number(shifted % 6n);
    avatarURL += `embed/avatars/${avatar}.png`;
  }
  return avatarURL;
}
