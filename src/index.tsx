import { AuthContextProvider, setAppName } from '@tmtsoftware/esw-ts'
import React from 'react'
import { render } from 'react-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { AppConfig } from './config/AppConfig'
import { App } from './containers/app/App'
import './index.module.css'

setAppName(AppConfig.applicationName)
const queryClient = new QueryClient()

render(
  <React.StrictMode>
    <AuthContextProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AuthContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
