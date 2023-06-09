// MATERIAL UI
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';


function MyOKRs() {
  return (
    <div>
      <Grid
        container
        spacing={6}
        sx={{ mx: -3, my: 0, minHeight: '100px', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', backgroundColor: '#f2f2f2' }}>
        <Grid xs>
          <Typography sx={{ m: 0, py: 0, fontSize: 20 }}>Meus OKRs</Typography>
        </Grid>
        <Grid xs='auto'>
          
        </Grid>
      </Grid>
    </div>
  )
}

export default MyOKRs