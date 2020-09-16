import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'

import { LoadingIcon } from '../../icons'
import UserCard from '../shared/UserCard'
import FollowButton from '../shared/FollowButton'
import { useFeedSideSuggestionsStyles } from '../../styles'
import { SUGGEST_USERS } from '../../graphql/queries'
import { useUser } from '../../App'

function FeedSideSuggestions() {
  const classes = useFeedSideSuggestionsStyles()
  const { me, followersIds } = useUser()
  const { data, loading } = useQuery(SUGGEST_USERS, { variables: { limit: 5, followersIds, createdAt: me.created_at } })

  return (
    <article className={classes.article}>
      <Paper className={classes.paper}>
        <Typography
          color='textSecondary'
          variant='subtitle2'
          component='h2'
          align='left'
          gutterBottom
          className={classes.typography}
        >
          Suggestions for you
        </Typography>
        {loading ? (
          <LoadingIcon />
        ) : (
          data.users.map(user => (
            <div key={user.id} className={classes.card}>
              <UserCard user={user} />
              <FollowButton id={user.id} side />
            </div>
          ))
        )}
      </Paper>
    </article>
  )
}

export default FeedSideSuggestions
