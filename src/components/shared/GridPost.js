import React from 'react'
import { useHistory } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'

import { useGridPostStyles } from '../../styles'

export default function GridPost({ post }) {
  const classes = useGridPostStyles()
  const history = useHistory()

  function handleOpenPostModal() {
    history.push({ pathname: `/p/${post.id}`, state: { modal: true } })
  }

  const likesCount = post.likes_aggregate.aggregate.count
  const commentsCount = post.comments_aggregate.aggregate.count

  return (
    <div onClick={handleOpenPostModal} className={classes.gridPostContainer}>
      <div className={classes.gridPostOverlay}>
        <div className={classes.gridPostInfo}>
          <span className={classes.likes} />
          <Typography>{likesCount}</Typography>
        </div>
        <div className={classes.gridPostInfo}>
          <span className={classes.comments} />
          <Typography>{commentsCount}</Typography>
        </div>
      </div>
      <img src={post.media} alt='Post cover' className={classes.image} />
    </div>
  )
}