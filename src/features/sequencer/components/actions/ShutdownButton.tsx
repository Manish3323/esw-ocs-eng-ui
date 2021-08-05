import type { ObsMode, SequenceManagerService } from '@tmtsoftware/esw-ts'
import { Button } from 'antd'
import React from 'react'
import { showConfirmModal } from '../../../../components/modal/showConfirmModal'
import { useSMService } from '../../../../contexts/SMContext'
import { useMutation, UseMutationResult } from '../../../../hooks/useMutation'
import { errorMessage, successMessage } from '../../../../utils/message'
import { OBS_MODES_DETAILS } from '../../../queryKeys'
import { observationShutdownConstants } from '../../sequencerConstants'

const shutdown = (obsMode: ObsMode) => async (smService: SequenceManagerService) => {
  const res = await smService.shutdownObsModeSequencers(obsMode)
  switch (res._type) {
    case 'Success':
      return res
    case 'LocationServiceError':
      throw new Error(res.reason)
    case 'Unhandled':
      throw new Error(res.msg)
    case 'FailedResponse':
      throw new Error(res.reason)
  }
}

const ShutdownButtonAction = <QResult, MResult>(
  obsMode: ObsMode,
  onClick: (data: QResult) => Promise<MResult>,
  invalidateKeysOnSuccess?: string[]
): UseMutationResult<MResult, unknown, QResult> =>
  useMutation({
    mutationFn: onClick,
    onSuccess: () => successMessage(observationShutdownConstants.getSuccessMessage(obsMode)),
    onError: (e) => errorMessage(observationShutdownConstants.getFailureMessage(obsMode), e),
    invalidateKeysOnSuccess: invalidateKeysOnSuccess
  })

export const ShutdownButton = ({ obsMode }: { obsMode: ObsMode }): JSX.Element => {
  const [smContext, loading] = useSMService()
  const smService = smContext?.smService
  const shutdownAction = ShutdownButtonAction(obsMode, shutdown(obsMode), [OBS_MODES_DETAILS.key])

  return (
    <Button
      disabled={loading || !smService}
      loading={shutdownAction.isLoading}
      onClick={() =>
        smService &&
        showConfirmModal(
          () => {
            shutdownAction.mutateAsync(smService)
          },
          observationShutdownConstants.getModalTitle(obsMode),
          observationShutdownConstants.modalOkText
        )
      }
      danger>
      {observationShutdownConstants.buttonText}
    </Button>
  )
}
