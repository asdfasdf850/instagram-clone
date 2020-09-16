import React, { useState } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import { useQuery, useMutation, useApolloClient } from '@apollo/react-hooks'
import Hidden from '@material-ui/core/Hidden'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Dialog from '@material-ui/core/Dialog'
import Zoom from '@material-ui/core/Zoom'
import Divider from '@material-ui/core/Divider'
import DialogTitle from '@material-ui/core/DialogTitle'
import Avatar from '@material-ui/core/Avatar'

import Layout from '../components/shared/Layout'
import ProfileTabs from '../components/profile/ProfileTabs'
import ProfilePicture from '../components/shared/ProfilePicture'
import { useProfilePageStyles } from '../styles'
import { GearIcon } from '../icons'
import { useAuth } from '../authContext'
import useScrollToTop from '../utils/useScrollToTop'
import { GET_USER_PROFILE } from '../graphql/queries'
import LoadingScreen from '../components/shared/LoadingScreen'
import { useUser } from '../App'
import { FOLLOW_USER, UNFOLLOW_USER } from '../graphql/mutations'

export default function ProfilePage() {
  const classes = useProfilePageStyles()
  const [optionsMenu, setOptionsMenu] = useState(false)
  const { username } = useParams()
  const { currentUserId } = useUser()
  const { data, loading } = useQuery(GET_USER_PROFILE, { variables: { username }, fetchPolicy: 'no-cache' })
  useScrollToTop()

  if (loading) return <LoadingScreen />

  const [user] = data.users
  const isOwner = user.id === currentUserId

  console.log(user)

  return (
    <Layout title={`${user.name} (@${user.username})`}>
      <div className={classes.container}>
        <Hidden xsDown>
          <Card className={classes.cardLarge}>
            <ProfilePicture isOwner={isOwner} image={user.profile_image} />
            <CardContent className={classes.cardContentLarge}>
              <ProfileNameSection user={user} isOwner={isOwner} setOptionsMenu={setOptionsMenu} />
              <PostCountSection user={user} />
              <NameBioSection user={user} />
            </CardContent>
          </Card>
        </Hidden>
        <Hidden smUp>
          <Card className={classes.cardSmall}>
            <CardContent>
              <section className={classes.sectionSmall}>
                <ProfilePicture size={77} isOwner={isOwner} image={user.profile_image} />
                <ProfileNameSection user={user} isOwner={isOwner} setOptionsMenu={setOptionsMenu} />
              </section>
              <NameBioSection user={user} />
            </CardContent>
            <PostCountSection user={user} />
          </Card>
        </Hidden>
        {optionsMenu && <OptionsMenu setOptionsMenu={setOptionsMenu} />}
        <ProfileTabs user={user} isOwner={isOwner} />
      </div>
    </Layout>
  )
}

function ProfileNameSection({ user, isOwner, setOptionsMenu }) {
  const classes = useProfilePageStyles()
  const { currentUserId, followingIds, followersIds } = useUser()
  const [unfollowDialog, setUnfollowDialog] = useState(false)
  const isAlreadyFollowing = followingIds.some(id => id === user.id)
  const [isFollowing, setIsFollowing] = useState(isAlreadyFollowing)
  const [followUser] = useMutation(FOLLOW_USER)

  const isFollower = !isFollowing && followersIds.some(id => id === user.id)

  function handleFollowUser() {
    setIsFollowing(true)
    followUser({ variables: { userIdToFollow: user.id, currentUserId } })
  }

  function onUnfollowUser() {
    setUnfollowDialog(false)
    setIsFollowing(false)
  }

  let followButton

  if (isFollowing) {
    followButton = (
      <Button onClick={() => setUnfollowDialog(true)} variant='outlined' className={classes.button}>
        Following
      </Button>
    )
  } else if (isFollower) {
    followButton = (
      <Button onClick={handleFollowUser} variant='contained' color='primary' className={classes.button}>
        Follow Back
      </Button>
    )
  } else {
    followButton = (
      <Button onClick={handleFollowUser} variant='contained' color='primary' className={classes.button}>
        Follow
      </Button>
    )
  }

  return (
    <>
      <Hidden xsDown>
        <section className={classes.usernameSection}>
          <Typography className={classes.username}>{user.username}</Typography>
          {isOwner ? (
            <>
              <Link to='/accounts/edit'>
                <Button variant='outlined'>Edit Profile</Button>
              </Link>
              <div onClick={() => setOptionsMenu(true)} className={classes.settingsWrapper}>
                <GearIcon className={classes.settings} />
              </div>
            </>
          ) : (
            <>{followButton}</>
          )}
        </section>
      </Hidden>
      <Hidden smUp>
        <section>
          <div className={classes.usernameDivSmall}>
            <Typography className={classes.username}>{user.username}</Typography>
            {isOwner && (
              <div onClick={() => setOptionsMenu(true)} className={classes.settingsWrapper}>
                <GearIcon className={classes.settings} />
              </div>
            )}
          </div>
          {isOwner ? (
            <Link to='/account/edit'>
              <Button variant='outlined' style={{ width: '100%' }}>
                Edit Profile
              </Button>
            </Link>
          ) : (
            followButton
          )}
        </section>
      </Hidden>
      {unfollowDialog && (
        <UnfollowDialog onUnfollowUser={onUnfollowUser} user={user} onClose={() => setUnfollowDialog(false)} />
      )}
    </>
  )
}

function UnfollowDialog({ onClose, user, onUnfollowUser }) {
  const classes = useProfilePageStyles()
  const { currentUserId } = useUser()
  const [unfollowUser] = useMutation(UNFOLLOW_USER)

  function handleUnfollowUser() {
    unfollowUser({ variables: { userIdToFollow: user.id, currentUserId } })
    onUnfollowUser()
  }

  return (
    <Dialog
      open
      classes={{
        scrollPaper: classes.unfollowDialogScrollPaper
      }}
      onClose={onClose}
      TransitionComponent={Zoom}
    >
      <div className={classes.wrapper}>
        <Avatar src={user.profile_image} alt={`${user.username}'s avatar`} className={classes.avatar} />
      </div>
      <Typography align='center' variant='body2' className={classes.unfollowDialogText}>
        Unfollow @{user.username}?
      </Typography>
      <Divider />
      <Button onClick={handleUnfollowUser} className={classes.unfollowButton}>
        Unfollow
      </Button>
      <Divider />
      <Button onClick={onClose} className={classes.cancelButton}>
        Cancel
      </Button>
    </Dialog>
  )
}

function PostCountSection({ user }) {
  const classes = useProfilePageStyles()

  const options = ['posts', 'followers', 'following']

  return (
    <>
      <Hidden smUp>
        <Divider />
      </Hidden>
      <section className={classes.followingSection}>
        {options.map(option => (
          <div key={option} className={classes.followingText}>
            <Typography className={classes.followingCount}>{user[`${option}_aggregate`].aggregate.count}</Typography>
            <Hidden xsDown>
              <Typography>{option}</Typography>
            </Hidden>
            <Hidden smUp>
              <Typography color='textSecondary'>{option}</Typography>
            </Hidden>
          </div>
        ))}
      </section>
      <Hidden smUp>
        <Divider />
      </Hidden>
    </>
  )
}

function NameBioSection({ user }) {
  const classes = useProfilePageStyles()

  return (
    <section className={classes.section}>
      <Typography className={classes.typography}>{user.name}</Typography>
      <Typography>{user.bio}</Typography>
      <a href={user.website} target='_blank' rel='noopener noreferrer'>
        <Typography color='secondary' className={classes.typography}>
          {user.website}
        </Typography>
      </a>
    </section>
  )
}

function OptionsMenu({ setOptionsMenu }) {
  const classes = useProfilePageStyles()
  const [logoutMessage, setLogoutMessage] = useState(false)
  const { signOut } = useAuth()
  const history = useHistory()
  const client = useApolloClient()

  function handleLogOutClick() {
    setLogoutMessage(true)
    setTimeout(async () => {
      await client.clearStore()
      signOut()
      history.push('/accounts/login')
    }, 2000)
  }

  return (
    <Dialog
      open
      classes={{
        scrollPaper: classes.dialogScrollPaper,
        paper: classes.dialogPaper
      }}
      TransitionComponent={Zoom}
    >
      {logoutMessage ? (
        <DialogTitle className={classes.dialogTitle}>
          Logging Out
          <Typography color='textSecondary'>You need to log back in to continue using Instagram.</Typography>
        </DialogTitle>
      ) : (
        <>
          <OptionsItem text='Change Password' />
          <OptionsItem text='Nametag' />
          <OptionsItem text='Authorized Apps' />
          <OptionsItem text='Notifications' />
          <OptionsItem text='Privacy and Security' />
          <OptionsItem text='Log Out' onClick={handleLogOutClick} />
          <OptionsItem text='Cancel' onClick={() => setOptionsMenu(false)} />
        </>
      )}
    </Dialog>
  )
}

function OptionsItem({ text, onClick }) {
  return (
    <>
      <Button style={{ padding: '12px 8px' }} onClick={onClick}>
        {text}
      </Button>
      <Divider />
    </>
  )
}
