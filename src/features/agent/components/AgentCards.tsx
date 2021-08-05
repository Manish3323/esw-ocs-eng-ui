import type { Prefix, SequenceComponentStatus } from '@tmtsoftware/esw-ts'
import { Card, Col, Grid, Row, Typography } from 'antd'
import React from 'react'
import { UNKNOWN_AGENT, useAgentsStatus } from '../hooks/useAgentsStatus'
import styles from './agentCards.module.css'
import { SequenceComponentCard } from './SequenceComponentCard'
import { SpawnSequenceComponent } from './SpawnSequenceComponent'

const { useBreakpoint } = Grid

type AgentCardProps = {
  agentPrefix: Prefix
  seqCompsStatus: SequenceComponentStatus[]
}

const AgentCard = ({ agentPrefix, seqCompsStatus }: AgentCardProps): JSX.Element => {
  const bodyStyle = seqCompsStatus.length === 0 ? { display: 'none' } : { padding: '1.5rem 1rem 0.5rem 1.5rem' }

  const agentName = agentPrefix === UNKNOWN_AGENT.prefix ? UNKNOWN_AGENT.prefix.componentName : agentPrefix.toJSON()

  const sequenceCompCards = seqCompsStatus.map((seqCompStatus, index) => (
    <SequenceComponentCard
      key={index}
      seqCompId={seqCompStatus.seqCompId}
      sequencerPrefix={getSequencerPrefix(seqCompStatus)}
    />
  ))

  return (
    <Card
      headStyle={{ paddingRight: '0.75rem' }}
      className={styles.agentCard}
      title={<Typography.Text>{agentName}</Typography.Text>}
      extra={<SpawnSequenceComponent agentPrefix={agentPrefix} />}
      bodyStyle={bodyStyle}>
      {sequenceCompCards}
    </Card>
  )
}

export const AgentCards = (): JSX.Element => {
  const { data } = useAgentsStatus()
  const screen = useBreakpoint()

  const agentCards = data?.map((agentStatus, index) => (
    <AgentCard key={index} agentPrefix={agentStatus.agentId.prefix} seqCompsStatus={agentStatus.seqCompsStatus} />
  ))

  const [columnCount, span] = screen.xl ? [4, 6] : screen.lg ? [3, 8] : [2, 12]

  const agents = agentCards?.reduce((columns, agentCard, index) => {
    const currentColumn = index % columnCount
    if (!columns[currentColumn]) {
      columns[currentColumn] = []
    }
    columns[currentColumn].push(agentCard)
    return columns
  }, Array(columnCount))

  return (
    <Row justify='start' gutter={[24, 24]} wrap={true} className={styles.grid}>
      {agents?.map((agent, index) => (
        <Col key={index} span={span}>
          {agent}
        </Col>
      ))}
    </Row>
  )
}
const getSequencerPrefix = (seqCompStatus: SequenceComponentStatus): Prefix | undefined => {
  return seqCompStatus.sequencerLocation[0]?.connection.prefix
}
