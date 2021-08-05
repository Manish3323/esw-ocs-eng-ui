import type { AgentStatus } from '@tmtsoftware/esw-ts'
import { useAgentsStatus } from '../../agent/hooks/useAgentsStatus'

const areSequenceCompsRunning = (agents: AgentStatus[]) => {
  return agents.some((x) => x.seqCompsStatus.length > 0)
}

export const useProvisionStatus = (): boolean | undefined => {
  const { data } = useAgentsStatus()
  return data && areSequenceCompsRunning(data)
}
