<h1 style="text-align:center;">Barikoi GL JS</h1>

<h5 style="text-align:center;">
  Powered by <a href="https://barikoi.com/">Barikoi - Maps for Businesses</a>
</h5>

## Installation

### NPM Module

```bash
npm i bkoi-gl
```

#### Using React

``` javascript
import { useEffect, useRef } from "react";
// @ts-ignore <-- Ignore Typescript Warning, While using with TS -->
import { Map } from "bkoi-gl";
import "bkoi-gl/dist/style/bkoi-gl.css";

export default function App() {
  // Refs
  const mapContainer: any = useRef(null);
  const map: any = useRef(null);

  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once
    map.current = new Map({
      container: mapContainer.current,
      center: [90.39017821904588, 23.719800220780733],
      zoom: 10,
      doubleClickZoom: false,
      accessToken: "your-access-tokon"
    });
  }, []);

  return <div ref={mapContainer} style={containerStyles} />;
}

// JSX Styles
const containerStyles = {
  width: "100%",
  height: "100%",
  minHeight: "400px",
  overflow: "hidden",
  display: "flex",
  flex: 1
};
```

#### Using Nextjs

In BKoiGL.jsx

``` javascript
import { useEffect, useRef, useState } from 'react'
// @ts-ignore <-- Ignore Typescript Warning, While using with TS -->
import { Map } from 'bkoi-gl'
import 'bkoi-gl/dist/style/bkoi-gl.css'

export default function BKoiGL() {
  const [isClient, setClient] = useState(0)
  // Refs
  const mapContainer: any = useRef(null)
  const map: any = useRef(null)

  useEffect(() => {
    setClient(1)
  }, [])

  useEffect(() => {
    if (map.current || !isClient) return //stops map from intializing more than once
    map.current = new Map({
      container: mapContainer.current,
      center: [90.39017821904588, 23.719800220780733],
      zoom: 10,
      doubleClickZoom: false,
      accessToken: 'your-access-token'
    })

  }, [isClient])
  
  if (!isClient) {
    return ''
  }

  return (
    <div ref={mapContainer} style={containerStyles} />
  )
}

// JSX Styles
const containerStyles = {
  boxSizing: 'border-box' as 'border-box',
  width: '100%',
  height: '100%',
  minHeight: '400px',
  overflow: 'hidden',
  display: 'flex',
  flex: 1
}

```
And finally import the BKoiGL component with nextjs's dynamic import where you rendering the map, In this case, inside index.jsx

```javascript
import dynamic from 'next/dynamic'
// @ts-ignore
const BKoiGL = dynamic(() => import ("../components/common/BKoiGL"), { ssr: false })

export default function Home() {
  return (
    <div>
      <BKoiGL />
    </div>
  )
}
```


Note: While using Nextjs App Router Make Sure you use 'use client' directive


### Using with CDN

Guide for CDN use can be found [here.](https://docs.barikoi.com/docs/Barikoi%20GL%20JS/maps-api/)


## Learning Resources

* [API documentation](https://docs.barikoi.com/docs/Barikoi%20GL%20JS/maps-api/) 
