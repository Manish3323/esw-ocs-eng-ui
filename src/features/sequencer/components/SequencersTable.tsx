import { EditOutlined } from '@ant-design/icons'
import { ObsMode, Prefix, Subsystem } from '@tmtsoftware/esw-ts'
import { Space, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/lib/table/interface'
import type { BaseType } from 'antd/lib/typography/Base'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { HeaderTitle } from '../../../components/table/HeaderTitle'
import { sequencerPath } from '../../../routes/RoutesConfig'
import styles from '../../agent/components/agentCards.module.css'
import { SequencerInfo, useSequencersData } from '../hooks/useSequencersData'

const getPrefixColumn = (
  record: SequencerInfo,
  onEditHandle: (sequencerPrefix: string) => void
) => (
  <Space>
    <EditOutlined
      onClick={() => onEditHandle(record.prefix)}
      className={styles.commonIcon}
    />
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

const columns = (
  onEditHandle: (sequencerPrefix: string) => void
): ColumnsType<SequencerInfo> => [
  {
    title: <HeaderTitle title='Sequencers' />,
    dataIndex: 'prefix',
    width: '40%',
    render: (_, record) => getPrefixColumn(record, onEditHandle)
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
  const history = useHistory()

  const sortedSequencers: Prefix[] = sequencers.reduce(
    (acc: Prefix[], elem) => {
      const sequencer = new Prefix(elem, obsMode.name)
      if (elem === 'ESW') return [sequencer].concat(acc)
      return acc.concat(sequencer)
    },
    []
  )

  const sequencerStatus = useSequencersData(sortedSequencers)

  const onEditHandle = (sequencerPrefix: string) => {
    const prefix = Prefix.fromString(sequencerPrefix)
    history.push(sequencerPath(prefix, obsMode.name))
  }

  return (
    <>
      <Table
        rowKey={(record) => record.prefix}
        style={{ paddingBottom: '1.5rem' }}
        pagination={false}
        loading={sequencerStatus.isLoading || sequencerStatus.isError}
        columns={columns(onEditHandle)}
        dataSource={sequencerStatus.data}
        onRow={() => ({ style: { fontSize: '1rem' } })}
      />
    </>
  )
}
