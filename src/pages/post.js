import React from 'react'
import { useParams } from 'react-router-dom'

import Layout from '../components/shared/Layout'
import MorePostsFromUser from '../components/post/MorePostsFromUser'
import Post from '../components/post/Post'

export default function PostPage() {
  const { postId } = useParams()

  return (
    <Layout>
      <Post postId={postId} />
      <MorePostsFromUser postId={postId} />
    </Layout>
  )
}
