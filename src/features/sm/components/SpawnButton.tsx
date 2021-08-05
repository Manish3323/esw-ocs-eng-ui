import { AgentService, Prefix } from '@tmtsoftware/esw-ts'
import { Button } from 'antd'
import React, { useState } from 'react'
import { SelectionModal } from '../../../components/modal/SelectionModal'
import { Spinner } from '../../../components/spinners/Spinner'
import { useAgentService } from '../../../contexts/AgentServiceContext'
import { useMutation } from '../../../hooks/useMutation'
import { errorMessage, successMessage } from '../../../utils/message'
import { useAgentsList } from '../../agent/hooks/useAgentsList'
import { OBS_MODE_CONFIG } from '../constants'
import { spawnSMConstants } from '../smConstants'

const spawnSM = (agentPrefix: string) => (agent: AgentService) =>
  agent.spawnSequenceManager(Prefix.fromString(agentPrefix), OBS_MODE_CONFIG, false).then((res) => {
    if (res._type === 'Failed') throw new Error(res.msg)
    return res
  })

export const SpawnSMButton = (): JSX.Element => {
  const [modalVisibility, setModalVisibility] = useState(false)
  const [agentPrefix, setAgentPrefix] = useState('')

  const allAgentsQuery = useAgentsList()
  const [agentService, agentServiceLoading] = useAgentService()

  const spawnSmAction = useMutation({
    mutationFn: spawnSM(agentPrefix),
    onSuccess: () => successMessage(spawnSMConstants.successMessage),
    onError: (e) => errorMessage(spawnSMConstants.failureMessage, e),
    useErrorBoundary: true // TODO : Remove error boundary
  })

  const handleModalOk = () => {
    if (agentPrefix !== '') {
      agentService && spawnSmAction.mutateAsync(agentService)
      setModalVisibility(false)
    } else {
      errorMessage(spawnSMConstants.selectAgentMessage)
    }
  }

  const handleSpawnButtonClick = async () => {
    // do we need special treatment when agent list is empty ?
    if (allAgentsQuery.data && allAgentsQuery.data.length !== 0) {
      setModalVisibility(true)
    } else {
      errorMessage(spawnSMConstants.agentNotRunningMessage)
    }
  }
  const handleModalCancel = () => setModalVisibility(false)
  const handleAgentSelected = (value: string) => setAgentPrefix(value)

  if (agentServiceLoading || allAgentsQuery.isLoading) return <Spinner />

  return (
    <>
      <Button type='primary' size='middle' loading={spawnSmAction.isLoading} onClick={handleSpawnButtonClick}>
        {spawnSMConstants.buttonText}
      </Button>
      <SelectionModal
        title={spawnSMConstants.modalTitle}
        okText={spawnSMConstants.modalOkText}
        visible={modalVisibility}
        confirmLoading={spawnSmAction.isLoading}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        data={allAgentsQuery.data?.map((prefix) => prefix.toJSON())}
        selectedItem={agentPrefix}
        onChange={handleAgentSelected}
      />
    </>
  )
}
