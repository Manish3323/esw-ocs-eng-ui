import { CloseCircleOutlined, VerticalAlignMiddleOutlined } from '@ant-design/icons'
import type { SequencerService, Step } from '@tmtsoftware/esw-ts'
import { Menu } from 'antd'
import React from 'react'
import { useMutation } from '../../../../hooks/useMutation'
import { errorMessage, successMessage } from '../../../../utils/message'
import { useStepListContext } from '../../hooks/useStepListContext'
import { insertBreakPointConstants, removeBreakPointConstants } from '../../sequencerConstants'
import { handleStepActionResponse } from '../../utils'

const insertAction = (id: string) => (sequencerService: SequencerService) =>
  sequencerService.addBreakpoint(id).then(handleStepActionResponse)

const removeAction = (id: string) => (sequencerService: SequencerService) =>
  sequencerService.removeBreakpoint(id).then(handleStepActionResponse)

export const BreakpointAction = ({ step, isDisabled }: { step: Step; isDisabled: boolean }): JSX.Element => {
  const { sequencerService } = useStepListContext()

  const insertBreakpointAction = useMutation({
    mutationFn: insertAction(step.id),
    onSuccess: () => successMessage(insertBreakPointConstants.successMessage),
    onError: (e) => errorMessage(insertBreakPointConstants.failureMessage, e)
  })

  const removeBreakpointAction = useMutation({
    mutationFn: removeAction(step.id),
    onSuccess: () => successMessage(removeBreakPointConstants.successMessage),
    onError: (e) => errorMessage(removeBreakPointConstants.failureMessage, e)
  })

  const handleOnClick = () => {
    if (step.hasBreakpoint) {
      sequencerService && removeBreakpointAction.mutate(sequencerService)
    } else {
      sequencerService && insertBreakpointAction.mutate(sequencerService)
    }
  }
  const icon = step.hasBreakpoint ? <CloseCircleOutlined /> : <VerticalAlignMiddleOutlined />

  const itemText = step.hasBreakpoint ? removeBreakPointConstants.menuItemText : insertBreakPointConstants.menuItemText

  return (
    <Menu.Item key='BreakpointAction' disabled={isDisabled} icon={icon} onClick={handleOnClick}>
      {itemText}
    </Menu.Item>
  )
}
