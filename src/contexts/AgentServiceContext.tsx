import { AGENT_SERVICE_CONNECTION, createAgentService } from '@tmtsoftware/esw-ts'
import { createServiceCtx } from './utils/createServiceCtx'

export const [useAgentService, AgentServiceProvider] = createServiceCtx(
  AGENT_SERVICE_CONNECTION,
  (loc, tokenFactory, username) => createAgentService(loc, { tokenFactory, username })
)
