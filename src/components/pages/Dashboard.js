// MATERIAL UI
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import ReactECharts from 'echarts-for-react';

function Dashboard() {

  let
    option = {
      title: {
        text: 'Objetivos por tipo'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data: ['Empresa', 'Grupo', 'Individual']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: ['01/04', '14/04', '27/04', '02/05', '15/05', '01/06', '15/06', '30/06']
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: 'Empresa',
          type: 'line',
          emphasis: {
            focus: 'series'
          },
          data: [120, 132, 101, 134, 90, 230, 210]
        },
        {
          name: 'Grupo',
          type: 'line',
          emphasis: {
            focus: 'series'
          },
          data: [220, 182, 191, 234, 290, 330, 310]
        },
        {
          name: 'Individual',
          type: 'line',
          emphasis: {
            focus: 'series'
          },
          data: [150, 232, 201, 154, 190, 330, 410]
        }
      ]
    }

  return (
    <div>
      <Grid
        container
        spacing={6}
        sx={{ mx: -3, my: 0, minHeight: '100px', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', backgroundColor: '#f2f2f2' }}>
        <Grid xs>
          <Typography sx={{ m: 0, py: 0, fontSize: 20 }}>Dashboard</Typography>
        </Grid>
        <Grid xs='auto'>
          
        </Grid>
      </Grid>
      <Grid container spacing={6} sx={{ my: 2 }}>
        <Grid xs>
          <ReactECharts
            option={option}
            notMerge={true}
            lazyUpdate={true}
            style={{height: '400px', width: '100%'}}
          />
        </Grid>
      </Grid>
    </div>
  )
}

export default Dashboard