import type { Prefix, SequencerState } from '@tmtsoftware/esw-ts'

export type SequencerProps = {
  prefix: Prefix
  sequencerState: SequencerState['_type']
  isSequencerRunning?: boolean
}
