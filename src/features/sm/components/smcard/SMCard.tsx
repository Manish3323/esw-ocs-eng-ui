import { Card, Typography } from 'antd'
import React from 'react'
import { withErrorBoundary } from 'react-error-boundary'
import { ErrorFallback } from '../../../../components/ErrorFallback/ErrorFallback'
import { useSMStatus } from '../../hooks/useSMStatus'
import { ShutdownSMButton } from '../shutdown/ShutdownButton'
import { SpawnSMButton } from '../spawn/SpawnButton'
import styles from './smcard.module.css'

const SMCard = (): JSX.Element => {
  const smStatus = useSMStatus()
  return (
    <Card
      size='default'
      title={
        <Typography.Title level={4} className={styles.title}>
          Sequence Manager
        </Typography.Title>
      }
      extra={smStatus.data ? <ShutdownSMButton /> : <SpawnSMButton />}
      bodyStyle={{ display: 'none' }}
    />
  )
}

export default withErrorBoundary(SMCard, {
  FallbackComponent: ErrorFallback
})
