import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useApolloClient } from '@apollo/react-hooks'
import isEmail from 'validator/lib/isEmail'
import Card from '@material-ui/core/Card'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import InputAdornment from '@material-ui/core/InputAdornment'
import HighlightOff from '@material-ui/icons/HighlightOff'
import CheckCircleOutline from '@material-ui/icons/CheckCircleOutline'

import SEO from '../components/shared/Seo'
import { useSignUpPageStyles } from '../styles'
import { LoginWithFacebook } from './login'
import { useAuth } from '../authContext'
import { CHECK_IF_USERNAME_IS_TAKEN } from '../graphql/queries'

export default function SignUpPage() {
  const classes = useSignUpPageStyles()
  const [error, setError] = useState('')
  const { signUpWithEmailAndPassword } = useAuth()
  const { register, handleSubmit, errors, formState } = useForm({ mode: 'onBlur' })
  const history = useHistory()
  const client = useApolloClient()

  async function onSubmit(data) {
    try {
      setError('')
      await signUpWithEmailAndPassword(data)
      setTimeout(() => history.push('/'), 0)
    } catch (error) {
      handleError(error)
    }
  }

  function handleError(error) {
    if (error.message.includes('users_username_key')) {
      setError('Username already taken')
    } else if (error.code.includes('auth')) {
      setError(error.message)
    }
  }

  async function validateUsername(username) {
    const response = await client.query({
      query: CHECK_IF_USERNAME_IS_TAKEN,
      variables: { username }
    })
    const isUsernameValid = response.data.users.length === 0
    return isUsernameValid
  }

  const errorIcon = (
    <InputAdornment>
      <HighlightOff style={{ color: 'red', height: 30, width: 30 }} />
    </InputAdornment>
  )

  const validIcon = (
    <InputAdornment>
      <CheckCircleOutline style={{ color: '#ccc', height: 30, width: 30 }} />
    </InputAdornment>
  )

  return (
    <>
      <SEO title='Sign up' />
      <section className={classes.section}>
        <article>
          <Card className={classes.card}>
            <div className={classes.cardHeader} />
            <Typography className={classes.cardHeaderSubHeader}>
              Sign up to see photos and videos from your friends.
            </Typography>
            <LoginWithFacebook color='primary' iconColor='white' variant='contained' />
            <div className={classes.orContainer}>
              <div className={classes.orLine} />
              <div>
                <Typography variant='body2' color='textSecondary'>
                  OR
                </Typography>
              </div>
              <div className={classes.orLine} />
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                name='email'
                inputRef={register({
                  required: true,
                  validate: input => isEmail(input)
                })}
                InputProps={{
                  endAdornment: errors.email ? errorIcon : formState.touched.email && validIcon
                }}
                fullWidth
                variant='filled'
                label='Email'
                type='email'
                margin='dense'
                className={classes.textField}
                autoComplete='off'
              />
              <TextField
                name='name'
                inputRef={register({
                  required: true,
                  minLength: 5,
                  maxLength: 20
                })}
                InputProps={{
                  endAdornment: errors.name ? errorIcon : formState.touched.name && validIcon
                }}
                fullWidth
                variant='filled'
                label='Full Name'
                margin='dense'
                className={classes.textField}
                autoComplete='off'
              />
              <TextField
                name='username'
                inputRef={register({
                  required: true,
                  minLength: 5,
                  maxLength: 20,
                  validate: async input => await validateUsername(input),
                  pattern: /^[a-zA-Z0-9_.]*$/ // lowercase, uppercase, numbers, _, .
                })}
                InputProps={{
                  endAdornment: errors.username ? errorIcon : formState.touched.username && validIcon
                }}
                fullWidth
                variant='filled'
                label='Username'
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
                  endAdornment: errors.password ? errorIcon : formState.touched.password && validIcon
                }}
                fullWidth
                variant='filled'
                label='Password'
                type='password'
                margin='dense'
                className={classes.textField}
                autoComplete='off'
              />
              <Button
                disabled={formState.isSubmitting}
                variant='contained'
                fullWidth
                color='primary'
                className={classes.button}
                type='submit'
              >
                Sign Up
              </Button>
            </form>
            <AuthError error={error} />
          </Card>
          <Card className={classes.loginCard}>
            <Typography align='right' variant='body2'>
              Have an account?
            </Typography>
            <Link to='/accounts/login'>
              <Button color='primary' className={classes.loginButton}>
                Log In
              </Button>
            </Link>
          </Card>
        </article>
      </section>
    </>
  )
}

export function AuthError({ error }) {
  return (
    !!error && (
      <Typography align='center' gutterBottom variant='body2' style={{ color: 'red' }}>
        {error}
      </Typography>
    )
  )
}
