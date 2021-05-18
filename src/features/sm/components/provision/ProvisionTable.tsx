import { InputNumber, Table } from 'antd'
import type { ColumnsType } from 'antd/lib/table/interface'
import React from 'react'
import { HeaderTitle } from '../../../../components/table/HeaderTitle'
import styles from './provision.module.css'

type ProvisionProps = {
  provisionRecord: Record<string, number>
  setProvisionRecord: (value: Record<string, number>) => void
}

type ProvisionDataType = {
  key: string
  agentPrefix: string
  numOfSequenceComps: number
}

const columns = (
  func: (numOfSeqComp: number, record: ProvisionDataType) => void
): ColumnsType<ProvisionDataType> => [
  {
    title: <HeaderTitle title='Agent' />,
    width: 230,
    dataIndex: 'agentPrefix',
    key: 'agentPrefix',
    fixed: 'left'
  },
  {
    title: <HeaderTitle title='Number of Sequence Component' />,
    dataIndex: 'numOfSequenceComps',
    key: 'numOfSequenceComps',
    fixed: 'left',
    sorter: (f, s) => f.numOfSequenceComps - s.numOfSequenceComps,
    // eslint-disable-next-line react/display-name
    render: (value: number, record) => (
      <InputNumber
        min={0}
        max={5}
        defaultValue={value}
        onChange={(value: string | number | null | undefined) =>
          func(value ? Number(value) : 0, record)
        }
      />
    )
  }
]

const createColumnData = (provisionRecord: Record<string, number>) =>
  Object.entries(provisionRecord).map(([prefixStr, num], index) => {
    return {
      key: index.toString(),
      agentPrefix: prefixStr,
      numOfSequenceComps: num
    }
  })

export const ProvisionTable = ({
  provisionRecord,
  setProvisionRecord
}: ProvisionProps): JSX.Element => {
  const data = createColumnData(provisionRecord)

  return (
    <Table
      pagination={false}
      columns={columns((numOfSeqComp, record) => {
        provisionRecord[record.agentPrefix] = numOfSeqComp
        record.numOfSequenceComps = numOfSeqComp
        setProvisionRecord(provisionRecord)
      })}
      dataSource={data}
      onHeaderRow={() => ({ className: styles.header })}
      onRow={() => ({ className: styles.cell })}
    />
  )
}
