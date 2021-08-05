import type { Prefix, SequencerState } from '@tmtsoftware/esw-ts'
import { useQuery, UseQueryResult } from 'react-query'
import { SEQUENCER_STATE } from '../../queryKeys'
import { useSequencerService } from '../../sequencer/hooks/useSequencerService'

export const useSequencerState = (sequencerPrefix: Prefix): UseQueryResult<SequencerState> => {
  const sequencerService = useSequencerService(sequencerPrefix)
  return useQuery(
    [SEQUENCER_STATE.key, sequencerPrefix],
    () => sequencerService && sequencerService.getSequencerState(),
    {
      enabled: !!sequencerService
    }
  )
}
