import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@apollo/react-hooks'
import HTMLEllipsis from 'react-lines-ellipsis/lib/html'
import Img from 'react-graceful-image'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Hidden from '@material-ui/core/Hidden'
import Divider from '@material-ui/core/Divider'
import TextField from '@material-ui/core/TextField'

import UserCard from '../shared/UserCard'
import FollowSuggestions from '../shared/FollowSuggestions'
import OptionsDialog from '../shared/OptionsDialog'
import { MoreIcon, CommentIcon, ShareIcon, UnlikeIcon, LikeIcon, RemoveIcon, SaveIcon } from '../../icons'
import { useFeedPostStyles } from '../../styles'
import { formatDateToNow } from '../../utils/formatDate'
import { useUser } from '../../App'
import { LIKE_POST, UNLIKE_POST, SAVE_POST, UNSAVE_POST, CREATE_COMMENT } from '../../graphql/mutations'
import { GET_FEED } from '../../graphql/queries'

export default function FeedPost({ post, index }) {
  const classes = useFeedPostStyles()
  const [showCaption, setShowCaption] = useState(false)
  const [showOptionsDialog, setShowOptionsDialog] = useState(false)
  const showFollowSuggestions = index === 1

  const {
    media,
    id,
    likes,
    likes_aggregate,
    saved_posts,
    location,
    user,
    caption,
    comments,
    comments_aggregate,
    created_at
  } = post

  const likesCount = likes_aggregate.aggregate.count
  const commentsCount = comments_aggregate.aggregate.count

  return (
    <>
      <article className={classes.article} style={{ marginBottom: showFollowSuggestions && 30 }}>
        {/* Feed Post Header */}
        <div className={classes.postHeader}>
          <UserCard user={user} location={location} />
          <MoreIcon className={classes.moreIcon} onClick={() => setShowOptionsDialog(true)} />
        </div>
        {/* Feed Post Image */}
        <div>
          <Img className={classes.image} src={media} alt='Post media' />
        </div>
        {/* Feed Post Buttons */}
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
          <div className={showCaption ? classes.expanded : classes.collapsed}>
            <Link to={`/p/${user.username}`}>
              <Typography variant='subtitle2' component='span' className={classes.username}>
                {user.username}
              </Typography>
            </Link>
            {showCaption ? (
              <Typography variant='body2' component='span' dangerouslySetInnerHTML={{ __html: caption }} />
            ) : (
              <div className={classes.captionWrapper}>
                <HTMLEllipsis
                  unsafeHTML={caption}
                  className={classes.caption}
                  maxLine='0'
                  ellepsis='...'
                  basedOn='letters'
                />
                <Button className={classes.moreButton} onClick={() => setShowCaption(true)}>
                  more
                </Button>
              </div>
            )}
          </div>
          <Link to={`/p/${id}`}>
            <Typography className={classes.commentsLink} variant='body2' component='div'>
              View all {commentsCount} comments
            </Typography>
          </Link>
          {comments.map(comment => (
            <div key={comment.id}>
              <Link to={`/${comment.user.username}`}>
                <Typography variant='subtitle2' component='span' className={classes.commentUsername}>
                  {comment.user.username}
                </Typography>{' '}
                <Typography variant='body2' component='span'>
                  {comment.content}
                </Typography>
              </Link>
            </div>
          ))}
          <Typography color='textSecondary' className={classes.datePosted}>
            {formatDateToNow(created_at)}
          </Typography>
        </div>
        <Hidden xsDown>
          <Divider />
          <Comment postId={id} />
        </Hidden>
      </article>
      {showFollowSuggestions && <FollowSuggestions />}
      {showOptionsDialog && (
        <OptionsDialog authorId={user.id} postId={id} setShowOptionsDialog={setShowOptionsDialog} />
      )}
    </>
  )
}

function LikeButton({ likes, postId, authorId }) {
  const classes = useFeedPostStyles()
  const { currentUserId, feedIds } = useUser()
  const isAlreadyLiked = likes.some(({ user_id }) => user_id === currentUserId)
  const [liked, setLiked] = useState(isAlreadyLiked)
  const [likePost] = useMutation(LIKE_POST)
  const [unlikePost] = useMutation(UNLIKE_POST)

  const Icon = liked ? UnlikeIcon : LikeIcon
  const className = liked ? classes.liked : classes.like
  const onClick = liked ? handleUnlike : handleLike

  function handleUpdate(cache, result) {
    const data = cache.readQuery({ query: GET_FEED, variables: { limit: 2, feedIds } })
    const typename = result.data.insert_likes?.__typename
    const count = typename === 'likes_mutation_response' ? 1 : -1
    const posts = data.posts.map(post => ({
      ...post,
      likes_aggregate: {
        ...post.likes_aggregate,
        aggregate: {
          ...post.likes_aggregate.aggregate,
          count: post.likes_aggregate.aggregate.count + count
        }
      }
    }))
    cache.writeQuery({ query: GET_FEED, data: { posts } })
  }

  function handleLike() {
    setLiked(true)
    likePost({ variables: { postId, userId: currentUserId, profileId: authorId }, update: handleUpdate })
  }

  function handleUnlike() {
    setLiked(false)
    unlikePost({ variables: { postId, userId: currentUserId, profileId: authorId }, update: handleUpdate })
  }

  return <Icon className={className} onClick={onClick} />
}

function SaveButton({ postId, savedPosts }) {
  const classes = useFeedPostStyles()
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
  const classes = useFeedPostStyles()
  const { currentUserId, feedIds } = useUser()
  const [content, setContent] = useState('')
  const [createComment] = useMutation(CREATE_COMMENT)

  function handleUpdate(cache, result) {
    const data = cache.readQuery({ query: GET_FEED, variables: { limit: 2, feedIds } })
    const oldComment = result.data.insert_comments.returning[0]
    const newComment = {
      ...oldComment,
      user: {
        ...oldComment.user
      }
    }
    const posts = data.posts.map(post => {
      const newPost = {
        ...post,
        comments: [...post.comments, newComment],
        comments_aggregate: {
          ...post.comments_aggregate,
          aggregate: {
            ...post.comments_aggregate.aggregate,
            count: post.comments_aggregate.aggregate.count + 1
          }
        }
      }
      return post.id === postId ? newPost : post
    })
    cache.writeQuery({ query: GET_FEED, data: { posts } })
    setContent('')
  }

  function handleAddComment() {
    createComment({ variables: { content, postId, userId: currentUserId }, update: handleUpdate })
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
