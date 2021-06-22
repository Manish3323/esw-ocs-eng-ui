import type { Step } from '@tmtsoftware/esw-ts'
import type { StepStatusFailure } from '@tmtsoftware/esw-ts/dist/src/clients/sequencer/models/StepList'
import { Alert, Descriptions, Empty, Space, Typography } from 'antd'
import React from 'react'
import globalStyles from '../../../../index.module.css'
import { stepConstants } from '../../sequencerConstants'
import { ParameterTable } from './ParameterTable'
import styles from './sequencerDetails.module.css'

const StepItem = (label: string, item: string) => {
  return (
    <Descriptions.Item
      label={
        <Typography.Title aria-label={`${label}-Key`} type={'secondary'} level={5}>
          {label}
        </Typography.Title>
      }>
      {
        <Typography.Title aria-label={`${label}-Value`} ellipsis={{ tooltip: true }} level={5}>
          {item}
        </Typography.Title>
      }
    </Descriptions.Item>
  )
}

const getStepFailureMessage = (failure: StepStatusFailure) =>
  failure.message !== '' ? failure.message : stepConstants.defaultStepFailureErrorMessage

const StepErrorAlert = ({ message }: { message: string }) => (
  <Alert message='' description={<Typography.Text type='danger'>{message}</Typography.Text>} type='error' showIcon />
)

export const StepInfo = ({ step }: { step: Step }): JSX.Element => (
  <div className={styles.stepInfo}>
    <Space direction='vertical' size='large'>
      {step.status._type === 'Failure' && <StepErrorAlert message={getStepFailureMessage(step.status)} />}
      <Descriptions column={{ xs: 1, md: 1, lg: 2, xl: 2 }} size={'small'}>
        {StepItem('Command', step.command.commandName)}
        {StepItem('Source', step.command.source.toJSON())}
        {StepItem('Command Type', step.command._type.toString())}
        {StepItem('Obs-Id', step.command.maybeObsId ?? 'NA')}
      </Descriptions>
    </Space>
    <ParameterTable paramSet={step.command.paramSet} />
  </div>
)

export const EmptyStepInfo = (): JSX.Element => (
  <div className={globalStyles.centeredFlexElement + ' ' + styles.emptyStepInfo}>
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
  </div>
)
