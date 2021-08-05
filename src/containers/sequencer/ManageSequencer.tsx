import { Prefix } from '@tmtsoftware/esw-ts'
import React from 'react'
import { useLocation } from 'react-router'
import { SequencerDetails } from '../../features/sequencer/components/sequencerDetails/SequencerDetails'
import { SequencerError } from '../../features/sequencer/components/SequencerError'
import { prefixKey } from '../../routes/RoutesConfig'

const invalidTitle = 'Invalid sequencer prefix'
const notFound = 'Sequencer prefix not present'

export const ManageSequencer = (): JSX.Element => {
  const { search } = useLocation()
  const query = new URLSearchParams(search)
  const maybePrefix = query.get(prefixKey)

  if (!maybePrefix) return <SequencerError title={invalidTitle} subtitle={notFound} />

  try {
    return <SequencerDetails prefix={Prefix.fromString(maybePrefix)} />
  } catch (e) {
    return <SequencerError title={invalidTitle} subtitle={e?.message} />
  }
}
