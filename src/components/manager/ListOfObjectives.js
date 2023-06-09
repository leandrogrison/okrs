import Box from '@mui/material/Box'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import ListOfObjectivesContentItem from './ListOfObjectivesContentItem'

function ListOfObjectives({objectives, handleUpdateObjectives, handleShowDetailsOfObjective, handleEditObjective, handleShowMessage}) {

  return (
    <Box>
      {objectives.length > 0 ? 
        objectives.map((objective) =>
          <ListOfObjectivesContentItem
            objective={objective}
            key={objective.id}
            handleUpdateObjectives={handleUpdateObjectives}
            handleShowDetailsOfObjective={handleShowDetailsOfObjective}
            handleEditObjective={handleEditObjective}
            handleShowMessage={handleShowMessage}
          />
        ) :
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, py: 4 }}>
          <ErrorOutlineIcon color='warning' sx={{ mr: 1, fontSize: '32px' }} />
          Nenhum resultado encontrado
        </Box>
      }
    </Box>
  )
}

export default ListOfObjectives