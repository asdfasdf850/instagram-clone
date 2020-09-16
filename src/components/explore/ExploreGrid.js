import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import Typography from '@material-ui/core/Typography'

import GridPost from '../shared/GridPost'
import { LoadingLargeIcon } from '../../icons'
import { useExploreGridStyles } from '../../styles'
import { EXPLORE_POSTS } from '../../graphql/queries'
import { useUser } from '../../App'

function ExploreGrid() {
  const classes = useExploreGridStyles()
  const { feedIds } = useUser()
  const { data, loading } = useQuery(EXPLORE_POSTS, { variables: { feedIds } })

  return (
    <>
      <Typography color='textSecondary' variant='subtitle2' component='h2' gutterBottom className={classes.typography}>
        Explore
      </Typography>
      {loading ? (
        <LoadingLargeIcon />
      ) : (
        <article className={classes.article}>
          <div className={classes.postContainer}>
            {data.posts.map(post => (
              <GridPost key={post.id} post={post} />
            ))}
          </div>
        </article>
      )}
    </>
  )
}

export default ExploreGrid
