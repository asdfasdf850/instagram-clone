import React, { createContext, useState, useEffect, useContext } from 'react'
import { useMutation } from '@apollo/react-hooks'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

import defaultUserImage from './images/default-user-image.jpg'
import { CREATE_USER } from './graphql/mutations'

const provider = new firebase.auth.GoogleAuthProvider()

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: 'instagram-18a7a.firebaseapp.com',
  databaseURL: 'https://instagram-18a7a.firebaseio.com',
  projectId: 'instagram-18a7a',
  storageBucket: 'instagram-18a7a.appspot.com',
  messagingSenderId: '815395624930',
  appId: '1:815395624930:web:f3d8997e71fc4104958bbb'
})

export const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({ status: 'loading' })
  const [createUser] = useMutation(CREATE_USER)

  useEffect(() => {
    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        const token = await user.getIdToken()
        const idTokenResult = await user.getIdTokenResult()
        const hasuraClaim = idTokenResult.claims['https://hasura.io/jwt/claims']

        if (hasuraClaim) {
          setAuthState({ status: 'in', user, token })
        } else {
          // Check if refresh is required.
          const metadataRef = firebase.database().ref(`metadata/${user.uid}/refreshTime`)

          metadataRef.on('value', async data => {
            if (!data.exists) return
            // Force refresh to pick up the latest custom claims changes.
            const token = await user.getIdToken(true)
            setAuthState({ status: 'in', user, token })
          })
        }
      } else {
        setAuthState({ status: 'out' })
      }
    })
  }, [])

  async function logInWithGoogle() {
    const data = await firebase.auth().signInWithPopup(provider)
    if (data.additionalUserInfo.isNewUser) {
      const { uid, displayName, email, photoURL } = data.user
      const username = `${displayName.replace(/\s+/g, '')}${uid.slice(-5)}`
      const variables = {
        userId: uid,
        name: displayName,
        username,
        email,
        bio: '',
        website: '',
        phoneNumber: '',
        profileImage: photoURL
      }
      await createUser({ variables })
    }
  }

  async function logInWithEmailAndPassword(email, password) {
    const data = await firebase.auth().signInWithEmailAndPassword(email, password)
    return data
  }

  async function signUpWithEmailAndPassword(formData) {
    const data = await firebase.auth().createUserWithEmailAndPassword(formData.email, formData.password)
    if (data.additionalUserInfo.isNewUser) {
      const variables = {
        userId: data.user.uid,
        name: formData.name,
        username: formData.username,
        email: data.user.email,
        bio: '',
        website: '',
        phoneNumber: '',
        profileImage: defaultUserImage
      }
      await createUser({ variables })
    }
  }

  async function signOut() {
    setAuthState({ status: 'loading' })
    await firebase.auth().signOut()
    setAuthState({ status: 'out' })
  }

  async function updateEmail(email) {
    await authState.user.updateEmail(email)
  }

  if (authState.status === 'loading') return null

  return (
    <AuthContext.Provider
      value={{
        authState,
        updateEmail,
        signOut,
        signUpWithEmailAndPassword,
        logInWithEmailAndPassword,
        logInWithGoogle
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
