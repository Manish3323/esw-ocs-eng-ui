import { Empty, Menu, Modal, ModalProps, Typography } from 'antd'
import type { SelectInfo } from 'rc-menu/lib/interface'
import React from 'react'
import styles from './selectionModal.module.css'

interface SelectionModalProps extends ModalProps {
  selectedItem: string
  data: string[] | undefined
  onChange: (value: string) => void
}

const getList = (selectedItem: string, data: string[] | undefined, onChange: (value: string) => void) => {
  const onSelect = (e: SelectInfo) => onChange(e.key)
  if (data === undefined || data.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }
  return (
    <Menu selectable onSelect={onSelect} selectedKeys={[selectedItem]} className={styles.menu}>
      {data.map((item) => {
        return (
          <Menu.Item
            className={styles.menuItem + ` ${item === selectedItem ? styles.selectedItem : ''}`}
            style={{ paddingLeft: '1.5rem', marginTop: 0, marginBottom: 0 }}
            key={item}>
            {item}
          </Menu.Item>
        )
      })}
    </Menu>
  )
}
export const SelectionModal = ({
  selectedItem,
  data,
  title,
  okText,
  visible,
  confirmLoading,
  onOk,
  onCancel,
  onChange
}: SelectionModalProps): JSX.Element => (
  <Modal
    title={
      <Typography.Title level={5} style={{ marginBottom: 0 }}>
        {title}
      </Typography.Title>
    }
    okText={okText}
    centered
    visible={visible}
    confirmLoading={confirmLoading}
    bodyStyle={{ padding: 0 }}
    okButtonProps={{
      disabled: !selectedItem || !data || data.length === 0
    }}
    onOk={onOk}
    onCancel={onCancel}>
    {getList(selectedItem, data, onChange)}
  </Modal>
)
