import type { Auth } from '@tmtsoftware/esw-ts'

export const getUsername = (auth: Auth | null): string | undefined => auth?.tokenParsed()?.preferred_username
