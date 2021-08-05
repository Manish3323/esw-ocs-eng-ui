import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { SequencerState } from '@tmtsoftware/esw-ts'
import {
  booleanKey,
  BooleanKey,
  IntArrayKey,
  intArrayKey,
  intKey,
  IntKey,
  Location,
  Parameter,
  Prefix,
  SequencerStateResponse,
  ServiceError,
  Setup,
  StepList,
  stringKey,
  StringKey
} from '@tmtsoftware/esw-ts'
import { setViewport } from '@web/test-runner-commands'
import { expect } from 'chai'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { anything, deepEqual, reset, verify, when } from 'ts-mockito'
import { SequencerDetails } from '../../../../../src/features/sequencer/components/sequencerDetails/SequencerDetails'
import {
  abortSequenceConstants,
  addStepConstants,
  goOfflineConstants,
  stepConstants
} from '../../../../../src/features/sequencer/sequencerConstants'
import { getStepList, makeSeqStateResponse, sendEvent } from '../../../../utils/sequence-utils'
import { mockServices, renderWithAuth, sequencerServiceMock } from '../../../../utils/test-utils'

describe('sequencer details', () => {
  let windowWidth: number
  let windowHeight: number
  beforeEach(() => {
    windowHeight = window.innerHeight
    windowWidth = window.innerWidth
  })
  afterEach(async () => {
    //Reset the viewport
    await setViewport({
      width: windowWidth,
      height: windowHeight
    })
    reset(sequencerServiceMock)
  })
  const darkNightSequencer = 'IRIS.IRIS_Darknight'
  const sequenceComponentPrefix = 'ESW.ESW1'

  const sequencerLoc: Location = {
    _type: 'AkkaLocation',
    connection: {
      componentType: 'Sequencer',
      connectionType: 'akka',
      prefix: Prefix.fromString(darkNightSequencer)
    },
    metadata: {
      sequenceComponentPrefix
    },
    uri: ''
  }
  const locServiceMock = mockServices.mock.locationService

  when(locServiceMock.find(anything())).thenResolve(sequencerLoc)
  when(locServiceMock.track(anything())).thenReturn(() => {
    return {
      cancel: () => ({})
    }
  })

  it('Should render the sequencerDetails | ESW-455, ESW-456, ESW-489', async () => {
    when(sequencerServiceMock.subscribeSequencerState()).thenReturn(getEvent('Offline', getStepList('Failure')))
    renderWithAuth({
      ui: <SequencerDetails prefix={sequencerLoc.connection.prefix} />
    })

    const sequencerTitle = await screen.findByTestId('status-error')
    expect(sequencerTitle.innerText).to.equal(darkNightSequencer)

    expect(screen.getByLabelText('SeqCompLabel').innerText).to.equal('Sequence Component:')
    expect(screen.getByLabelText(`SeqCompValue`).innerText).to.equal(sequenceComponentPrefix)

    //check for sequence execution table
    const stepListTitle = await screen.findByRole('stepListTitle')
    expect(stepListTitle.innerText).to.equals(`Sequence Steps\nStatus:\nFailed`)
  })

  it('should render the sequence and sequencer actions | ESW-455, ESW-456, ESW-489, ESW-500', async () => {
    when(sequencerServiceMock.subscribeSequencerState()).thenReturn(getEvent('Running', getStepList('InFlight')))

    renderWithAuth({
      ui: <SequencerDetails prefix={sequencerLoc.connection.prefix} />
    })

    const loadButton = await screen.findByRole('LoadSequence')
    const abortButton = await screen.findByRole('button', {
      name: abortSequenceConstants.buttonText
    })
    const goOffline = await screen.findByRole('button', { name: goOfflineConstants.buttonText })

    expect(loadButton).to.exist
    expect(goOffline).to.exist
    expect(abortButton).to.exist

    expect(await screen.findByRole('PauseSequence')).to.exist
    expect(await screen.findByRole('StopSequence')).to.exist

    //check for sequence execution table
    const stepListTitle = await screen.findByRole('stepListTitle')
    expect(stepListTitle.innerText).to.equals(`Sequence Steps\nStatus:\nIn Progress`)
  })

  it('should render the sequence and show all steps completed | ESW-455, ESW-456, ESW-489', async () => {
    when(sequencerServiceMock.subscribeSequencerState()).thenReturn(getEvent('Running', getStepList('Success')))
    renderWithAuth({
      ui: <SequencerDetails prefix={sequencerLoc.connection.prefix} />
    })

    //check for sequence execution table
    const stepListTitle = await screen.findByRole('stepListTitle')
    expect(stepListTitle.innerText).to.equals(`Sequence Steps\nStatus:\nAll Steps Completed`)
  })

  it('should render badge status as success if sequencer is online | ESW-455, ESW-456, ESW-489', async () => {
    when(sequencerServiceMock.subscribeSequencerState()).thenReturn(getEvent('Running', getStepList('Pending', true)))

    renderWithAuth({
      ui: <SequencerDetails prefix={sequencerLoc.connection.prefix} />
    })

    const sequencerTitle = await screen.findByTestId('status-success')
    expect(sequencerTitle.innerText).to.equal(darkNightSequencer)
    expect(screen.getByLabelText('SeqCompLabel').innerText).to.equal('Sequence Component:')
    expect(screen.getByLabelText(`SeqCompValue`).innerText).to.equal(sequenceComponentPrefix)

    //check for sequence execution table
    const stepListTitle = await screen.findByRole('stepListTitle')
    expect(stepListTitle.innerText).to.equals(`Sequence Steps\nStatus:\nPaused`)
  })

  it('should render parameter table when a Step is clicked from the StepList | ESW-457, ESW-489, ESW-537', async () => {
    const booleanParam: Parameter<BooleanKey> = booleanKey('flagKey').set([false])
    const intParam: Parameter<IntKey> = intKey('randomKey').set([123, 12432])
    const filterKey = intArrayKey('filter', 'count')
    const filterParam: Parameter<IntArrayKey> = filterKey.set([
      [1, 2, 3],
      [4, 5, 6]
    ])
    const stringParam: Parameter<StringKey> = stringKey('ra').set(['12:13:14.1'])

    const paramSet1 = [booleanParam, intParam]
    const paramSet2 = [filterParam, stringParam]
    const stepList: StepList = new StepList([
      {
        hasBreakpoint: false,
        status: { _type: 'Success' },
        command: new Setup(Prefix.fromString('ESW.ESW1'), 'Command-1', paramSet1),
        id: '1'
      },
      {
        hasBreakpoint: false,
        status: { _type: 'InFlight' },
        command: new Setup(Prefix.fromString('ESW.ESW1'), 'Command-2', paramSet2),
        id: '2'
      }
    ])

    when(sequencerServiceMock.subscribeSequencerState()).thenReturn(getEvent('Running', stepList))

    await setViewport({ width: 1440, height: 900 })

    renderWithAuth({
      ui: <SequencerDetails prefix={sequencerLoc.connection.prefix} />
    })

    await screen.findAllByRole('table')

    const [, , , parameterBodyTable] = screen.queryAllByRole('table')

    const step = screen.getByRole('button', { name: /Command-2/i })
    userEvent.click(step)

    expect(within(parameterBodyTable).queryAllByRole('row')).to.have.length(2)
    expect(
      within(parameterBodyTable).getByRole('row', {
        name: 'filter [1,2,3], [4,5,6] ct'
      })
    ).to.exist
    expect(
      within(parameterBodyTable).getByRole('row', {
        name: 'ra "12:13:14.1" none'
      })
    ).to.exist
  })

  it('should render Step details when a Step is clicked from the StepLists | ESW-457, ESW-489', async () => {
    const stepList: StepList = new StepList([
      {
        hasBreakpoint: false,
        status: { _type: 'Success' },
        command: new Setup(Prefix.fromString('ESW.ESW1'), 'Command-1', []),
        id: '1'
      },
      {
        hasBreakpoint: false,
        status: { _type: 'InFlight' },
        command: new Setup(Prefix.fromString('ESW.ESW2'), 'Command-2', [], '2020A-001-123'),
        id: '2'
      }
    ])

    when(sequencerServiceMock.subscribeSequencerState()).thenReturn(getEvent('Running', stepList))

    //Set bigger viewport so that values wont be elipsis
    await setViewport({ width: 1440, height: 900 })

    renderWithAuth({
      ui: <SequencerDetails prefix={sequencerLoc.connection.prefix} />
    })

    await screen.findAllByRole('table')
    const labels1: [string, string][] = [
      ['Command Type', 'Setup'],
      ['Command', 'Command-1'],
      ['Source', 'ESW.ESW1'],
      ['Obs-Id', 'NA']
    ]
    const labels2: [string, string][] = [
      ['Command Type', 'Setup'],
      ['Command', 'Command-2'],
      ['Source', 'ESW.ESW2'],
      ['Obs-Id', '2020A-001-123']
    ]

    const step1 = screen.getByRole('button', { name: /Command-1/i })
    userEvent.click(step1)
    labels1.forEach(([key, value]) => {
      const keyLabel = screen.getByLabelText(`${key}-Key`)
      const valueLabel = screen.getByLabelText(`${key}-Value`)
      expect(keyLabel.innerText).to.equals(key)
      expect(valueLabel.innerText).to.equals(value)
    })
    const step2 = screen.getByRole('button', { name: /Command-2/i })
    userEvent.click(step2)
    labels2.forEach(([key, value]) => {
      const keyLabel = screen.getByLabelText(`${key}-Key`)
      const valueLabel = screen.getByLabelText(`${key}-Value`)
      expect(keyLabel.innerText).to.equals(key)
      expect(valueLabel.innerText).to.equals(value)
    })
  })

  //TODO Fix this
  it.skip('should render step details with text data having elipsis when viewport size is small | ESW-457, ESW-489', async () => {
    const stepList: StepList = new StepList([
      {
        hasBreakpoint: false,
        status: { _type: 'Success' },
        command: new Setup(
          Prefix.fromString('ESW.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'),
          'Command-1',
          [],
          '2020A-001-123'
        ),
        id: '1'
      }
    ])

    when(sequencerServiceMock.subscribeSequencerState()).thenReturn(getEvent('Running', stepList))
    //Set small viewport so that values will have elipsis
    await setViewport({ width: 1000, height: 800 })

    renderWithAuth({
      ui: <SequencerDetails prefix={sequencerLoc.connection.prefix} />
    })

    await screen.findAllByRole('table')

    const commandNameValue = screen.getByLabelText('Command-Value')
    const sourceValue = screen.getByLabelText('Source-Value')

    expect(commandNameValue.innerText).to.equals('Command-1')
    await waitFor(() => expect(sourceValue.innerText).to.match(/^ESW.*\.\.\.$/))
  })

  it('should render error message on failure of step in step details pane | ESW-527', async () => {
    const stepListWithInFlight: StepList = new StepList([
      {
        hasBreakpoint: false,
        status: { _type: 'InFlight' },
        command: new Setup(Prefix.fromString('ESW.Darknight'), 'Command-1', [], '2020A-001-123'),
        id: '1'
      }
    ])

    const errorMessage = 'error while executing step'
    const stepListWithFailure: StepList = new StepList([
      {
        hasBreakpoint: false,
        status: { _type: 'Failure', message: errorMessage },
        command: new Setup(Prefix.fromString('ESW.Darknight'), 'Command-1', [], '2020A-001-123'),
        id: '1'
      }
    ])
    let sendCommand: (sequencerStateRes: SequencerStateResponse) => void = () => ({})

    when(sequencerServiceMock.subscribeSequencerState()).thenReturn(
      (onevent: (sequencerStateRes: SequencerStateResponse) => void) => {
        sendCommand = onevent
        return {
          cancel: () => undefined
        }
      }
    )

    renderWithAuth({
      ui: <SequencerDetails prefix={sequencerLoc.connection.prefix} />
    })
    sendCommand(makeSeqStateResponse('Running', stepListWithInFlight))

    expect(screen.queryByRole('alert')).to.not.exist

    sendCommand(makeSeqStateResponse('Running', stepListWithFailure))

    const alert = await screen.findByRole('alert')
    await within(alert).findByText(`Step Failure: ${errorMessage}`)
  })

  it('should render default error message on failure of step in step details pane when error msg is empty | ESW-527', async () => {
    const stepList: StepList = new StepList([
      {
        hasBreakpoint: false,
        status: { _type: 'Failure', message: '' },
        command: new Setup(Prefix.fromString('ESW.Darknight'), 'Command-1', [], '2020A-001-123'),
        id: '1'
      }
    ])

    when(sequencerServiceMock.subscribeSequencerState()).thenReturn(getEvent('Running', stepList))
    renderWithAuth({
      ui: <SequencerDetails prefix={sequencerLoc.connection.prefix} />
    })

    const alert = await screen.findByRole('alert')
    await within(alert).findByText(stepConstants.defaultStepFailureErrorMessage)
  })

  it('add steps should add uploaded steps after the selected step | ESW-461, ESW-489', async () => {
    const sequencerPrefix = Prefix.fromString('ESW.iris_darknight')
    const commandToInsert: Setup = new Setup(sequencerPrefix, 'command-2')

    const file = new File([JSON.stringify([commandToInsert])], 'commands.json', {
      type: 'application/json'
    })

    const stepList = getStepList('Pending', false)

    const stepListAfterInsertion = new StepList([
      {
        hasBreakpoint: false,
        status: { _type: 'Pending' },
        command: new Setup(sequencerPrefix, 'Command-1'),
        id: 'step1'
      },
      {
        hasBreakpoint: false,
        status: { _type: 'Pending' },
        command: commandToInsert,
        id: 'step2'
      }
    ])
    let sendCommand: (sequencerStateRes: SequencerStateResponse) => void = () => ({})

    when(sequencerServiceMock.subscribeSequencerState()).thenReturn(
      (onevent: (sequencerStateRes: SequencerStateResponse) => void) => {
        sendCommand = onevent
        return {
          cancel: () => undefined
        }
      }
    )

    when(sequencerServiceMock.insertAfter('step1', anything())).thenResolve({
      _type: 'Ok'
    })

    renderWithAuth({
      ui: (
        <BrowserRouter>
          <SequencerDetails prefix={sequencerPrefix} />
        </BrowserRouter>
      )
    })
    sendCommand(makeSeqStateResponse('Idle', stepList))
    const actions = await screen.findByRole('stepActions')
    await waitFor(() => userEvent.click(actions))

    const menuItems = await screen.findAllByRole('menuitem')
    expect(menuItems.length).to.equal(4)

    //asert step is not present before adding it
    expect(screen.queryByRole('row', { name: /2 command-2/i })).to.null

    const addSteps = await screen.findByRole('button', { name: /add steps/i })
    await waitFor(() => userEvent.click(addSteps)) // click to open uplaod dialogue

    // eslint-disable-next-line testing-library/no-node-access
    const inputBox = addSteps.firstChild as HTMLInputElement
    await waitFor(() => userEvent.upload(inputBox, file)) // upload the file with command

    await screen.findByText(addStepConstants.successMessage)
    sendCommand(makeSeqStateResponse('Idle', stepListAfterInsertion))
    verify(sequencerServiceMock.insertAfter('step1', deepEqual([commandToInsert]))).called()

    // assert step is added
    await screen.findByRole('row', { name: /1 command-1/i })
    await screen.findByRole('row', { name: /2 command-2/i })
  })

  const disabledStatesForStopAndAbort: SequencerState['_type'][] = ['Loaded', 'Processing', 'Offline', 'Idle']

  disabledStatesForStopAndAbort.forEach((state) => {
    it(`should show stop, abort disabled when sequencer is in ${state} state | ESW-500, ESW-494`, async () => {
      const sequencerPrefix = Prefix.fromString('ESW.iris_darknight')

      const stepList = getStepList('Pending', false)

      when(sequencerServiceMock.subscribeSequencerState()).thenReturn(
        (onevent: (sequencerStateRes: SequencerStateResponse) => void) => {
          sendEvent(onevent, state, stepList)
          return {
            cancel: () => undefined
          }
        }
      )

      renderWithAuth({
        ui: (
          <BrowserRouter>
            <SequencerDetails prefix={sequencerPrefix} />
          </BrowserRouter>
        )
      })
      const abortSeqButton = (await screen.findByRole('button', {
        name: abortSequenceConstants.buttonText
      })) as HTMLButtonElement

      expect(abortSeqButton.disabled).true

      const stopSeqButton = (await screen.findByRole('StopSequence')) as HTMLButtonElement

      expect(stopSeqButton.disabled).true
    })
  })
  const disabledStatesForResume: SequencerState['_type'][] = ['Processing', 'Offline', 'Idle']
  disabledStatesForResume.forEach((state) => {
    it(`should show resume disabled when sequencer is in ${state} state | ESW-500, ESW-494`, async () => {
      const sequencerPrefix = Prefix.fromString('ESW.iris_darknight')

      const stepList = new StepList([
        {
          hasBreakpoint: false,
          status: { _type: 'Pending' },
          command: new Setup(Prefix.fromString('ESW.test'), 'Command-1'),
          id: 'step1'
        }
      ])

      when(sequencerServiceMock.subscribeSequencerState()).thenReturn(
        (onevent: (sequencerStateRes: SequencerStateResponse) => void) => {
          sendEvent(onevent, state, stepList)
          return {
            cancel: () => undefined
          }
        }
      )

      renderWithAuth({
        ui: (
          <BrowserRouter>
            <SequencerDetails prefix={sequencerPrefix} />
          </BrowserRouter>
        )
      })

      const resumeSeqButton = (await screen.findByRole('ResumeSequence')) as HTMLButtonElement

      expect(resumeSeqButton.disabled).true
    })
  })

  it('should not call cancel subscription on unmount | ESW-489', async (done) => {
    when(sequencerServiceMock.subscribeSequencerState()).thenReturn(() => {
      // done() is to assert that cancel is getting called on unmount, whenever it happens
      return {
        cancel: () => done()
      }
    })

    const { unmount } = renderWithAuth({
      ui: <SequencerDetails prefix={sequencerLoc.connection.prefix} />
    })

    unmount()
  })
  it('should render error notification when error is received  | ESW-510', async () => {
    when(sequencerServiceMock.subscribeSequencerState()).thenReturn((_, onError) => {
      onError &&
        onError(
          ServiceError.make(500, 'server error', {
            message: 'Sequencer not found'
          })
        )
      return {
        cancel: () => undefined
      }
    })

    renderWithAuth({
      ui: (
        //browser router is wrapped here because there is a Router Link to go to Home on error
        <BrowserRouter>
          <SequencerDetails prefix={sequencerLoc.connection.prefix} />
        </BrowserRouter>
      )
    })

    await screen.findByText('Sequencer not found')
  })
})

const getEvent =
  (seqState: SequencerState['_type'], stepList: StepList) =>
  (onevent: (sequencerStateResponse: SequencerStateResponse) => void) => {
    onevent(makeSeqStateResponse(seqState, stepList))
    return {
      cancel: () => undefined
    }
  }
