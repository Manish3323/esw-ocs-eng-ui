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
import { HOME, INFRASTRUCTURE, NO_MATCH, OBSERVATIONS, RESOURCES, SEQUENCER_PATH } from './RoutesConfig'

const RedirectToLogin = () => {
  const { login } = useAuth()

  useEffect(login, [login])

  return <Result icon={<LoadingOutlined />} />
}

export const Routes = ({ loggedIn }: { loggedIn: boolean }): JSX.Element => {
  return loggedIn ? (
    <Switch>
      <Route exact path={HOME} component={Home} />
      <Route path={INFRASTRUCTURE} component={Infrastructure} />
      <Route path={OBSERVATIONS} component={Observations} />
      <Route path={RESOURCES} component={Resources} />
      <Route path={SEQUENCER_PATH} component={ManageSequencer} />
      <Route path={NO_MATCH} component={NoMatch} />
    </Switch>
  ) : (
    <RedirectToLogin />
  )
}
