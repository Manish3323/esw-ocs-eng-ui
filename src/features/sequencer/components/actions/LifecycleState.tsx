import React from 'react'
import type { SequencerProps } from '../Props'
import { GoOffline } from './GoOffline'
import { GoOnline } from './GoOnline'

export const LifecycleState = ({ prefix, sequencerState }: SequencerProps): JSX.Element => {
  return sequencerState === 'Offline' ? (
    <GoOnline prefix={prefix} sequencerState={sequencerState} />
  ) : (
    <GoOffline prefix={prefix} sequencerState={sequencerState} />
  )
}
