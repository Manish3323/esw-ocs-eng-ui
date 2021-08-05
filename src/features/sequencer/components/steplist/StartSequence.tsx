import { PlayCircleOutlined } from '@ant-design/icons'
import type { SequencerService, SequencerState, SubmitResponse } from '@tmtsoftware/esw-ts'
import { Button, Tooltip } from 'antd'
import React from 'react'
import { useMutation, UseMutationResult } from '../../../../hooks/useMutation'
import { errorMessage, successMessage } from '../../../../utils/message'
import { useStepListContext } from '../../hooks/useStepListContext'
import { startSequenceConstants } from '../../sequencerConstants'
import styles from '../sequencerDetails/sequencerDetails.module.css'

const useStartSequence = (): UseMutationResult<SubmitResponse, unknown, SequencerService> => {
  const mutationFn = (sequencerService: SequencerService) => sequencerService.startSequence()

  const showError = (str: string) => errorMessage(startSequenceConstants.failureMessage, Error(str))

  return useMutation({
    mutationFn,
    onSuccess: (res) => {
      switch (res._type) {
        case 'Completed':
          return successMessage(startSequenceConstants.completedSuccessMessage)
        case 'Started':
          return successMessage(startSequenceConstants.successMessage)
        case 'Error':
          return showError(res.message)
        case 'Invalid':
          return showError(res.issue.reason)
        default:
          return showError(res._type)
      }
    },
    onError: (e) =>
      errorMessage(startSequenceConstants.failureMessage, (e as Error).message ? e : Error((e as string).toString()))
  })
}

export const StartSequence = ({ sequencerState }: { sequencerState: SequencerState['_type'] }): JSX.Element => {
  const { sequencerService } = useStepListContext()
  const startSequence = useStartSequence()

  const disabled = !sequencerState || sequencerState !== 'Loaded'
  return (
    <Tooltip title={'Start sequence'}>
      <Button
        onClick={() => sequencerService && startSequence.mutate(sequencerService)}
        type={'text'}
        shape={'circle'}
        icon={<PlayCircleOutlined className={disabled ? styles.actionDisabled : styles.actionEnabled} />}
        disabled={disabled}
        role='StartSequence'
      />
    </Tooltip>
  )
}
