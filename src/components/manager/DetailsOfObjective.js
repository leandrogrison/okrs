import { useState, useEffect } from 'react'

import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Slider from '@mui/material/Slider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import DrawerCustom from '../general/DrawerCustom';
import DialogCreateKR from './DialogCreateKR';

function DetailsOfObjective({opened, objective, handleCloseDrawer}) {

  const [descriptionTruncate, setDescriptionTruncate] = useState(true)
  const [KRs, setKRs] = useState([])
  const [KRToEdit, setKRToEdit] = useState({})
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState([])
  const [updateProgress, setUpdateProgress] = useState(Math.random())
  const [updateTasks, setUpdateTasks] = useState(Math.random())

  const handleCheckTask = (indexKR, indexTask) => (event) => {
    let KRsToCheck = KRs
    KRsToCheck[indexKR].tasks[indexTask].checked = event.target.checked

    setKRs(KRsToCheck)
    setUpdateTasks(Math.random())
  }

  const handleOpenDeleteConfirmation = (kr) => {
    // setOpenDeleteConfirmation(true);
  }

  function getEachProgressOfKRs(data) {
    setProgress(data.map((KR) => { return KR.progress }))
  }
  
  function getKRs() {
    setLoading(true)
  }
  
  useEffect(() => {

    if (!opened || !loading) return

    let endPoint = `?krFromObjective=${objective.id}`

    fetch('http://localhost:5000/krs' + endPoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((resp) => resp.json())
      .then((data) => {
        setKRs(data)
        getEachProgressOfKRs(data)
        setLoading(false)
      })
      .catch((err) => {
        console.log(err)
        setLoading(false)
      })

  })

  const handleChangeProgress = (event, newValue) => {

    let newProgress = progress
    newProgress[parseFloat(event.target.name)] = newValue

    setProgress(newProgress)
    setUpdateProgress(Math.random())
  };

  const [showDialogCreateKR, setShowDialogCreateKR] = useState(false);
  const handleOpenDialogEditKR = (kr) => {
    // setKRToEdit(kr)
    // setShowDialogCreateKR(true);
  }
  const handleOpenDialogCreateKR = () => {
    setKRToEdit({})
    setShowDialogCreateKR(true);
  };
  const closeDialog = () => {
    setShowDialogCreateKR(false);
  };

  const closeDrawer = () => {
    opened = false
    handleCloseDrawer()
  };

  return (
    <DrawerCustom opened={opened}>
    {opened &&
      <Box sx={{ maxWidth: '420px', width: '420px' }}>
        <Grid container sx={{ p: 2, pr: 6 }}>
          <Typography sx={{ m: 0, py: 0, fontSize: 20 }}>{objective.name}</Typography>
          <Grid sx={{ width: '56px' }}>
            <IconButton
              aria-label="close"
              onClick={closeDrawer}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Grid>
        </Grid>
        {objective.description &&
          <Grid container sx={{ p: 2, pt: 0 }}>
            <Typography
              sx={{ fontSize: 12, cursor: 'pointer' }}
              noWrap={descriptionTruncate}
              onClick={() => setDescriptionTruncate(!descriptionTruncate)}
            >
              {objective.description}
            </Typography>
          </Grid>
        }
        <Grid container sx={{ p: 2, pt: 0 }}>
          <Box sx={{
            borderRight: '1px solid',
            borderColor: 'divider',
            pr: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Typography sx={{ fontSize: 12, mb: 1 }}>Responsável</Typography>
            <Tooltip title={objective.owner.name} placement="top">
              <Avatar alt={objective.owner.name} src={objective.owner.photo} sx={{ width: 48, height: 48 }} />
            </Tooltip>
          </Box>
          <Box sx={{ pl: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography sx={{ fontSize: 12, mb: 1 }}>Apoiadores</Typography>
            {
              (objective.supporters && objective.supporters.length > 0) ?
              <Box sx={{ display: 'flex' }}>
                {
                  objective.supporters.map((supporter) =>
                    <Tooltip title={supporter.name} placement="top" key={supporter.id} style={{ marginRight: '-10px' }}>
                      <Avatar alt={supporter.name} src={supporter.photo} sx={{ width: 48, height: 48 }} />
                    </Tooltip>
                  ) 
                }
              </Box> :
              <Box sx={{ fontSize: 14 }}>Nenhum colaborador cadastrado.</Box>
            }
          </Box>
        </Grid>
        <Box sx={{
          my: 2,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Grid container sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: '4px' }}>
            {
              KRs.length > 0 ?
              <>
                {KRs.length} KR{KRs.length > 1 && 's'} encontrado{KRs.length > 1 && 's'}
              </> :
              <>
                <ErrorOutlineOutlined color='warning' />
                Nenhum KR criado.
              </>
              }
            </Box>
            <Button onClick={handleOpenDialogCreateKR} startIcon={<AddIcon />} variant="contained" disableElevation>
              Criar KR
            </Button>
          </Grid>
          {
            KRs.length > 0 &&
            <List>
              {KRs.map((kr, indexKR) =>
                <ListItem
                  key={kr.id}
                  id={kr.id}
                  sx={{ mb: 2 }}
                >
                  <Grid container xs>
                    <Grid sx={{ mr: 1 }}>
                      <Tooltip title={kr.owner.name} placement="top">
                        <Avatar alt={kr.owner.name} src={kr.owner.photo} sx={{ width: 24, height: 24 }} />
                      </Tooltip>
                    </Grid>
                    <Grid xs>
                      {kr.name}
                      {kr.description && kr.description.length > 0 &&
                        <Tooltip title={kr.description} placement="top">
                          <InfoIcon fontSize="small" sx={{ ml: 1, verticalAlign: 'top' }} />
                        </Tooltip>
                      }
                      <Grid container sx={{ width: '100%', alignItems: 'flex-end' }}>
                        <Grid xs sx={{ pr: 2 }}>
                          <Slider
                            value={typeof progress[indexKR] === 'number' ? progress[indexKR] : 0}
                            onChange={handleChangeProgress}
                            name={`${indexKR}`}
                            aria-label="Default"
                          />
                        </Grid>
                        <Grid sx={{ alignSelf: 'center', pr: 1, textAlign: 'right' }} width={50} key={updateProgress}>
                          {progress[indexKR]}%
                        </Grid>
                        <Grid>
                          <Tooltip title="Editar KR" placement="top">
                            <IconButton onClick={handleOpenDialogEditKR(kr)} aria-label="Editar KR">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir KR" placement="top">
                            <IconButton onClick={handleOpenDeleteConfirmation(kr)} aria-label="Excluir KR">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </Grid>
                      {kr.tasks && kr.tasks.length > 0 &&
                        <>
                          <Typography fontSize={12}>{kr.tasks.length} tarefa{kr.tasks.length > 1 && 's'}</Typography>
                          <List dense>
                            {
                              kr.tasks.map((task, indexTask) => 
                                <ListItem key={task.id}>
                                  <FormControlLabel
                                    label={task.name}
                                    sx={{ marginLeft: -2 }}
                                    control={
                                      <Checkbox
                                        edge="start"
                                        checked={task.checked}
                                        onChange={handleCheckTask(indexKR, indexTask)}
                                        key={updateTasks}
                                      />
                                    }
                                  />
                                </ListItem>
                              )
                            }
                          </List>
                        </>
                      }
                    </Grid>
                  </Grid>
                </ListItem>
              )}
            </List>
          }
        </Box>
        <DialogCreateKR
          opened={showDialogCreateKR}
          KRToEdit={KRToEdit}
          objective={objective}
          handleCloseDialog={closeDialog}
          handleUpdateKR={getKRs}
        />
      </Box>
    }
    </DrawerCustom>
  )
}

export default DetailsOfObjective