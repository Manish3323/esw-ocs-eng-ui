import {
  AltAzCoord,
  altAzCoordKey,
  Angle,
  CometCoord,
  cometCoordKey,
  Coord,
  coordKey,
  EqCoord,
  eqCoordKey,
  Key,
  MinorPlanetCoord,
  minorPlanetCoordKey,
  Parameter,
  SequenceCommand,
  SolarSystemCoord,
  solarSystemCoordKey,
  taiTimeKey,
  utcTimeKey
} from '@tmtsoftware/esw-ts'
import { Space, Typography } from 'antd'
import type { SpaceSize } from 'antd/lib/space'
import React from 'react'
const DIGITS_AFTER_DECIMAL = 3

const uasToDegree = (angle: Angle) => angle.toDegree().toFixed(DIGITS_AFTER_DECIMAL)

const dateStringToISO = (date: string) => new Date(date).toISOString()

const formatEqCoord = (value: EqCoord) => (
  <>
    {value.tag.name}: RA={Angle.raToString(value.ra.toRadian())} DEC={Angle.deToString(value.dec.toRadian())} <br />
    {value.frame.toString()}, Catalog=&quot;{value.catalogName}&quot; <br />
    Proper Motion={value.pm.pmx}, {value.pm.pmy}
    <br />
  </>
)

const formatCometCoord = (value: CometCoord) => (
  <>
    {value.tag.name}: Epoch of Perihelion={value.epochOfPerihelion} <br />
    Inclination={uasToDegree(value.inclination)} degrees <br />
    Long Ascending Node={uasToDegree(value.longAscendingNode)} degrees <br />
    Argument of Perihelion={uasToDegree(value.argOfPerihelion)} degrees <br />
    Perihelion Distance={value.perihelionDistance} AU <br />
    Eccentricity={value.eccentricity} <br />
  </>
)

const formatMinorPlanetCoord = (value: MinorPlanetCoord) => (
  <>
    {value.tag.name}: Epoch={value.epoch} <br />
    Inclination={uasToDegree(value.inclination)} degrees <br />
    Long Ascending Node={uasToDegree(value.longAscendingNode)} degrees <br />
    Argument of Perihelion={uasToDegree(value.argOfPerihelion)} degrees <br />
    Mean Distance={value.meanDistance} AU <br />
    Eccentricity={value.eccentricity} <br />
    Mean Anomaly={uasToDegree(value.meanAnomaly)} degrees <br />
  </>
)

const formatSolarSystemCoord = (value: SolarSystemCoord) => (
  <>
    {value.tag.name}: {value.body.toString()}
  </>
)

const formatAltAzCoord = (value: AltAzCoord) => (
  <>
    {value.tag.name}: Alt={uasToDegree(value.alt)} Az={uasToDegree(value.az)}
  </>
)

const formatCoord = (value: Coord) => {
  switch (value._type) {
    case 'EqCoord':
      return formatEqCoord(value)

    case 'SolarSystemCoord':
      return formatSolarSystemCoord(value)

    case 'AltAzCoord':
      return formatAltAzCoord(value)

    case 'CometCoord':
      return formatCometCoord(value)

    case 'MinorPlanetCoord':
      return formatMinorPlanetCoord(value)
  }
}

const FormattedParams = ({
  values,
  size,
  role
}: {
  values: JSX.Element[] | undefined
  role: string
  size?: SpaceSize
}) => (
  <Space direction='vertical' size={size} role={role}>
    {values && values.map((value, index) => <Typography.Text key={index}>{value}</Typography.Text>)}
  </Space>
)

export const formatParameters = (parameter: Parameter<Key>, command: SequenceCommand): JSX.Element => {
  const { keyName, keyTag } = parameter
  switch (keyTag) {
    case 'CoordKey':
      const coordParam = command.get(coordKey(keyName))
      return <FormattedParams values={coordParam?.values.map(formatCoord)} role={keyTag} />

    case 'EqCoordKey':
      const eqCoordParam = command.get(eqCoordKey(keyName))
      return <FormattedParams values={eqCoordParam?.values.map(formatEqCoord)} role={keyTag} />

    case 'AltAzCoordKey':
      const solarSystemParams = command.get(altAzCoordKey(keyName))
      return <FormattedParams values={solarSystemParams?.values.map(formatAltAzCoord)} role={keyTag} />

    case 'CometCoordKey':
      const cometCoordParam = command.get(cometCoordKey(keyName))
      return <FormattedParams values={cometCoordParam?.values.map(formatCometCoord)} role={keyTag} />

    case 'MinorPlanetCoordKey':
      const minorPlantCoordParam = command.get(minorPlanetCoordKey(keyName))
      return <FormattedParams values={minorPlantCoordParam?.values.map(formatMinorPlanetCoord)} role={keyTag} />

    case 'SolarSystemCoordKey':
      const solarSystemCoordParam = command.get(solarSystemCoordKey(keyName))
      return <FormattedParams values={solarSystemCoordParam?.values.map(formatSolarSystemCoord)} role={keyTag} />

    case 'UTCTimeKey':
      const utcTimeParams = command.get(utcTimeKey(keyName))
      return (
        <FormattedParams
          role={keyTag}
          size={0}
          values={utcTimeParams?.values.map((value, index) => (
            <Typography.Text key={index}>{dateStringToISO(value)}</Typography.Text>
          ))}
        />
      )

    case 'TAITimeKey':
      const taiTimeParams = command.get(taiTimeKey(keyName))
      return (
        <FormattedParams
          role={keyTag}
          size={0}
          values={taiTimeParams?.values.map((value, index) => (
            <Typography.Text key={index}>{dateStringToISO(value)}</Typography.Text>
          ))}
        />
      )

    default:
      return (
        <div role={keyTag}>
          <Typography.Text>{parameter.values.map((value) => JSON.stringify(value)).join(', ')}</Typography.Text>
        </div>
      )
  }
}
