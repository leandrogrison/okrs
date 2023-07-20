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

export default getColorProgress