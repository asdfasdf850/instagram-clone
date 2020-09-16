import React from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useMutation } from '@apollo/react-hooks'
import Dialog from '@material-ui/core/Dialog'
import Zoom from '@material-ui/core/Zoom'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'

import { useOptionsDialogStyles } from '../../styles'
import { useUser } from '../../App'
import { UNFOLLOW_USER, DELETE_POST } from '../../graphql/mutations'

export default function OptionsDialog({ setShowOptionsDialog, authorId, postId }) {
  const classes = useOptionsDialogStyles()
  const { currentUserId, followingIds } = useUser()
  const history = useHistory()
  const isOwner = currentUserId === authorId
  const buttonText = isOwner ? 'Delete' : 'Unfollow'
  const onClick = isOwner ? handleDeletePost : handleUnfollowUser
  const isFollowing = followingIds.some(id => id === authorId)
  const isUnrelatedUser = !isOwner && !isFollowing
  const [unfollowUser] = useMutation(UNFOLLOW_USER)
  const [deletePost] = useMutation(DELETE_POST)

  async function handleDeletePost() {
    await deletePost({ variables: { postId, userId: currentUserId } })
    setShowOptionsDialog(false)
    history.push('/')
    window.location.reload()
  }

  function handleUnfollowUser() {
    unfollowUser({ variables: { userIdToFollow: authorId, currentUserId } })
    setShowOptionsDialog(false)
  }

  return (
    <Dialog
      open
      classes={{
        scrollPaper: classes.dialogScrollPaper
      }}
      onClose={() => setShowOptionsDialog(false)}
      TransitionComponent={Zoom}
    >
      {!isUnrelatedUser && (
        <Button onClick={onClick} className={classes.redButton}>
          {buttonText}
        </Button>
      )}
      <Divider />
      <Button className={classes.button}>
        <Link to={`/p/${postId}`}>Go to post</Link>
      </Button>
      <Divider />
      <Button className={classes.button}>Share</Button>
      <Divider />
      <Button className={classes.button}>Copy link</Button>
      <Divider />
      <Button onClick={() => setShowOptionsDialog(false)} className={classes.button}>
        Cancel
      </Button>
    </Dialog>
  )
}
