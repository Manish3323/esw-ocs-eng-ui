import { ObsMode, ObsModeDetails } from '@tmtsoftware/esw-ts'
import { Button } from 'antd'
import React, { useState } from 'react'
import { SelectionModal } from '../../../components/modal/SelectionModal'
import { useSMService } from '../../../contexts/SMContext'
import { errorMessage } from '../../../utils/message'
import { useConfigureAction } from '../hooks/useConfigureAction'
import { useObsModesDetails } from '../hooks/useObsModesDetails'
import { configureConstants } from '../smConstants'

type ConfigureProps = {
  disabled: boolean | undefined
}
export const Configure = ({ disabled }: ConfigureProps): JSX.Element => {
  const [modalVisibility, setModalVisibility] = useState(false)
  const [obsMode, setObsMode] = useState<ObsMode>()
  const [obsModesDetails, setObsModesDetails] = useState<ObsModeDetails[]>([])

  const [smContext, loading] = useSMService()
  const smService = smContext?.smService

  const { data } = useObsModesDetails()

  const configureAction = useConfigureAction(obsMode)
  const handleModalOk = () => {
    if (obsMode) {
      if (smService) {
        configureAction.mutate(smService)
      }
      setModalVisibility(false)
    } else {
      errorMessage(configureConstants.selectObModeMessage)
    }
  }

  const onConfigureClick = () => {
    if (data) {
      setObsModesDetails(data.Configurable)
    }
    setObsMode(undefined)
    setModalVisibility(true)
  }

  const handleCancel = () => {
    setModalVisibility(false)
    setObsMode(undefined)
  }

  return (
    <>
      <Button
        disabled={disabled || loading || !smService}
        loading={configureAction.isLoading}
        onClick={onConfigureClick}>
        {configureConstants.buttonText}
      </Button>
      <SelectionModal
        title={configureConstants.modalTitle}
        okText={configureConstants.modalOkText}
        visible={modalVisibility}
        onOk={handleModalOk}
        onCancel={handleCancel}
        data={obsModesDetails.map((obsModeDetail) => obsModeDetail.obsMode.name)}
        selectedItem={obsMode?.name ?? ''}
        onChange={(value: string) => setObsMode(new ObsMode(value))}
      />
    </>
  )
}
