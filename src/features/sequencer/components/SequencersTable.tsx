import { SettingOutlined } from '@ant-design/icons'
import { ObsMode, Prefix, Subsystem } from '@tmtsoftware/esw-ts'
import { Space, Table, Tooltip, Typography } from 'antd'
import { Link } from 'react-router-dom'
import React from 'react'
import { HeaderTitle } from '../../../components/table/HeaderTitle'
import { getSequencerPath } from '../../../routes/RoutesConfig'
import { SequencerInfo, useSequencersData } from '../hooks/useSequencersData'
import styles from './sequencerTable.module.css'
import type { ColumnsType } from 'antd/lib/table/interface'
import type { BaseType } from 'antd/lib/typography/Base'

const getPrefixColumn = (record: SequencerInfo) => (
  <Space>
    <Tooltip title={'Manage sequencer'}>
      <Link to={getSequencerPath(record.prefix)}>
        <SettingOutlined className={styles.sequencerIcon} />
      </Link>
    </Tooltip>
    <Typography.Text>{record.prefix}</Typography.Text>
  </Space>
)

export const typeStatus: { [stepStatus: string]: BaseType } = {
  'All Steps Completed': 'secondary',
  'In Progress': 'success',
  Paused: 'warning',
  Failed: 'danger',
  'Failed to Fetch Status': 'danger'
}

const getStepColumn = (status: SequencerInfo['stepListStatus']) => (
  <Typography.Text type={typeStatus[status.status]}>
    {status.stepNumber
      ? `Step ${status.stepNumber} ${status.status}`
      : status.status}
  </Typography.Text>
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
    dataIndex: 'stepListStatus',
    key: 'status',
    render: (value) => getStepColumn(value)
  },
  {
    title: <HeaderTitle title='Total Steps' />,
    dataIndex: 'totalSteps',
    key: 'totalSteps'
  }
]

type ObsModeSeqTableProps = {
  obsMode: ObsMode
  sequencers: Subsystem[]
}

export const SequencersTable = ({
  obsMode,
  sequencers
}: ObsModeSeqTableProps): JSX.Element => {
  const sortedSequencers: Prefix[] = sequencers.reduce(
    (acc: Prefix[], elem) => {
      const sequencer = new Prefix(elem, obsMode.name)
      if (elem === 'ESW') return [sequencer].concat(acc)
      return acc.concat(sequencer)
    },
    []
  )

  const sequencerStatus = useSequencersData(sortedSequencers)

  return (
    <Table
      rowKey={(record) => record.prefix}
      style={{ paddingBottom: '1.5rem' }}
      pagination={false}
      loading={sequencerStatus.isLoading || sequencerStatus.isError}
      columns={columns}
      dataSource={sequencerStatus.data}
      onRow={() => ({ style: { fontSize: '1rem' } })}
      bordered
    />
  )
}
