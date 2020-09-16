import { useLayoutEffect } from 'react'

export default function useScrollToTop() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])
}
