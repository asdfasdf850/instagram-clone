import React from 'react'
import Typography from '@material-ui/core/Typography'
import Hidden from '@material-ui/core/Hidden'

import FollowSuggestions from '../shared/FollowSuggestions'
import { useExploreSuggestionsStyles } from '../../styles'

function ExploreSuggestions() {
  const classes = useExploreSuggestionsStyles()

  return (
    <Hidden xsDown>
      <div className={classes.container}>
        <Typography color='textSecondary' variant='subtitle2' component='h2' className={classes.typography}>
          <FollowSuggestions hideHeader />
        </Typography>
      </div>
    </Hidden>
  )
}

export default ExploreSuggestions
