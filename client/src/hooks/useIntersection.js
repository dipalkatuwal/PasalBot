import { useState, useEffect, useRef } from 'react'

/**
 * Returns [ref, isVisible].
 * Once the element enters the viewport it stays "visible".
 *
 * @param {IntersectionObserverInit} options
 */
export function useIntersection(options = { threshold: 0.12 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, options)

    observer.observe(el)
    return () => observer.disconnect()
  }, [options])

  return [ref, visible]
}
