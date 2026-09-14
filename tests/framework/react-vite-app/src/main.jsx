import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { Map } from 'bkoi-gl'
import 'bkoi-gl/style.css'

function App() {
  const ref = useRef(null)

  useEffect(() => {
    const map = new Map({
      container: ref.current,
      accessToken: import.meta.env.VITE_BARIKOI_API_KEY,
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

createRoot(document.getElementById('app')).render(<App />)
