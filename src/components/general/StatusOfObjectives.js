import moment from 'moment/moment';

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

export default getProgressStatus