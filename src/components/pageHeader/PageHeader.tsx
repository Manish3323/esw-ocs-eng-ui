import { PageHeader as AntPageHeader, PageHeaderProps } from 'antd'
import React, { ReactNode } from 'react'
import styles from './pageHeader.module.css'

export const PageHeader = ({ title, ...props }: PageHeaderProps & { children?: ReactNode }): JSX.Element => {
  return (
    <AntPageHeader className={styles.pageHeader} title={title} {...props}>
      {props.children}
    </AntPageHeader>
  )
}
