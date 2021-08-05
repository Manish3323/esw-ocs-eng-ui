import { screen, within } from '@testing-library/react'
import { expect } from 'chai'
import React from 'react'
import { when } from 'ts-mockito'
import { Resources } from '../../../src/containers/resources/Resources'
import obsModesData from '../../jsons/mockResourcesData'
import { mockServices, renderWithAuth } from '../../utils/test-utils'

describe('Resources page', () => {
  const smService = mockServices.mock.smService
  when(smService.getObsModesDetails()).thenResolve(obsModesData)

  it('should display page header with a resources table | ESW-453', async () => {
    renderWithAuth({ ui: <Resources /> })

    const [tableHead] = await screen.findAllByRole('table')
    expect(within(tableHead).getByRole('columnheader', { name: 'Resource' })).to.exist
    expect(within(tableHead).getByRole('columnheader', { name: 'Status' })).to.exist
    expect(within(tableHead).getByRole('columnheader', { name: 'Used By' })).to.exist
  })

  it('should display resources in use for configured obsmode & for conflicting non-configurable resources | ESW-453', async () => {
    renderWithAuth({
      ui: <Resources />
    })

    expect(screen.getAllByText('Resource')).to.length(1)
    //Find resources table
    const [, tableBody] = await screen.findAllByRole('table')
    const inUseResourcesRows: HTMLElement[] = within(tableBody).getAllByRole('row', {
      name: /InUse/i
    })

    inUseResourcesRows.forEach((row) => {
      within(row).getByRole('cell', { name: /(NFARIOS|TCS)/ })
      within(row).getByRole('cell', { name: 'InUse' })
      within(row).getByRole('cell', {
        name: 'DarkNight_1'
      })
    })
  })
  it('should display available resources for configurable obsmodes | ESW-453', async () => {
    renderWithAuth({
      ui: <Resources />
    })

    expect(screen.getAllByText('Resource')).to.length(1)
    //Find resources table
    const [, tableBody] = await screen.findAllByRole('table')
    const availableResourcesRows: HTMLElement[] = within(tableBody).getAllByRole('row', {
      name: /Available/i
    })

    availableResourcesRows.forEach((row) => {
      within(row).getByRole('cell', { name: 'Available' })
      within(row).getByRole('cell', { name: 'NA' })
      within(row).getByRole('cell', { name: /(IRIS|WFOS)/ })
    })
  })

  it('should sort InUse resources to top of the table | ESW-453', async () => {
    renderWithAuth({
      ui: <Resources />
    })

    expect(screen.getAllByText('Resource')).to.length(1)

    const [, tableBody] = await screen.findAllByRole('table')
    const rows: HTMLElement[] = within(tableBody).getAllByRole('row')

    within(rows[0]).getByRole('cell', { name: 'InUse' })
    within(rows[1]).getByRole('cell', { name: 'InUse' })
    within(rows[2]).getByRole('cell', { name: 'Available' })
    within(rows[3]).getByRole('cell', { name: 'Available' })
  })
})
