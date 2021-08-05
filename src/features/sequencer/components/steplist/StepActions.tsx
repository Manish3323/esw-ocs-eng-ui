import { CopyOutlined, MoreOutlined } from '@ant-design/icons'
import type { Step } from '@tmtsoftware/esw-ts'
import { Dropdown, Menu } from 'antd'
import React from 'react'
import { useStepListContext } from '../../hooks/useStepListContext'
import styles from '../sequencerDetails/sequencerDetails.module.css'
import { AddSteps } from './AddSteps'
import { BreakpointAction } from './BreakpointActions'
import { DeleteAction } from './DeleteAction'

const StepActionsMenu = ({ step, ...restProps }: { step: Step }): JSX.Element => {
  const status = step.status._type
  const isFinished = status === 'Failure' || status === 'Success'
  const isInProgressOrIsFinished = status === 'InFlight' || isFinished

  const { handleDuplicate, stepListStatus } = useStepListContext()

  return (
    <Menu {...restProps} className={styles.menu}>
      <BreakpointAction step={step} isDisabled={isInProgressOrIsFinished} />
      <AddSteps disabled={isFinished} stepId={step.id} />
      <Menu.Item
        key='Duplicate'
        onClick={handleDuplicate}
        disabled={stepListStatus === 'All Steps Completed'}
        icon={<CopyOutlined />}>
        Duplicate
      </Menu.Item>
      <DeleteAction step={step} isDisabled={isInProgressOrIsFinished} />
    </Menu>
  )
}

export const StepActions = ({ step }: { step: Step }): JSX.Element => (
  <Dropdown overlay={() => <StepActionsMenu step={step} />} trigger={['click']}>
    <MoreOutlined className={styles.actionEnabled} style={{ fontSize: '1.5rem' }} role='stepActions' />
  </Dropdown>
)
