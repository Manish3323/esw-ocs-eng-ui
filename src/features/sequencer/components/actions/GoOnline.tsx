import type { GoOnlineResponse, SequencerService } from '@tmtsoftware/esw-ts'
import { Button } from 'antd'
import React from 'react'
import { useMutation, UseMutationResult } from '../../../../hooks/useMutation'
import { errorMessage, successMessage } from '../../../../utils/message'
import { useSequencerService } from '../../hooks/useSequencerService'
import { goOnlineConstants } from '../../sequencerConstants'
import type { SequencerProps } from '../Props'

const useGoOnlineAction = (): UseMutationResult<GoOnlineResponse, unknown, SequencerService> => {
  const mutationFn = (sequencerService: SequencerService) => sequencerService.goOnline()

  return useMutation({
    mutationFn,
    onSuccess: (res) => {
      if (res._type === 'Ok') return successMessage(goOnlineConstants.successMessage)
      return errorMessage(
        goOnlineConstants.failureMessage,
        Error(res._type === 'GoOnlineHookFailed' ? res._type : res.msg)
      )
    },
    onError: (e) => errorMessage(goOnlineConstants.failureMessage, e)
  })
}

export const GoOnline = ({ prefix, sequencerState }: SequencerProps): JSX.Element => {
  const sequencerService = useSequencerService(prefix)
  const goOnlineAction = useGoOnlineAction()

  const goOnline = () => sequencerService && goOnlineAction.mutate(sequencerService)

  return (
    <Button disabled={sequencerState === 'Running'} loading={goOnlineAction.isLoading} onClick={() => goOnline()}>
      {goOnlineConstants.buttonText}
    </Button>
  )
}
