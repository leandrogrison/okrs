import moment from "moment"

function convertDate (date) {
  return moment(date).format('DD/MM/YYYY')
}

export default convertDate