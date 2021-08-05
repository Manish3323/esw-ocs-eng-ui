import type { Auth, TokenFactory } from '@tmtsoftware/esw-ts'

export const createTokenFactory = (auth: Auth | null): TokenFactory => (auth === null ? () => undefined : auth.token)
