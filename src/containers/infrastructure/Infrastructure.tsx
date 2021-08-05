import { Card, Space, Typography } from 'antd'
import type { BaseType } from 'antd/lib/typography/Base'
import React from 'react'
import { PageHeader } from '../../components/pageHeader/PageHeader'
import styles from '../../components/pageHeader/pageHeader.module.css'
import { useSMService } from '../../contexts/SMContext'
import { AgentCards } from '../../features/agent/components/AgentCards'
import { SmActions } from './SMActions'

const { Meta } = Card

const SMHeader = (): JSX.Element => {
  return <Card title={<SmStatusCard />} bodyStyle={{ display: 'none' }} extra={<SmActions />} />
}

const SMStatus = (): JSX.Element => {
  const [smContext, loading] = useSMService()
  const smLocation = smContext?.smLocation

  const [txtType, text]: [BaseType, string] = loading
    ? ['warning', 'Loading...']
    : smLocation?.metadata
    ? ['success', `Running on ${smLocation.metadata.agentPrefix || 'unknown'}`]
    : ['danger', 'Service down']

  return <Typography.Text type={txtType}>{text}</Typography.Text>
}

const SmStatusCard = (): JSX.Element => {
  return (
    <Space direction='vertical' size={3}>
      <Typography.Text className={styles.pageTitle}>Sequence Manager</Typography.Text>
      <Meta
        description={
          <Space>
            <Typography.Text type='secondary'>{' Status:'}</Typography.Text>
            <SMStatus />
          </Space>
        }
      />
    </Space>
  )
}

export const Infrastructure = (): JSX.Element => {
  return (
    <>
      <PageHeader title='Manage Infrastructure' />
      <SMHeader />
      <AgentCards />
    </>
  )
}
