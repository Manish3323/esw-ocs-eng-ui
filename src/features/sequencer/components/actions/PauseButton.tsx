import type { SequencerService } from '@tmtsoftware/esw-ts'
import { Button } from 'antd'
import React from 'react'
import { useAction } from '../../../common/hooks/useAction'
import { errorMessage, successMessage } from '../../../common/message'
import { useSequencerService } from '../../hooks/useSequencerService'

const PauseButton = ({ obsMode }: { obsMode: string }): JSX.Element => {
  const sequencerService = useSequencerService(obsMode, false)

  const pauseAction = useAction({
    mutationFn: async (sequencerService: SequencerService) =>
      sequencerService.pause().then((res) => {
        switch (res._type) {
          case 'Ok':
            return res
          case 'Unhandled':
            throw new Error(res.msg)
          case 'CannotOperateOnAnInFlightOrFinishedStep':
            throw new Error('Cannot operate on in progress or finished step')
        }
      }),
    onSuccess: () => successMessage('Successfully paused sequencer.'),
    onError: (e) => errorMessage('Failed to pause sequencer', e),
    useErrorBoundary: false
  })

  return (
    <Button
      disabled={sequencerService.isLoading || sequencerService.isError}
      loading={pauseAction.isLoading}
      onClick={() =>
        sequencerService.data && pauseAction.mutateAsync(sequencerService.data)
      }>
      Pause
    </Button>
  )
}

export default PauseButton
