import React, { useRef, useEffect, createContext, useContext } from 'react'
import { Switch, Route, useHistory, useLocation, Redirect } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'

import FeedPage from './pages/feed'
import ExplorePage from './pages/explore'
import ProfilePage from './pages/profile'
import PostPage from './pages/post'
import EditProfilePage from './pages/edit-profile'
import LoginPage from './pages/login'
import SignupPage from './pages/signup'
import NotFoundPage from './pages/not-found'
import PostModal from './components/post/PostModal'
import LoadingScreen from './components/shared/LoadingScreen'
import { useAuth } from './authContext'
import { ME } from './graphql/subscriptions'

const UserContext = createContext()

export const useUser = () => useContext(UserContext)

function App() {
  const { authState } = useAuth()
  const isAuth = authState.status === 'in'
  const userId = isAuth ? authState.user.uid : null
  const { data, loading } = useSubscription(ME, { variables: { userId } })
  const history = useHistory()
  const location = useLocation()
  const prevLocation = useRef(location)
  const modal = location.state?.modal

  useEffect(() => {
    if (history.action !== 'POP' && !modal) {
      prevLocation.current = location
    }
  }, [location, modal, history.action])

  if (loading) return <LoadingScreen />

  if (!isAuth) {
    return (
      <Switch location={location}>
        <Route path='/accounts/login'>
          <LoginPage />
        </Route>
        <Route path='/accounts/emailsignup'>
          <SignupPage />
        </Route>
        <Redirect to='/accounts/login' />
      </Switch>
    )
  }

  const isModalOpen = modal && prevLocation.current !== location
  const me = isAuth && data ? data.users[0] : null
  const currentUserId = me.id
  const followingIds = me.following.map(({ user }) => user.id)
  const followersIds = me.followers.map(({ user }) => user.id)
  const feedIds = [...followingIds, currentUserId]

  return (
    <UserContext.Provider value={{ me, currentUserId, followingIds, followersIds, feedIds }}>
      <Switch location={isModalOpen ? prevLocation.current : location}>
        <Route exact path='/'>
          <FeedPage />
        </Route>
        <Route path='/explore'>
          <ExplorePage />
        </Route>
        <Route exact path='/:username'>
          <ProfilePage />
        </Route>
        <Route exact path='/p/:postId'>
          <PostPage />
        </Route>
        <Route exact path='/accounts/edit'>
          <EditProfilePage />
        </Route>
        <Route exact path='/accounts/login'>
          <LoginPage />
        </Route>
        <Route exact path='/accounts/emailsignup'>
          <SignupPage />
        </Route>
        <Route path='*'>
          <NotFoundPage />
        </Route>
      </Switch>
      {isModalOpen && <Route exact path='/p/:postId' component={PostModal} />}
    </UserContext.Provider>
  )
}

export default App
