import React from 'react'
import Typography from '@material-ui/core/Typography'

import { useNavbarStyles } from '../../styles'

export default function NotificationTooltip({ notifications }) {
  const classes = useNavbarStyles()
  const followCount = notifications.filter(({ type }) => type === 'follow').length
  const likeCount = notifications.filter(({ type }) => type === 'like').length

  return (
    <div className={classes.tooltipContainer}>
      {followCount > 0 && (
        <div className={classes.tooltip}>
          <span aria-label='Followers' className={classes.followers} />
          <Typography>{followCount}</Typography>
        </div>
      )}
      {likeCount > 0 && (
        <div className={classes.tooltip}>
          <span aria-label='Likes' className={classes.likes} />
          <Typography>{likeCount}</Typography>
        </div>
      )}
    </div>
  )
}
