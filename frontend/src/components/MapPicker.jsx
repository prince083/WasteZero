import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix for default marker icon in Leaflet + React
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const defaultCenter = {
    lat: 28.6139,
    lng: 77.209,
};

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

// Component to recenter map when center changes
function RecenterMap({ center }) {
    const map = useMapEvents({});
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

function MapPicker({ onLocationSelect, initialLat, initialLng }) {
    const [position, setPosition] = useState(null);
    const [center, setCenter] = useState(defaultCenter);

    useEffect(() => {
        if (initialLat && initialLng) {
            const pos = { lat: parseFloat(initialLat), lng: parseFloat(initialLng) };
            setPosition(pos);
            setCenter(pos);
        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const { latitude, longitude } = pos.coords;
                        const currentPos = { lat: latitude, lng: longitude };
                        setCenter(currentPos);
                    },
                    (err) => {
                        console.log("Error getting location: ", err);
                    }
                );
            }
        }
    }, [initialLat, initialLng]);

    return (
        <div style={{ height: "100%", width: "100%", borderRadius: "8px", overflow: "hidden" }}>
            <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
