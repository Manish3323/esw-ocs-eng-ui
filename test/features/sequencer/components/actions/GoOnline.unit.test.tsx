import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GoOnlineResponse, Prefix } from '@tmtsoftware/esw-ts'
import { expect } from 'chai'
import React from 'react'
import { verify, when } from 'ts-mockito'
import { GoOnline } from '../../../../../src/features/sequencer/components/actions/GoOnline'
import { goOnlineConstants } from '../../../../../src/features/sequencer/sequencerConstants'
import { renderWithAuth, sequencerServiceMock } from '../../../../utils/test-utils'

describe('GoOnline', () => {
  const testData: [GoOnlineResponse, string, string][] = [
    [{ _type: 'Ok' }, goOnlineConstants.successMessage, 'successful'],
    [{ _type: 'GoOnlineHookFailed' }, `${goOnlineConstants.failureMessage}, reason: GoOnlineHookFailed`, 'failed'],
    [
      {
        _type: 'Unhandled',
        msg: 'GoOnline message is not handled in InProgress state',
        messageType: 'GoOnline',
        state: 'InProgress'
      },
      `${goOnlineConstants.failureMessage}, reason: GoOnline message is not handled in InProgress state`,
      'failed'
    ]
  ]

  testData.forEach(([res, msg, state]) => {
    it(`should be ${state} if sequencer response is ${res._type}| ESW-493`, async () => {
      when(sequencerServiceMock.goOnline()).thenResolve(res)

      renderWithAuth({
        ui: <GoOnline prefix={new Prefix('ESW', 'darknight')} sequencerState={'Idle'} />
      })

      const onlineButton = await screen.findByRole('button', {
        name: goOnlineConstants.buttonText
      })

      userEvent.click(onlineButton, { button: 0 })

      await screen.findByText(msg)

      verify(sequencerServiceMock.goOnline()).called()
    })
  })

  it(`should be failed if goOnline call fails | ESW-493`, async () => {
    when(sequencerServiceMock.goOnline()).thenReject(Error('error occurred'))

    renderWithAuth({
      ui: <GoOnline prefix={new Prefix('ESW', 'darknight')} sequencerState={'Idle'} />
    })

    const onlineButton = await screen.findByRole('button', {
      name: goOnlineConstants.buttonText
    })

    userEvent.click(onlineButton, { button: 0 })

    await screen.findByText(`${goOnlineConstants.failureMessage}, reason: error occurred`)

    verify(sequencerServiceMock.goOnline()).called()
  })

  it(`should be disabled if sequencer is running | ESW-493`, async () => {
    renderWithAuth({
      ui: <GoOnline prefix={new Prefix('ESW', 'darknight')} sequencerState={'Running'} />
    })

    const onlineButton = (await screen.findByRole('button', {
      name: goOnlineConstants.buttonText
    })) as HTMLButtonElement

    expect(onlineButton.disabled).true
  })
})
