import React, { useState, useEffect, useRef } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useLazyQuery } from '@apollo/react-hooks'
import { useNProgress } from '@tanem/react-nprogress'
import { isAfter } from 'date-fns'
import AppBar from '@material-ui/core/AppBar'
import Hidden from '@material-ui/core/Hidden'
import InputBase from '@material-ui/core/InputBase'
import Avatar from '@material-ui/core/Avatar'
import Fade from '@material-ui/core/Fade'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Zoom from '@material-ui/core/Zoom'

import { useUser } from '../../App'
import NotificationTooltip from '../notification/NotificationTooltip'
import NotificationList from '../notification/NotificationList'
import AddPostDialog from '../post/AddPostDialog'
import logo from '../../images/logo.png'
import { SEARCH_USERS } from '../../graphql/queries'
import { useNavbarStyles, WhiteTooltip, RedTooltip } from '../../styles'
import {
  LoadingIcon,
  AddIcon,
  LikeIcon,
  LikeActiveIcon,
  ExploreIcon,
  ExploreActiveIcon,
  HomeIcon,
  HomeActiveIcon
} from '../../icons'

export default function Navbar({ minimalNavbar }) {
  const classes = useNavbarStyles()
  const history = useHistory()
  const [isLoadingPage, setIsLoadingPage] = useState(true)
  const path = history.location.pathname

  useEffect(() => {
    setIsLoadingPage(false)
  }, [path])

  return (
    <>
      <Progress isAnimating={isLoadingPage} />
      <AppBar className={classes.appBar}>
        <section className={classes.section}>
          <Logo />
          {!minimalNavbar && <Search history={history} />}
          {!minimalNavbar && <Links path={path} />}
        </section>
      </AppBar>
    </>
  )
}

function Logo() {
  const classes = useNavbarStyles()

  return (
    <div className={classes.logoContainer}>
      <Link to='/'>
        <div className={classes.logoWrapper}>
          <img className={classes.logo} src={logo} alt='Instagram' />
        </div>
      </Link>
    </div>
  )
}

function Search({ history }) {
  const classes = useNavbarStyles()
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searchUsers, { data }] = useLazyQuery(SEARCH_USERS)

  const hasResults = !!query && results.length > 0

  useEffect(() => {
    if (!query.trim()) return
    setLoading(true)
    searchUsers({ variables: { query: `%${query}%` } })
    if (data) {
      setResults(data.users)
      setLoading(false)
    }
  }, [query, data, searchUsers])

  return (
    <Hidden xsDown>
      <WhiteTooltip
        arrow
        interactive
        TransitionComponent={Fade}
        open={hasResults}
        title={
          hasResults && (
            <Grid className={classes.resultContainer} container>
              {results.map(result => (
                <Grid
                  key={result.id}
                  item
                  className={classes.resultLink}
                  onClick={() => {
                    history.push(`/${result.username}`)
                    setQuery('')
                  }}
                >
                  <div className={classes.resultWrapper}>
                    <div className={classes.avatarWrapper}>
                      <Avatar src={result.profile_image} alt='User avatar' />
                    </div>
                    <div className={classes.nameWrapper}>
                      <Typography variant='body1'>{result.username}</Typography>
                      <Typography variant='body2' color='textSecondary'>
                        {result.name}
                      </Typography>
                    </div>
                  </div>
                </Grid>
              ))}
            </Grid>
          )
        }
      >
        <InputBase
          className={classes.input}
          value={query}
          onChange={e => setQuery(e.target.value)}
          startAdornment={<span className={classes.searchIcon} />}
          endAdornment={loading ? <LoadingIcon /> : <span onClick={() => setQuery('')} className={classes.clearIcon} />}
          placeholder='Search'
        />
      </WhiteTooltip>
    </Hidden>
  )
}

function Links({ path }) {
  const classes = useNavbarStyles()
  const { me, currentUserId } = useUser()
  const newNotifications = me.notifications.filter(({ created_at }) =>
    isAfter(new Date(created_at), new Date(me.last_checked))
  )
  const hasNotifications = newNotifications.length > 0
  const [showTooltip, setShowTooltip] = useState(hasNotifications)
  const [showList, setShowList] = useState(false)
  const [media, setMedia] = useState(null)
  const [addPostDialog, setAddPostDialog] = useState(false)
  const inputRef = useRef()

  useEffect(() => {
    const timeout = setTimeout(() => setShowTooltip(false), 5000)

    return () => clearTimeout(timeout)
  }, [])

  function handleAddPost(e) {
    setMedia(e.target.files[0])
    setAddPostDialog(true)
  }

  return (
    <div className={classes.linksContainer}>
      {showList && (
        <NotificationList notifications={me.notifications} setShowList={setShowList} currentUserId={currentUserId} />
      )}
      <div className={classes.linksWrapper}>
        {addPostDialog && <AddPostDialog media={media} setAddPostDialog={setAddPostDialog} />}
        <Hidden xsDown>
          <input ref={inputRef} onChange={handleAddPost} type='file' style={{ display: 'none' }} />
          <AddIcon onClick={() => inputRef.current.click()} />
        </Hidden>
        <Link to='/'>{path === '/' ? <HomeActiveIcon /> : <HomeIcon />}</Link>
        <Link to='/explore'>{path === '/explore' ? <ExploreActiveIcon /> : <ExploreIcon />}</Link>
        <RedTooltip
          arrow
          open={showTooltip}
          onOpen={() => setShowTooltip(false)}
          TransitionComponent={Zoom}
          title={<NotificationTooltip notifications={newNotifications} />}
        >
          <div className={hasNotifications ? classes.notifications : ''} onClick={() => setShowList(prev => !prev)}>
            {showList ? <LikeActiveIcon /> : <LikeIcon />}
          </div>
        </RedTooltip>
        <Link to={`/${me.username}`}>
          <div className={path === `/${me.username}` ? classes.profileActive : ''}></div>
          <Avatar src={me.profile_image} className={classes.profileImage} />
        </Link>
      </div>
    </div>
  )
}

function Progress({ isAnimating }) {
  const classes = useNavbarStyles()
  const { animationDuration, isFinished, progress } = useNProgress({ isAnimating })

  return (
    <div
      className={classes.progressContainer}
      style={{ opacity: isFinished ? 0 : 1, transition: `opacity ${animationDuration}ms linear` }}
    >
      <div
        className={classes.progressBar}
        style={{ marginLeft: `${(-1 + progress) * 100}%`, transition: `margin-left ${animationDuration}ms linear` }}
      >
        <div className={classes.progressBackground} />
      </div>
    </div>
  )
}
