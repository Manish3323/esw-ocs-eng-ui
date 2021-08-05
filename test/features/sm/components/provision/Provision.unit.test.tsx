import { screen, waitFor } from '@testing-library/react'
import { expect } from 'chai'
import React from 'react'
import { Provision } from '../../../../../src/features/sm/components/provision/Provision'
import { provisionConstants, unProvisionConstants } from '../../../../../src/features/sm/smConstants'
import { renderWithAuth } from '../../../../utils/test-utils'

describe('Provision Component', () => {
  it(`should render Unprovision button if there is no sequence component running | ESW-444`, async () => {
    renderWithAuth({
      ui: <Provision provisionStatus={true} />
    })
    await screen.findByRole('button', { name: unProvisionConstants.buttonText })
    const provisionButton = screen.queryByRole('button', { name: provisionConstants.buttonText })
    await waitFor(() => expect(provisionButton).to.null)
  })

  it('should render Provision button | ESW-444', async () => {
    renderWithAuth({
      ui: <Provision provisionStatus={false} />
    })

    await screen.findByRole('button', { name: provisionConstants.buttonText })

    const unProvisionButton = screen.queryByRole('button', {
      name: unProvisionConstants.buttonText
    })
    await waitFor(() => expect(unProvisionButton).to.null)
  })
})
