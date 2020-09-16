import React, { lazy, Suspense, useState, useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'
import Hidden from '@material-ui/core/Hidden'

import Layout from '../components/shared/Layout'
import LoadingScreen from '../components/shared/LoadingScreen'
import FeedPostSkeleton from '../components/feed/FeedPostSkeleton'
import UserCard from '../components/shared/UserCard'
import FeedSideSuggestions from '../components/feed/FeedSideSuggestions'
import { LoadingLargeIcon } from '../icons'
import { useFeedPageStyles } from '../styles'
import useScrollToTop from '../utils/useScrollToTop'
import { useUser } from '../App'
import { GET_FEED } from '../graphql/queries'
import usePageBottom from '../utils/usePageBottom'

const FeedPost = lazy(() => import('../components/feed/FeedPost'))

export default function FeedPage() {
  const classes = useFeedPageStyles()
  const [endOfFeed, setEndOfFeed] = useState(false)
  const { me, feedIds } = useUser()
  const { data, loading, fetchMore } = useQuery(GET_FEED, { variables: { feedIds, limit: 2 } })
  const isPageBottom = usePageBottom()

  useScrollToTop()

  useEffect(() => {
    if (!isPageBottom || !data) return
    const lastTimestamp = data.posts[data.posts.length - 1].created_at
    fetchMore({ variables: { limit: 2, feedIds, lastTimestamp }, updateQuery: handleUpdateQuery })
  }, [isPageBottom, data, fetchMore, feedIds])

  function handleUpdateQuery(prev, { fetchMoreResult }) {
    if (fetchMoreResult.posts.length === 0) {
      setEndOfFeed(true)
      return prev
    }

    return { posts: [...prev.posts, ...fetchMoreResult.posts] }
  }

  if (loading) return <LoadingScreen />

  return (
    <Layout>
      <div className={classes.container}>
        {/* Feed Posts */}
        <div>
          {data.posts.map((post, index) => (
            <Suspense key={post.id} fallback={<FeedPostSkeleton />}>
              <FeedPost index={index} post={post} />
            </Suspense>
          ))}
        </div>
        {/* Sidebar */}
        <Hidden smDown>
          <div className={classes.sidebarContainer}>
            <div className={classes.sidebarWrapper}>
              <UserCard user={me} avatarSize={50} />
              <FeedSideSuggestions />
            </div>
          </div>
        </Hidden>
        {!endOfFeed && <LoadingLargeIcon />}
      </div>
    </Layout>
  )
}
