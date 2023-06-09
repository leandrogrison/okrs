import Container from '@mui/material/Container';

function ContainerPages(props) {
  return (
    <Container maxWidth="xl">
      {props.children}
    </Container>
  )
}

export default ContainerPages