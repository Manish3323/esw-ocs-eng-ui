import { cleanup, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect } from 'chai'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { instance, mock, verify } from 'ts-mockito'
import { HeaderBar } from '../../../src/components/headerBar/HeaderBar'
import { HOME } from '../../../src/routes/RoutesConfig'
import { renderWithAuth } from '../../utils/test-utils'

const leftClick = { button: 0 }
describe('header bar', () => {
  afterEach(() => cleanup())
  it('renders with logout button & logo when user is logged in | ESW-441', async () => {
    renderWithAuth({
      ui: (
        <BrowserRouter>
          <HeaderBar />
        </BrowserRouter>
      ),
      loggedIn: true
    })

    const logo = screen.getByRole('tmt_logo')
    expect(logo).to.exist

    //should be able to click on logo
    userEvent.click(logo, leftClick)
    expect(window.location.pathname).to.equal(HOME)

    const logoutButton = await screen.findByText('ESW-USER')
    expect(logoutButton).to.exist
  })

  it('open logout modal on click of username button when user is logged in | ESW-441', async () => {
    const mockAuthFunctions = mock<{ logout: () => void }>()
    const authFunctionsInstance = instance(mockAuthFunctions)
    renderWithAuth({
      ui: (
        <BrowserRouter>
          <HeaderBar />
        </BrowserRouter>
      ),
      loggedIn: true,
      logoutFunc: () => authFunctionsInstance.logout()
    })

    const logoutButton = await screen.findByText('ESW-USER')
    userEvent.click(logoutButton, leftClick)
    // wait for dropdown to appear
    const logoutMenuItem = await screen.findByRole('menuitem')
    await waitFor(() => userEvent.click(logoutMenuItem))

    //verify that the logout function passed by auth context is called on click of logout button of modal
    verify(mockAuthFunctions.logout()).called()
  })
})
