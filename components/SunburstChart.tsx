import { Dispatch, SetStateAction } from 'react'
import { ResponsiveSunburst } from '@nivo/sunburst'
import { Card, Skeleton, useTheme, Typography } from '@mui/material'

import styles from '../styles/Home.module.css'
import { CenteredSunburstMetric } from './CenteredMetric'
import { GroupedUserBalances } from '../lib/types/delegate'
import { kFormatter } from '../lib/helpers'
import getTheme from '../lib/nivo/theme'

type Props = {
  title: string
  data: GroupedUserBalances | undefined
  customColors: string[]
  setSelectedAddress: Dispatch<SetStateAction<string | null>>
  setSelectedDelegate: Dispatch<SetStateAction<string | null>>
}

const SunburstChart = ({
  title,
  data,
  customColors,
  setSelectedAddress,
  setSelectedDelegate,
}: Props): JSX.Element => {
  const theme = useTheme()

  return (
    <div className={styles.chartCard}>
      <Typography
        component='h3'
        variant='h6'
        gutterBottom
        sx={{ color: (theme) => theme.palette.text.primary }}
      >
        {title}
      </Typography>
      <Card className={styles.pieChartContainer}>
        {!data ? (
          <Skeleton
            variant='rectangular'
            height={'calc(100% - 1.7em)'}
            sx={{ mt: '1.7em' }}
            animation='wave'
          />
        ) : (
          <ResponsiveSunburst
            data={{
              name: 'vote weights',
              children: [
                {
                  name: 'Recognized delegates',
                  children: data.recognizedDelegates.map((usr) => ({
                    name: usr.name,
                    amount: usr.amount,
                  })),
                },
                {
                  name: 'Shadow delegates',
                  children: data.shadowDelegates.map((usr) => ({
                    name: usr.address,
                    amount: usr.amount,
                  })),
                },
                {
                  name: 'Users',
                  children: data.users.map((usr) => ({
                    name: usr.address,
                    amount: usr.amount,
                  })),
                },
              ],
            }}
            id='name'
            value='amount'
            theme={getTheme(theme)}
            margin={{ top: 35, bottom: 10 }}
            borderWidth={1}
            borderColor={{ theme: 'background' }}
            colors={customColors}
            childColor={{ from: 'color', modifiers: [['brighter', 0.3]] }}
            enableArcLabels={true}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{
              from: 'color',
              modifiers: [['darker', 2.5]],
            }}
            tooltip={(datum) => (
              <Card className={styles.chartTooltip}>
                <span
                  className={styles.tooltipCircle}
                  style={{ backgroundColor: datum.color }}
                ></span>
                <span>
                  {datum.data.name.length === 42 &&
                  datum.data.name.startsWith('0x')
                    ? datum.data.name.slice(0, 12) +
                      '...' +
                      datum.data.name.slice(38)
                    : datum.data.name}
                  :{' '}
                  <b>
                    {kFormatter(datum.value, 2)} MKR | {datum.formattedValue}
                  </b>
                </span>
              </Card>
            )}
            onClick={(slice) => {
              if (slice.depth !== 2) return
              if (slice.path[1] === 'Recognized delegates') {
                const foundDelegate = data.recognizedDelegates.find(
                  (del) => del.name === slice.id
                )
                if (!foundDelegate) return
                setSelectedAddress(foundDelegate.address)
                setSelectedDelegate(foundDelegate.name)
              } else {
                setSelectedAddress(slice.id as string)
                setSelectedDelegate(null)
              }
            }}
            layers={['arcs', 'arcLabels', CenteredSunburstMetric]}
          />
        )}
      </Card>
    </div>
  )
}

export default SunburstChart
