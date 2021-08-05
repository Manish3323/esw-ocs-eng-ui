import { CloseOutlined, SettingOutlined } from '@ant-design/icons'
import { Prefix } from '@tmtsoftware/esw-ts'
import { Button, Space, Table, Tooltip, Typography } from 'antd'
import type { ColumnsType } from 'antd/lib/table/interface'
import type { BaseType } from 'antd/lib/typography/Base'
import React from 'react'
import { Link } from 'react-router-dom'
import { HeaderTitle } from '../../../components/table/HeaderTitle'
import { getSequencerPath } from '../../../routes/RoutesConfig'
import { SmSequencerAction } from '../../sm/components/sequencer/SmSequencerAction'
import type { SequencerInfo, StepListInfo } from '../utils'
import styles from './sequencerTable.module.css'

const Settings = ({ prefix, disabled }: { prefix: string; disabled: boolean }): JSX.Element => {
  const icon = (
    <Button
      type={'text'}
      shape={'circle'}
      icon={<SettingOutlined className={disabled ? styles.actionDisabled : styles.actionEnabled} />}
      disabled={disabled}
      role='ManageSequencer'
    />
  )
  return (
    <Tooltip title={'Manage sequencer'}>{disabled ? icon : <Link to={getSequencerPath(prefix)}>{icon}</Link>}</Tooltip>
  )
}

const getPrefixColumn = (record: SequencerInfo) => {
  return (
    <Space>
      <Settings prefix={record.prefix} disabled={record.sequencerState === undefined} />
      <Typography.Text>{record.prefix}</Typography.Text>
      {!record.sequencerState ? (
        <Tooltip title={'Sequencer is not running'}>
          <CloseOutlined style={{ color: 'var(--dangerColor)' }} />
        </Tooltip>
      ) : (
        <></>
      )}
    </Space>
  )
}

export const statusTextType: { [stepStatus: string]: BaseType } = {
  'All Steps Completed': 'secondary',
  'In Progress': 'success',
  Paused: 'warning',
  Loaded: 'warning',
  Failed: 'danger',
  'Failed to Fetch Status': 'danger'
}

const getStepColumn = (stepListInfo: StepListInfo) => (
  <Typography.Text type={statusTextType[stepListInfo.status]}>
    {stepListInfo.currentStepNumber
      ? `Step ${stepListInfo.currentStepNumber} ${stepListInfo.status}`
      : stepListInfo.status}
  </Typography.Text>
)

const getSmSequencerAction = (_: string, record: SequencerInfo) => (
  <SmSequencerAction
    sequencerPrefix={Prefix.fromString(record.prefix)}
    masterSequencerState={record.masterSequencerState}
    sequencerState={record.sequencerState}
  />
)

const columns: ColumnsType<SequencerInfo> = [
  {
    title: <HeaderTitle title='Sequencers' />,
    dataIndex: 'prefix',
    render: (_, record) => getPrefixColumn(record)
  },
  {
    title: <HeaderTitle title='Current Step' />,
    dataIndex: 'currentStepCommandName'
  },
  {
    title: <HeaderTitle title='Sequence Status' />,
    dataIndex: 'stepListInfo',
    key: 'status',
    render: (value) => getStepColumn(value)
  },
  {
    title: <HeaderTitle title='Total Steps' />,
    dataIndex: 'totalSteps',
    key: 'totalSteps',
    render: (totalSteps) => (totalSteps === 0 ? 'NA' : totalSteps)
  },
  {
    title: <HeaderTitle title='Action' />,
    dataIndex: 'action',
    key: 'action',
    render: getSmSequencerAction
  }
]

type ObsModeSeqTableProps = {
  sequencersInfo: SequencerInfo[]
  loading: boolean
}

export const SequencersTable = ({ sequencersInfo, loading }: ObsModeSeqTableProps): JSX.Element => (
  <Table
    rowKey={(record) => record.prefix}
    style={{ paddingBottom: '1.5rem' }}
    pagination={false}
    loading={loading}
    columns={columns}
    dataSource={sequencersInfo}
    onRow={() => ({ style: { fontSize: '1rem' } })}
    bordered
  />
)
