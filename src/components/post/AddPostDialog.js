import React, { useState, useMemo } from 'react'
import { useMutation } from '@apollo/react-hooks'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import Dialog from '@material-ui/core/Dialog'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import Paper from '@material-ui/core/Paper'
import Avatar from '@material-ui/core/Avatar'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import ArrowBackIos from '@material-ui/icons/ArrowBackIos'
import PinDrop from '@material-ui/icons/PinDrop'

import { useAddPostDialogStyles } from '../../styles'
import { CREATE_POST } from '../../graphql/mutations'
import { useUser } from '../../App'
import handleImageUpload from '../../utils/handleImageUpload'
import serialize from '../../utils/serialize'

const initialValue = [{ type: 'paragraph', children: [{ text: '' }] }]

export default function AddPostDialog({ media, setAddPostDialog }) {
  const classes = useAddPostDialogStyles()
  const [value, setValue] = useState(initialValue)
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { me, currentUserId } = useUser()
  const [createPost] = useMutation(CREATE_POST)

  async function handleSharePost() {
    setSubmitting(true)
    const url = await handleImageUpload(media)
    await createPost({
      variables: { userId: currentUserId, location, caption: serialize({ children: value }), mediaUrl: url }
    })
    setSubmitting(false)
    window.location.reload()
  }

  const editor = useMemo(() => withReact(createEditor()), [])

  return (
    <Dialog fullScreen open onClose={() => setAddPostDialog(false)}>
      <AppBar className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <ArrowBackIos onClick={() => setAddPostDialog(false)} />
          <Typography align='center' variant='body1' className={classes.title}>
            New Post
          </Typography>
          <Button color='primary' className={classes.share} disabled={submitting} onClick={handleSharePost}>
            Share
          </Button>
        </Toolbar>
      </AppBar>
      <Divider />
      <Paper className={classes.paper}>
        <Avatar src={me.profile_image} />
        <Slate editor={editor} value={value} onChange={value => setValue(value)}>
          <Editable className={classes.editor} placeholder='Write your caption...' autoFocus />
        </Slate>
        <Avatar src={URL.createObjectURL(media)} className={classes.avatarLarge} variant='square' />
      </Paper>
      <TextField
        onChange={e => setLocation(e.target.value)}
        fullWidth
        placeholder='Location'
        InputProps={{
          classes: {
            root: classes.root,
            input: classes.input,
            underline: classes.underline
          },
          startAdornment: (
            <InputAdornment>
              <PinDrop />
            </InputAdornment>
          )
        }}
      />
    </Dialog>
  )
}
