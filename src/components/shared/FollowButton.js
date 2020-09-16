import React, { useState } from 'react'
import { useMutation } from '@apollo/react-hooks'
import Button from '@material-ui/core/Button'

import { useFollowButtonStyles } from '../../styles'
import { useUser } from '../../App'
import { FOLLOW_USER, UNFOLLOW_USER } from '../../graphql/mutations'

export default function FollowButton({ side, id }) {
  const classes = useFollowButtonStyles({ side })
  const { currentUserId, followingIds } = useUser()
  const isAlreadyFollowing = followingIds.some(followingId => followingId === id)
  const [isFollowing, setIsFollowing] = useState(isAlreadyFollowing)
  const [followUser] = useMutation(FOLLOW_USER)
  const [unfollowUser] = useMutation(UNFOLLOW_USER)

  function handleFollowUser() {
    setIsFollowing(true)
    followUser({ variables: { userIdToFollow: id, currentUserId } })
  }

  function handleUnfollowUser() {
    setIsFollowing(false)
    unfollowUser({ variables: { userIdToFollow: id, currentUserId } })
  }

  const followButton = (
    <Button
      variant={side ? 'text' : 'contained'}
      color='primary'
      className={classes.button}
      onClick={handleFollowUser}
      fullWidth
    >
      Follow
    </Button>
  )

  const followingButton = (
    <Button variant={side ? 'text' : 'outlined'} className={classes.button} onClick={handleUnfollowUser} fullWidth>
      Following
    </Button>
  )

  return isFollowing ? followingButton : followButton
}
