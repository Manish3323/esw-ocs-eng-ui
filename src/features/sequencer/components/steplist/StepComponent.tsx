import type { SequenceCommand, Step, StepStatus } from '@tmtsoftware/esw-ts'
import { Button, Space, Tooltip, Typography } from 'antd'
import React, { useState } from 'react'
import { useStepListContext } from '../../hooks/useStepListContext'
import { StepActions } from './StepActions'
import type { StepRefInfo } from './StepListTable'

export type StepData = {
  id: string
  command: SequenceCommand
  status: StepStatus
  hasBreakpoint: boolean
  index: number
}

const color: Record<StepStatus['_type'], string> = {
  Success: '#00000073',
  Failure: '#ff4d4f',
  Pending: '#FFC53D',
  InFlight: '#52c41a'
}

export const StepComponent = (
  step: StepData,
  setSelectedStep: (_: Step) => void,
  stepRefs: React.MutableRefObject<StepRefInfo>
): JSX.Element => {
  const stepsStyle = {
    borderColor: color[step.status._type],
    width: '15rem',
    borderLeft: `${step.hasBreakpoint ? '1rem solid red' : `1px solid ${color[step.status._type]}`}`
  }

  const { isDuplicateEnabled, setFollowProgress } = useStepListContext()
  const [isVisible, setVisible] = useState<boolean>(false)

  return (
    <Space style={{ textAlign: 'right' }}>
      <div ref={(el) => el && (stepRefs.current[step.id] = el)} style={{ width: '1.5rem', marginRight: '0.5rem' }}>
        <Typography.Text type={'secondary'}>{step.index + 1}</Typography.Text>
      </div>
      <Tooltip title={isVisible ? step.command.commandName : undefined}>
        <Button
          key={step.command.commandName}
          style={stepsStyle}
          shape={'round'}
          onClick={() => {
            setSelectedStep(step)
            setFollowProgress(step.status._type === 'InFlight')
          }}>
          <Typography.Text
            ellipsis={{ onEllipsis: setVisible }}
            style={{ width: '100%', color: color[step.status._type] }}
            strong>
            {step.command.commandName}
          </Typography.Text>
        </Button>
      </Tooltip>
      {!isDuplicateEnabled && <StepActions step={step} />}
    </Space>
  )
}
