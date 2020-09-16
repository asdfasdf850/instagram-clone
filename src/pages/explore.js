import React from 'react'

import ExploreSuggestions from '../components/explore/ExploreSuggestions'
import ExploreGrid from '../components/explore/ExploreGrid'
import Layout from '../components/shared/Layout'
import useScrollToTop from '../utils/useScrollToTop'

export default function ExplorePage() {
  useScrollToTop()

  return (
    <Layout>
      <ExploreSuggestions />
      <ExploreGrid />
    </Layout>
  )
}
