import { PoweroffOutlined } from '@ant-design/icons'
import type { AgentService, ComponentId } from '@tmtsoftware/esw-ts'
import { Menu } from 'antd'
import React from 'react'
import { showConfirmModal } from '../../../components/modal/showConfirmModal'
import { useAgentService } from '../../../contexts/AgentServiceContext'
import { useMutation } from '../../../hooks/useMutation'
import { errorMessage, successMessage } from '../../../utils/message'
import { AGENTS_STATUS } from '../../queryKeys'
import { killSequenceComponentConstants } from '../agentConstants'

const killComponent = (componentId: ComponentId) => (agentService: AgentService) =>
  agentService.killComponent(componentId).then((res) => {
    if (res._type === 'Failed') throw new Error(res.msg)
    return res
  })

export const KillSequenceComponent = ({ componentId }: { componentId: ComponentId }): JSX.Element => {
  const [agentService, isLoading] = useAgentService()

  const killSequenceComponentAction = useMutation({
    mutationFn: killComponent(componentId),
    onSuccess: () => successMessage(killSequenceComponentConstants.getSuccessMessage(componentId.prefix.toJSON())),
    onError: (e) => errorMessage(killSequenceComponentConstants.getFailureMessage(componentId.prefix.toJSON()), e),
    invalidateKeysOnSuccess: [AGENTS_STATUS.key]
  })

  const handleOnClick = () => {
    agentService &&
      showConfirmModal(
        () => {
          killSequenceComponentAction.mutateAsync(agentService)
        },
        killSequenceComponentConstants.getModalTitle(componentId.prefix.toJSON()),
        killSequenceComponentConstants.modalOkText
      )
  }
  return (
    <Menu.Item
      key='KillSequenceComponent'
      role='KillSequenceComponent'
      danger={true}
      disabled={isLoading}
      icon={<PoweroffOutlined />}
      onClick={handleOnClick}>
      {killSequenceComponentConstants.menuItemText}
    </Menu.Item>
  )
}
