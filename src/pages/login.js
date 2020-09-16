import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useApolloClient } from '@apollo/react-hooks'
import { useForm } from 'react-hook-form'
import isEmail from 'validator/lib/isEmail'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import InputAdornment from '@material-ui/core/InputAdornment'

import SEO from '../components/shared/Seo'
import FacebookIconBlue from '../images/icon-blue.svg'
import FacebookIconWhite from '../images/icon-white.png'
import { useLoginPageStyles } from '../styles'
import { useAuth } from '../authContext'
import { GET_USER_EMAIL } from '../graphql/queries'
import { AuthError } from './signup'

export default function LoginPage() {
  const classes = useLoginPageStyles()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { logInWithEmailAndPassword } = useAuth()
  const { register, handleSubmit, watch, formState } = useForm({ mode: 'onBlur' })
  const hasPassword = !!watch('password')
  const history = useHistory()
  const client = useApolloClient()

  async function onSubmit({ input, password }) {
    try {
      setError('')
      if (!isEmail(input)) input = await getUserEmail(input)
      await logInWithEmailAndPassword(input, password)
      setTimeout(() => history.push('/'), 0)
    } catch (err) {
      console.error('Error logging in', err)
      handleError(err)
    }
  }

  async function getUserEmail(input) {
    const response = await client.query({
      query: GET_USER_EMAIL,
      variables: { input }
    })
    const userEmail = response.data.users[0]?.email || 'no@email.com'
    return userEmail
  }

  function handleError(error) {
    if (error.code.includes('auth')) {
      setError(error.message)
    }
  }

  return (
    <>
      <SEO title='Login' />
      <section className={classes.section}>
        <article>
          <Card className={classes.card}>
            <CardHeader className={classes.cardHeader} />
            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                name='input'
                inputRef={register({
                  required: true,
                  minLength: 5
                })}
                fullWidth
                variant='filled'
                label='Username, email or phone'
                margin='dense'
                className={classes.textField}
                autoComplete='off'
              />
              <TextField
                name='password'
                inputRef={register({
                  required: true,
                  minLength: 5
                })}
                InputProps={{
                  endAdornment: hasPassword && (
                    <InputAdornment>
                      <Button onClick={() => setShowPassword(prev => !prev)}>{showPassword ? 'Hide' : 'Show'}</Button>
                    </InputAdornment>
                  )
                }}
                fullWidth
                variant='filled'
                label='Password'
                type={showPassword ? 'text' : 'password'}
                margin='dense'
                className={classes.textField}
                autoComplete='off'
              />
              <Button
                disabled={!formState.isValid || formState.isSubmitting}
                variant='contained'
                fullWidth
                color='primary'
                className={classes.button}
                type='submit'
              >
                Log In
              </Button>
            </form>
            <div className={classes.orContainer}>
              <div className={classes.orLine} />
              <div>
                <Typography variant='body2' color='textSecondary'>
                  OR
                </Typography>
              </div>
              <div className={classes.orLine} />
            </div>
            <LoginWithFacebook color='secondary' iconColor='blue' />
            <AuthError error={error} />
            <Button fullWidth color='secondary'>
              <Typography variant='caption'>Forgot password?</Typography>
            </Button>
          </Card>
          <Card className={classes.signUpCard}>
            <Typography align='right' variant='body2'>
              Don't have an account?
            </Typography>
            <Link to='/accounts/emailsignup'>
              <Button color='primary' className={classes.signUpButton}>
                Sign Up
              </Button>
            </Link>
          </Card>
        </article>
      </section>
    </>
  )
}

export function LoginWithFacebook({ color, iconColor, variant }) {
  const classes = useLoginPageStyles()
  const [error, setError] = useState('')
  const { logInWithGoogle } = useAuth()
  const history = useHistory()
  const facebookIcon = iconColor === 'blue' ? FacebookIconBlue : FacebookIconWhite

  async function handleLogInWithGoogle() {
    try {
      await logInWithGoogle()
      setTimeout(() => history.push('/'), 0)
    } catch (error) {
      console.error('Error logging in with Google', error)
      setError(error.message)
    }
  }

  return (
    <>
      <Button onClick={handleLogInWithGoogle} fullWidth color={color} variant={variant}>
        <img className={classes.facebookIcon} src={facebookIcon} alt='Facebook icon' />
        Log In with Facebook
      </Button>
      <AuthError error={error} />
    </>
  )
}
