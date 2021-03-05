import userEvent from '@testing-library/user-event'
import { expect } from 'chai'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { when } from 'ts-mockito'
import App from '../../src/containers/app/App'
import { ServiceFactoryContextType } from '../../src/contexts/ServiceFactoryContext'
import {
  HOME,
  INFRASTRUCTURE,
  OBSERVATIONS,
  RESOURCES
} from '../../src/routes/RoutesConfig'
import {
  getMockServices,
  cleanup,
  renderWithAuth,
  screen
} from '../utils/test-utils'

const renderWithRouter = (ui: React.ReactElement) => {
  window.history.pushState({}, 'Home page', HOME)
  // Mocking locationService.listByComponentType, 
  // because on Home page a call happens on render to get list of agents
  const mockServices = getMockServices()
  when(
    mockServices.mock.locationService.listByComponentType('Machine')
  ).thenResolve([])

  return renderWithAuth({
    ui: <BrowserRouter>{ui}</BrowserRouter>,
    mockClients: mockServices.serviceFactoryContext
  })
}

const leftClick = { button: 0 }
describe('Full app navigation', () => {
  afterEach(() => {
    cleanup()
  })

  it('Infrastructure route | ESW-441', () => {
    renderWithRouter(<App />)

    const manageInfra = screen.getByRole('ManageInfrastructure')
    expect(manageInfra).to.exist

    userEvent.click(manageInfra, leftClick)
    expect(window.location.pathname).equal(INFRASTRUCTURE)
  })

  it('Observations route | ESW-441', () => {
    renderWithRouter(<App />)

    const manageObservations = screen.getByRole('ManageObservations')
    expect(manageObservations).to.exist

    userEvent.click(manageObservations, leftClick)
    expect(window.location.pathname).equal(OBSERVATIONS)
  })

  it('Resources | ESW-441', () => {
    renderWithRouter(<App />)

    const resources = screen.getAllByRole('Resources')
    expect(resources).to.have.length(2)

    userEvent.click(resources[0], leftClick)
    expect(window.location.pathname).equal(RESOURCES)
  })
})
