import { LoadingOutlined } from '@ant-design/icons'
import { LocationService } from '@tmtsoftware/esw-ts'
import { Layout, Result } from 'antd'
import 'antd/dist/antd.css'
import React from 'react'
import { useQuery } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { BrowserRouter as Router } from 'react-router-dom'
import { HeaderBar } from '../../components/headerBar/HeaderBar'
import { GlobalSpinner } from '../../components/spinners/globalSpinner/GlobalSpinner'
import { AppConfig } from '../../config/AppConfig'
import { CombinedServiceContext } from '../../contexts/CombinedServiceContext'
import { LOCATION_SERVICE } from '../../features/queryKeys'
import { useAuth } from '../../hooks/useAuth'
import { Routes } from '../../routes'
import { getUsername } from '../../utils/getUsername'
import styles from './app.module.css'
import { Container } from './Container'

const { Header } = Layout

const ROUTER_BASENAME = import.meta.env.NODE_ENV === 'production' ? `/${AppConfig.applicationName}` : ''

const useLocationServiceQuery = () => {
  const { auth } = useAuth()
  return useQuery(LOCATION_SERVICE.key, () => LocationService({ username: getUsername(auth) }))
}

export const App = (): JSX.Element => {
  const { data: locationService, isLoading, isError } = useLocationServiceQuery()
  const { auth } = useAuth()

  if (isError) return <Result status='error' title='Location service not found!' />

  if (!auth || isLoading || !locationService) return <Result icon={<LoadingOutlined />} />

  return (
    <>
      <CombinedServiceContext locationService={locationService}>
        <Router basename={ROUTER_BASENAME}>
          <Layout className={styles.app}>
            <Header className={styles.tmtHeader}>
              <HeaderBar />
            </Header>
            <Container>
              <Routes loggedIn={auth.isAuthenticated() ?? false} />
            </Container>
          </Layout>
        </Router>
      </CombinedServiceContext>
      <GlobalSpinner />
      <ReactQueryDevtools initialIsOpen={false} position='bottom-right' />
    </>
  )
}
