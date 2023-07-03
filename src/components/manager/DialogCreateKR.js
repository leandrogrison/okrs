import { useState, useEffect, useContext, useCallback, forwardRef } from 'react'

import {v4 as uuidv4} from 'uuid'
import { IMaskInput } from 'react-imask';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement
} from '@dnd-kit/modifiers';

import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';

import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';

import { UserContext } from '../user/UserAuth';

import Task from './DialogCreateKRTask';

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

const TextMaskCustom = forwardRef(function TextMaskCustom(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask={Number}
      radix=","
      thousandsSeparator="."
      normalizeZeros={false}
      mapToRadix={['.']}
      scale={2}
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

TextMaskCustom.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

function DialogCreateKR({ opened, KRToEdit, objective, handleCloseDialog, handleUpdateKR }) {

  const [openDropdownOwner, setOpenDropdownOwner] = useState(false);
  const [users, setUsers] = useState([]);
  const [ownerMe, setOwnerMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [message, setMessage] = useState({ show: false, type: null, text: ''});
  const [tasksFilled, setTasksFilled] = useState(false);
  const [initialFieldsOnCreate, setInitialFieldsOnCreate] = useState(true);
  const loadingOwner = openDropdownOwner && users.length === 0;
  const userCurrent = useContext(UserContext);

  const [kr, setKR] = useState({
    type: 'percent',
    tasks: [
      {
        id: uuidv4(),
        name: '',
        checked: false
      }
    ]
  })
  
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setMessage({ show: false, type: null, text: ''});
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const {active, over} = event;
    
    if (active && over && active.id !== over.id) {
      let tasks = kr.tasks
      const oldIndex = tasks.map(task => task.id).indexOf(active.id);
      const newIndex = tasks.map(task => task.id).indexOf(over.id);
      setKR({ ...kr, tasks: arrayMove(tasks, oldIndex, newIndex) })
    }
  }

  useEffect(() => {
    if (opened && KRToEdit && Object.keys(KRToEdit).length > 0) {
      let KRToEditClone = JSON.parse(JSON.stringify(KRToEdit))
      if (KRToEdit.children) {
        delete KRToEditClone.children
      }
      setKR(KRToEditClone)
      setOwnerMe(KRToEditClone.owner.id === userCurrent.id)
    }
    if (opened && KRToEdit && Object.keys(KRToEdit).length <= 0) {
      if (initialFieldsOnCreate) {
        setInitialFieldsOnCreate(false)
        setKR({ ...kr, krFromObjective: objective.id, owner: objective.owner })
        setOwnerMe(objective.owner.id === userCurrent.id)
      }
    }
  },[KRToEdit, opened, kr, objective, initialFieldsOnCreate, userCurrent]);

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
      })
      .catch((err) => console.log(err))
  }

  useEffect(() => {
    if (!loadingOwner) {
      return undefined;
    }
    getUsers()
  },[loadingOwner]);

  const handleChange = (event) => {
    setKR({ ...kr, [event.target.name]: event.target.value })
  }

  const handleTasksChange = (event) => {
    let tasks = kr.tasks
    tasks.find(task => task.id === event.target.id).name = event.target.value
    setKR({ ...kr, tasks: tasks })
    if (tasks.find(task => task.name.length > 0)) {
      setTasksFilled(true)
    } else {
      setTasksFilled(false)
    }
  }

  const addTask = () => {
    let tasks = kr.tasks
    tasks.push({ id: uuidv4(), name: '', checked: false })
    setKR({ ...kr, tasks: tasks })
  }

  const handleDeleteTask = (taskId) => {
    let tasks = kr.tasks
    tasks = tasks.filter( task => task.id !== taskId)
    setKR({ ...kr, tasks: tasks })
  }

  const handleOwner = (value) => {
    setKR({ ...kr, owner: value})
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

  function getOnwerPhoto(owner) {
    let result = ''
    if (owner === userCurrent.name) {
      result = userCurrent.photo
    } else if (users.find(user => user.name === owner)) {
      result = users.find(user => user.name === owner).photo
    }
    return result
  }

  function validateForm() {

    let fieldsWithErrors = {}

    if (!kr.hasOwnProperty('name') || kr.name.length === 0) {
      fieldsWithErrors.name = ''
    }
    
    if (!kr.hasOwnProperty('owner') || kr.owner.name.length === 0) {
      fieldsWithErrors.owner = {id: 0, name: '', photo: null}
    }

    if (kr.hasOwnProperty('type')) {
      if (kr.type === 'tasks' && !kr.tasks.find(task => task.name.length > 0)) {
        fieldsWithErrors.tasks = [
          {
            id: uuidv4(),
            name: '',
            checked: false
          }
        ]
        setTasksFilled(false)
      }
      if (kr.type === 'value' && (!kr.hasOwnProperty('typeValue') || kr.typeValue.length === 0)) {
        fieldsWithErrors.typeValue = ''
      }
    }
    
    setKR({ ...kr, ...fieldsWithErrors })

    return Object.keys(fieldsWithErrors).length > 0
  }

  const handleClose = useCallback(() => {
    setKR({
      type: 'percent',
      tasks: [
        {
          id: uuidv4(),
          name: '',
          checked: false
        }
      ]
    })
    setInitialFieldsOnCreate(true)
    handleCloseDialog()
  }, [handleCloseDialog]);

  useEffect(() => {
    if (sendForm) {

      setLoading(true)
      
      let toUpdateKR = KRToEdit.hasOwnProperty('id') ? `/${kr.id}` : ''

      // ALTERAÇÃO NO FORMATO DO VALOR DEVIDO AO COMPONENTE DE MÁSCARA APLICADO NO CAMPO
      let typeValueToConvert = {}
      if (kr.typeValue) {
        typeValueToConvert = {
          typeValue: parseFloat(kr.typeValue.replaceAll('.', '').replaceAll(',', '.'))
        }
      }

      fetch("http://localhost:5000/krs" + toUpdateKR, {
        method: toUpdateKR.length > 0 ? 'PUT' : 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({ ...kr, ...typeValueToConvert })
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
            text: 'KR salvo com sucesso!'
          });
        } else {
          setMessage({
            show: true,
            type: 'error',
            text: 'Erro ao salvar KR, tente novamente mais tarde.'
          });
        }
        handleClose()
        handleUpdateKR()
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
  }, [sendForm, kr, KRToEdit, handleClose, handleUpdateKR])

  const saveKR = () => {

    if (validateForm()) return false

    let fieldsOnCreateKR = {}

    if (Object.keys(KRToEdit).length === 0) {
      fieldsOnCreateKR = {
        typePercent: 0,
        id: uuidv4()
      }
    }

    setKR({ ...kr, ...fieldsOnCreateKR })

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
            (KRToEdit && Object.keys(KRToEdit).length > 0) ?
            <>Editar KR</> :
            <>Criar KR</>
          }
        </BootstrapDialogTitle>

        <DialogContent dividers>

          <TextField
            id="name"
            name="name"
            label="Nome do KR"
            variant="outlined"
            margin="normal"
            onChange={handleChange}
            value={kr.name || ''}
            required
            fullWidth
            error={kr.hasOwnProperty('name') && kr.name.length === 0}
            helperText={(kr.hasOwnProperty('name') && kr.name.length === 0) && 'Campo obrigatório'}
          />

          <TextField
            id="description"
            name="description"
            label="Descrição do KR"
            variant="outlined"
            margin="normal"
            onChange={handleChange}
            value={kr.description || ''}
            multiline
            maxRows={4}
            fullWidth
          />

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
                  value={(kr.hasOwnProperty('owner')) ? kr.owner : {}}
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
                      error={kr.hasOwnProperty('owner') && params.inputProps.value.length === 0}
                      helperText={(kr.hasOwnProperty('owner') && params.inputProps.value.length === 0) && 'Campo obrigatório'}
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

          <FormControl error={kr.hasOwnProperty('type') && kr.type.length === 0} margin="normal">
            <FormLabel id="type">Tipo de atualização *</FormLabel>
            <RadioGroup 
              name="type"
              onChange={handleChange}
              value={(kr.hasOwnProperty('type')) ? kr.type : ''}
            >
              <FormControlLabel
                value="percent"
                control={<Radio />}
                label="Informando um percentual (0% a 100%)"
              />
              <FormControlLabel
                value="tasks"
                control={<Radio />}
                label="Através das tarefas concluídas"
              />
              <FormControlLabel
                value="value"
                control={<Radio />}
                label="Informando um valor"
              />
              {(kr.hasOwnProperty('type') && kr.type === 'value') &&
                <>
                  <Box sx={{ display: 'flex', gap: 2, pl: 4 }}>
                    <FormControl
                      variant="outlined"
                      required
                      fullWidth
                      error={kr.hasOwnProperty('typeValue') && kr.typeValue.length === 0}
                    >
                      <InputLabel htmlFor="typeValue">Informe um valor</InputLabel>
                      <OutlinedInput
                        value={kr.typeValue}
                        onChange={handleChange}
                        name="typeValue"
                        id="typeValue"
                        label="Informe um valor"
                        inputComponent={TextMaskCustom}
                      />
                    </FormControl>
                    <TextField
                      id="typeUnit"
                      name="typeUnit"
                      label="Unidade (opcional)"
                      variant="outlined"
                      onChange={handleChange}
                      value={kr.typeUnit || ''}
                      fullWidth
                    />
                  </Box>
                  {(kr.hasOwnProperty('typeValue') && kr.typeValue.length === 0) &&
                    <FormHelperText sx={{ ml: 4 }} error={true}>Campo obrigatório</FormHelperText>
                  }
                </>
              }
              {(kr.hasOwnProperty('type') && kr.type.length === 0) &&
                <FormHelperText sx={{ ml: 0 }}>Campo obrigatório</FormHelperText>
              }
            </RadioGroup>
          </FormControl>

          <Divider />

          <Typography sx={{ mt: 2, mb: 1, fontSize: 16 }}>Tarefas</Typography>

          <DndContext
            sensors={sensors}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <List sx={{ bgcolor: 'background.paper' }}>
              <SortableContext items={kr.tasks} strategy={verticalListSortingStrategy}>
                {kr.tasks.map((task) =>
                  <Task
                    key={task.id}
                    id={task.id}
                    task={task}
                    kr={kr}
                    tasksFilled={tasksFilled}
                    handleDeleteTask={handleDeleteTask}
                    handleTasksChange={handleTasksChange}
                  />
                )}
              </SortableContext>
            </List>
          </DndContext>

          <Button
            onClick={addTask}
            variant="contained"
            disableElevation
            startIcon={<AddIcon />}
            sx={{ ml: 4 }}
          >
            Adicionar tarefa
          </Button>

        </DialogContent>

        <DialogActions>

          <Button
            onClick={handleClose}
            sx={{ mr: 1 }}
          >
            Cancelar
          </Button>
          <LoadingButton
            onClick={saveKR}
            loading={loading}
            loadingPosition="start"
            startIcon={<CheckIcon />}
            type="submit"
            variant="contained"
            disableElevation
          >
            Salvar KR
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

export default DialogCreateKR