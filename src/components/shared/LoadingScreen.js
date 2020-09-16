import React from 'react'

import { LogoLoadingIcon } from '../../icons'
import { useLoadingScreenStyles } from '../../styles'

export default function LoadingScreen() {
  const classes = useLoadingScreenStyles()

  return (
    <section className={classes.section}>
      <span>
        <LogoLoadingIcon />
      </span>
    </section>
  )
}
