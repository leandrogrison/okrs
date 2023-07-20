import moment from "moment"

function daysToEnd (deadline) {
  return Math.abs(moment().diff(deadline, 'days'))
}

export default daysToEnd