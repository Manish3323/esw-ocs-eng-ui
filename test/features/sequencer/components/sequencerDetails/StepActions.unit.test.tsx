import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Prefix, Setup, Step, StepStatus } from '@tmtsoftware/esw-ts'
import { expect } from 'chai'
import React from 'react'
import { StepActions } from '../../../../../src/features/sequencer/components/steplist/StepActions'
import { StepListContextProvider } from '../../../../../src/features/sequencer/hooks/useStepListContext'
import {
  addStepConstants,
  deleteStepConstants,
  duplicateStepConstants,
  insertBreakPointConstants,
  removeBreakPointConstants
} from '../../../../../src/features/sequencer/sequencerConstants'
import { renderWithAuth, sequencerServiceInstance } from '../../../../utils/test-utils'

describe('StepActions', () => {
  const stepStatusPending: StepStatus = { _type: 'Pending' }
  const stepStatusInProgress: StepStatus = { _type: 'InFlight' }
  const stepStatusSuccess: StepStatus = { _type: 'Success' }
  const stepStatusFailure: StepStatus = { _type: 'Failure', message: 'error' }

  const getStepWithBreakpoint = (hasBreakpoint: boolean, status: StepStatus): Step => ({
    hasBreakpoint: hasBreakpoint,
    status,
    command: new Setup(Prefix.fromString('ESW.test'), 'Command-1'),
    id: 'step1'
  })

  it('should give insert breakpoint option in menu if step does not have breakpoint | ESW-459', async () => {
    renderWithAuth({
      ui: <StepActions step={getStepWithBreakpoint(false, stepStatusPending)} />
    })
    userEvent.click(await screen.findByRole('stepActions'))

    await screen.findByText(insertBreakPointConstants.menuItemText)
  })

  it('should give remove breakpoint option in menu if step has a breakpoint | ESW-459', async () => {
    renderWithAuth({
      ui: <StepActions step={getStepWithBreakpoint(true, stepStatusPending)} />
    })
    userEvent.click(await screen.findByRole('stepActions'))
    await screen.findByText(removeBreakPointConstants.menuItemText)
  })

  it('should disable insertBreakpoint and delete when status is in Progress | ESW-459, ESW-490', async () => {
    renderWithAuth({
      ui: <StepActions step={getStepWithBreakpoint(false, stepStatusInProgress)} />
    })
    userEvent.click(await screen.findByRole('stepActions'))
    const insertMenu = (await screen.findByRole('menuitem', {
      name: new RegExp(insertBreakPointConstants.menuItemText)
    })) as HTMLMenuElement

    const deleteMenu = (await screen.findByRole('menuitem', {
      name: new RegExp(deleteStepConstants.menuItemText)
    })) as HTMLMenuElement

    expect(insertMenu.classList.contains('ant-dropdown-menu-item-disabled')).to.be.true
    expect(deleteMenu.classList.contains('ant-dropdown-menu-item-disabled')).to.be.true
  })

  it('should disable delete, insert breakpoint and add a step when status is failure | ESW-459, ESW-490', async () => {
    renderWithAuth({
      ui: <StepActions step={getStepWithBreakpoint(false, stepStatusFailure)} />
    })
    userEvent.click(await screen.findByRole('stepActions'))
    const insertMenu = (await screen.findByRole('menuitem', {
      name: new RegExp(insertBreakPointConstants.menuItemText)
    })) as HTMLMenuElement

    const deleteMenu = (await screen.findByRole('menuitem', {
      name: new RegExp(deleteStepConstants.menuItemText)
    })) as HTMLMenuElement

    const addAStepMenu = (await screen.findByRole('menuitem', {
      name: new RegExp(addStepConstants.menuItemText)
    })) as HTMLMenuElement

    expect(insertMenu.classList.contains('ant-dropdown-menu-item-disabled')).to.be.true
    expect(deleteMenu.classList.contains('ant-dropdown-menu-item-disabled')).to.be.true
    expect(addAStepMenu.classList.contains('ant-dropdown-menu-item-disabled')).to.be.true
  })

  it('should disable delete, insert breakpoint and add a step when status is success | ESW-459 ESW-490', async () => {
    renderWithAuth({
      ui: <StepActions step={getStepWithBreakpoint(false, stepStatusSuccess)} />
    })
    userEvent.click(await screen.findByRole('stepActions'))
    const insertMenu = (await screen.findByRole('menuitem', {
      name: new RegExp(insertBreakPointConstants.menuItemText)
    })) as HTMLMenuElement

    const deleteMenu = (await screen.findByRole('menuitem', {
      name: new RegExp(deleteStepConstants.menuItemText)
    })) as HTMLMenuElement

    const addAStepMenu = (await screen.findByRole('menuitem', {
      name: new RegExp(addStepConstants.menuItemText)
    })) as HTMLMenuElement

    expect(insertMenu.classList.contains('ant-dropdown-menu-item-disabled')).to.be.true
    expect(deleteMenu.classList.contains('ant-dropdown-menu-item-disabled')).to.be.true
    expect(addAStepMenu.classList.contains('ant-dropdown-menu-item-disabled')).to.be.true
  })

  it('should enable every menu item when status is pending | ESW-459, ESW-490', async () => {
    renderWithAuth({
      ui: <StepActions step={getStepWithBreakpoint(false, stepStatusPending)} />
    })
    userEvent.click(await screen.findByRole('stepActions'))
    const insertMenu = (await screen.findByRole('menuitem', {
      name: new RegExp(insertBreakPointConstants.menuItemText)
    })) as HTMLMenuElement

    const deleteMenu = (await screen.findByRole('menuitem', {
      name: new RegExp(deleteStepConstants.menuItemText)
    })) as HTMLMenuElement

    const addAStepMenu = (await screen.findByRole('menuitem', {
      name: new RegExp(addStepConstants.menuItemText)
    })) as HTMLMenuElement

    expect(insertMenu.classList.contains('ant-dropdown-menu-item-disabled')).to.be.false
    expect(deleteMenu.classList.contains('ant-dropdown-menu-item-disabled')).to.be.false
    expect(addAStepMenu.classList.contains('ant-dropdown-menu-item-disabled')).to.be.false
  })

  it('should disable duplicate if stepListStatus is completed | ESW-462', async () => {
    renderWithAuth({
      ui: (
        <StepListContextProvider
          value={{
            handleDuplicate: () => undefined,
            setFollowProgress: () => undefined,
            isDuplicateEnabled: false,
            stepListStatus: 'All Steps Completed',
            sequencerService: sequencerServiceInstance
          }}>
          <StepActions step={getStepWithBreakpoint(false, stepStatusInProgress)} />
        </StepListContextProvider>
      )
    })

    userEvent.click(await screen.findByRole('stepActions'))

    const duplicateMenu = (await screen.findByRole('menuitem', {
      name: new RegExp(duplicateStepConstants.menuItemText)
    })) as HTMLMenuElement

    expect(duplicateMenu.classList.contains('ant-dropdown-menu-item-disabled')).to.be.true
  })

  it('should disable add steps if step Status is completed | ESW-461', async () => {
    renderWithAuth({
      ui: (
        <StepListContextProvider
          value={{
            handleDuplicate: () => undefined,
            setFollowProgress: () => undefined,
            isDuplicateEnabled: false,
            stepListStatus: 'All Steps Completed',
            sequencerService: sequencerServiceInstance
          }}>
          <StepActions step={getStepWithBreakpoint(false, stepStatusSuccess)} />
        </StepListContextProvider>
      )
    })

    userEvent.click(await screen.findByRole('stepActions'))

    const addStepsMenu = (await screen.findByRole('menuitem', {
      name: new RegExp(addStepConstants.menuItemText)
    })) as HTMLMenuElement
    const addStepsDiv = (await screen.findByRole('addSteps')) as HTMLDivElement

    expect(addStepsMenu.classList.contains('ant-dropdown-menu-item-disabled')).to.be.true
    expect(addStepsDiv.style.color).to.be.equal('var(--disabledColor)')
  })
})
