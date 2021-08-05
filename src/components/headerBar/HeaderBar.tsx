import { DownOutlined, LogoutOutlined } from '@ant-design/icons'
import { Button, Dropdown, Menu } from 'antd'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { HOME } from '../../routes/RoutesConfig'
import { getUsername } from '../../utils/getUsername'
import styles from './headerBar.module.css'

export const HeaderBar = (): JSX.Element => {
  const { auth, logout } = useAuth()
  const [username, setUsername] = useState<string | undefined>(undefined)

  useEffect(() => {
    setUsername(getUsername(auth))
  }, [auth])

  const menu = (
    <Menu>
      <Menu.Item key='1' danger icon={<LogoutOutlined />} onClick={logout}>
        Logout
      </Menu.Item>
    </Menu>
  )

  const Logout = () => (
    <Dropdown trigger={['click']} overlay={menu}>
      {username ? (
        <Button type='text'>
          {username.toUpperCase()}
          <DownOutlined />
        </Button>
      ) : (
        <></>
      )}
    </Dropdown>
  )

  return (
    <>
      <Link to={HOME}>
        <img role='tmt_logo' src={'TMT_Logo.png'} className={styles.logo} />
      </Link>
      <Logout />
    </>
  )
}
