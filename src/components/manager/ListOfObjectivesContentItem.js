import moment from 'moment/moment';
import axios from 'axios';
import { useEffect, useState, useCallback, useMemo } from "react"
import styles from './ListOfObjectivesContentItem.module.scss'

// MATERIAL UI
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText'
import LoadingButton from '@mui/lab/LoadingButton';
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';


// ICONS
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ApartmentIcon from '@mui/icons-material/Apartment';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

const customChip = createTheme({
  components: {
    MuiChip: {
      variants: [
        {
          props: { variant: 'noText' },
          style: {
            '& > .MuiChip-label': {
              paddingRight: 0
            }
          },
        }
      ],
    },
  },
});

function getKRsFinished (krs) {
  return (krs.filter((kr) => kr.finished === 1 )).length
}

function getColorProgress (status) {
  let result = 'secondary'
  if (status === 'on-time') {
    result = 'success'
  } else if (status === 'alert') {
    result = 'warning'
  } else if (status === 'out-time') {
    result = 'error'
  }
  return result
}

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

function daysToEnd(deadline) {
  return Math.abs(moment().diff(deadline, 'days'))
}

function convertDecimals(value) {
  return value.toString().replace('.', ',')
}

function convertDate(date) {
  return moment(date).format('DD/MM/YYYY')
}

function ListOfObjectivesContentItem({ objective, handleUpdateObjectives, handleShowDetailsOfObjective, handleEditObjective, handleShowMessage }) {

  const [expandedItem, setExpandedItem] = useState(false)
  const [confirmedDeleteObjective, setConfirmedDeleteObjective] = useState(false)
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false)
  const [notDeletedObjectives, setNotDeletedObjectives] = useState(0)
  const [deletedObjectives, setDeletedObjectives] = useState(0)

  useMemo(() => {
    const expanded = localStorage.getItem(objective.id);

    if (expanded === 'true' && objective.children && objective.children.length > 0) {
      setExpandedItem(expanded)
    }
  }, [objective])

  function expandItem(e) {
    localStorage.setItem(objective.id, !expandedItem);
    setExpandedItem(!expandedItem)
  }

  function detailsObjective() {
    handleShowDetailsOfObjective(objective)
  }

  function editObjective() {
    handleEditObjective(objective)
  }

  const handleOpenDeleteConfirmation = () => {
    setOpenDeleteConfirmation(true);
  }

  const handleCloseDeleteConfirmation = () => {
    setOpenDeleteConfirmation(false);
  }

  const deleteObjective = useCallback((objectiveToDelete) => {
    axios.delete(`http://localhost:5000/objectives/${objectiveToDelete.id}`)
    .then(() => {
      setDeletedObjectives(deletedObjectives + 1)
    })
    .catch(() => {
      setNotDeletedObjectives(notDeletedObjectives + 1)
    })
  }, [deletedObjectives, notDeletedObjectives])

  const objectivesToDelete = useCallback((objectiveToDelete) => {
    if (objectiveToDelete.children && objectiveToDelete.children.length > 0) {
      objectiveToDelete.children.forEach((objectiveToDeleteChild) => {
        objectivesToDelete(objectiveToDeleteChild)
      })
    }
    deleteObjective(objectiveToDelete)
  }, [deleteObjective])

  useEffect(() => {

    if (notDeletedObjectives > 0) {
      handleShowMessage({ show: true, type: 'error', text: `Erro ao excluir objetivo, tente novamente mais tarde.`});
      setOpenDeleteConfirmation(false)
      handleUpdateObjectives()
    }

    if (deletedObjectives > 0) {
      handleShowMessage({ show: true, type: 'success', text: `Objetivo excluído com sucesso!`});
      setOpenDeleteConfirmation(false)
      handleUpdateObjectives()
    }

    if (confirmedDeleteObjective) {
      objectivesToDelete(objective)
      setConfirmedDeleteObjective(false)
    }
      
  }, [confirmedDeleteObjective, objectivesToDelete, objective, notDeletedObjectives, deletedObjectives, handleUpdateObjectives, handleShowMessage])
    
  return (
    <CssVarsProvider>
      <Box className={styles['tree-view']}>
        <Box
          className={`
            ${styles['tree-view-item']}
            ${expandedItem && styles['tree-view-item-expanded']}
            ${confirmedDeleteObjective && styles['tree-view-item-disabled']}
          `}
        >
          <Box className={styles['tree-view-icon']}>
            {(objective.children && objective.children.length > 0) &&
              <>
                {(!expandedItem && <AddIcon onClick={expandItem} className={styles['icon-expand']} /> )}
                {(expandedItem && <RemoveIcon onClick={expandItem} className={styles['icon-expand']} /> )}
              </>
            }
          </Box>
          <Box sx={{ flex: 'auto' }}>
            <Typography sx={{ pb: 2, fontSize: '20px' }}>{objective.name}</Typography>
            <Box sx={{ display: 'flex' }}>
              <ThemeProvider theme={customChip}>
                { objective.category.id === 0 &&
                  <Tooltip title={objective.category.name} placement="top">
                    <Chip size="small" variant="noText" icon={<ApartmentIcon fontSize="small" />} sx={{ mr: 1 }} />
                  </Tooltip>
                }
                { objective.category.id === 1 &&
                  <Tooltip title={objective.category.name} placement="top">
                    <Chip size="small" variant="noText" icon={<GroupsIcon fontSize="small" />} sx={{ mr: 1 }} />
                  </Tooltip>
                }
                { objective.category.id === 2 &&
                  <Tooltip title={objective.category.name} placement="top">
                    <Chip size="small" variant="noText" icon={<PersonIcon fontSize="small" />} sx={{ mr: 1 }} />
                  </Tooltip>
                }
              </ThemeProvider>
              <Chip label={objective.finished ? 'Finalizado' : 'Em aberto'} color="default" size="small" sx={{ mr: 1 }} />
              <Avatar alt={objective.owner.name} src={objective.owner.photo} sx={{ width: 24, height: 24, mr: 1 }} />
              { objective.owner.name &&
                <Typography><small><strong>{objective.owner.name}</strong></small></Typography>
              }
            </Box>
            <Stack direction="row" spacing={1} sx={{ pt: 2, alignItems: 'center' }}>
              <Box>
                <Button onClick={detailsObjective} variant="outlined" size="small">Mais detalhes</Button>
              </Box>
              <Tooltip title="Editar objetivo" placement="top">
                <IconButton onClick={editObjective} aria-label="Editar objetivo">
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Excluir objetivo" placement="top">
                <IconButton onClick={handleOpenDeleteConfirmation} aria-label="Excluir objetivo">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
          { objective.deadline && 
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box>
              <Tooltip title={'Prazo: ' + convertDate(objective.deadline)} placement="top-end">
                <Typography sx={{ mb: .5, fontSize: '0.8em', textAlign: 'right' }}>
                  Restam {daysToEnd(objective.deadline)} dias
                </Typography>
              </Tooltip>
              <LinearProgress variant="determinate" value={objective.conclusionPercent} color={getColorProgress(getProgressStatus(objective))} sx={{ width: '200px', height: '8px' }} />
              {(objective.krs && objective.krs.length) &&
                <Typography sx={{ mt: .5, fontSize: '0.8em', textAlign: 'right' }}>
                  {getKRsFinished(objective.krs)} de {objective.krs.length} KRs completos
                </Typography>
              }
              {(!objective.krs || objective.krs.length === 0) &&
                <Typography sx={{ mt: .5, fontSize: '0.8em', textAlign: 'right' }}>
                  Nenhum KR cadastrado
                </Typography>
              }
            </Box>
            <Typography color={getColorProgress(getProgressStatus(objective)) + '.main'} sx={{ fontWeight: 'bold', ml: 1, width: '2.5em', textAlign: 'right' }}>
              {convertDecimals(objective.conclusionPercent)}%
            </Typography>
          </Box>
          }
        </Box>
        {(objective.children && objective.children.length > 0 && expandedItem) && 
          objective.children.map((child) => 
            <ListOfObjectivesContentItem
              objective={child}
              key={child.id}
              handleUpdateObjectives={handleUpdateObjectives}
              handleShowDetailsOfObjective={handleShowDetailsOfObjective}
              handleEditObjective={handleEditObjective}
              handleShowMessage={handleShowMessage}
            />
          )
        }
      </Box>

      <Dialog
        open={openDeleteConfirmation}
        onClose={handleCloseDeleteConfirmation}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Deseja excluir este objetivo?"}
        </DialogTitle>
        <DialogContent>
          {(objective.children && objective.children.length > 0) &&
            <DialogContentText id="alert-dialog-description">
              <strong>Importante: </strong>
              Há objetivos associados a este, ao confirmar a exclusão estes objetivos também serão excluídos!
            </DialogContentText>
          }
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDeleteConfirmation}>Cancelar</Button>
          {confirmedDeleteObjective 
            ?
              <LoadingButton loading variant="contained" loadingPosition="start" startIcon={<SaveIcon />}>
                Excluindo...
              </LoadingButton>
            :
              <Button onClick={() => setConfirmedDeleteObjective(true)} variant="contained" color="error" autoFocus>
                Excluir
              </Button>
          }
        </DialogActions>
      </Dialog>

    </CssVarsProvider>
  )
}

export default ListOfObjectivesContentItem