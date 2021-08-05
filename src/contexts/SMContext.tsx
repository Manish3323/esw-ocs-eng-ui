import {
  createSequenceManagerService,
  Location,
  SEQUENCE_MANAGER_CONNECTION,
  SequenceManagerService,
  TokenFactory
} from '@tmtsoftware/esw-ts'
import { createServiceCtx } from './utils/createServiceCtx'

export type SMContextType = [Location | undefined, boolean]

type SMContext = { smService: SequenceManagerService; smLocation: Location }

const mkSMContext = (location: Location, tokenFactory: TokenFactory, username?: string): SMContext => ({
  smService: createSequenceManagerService(location, { tokenFactory, username }),
  smLocation: location
})

export const [useSMService, SMServiceProvider] = createServiceCtx(SEQUENCE_MANAGER_CONNECTION, mkSMContext)
