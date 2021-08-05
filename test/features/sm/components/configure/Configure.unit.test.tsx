import { cleanup, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  ComponentId,
  ConfigureResponse,
  FailedResponse,
  ObsMode,
  ObsModesDetailsResponse,
  Prefix,
  SequenceManagerService
} from '@tmtsoftware/esw-ts'
import { expect } from 'chai'
import React from 'react'
import { anything, deepEqual, reset, verify, when } from 'ts-mockito'
import { Configure } from '../../../../../src/features/sm/components/Configure'
import { configureConstants } from '../../../../../src/features/sm/smConstants'
import { mockServices, renderWithAuth } from '../../../../utils/test-utils'

const obsModesDetails: ObsModesDetailsResponse = {
  _type: 'Success',
  obsModes: [
    {
      obsMode: new ObsMode('ESW_DARKNIGHT'),
      resources: ['ESW', 'TCS', 'WFOS'],
      status: {
        _type: 'Configurable'
      },
      sequencers: ['ESW', 'TCS', 'WFOS']
    },
    {
      obsMode: new ObsMode('ESW_CLEARSKY'),
      resources: [],
      status: {
        _type: 'Configured'
      },
      sequencers: []
    },
    {
      obsMode: new ObsMode('ESW_RANDOM'),
      resources: [],
      status: {
        _type: 'NonConfigurable',
        missingSequenceComponents: []
      },
      sequencers: []
    }
  ]
}

const smService: SequenceManagerService = mockServices.mock.smService

const darkNight = new ObsMode('ESW_DARKNIGHT')

const successResponse: ConfigureResponse = {
  _type: 'Success',
  masterSequencerComponentId: new ComponentId(Prefix.fromString('ESW.primary'), 'Sequencer')
}
const configurationMissingResponse: ConfigureResponse = {
  _type: 'ConfigurationMissing',
  obsMode: darkNight
}

const conflictingResourcesResponse: ConfigureResponse = {
  _type: 'ConflictingResourcesWithRunningObsMode',
  runningObsMode: [new ObsMode('ESW_CLEARSKY')]
}

const failedToStartSequencersResponse: ConfigureResponse = {
  _type: 'FailedToStartSequencers',
  reasons: ['sequence component not found']
}

const locationServiceError: ConfigureResponse = {
  _type: 'LocationServiceError',
  reason: 'LocationNotFound'
}
const sequenceComponentNotAvailable: ConfigureResponse = {
  _type: 'SequenceComponentNotAvailable',
  msg: 'Not Available',
  subsystems: ['IRIS']
}
const unhandled: ConfigureResponse = {
  _type: 'Unhandled',
  msg: 'Bad request',
  messageType: 'TransportError',
  state: ''
}
const failedResponse: FailedResponse = {
  _type: 'FailedResponse',
  reason: 'Configure message timed out'
}

describe('Configure button', () => {
  beforeEach(() => {
    reset(smService)
    when(smService.getObsModesDetails()).thenResolve(obsModesDetails)
  })
  afterEach(() => {
    cleanup()
  })
  it('should be disabled | ESW-445', async () => {
    renderWithAuth({
      ui: <Configure disabled={true} />
    })

    const button = await screen.findByRole('button', {
      name: configureConstants.modalOkText
    })
    userEvent.click(button)

    const dialog = screen.queryByRole('dialog', {
      name: configureConstants.modalTitle
    })
    // modal should not open on click of configure button
    expect(dialog).to.null
    verify(smService.getObsModesDetails()).called()
  })

  it('on click should show only configurable obsmodes in modal| ESW-445', async () => {
    renderWithAuth({
      ui: <Configure disabled={false} />
    })
    const button = await screen.findByRole('button', { name: configureConstants.modalOkText })
    userEvent.click(button)

    const dialog = await screen.findByRole('dialog', {
      name: configureConstants.modalTitle
    })

    await within(dialog).findByRole('menuitem', { name: 'ESW_DARKNIGHT' })
    expect(within(dialog).queryByRole('menuitem', { name: 'ESW_RANDOM' })).to.null
    expect(within(dialog).queryByRole('menuitem', { name: 'ESW_CLEARSKY' })).to.null

    await within(dialog).findByRole('button', { name: configureConstants.modalOkText })
    await within(dialog).findByRole('button', { name: 'Cancel' })

    verify(smService.getObsModesDetails()).called()
  })

  it('should configure obsmode successfully | ESW-445', async () => {
    when(smService.configure(anything())).thenResolve(successResponse)
    renderWithAuth({
      ui: <Configure disabled={false} />
    })

    await openConfigureModalAndClickConfigureButton()

    expect(await screen.findByText(configureConstants.getSuccessMessage('ESW_DARKNIGHT'))).to.exist

    expect(screen.queryByRole(configureConstants.getSuccessMessage('ESW_DARKNIGHT'))).to.null
    verify(smService.configure(deepEqual(darkNight))).called()
    verify(smService.getObsModesDetails()).called()
  })

  const failureMessage = configureConstants.getFailureMessage('ESW_DARKNIGHT')

  const testcases: Array<[ConfigureResponse, string]> = [
    [locationServiceError, `${failureMessage}, reason: LocationNotFound`],
    [
      conflictingResourcesResponse,
      `${failureMessage}, reason: ESW_DARKNIGHT is conflicting with currently running Observation Modes. Running ObsModes: ESW_CLEARSKY`
    ],
    [configurationMissingResponse, `${failureMessage}, reason: ConfigurationMissing for ESW_DARKNIGHT`],
    [
      failedToStartSequencersResponse,
      `${failureMessage}, reason: Failed to start Sequencers as sequence component not found`
    ],
    [sequenceComponentNotAvailable, `${failureMessage}, reason: Not Available`],
    [unhandled, `${failureMessage}, reason: Bad request`],
    [failedResponse, `${failureMessage}, reason: Configure message timed out`]
  ]

  testcases.map(([response, message]) => {
    it(`configure action should throw ${response._type.toLocaleLowerCase()} | ESW-445, ESW-507`, async () => {
      when(smService.configure(deepEqual(darkNight))).thenResolve(response)

      renderWithAuth({
        ui: <Configure disabled={false} />
      })
      await openConfigureModalAndClickConfigureButton()

      await screen.findByText(message)
      verify(smService.configure(deepEqual(darkNight))).called()
      verify(smService.getObsModesDetails()).called()
    })
  })
})

const openConfigureModalAndClickConfigureButton = async () => {
  const button = await screen.findByRole('button', { name: configureConstants.modalOkText })
  userEvent.click(button)
  const dialog = screen.getByRole('dialog', {
    name: configureConstants.modalTitle
  })

  const darkNightObsMode = await screen.findByRole('menuitem', {
    name: 'ESW_DARKNIGHT'
  })

  //select item by clicking on it
  userEvent.click(darkNightObsMode)
  const configureButton = within(dialog).getByRole('button', {
    name: configureConstants.modalOkText

    // wait for button to be enabled.
  }) as HTMLButtonElement
  await waitFor(() => {
    expect(configureButton.disabled).false
    userEvent.click(configureButton)
  })
}
