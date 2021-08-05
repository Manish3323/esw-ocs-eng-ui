import { Card, Col, Row, Typography } from 'antd'
import React from 'react'
import { Link } from 'react-router-dom'
import { InfraIcon, ResourceIcon, TelescopeIcon } from '../../components/icons'
import { SMCard } from '../../features/sm/components/smcard/SMCard'
import { INFRASTRUCTURE, OBSERVATIONS, RESOURCES } from '../../routes/RoutesConfig'
import styles from './home.module.css'

type CardDetail = {
  title: string
  icon: JSX.Element
  link: string
}

const HomePageCard = (card: CardDetail) => (
  <Col xs={24} md={12} xl={8}>
    <Link role={card.title} to={card.link}>
      <Card hoverable>
        {card.icon}
        <Typography.Title className={styles.cardTitle} level={3}>
          {card.title}
        </Typography.Title>
      </Card>
    </Link>
  </Col>
)

const InfraCard = HomePageCard({
  title: 'Manage Infrastructure',
  icon: <InfraIcon className={styles.commonIconSize} fill={'var(--activeColor)'} />,
  link: INFRASTRUCTURE
})

const ObservationCard = HomePageCard({
  title: 'Manage Observations',
  icon: <TelescopeIcon className={styles.commonIconSize} fill={'var(--purple)'} />,
  link: OBSERVATIONS
})

const ResourcesCard = HomePageCard({
  title: 'Resources',
  icon: <ResourceIcon className={styles.settingsIcon} />,
  link: RESOURCES
})

const SMCardRow = (
  <Row justify='center'>
    <Col xs={24} className={styles.smCard}>
      {<SMCard />}
    </Col>
  </Row>
)

const HomePageCards = (
  <Row gutter={[32, 32]} className={styles.homePageCardsRow}>
    {InfraCard}
    {ObservationCard}
    {ResourcesCard}
  </Row>
)

export const Home = (): JSX.Element => (
  <>
    {SMCardRow}
    {HomePageCards}
  </>
)
