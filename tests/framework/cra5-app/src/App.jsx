import React, { useEffect, useRef } from 'react'
import { Map } from 'bkoi-gl'
import 'bkoi-gl/style.css'

// Zero worker config: validates the library's automatic worker URL
// registration under webpack 5 asset emission.
export default function App() {
  const ref = useRef(null)

  useEffect(() => {
    const map = new Map({
      container: ref.current,
      accessToken: process.env.REACT_APP_BARIKOI_API_KEY,
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
