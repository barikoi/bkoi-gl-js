import { useEffect, useRef } from "react";
import {
  Map,
  Marker,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
} from "bkoi-gl";
import "bkoi-gl/dist/style/bkoi-gl.css";

function BarikoiMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new Map({
      container: mapContainer.current,
      center: [90.39017821904588, 23.719800220780733],
      zoom: 10,
      doubleClickZoom: false,
      accessToken: "YOUR_BARIKOI_API_KEY_HERE",
      polygon: true,
      drawOptions: {
        controls: {
          polygon: true,
          trash: true,
        },
      },
    });

    // Add marker
    const marker = new Marker()
      .setLngLat([90.39017821904588, 23.719800220780733])
      .addTo(map.current);

    // Add controls
    map.current.addControl(new NavigationControl(), "top-right");
    map.current.addControl(new FullscreenControl(), "top-right");
    map.current.addControl(new ScaleControl(), "bottom-right");

    // Drawing events
    map.current.on("draw.create", (e) => console.log("Created:", e.features));
    map.current.on("draw.update", (e) => console.log("Updated:", e.features));
    map.current.on("draw.delete", (e) => console.log("Deleted:", e.features));
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100vh",
        minHeight: "400px",
        overflow: "hidden",
      }}
    />
  );
}

export default BarikoiMap;
