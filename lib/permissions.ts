import type { DiscordChannel, DiscordOverwrite, DiscordRole } from './discord'

export const Permission = {
  ViewChannel: 1n << 10n,
  SendMessages: 1n << 11n,
  ManageChannels: 1n << 4n,
  ManageRoles: 1n << 28n,
  Administrator: 1n << 3n,
} as const

const applyOverwrite = (permissions: bigint, overwrite?: DiscordOverwrite) => {
  if (!overwrite) return permissions
  return (permissions & ~BigInt(overwrite.deny)) | BigInt(overwrite.allow)
}

export const resolveRoleSetPermissions = (
  guildId: string,
  roles: DiscordRole[],
  roleIds: string[],
  channel: DiscordChannel,
) => {
  const everyone = roles.find((role) => role.id === guildId)
  let permissions = everyone ? BigInt(everyone.permissions) : 0n

  for (const role of roles) {
    if (roleIds.includes(role.id)) permissions |= BigInt(role.permissions)
  }

  if ((permissions & Permission.Administrator) === Permission.Administrator) {
    return (1n << 53n) - 1n
  }

  const overwrites = channel.permission_overwrites ?? []
  permissions = applyOverwrite(
    permissions,
    overwrites.find((overwrite) => overwrite.type === 0 && overwrite.id === guildId),
  )

  let roleDenies = 0n
  let roleAllows = 0n
  for (const overwrite of overwrites) {
    if (overwrite.type !== 0 || !roleIds.includes(overwrite.id)) continue
    roleDenies |= BigInt(overwrite.deny)
    roleAllows |= BigInt(overwrite.allow)
  }

  permissions &= ~roleDenies
  permissions |= roleAllows
  return permissions
}

export const hasPermission = (permissions: bigint, permission: bigint) =>
  (permissions & permission) === permission

const normalizedOverwrites = (overwrites: DiscordOverwrite[] = []) =>
  [...overwrites]
    .map((overwrite) => `${overwrite.type}:${overwrite.id}:${overwrite.allow}:${overwrite.deny}`)
    .sort()
    .join('|')

export const permissionDrifted = (channel: DiscordChannel, channels: DiscordChannel[]) => {
  if (!channel.parent_id) return false
  const parent = channels.find((item) => item.id === channel.parent_id)
  if (!parent) return false
  return normalizedOverwrites(channel.permission_overwrites) !== normalizedOverwrites(parent.permission_overwrites)
}
