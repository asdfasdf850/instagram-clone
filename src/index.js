import React, { Component } from 'react'
import { render } from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { ApolloProvider } from '@apollo/react-hooks'
import { MuiThemeProvider, CssBaseline, Typography } from '@material-ui/core'

import theme from './theme'
import App from './App'
import client from './graphql/client'
import AuthProvider from './authContext'

class ErrorBoundary extends Component {
  state = {
    hasError: null
  }

  static getDerivedStateFromError() {
    return {
      hasError: true
    }
  }

  componentDidCatch(error, info) {
    console.error(error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Typography component='h1' variant='h6' align='center'>
          Something went wrong...
        </Typography>
      )
    }
    return this.props.children
  }
}

render(
  <ErrorBoundary>
    <ApolloProvider client={client}>
      <AuthProvider>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <App />
          </Router>
        </MuiThemeProvider>
      </AuthProvider>
    </ApolloProvider>
  </ErrorBoundary>,
  document.getElementById('root')
)