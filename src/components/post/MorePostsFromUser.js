import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useLazyQuery } from '@apollo/react-hooks'
import Typography from '@material-ui/core/Typography'

import GridPost from '../shared/GridPost'
import { useMorePostsFromUserStyles } from '../../styles'
import { LoadingLargeIcon } from '../../icons'
import { GET_MORE_POSTS_FROM_USER, GET_POST } from '../../graphql/queries'

export default function MorePostsFromUser({ postId }) {
  const classes = useMorePostsFromUserStyles()
  const { data: getPostData, loading: getPostLoading } = useQuery(GET_POST, { variables: { postId } })
  const [getMorePostsFromUser, { data: morePostsData, loading: morePostsLoading }] = useLazyQuery(
    GET_MORE_POSTS_FROM_USER
  )

  useEffect(() => {
    if (getPostLoading) return
    const userId = getPostData.posts_by_pk.user.id
    const postId = getPostData.posts_by_pk.id
    getMorePostsFromUser({ variables: { userId, postId } })
  }, [getPostData, getPostLoading, getMorePostsFromUser])

  return (
    <div className={classes.container}>
      {getPostLoading || morePostsLoading ? (
        <LoadingLargeIcon />
      ) : (
        <>
          <Typography
            color='textSecondary'
            variant='subtitle2'
            component='h2'
            gutterBottom
            className={classes.typography}
          >
            More Posts from{' '}
            <Link to={`/${getPostData.posts_by_pk?.user.username}`} className={classes.link}>
              @{getPostData.posts_by_pk?.user.username}
            </Link>
          </Typography>
          <article className={classes.article}>
            <div className={classes.postContainer}>
              {morePostsData?.posts.map(post => (
                <GridPost key={post.id} post={post} />
              ))}
            </div>
          </article>
        </>
      )}
    </div>
  )
}
