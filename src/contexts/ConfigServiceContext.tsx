import { createConfigService, CONFIG_CONNECTION } from '@tmtsoftware/esw-ts'
import { createServiceCtx } from './utils/createServiceCtx'

export const [useConfigService, ConfigServiceProvider] = createServiceCtx(CONFIG_CONNECTION, createConfigService)
