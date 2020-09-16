import React, { useRef, useState } from 'react'
import { useMutation } from '@apollo/react-hooks'
import Person from '@material-ui/icons/Person'

import { useProfilePictureStyles } from '../../styles'
import handleImageUpload from '../../utils/handleImageUpload'
import { EDIT_USER_AVATAR } from '../../graphql/mutations'
import { useUser } from '../../App'

export default function ProfilePicture({ size, image, isOwner }) {
  const classes = useProfilePictureStyles({ size, isOwner })
  const { currentUserId } = useUser()
  const inputRef = useRef()
  const [img, setImg] = useState(image)
  const [editUserAvatar] = useMutation(EDIT_USER_AVATAR)

  async function handleUpdateProfilePic(e) {
    const url = await handleImageUpload(e.target.files[0])
    await editUserAvatar({ variables: { id: currentUserId, profileImage: url } })
    setImg(url)
  }

  return (
    <section className={classes.section}>
      <input
        ref={inputRef}
        type='file'
        accept='image/*'
        style={{ display: 'none' }}
        onChange={handleUpdateProfilePic}
      />
      {image ? (
        <div className={classes.wrapper} onClick={isOwner ? () => inputRef.current.click() : () => null}>
          <img src={img} alt='user profile' className={classes.image} />
        </div>
      ) : (
        <div className={classes.wrapper}>
          <Person className={classes.person} />
        </div>
      )}
    </section>
  )
}
