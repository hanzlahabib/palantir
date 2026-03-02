import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

// Set Cesium Ion access token (not needed for Google 3D Tiles, but required by CesiumJS initialization)
import * as Cesium from "cesium";
Cesium.Ion.defaultAccessToken = "";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
