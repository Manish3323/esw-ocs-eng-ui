import {
  AgentProvisionConfig,
  ConfigService,
  Prefix,
  ProvisionConfig,
  SequenceManagerService,
  SpawningSequenceComponentsFailed
} from '@tmtsoftware/esw-ts'
import { Button, Modal, Typography } from 'antd'
import React, { useState } from 'react'
import { useConfigService } from '../../../../contexts/ConfigServiceContext'
import { useSMService } from '../../../../contexts/SMContext'
import { useMutation } from '../../../../hooks/useMutation'
import { errorMessage } from '../../../../utils/message'
import { PROVISION_CONF_PATH } from '../../constants'
import { useProvisionAction } from '../../hooks/useProvisionAction'
import { provisionConfConstants, provisionConstants } from '../../smConstants'
import { ProvisionTable } from './ProvisionTable'

type ProvisionRecord = Record<string, number>

const sanitiseErrorMsg = (res: SpawningSequenceComponentsFailed) =>
  res.failureResponses.map((x) => x.split('reason')[0]).join('\n')

const provision = (provisionRecord: ProvisionRecord) => async (sequenceManagerService: SequenceManagerService) => {
  const provisionConfig = parseProvisionConf(provisionRecord)
  const res = await sequenceManagerService.provision(provisionConfig)
  switch (res._type) {
    case 'Success':
      return res
    case 'LocationServiceError':
      throw Error(res.reason)
    case 'Unhandled':
      throw Error(res.msg)
    case 'SpawningSequenceComponentsFailed':
      throw Error(`${sanitiseErrorMsg(res)}`)
    case 'CouldNotFindMachines':
      throw Error(`Could not find following machine: ${res.prefix.map((x) => x.toJSON()).join(',')}`)

    case 'FailedResponse':
      throw new Error(res.reason)
  }
}

const parseProvisionConf = (provisionRecord: ProvisionRecord) => {
  const agentProvisionConfigs = Object.entries(provisionRecord).map(([prefixStr, num]) => {
    return new AgentProvisionConfig(Prefix.fromString(prefixStr), num)
  })
  return new ProvisionConfig(agentProvisionConfigs)
}

const validateProvisionConf = (provisionRecord: ProvisionRecord): ProvisionRecord => {
  Object.entries(provisionRecord).forEach(([key, value]) => {
    if (!Number.isInteger(value)) {
      throw Error(provisionConfConstants.getInValidConfMessage(key))
    }
    Prefix.fromString(key)
  })
  return provisionRecord
}

const fetchProvisionConf = async (configService: ConfigService): Promise<ProvisionRecord> => {
  const confOption = await configService.getActive(PROVISION_CONF_PATH)
  if (!confOption) throw Error(provisionConfConstants.confNotPresentMessage)
  const provisionConfRecord = await confOption.fileContentAsString()
  return validateProvisionConf(JSON.parse(provisionConfRecord))
}

export const ProvisionButton = ({ disabled = false }: { disabled?: boolean }): JSX.Element => {
  const useErrorBoundary = false
  const [modalVisibility, setModalVisibility] = useState(false)
  const [provisionRecord, setProvisionRecord] = useState<ProvisionRecord>({})

  const handleModalCancel = () => setModalVisibility(false)

  const [configService, isLoading] = useConfigService()
  const [smContext, smContextLoading] = useSMService()
  const smService = smContext?.smService

  const fetchProvisionConfAction = useMutation({
    mutationFn: fetchProvisionConf,
    onSuccess: async (data) => {
      if (Object.values(data).length <= 0) {
        await errorMessage(provisionConfConstants.confEmptyMessage)
      } else {
        setProvisionRecord(data)
        setModalVisibility(true)
      }
    },
    onError: (e) => errorMessage(provisionConfConstants.fetchFailureMessage, e),
    useErrorBoundary
  })

  const provisionAction = useProvisionAction(
    provision(provisionRecord),
    provisionConstants.successMessage,
    provisionConstants.failureMessage,
    useErrorBoundary
  )

  const onProvisionClick = () => {
    if (configService) fetchProvisionConfAction.mutateAsync(configService)
  }

  const handleModalOk = () => {
    if (smService) provisionAction.mutateAsync(smService)
    setModalVisibility(false)
  }

  return (
    <>
      <Button
        type='primary'
        size='middle'
        disabled={disabled}
        loading={smContextLoading || isLoading || provisionAction.isLoading}
        onClick={onProvisionClick}>
        {provisionConstants.buttonText}
      </Button>
      <Modal
        title={
          <Typography.Title level={5} style={{ marginBottom: 0 }}>
            {'Provision Configuration:'}
          </Typography.Title>
        }
        okText={provisionConstants.modalOkText}
        centered
        visible={modalVisibility}
        confirmLoading={provisionAction.isLoading}
        bodyStyle={{ padding: 0 }}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        destroyOnClose>
        <ProvisionTable provisionRecord={provisionRecord} setProvisionRecord={setProvisionRecord} />
      </Modal>
    </>
  )
}
