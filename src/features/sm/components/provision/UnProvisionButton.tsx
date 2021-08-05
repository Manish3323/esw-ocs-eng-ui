import type { SequenceManagerService } from '@tmtsoftware/esw-ts'
import { Button } from 'antd'
import React from 'react'
import { showConfirmModal } from '../../../../components/modal/showConfirmModal'
import { Spinner } from '../../../../components/spinners/Spinner'
import { useSMService } from '../../../../contexts/SMContext'
import { useProvisionAction } from '../../hooks/useProvisionAction'
import { unProvisionConstants } from '../../smConstants'

const shutdownAllSequenceComps = (sequenceManagerService: SequenceManagerService) =>
  sequenceManagerService.shutdownAllSequenceComponents().then((res) => {
    switch (res._type) {
      case 'LocationServiceError':
        throw Error(res.reason)
      case 'Unhandled':
        throw Error(res.msg)
      case 'Success':
        return res
      case 'FailedResponse':
        throw new Error(res.reason)
    }
  })

export const UnProvisionButton = ({ disabled = false }: { disabled?: boolean }): JSX.Element => {
  const useErrorBoundary = false
  const [smContext, isLoading] = useSMService()
  const smService = smContext?.smService

  const unProvisionAction = useProvisionAction(
    shutdownAllSequenceComps,
    unProvisionConstants.successMessage,
    unProvisionConstants.failureMessage,
    useErrorBoundary
  )

  if (isLoading) return <Spinner />

  return (
    <Button
      danger
      disabled={disabled}
      loading={unProvisionAction.isLoading}
      onClick={() =>
        smService &&
        showConfirmModal(
          () => {
            unProvisionAction.mutateAsync(smService)
          },
          unProvisionConstants.modalTitle,
          unProvisionConstants.modalOkText
        )
      }>
      {unProvisionConstants.buttonText}
    </Button>
  )
}
