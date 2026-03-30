import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [28.6139, 77.209]; // Stability: lat, lng order

function LocationMarker({ position, setPosition, onLocationSelect }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position ? <Marker position={position} /> : null;
}

// Component to recenter map and fix tiling issues
function RecenterMap({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center);
            // invalidateSize is critical for fixing "grey map" inside dynamic containers
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }
    }, [center, map]);
    return null;
}

function MapPicker({ onLocationSelect, initialLat, initialLng }) {
    const [position, setPosition] = useState(null);
    const [center, setCenter] = useState(DEFAULT_CENTER);

    useEffect(() => {
        if (initialLat && initialLng) {
            const pos = [parseFloat(initialLat), parseFloat(initialLng)];
            setPosition(pos);
            setCenter(pos);
        } else if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setCenter([latitude, longitude]);
                },
                (err) => console.log("Geolocation error: ", err.message)
            );
        }
    }, [initialLat, initialLng]);

    return (
        <div style={{ height: "100%", width: "100%", borderRadius: "20px", overflow: "hidden", position: "relative" }}>
            <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap center={center} />
                <LocationMarker
                    position={position}
                    setPosition={setPosition}
                    onLocationSelect={onLocationSelect}
                />
            </MapContainer>
        </div>
    );
}

export default React.memo(MapPicker);
