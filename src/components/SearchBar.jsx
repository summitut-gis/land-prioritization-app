/* SearchBar.jsx */

// Imports
import React, { useState, useMemo } from 'react';
import { useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import debounce from "lodash.debounce";
import customMarker from "../assets/pointer.svg";
import './SearchBar.css';

// Define consts
// Marker icon
const customIcon = L.icon({
    iconUrl: customMarker,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

// Helper function
const formatAddress = (props) => {
    const house = props.housenumber || "";
    const street = props.street || "";
    const city = props.city || "";
    const state = props.state || "";
    const postcode = props.postcode || "";

    const streetLine = [house, street].filter(Boolean).join(" ");
    const cityLine = [city, state, postcode].filter(Boolean).join(", ");

    return streetLine && cityLine ? `${streetLine}, ${cityLine}` : props.label || props.name;
};

const SearchBar = () => {
    const map = useMap();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const [markerPosition, setMarkerPosition] = useState(null);
    const [markerLabel, setMarkerLabel] = useState("");

    // Debounced function
    const fetchSuggestions = async (input) => {
        if (!input.trim()) {
            setSuggestions([]);
            return;
        }

        const encoded = encodeURIComponent(input);
        const bbox = [-112, 40, -109.9, 41.5]; // Summit County bounding box

        const url = `https://photon.komoot.io/api/?q=${encoded}&limit=5&bbox=${bbox}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            setSuggestions(data.features || []);
        } catch (err) {
            console.error("Autocomplete fetch error:", err);
        }
    };

    const debouncedFetch = useMemo(
        () => debounce(fetchSuggestions, 300),
        []
    );

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        debouncedFetch(value);
    };

    const zoomToFeature = (feature) => {
        const [lon, lat] = feature.geometry.coordinates;
        const latLng = L.latLng(lat, lon);

        map.setView(latLng, 15);

        // Store in React state; renders marker
        setMarkerPosition(latLng);
        setMarkerLabel(formatAddress(feature.properties));

        setQuery(feature.properties.label || feature.properties.name || "");
        setSuggestions([]);
    };

    const handleSuggestionClick = (feature) => {
        zoomToFeature(feature);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        const encoded = encodeURIComponent(query);
        const bbox = '-114.0522,36.9979,-109.0416,42.0016';
        const url = `https://photon.komoot.io/api/?q=${encoded}&limit=1&bbox=${bbox}`;

        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data?.features?.length > 0) {
                zoomToFeature(data.features[0]);
            } else {
                alert("No results found.");
            }
        } catch (err) {
            console.error("Search error:", err);
            alert("Error fetching results.");
        }
    };

    // Return and export
    return (
        <>
            <form onSubmit={handleSubmit} className="search-submit-style">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Search for address..."
                    className="search-input-style"
                />
                <button type="submit" className="search-button-style">Search</button>

                {/* Suggestions List */}
                {suggestions.length > 0 && (
                    <ul className="suggestions-list-style">
                        {suggestions.map((feature, idx) => (
                            <li
                                key={idx}
                                onClick={() => handleSuggestionClick(feature)}
                                className="suggestions-style"
                            >
                                {formatAddress(feature.properties)}
                            </li>
                        ))}
                    </ul>
                )}
            </form>

            {/* React-Leaflet Marker */}
            {markerPosition && (
                <Marker position={markerPosition} icon={customIcon}>
                    <Popup>{markerLabel}</Popup>
                </Marker>
            )}
        </>
    );
};

export default SearchBar;
