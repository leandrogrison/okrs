
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';

import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

function DialogCreateKRTask ({ id, task, kr, tasksFilled, handleTasksChange, handleDeleteTask }) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (

    <ListItem
      key={id}
      id={id}
      disablePadding
      disableGutters
      sx={{ mb: 2 }}
      ref={setNodeRef}
      style={style}
    >
      <DragIndicatorIcon sx={{ mr: 1 }} {...attributes} {...listeners}/>
      <TextField
        id={`${task.id}`}
        name={`${task.id}`}
        label="Nome da tarefa"
        variant="outlined"
        onChange={handleTasksChange}
        value={task.name || ''}
        fullWidth
        data-no-dnd="true"
        error={kr.hasOwnProperty('type') && kr.type === 'tasks' && !tasksFilled}
        helperText={kr.hasOwnProperty('type') && kr.type === 'tasks' && !tasksFilled && 'Informe ao menos uma tarefa.'}
      />
      <ListItemSecondaryAction sx={{ top: '4px', mt: 3 }}>
        <IconButton
          onClick={() => handleDeleteTask(task.id)}
          disabled={kr.tasks.length < 2}
          aria-label="delete task"
        >
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  )

}

export default DialogCreateKRTask