import type { Location, Prefix, SequencerState, Step } from '@tmtsoftware/esw-ts'
import { Badge, Layout, Space, Typography } from 'antd'
import React, { useState } from 'react'
import { PageHeader } from '../../../../components/pageHeader/PageHeader'
import { Spinner } from '../../../../components/spinners/Spinner'
import { useSequencerLocation } from '../../hooks/useSequencerLocation'
import { useSequencerStateSubscription } from '../../hooks/useSequencerStateSubscription'
import { sequencerDetailsConstants } from '../../sequencerConstants'
import { AbortSequence } from '../actions/AbortSequence'
import { LifecycleState } from '../actions/LifecycleState'
import { LoadSequence } from '../actions/LoadSequence'
import { StopSequence } from '../actions/StopSequence'
import type { SequencerProps } from '../Props'
import { SequencerError } from '../SequencerError'
import { StepListTable } from '../steplist/StepListTable'
import styles from './sequencerDetails.module.css'
import { StepInfo, EmptyStepInfo } from './StepInfo'

const { Sider, Content } = Layout

const Actions = ({ prefix, sequencerState }: SequencerProps): JSX.Element => {
  const isSequencerRunning = sequencerState === 'Running'
  return (
    <Space>
      <LoadSequence prefix={prefix} sequencerState={sequencerState} />
      <LifecycleState prefix={prefix} sequencerState={sequencerState} />
      <StopSequence prefix={prefix} isSequencerRunning={isSequencerRunning} />
      <AbortSequence prefix={prefix} isSequencerRunning={isSequencerRunning} />
    </Space>
  )
}

const SequenceComponentInfo = ({ seqLocation }: { seqLocation: Location }): JSX.Element => {
  const componentName = seqLocation.metadata.sequenceComponentPrefix

  return (
    <Space>
      <Typography.Text type='secondary' strong aria-label='SeqCompLabel'>
        Sequence Component:
      </Typography.Text>
      <Typography.Text aria-label='SeqCompValue'>{componentName}</Typography.Text>
    </Space>
  )
}
const SequencerTitle = ({
  sequencerState,
  prefix
}: {
  sequencerState: SequencerState
  prefix: Prefix
}): JSX.Element => {
  const isOnline = sequencerState._type !== 'Offline'
  return (
    <div data-testid={isOnline ? 'status-success' : 'status-error'}>
      <Badge status={isOnline ? 'success' : 'error'} className={styles.badge} />
      {prefix.toJSON()}
    </div>
  )
}
export const SequencerDetails = ({ prefix }: { prefix: Prefix }): JSX.Element => {
  const { sequencerStateResponse, loading } = useSequencerStateSubscription(prefix)
  const seqLocation = useSequencerLocation(prefix)

  const [selectedStep, setSelectedStep] = useState<Step>()

  if (seqLocation.isLoading || loading) return <Spinner />

  // sequencerStateResponse will always be received atleast once on subscription
  if (!seqLocation.data || !sequencerStateResponse) {
    return (
      <SequencerError title='404' subtitle={sequencerDetailsConstants.getSequencerNotFoundMessage(prefix.toJSON())} />
    )
  }

  return (
    <>
      <PageHeader
        title={<SequencerTitle prefix={prefix} sequencerState={sequencerStateResponse.sequencerState} />}
        ghost={false}
        className={styles.headerBox}
        extra={<Actions prefix={prefix} sequencerState={sequencerStateResponse.sequencerState._type} />}>
        <SequenceComponentInfo seqLocation={seqLocation.data} />
      </PageHeader>
      <Layout style={{ height: '90%', marginLeft: '1.5rem', marginTop: '1.5rem' }}>
        <Sider theme='light' width={'22rem'}>
          <StepListTable
            sequencerPrefix={prefix}
            selectedStep={selectedStep}
            setSelectedStep={setSelectedStep}
            sequencerStateResponse={sequencerStateResponse}
          />
        </Sider>
        <Content>{selectedStep ? <StepInfo step={selectedStep} /> : <EmptyStepInfo />}</Content>
      </Layout>
    </>
  )
}
