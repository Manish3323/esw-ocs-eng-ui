import { render, screen } from '@testing-library/react'
import {
  AltAzCoord,
  altAzCoordKey,
  CometCoord,
  cometCoordKey,
  EqCoord,
  eqCoordKey,
  IntKey,
  intKey,
  Key,
  MinorPlanetCoord,
  minorPlanetCoordKey,
  Parameter,
  Prefix,
  SequenceCommand,
  Setup,
  SolarSystemCoord,
  solarSystemCoordKey,
  Tag,
  taiTimeKey,
  utcTimeKey,
  Angle
} from '@tmtsoftware/esw-ts'
import { expect } from 'chai'
import React from 'react'
import { formatParameters } from '../../../../../src/features/sequencer/components/sequencerDetails/ParamFormatter'
describe('Parameter Formatter', () => {
  // construct coord parameters
  const eqCoord = eqCoordKey('eq').set([
    new EqCoord(new Tag('Base'), Angle.fromDegree(90.0), Angle.fromDegree(123.4252), 'ICRS', 'cat123', {
      pmx: 123,
      pmy: 123414
    })
  ])
  const cometCoord = cometCoordKey('comet').set([
    new CometCoord(
      new Tag('Base'),
      11,
      Angle.fromDegree(123.53441),
      Angle.fromDegree(180.0),
      Angle.fromDegree(12.9),
      200,
      0.4
    )
  ])
  const minorCoord = minorPlanetCoordKey('minorPlanet').set([
    new MinorPlanetCoord(
      new Tag('Base'),
      2,
      Angle.fromDegree(123.53441),
      Angle.fromDegree(180.0),
      Angle.fromDegree(12.9),
      2,
      2,
      Angle.fromDegree(0.9)
    )
  ])
  const solarSystemCoord = solarSystemCoordKey('solarSystem').set([new SolarSystemCoord(new Tag('Base'), 'Jupiter')])
  const altAzCoord = altAzCoordKey('altAz').set([
    new AltAzCoord(new Tag('Base'), Angle.fromDegree(141), Angle.fromDegree(88.88))
  ])
  // construct time parameters
  const utcTime = utcTimeKey('utcTime').set(['1970-01-01T00:00:00Z'])
  const taiTime = taiTimeKey('taiTime').set(['2017-09-04T19:00:00.123456789Z'])

  // construct a parameter which has no custom formatting
  const intParam: Parameter<IntKey> = intKey('randomKey').set([123, 12432])

  // create commands for corresponding parameters
  const setupWithEqCoord = new Setup(Prefix.fromString('ESW.iris_darknight'), 'eqCoord', [eqCoord])
  const setupWithCometCoord = new Setup(Prefix.fromString('ESW.iris_darknight'), 'cometCoord', [cometCoord])
  const setupWithMinorPlanetCoord = new Setup(Prefix.fromString('ESW.iris_darknight'), 'minorPlanetCoord', [minorCoord])
  const setupWithSolarSystemCoord = new Setup(Prefix.fromString('ESW.iris_darknight'), 'solarSystemCoord', [
    solarSystemCoord
  ])
  const setupWithAltAzCoord = new Setup(Prefix.fromString('ESW.iris_darknight'), 'altAzCoord', [altAzCoord])
  const setupWithUtcTimeKey = new Setup(Prefix.fromString('ESW.iris_darknight'), 'utcTime', [utcTime])
  const setupWithTaiTimeKey = new Setup(Prefix.fromString('ESW.iris_darknight'), 'taiTime', [taiTime])
  const setupWithIntKey = new Setup(Prefix.fromString('ESW.iris_darknight'), 'intKey', [intParam])

  //expectations
  const formattedEqCoord =
    `Base: RA=6h DEC=123°25'30.72"\n` + `ICRS, Catalog="cat123"\n` + `Proper Motion=123, 123414\n`
  const formattedCometCoord =
    `Base: Epoch of Perihelion=11\n` +
    `Inclination=123.534 degrees\n` +
    `Long Ascending Node=180.000 degrees\n` +
    `Argument of Perihelion=12.900 degrees\n` +
    `Perihelion Distance=200 AU\n` +
    `Eccentricity=0.4\n`
  const formattedMinorCoord =
    `Base: Epoch=2\n` +
    `Inclination=123.534 degrees\n` +
    `Long Ascending Node=180.000 degrees\n` +
    `Argument of Perihelion=12.900 degrees\n` +
    `Mean Distance=2 AU\n` +
    `Eccentricity=2\n` +
    `Mean Anomaly=0.900 degrees\n`

  const formattedSolarSystemCoord = `Base: Jupiter`
  const formattedAltAzCoord = `Base: Alt=141.000 Az=88.880`
  const formattedUtcTime = '1970-01-01T00:00:00.000Z'
  const formattedTaiTime = '2017-09-04T19:00:00.123Z'
  const formattedIntValue = '123, 12432'

  const testCases: [Parameter<Key>, SequenceCommand, string][] = [
    [eqCoord, setupWithEqCoord, formattedEqCoord],
    [cometCoord, setupWithCometCoord, formattedCometCoord],
    [minorCoord, setupWithMinorPlanetCoord, formattedMinorCoord],
    [solarSystemCoord, setupWithSolarSystemCoord, formattedSolarSystemCoord],
    [altAzCoord, setupWithAltAzCoord, formattedAltAzCoord],
    [utcTime, setupWithUtcTimeKey, formattedUtcTime],
    [taiTime, setupWithTaiTimeKey, formattedTaiTime],
    [intParam, setupWithIntKey, formattedIntValue]
  ]

  testCases.forEach(([parameter, command, formattedParam]) => {
    it(`should format ${parameter.keyTag} | ESW-503`, () => {
      render(<>{formatParameters(parameter, command)}</>)

      const element = screen.getByRole(parameter.keyTag)

      expect(element.innerText).equal(formattedParam)
    })
  })
})
