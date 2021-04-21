import { LoadingOutlined } from '@ant-design/icons'
import { Result } from 'antd'
import React, { useEffect } from 'react'
import { Route, Switch } from 'react-router-dom'
import { Home } from '../containers/home/Home'
import { Infrastructure } from '../containers/infrastructure/Infrastructure'
import { Observations } from '../containers/observation/Observations'
import { Resources } from '../containers/resources/Resources'
import { ManageSequencer } from '../containers/sequencer/ManageSequencer'
import { useAuth } from '../hooks/useAuth'
import { NoMatch } from './NoMatch'
import {
  SEQUENCER,
  HOME,
  INFRASTRUCTURE,
  NO_MATCH,
  OBSERVATIONS,
  RESOURCES
} from './RoutesConfig'

const RedirectToLogin = ({ login }: { login: () => void }) => {
  useEffect(() => {
    login()
  }, [login])

  return <Result icon={<LoadingOutlined />} />
}

export const Routes = (): JSX.Element => {
  const { login, auth } = useAuth()

  // TODO is this required? It is already handled in main app.
  if (auth === null) return <Result icon={<LoadingOutlined />} />

  return auth.isAuthenticated() ? (
    <Switch>
      <Route exact path={HOME} component={Home} />
      <Route path={INFRASTRUCTURE} component={Infrastructure} />
      <Route path={OBSERVATIONS} component={Observations} />
      <Route path={RESOURCES} component={Resources} />
      <Route exact path={SEQUENCER} component={ManageSequencer} />
      <Route path={NO_MATCH} component={NoMatch} />
    </Switch>
  ) : (
    <RedirectToLogin login={login} />
  )
}
