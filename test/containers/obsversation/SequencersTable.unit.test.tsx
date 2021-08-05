import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StepList } from '@tmtsoftware/esw-ts'
import type { SequencerState } from '@tmtsoftware/esw-ts'
import { expect } from 'chai'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { SequencersTable } from '../../../src/features/sequencer/components/SequencersTable'
import { getCurrentStepCommandName, SequencerInfo, StepListStatus } from '../../../src/features/sequencer/utils'
import { getSequencersInfo, getStep } from '../../utils/sequence-utils'
import { renderWithAuth } from '../../utils/test-utils'

describe('sequencer table', () => {
  const stepList1: StepList = new StepList([getStep('Pending', '11', true), getStep('Pending', '12')])
  const stepList2: StepList = new StepList([
    getStep('Success', '21'),
    getStep('Failure', '22'),
    getStep('Pending', '23')
  ])
  const stepList3: StepList = new StepList([getStep('InFlight', '31'), getStep('Pending', '32')])
  const stepList4: StepList = new StepList([getStep('Success', '41'), getStep('Success', '42')])

  it('should be able to render SequencersTable successfully | ESW-451, ESW-496', async () => {
    const eswPrefix = 'ESW.DarkNight_1'
    const apsPrefix = 'APS.DarkNight_1'
    const dpsPrefix = 'DPS.DarkNight_1'
    const cisPrefix = 'CIS.DarkNight_1'

    const sequencersInfo: SequencerInfo[] = [
      makeSequencerInfo(eswPrefix, stepList1, 'Paused', 1, 'Loaded'),
      makeSequencerInfo(apsPrefix, stepList2, 'Failed', 2, 'Running'),
      makeSequencerInfo(dpsPrefix, stepList3, 'In Progress', 1, 'Loaded'),
      makeSequencerInfo(cisPrefix, stepList4, 'All Steps Completed', 0, 'Loaded')
    ]

    renderWithAuth({
      ui: (
        <BrowserRouter>
          <SequencersTable sequencersInfo={sequencersInfo} loading={false} />
        </BrowserRouter>
      )
    })

    await assertTable()
  })

  it('should be able to render status NA if no sequence present | ESW-451', async () => {
    const sequencersInfo = getSequencersInfo()

    renderWithAuth({
      ui: (
        <BrowserRouter>
          <SequencersTable sequencersInfo={sequencersInfo} loading={false} />
        </BrowserRouter>
      )
    })

    await assertHeaders()
    await screen.findByRole('table')
    await screen.findByRole('row', {
      name: /setting esw\.darknight na na/i
    })
  })

  it('should change the location on click of sequencer | ESW-492', async () => {
    const sequencersInfo = getSequencersInfo()

    renderWithAuth({
      ui: (
        <BrowserRouter>
          <SequencersTable sequencersInfo={sequencersInfo} loading={false} />
        </BrowserRouter>
      )
    })

    const sequencer = await screen.findByRole('link')
    userEvent.click(sequencer)

    expect(window.location.pathname).to.equal('/sequencer')
    expect(window.location.search).to.equal('?prefix=ESW.darknight')
  })

  it('should be able to render a close icon if some sequencer is not running | ESW-514', async () => {
    const sequencersInfo = [
      ...getSequencersInfo(),
      {
        key: 'TCS.darknight',
        prefix: 'TCS.darknight',
        currentStepCommandName: getCurrentStepCommandName(undefined),
        stepListInfo: { status: 'NA', currentStepNumber: 0 },
        totalSteps: 0
      } as SequencerInfo
    ]

    renderWithAuth({
      ui: (
        <BrowserRouter>
          <SequencersTable sequencersInfo={sequencersInfo} loading={false} />
        </BrowserRouter>
      )
    })

    await assertHeaders()
    await screen.findByRole('table')
    await screen.findByRole('row', {
      name: /setting esw\.darknight na na/i
    })
    await screen.findByRole('row', {
      name: /setting tcs\.darknight close na na/i
    })
    const htmlElement = screen.getByRole('cell', {
      name: /setting tcs\.darknight close/i
    })

    const button = within(htmlElement).getByRole('ManageSequencer') as HTMLButtonElement

    expect(button.disabled).to.be.true
  })
})

const assertHeaders = async () => {
  await assertHeader('Sequencers')
  await assertHeader('Current Step')
  await assertHeader('Sequence Status')
  await assertHeader('Total Steps')
}

//******************utility functions*****************
const assertTable = async () => {
  await screen.findByRole('table')

  await assertHeaders()

  await assertRow(/setting esw\.darknight_1/i, ['setting ESW.DarkNight_1', 'Command-11', 'Step 1 Paused', '2'])

  await assertRow(/aps\.darknight_1/i, ['setting APS.DarkNight_1', 'Command-22', 'Step 2 Failed', '3'])

  await assertRow(/dps\.darknight_1/i, ['setting DPS.DarkNight_1', 'Command-31', 'Step 1 In Progress', '2'])

  await assertRow(/cis\.darknight_1/i, ['setting CIS.DarkNight_1', 'NA', 'All Steps Completed', '2'])
}

const assertHeader = (colName: string) => screen.findByRole('columnheader', { name: colName })

const assertRow = async (rowName: RegExp, cells: string[]) => {
  const row: HTMLElement = screen.getByRole('row', {
    name: rowName
  })

  for (let index = 0; index < cells.length; index++) {
    await assertCell(row, cells[index])
  }
}

const assertCell = async (row: HTMLElement, cellName: string) => {
  await within(row).findByRole('cell', {
    name: cellName
  })
}

const makeSequencerInfo = (
  prefix: string,
  stepList: StepList,
  stepListState: StepListStatus,
  currentStepNumber: number,
  sequencerState: SequencerState['_type']
): SequencerInfo => {
  return {
    key: prefix,
    prefix: prefix,
    currentStepCommandName: getCurrentStepCommandName(stepList),
    stepListInfo: { status: stepListState, currentStepNumber },
    sequencerState: { _type: sequencerState },
    totalSteps: stepList.steps.length
  }
}
