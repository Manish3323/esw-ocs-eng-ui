import { render, RenderOptions, RenderResult } from '@testing-library/react'
import {
  AgentService,
  AuthContext,
  ConfigService,
  LocationService,
  SequenceManagerService
} from '@tmtsoftware/esw-ts'
import { AgentServiceImpl } from '@tmtsoftware/esw-ts/dist/src/clients/agent-service/AgentServiceImpl'
import type {
  KeycloakProfile,
  KeycloakPromise,
  KeycloakResourceAccess,
  KeycloakRoles,
  KeycloakTokenParsed
} from 'keycloak-js'
import React, { ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { instance, mock } from 'ts-mockito'
import { ServiceFactoryContextType, ServiceFactoryProvider } from '../../src/contexts/serviceFactoryContext/ServiceFactoryContext'

const getMockAuth = (loggedIn: boolean) => {
  let loggedInValue = loggedIn
  return {
    hasRealmRole: () => true,
    hasResourceRole: () => false,
    isAuthenticated: () => loggedInValue,
    logout: () => {
      loggedInValue = false
      return Promise.resolve() as KeycloakPromise<void, void>
    },
    token: () => 'token string',
    tokenParsed: () => ('token string' as unknown) as KeycloakTokenParsed,
    realmAccess: () => ([''] as unknown) as KeycloakRoles,
    resourceAccess: () => ([''] as unknown) as KeycloakResourceAccess,
    loadUserProfile: () =>
      Promise.resolve({
        username: loggedInValue ? 'ESW-USER' : ''
      }) as KeycloakPromise<KeycloakProfile, void>
  }
}

type Services = {
  agentService: AgentService
  locationService: LocationService
}

type MockServices = {
  serviceFactoryContext: ServiceFactoryContextType
  instance: Services
  mock: Services
}

const getMockServices: () => MockServices = () => {
  const agentServiceMock = mock(AgentServiceImpl)
  const agentServiceInstance = instance(agentServiceMock)
  //FIXME: TypeError: Cannot read property 'map' of null at Object.getAllAgentPrefix while running tests
  const locationServiceMock = mock<LocationService>()
  const locationServiceInstance = instance(locationServiceMock)

  const smServiceMock = mock<SequenceManagerService>()
  const smServiceInstance = instance(smServiceMock)

  const configServiceMock = mock<ConfigService>()
  const configServiceInstance = instance(configServiceMock)

  const serviceFactoryContext: ServiceFactoryContextType = {
    agentServiceFactory: () => Promise.resolve(agentServiceInstance),
    locationServiceFactory: () => locationServiceInstance,
    configServiceFactory: () => Promise.resolve(configServiceInstance),
    smServiceFactory: () => Promise.resolve(smServiceInstance)
  }

  return {
    serviceFactoryContext,
    mock: {
      agentService: agentServiceMock,
      locationService: locationServiceMock
    },
    instance: {
      agentService: agentServiceInstance,
      locationService: locationServiceInstance
    }
  }
}

const getContextProvider = (
  loggedIn: boolean,
  mockClients: ServiceFactoryContextType,
  loginFunc: () => void,
  logoutFunc: () => void
) => {
  const auth = getMockAuth(loggedIn)

  const contextProvider = ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider
      value={{
        auth: auth,
        login: loginFunc,
        logout: logoutFunc
      }}>
      <ServiceFactoryProvider value={mockClients}>
        {children}
      </ServiceFactoryProvider>
    </AuthContext.Provider>
  )

  return contextProvider
}

const getContextWithQueryClientProvider = (
  loggedIn: boolean,
  mockClients: ServiceFactoryContextType,
  loginFunc: () => void,
  logoutFunc: () => void
): React.FC<{ children: React.ReactNode }> => {
  const queryClient = new QueryClient()
  const ContextProvider = getContextProvider(
    loggedIn,
    mockClients,
    loginFunc,
    logoutFunc
  )

  const provider = ({ children }: { children: React.ReactNode }) => (
    <ContextProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ContextProvider>
  )
  return provider
}
interface MockProps {
  ui: ReactElement
  loggedIn?: boolean
  mockClients?: ServiceFactoryContextType
  loginFunc?: () => void
  logoutFunc?: () => void
}

const renderWithAuth = (
  {
    ui,
    loggedIn = true,
    mockClients = getMockServices().serviceFactoryContext,
    loginFunc = () => ({}),
    logoutFunc = () => ({})
  }: MockProps,
  options?: Omit<RenderOptions, 'queries'>
): RenderResult => {
  return render(ui, {
    wrapper: getContextWithQueryClientProvider(
      loggedIn,
      mockClients,
      loginFunc,
      logoutFunc
    ) as React.FunctionComponent<Record<string, unknown>>,
    ...options
  })
}
// eslint-disable-next-line import/export
export * from '@testing-library/react'
// eslint-disable-next-line import/export
export { renderWithAuth, getMockServices, getContextWithQueryClientProvider }
export type { MockServices }
