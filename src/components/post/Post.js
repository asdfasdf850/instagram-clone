import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import Img from 'react-graceful-image'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Hidden from '@material-ui/core/Hidden'
import Divider from '@material-ui/core/Divider'
import TextField from '@material-ui/core/TextField'
import Avatar from '@material-ui/core/Avatar'

import UserCard from '../shared/UserCard'
import PostSkeleton from './PostSkeleton'
import OptionsDialog from '../shared/OptionsDialog'
import { MoreIcon, CommentIcon, ShareIcon, UnlikeIcon, LikeIcon, RemoveIcon, SaveIcon } from '../../icons'
import { usePostStyles } from '../../styles'
import { GET_POST } from '../../graphql/subscriptions'
import { useUser } from '../../App'
import { LIKE_POST, UNLIKE_POST, SAVE_POST, UNSAVE_POST, CREATE_COMMENT } from '../../graphql/mutations'
import { formatPostDate, formatDateToNowShort } from '../../utils/formatDate'

export default function Post({ postId }) {
  const classes = usePostStyles()
  const [showOptionsDialog, setShowOptionsDialog] = useState(false)
  const { data, loading } = useSubscription(GET_POST, { variables: { postId } })

  if (loading) return <PostSkeleton />

  const {
    media,
    id,
    likes,
    likes_aggregate,
    saved_posts,
    user,
    caption,
    comments,
    created_at,
    location
  } = data.posts_by_pk

  const likesCount = likes_aggregate.aggregate.count

  return (
    <div className={classes.postContainer}>
      <article className={classes.article}>
        {/* Post Header */}
        <div className={classes.postHeader}>
          <UserCard user={user} avatarSize={32} location={location} />
          <MoreIcon className={classes.moreIcon} onClick={() => setShowOptionsDialog(true)} />
        </div>
        {/* Post Image */}
        <div className={classes.postImage}>
          <Img className={classes.image} src={media} alt='Post media' />
        </div>
        {/* Post Buttons */}
        <div className={classes.postButtonsWrapper}>
          <div className={classes.postButtons}>
            <LikeButton likes={likes} postId={id} authorId={user.id} />
            <Link to={`/p/${id}`}>
              <CommentIcon />
            </Link>
            <ShareIcon />
            <SaveButton savedPosts={saved_posts} postId={id} />
          </div>
          <Typography className={classes.likes} variant='subtitle2'>
            <span>{likesCount === 1 ? '1 like' : `${likesCount} likes`}</span>
          </Typography>
          <div style={{ overflowY: 'scroll', padding: '16px 12px', height: '100%' }}>
            <AuthorCaption user={user} createdAt={created_at} caption={caption} />
            {comments.map(comment => (
              <UserComment key={comment.id} comment={comment} />
            ))}
          </div>

          <Typography color='textSecondary' className={classes.datePosted}>
            {formatPostDate(created_at)}
          </Typography>
          <Hidden xsDown>
            <div className={classes.comment}>
              <Divider />
              <Comment postId={id} />
            </div>
          </Hidden>
        </div>
      </article>
      {showOptionsDialog && (
        <OptionsDialog postId={id} authorId={user.id} setShowOptionsDialog={setShowOptionsDialog} />
      )}
    </div>
  )
}

function AuthorCaption({ user, createdAt, caption }) {
  const classes = usePostStyles()

  return (
    <div style={{ display: 'flex' }}>
      <Avatar
        src={user.profile_image}
        alt='User avatar'
        style={{ marginRight: '14px', width: '32px', height: '32px' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Link to={`/${user.username}`}>
          <Typography variant='subtitle2' component='span' className={classes.username}>
            {user.username}
          </Typography>
          <Typography
            variant='body2'
            component='span'
            className={classes.postCaption}
            style={{ paddingLeft: '0px' }}
            dangerouslySetInnerHTML={{ __html: caption }}
          />
        </Link>
        <Typography
          style={{ marginTop: '16px', marginBottom: '4px', display: 'inline-block' }}
          color='textSecondary'
          variant='caption'
        >
          {formatDateToNowShort(createdAt)}
        </Typography>
      </div>
    </div>
  )
}

function UserComment({ comment }) {
  const classes = usePostStyles()

  return (
    <div style={{ display: 'flex' }}>
      <Avatar
        src={comment.user.profile_image}
        alt='User avatar'
        style={{ marginRight: '14px', width: '32px', height: '32px' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Link to={`/${comment.user.username}`}>
          <Typography variant='subtitle2' component='span' className={classes.username}>
            {comment.user.username}
          </Typography>
          <Typography variant='body2' component='span' className={classes.postCaption} style={{ paddingLeft: '0px' }}>
            {comment.content}
          </Typography>
        </Link>
        <Typography
          style={{ marginTop: '16px', marginBottom: '4px', display: 'inline-block' }}
          color='textSecondary'
          variant='caption'
        >
          {formatDateToNowShort(comment.created_at)}
        </Typography>
      </div>
    </div>
  )
}

function LikeButton({ likes, postId, authorId }) {
  const classes = usePostStyles()
  const { currentUserId } = useUser()
  const isAlreadyLiked = likes.some(({ user_id }) => user_id === currentUserId)
  const [liked, setLiked] = useState(isAlreadyLiked)
  const [likePost] = useMutation(LIKE_POST)
  const [unlikePost] = useMutation(UNLIKE_POST)

  const Icon = liked ? UnlikeIcon : LikeIcon
  const className = liked ? classes.liked : classes.like
  const onClick = liked ? handleUnlike : handleLike

  function handleLike() {
    setLiked(true)
    likePost({ variables: { postId, userId: currentUserId, profileId: authorId } })
  }

  function handleUnlike() {
    setLiked(false)
    unlikePost({ variables: { postId, userId: currentUserId, profileId: authorId } })
  }

  return <Icon className={className} onClick={onClick} />
}

function SaveButton({ savedPosts, postId }) {
  const classes = usePostStyles()
  const { currentUserId } = useUser()
  const isAlreadySaved = savedPosts.some(({ user_id }) => user_id === currentUserId)
  const [saved, setSaved] = useState(isAlreadySaved)
  const [savePost] = useMutation(SAVE_POST)
  const [unsavePost] = useMutation(UNSAVE_POST)

  const Icon = saved ? RemoveIcon : SaveIcon
  const onClick = saved ? handleRemove : handleSave

  function handleSave() {
    setSaved(true)
    savePost({ variables: { postId, userId: currentUserId } })
  }

  function handleRemove() {
    setSaved(false)
    unsavePost({ variables: { postId, userId: currentUserId } })
  }

  return <Icon className={classes.saveIcon} onClick={onClick} />
}

function Comment({ postId }) {
  const classes = usePostStyles()
  const [content, setContent] = useState('')
  const { currentUserId } = useUser()
  const [createComment] = useMutation(CREATE_COMMENT)

  function handleAddComment() {
    createComment({ variables: { content, postId, userId: currentUserId } })
    setContent('')
  }

  return (
    <div className={classes.commentContainer}>
      <TextField
        fullWidth
        value={content}
        placeholder='Add a comment...'
        multiline
        spellCheck='false'
        rowsMax={2}
        rows={1}
        onChange={e => setContent(e.target.value)}
        className={classes.textField}
        InputProps={{
          classes: {
            root: classes.root,
            underline: classes.underline
          }
        }}
      />
      <Button onClick={handleAddComment} color='primary' className={classes.commentButton} disabled={!content.trim()}>
        Post
      </Button>
    </div>
  )
}
