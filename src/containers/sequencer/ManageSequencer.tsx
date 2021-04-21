import { Prefix } from '@tmtsoftware/esw-ts'
import React from 'react'
import { useParams } from 'react-router-dom'
import { SequencerDetails } from '../../features/sequencer/components/sequencerDetails/SequencerDetails'

type ManageSequencerURLParams = {
  subsystem: string
  componentName: string
  obsMode?: string
}

export const ManageSequencer = (): JSX.Element => {
  const {
    subsystem,
    componentName,
    obsMode
  } = useParams<ManageSequencerURLParams>()

  const sequencerPrefix = Prefix.fromString(`${subsystem}.${componentName}`)

  // TODO handle optional obsMode well
  return (
    <SequencerDetails prefix={sequencerPrefix} obsMode={obsMode ?? 'UNKNOWN'} />
  )
}
