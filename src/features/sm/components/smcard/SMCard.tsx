import { Card, Typography } from 'antd'
import React from 'react'
import CustomErrorBoundary from '../../../../components/ErrorBoundary/CustomErrorBoundary'
import { useSMStatus } from '../../hooks/useSMStatus'
import { ShutdownSMButton } from '../shutdown/ShutdownButton'
import { SpawnSMButton } from '../spawn/SpawnButton'
import styles from './smcard.module.css'

const SMCard = (): JSX.Element => {
  const smStatus = useSMStatus()
  return (
    <CustomErrorBoundary>
      <Card
        title={
          <Typography.Title level={4} className={styles.title}>
            Sequence Manager
          </Typography.Title>
        }
        headStyle={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
        extra={smStatus.data ? <ShutdownSMButton /> : <SpawnSMButton />}
        bodyStyle={{ display: 'none' }}
      />
    </CustomErrorBoundary>
  )
}

export default SMCard
