// MapComponent.js
import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TrafficLight } from './TrafficLight';
import axios from 'axios';

const greenIcon = L.icon({
  iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png',
  shadowUrl: 'https://leafletjs.com/examples/custom-icons/leaf-shadow.png',
  iconSize: [38, 95],
  shadowSize: [50, 64],
  iconAnchor: [22, 94],
  shadowAnchor: [4, 62],
  popupAnchor: [-3, -76],
});

export const MapComponent = () => {
  const [trafficLights, setTrafficLights] = useState([]);
  const [map, setMap] = useState(null);
  const [openedTrafficLights, setOpenedTrafficLights] = useState({}); 

  useEffect(() => {
    const leafletMap = L.map('map-container').setView([51.505, -0.09], 13);
    setMap(leafletMap);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(leafletMap);

    return () => {
      leafletMap.remove();
    };
  }, []); 

  useEffect(() => {
    const fetchAllTraffic = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/traffic');
        const trafficData = response.data;
        console.log(trafficData);
        const newTrafficLights = trafficData
          .filter((traffic) => traffic.lat !== undefined && traffic.long !== undefined)
          .map((traffic) => ({
            id: traffic.id,
            latitude: traffic.lat,
            longitude: traffic.long,
          }));

        setTrafficLights(newTrafficLights);
      } catch (error) {
        console.error('Error fetching all traffic data:', error.message);
      }
    };

    fetchAllTraffic();
  }, []);

  const renderTrafficLight = (id) => {
    setOpenedTrafficLights((prevOpenedTrafficLights) => {
      return {
        ...prevOpenedTrafficLights,
        [id]: true,
      };
    });
  };

  const handleTrafficLightClose = (id) => {
    setOpenedTrafficLights((prevOpenedTrafficLights) => {
      const updatedOpenedTrafficLights = { ...prevOpenedTrafficLights };
      delete updatedOpenedTrafficLights[id]; 
      return updatedOpenedTrafficLights;
    });
  };

  useEffect(() => {
    if (map) {
      trafficLights.forEach((trafficLight) => {
        if (trafficLight.latitude !== undefined && trafficLight.longitude !== undefined) {
          const marker = L.marker(
            [trafficLight.latitude, trafficLight.longitude],
            { icon: greenIcon }
          )
            .addTo(map)
            .on('click', () => renderTrafficLight(trafficLight.id));
        }
      });
    }
  }, [map, trafficLights]);

  return (
    <div>
      <div
        id="map-container"
        style={{
          width: '100%',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          background: '#f0f0f0',
        }}
      />

      {Object.keys(openedTrafficLights).map((openedTrafficLightId) => (
        <TrafficLight
          key={openedTrafficLightId}
          id={openedTrafficLightId}
          onClose={() => handleTrafficLightClose(openedTrafficLightId)}
        />
      ))}
    </div>
  );
};
