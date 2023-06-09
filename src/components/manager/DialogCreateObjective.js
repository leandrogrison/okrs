import { useState, useEffect, useContext, useCallback, forwardRef } from 'react'

import moment from 'moment';
import {v4 as uuidv4} from 'uuid'

import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormLabel from '@mui/material/FormLabel';
import Tooltip from '@mui/material/Tooltip';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

import { UserContext } from '../user/UserAuth';
import CyclesSelect from '../general/CyclesSelect';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(2),
  },
}));

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function BootstrapDialogTitle(props) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

BootstrapDialogTitle.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
};

function DialogCreateObjective({ opened, objectToEdit, handleCloseDialog, handleUpdateObjectives }) {

  const [categories, setCategories] = useState([]);
  const [openDropdownOwner, setOpenDropdownOwner] = useState(false);
  const [openDropdownSupporters, setOpenDropdownSupporters] = useState(false);
  const [openDropdownAssociate, setOpenDropdownAssociate] = useState(false);
  const [users, setUsers] = useState([]);
  const [ownerMe, setOwnerMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [message, setMessage] = useState({ show: false, type: null, text: ''});
  const [objectivesToAssociate, setObjectivesToAssociate] = useState([]);
  const loadingOwner = openDropdownOwner && users.length === 0;
  const loadingSupporters = openDropdownSupporters && users.length === 0;
  const loadingAssociate = openDropdownAssociate && objectivesToAssociate.length === 0;
  const userCurrent = useContext(UserContext);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setMessage({ show: false, type: null, text: ''});
  };

  const formatId = 'Q[Q]YYYY';
  const formatName = 'Q[° Trimestre ]YYYY';
  const [objective, setObjective] = useState({cycle: { id: moment().format(formatId), name: moment().format(formatName)}})

  useEffect(() => {
    if (opened && objectToEdit && Object.keys(objectToEdit).length > 0) {
      let objectToEditClone = JSON.parse(JSON.stringify(objectToEdit))
      if (objectToEdit.children) {
        delete objectToEditClone.children
      }
      setObjective(objectToEditClone)
      setOwnerMe(objectToEditClone.owner.id === userCurrent.id)
    }
  },[objectToEdit, opened, userCurrent]);

  const listObjectivesToAssociate = useCallback((objectives) => {
    objectives.forEach(objectiveToAssociate => {
      if (objectiveToAssociate.category.id <= objective.category.id && (objectiveToAssociate.id !== objective.id)) {
        setObjectivesToAssociate(objectivesToAssociate => [...objectivesToAssociate, {
          categoryGroup: objectiveToAssociate.category.name,
          id: objectiveToAssociate.id,
          name: objectiveToAssociate.name
        }])
      }
      if (objectiveToAssociate.children && objectiveToAssociate.children.length > 0) {
        listObjectivesToAssociate(objectiveToAssociate.children)
      }
    });
  }, [objective])

  useEffect(() => {

    let active = true;

    if (!loadingAssociate) {
      return undefined;
    }

    (async () => {
      await fetch('http://localhost:5000/objectives', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((resp) => resp.json())
        .then((data) => {
          if (active) {
            listObjectivesToAssociate(data)
          }
        })
        .catch((err) => console.log(err))
    })();

    return () => {
      active = false;
    };

  }, [loadingAssociate, listObjectivesToAssociate])

  useEffect(() => {
    if (!openDropdownAssociate) {
      setObjectivesToAssociate([]);
    }
  }, [openDropdownAssociate]);

  useEffect(() => {

    fetch('http://localhost:5000/categories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((resp) => resp.json())
      .then((data) => {
        setCategories(data)
      })
      .catch((err) => console.log(err))

  }, []);

  function getUsers() {
    fetch('http://localhost:5000/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((resp) => resp.json())
      .then((data) => {
        setUsers(data)
        // setRemoveLoading(true)
      })
      .catch((err) => console.log(err))
  }

  useEffect(() => {
    if (!loadingOwner) {
      return undefined;
    }
    getUsers()
  },[loadingOwner]);

  useEffect(() => {
    if (!loadingSupporters) {
      return undefined;
    }
    getUsers()
  },[loadingSupporters]);

  const handleCategory = (event) => {
    setObjective({ ...objective, category: {
      id: event.target.value,
      name: categories.find(category => category.id === event.target.value).name
    } })
  }

  const handleChange = (event) => {
    setObjective({ ...objective, [event.target.name]: event.target.value })
  }

  const handleOwner = (value) => {
    setObjective({ ...objective, owner: value})
    if (!value) {
      setOwnerMe(false)
    } else if (value && value.id === userCurrent.id) {
      setOwnerMe(true)
    } else {
      setOwnerMe(false)
    }
  }

  const handleOwnerMe = (event) => {
    if (event.target.checked) {
      handleOwner(userCurrent)
    } else {
      handleOwner(null)
    }
  }

  const handleSupporters = (value) => {
    setObjective({ ...objective, supporters: value})
  }

  const handleUpdateCycle = (value) => {
    setObjective({ ...objective, cycle: value})
  }

  const handleAssociate = (value) => {
    if (value) {
      setObjective({ ...objective, associate: {id: value.id, name: value.name}})
    } else {
      setObjective({ ...objective, associate: {}})
    }
  }

  function getOnwerPhoto(owner) {
    let result = ''
    if (owner === userCurrent.name) {
      result = userCurrent.photo
    } else if (users.find(user => user.name === owner)) {
      result = users.find(user => user.name === owner).photo
    }
    return result
  }

  const GroupHeader = styled('div')(({ theme }) => ({
    position: 'sticky',
    top: '-8px',
    padding: '4px 10px',
    fontSize: '.9em',
    color: theme.palette.text.disabled,
    backgroundColor: theme.palette.grey[100]
  }));
  
  const GroupItems = styled('ul')({
    padding: 0,
  });

  function validateForm() {

    let fieldsWithErrors = {}

    if (!objective.hasOwnProperty('name') || objective.name.length === 0) {
      fieldsWithErrors.name = ''
    }
    
    if (!objective.hasOwnProperty('category') || objective.category.length === 0) {
      fieldsWithErrors.category = ''
    }
    
    if (!objective.hasOwnProperty('owner') || objective.owner.name.length === 0) {
      fieldsWithErrors.owner = {id: 0, name: '', photo: null}
    }

    if (!objective.hasOwnProperty('visibility') || objective.visibility.length === 0) {
      fieldsWithErrors.visibility = ''
    }
    
    setObjective({ ...objective, ...fieldsWithErrors })

    return Object.keys(fieldsWithErrors).length > 0
  }

  const handleClose = useCallback(() => {
    setObjective({cycle: { id: moment().format(formatId), name: moment().format(formatName)}})
    setUsers([])
    setOwnerMe(false)
    handleCloseDialog()
  }, [handleCloseDialog]);

  useEffect(() => {
    if (sendForm) {

      setLoading(true)
      
      let toUpdateObjective = objectToEdit.hasOwnProperty('id') ? `/${objective.id}` : ''

      fetch("http://localhost:5000/objectives" + toUpdateObjective, {
        method: toUpdateObjective.length > 0 ? 'PUT' : 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(objective)
      })
      .then((resp) => resp.json())
      .then((data) => {
        setLoading(false)
        setSendForm(false)
        if (Object.keys(data).length) {
          console.log(data)
          setMessage({
            show: true,
            type: 'success',
            text: 'Objetivo salvo com sucesso!'
          });
        } else {
          setMessage({
            show: true,
            type: 'error',
            text: 'Erro ao salvar objetivo, tente novamente mais tarde.'
          });
        }
        handleClose()
        handleUpdateObjectives()
      })
      .catch((err) => {
        console.log(err)
        setLoading(false)
        setSendForm(false)
        setMessage({
          show: true,
          type: 'error',
          text: 'Erro ao salvar objetivo, tente novamente mais tarde.'
        });
      })
    }
  }, [sendForm, objective, objectToEdit, handleClose, handleUpdateObjectives])

  const saveObjective = () => {

    if (validateForm()) return false

    let otherFields = {}

    if (Object.keys(objectToEdit).length === 0) {
      const quarter = objective.cycle.id.slice(0,1)
      const year = objective.cycle.id.slice(-4)
      otherFields = {
        startDate: moment(year + '-01-01').quarter(quarter).startOf('quarter').format('YYYY-MM-DD'),
        deadline: moment(year + '-01-01').quarter(quarter).endOf('quarter').format('YYYY-MM-DD'),
        endDate: null,
        finished: 0,
        id: uuidv4()
      }
    }

    setObjective({ ...objective, ...otherFields })

    setSendForm(true)
  }
  
  return (
    <Box component="form" noValidate autoComplete="off">
      <BootstrapDialog
        onClose={handleClose}
        fullWidth={true}
        maxWidth={'md'}
        open={opened}
      >
        <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
          {
            (objectToEdit && Object.keys(objectToEdit).length > 0) ?
            <>Editar objetivo</> :
            <>Criar objetivo</>
          }
        </BootstrapDialogTitle>

        <DialogContent dividers>

          <TextField
            id="name"
            name="name"
            label="Nome do objetivo"
            variant="outlined"
            margin="normal"
            onChange={handleChange}
            value={objective.name || ''}
            required
            fullWidth
            error={objective.hasOwnProperty('name') && objective.name.length === 0}
            helperText={(objective.hasOwnProperty('name') && objective.name.length === 0) && 'Campo obrigatório'}
          />

          <TextField
            id="description"
            name="description"
            label="Descrição do objetivo"
            variant="outlined"
            margin="normal"
            onChange={handleChange}
            value={objective.description || ''}
            multiline
            maxRows={4}
            fullWidth
          />

          <div>
            <FormControl
              error={objective.hasOwnProperty('category') && objective.category.length === 0}
              sx={{ width: { xs: '100%', sm: '50%' } }}
              margin="normal">
              <InputLabel id="categoryLabel" required>Categoria do objetivo</InputLabel>
              <Select
                labelId="categoryLabel"
                id="category"
                label="Categoria do objetivo"
                value={(objective.hasOwnProperty('category')) ? objective.category.id : ''}
                onChange={handleCategory}
                required
              >
                {categories.length > 0 && 
                  categories.map((category) =>
                  <MenuItem value={category.id} key={category.id}>{category.name}</MenuItem>
                  )
                }
              </Select>
              {(objective.hasOwnProperty('category') && objective.category.length === 0) &&
                <FormHelperText>Campo obrigatório</FormHelperText>
              }
            </FormControl>
          </div>

          <Grid container>
            <Grid xs={12} sm={6}>

              <FormControl sx={{ width: '100%' }} margin="normal" >
                <Autocomplete
                  id="owner"
                  open={openDropdownOwner}
                  onOpen={() => {
                    setOpenDropdownOwner(true);
                  }}
                  onClose={() => {
                    setOpenDropdownOwner(false);
                  }}
                  onChange={(event, value) => {
                    handleOwner(value);
                  }}
                  value={(objective.hasOwnProperty('owner')) ? objective.owner : {}}
                  options={users}
                  autoHighlight
                  loadingText="Carregando..."
                  noOptionsText="Nenhum colaborador encontrado"
                  openText="Abrir"
                  clearText="Limpar campo"
                  closeText="Fechar"
                  isOptionEqualToValue={(option, value) => option.id === value.id || {}}
                  getOptionLabel={(option) => option.name || ''}
                  loading={loadingOwner}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Avatar alt={option.name} src={option.photo} sx={{ width: 24, height: 24, mr: 1 }} />
                      {option.name}
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Responsável pelo objetivo"
                      required
                      error={objective.hasOwnProperty('owner') && params.inputProps.value.length === 0}
                      helperText={(objective.hasOwnProperty('owner') && params.inputProps.value.length === 0) && 'Campo obrigatório'}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (params.inputProps.value && params.inputProps.value.length > 0) && (
                          <Avatar
                            src={getOnwerPhoto(params.inputProps.value)}
                            sx={{ width: 24, height: 24, mr: 1 }}
                          />
                        ),
                        endAdornment: (
                          <>
                            {loadingOwner ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </FormControl>

            </Grid>
            <Grid xs={12} sm={6}>

              <FormControlLabel
                control={
                  <Checkbox checked={ownerMe} onChange={handleOwnerMe} />
                }
                label="Sou o responsável"
                sx={{ mt: { sm: 3 }, ml: { sm: 2 } }}
                margin="normal"
              />

            </Grid>
          </Grid>

          <FormControl sx={{ width: '100%' }} margin="normal" >
            <Autocomplete
              id="supporters"
              open={openDropdownSupporters}
              onOpen={() => {
                setOpenDropdownSupporters(true);
              }}
              onClose={() => {
                setOpenDropdownSupporters(false);
              }}
              onChange={(event, value) => {
                handleSupporters(value);
              }}
              value={(objective.hasOwnProperty('supporters')) ? objective.supporters : []}
              options={users}
              multiple
              filterSelectedOptions
              autoHighlight
              loadingText="Carregando..."
              noOptionsText="Nenhum colaborador encontrado"
              openText="Abrir"
              clearText="Limpar campo"
              closeText="Fechar"
              isOptionEqualToValue={(option, value) => option.id === value.id}
              getOptionLabel={(option) => option.name || []}
              loading={loadingSupporters}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Avatar alt={option.name} src={option.photo} sx={{ width: 24, height: 24, mr: 1 }} />
                  {option.name}
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Colaboradores que apoiam o objetivo"
                />
              )}
            />
          </FormControl>

          <FormControl error={objective.hasOwnProperty('visibility') && objective.visibility.length === 0} margin="normal">
            <FormLabel id="visibility">Visibilidade *</FormLabel>
            <RadioGroup 
              row
              name="visibility"
              onChange={handleChange}
              value={(objective.hasOwnProperty('visibility')) ? objective.visibility : ''}
            >
              <FormControlLabel
                value="public"
                control={<Radio />}
                label="Público - visível para toda a empresa"
              />
              <FormControlLabel
                value="private"
                control={<Radio />}
                label="Privado - visível apenas para o criador do objetivo, responsável e colaboradores que apoiam o objetivo"
              />
              {(objective.hasOwnProperty('visibility') && objective.visibility.length === 0) &&
                <FormHelperText sx={{ ml: 0 }}>Campo obrigatório</FormHelperText>
              }
            </RadioGroup>
          </FormControl>

          <FormControl margin="normal" sx={{ maxWidth: '100%' }}>
            <FormLabel id="cycle">Ciclo *</FormLabel>
            <CyclesSelect objectToEdit={objectToEdit} handleUpdateObjective={handleUpdateCycle} />
          </FormControl>

          <FormControl sx={{ width: '100%' }} margin="normal" >
            <Tooltip title={!objective.category && 'Selecione uma categoria de objetivo'} placement="top">
              <Autocomplete
                id="associate"
                open={openDropdownAssociate}
                onOpen={() => {
                  setOpenDropdownAssociate(true);
                }}
                onClose={() => {
                  setOpenDropdownAssociate(false);
                }}
                onChange={(event, value) => {
                  handleAssociate(value);
                }}
                value={(objective.hasOwnProperty('associate')) ? objective.associate : {}}
                options={objectivesToAssociate.sort((a, b) => -b.categoryGroup.localeCompare(a.categoryGroup))}
                groupBy={(option) => option.categoryGroup}
                autoHighlight
                disabled={!objective.category}
                loadingText="Carregando..."
                noOptionsText="Nenhum objetivo encontrado"
                openText="Abrir"
                clearText="Limpar campo"
                closeText="Fechar"
                isOptionEqualToValue={(option, value) => option.id === value.id || {}}
                getOptionLabel={(option) => option.name || ''}
                loading={loadingAssociate}
                renderGroup={(params) => (
                  <li key={params.key}>
                    <GroupHeader>{params.group}</GroupHeader>
                    <GroupItems>{params.children}</GroupItems>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Associar a um objetivo"
                    helperText="Você pode escolher um objetivo que será apoiado por este. Os objetivos listados pertencem ao mesmo período selecionado e obedecem a hierarquia de OKRs (Empresa > Grupo > Individual). Por exemplo, não é permitido que um objetivo de empresa dê apoio a um objetivo de grupo."
                  />
                )}
              />
            </Tooltip>
          </FormControl>

        </DialogContent>

        <DialogActions>

          <Button
            onClick={handleClose}
            sx={{ mr: 1 }}
          >
            Cancelar
          </Button>
          <LoadingButton
            onClick={saveObjective}
            loading={loading}
            loadingPosition="start"
            startIcon={<CheckIcon />}
            type="submit"
            variant="contained"
            disableElevation
          >
            Salvar objetivo
          </LoadingButton>

        </DialogActions>

      </BootstrapDialog>

      <Snackbar open={message && message.show} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={(message && message.type) ? message.type : 'info'} sx={{ width: '100%' }}>
          {(message && message.text) ? message.text : ''}
        </Alert>
      </Snackbar>

    </Box>
  )
}

export default DialogCreateObjective