import type { SequencerState } from '@tmtsoftware/esw-ts'
import React from 'react'
import { PauseSequence } from './PauseSequence'
import { ResumeSequence } from './ResumeSequence'
import { StartSequence } from './StartSequence'

export const PlayPauseSequence = ({
  sequencerState,
  isPaused,
  isCurrentStepRunningAndNextPaused
}: {
  isPaused: boolean
  sequencerState: SequencerState['_type']
  isCurrentStepRunningAndNextPaused: boolean
}): JSX.Element => {
  const isSequencerRunning = sequencerState === 'Running'
  const canBePaused = isSequencerRunning && !isPaused

  if (canBePaused) return <PauseSequence />

  return sequencerState === 'Loaded' ? (
    <StartSequence sequencerState={sequencerState} />
  ) : (
    <ResumeSequence
      isSequencerRunning={isSequencerRunning}
      isCurrentStepRunningAndNextPaused={isCurrentStepRunningAndNextPaused}
    />
  )
}
