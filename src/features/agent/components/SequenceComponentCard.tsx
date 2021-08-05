import type { ComponentId, Prefix } from '@tmtsoftware/esw-ts'
import { Col, Row, Space, Typography } from 'antd'
import React from 'react'
import { Link } from 'react-router-dom'
import { getSequencerPath } from '../../../routes/RoutesConfig'
import styles from './agentCards.module.css'
import { SequenceComponentActions, SequencerActions } from './SequenceComponentActions'

type SequencerProps = {
  seqCompPrefix: Prefix
  sequencerPrefix: Prefix
}

type SequenceComponentProps = {
  seqCompPrefix: Prefix
}

type SequenceComponentCardProps = {
  seqCompId: ComponentId
  sequencerPrefix: Prefix | undefined
}

const Sequencer = ({ seqCompPrefix, sequencerPrefix }: SequencerProps): JSX.Element => {
  const Title = () => (
    <Space direction='vertical' size={1}>
      <Typography.Text style={{ color: '#237804' }}>[{sequencerPrefix.toJSON()}]</Typography.Text>
      <Typography.Text type='secondary'>{seqCompPrefix.toJSON()}</Typography.Text>
    </Space>
  )

  return (
    <Link to={getSequencerPath(sequencerPrefix.toJSON())}>
      <div className={styles.sequencer}>
        <Title />
      </div>
    </Link>
  )
}

const SequenceComponent = ({ seqCompPrefix }: SequenceComponentProps): JSX.Element => (
  <div className={styles.seqComp}>
    <Typography.Text style={{ color: 'var(--labelColor)' }}>{seqCompPrefix.toJSON()}</Typography.Text>
  </div>
)

export const SequenceComponentCard = ({ seqCompId, sequencerPrefix }: SequenceComponentCardProps): JSX.Element => {
  const seqComponentPrefix = seqCompId.prefix
  const SequenceComponentOrSequencer = () =>
    sequencerPrefix ? (
      <Sequencer seqCompPrefix={seqComponentPrefix} sequencerPrefix={sequencerPrefix} />
    ) : (
      <SequenceComponent seqCompPrefix={seqComponentPrefix} />
    )

  return (
    <Row style={{ paddingBottom: '1rem' }}>
      <Col flex='auto'>
        <SequenceComponentOrSequencer />
      </Col>
      <Col className={styles.iconBox}>
        {!sequencerPrefix && <SequenceComponentActions componentId={seqCompId} />}
        {sequencerPrefix && <SequencerActions componentId={seqCompId} sequencerPrefix={sequencerPrefix} />}
      </Col>
    </Row>
  )
}
