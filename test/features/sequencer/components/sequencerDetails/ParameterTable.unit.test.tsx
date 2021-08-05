import { screen } from '@testing-library/react'
import {
  booleanKey,
  BooleanKey,
  IntArrayKey,
  intArrayKey,
  intKey,
  IntKey,
  Parameter,
  Prefix,
  Setup,
  SolarSystemCoord,
  solarSystemCoordKey,
  stringKey,
  StringKey,
  Tag
} from '@tmtsoftware/esw-ts'
import React from 'react'
import { ParameterTable } from '../../../../../src/features/sequencer/components/sequencerDetails/ParameterTable'
import { assertTableBody, assertTableHeader } from '../../../../utils/tableTestUtils'
import { renderWithAuth } from '../../../../utils/test-utils'

describe('Parameters Table', () => {
  it('should display all the parameters in a step of a Sequence | ESW-457, ESW-503, ESW-537', async () => {
    const booleanParam: Parameter<BooleanKey> = booleanKey('flag').set([false])
    const intParam: Parameter<IntKey> = intKey('randomKey', 'meter').set([123, 12432])
    const filterKey = intArrayKey('filter', 'foot')
    const filterParam: Parameter<IntArrayKey> = filterKey.set([
      [1, 2, 3],
      [4, 5, 6]
    ])
    const stringParam: Parameter<StringKey> = stringKey('ra').set(['12:13:14.1'])
    const solarSystemCoord = solarSystemCoordKey('solarSystem').set([new SolarSystemCoord(new Tag('Base'), 'Jupiter')])

    const paramSet = [booleanParam, intParam, filterParam, stringParam, solarSystemCoord]
    const command = new Setup(Prefix.fromString('ESW.darknight'), 'setup', paramSet)

    renderWithAuth({ ui: <ParameterTable command={command} /> })
    await screen.findByRole('table')
    const [paramHeaderTable, paramBodyTable] = screen.queryAllByRole('table')
    assertTableHeader(paramHeaderTable, 'Parameter')
    assertTableHeader(paramHeaderTable, 'Unit')
    assertTableHeader(paramHeaderTable, 'Values')

    assertTableBody(paramBodyTable, 'flag false none')
    assertTableBody(paramBodyTable, 'randomKey 123, 12432 m')
    assertTableBody(paramBodyTable, 'filter [1,2,3], [4,5,6] ft')
    assertTableBody(paramBodyTable, 'solarSystem Base: Jupiter none')
  })
})
