import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgentProvisionConfig, ConfigData, FailedResponse, Prefix, ProvisionConfig } from '@tmtsoftware/esw-ts'
import type { ProvisionResponse } from '@tmtsoftware/esw-ts'
import { expect } from 'chai'
import React from 'react'
import { anything, deepEqual, resetCalls, verify, when } from 'ts-mockito'
import { ProvisionButton } from '../../../../../src/features/sm/components/provision/ProvisionButton'
import { PROVISION_CONF_PATH } from '../../../../../src/features/sm/constants'
import { provisionConfConstants, provisionConstants } from '../../../../../src/features/sm/smConstants'
import { mockServices, renderWithAuth } from '../../../../../test/utils/test-utils'

describe('ProvisionButton component', () => {
  const provisionRes: ProvisionResponse = {
    _type: 'Success'
  }

  const eswPrefixStr = 'ESW.machine1'
  const tcsPrefixStr = 'TCS.machine1'

  const confData: Record<string, number> = {
    [eswPrefixStr]: 2,
    [tcsPrefixStr]: 2
  }

  const provisionConfig = new ProvisionConfig(
    Object.entries(confData).map(([pStr, num]) => {
      return new AgentProvisionConfig(Prefix.fromString(pStr), num)
    })
  )

  const locServiceMock = mockServices.mock.locationService

  beforeEach(() => resetCalls(mockServices.mock.smService))

  when(locServiceMock.track(anything())).thenReturn(() => {
    return { cancel: () => ({}) }
  })
  it('should be able to successfully provision | ESW-444', async () => {
    const smService = mockServices.mock.smService
    const configService = mockServices.mock.configService

    when(configService.getActive(PROVISION_CONF_PATH)).thenResolve(ConfigData.fromString(JSON.stringify(confData)))

    when(smService.provision(deepEqual(provisionConfig))).thenResolve(provisionRes)

    const { provisionButton } = await renderAndFindProvision()

    //User clicks provision button
    userEvent.click(provisionButton)

    //Provision config modal will appear with provision button
    await assertDialog()

    verify(configService.getActive(PROVISION_CONF_PATH)).called()

    const document = screen.getByRole('document')
    const confirmButton = within(document).getByRole('button', {
      name: provisionConstants.modalOkText
    })

    userEvent.click(confirmButton)
    await screen.findByText(provisionConstants.successMessage)

    verify(smService.provision(deepEqual(provisionConfig))).called()
  })

  it('should log if fetching provision config call failed | ESW-444', async () => {
    const smService = mockServices.mock.smService
    const configService = mockServices.mock.configService

    when(configService.getActive(PROVISION_CONF_PATH)).thenReject(Error('error occurred'))

    const { provisionButton } = await renderAndFindProvision()

    //User clicks provision button
    userEvent.click(provisionButton)

    //Provision config modal will not appear
    await waitFor(
      () =>
        expect(
          screen.queryByRole('dialog', {
            name: 'Provision Config'
          })
        ).to.null
    )

    verify(configService.getActive(PROVISION_CONF_PATH)).called()
    await screen.findByText(`${provisionConfConstants.fetchFailureMessage}, reason: error occurred`)

    verify(smService.provision(anything())).never()
  })

  const provisionConfTestData: [string, string, string][] = [
    [
      'esw.esw-machine',
      `${provisionConfConstants.fetchFailureMessage}, reason: Requirement failed - component name esw-machine has '-'`,
      'prefix(esw.esw-machine)'
    ],
    [
      'esw.esw_machine ',
      `${provisionConfConstants.fetchFailureMessage}, reason: Requirement failed - component name esw_machine has leading/trailing whitespace`,
      'prefix(esw.esw_machine)'
    ],
    [
      'rms.esw_machine',
      `${provisionConfConstants.fetchFailureMessage}, reason: Subsystem: rms is invalid`,
      'subsystem(rms)'
    ]
  ]

  provisionConfTestData.forEach(([agentPrefix, errMsg, statement]) => {
    it(`should log error if provision config agent field is not a valid ${statement} | ESW-444`, async () => {
      const smService = mockServices.mock.smService

      const configService = mockServices.mock.configService

      when(configService.getActive(PROVISION_CONF_PATH)).thenResolve(
        ConfigData.fromString(
          JSON.stringify({
            [agentPrefix]: 2
          })
        )
      )
      when(smService.provision(deepEqual(provisionConfig))).thenResolve(provisionRes)

      const { provisionButton } = await renderAndFindProvision()

      //User clicks provision button
      userEvent.click(provisionButton)

      //Provision config modal will not appear
      await waitFor(
        () =>
          expect(
            screen.queryByRole('dialog', {
              name: 'Provision config'
            })
          ).to.null
      )

      verify(configService.getActive(PROVISION_CONF_PATH)).called()
      await screen.findByText(errMsg)

      verify(smService.provision(anything())).never()
    })
  })

  const unhandled: ProvisionResponse = {
    _type: 'Unhandled',
    state: 'Processing',
    messageType: 'Provision',
    msg: 'Provision message type is not supported in Processing state'
  }

  const locServiceError: ProvisionResponse = {
    _type: 'LocationServiceError',
    reason: 'ESW.sequence_manager is not found'
  }

  const spawnSeqCompError: ProvisionResponse = {
    _type: 'SpawningSequenceComponentsFailed',
    failureResponses: ['failed to spawn: ESW.ESW_1 on ESW.machine, reason: invalid binary']
  }

  const couldNotFindMachine: ProvisionResponse = {
    _type: 'CouldNotFindMachines',
    prefix: [Prefix.fromString('esw.esw_machine')]
  }

  const failedResponse: FailedResponse = {
    _type: 'FailedResponse',
    reason: 'Provision message timed out'
  }

  const provisionErrorTestData: [string, Promise<ProvisionResponse>, string][] = [
    [
      'Unhandled',
      Promise.resolve(unhandled),
      `${provisionConstants.failureMessage}, reason: Provision message type is not supported in Processing state`
    ],
    [
      'LocationServiceError',
      Promise.resolve(locServiceError),
      `${provisionConstants.failureMessage}, reason: ESW.sequence_manager is not found`
    ],
    [
      'SpawningSequenceComponentsFailed',
      Promise.resolve(spawnSeqCompError),
      `${provisionConstants.failureMessage}, reason: failed to spawn: ESW.ESW_1 on ESW.machine,`
    ],
    [
      'CouldNotFindMachines',
      Promise.resolve(couldNotFindMachine),
      `${provisionConstants.failureMessage}, reason: Could not find following machine: ESW.esw_machine`
    ],
    [
      'FailedResponse',
      Promise.resolve(failedResponse),
      `${provisionConstants.failureMessage}, reason: Provision message timed out`
    ],
    ['Exception', Promise.reject(Error('error occured')), `${provisionConstants.failureMessage}, reason: error occured`]
  ]

  provisionErrorTestData.forEach(([name, provisionRes, errMsg]) => {
    it(`should be able to show error log if provision return ${name} | ESW-444, ESW-507`, async () => {
      const smService = mockServices.mock.smService
      const configService = mockServices.mock.configService

      when(configService.getActive(PROVISION_CONF_PATH)).thenResolve(ConfigData.fromString(JSON.stringify(confData)))

      when(smService.provision(deepEqual(provisionConfig))).thenReturn(provisionRes)

      const { provisionButton } = await renderAndFindProvision()

      //User clicks provision button
      userEvent.click(provisionButton)

      //Provision config modal will appear with provision button
      await assertDialog()

      verify(configService.getActive(PROVISION_CONF_PATH)).called()

      const document = screen.getByRole('document')
      const confirmButton = within(document).getByRole('button', {
        name: provisionConstants.modalOkText
      })

      userEvent.click(confirmButton)
      await screen.findByText(errMsg)

      verify(smService.provision(deepEqual(provisionConfig))).called()
    })
  })

  const renderAndFindProvision = async () => {
    renderWithAuth({
      ui: <ProvisionButton />
    })

    const provisionButton = await screen.findByRole('button', {
      name: provisionConstants.buttonText
    })

    return { provisionButton }
  }

  const assertDialog = async () => {
    await waitFor(() => expect(screen.getByRole('dialog', { name: 'Provision Configuration:' })).to.exist)

    const dialog = screen.getByRole('dialog', {
      name: 'Provision Configuration:'
    })

    await within(dialog).findByRole('table')
    await within(dialog).findByRole('button', { name: provisionConstants.modalOkText })
    await within(dialog).findByRole('button', { name: 'Cancel' })
  }
})
