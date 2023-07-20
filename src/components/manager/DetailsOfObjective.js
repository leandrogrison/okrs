import axios from 'axios';

import { useState, useEffect, forwardRef } from 'react'

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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText'
import LoadingButton from '@mui/lab/LoadingButton';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

import DrawerCustom from '../general/DrawerCustom';
import DialogCreateKR from './DialogCreateKR';
import ChartDonut from '../general/ChartDonut';
import getProgressStatus from '../general/StatusOfObjectives';
import getColorProgress from '../general/ColorOfStatus';
import daysToEnd from '../general/DaysToEnd';
import convertDate from '../general/ConvertDate';

function DetailsOfObjective({opened, objective, handleCloseDrawer, handleShowMessage, handleUpdateObjective}) {

  const [descriptionTruncate, setDescriptionTruncate] = useState(true)
  const [KRs, setKRs] = useState([])
  const [KRToEdit, setKRToEdit] = useState({})
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState([])
  const [updateProgress, setUpdateProgress] = useState(Math.random())
  const [updateTasks, setUpdateTasks] = useState(Math.random())
  const [updateObjective, setUpdateObjective] = useState(false)
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false)
  const [KRToDelete, setKRToDelete] = useState({})
  const [confirmedDeleteKR, setConfirmedDeleteKR] = useState(false)
  const [message, setMessage] = useState({ show: false, type: null, text: ''})

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setMessage({ show: false, type: null, text: ''});
  };

  const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const updateNumberOfKRs = () => {
    const numberOfKRs = Object.keys(KRToEdit).length ? KRs.length : KRs.length + 1
    const incrementProgress = Object.keys(KRToEdit).length ? progress : progress.push(0)
    const sumPercentOfKRs = progress.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const conclusionPercentOfObjective = (sumPercentOfKRs / progress.length) || 0;

    setProgress(incrementProgress)
    handleUpdateObjective({ ...objective, conclusionPercent: conclusionPercentOfObjective, numberOfKRs: numberOfKRs })
  }

  const handleCheckTask = (indexKR, indexTask) => (event) => {
    let KRsToCheck = KRs
    KRsToCheck[indexKR].tasks[indexTask].checked = event.target.checked

    setKRs(KRsToCheck)
    setUpdateTasks(Math.random())

    axios.put("http://localhost:5000/krs/" + KRsToCheck[indexKR].id, { ...KRsToCheck[indexKR] })
      .then((response) => {
        if (!Object.keys(response.data).length) {
          KRsToCheck[indexKR].tasks[indexTask].checked = !event.target.checked
          setKRs(KRsToCheck)
          setUpdateTasks(Math.random())
          setMessage({
            show: true,
            type: 'error',
            text: 'Erro ao salvar KR, tente novamente mais tarde.'
          });
        }
      })
      .catch((response) => {
        console.log(response.err)
        KRsToCheck[indexKR].tasks[indexTask].checked = !event.target.checked
        setKRs(KRsToCheck)
        setUpdateTasks(Math.random())
        setMessage({
          show: true,
          type: 'error',
          text: 'Erro ao salvar KR, tente novamente mais tarde.'
        });
      })
  }

  const handleOpenDeleteConfirmation = (kr) => {
    setKRToDelete(kr)
    setOpenDeleteConfirmation(true);
  }

  const handleCloseDeleteConfirmation = () => {
    setKRToDelete({})
    setOpenDeleteConfirmation(false);
    setConfirmedDeleteKR(false);
  }

  const handleGetProgressStatus = (objective) => {
    return getProgressStatus(objective);
  }

  const handleGetColorProgress = (status) => {
    return getColorProgress(status);
  }

  useEffect(() => {
    if (!confirmedDeleteKR) return

    axios.delete(`http://localhost:5000/krs/${KRToDelete.id}`)
    .then(() => {
      let KRsWithoutDeleted = KRs.filter( KR => KR.id !== KRToDelete.id )
      setKRs(KRsWithoutDeleted)
      getEachProgressOfKRs(KRsWithoutDeleted)
      setUpdateObjective(true)
      handleShowMessage({ show: true, type: 'success', text: `KR excluído com sucesso!`});
      handleCloseDeleteConfirmation();

    })
    .catch(() => {
      handleShowMessage({ show: true, type: 'error', text: `Erro ao excluir KR, tente novamente mais tarde.`});
      handleCloseDeleteConfirmation();
    })
  })

  useEffect(() => {
    if (!updateObjective) return

    const sumPercentOfKRs = progress.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const conclusionPercentOfObjective = (sumPercentOfKRs / progress.length) || 0;
    handleUpdateObjective({ ...objective, conclusionPercent: conclusionPercentOfObjective, numberOfKRs: KRs.length})
    setUpdateObjective(false)
  }, [updateObjective, handleUpdateObjective, objective, progress, KRs])

  function getEachProgressOfKRs(data) {
    setProgress(data.map((KR) => { return KR.progress }))
  }
  
  function getKRs() {
    setLoading(true)
  }
  
  useEffect(() => {

    if (!opened || !loading) return

    let endPoint = `?krFromObjective=${objective.id}`

    axios.get('http://localhost:5000/krs' + endPoint)
      .then((response) => {
        setKRs(response.data)
        getEachProgressOfKRs(response.data)
        setLoading(false)
      })
      .catch((response) => {
        console.log(response.err)
        setLoading(false)
      })

  })

  const handleSaveProgress = (kr, index) => (event, newValue) => {
    let newProgress = progress
    let oldValue = kr.progress
    let updateKRs = KRs

    newProgress[index] = newValue
    updateKRs[index].progress = newValue

    const sumPercentOfKRs = newProgress.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const conclusionPercentOfObjective = (sumPercentOfKRs / KRs.length) || 0;

    setProgress(newProgress)
    setKRs(updateKRs)
    setUpdateProgress(Math.random())
    
    axios.put("http://localhost:5000/krs/" + kr.id, { ...kr, ...{ progress: newValue } })
    .then((response) => {
      handleUpdateObjective({ ...objective, conclusionPercent: conclusionPercentOfObjective, numberOfKRs: KRs.length })
      if (Object.keys(response.data).length === 0) {
        newProgress[index] = oldValue
        updateKRs[index].progress = oldValue
        setProgress(newProgress)
        setKRs(updateKRs)
        setUpdateProgress(Math.random())
        setMessage({
          show: true,
          type: 'error',
          text: 'Erro ao salvar KR, tente novamente mais tarde.'
        });
      }
    })
    .catch((response) => {
      console.log(response.err)
      newProgress[index] = oldValue
      updateKRs[index].progress = oldValue
      setProgress(newProgress)
      setKRs(updateKRs)
      setUpdateProgress(Math.random())
      setMessage({
        show: true,
        type: 'error',
        text: 'Erro ao salvar KR, tente novamente mais tarde.'
      });
    })
  }

  const handleChangeProgress = (index) => (event, newValue) => {
    let newProgress = progress
    newProgress[index] = newValue

    setProgress(newProgress)
    setUpdateProgress(Math.random())
  };

  const [showDialogCreateKR, setShowDialogCreateKR] = useState(false);
  const handleOpenDialogEditKR = (kr) => {
    setKRToEdit(kr)
    setShowDialogCreateKR(true);
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
      <Box sx={{ width: '100%' }}>
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
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <ChartDonut objective={objective} status={handleGetColorProgress(handleGetProgressStatus(objective))} />
          <Box>
            Percentual de conclusão
            <Tooltip title={'Prazo: ' + convertDate(objective.deadline)} placement="top-end">
              <Typography sx={{ mb: .5, fontSize: '0.8em'}}>
                Restam {daysToEnd(objective.deadline)} dias
              </Typography>
            </Tooltip>
          </Box>
        </Box>
        <Box sx={{
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
                            value={progress[indexKR] ?? 0}
                            onChange={handleChangeProgress(indexKR)}
                            onChangeCommitted={handleSaveProgress(kr, indexKR)}
                            aria-label="Default"
                          />
                        </Grid>
                        <Grid sx={{ alignSelf: 'center', pr: 1, textAlign: 'right' }} width={50} key={updateProgress}>
                          {progress[indexKR]}%
                        </Grid>
                        <Grid>
                          <Tooltip title="Editar KR" placement="top">
                            <IconButton onClick={() => handleOpenDialogEditKR(kr)} aria-label="Editar KR">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir KR" placement="top">
                            <IconButton onClick={() => handleOpenDeleteConfirmation(kr)} aria-label="Excluir KR">
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
          handleUpdateNumberOfKRs={updateNumberOfKRs}
        />

        <Dialog
          open={openDeleteConfirmation}
          onClose={handleCloseDeleteConfirmation}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Deseja excluir este KR?"}
          </DialogTitle>
          <DialogContent>
            {(KRToDelete.progress > 0) &&
              <DialogContentText id="alert-dialog-description">
                <strong>Importante: </strong>
                O percentual de conclusão deste KR já foi alterado, portanto, a exclusão deste KR irá alterar o percentual de conclusão do objetivo.
              </DialogContentText>
            }
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDeleteConfirmation}>Cancelar</Button>
            {confirmedDeleteKR
              ?
                <LoadingButton loading variant="contained" loadingPosition="start" startIcon={<SaveIcon />}>
                  Excluindo...
                </LoadingButton>
              :
                <Button onClick={() => setConfirmedDeleteKR(true)} variant="contained" color="error" autoFocus>
                  Excluir
                </Button>
            }
          </DialogActions>
        </Dialog>

        <Snackbar open={message && message.show} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={(message && message.type) ? message.type : 'info'} sx={{ width: '100%' }}>
            {(message && message.text) ? message.text : ''}
          </Alert>
        </Snackbar>
      </Box>

    }
    </DrawerCustom>
  )
}

export default DetailsOfObjective