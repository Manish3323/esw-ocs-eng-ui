import type { ResourceStatus } from '@tmtsoftware/esw-ts'
import { Table } from 'antd'
import React from 'react'
import { HeaderTitle } from '../../../components/table/HeaderTitle'
import { resourceStatusCol } from '../../../containers/resources/Resources'

export type ResourceTableStatus = {
  key: string
  status: ResourceStatus['_type']
}

type ResourcesTableProps = {
  resources: ResourceTableStatus[]
}

const columns = [
  {
    title: <HeaderTitle title='Resource Required' />,
    dataIndex: 'key',
    width: '40%'
  },
  {
    title: <HeaderTitle title='Status' />,
    dataIndex: 'status',
    render: (status: ResourceStatus['_type']) => resourceStatusCol(status)
  }
]

export const ResourcesTable = ({ resources }: ResourcesTableProps): JSX.Element => {
  return (
    <Table
      style={{ marginBottom: '1rem' }}
      onRow={() => ({ style: { fontSize: '1rem' } })}
      pagination={false}
      columns={columns}
      dataSource={resources}
      bordered
    />
  )
}
