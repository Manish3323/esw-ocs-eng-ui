import type { OkOrUnhandledResponse, SequencerService } from '@tmtsoftware/esw-ts'
import { Button } from 'antd'
import React from 'react'
import { showConfirmModal } from '../../../../components/modal/showConfirmModal'
import { useMutation, UseMutationResult } from '../../../../hooks/useMutation'
import { errorMessage, successMessage } from '../../../../utils/message'
import { useSequencerService } from '../../hooks/useSequencerService'
import { stopSequenceConstants } from '../../sequencerConstants'
import type { SequencerProps } from '../Props'

const useStopAction = (): UseMutationResult<OkOrUnhandledResponse, unknown, SequencerService> => {
  const mutationFn = (sequencerService: SequencerService) => sequencerService.stop()

  return useMutation({
    mutationFn,
    onSuccess: (res) => {
      if (res._type === 'Ok') return successMessage(stopSequenceConstants.successMessage)
      return errorMessage(stopSequenceConstants.failureMessage, Error(res.msg))
    },
    onError: (e) => errorMessage(stopSequenceConstants.failureMessage, e)
  })
}

type StopSequenceProps = Omit<SequencerProps, 'sequencerState'>

export const StopSequence = ({ prefix, isSequencerRunning }: StopSequenceProps): JSX.Element => {
  const sequencerService = useSequencerService(prefix)
  const stopAction = useStopAction()
  const disabled = !isSequencerRunning

  const onClick = () =>
    sequencerService &&
    showConfirmModal(
      () => {
        stopAction.mutate(sequencerService)
      },
      stopSequenceConstants.modalTitle,
      stopSequenceConstants.modalOkText
    )

  return (
    <Button onClick={onClick} disabled={disabled} role='StopSequence' danger={!disabled}>
      {stopSequenceConstants.buttonText}
    </Button>
  )
}
