import { screen } from '@testing-library/react'
import { HttpConnection, Prefix, StepList } from '@tmtsoftware/esw-ts'
import { expect } from 'chai'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { anything, when } from 'ts-mockito'
import { ManageSequencer } from '../../../src/containers/sequencer/ManageSequencer'
import { sequencerDetailsConstants } from '../../../src/features/sequencer/sequencerConstants'
import { getSequencerPath } from '../../../src/routes/RoutesConfig'
import { mockServices, renderWithAuth, sequencerServiceMock } from '../../utils/test-utils'

describe('SequencerInfo ', () => {
  beforeEach(() => {
    when(sequencerServiceMock.subscribeSequencerState()).thenReturn((onevent) => {
      onevent({
        _type: 'SequencerStateResponse',
        sequencerState: { _type: 'Idle' },
        stepList: new StepList([])
      })
      return { cancel: () => undefined }
    })
  })
  const renderWithRouter = (ui: React.ReactElement, prefix: string) => {
    window.history.pushState({}, 'Home page', getSequencerPath(prefix))
    return renderWithAuth({
      ui: <BrowserRouter>{ui}</BrowserRouter>
    })
  }
  it('should render sequencer details for sequencer | ESW-492, ESW-489', async () => {
    const prefix = 'ESW.iris_DarkNight'

    when(mockServices.mock.locationService.find(anything())).thenResolve({
      _type: 'HttpLocation',
      connection: HttpConnection(Prefix.fromString(prefix), 'Sequencer'),
      metadata: {},
      uri: ''
    })

    renderWithRouter(<ManageSequencer />, prefix)

    await screen.findByText(prefix)
  })

  const errorCases: [string, string, string][] = [
    ['ESW.iris', sequencerDetailsConstants.getSequencerNotFoundMessage('ESW.iris'), '404'],
    ['ESW.IRIS-a', "Requirement failed - component name IRIS-a has '-'", 'Invalid sequencer prefix'],
    ['PSW.iris_darkNight', 'Subsystem: PSW is invalid', 'Invalid sequencer prefix']
  ]

  errorCases.forEach(([prefix, subtitle, title]) => {
    it(`should render ${subtitle} if ${title} | ESW-492, ESW-489`, async () => {
      when(mockServices.mock.locationService.find(anything())).thenResolve(undefined)

      renderWithRouter(<ManageSequencer />, prefix)

      await screen.findByText(subtitle)
      expect(screen.getByText(title)).to.exist
    })
  })

  it(`should render Invalid sequencer prefix if prefix is not present | ESW-492, ESW-489`, async () => {
    window.history.pushState({}, 'Home page', '/sequencer?prefix=')
    when(mockServices.mock.locationService.find(anything())).thenResolve(undefined)

    renderWithAuth({
      ui: (
        <BrowserRouter>
          <ManageSequencer />
        </BrowserRouter>
      )
    })

    await screen.findByText('Sequencer prefix not present')
    expect(screen.getByText('Invalid sequencer prefix')).to.exist
  })
})
