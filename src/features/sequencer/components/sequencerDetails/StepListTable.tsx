import type { Prefix, Step } from '@tmtsoftware/esw-ts'
import { Space, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/lib/table'
import React, { useEffect } from 'react'
import { useStepList } from '../../hooks/useStepList'
import { typeStatus } from '../SequencersTable'
import styles from './sequencerDetails.module.css'
import { StepComponent } from './StepComponent'

const columns = (
  stepListStatus: keyof typeof typeStatus,
  sequencerPrefix: Prefix,
  setSelectedStep: (_: Step) => void
): ColumnsType<Step> => [
  {
    title: (
      <>
        <Typography.Title level={5} style={{ marginBottom: 0 }}>
          Sequence Steps
        </Typography.Title>
        <Space>
          <Typography.Text type={'secondary'}>Status:</Typography.Text>
          <Typography.Text type={typeStatus[stepListStatus]}>
            {stepListStatus}
          </Typography.Text>
        </Space>
      </>
    ),
    key: 'id',
    dataIndex: 'status',
    render: (_, record, index) => {
      return StepComponent(record, index + 1, sequencerPrefix, setSelectedStep)
    }
  }
]

export const StepListTable = ({
  sequencerPrefix,
  stepListStatus,
  selectedStep,
  setSelectedStep
}: {
  sequencerPrefix: Prefix
  stepListStatus: keyof typeof typeStatus
  selectedStep?: Step
  setSelectedStep: (_: Step) => void
}): JSX.Element => {
  const { isLoading, data: stepList } = useStepList(sequencerPrefix)
  useEffect(() => {
    !selectedStep && stepList && setSelectedStep(stepList.steps[0])
  })
  return (
    <Table
      rowKey={(step) => step.id}
      pagination={false}
      loading={isLoading}
      dataSource={stepList?.steps}
      columns={columns(stepListStatus, sequencerPrefix, setSelectedStep)}
      onRow={() => ({ className: styles.cell })}
      onHeaderRow={() => ({ className: styles.cell })}
      sticky
    />
  )
}
