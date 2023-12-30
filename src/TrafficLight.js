import React, { useState, useEffect, useCallback } from "react";
import Draggable from 'react-draggable';
import axios from "axios";
import './styles/index.scss';

export const TrafficLight = ({ id, onClose }) => {
  const [currentLight, setCurrentLight] = useState(null);

  const lightColors = {
    red: "red",
    orange: "orange",
    green: "green",
  };

  const [red, setRed] = useState(lightColors.red);
  const [orange, setorange] = useState(lightColors.orange);
  const [green, setGreen] = useState(lightColors.green);

  const setColorsBasedOnLight = useCallback((newCurrentLight) => {
    switch (newCurrentLight) {
      case "red":
        setRed("red r-color");
        setorange(lightColors.orange);
        setGreen(lightColors.green);
        setCurrentLight("red");
        break;
      case "orange":
        setorange("orange y-color");
        setGreen(lightColors.green);
        setRed(lightColors.red);
        setCurrentLight("orange");
        break;
      case "green":
        setGreen("green g-color");
        setRed(lightColors.red);
        setorange(lightColors.orange);
        setCurrentLight("green");
        break;
      
    }
  }, [lightColors.red, lightColors.orange, lightColors.green]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/traffic/${id}`);
      const newCurrentLight = response.data.color;
      if (newCurrentLight !== undefined) {
        setCurrentLight(newCurrentLight);
        setColorsBasedOnLight(newCurrentLight);
      } else {
        console.error("Invalid response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching current light data:", error.message);
    }
  };


  const handleColorChange = async (color) => {
    try {
      await axios.post(`http://127.0.0.1:5000/api/change-sequence-${color}`);

    } catch (error) {
      console.error("Error changing sequence:", error.message);
    }
  };

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId);
  }, [setColorsBasedOnLight]);

  return (
    <Draggable>
      <div className="content" style={{ top: '-30%', left: '-7%' }}>
        <button onClick={() => onClose(id)} className="close-button">
          X
        </button>
        <div className="square">
          <div className={red} onClick={() => handleColorChange("red")}></div>
        </div>
        <div className="square">
          <div className={orange} onClick={() => handleColorChange("orange")}></div>
        </div>
        <div className="square">
          <div className={green} onClick={() => handleColorChange("green")}></div>
        </div>
        {currentLight !== null ? (
          <p>Current Light: {currentLight}</p>
        ) : (
          <p>Waiting.....</p>
        )}
      </div>
    </Draggable>
  );
};
