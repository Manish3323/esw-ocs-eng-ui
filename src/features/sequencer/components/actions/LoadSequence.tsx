import type { OkOrUnhandledResponse, Sequence, SequencerService } from '@tmtsoftware/esw-ts'
import { Button } from 'antd'
import React, { useState } from 'react'
import { useMutation, UseMutationResult } from '../../../../hooks/useMutation'
import { errorMessage, successMessage } from '../../../../utils/message'
import { useSequencerService } from '../../hooks/useSequencerService'
import { loadSequenceConstants } from '../../sequencerConstants'
import type { SequencerProps } from '../Props'
import { UploadSequence } from '../UploadSequence'

const useLoadAction = (
  sequence?: Sequence
): UseMutationResult<OkOrUnhandledResponse | undefined, unknown, SequencerService> => {
  const mutationFn = async (sequencerService: SequencerService) =>
    sequence && (await sequencerService.loadSequence(sequence))

  return useMutation({
    mutationFn,
    onSuccess: (res) => {
      if (res?._type === 'Ok') return successMessage(loadSequenceConstants.successMessage)
      return errorMessage(loadSequenceConstants.failureMessage, Error(res?.msg))
    },
    onError: (e) => errorMessage(loadSequenceConstants.failureMessage, e)
  })
}
type LoadSequenceProps = Omit<SequencerProps, 'isSequencerRunning'>

export const LoadSequence = ({ prefix, sequencerState }: LoadSequenceProps): JSX.Element => {
  const sequencerService = useSequencerService(prefix)
  const [sequence, setSequence] = useState<Sequence>()
  const loadSequenceAction = useLoadAction(sequence)

  const request = () => sequencerService && loadSequenceAction.mutate(sequencerService)

  return (
    <UploadSequence setSequence={setSequence} request={request} uploadErrorMsg={loadSequenceConstants.failureMessage}>
      <Button
        type='primary'
        loading={loadSequenceAction.isLoading}
        role={'LoadSequence'}
        disabled={!sequencerState || !(sequencerState === 'Idle' || sequencerState === 'Loaded')}>
        {loadSequenceConstants.buttonText}
      </Button>
    </UploadSequence>
  )
}
