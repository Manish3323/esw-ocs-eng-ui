import type { OkOrUnhandledResponse, SequencerService } from '@tmtsoftware/esw-ts'
import { Button } from 'antd'
import React from 'react'
import { showConfirmModal } from '../../../../components/modal/showConfirmModal'
import { useMutation, UseMutationResult } from '../../../../hooks/useMutation'
import { errorMessage, successMessage } from '../../../../utils/message'
import { useSequencerService } from '../../hooks/useSequencerService'
import { abortSequenceConstants } from '../../sequencerConstants'
import type { SequencerProps } from '../Props'

const useAbortSequence = (): UseMutationResult<OkOrUnhandledResponse, unknown, SequencerService> => {
  const mutationFn = (sequencerService: SequencerService) => sequencerService.abortSequence()

  return useMutation({
    mutationFn,
    onSuccess: (res) => {
      if (res._type === 'Ok') return successMessage(abortSequenceConstants.successMessage)
      return errorMessage(abortSequenceConstants.failureMessage, Error(res.msg))
    },
    onError: (e) => errorMessage(abortSequenceConstants.failureMessage, e)
  })
}

type AbortSequenceProps = Omit<SequencerProps, 'sequencerState'>

export const AbortSequence = ({ prefix, isSequencerRunning }: AbortSequenceProps): JSX.Element => {
  const sequencerService = useSequencerService(prefix)
  const abortAction = useAbortSequence()

  return (
    <Button
      danger
      loading={abortAction.isLoading}
      onClick={() =>
        sequencerService &&
        showConfirmModal(
          () => {
            abortAction.mutate(sequencerService)
          },
          abortSequenceConstants.modalTitle,
          abortSequenceConstants.modalOkText
        )
      }
      disabled={!isSequencerRunning}>
      {abortSequenceConstants.buttonText}
    </Button>
  )
}
