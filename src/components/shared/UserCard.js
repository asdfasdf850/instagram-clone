import React from 'react'
import { Link } from 'react-router-dom'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'

import { defaultUser } from '../../data'
import { useUserCardStyles } from '../../styles'

export default function UserCard({ user = defaultUser, avatarSize = 44, location }) {
  const classes = useUserCardStyles({ avatarSize })

  const { username, profile_image, name } = user

  return (
    <div className={classes.wrapper}>
      <Link to={`/${username}`}>
        <Avatar src={profile_image} alt='User avatar' className={classes.avatar} />
      </Link>
      <div className={classes.nameWrapper}>
        <Link to={`/${username}`}>
          <Typography variant='subtitle2' className={classes.typography}>
            {username}
          </Typography>
        </Link>
        <Typography color='textSecondary' variant='body2' className={classes.typography}>
          {location || name}
        </Typography>
      </div>
    </div>
  )
}
