'use client'

// Zero worker config on purpose: validates the library's automatic worker URL
// registration (self-contained worker asset emitted by the app's bundler).
import { useEffect, useRef } from 'react'
import { Map } from 'bkoi-gl'
import 'bkoi-gl/style.css'

export default function MapView() {
  const ref = useRef(null)

  useEffect(() => {
    const map = new Map({
      container: ref.current,
      accessToken: process.env.NEXT_PUBLIC_BARIKOI_API_KEY,
      center: [90.3938, 23.8216],
      zoom: 12,
    })
    map.on('load', () => {
      window.__READY = true
    })
    map.on('idle', () => {
      window.__IDLE = true
    })
    return () => map.remove()
  }, [])

  return <div ref={ref} style={{ width: '100vw', height: '100vh' }} />
}
