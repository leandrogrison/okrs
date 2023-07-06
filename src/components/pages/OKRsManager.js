import moment from 'moment/moment';
import { useState, useEffect, forwardRef, useContext } from 'react'
import axios from 'axios';

// MATERIAL UI
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// ICONS
import ApartmentIcon from '@mui/icons-material/Apartment';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

// MY COMPONENTS
import ListOfObjectives from '../manager/ListOfObjectives';
import DetailsOfObjective from '../manager/DetailsOfObjective';
import DialogCreateObjective from '../manager/DialogCreateObjective';
import { UserContext } from '../user/UserAuth';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function getProgressStatus (objective) {
  if (!objective.conclusionPercent) {
    objective.conclusionPercent = 0
  }

  let status = ''
  let daysTotal = Math.abs(moment(objective.startDate).diff(objective.deadline, 'days'))
  let expectedDays = Math.abs(moment(objective.startDate).diff(objective.endDate ? moment(objective.endDate) : moment(), 'days'))
  let expectedValue = expectedDays / daysTotal * 100

  if (objective.conclusionPercent >= expectedValue || objective.conclusionPercent >= 100) {
    status = 'on-time'
  } else if (objective.conclusionPercent >= (0.75 * expectedValue)) {
    status = 'alert'
  } else {
    status = 'out-time'
  }

  return status
}

function OKRsManager() {
  const [cycleSelected, setCycleSelected] = useState('')
  const [cycles, setCycles] = useState([])
  const [objectives, setObjectives] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingCycles, setLoadingCycles] = useState(false)
  const [detailsOfObjective, setDetailsOfObjective] = useState({})
  const [objectToEdit, setObjectToEdit] = useState({})
  const [message, setMessage] = useState({ show: false, type: null, text: ''})
  const [searchValue, setSearchValue] = useState('')
  const [oldSearchValue, setOldSearchValue] = useState('')
  const [searchCompanyObjectives, setSearchCompanyObjectives] = useState(false)
  const [searchGroupObjectives, setSearchGroupObjectives] = useState(false)
  const [searchIndividualObjectives, setSearchIndividualObjectives] = useState(false)
  const [searchOwnerMe, setSearchOwnerMe] = useState(false)
  const [searchSupportMe, setSearchSupportMe] = useState(false)
  const [searchOnTime, setSearchOnTime] = useState(false)
  const [searchAlert, setSearchAlert] = useState(false)
  const [searchOutTime, setSearchOutTime] = useState(false)
  const userCurrent = useContext(UserContext)

  useEffect(() => {

    if (!loadingCycles) return

    axios.get('http://localhost:5000/objectives')
      .then((response) => {
        let cyclesData = []
        const currentCycle = { id: moment().format('Q[Q]YYYY'), name: moment().format('Q[° Trimestre ]YYYY') }
        cyclesData.push(currentCycle)
        response.data.forEach((obj) => {
          if (!cyclesData.some((cycleData) => cycleData.id === obj.cycle.id)) {
            cyclesData.push(obj.cycle)
          }
        })
        const sortedCycles = cyclesData.sort((a,b) =>
          moment(a.id.substring(2), 'YYYY').quarter(a.id.substring(0,1)).startOf('quarter').format('YYYYMMDD') + 
          moment(b.id.substring(2), 'YYYY').quarter(b.id.substring(0,1)).startOf('quarter').format('YYYYMMDD'))
        setCycles(sortedCycles)
        setCycleSelected(sortedCycles.length > 0 && cycleSelected === '' ? sortedCycles[0].id : cycleSelected)
        setLoadingCycles(false)
      })
      .catch((response) => console.log(response.err))
  }, [loadingCycles, cycles, cycleSelected])

  function getObjectives() {
    setLoading(true)
  }

  useEffect(() => {
    const delayToSearch = setTimeout(() => {
      if (oldSearchValue !== searchValue) {
        setOldSearchValue(searchValue)
        setLoading(true)
      }
    }, 600)

    return () => clearTimeout(delayToSearch)
  }, [searchValue, oldSearchValue])

  const handleSearchByName = (event) => {
    setSearchValue(event.target.value)
  }

  const handleChange = (event) => {
    if (event.target.name === 'ownerMe') {
      setSearchOwnerMe(!searchOwnerMe)
    }
    if (event.target.name === 'supportMe') {
      setSearchSupportMe(!searchSupportMe)
    }
    if (event.target.name === 'onTime') {
      setSearchOnTime(!searchOnTime)
    }
    if (event.target.name === 'alert') {
      setSearchAlert(!searchAlert)
    }
    if (event.target.name === 'outTime') {
      setSearchOutTime(!searchOutTime)
    }
    setLoading(true)
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setMessage({ show: false, type: null, text: ''});
  };

  const showMessage = (messageFromChild) => {
    setMessage(messageFromChild);
  };

  const mountAssociates = (data) => {
    let objectives = data

    const insertObjectiveInPosition = (objs, objective) => {
      objs.map((obj) => {
        if (obj.id === (objective.associate && objective.associate.id)) {
          if (!obj.children) {
            obj.children = []
          }
          obj.children.push(objective)
        } else if (obj.children) {
          insertObjectiveInPosition(obj.children, objective)
        }
        return objs
      })
      return objs
    }    
    
    const removeObjectivesChindren= (objs) => {
      return objs.filter( obj => !(obj.associate && obj.associate.id))
    }

    objectives.forEach(objective => {
      objectives = insertObjectiveInPosition(objectives, objective)
      objectives = removeObjectivesChindren(objectives)
    });

    return objectives
  }

  const setFilter = (filter) => {
    if (filter === 'company') {
      setSearchCompanyObjectives(!searchCompanyObjectives)
    }
    if (filter === 'group') {
      setSearchGroupObjectives(!searchGroupObjectives)
    }
    if (filter === 'individual') {
      setSearchIndividualObjectives(!searchIndividualObjectives)
    }
    setLoading(true)
  }

  useEffect(() => {

    if (!loading) return

    setLoadingCycles(true)

    let endPoint = `?cycle.id=${cycleSelected ? cycleSelected : moment().format('Q[Q]YYYY')}&`

    if (searchValue && searchValue.length > 0) endPoint = endPoint + 'name_like=' + searchValue + '&'
    if (searchCompanyObjectives) endPoint = endPoint + 'category.id=0&'
    if (searchGroupObjectives) endPoint = endPoint + 'category.id=1&'
    if (searchIndividualObjectives) endPoint = endPoint + 'category.id=2&'
    if (searchOwnerMe) endPoint = endPoint + 'owner.id=' + userCurrent.id + '&'
    if (searchSupportMe) endPoint = endPoint + 'supporters_like&'

    axios.get('http://localhost:5000/objectives' + endPoint)
      .then((response) => {
        if (
          (searchValue && searchValue.length > 0) ||
          searchCompanyObjectives ||
          searchGroupObjectives ||
          searchIndividualObjectives ||
          searchOwnerMe ||
          searchSupportMe ||
          searchOnTime ||
          searchAlert ||
          searchOutTime
        ) {
          if (searchSupportMe) {
            response.data = response.data.filter(obj => 
              obj.supporters.some(supporter => supporter.id === userCurrent.id)
            )
          }
          if (searchOnTime || searchAlert || searchOutTime) {
            const status = [searchOnTime && 'on-time', searchAlert && 'alert', searchOutTime && 'out-time']
            response.data = response.data.filter(obj => 
              getProgressStatus(obj) === status[0] ||
              getProgressStatus(obj) === status[1] ||
              getProgressStatus(obj) === status[2])
          }
          setObjectives(response.data)
        } else {
          setObjectives(mountAssociates(response.data))
        }
        setLoading(false)
      })
      .catch((response) => {
        console.log(response.err)
        setLoading(false)
      })

  }, [
    loading,
    searchValue,
    searchCompanyObjectives,
    searchGroupObjectives,
    searchIndividualObjectives,
    searchOwnerMe,
    searchSupportMe,
    searchOnTime,
    searchAlert,
    searchOutTime,
    userCurrent,
    cycleSelected
  ])

  const handleChangeCycleSelected = (event) => {
    setCycleSelected(event.target.value);
    setLoading(true)
  };

  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`view-tabpanel-${index}`}
        aria-labelledby={`view-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box>
            {children}
          </Box>
        )}
      </div>
    );
  }

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  function a11yProps(index) {
    return {
      id: `view-tab-${index}`,
      'aria-controls': `view-tabpanel-${index}`,
    };
  }

  const [viewSelected, setViewSelected] = useState(0);
  const handleChangeViewMode = (event, newValue) => {
    setViewSelected(newValue);
  };

  const [showDialogCreateObjective, setShowDialogCreateObjective] = useState(false);
  const handleOpenDialogCreateObjective = () => {
    setObjectToEdit({})
    setShowDialogCreateObjective(true);
  };
  const closeDialog = () => {
    setShowDialogCreateObjective(false);
  };

  const editObjective = (objective) => {
    setObjectToEdit(objective)
    setShowDialogCreateObjective(true);
  };

  const [showDetailsOfObjective, setShowDetailsOfObjective] = useState(false);
  const detailsObjective = (objective) => {
    setDetailsOfObjective(objective)
    setShowDetailsOfObjective(true);
  };
  const closeDrawer = () => {
    setShowDetailsOfObjective(false);
  }


  return (
    <div>
      <Grid
        container
        spacing={6}
        sx={{ mx: -3, my: 0, minHeight: '100px', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', backgroundColor: '#f2f2f2' }}>
        <Grid xs>
          <Typography sx={{ m: 0, py: 0, fontSize: 20 }}>Gestão de OKRs</Typography>
        </Grid>
        <Grid xs='auto'>
          <Button onClick={handleOpenDialogCreateObjective} startIcon={<AddIcon />} variant="contained" disableElevation>
            Criar objetivo
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ my: 2 }}>
        <Grid xs='auto'>
          <Box sx={{ pr: 2, borderRight: '1px solid', borderColor: 'divider', height: '100%' }}>
            <FormControl fullWidth sx={{ pb: 3 }}>
              <InputLabel id="objectivesOfCycle">Objetivos do ciclo:</InputLabel>
              <Select
                labelId="objectivesOfCycle"
                value={cycleSelected || ''}
                label="Objetivos do ciclo"
                onChange={handleChangeCycleSelected}
              >
                {cycles.length > 0 && 
                  cycles.map((cycle) =>
                    <MenuItem value={cycle.id} key={cycle.id}>{cycle.name}</MenuItem>
                  )
                }
              </Select>
            </FormControl>
            <Stack spacing={1}>
              <Button
                onClick={() => { setFilter('company') }}
                startIcon={<ApartmentIcon />}
                sx={{ justifyContent: 'flex-start' }}
                variant={searchCompanyObjectives ? 'contained' : 'outlined'}
                disableElevation
              >
                Objetivos de empresa
              </Button>
              <Button
                onClick={() => { setFilter('group') }}
                startIcon={<GroupsIcon />}
                sx={{ justifyContent: 'flex-start' }}
                variant={searchGroupObjectives ? 'contained' : 'outlined'}
                disableElevation
              >
                Objetivos de grupo
              </Button>
              <Button
                onClick={() => { setFilter('individual') }}
                startIcon={<PersonIcon />}
                sx={{ justifyContent: 'flex-start' }}
                variant={searchIndividualObjectives ? 'contained' : 'outlined'}
                disableElevation
              >
                Objetivos individuais
              </Button>
            </Stack>
            <Box sx={{ pt: 2 }}>
              <small>Exibir somente objetivos que:</small>
              <FormGroup>
                <FormControlLabel control={<Checkbox onChange={handleChange} name="ownerMe" />} label="Sou responsável" />
                <FormControlLabel control={<Checkbox onChange={handleChange} name="supportMe" />} label="Dou apoio" />
              </FormGroup>
            </Box>
            <Box sx={{ pt: 1 }}>
              <small>Status:</small>
              <FormGroup>
                <FormControlLabel control={<Checkbox onChange={handleChange} name="onTime" />} label="Dentro do prazo" />
                <FormControlLabel control={<Checkbox onChange={handleChange} name="alert" />} label="Em alerta" />
                <FormControlLabel control={<Checkbox onChange={handleChange} name="outTime" />} label="Fora do prazo" />
              </FormGroup>
            </Box>
          </Box>
        </Grid>
        <Grid xs>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Tabs value={viewSelected} onChange={handleChangeViewMode} aria-label="Modo de visualização dos objetivos">
                  <Tab label="Objetivos" {...a11yProps(0)} />
                  <Tab label="Mapa estratégico" {...a11yProps(1)} />
                </Tabs>
              </Box>
              <FormControl sx={{ width: '30%' }} variant="outlined">
                <InputLabel htmlFor="searchObjective" sx={{ '&[data-shrink="false"]': {transform: 'translate(14px, 9px)'} }}>Buscar objetivo ou responsável</InputLabel>
                <OutlinedInput
                  id="searchObjective"
                  type="search"
                  size="small"
                  onChange={handleSearchByName}
                  value={searchValue || ''}
                  endAdornment={
                    searchValue === '' &&
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Buscar objetivo ou responsável"
                        edge="end"
                        >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Buscar objetivo ou responsável"
                />
              </FormControl>
            </Box>
            <TabPanel value={viewSelected} index={0}>
              {
                loading || loadingCycles ?
                <CircularProgress sx={{ my: 4, mx: 'auto', display: 'block' }} /> :
                <ListOfObjectives
                  objectives={objectives}
                  handleUpdateObjectives={getObjectives}
                  handleShowDetailsOfObjective={detailsObjective}
                  handleEditObjective={editObjective}
                  handleShowMessage={showMessage}
                />
              }
            </TabPanel>
            <TabPanel value={viewSelected} index={1}>
              Item Two
            </TabPanel>
          </Box>
        </Grid>
      </Grid>

      <DetailsOfObjective
        key={detailsOfObjective.id}
        opened={showDetailsOfObjective}
        objective={detailsOfObjective}
        handleCloseDrawer={closeDrawer}
      />

      <DialogCreateObjective
        opened={showDialogCreateObjective}
        objectToEdit={objectToEdit}
        handleCloseDialog={closeDialog}
        handleUpdateObjectives={getObjectives}
      />

      <Snackbar open={message && message.show} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={(message && message.type) ? message.type : 'info'} sx={{ width: '100%' }}>
          {(message && message.text) ? message.text : ''}
        </Alert>
      </Snackbar>

    </div>
  )
}

export default OKRsManager