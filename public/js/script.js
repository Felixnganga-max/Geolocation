const socket = io();

// Initialize the map
const map = L.map("map").setView([0, 0], 10);

// Add the OpenStreetMap tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const markers = {};
const accuracyCircles = {};

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      console.log(`Location: ${latitude}, ${longitude}, Accuracy: ${accuracy}`);

      socket.emit("send-location", {
        latitude,
        longitude,
        accuracy,
      });
    },
    (error) => {
      console.error("Geolocation Error:", error);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
} else {
  console.error("Geolocation not supported");
}

socket.on("received-location", (data) => {
  const { id, latitude, longitude, accuracy } = data;

  if (!latitude || !longitude) {
    console.error("Invalid location data:", data);
    return;
  }

  // Remove existing markers
  if (markers[id]) {
    map.removeLayer(markers[id]);
  }
  if (accuracyCircles[id]) {
    map.removeLayer(accuracyCircles[id]);
  }

  // Create marker
  const marker = L.marker([latitude, longitude])
    .addTo(map)
    .bindPopup(`Accuracy: ±${accuracy.toFixed(2)} meters`)
    .openPopup();

  // Create accuracy circle
  const accuracyCircle = L.circle([latitude, longitude], {
    color: "blue",
    fillColor: "#30f",
    fillOpacity: 0.2,
    radius: accuracy,
  }).addTo(map);

  // Store markers
  markers[id] = marker;
  accuracyCircles[id] = accuracyCircle;

  // Zoom directly to location with high zoom level
  map.setView([latitude, longitude], 16, {
    animate: true,
    duration: 1,
  });
});
