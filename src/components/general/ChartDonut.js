
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function CircularProgressWithLabel(props) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" size={48} thickness={4} value={100} sx={{
        color: (theme) =>
        theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800], }}
      />
      <CircularProgress variant="determinate" size={48} thickness={4} {...props} sx={{ position: 'absolute' }} />
      <Box
        sx={{
          top: '1px',
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" component="div" color="text.secondary">
          {`${(Math.round(props.value * 10) / 10).toString().replace('.', ',')}%`}
        </Typography>
      </Box>
    </Box>
  );
}

CircularProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate variant.
   * Value between 0 and 100.
   * @default 0
   */
  value: PropTypes.number.isRequired,
};

function ChartDonut ({ objective, status }) {

  return (
    <CircularProgressWithLabel value={objective.conclusionPercent} color={status} />
  )
}

export default ChartDonut