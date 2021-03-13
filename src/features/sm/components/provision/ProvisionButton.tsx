import {
  AgentProvisionConfig,
  ConfigService,
  Prefix,
  ProvisionConfig,
  SequenceManagerService
} from '@tmtsoftware/esw-ts'
import { Button, Modal } from 'antd'
import React, { useState } from 'react'
import { useMutation } from '../../../../hooks/useMutation'
import { errorMessage } from '../../../../utils/message'
import { useConfigService } from '../../../config/hooks/useConfigService'
import { PROVISION_CONF_PATH } from '../../constants'
import { useProvisionAction } from '../../hooks/useProvisionAction'
import { useSMService } from '../../hooks/useSMService'
import styles from './provision.module.css'
import { ProvisionTable } from './ProvisionTable'

type ProvisionRecord = Record<string, number>

const provision = (provisionRecord: ProvisionRecord) => (
  sequenceManagerService: SequenceManagerService
) => {
  const provisionConfig = parseProvisionConf(provisionRecord)
  return sequenceManagerService.provision(provisionConfig).then((res) => {
    switch (res._type) {
      case 'Success':
        return res
      case 'LocationServiceError':
        throw Error(res.reason)
      case 'Unhandled':
        throw Error(res.msg)
      case 'SpawningSequenceComponentsFailed':
        throw Error(res.failureResponses.join('\n'))
      case 'CouldNotFindMachines':
        throw Error(
          `Could not find following machine: ${res.prefix
            .map((x) => x.toJSON())
            .join(',')}`
        )
    }
  })
}

const parseProvisionConf = (provisionRecord: ProvisionRecord) => {
  const agentProvisionConfigs = Object.entries(provisionRecord).map(
    ([prefixStr, num]) => {
      return new AgentProvisionConfig(Prefix.fromString(prefixStr), num)
    }
  )
  return new ProvisionConfig(agentProvisionConfigs)
}

const validateProvisionConf = (
  provisionRecord: ProvisionRecord
): ProvisionRecord => {
  Object.entries(provisionRecord).forEach(([key, value]) => {
    if (!Number.isInteger(value)) {
      throw Error(
        `value of number of sequence components for ${key} is not an Integer`
      )
    }
    Prefix.fromString(key)
  })
  return provisionRecord
}

const fetchProvisionConf = async (
  configService: ConfigService
): Promise<ProvisionRecord> => {
  const confOption = await configService.getActive(PROVISION_CONF_PATH)
  if (!confOption) throw Error('Provision conf is not present')
  const provisionConfRecord = await confOption.fileContentAsString()
  return validateProvisionConf(JSON.parse(provisionConfRecord))
}

export const ProvisionButton = (): JSX.Element => {
  const useErrorBoundary = false
  const [modalVisibility, setModalVisibility] = useState(false)
  const [provisionRecord, setProvisionRecord] = useState<ProvisionRecord>({})

  const handleModalCancel = () => setModalVisibility(false)

  const configService = useConfigService(useErrorBoundary)
  const smService = useSMService(useErrorBoundary)

  const fetchProvisionConfAction = useMutation({
    mutationFn: fetchProvisionConf,
    onSuccess: async (data) => {
      if (Object.values(data).length <= 0) {
        await errorMessage('Provision config is empty')
      } else {
        setProvisionRecord(data)
        setModalVisibility(true)
      }
    },
    onError: (e) => errorMessage('Failed to fetch provision config', e),
    useErrorBoundary
  })

  const provisionAction = useProvisionAction(
    provision(provisionRecord),
    'Successfully provisioned',
    'Failed to provision',
    useErrorBoundary
  )

  const onProvisionClick = () => {
    if (configService.data) fetchProvisionConfAction.mutate(configService.data)
  }

  const handleModalOk = () => {
    if (smService.data) provisionAction.mutate(smService.data)
    setModalVisibility(false)
  }

  return (
    <>
      <Button
        type='primary'
        size='middle'
        disabled={smService.isLoading || smService.isError}
        loading={provisionAction.isLoading}
        onClick={onProvisionClick}>
        Provision
      </Button>
      <Modal
        title='Provision Configuration:'
        okText='Provision'
        centered
        visible={modalVisibility}
        confirmLoading={provisionAction.isLoading}
        bodyStyle={{ padding: 0 }}
        className={styles.modalHeader}
        onOk={handleModalOk}
        onCancel={handleModalCancel}>
        <ProvisionTable
          provisionRecord={provisionRecord}
          setProvisionRecord={setProvisionRecord}
        />
      </Modal>
    </>
  )
}
