import styles from './CyclesSelect.module.scss'
import moment from 'moment';

import { useState, useRef, useEffect } from 'react'

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';


function CyclesSelect ({ objectToEdit, handleUpdateObjective }) {

  const formatId = 'Q[Q]YYYY';
  const formatName = 'Q[° Trimestre ]YYYY';
  const [cycle, setCycle] = useState(
    (objectToEdit && Object.keys(objectToEdit).length > 0) ?
      objectToEdit.cycle : { id: moment().format(formatId), name: moment().format(formatName) }
  );

  const handleChange = (event, newCycle) => {
    if (newCycle !== null) {
      setCycle(newCycle);
      handleUpdateObjective(newCycle)
    }
  };

  const [quarters, setQuarters] = useState([
    { id: moment().subtract(8, 'Q').format(formatId), name: moment().subtract(8, 'Q').format(formatName)},
    { id: moment().subtract(7, 'Q').format(formatId), name: moment().subtract(7, 'Q').format(formatName)},
    { id: moment().subtract(6, 'Q').format(formatId), name: moment().subtract(6, 'Q').format(formatName)},
    { id: moment().subtract(5, 'Q').format(formatId), name: moment().subtract(5, 'Q').format(formatName)},
    { id: moment().subtract(4, 'Q').format(formatId), name: moment().subtract(4, 'Q').format(formatName)},
    { id: moment().subtract(3, 'Q').format(formatId), name: moment().subtract(3, 'Q').format(formatName)},
    { id: moment().subtract(2, 'Q').format(formatId), name: moment().subtract(2, 'Q').format(formatName)},
    { id: moment().subtract(1, 'Q').format(formatId), name: moment().subtract(1, 'Q').format(formatName)},
    { id: moment().format(formatId), name: moment().format(formatName)},
    { id: moment().add(1, 'Q').format(formatId), name: moment().add(1, 'Q').format(formatName)},
    { id: moment().add(2, 'Q').format(formatId), name: moment().add(2, 'Q').format(formatName)},
    { id: moment().add(3, 'Q').format(formatId), name: moment().add(3, 'Q').format(formatName)},
    { id: moment().add(4, 'Q').format(formatId), name: moment().add(4, 'Q').format(formatName)},
    { id: moment().add(5, 'Q').format(formatId), name: moment().add(5, 'Q').format(formatName)},
    { id: moment().add(6, 'Q').format(formatId), name: moment().add(6, 'Q').format(formatName)},
    { id: moment().add(7, 'Q').format(formatId), name: moment().add(7, 'Q').format(formatName)},
    { id: moment().add(8, 'Q').format(formatId), name: moment().add(8, 'Q').format(formatName)}
  ])

  const buttonsCycles = useRef();
  const [cyclesScrollInitial, setCyclesScrollInitial] = useState(true);

  if (cyclesScrollInitial) {
    setCyclesScrollInitial(false)
    setTimeout(() => {
      if (buttonsCycles.current) {
        buttonsCycles.current.scrollTo({ left: document.getElementById(cycle.id).offsetLeft - 48 })
      }
    }, 100);
  }

  function verifyCycleSelected (quarter) {
    return quarter.id === cycle.id
  }
  
  const [cycleFirstQuarter, setCycleFirstQuarter] = useState(9);
  const [cycleLastQuarter, setCycleLastQuarter] = useState(9);
  const [cycleSelectedInScroll, setCycleSelectedInScroll] = useState(cycle);
  const [cycleSelectedInScrollOld, setCycleSelectedInScrollOld] = useState(cycle);

  function moveCycles (direction) {
    const indexOfScroll = quarters.findIndex((quarter) => quarter.id === cycleSelectedInScroll.id)
    setCycleSelectedInScrollOld(cycleSelectedInScroll)

    if (direction === 'toLeft') {
      setCycleFirstQuarter(cycleFirstQuarter + 1)
      setQuarters(quarters => [{ id: moment().subtract(cycleFirstQuarter, 'Q').format(formatId), name: moment().subtract(cycleFirstQuarter, 'Q').format(formatName)}, ...quarters])
      setCycleSelectedInScroll(quarters[indexOfScroll - 1])
    } else {
      setCycleLastQuarter(cycleLastQuarter + 1)
      setQuarters(quarters => [...quarters, { id: moment().add(cycleLastQuarter, 'Q').format(formatId), name: moment().add(cycleLastQuarter, 'Q').format(formatName)}])
      setCycleSelectedInScroll(quarters[indexOfScroll + 1])
    }
  }
  useEffect(() => {
    buttonsCycles.current.scrollTo({ left: document.getElementById(cycleSelectedInScrollOld.id).offsetLeft - 48 })
    buttonsCycles.current.scrollTo({ left: document.getElementById(cycleSelectedInScroll.id).offsetLeft - 48, behavior: 'smooth' })
  },[cycleSelectedInScroll, cycleSelectedInScrollOld])

  return (
    <Box className={styles.cycles}>
      <IconButton onClick={() => moveCycles('toLeft')} sx={{ mr: 1 }} aria-label="Mover para esquerda">
        <ChevronLeftIcon />
      </IconButton>
      <ToggleButtonGroup
        color="primary"
        value={cycle}
        exclusive
        fullWidth
        onChange={handleChange}
        className={styles['cycles-container']}
        aria-label="Ciclo"
        id="cyclesPanel"
        ref={buttonsCycles}
      >
        {quarters.length > 0 && 
          quarters.map((quarter, index) =>
            <ToggleButton
              id={quarter.id}
              value={quarter}
              key={quarter.id}
              selected={verifyCycleSelected(quarter)}
              className={styles['cycles-button-quarter']}
            >
              {quarter.name}
            </ToggleButton>
          )
        }
      </ToggleButtonGroup>
      <IconButton onClick={() => moveCycles('toRight')} sx={{ ml: 1 }} aria-label="Mover para direita">
        <ChevronRightIcon />
      </IconButton>
    </Box>
  )
}

export default CyclesSelect