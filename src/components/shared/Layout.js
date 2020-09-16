import React from 'react'

import SEO from './Seo'
import Navbar from './Navbar'
import { useLayoutStyles } from '../../styles'

export default function Layout({ children, title, marginTop = 60, minimalNavbar = false }) {
  const classes = useLayoutStyles()

  return (
    <section className={classes.section}>
      <SEO title={title} />
      <Navbar minimalNavbar={minimalNavbar} />
      <main className={classes.main} style={{ marginTop }}>
        <section className={classes.childrenWrapper}>
          <div className={classes.children}>{children}</div>
        </section>
      </main>
    </section>
  )
}
