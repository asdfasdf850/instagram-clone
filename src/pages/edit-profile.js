import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { useForm } from 'react-hook-form'
import isURL from 'validator/lib/isURL'
import isEmail from 'validator/lib/isEmail'
import isMobilePhone from 'validator/lib/isMobilePhone'
import IconButton from '@material-ui/core/IconButton'
import Hidden from '@material-ui/core/Hidden'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import Slide from '@material-ui/core/Slide'
import Menu from '@material-ui/icons/Menu'

import Layout from '../components/shared/Layout'
import ProfilePicture from '../components/shared/ProfilePicture'
import { useEditProfilePageStyles } from '../styles'
import { useUser } from '../App'
import { GET_EDIT_USER_PROFILE } from '../graphql/queries'
import LoadingScreen from '../components/shared/LoadingScreen'
import { EDIT_USER, EDIT_USER_AVATAR } from '../graphql/mutations'
import { useAuth } from '../authContext'
import useScrollToTop from '../utils/useScrollToTop'
import handleImageUpload from '../utils/handleImageUpload'

export default function EditProfilePage() {
  const classes = useEditProfilePageStyles()
  const [showDrawer, setShowDrawer] = useState(false)
  const { currentUserId } = useUser()
  const { data, loading } = useQuery(GET_EDIT_USER_PROFILE, { variables: { id: currentUserId } })
  const history = useHistory()
  const path = history.location.pathname

  useScrollToTop()

  function handleToggleDrawer() {
    setShowDrawer(prev => !prev)
  }

  function handleSelected(index) {
    switch (index) {
      case 0:
        return path.includes('edit')
      default:
        break
    }
  }

  function handleListClick(index) {
    switch (index) {
      case 0:
        history.push('/accounts/edit')
        break
      default:
        break
    }
  }

  const options = [
    'Edit Profile',
    'Change Password',
    'Apps and Websites',
    'Email and SMS',
    'Push Notifications',
    'Manage Contacts',
    'Privacy and Security',
    'Login Activity',
    'Emails from Instagram'
  ]

  const drawer = (
    <List>
      {options.map((option, index) => (
        <ListItem
          key={option}
          button
          selected={handleSelected(index)}
          onClick={() => handleListClick(index)}
          classes={{
            selected: classes.listItemSelected,
            button: classes.listItemButton
          }}
        >
          <ListItemText primary={option} />
        </ListItem>
      ))}
    </List>
  )

  if (loading) return <LoadingScreen />

  return (
    <Layout title='Edit Profile'>
      <section className={classes.section}>
        <IconButton edge='start' onClick={handleToggleDrawer} className={classes.menuButton}>
          <Menu />
        </IconButton>
        <nav>
          <Hidden smUp implementation='css'>
            <Drawer
              variant='temporary'
              anchor='left'
              open={showDrawer}
              onClose={handleToggleDrawer}
              classes={{ paperAnchorLeft: classes.temporaryDrawer }}
            >
              {drawer}
            </Drawer>
          </Hidden>
          <Hidden xsDown implementation='css' className={classes.permanentDrawerRoot}>
            <Drawer
              variant='permanent'
              open
              classes={{ paper: classes.permanentDrawerPaper, root: classes.permanentDrawerRoot }}
            >
              {drawer}
            </Drawer>
          </Hidden>
        </nav>
        <main>{path.includes('edit') && <EditUserInfo user={data.users_by_pk} />}</main>
      </section>
    </Layout>
  )
}

function EditUserInfo({ user }) {
  const classes = useEditProfilePageStyles()
  const [error, setError] = useState({ type: '', message: '' })
  const [open, setOpen] = useState(false)
  const [profileImage, setProfileImage] = useState(user.profile_image)
  const { updateEmail } = useAuth()
  const { register, handleSubmit, formState } = useForm({ mode: 'onBlur' })
  const [editUser] = useMutation(EDIT_USER)
  const [editUserAvatar] = useMutation(EDIT_USER_AVATAR)

  async function onSubmit(data) {
    try {
      setError({ type: '', message: '' })
      const variables = { id: user.id, ...data }
      await updateEmail(data.email)
      await editUser({ variables })
      setOpen(true)
    } catch (error) {
      console.error('Error updating profile', error)
      handleError(error)
    }
  }

  function handleError(error) {
    if (error.message.includes('users_username_key')) {
      setError({ type: 'username', message: 'This username is already taken' })
    } else if (error.code.includes('auth')) {
      setError({ type: 'email', message: error.message })
    }
  }

  async function handleUpdateProfilePic(e) {
    const url = await handleImageUpload(e.target.files[0])
    await editUserAvatar({ variables: { id: user.id, profileImage: url } })
    setProfileImage(url)
  }

  return (
    <section className={classes.container}>
      <div className={classes.pictureSectionItem}>
        <ProfilePicture size={38} image={profileImage} />
        <div className={classes.justifySelfStart}>
          <Typography className={classes.typography}>{user.username}</Typography>
          <input
            accept='image/*'
            type='file'
            id='image'
            style={{ display: 'none' }}
            onChange={handleUpdateProfilePic}
          />
          <label htmlFor='image'>
            <Typography color='primary' variant='body2' className={classes.typographyChangePic}>
              Change Profile Photo
            </Typography>
          </label>
        </div>
      </div>
      <form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
        <SectionItem
          name='name'
          inputRef={register({
            required: true,
            minLength: 5,
            maxLength: 20
          })}
          text='Name'
          formItem={user.name}
        />
        <SectionItem
          name='username'
          inputRef={register({
            required: true,
            pattern: /^[a-zA-Z0-9_.]*$/,
            minLength: 5,
            maxLength: 20
          })}
          error={error}
          text='Username'
          formItem={user.username}
        />
        <SectionItem
          name='website'
          inputRef={register({
            validate: input => (!!input ? isURL(input, { protocols: ['http', 'https'], require_protocol: true }) : true)
          })}
          text='Website'
          formItem={user.website}
        />
        <div className={classes.sectionItem}>
          <aside>
            <Typography className={classes.bio}>Bio</Typography>
          </aside>
          <TextField
            name='bio'
            inputRef={register({ maxLength: 120 })}
            variant='outlined'
            multiline
            rowsMax={3}
            rows={3}
            fullWidth
            defaultValue={user.bio}
          />
        </div>
        <div className={classes.sectionItem}>
          <div />
          <Typography color='textSecondary' className={classes.justifySelfStart}>
            Personal information
          </Typography>
        </div>
        <SectionItem
          name='email'
          inputRef={register({
            required: true,
            validate: input => isEmail(input)
          })}
          type='email'
          text='Email'
          error={error}
          formItem={user.email}
        />
        <SectionItem
          name='phoneNumber'
          inputRef={register({
            validate: input => (!!input ? isMobilePhone(input) : true)
          })}
          type='number'
          text='Phone Number'
          formItem={user.phoneNumber}
        />
        <div className={classes.sectionItem}>
          <div />
          <Button
            disabled={formState.isSubmitting}
            type='submit'
            variant='contained'
            color='primary'
            className={classes.justifySelfStart}
          >
            Submit
          </Button>
        </div>
      </form>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        TransitionComponent={Slide}
        message={<span>Profile updated</span>}
        onClose={() => setOpen(false)}
      />
    </section>
  )
}

function SectionItem({ type = 'text', text, formItem, inputRef, name, error }) {
  const classes = useEditProfilePageStyles()

  return (
    <div className={classes.sectionItemWrapper}>
      <aside>
        <Hidden xsDown>
          <Typography className={classes.typography} align='right'>
            {text}
          </Typography>
        </Hidden>
        <Hidden smUp>
          <Typography className={classes.typography}>{text}</Typography>
        </Hidden>
      </aside>
      <TextField
        name={name}
        inputRef={inputRef}
        helperText={error?.type === name && error.message}
        variant='outlined'
        fullWidth
        defaultValue={formItem}
        type={type}
        className={classes.textField}
        inputProps={{
          className: classes.textFieldInput
        }}
      />
    </div>
  )
}
