const socket = io(); // Ensure the server has Socket.IO properly set up

console.log("Hey");

// Check if geolocation is supported
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

      // Emit the location to the server
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error("Error fetching geolocation:", error.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
} else {
  console.error("Geolocation is not supported by this browser.");
}

// Initialize the map
const map = L.map("map").setView([0, 0], 10); // The map object is bound to a DOM element with ID "map"

// Add the OpenStreetMap tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    "Map data © <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors",
}).addTo(map);

// const markers = {};

// socket.on("received-location", (data) => {
//   const { id, latitude, longitude } = data;

//   // Update map view
//   map.setView([latitude, longitude], 16);

//   // Check if marker exists for this ID
//   if (markers[id]) {
//     // Update existing marker's location
//     markers[id].setLatLng([latitude, longitude]);
//   } else {
//     // Create new marker if it doesn't exist
//     markers[id] = L.marker([latitude, longitude]).addTo(map);
//   }
// });

// socket.on("disconnect", (id) => {
//   if (markers[id]) {
//     map.removeLayer(markers[id]);
//     delete markers[id];
//   }
// });

const markers = {};
const accuracyCircles = {}; // New object to track accuracy circles

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const {
        latitude,
        longitude,
        accuracy, // Add accuracy measurement
        altitudeAccuracy, // Optional additional accuracy info
        heading, // Optional direction of movement
        speed, // Optional movement speed
      } = position.coords;

      console.log(
        `Latitude: ${latitude}, Longitude: ${longitude}, Accuracy: ±${accuracy} meters`
      );

      // Emit more detailed location data to server
      socket.emit("send-location", {
        latitude,
        longitude,
        accuracy,
        altitudeAccuracy,
        heading,
        speed,
      });
    },
    (error) => {
      console.error("Error fetching geolocation:", error.message);
    },
    {
      enableHighAccuracy: true, // Most important for accuracy
      timeout: 5000,
      maximumAge: 0, // Always get fresh location
    }
  );
}

socket.on("received-location", (data) => {
  const { id, latitude, longitude, accuracy } = data;

  // Update map view with smoother transition
  map.flyTo([latitude, longitude], 16, {
    animate: true,
    duration: 1, // Smooth transition
  });

  // Remove existing marker and accuracy circle for this ID
  if (markers[id]) {
    map.removeLayer(markers[id]);
    map.removeLayer(accuracyCircles[id]);
  }

  // Create more detailed marker with popup
  const marker = L.marker([latitude, longitude])
    .addTo(map)
    .bindPopup(`Location Accuracy: ±${accuracy} meters`)
    .openPopup();

  // Add accuracy circle
  const accuracyCircle = L.circle([latitude, longitude], {
    color: "blue",
    fillColor: "#30f",
    fillOpacity: 0.1,
    radius: accuracy, // Circle radius based on GPS accuracy
  }).addTo(map);

  // Store new marker and accuracy circle
  markers[id] = marker;
  accuracyCircles[id] = accuracyCircle;
});
