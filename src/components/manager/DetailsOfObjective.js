import { useState } from 'react'

import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';

import CloseIcon from '@mui/icons-material/Close';

import DrawerCustom from '../general/DrawerCustom';

function DetailsOfObjective({opened, objective, handleCloseDrawer}) {

  const [descriptionTruncate, setDescriptionTruncate] = useState(true)

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
              <Box sx={{ fontSize: 14 }}>Nenhum colaborador cadastrado</Box>
            }
          </Box>
        </Grid>
      </Box>
    }
    </DrawerCustom>
  )
}

export default DetailsOfObjective