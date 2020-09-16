import { format, isThisYear, formatDistanceStrict, formatDistanceToNow } from 'date-fns'

export function formatPostDate(date) {
  // MARCH 23
  const formatShort = format(new Date(date), 'MMMM d').toUpperCase()
  // FEBRUARY 2, 2020
  const formatLong = format(new Date(date), 'MMMM d, yyy').toUpperCase()
  return isThisYear(new Date(date)) ? formatShort : formatLong
}

export function formatDateToNow(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true }).toUpperCase()
}

export function formatDateToNowShort(date) {
  // 5 days ago -> 5 days -> ['5', 'days'] -> ['5', 'd'] -> 5d
  const formatted = formatDistanceStrict(new Date(date), new Date(Date.now())).split(' ')
  return `${formatted[0]}${formatted[1][0]}`
}
