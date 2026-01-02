import { Role } from '@cipibot/schemas';

export function getAssignableRoles(roles: Role[]): Role[] {
  return roles.filter((role) => role.name !== '@everyone' && !role.managed);
}
