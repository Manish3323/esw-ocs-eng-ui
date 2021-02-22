import {
  AgentProvisionConfig,
  ConfigService,
  Prefix,
  ProvisionConfig,
  SequenceManagerService
} from '@tmtsoftware/esw-ts'
import { Button, message, Modal } from 'antd'
import React, { useState } from 'react'
import { useConfigService } from '../../../config/hooks/useConfigService'
import { useAction } from '../../../utils/hooks/useAction'
import { ProvisionConfPath } from '../../constants'
import { useProvisionAction } from '../../hooks/useProvisionAction'
import { useSMService } from '../hooks/useSMService'
import { ProvisionTable } from './ProvisionTable'

type ProvisionRecord = Record<string, number>

const provision = (provisionRecord: ProvisionRecord) => (
  sequenceManagerService: SequenceManagerService
) => {
  const provisionConfig = parseProvisionConf(provisionRecord)
  return sequenceManagerService.provision(provisionConfig).then((res) => {
    if (res._type == 'Success') return res
    throw Error(JSON.stringify(res))
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

const fetchProvisionConf = async (
  configService: ConfigService
): Promise<ProvisionRecord> => {
  const confOption = await configService.getActive(ProvisionConfPath)
  if (!confOption) throw Error('Provision conf is not present')
  const provisionConfRecord = await confOption.fileContentAsString()
  return JSON.parse(provisionConfRecord)
}

export const ProvisionButton = (): JSX.Element => {
  const [modalVisibility, setModalVisibility] = useState(false)
  const [provisionRecord, setProvisionRecord] = useState<ProvisionRecord>({})

  const handleModalCancel = () => setModalVisibility(false)

  const configService = useConfigService()
  const smService = useSMService()

  const fetchProvisionConfAction = useAction(
    'provisionConfig',
    fetchProvisionConf,
    'Successfully fetched Provision Config from ConfigService',
    'Failed to fetch Provision Config',
    async (data) => {
      if (Object.values(data).length <= 0) {
        await message.error('Provision config is empty')
      } else {
        setProvisionRecord(data)
        setModalVisibility(true)
      }
    }
  )

  const provisionAction = useProvisionAction(
    provision(provisionRecord),
    'Successfully provisioned',
    'Failed to provision'
  )

  const disabled = configService.isLoading || smService.isLoading

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
        disabled={disabled}
        loading={provisionAction.isLoading}
        onClick={onProvisionClick}>
        Provision
      </Button>
      <Modal
        title='Provision Config'
        okText='Provision'
        centered
        visible={modalVisibility}
        confirmLoading={provisionAction.isLoading}
        bodyStyle={{ padding: 0 }}
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
