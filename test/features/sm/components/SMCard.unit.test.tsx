import { screen, waitFor } from '@testing-library/react'
import { HttpLocation, SEQUENCE_MANAGER_CONNECTION } from '@tmtsoftware/esw-ts'
import { expect } from 'chai'
import React from 'react'
import { when } from 'ts-mockito'
import { SMServiceProvider } from '../../../../src/contexts/SMContext'
import { SMCard } from '../../../../src/features/sm/components/smcard/SMCard'
import { shutdownSMConstants } from '../../../../src/features/sm/smConstants'
import { mockServices, renderWithAuth } from '../../../utils/test-utils'

describe('SMCard', () => {
  const locServiceMock = mockServices.mock.locationService
  when(locServiceMock.track(SEQUENCE_MANAGER_CONNECTION)).thenReturn(() => ({
    cancel: () => ({})
  }))
  when(locServiceMock.listByComponentType('Machine')).thenResolve([])

  it('should show Spawn button if Sequence Manager is not spawned | ESW-441', async () => {
    renderWithAuth({
      ui: (
        <SMServiceProvider initialValue={[undefined, false]}>
          <SMCard />
        </SMServiceProvider>
      )
    })

    await waitFor(() => expect(screen.queryByRole('button', { name: shutdownSMConstants.modalOkText })).to.null)

    await screen.findByRole('button', { name: 'Spawn' })
  })

  it('should show Shutdown button if Sequence Manager is already spawned | ESW-441', async () => {
    const smLocation: HttpLocation = {
      _type: 'HttpLocation',
      connection: SEQUENCE_MANAGER_CONNECTION,
      uri: 'url',
      metadata: {}
    }

    renderWithAuth({
      ui: (
        <SMServiceProvider initialValue={[{ smService: mockServices.instance.smService, smLocation }, false]}>
          <SMCard />
        </SMServiceProvider>
      )
    })

    await waitFor(() => expect(screen.queryByRole('button', { name: 'Spawn' })).to.null)

    await screen.findByRole('button', { name: shutdownSMConstants.modalOkText })
  })
})
