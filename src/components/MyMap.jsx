/* MyMap.jsx */

// Imports
import React, { Component } from 'react';
import { 
    MapContainer, 
    GeoJSON, 
    TileLayer,
    LayersControl
} from "react-leaflet";
import './../App';
// Map components
import SearchBar from './SearchBar';
import ChartPanel from './ChartPanel';
import ParcelInfo from './ParcelInfo';
import NeighborhoodModal from './NeighborhoodModal';
import SplashScreen from './SplashScreen';
// Map layers
import cities from './../data/Cities.json';
import schoolDistricts from './../data/SchoolDistricts.json';
import basinRec from './../data/BasinRec.json';
import sewer from './../data/Sewersheds.json';
import senateDistricts from './../data/SenateDistricts.json';
import houseDistricts from './../data/HouseDistricts.json';
import voterPrecincts from './../data/VoterPrecincts.json';
import cdp from './../data/CDPs.json';
import neighborhoods from './../data/Neighborhoods.json';
import planningDistricts from './../data/PlanningDistricts.json';
// Styling
import "leaflet/dist/leaflet.css";
import "./MyMap.css";
import './MapStyles.css';

// Define consts
const calculateOverallScore = (feature, weights) => {
    let scoreSum = 0;
    let weightSum = 0;

    for (let key in weights) {
        const scoreField = `${key}_SCORE`;
        const weight = weights[key];
        const score = feature.properties[scoreField];

        if (score !== undefined && !isNaN(score)) {
            scoreSum += score * weight;
            weightSum += weight;
        }
    }

    return weightSum > 0 ? parseFloat((scoreSum / weightSum).toFixed(2)) : null;
};

// Create MyMap class
class MyMap extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedNeighborhood: null,
        };
    }
    
    // Parcels layer styling
    parcelStyle = (score) => {
        if (score >= 7) return '#22A12F';
        if (score >= 6) return '#9AD17E';
        if (score >= 5) return '#FAFDCB';
        if (score >= 3) return '#ED9C6E';
        return '#C9261B';
    };

    getParcelStyle = (feature) => {
        const score = calculateOverallScore(feature, this.props.weights);
        return {
            fillColor: this.parcelStyle(score),
            color: 'grey',
            weight: 0.2,
            fillOpacity: 0.5
        };
    };

    onEachParcel = (parcel, layer) => {
    const score = calculateOverallScore(parcel, this.props.weights);
    layer.on('click', () => {

        this.props.onParcelClick(parcel);
    });
    const popupContent = `
        <div class="parcel-popup">
            <strong>Parcel ID:</strong> ${parcel.properties.Serial || 'N/A'}<br/>
            <strong>Site Address:</strong> ${parcel.properties.SITUS || 'N/A'}<br/>
            <strong>Owner:</strong> ${parcel.properties.OwnerType || 'N/A'}<br/>
            <strong>Overall Score:</strong> ${score !== null ? score : 'N/A'} ${parcel.properties.OVERALL_TEXT}
        </div>
    `;

    layer.bindPopup(popupContent);
};

    // School districts layer styling
    getSchDistStyle = (feature) => {
        const districtName = feature.properties.NAME;
        let fillColor;

        switch (districtName) {
            case 'South Summit School District':
                fillColor = '#0aa354'
                break;
            case 'North Summit School District':
                fillColor = '#6c07b0'
                break;
            case 'Park City School District':
                fillColor = '#ed5151'
                break;
            default:
                fillColor = '#CCCCCC'
                break;
        }

        return {
            color: fillColor,
            weight: 1,
            fillOpacity: 0.4,
            fillColor: fillColor
        };
    };

    // Planning districts layer styling
    getPlDistStyle = (feature) => {
        const planningDistrictName = feature.properties.SITE_NAME;
        let fillColor;

        switch (planningDistrictName) {
            case 'Eastern Summit':
                fillColor = '#008ECC'
                break;
            case 'Snyderville Basin':
                fillColor = '#EF820D'
                break;
            default:
                fillColor = '#CCCCCC'
                break;
        }

        return {
            color: fillColor,
            weight: 2,
            fillOpacity: 0.3,
            fillColor: fillColor
        };
    };

    onEachPlanningDistrict = (feature, layer) => {
        const planningDistrictName = (feature.properties.SITE_NAME);
        layer.bindTooltip(planningDistrictName, {
            permanent: true,
            direction: 'center',
            className: 'planning-district-label'
        });
    };

    // Cities layer styling
    onEachCity = (feature, layer) => {
        const cityName = String(feature.properties.NAME);
        layer.bindTooltip(cityName, {
            permanent: true,
            direction: 'center',
            className: 'city-label'
         });
    };

    // Sewersheds layer styling
    onEachSewer = (feature, layer) => {
        const sewerName = String(feature.properties.msd_shrtnm);
        layer.bindTooltip(sewerName, {
            permanent: true,
            direction: 'center',
            className: 'sewer-label'
         });
    };
    
    // Senate districts layer styling
    onEachSenateDist = (feature, layer) => {
        const senateDistName = String(feature.properties.DIST);
        layer.bindTooltip(senateDistName, {
            permanent: true,
            direction: 'center',
            className: 'senate-dist-label'
        });
    };

    // House districts styling
    onEachHouseDist = (feature, layer) => {
        const houseDistName = String(feature.properties.DIST);
        layer.bindTooltip(houseDistName, {
            permanent: true,
            direction: 'center',
            className: 'house-dist-label'
        });
    };

    // Voter precincts layer styling
    onEachVoterDist = (feature, layer) => {
        const voterDistName = (feature.properties.VistaID);
        layer.bindTooltip(voterDistName, {
            permanent: true,
            direction: 'center',
            className: 'voter-label'
        });
    };

    // CDPs layer styling
    onEachCDP = (feature, layer) => {
        const cdpName = (feature.properties.LABEL);
        layer.bindTooltip(cdpName, {
            permanent: true,
            direction: 'center',
            className: 'cdp-label'
        });
    };

    // Neighborhoods layer styling
    onEachNeighborhood = (feature, layer) => {
        const neighborhoodName = (feature.properties.NAME);
        layer.bindTooltip(neighborhoodName, {
            permanent: true,
            direction:'center',
            className: "neighborhood-label"
        });
        layer.on({
            click: () => {
                this.setState({ selectedNeighborhood: feature.properties });
            },
        });
    };

    closeModal = () => {
        this.setState({ selectedNeighborhood: null });
    };

    // School Districts labels styling
    onEachSchoolDistrict = (feature, layer) => {
        const schDistName = (feature.properties.NAME);
        layer.bindTooltip(schDistName, {
            permanent: true,
            direction: 'center',
            className: 'sch-dist-label'
        });
    };
    
    // Render components
    render() {

        const {
            geoData,
            children,
            selectedVType, 
            selectedOwnerType,
            selectedGrWalkTime,
            selectedGrBikeTime,
            selectedGrDriveTime,
            selectedSchWalkTime,
            selectedSchBikeTime,
            selectedSchDriveTime,
            selectedLiWalkTime,
            selectedLiBikeTime,
            selectedLiDriveTime,
            selectedHeWalkTime,
            selectedHeBikeTime,
            selectedHeDriveTime,
            selectedCuWalkTime,
            selectedCuBikeTime,
            selectedCuDriveTime,
            selectedReWalkTime,
            selectedReBikeTime,
            selectedReDriveTime,
            selectedBuWalkTime,
            selectedBuBikeTime,
            selectedGaWalkTime,
            selectedGaBikeTime,
            selectedGaDriveTime,
            selectedEhWalkTime,
            selectedEhBikeTime,
            selectedEhDriveTime,
            selectedPaWalkTime,
            selectedPaBikeTime,
            selectedPaDriveTime,
            selectedZType,
            selectedSnyZType,
            selectedWaValue,
            selectedSeValue,
            selectedCoValue,
            selectedWuValue
        } = this.props;

        let filteredFeatures = geoData.features.filter(feature => {
        const props = feature.properties || {};

        const matchVacant =
            selectedVType === 'All' || props.VACANT === selectedVType;

        const matchOwner =
            selectedOwnerType === 'All' || props.OwnerType === selectedOwnerType;

        const matchesWalk =
            selectedGrWalkTime.length === 0 ||
            (props.GROCERY_WALK && selectedGrWalkTime.includes(props.GROCERY_WALK));

        const matchesBike =
            selectedGrBikeTime.length === 0 ||
            (props.GROCERY_BIKE && selectedGrBikeTime.includes(props.GROCERY_BIKE));

        const matchesDrive =
            selectedGrDriveTime.length === 0 ||
            (props.GROCERY_DRIVE && selectedGrDriveTime.includes(props.GROCERY_DRIVE));

        const matchesSchWalk =
            selectedSchWalkTime.length === 0 ||
            (props.SCHOOL_WALK && selectedSchWalkTime.includes(props.SCHOOL_WALK));

        const matchesSchBike =
            selectedSchBikeTime.length === 0 ||
            (props.SCHOOL_BIKE && selectedSchBikeTime.includes(props.SCHOOL_BIKE));

        const matchesSchDrive =
            selectedSchDriveTime.length === 0 ||
            (props.SCHOOL_DRIVE && selectedSchDriveTime.includes(props.SCHOOL_DRIVE));

        const matchesLiWalk =
            selectedLiWalkTime.length === 0 ||
            (props.LIBRARY_WALK && selectedLiWalkTime.includes(props.LIBRARY_WALK));

        const matchesLiBike =
            selectedLiBikeTime.length === 0 ||
            (props.LIBRARY_BIKE && selectedLiBikeTime.includes(props.LIBRARY_BIKE));

        const matchesLiDrive =
            selectedLiDriveTime.length === 0 ||
            (props.LIBRARY_DRIVE && selectedLiDriveTime.includes(props.LIBRARY_DRIVE));

        const matchesHeWalk =
            selectedHeWalkTime.length === 0 ||
            (props.HEALTH_WALK && selectedHeWalkTime.includes(props.HEALTH_WALK));

        const matchesHeBike =
            selectedHeBikeTime.length === 0 ||
            (props.HEALTH_BIKE && selectedHeBikeTime.includes(props.HEALTH_BIKE));

        const matchesHeDrive =
            selectedHeDriveTime.length === 0 ||
            (props.HEALTH_DRIVE && selectedHeDriveTime.includes(props.HEALTH_DRIVE));

        const matchesCuWalk =
            selectedCuWalkTime.length === 0 ||
            (props.CULTURE_WALK && selectedCuWalkTime.includes(props.CULTURE_WALK));

        const matchesCuBike =
            selectedCuBikeTime.length === 0 ||
            (props.CULTURE_BIKE && selectedCuBikeTime.includes(props.CULTURE_BIKE));

        const matchesCuDrive =
            selectedCuDriveTime.length === 0 ||
            (props.CULTURE_DRIVE && selectedCuDriveTime.includes(props.CULTURE_DRIVE));

        const matchesReWalk =
            selectedReWalkTime.length === 0 ||
            (props.REC_WALK && selectedReWalkTime.includes(props.REC_WALK));

        const matchesReBike =
            selectedReBikeTime.length === 0 ||
            (props.REC_BIKE && selectedReBikeTime.includes(props.REC_BIKE));

        const matchesReDrive =
            selectedReDriveTime.length === 0 ||
            (props.REC_DRIVE && selectedReDriveTime.includes(props.REC_DRIVE));

        const matchesBuWalk =
            selectedBuWalkTime.length === 0 ||
            (props.BUS_WALK && selectedBuWalkTime.includes(props.BUS_WALK));

        const matchesBuBike =
            selectedBuBikeTime.length === 0 ||
            (props.BUS_BIKE && selectedBuBikeTime.includes(props.BUS_BIKE));

        const matchesGaWalk =
            selectedGaWalkTime.length === 0 ||
            (props.GAS_WALK && selectedGaWalkTime.includes(props.GAS_WALK));

        const matchesGaBike =
            selectedGaBikeTime.length === 0 ||
            (props.GAS_BIKE && selectedGaBikeTime.includes(props.GAS_BIKE));

        const matchesGaDrive =
            selectedGaDriveTime.length === 0 ||
            (props.GAS_DRIVE && selectedGaDriveTime.includes(props.GAS_DRIVE));

        const matchesEhWalk =
            selectedEhWalkTime.length === 0 ||
            (props.EHUB_WALK && selectedEhWalkTime.includes(props.EHUB_WALK));

        const matchesEhBike =
            selectedEhBikeTime.length === 0 ||
            (props.EHUB_BIKE && selectedEhBikeTime.includes(props.EHUB_BIKE));

        const matchesEhDrive =
            selectedEhDriveTime.length === 0 ||
            (props.EHUB_DRIVE && selectedEhDriveTime.includes(props.EHUB_DRIVE));

        const matchesPaWalk =
            selectedPaWalkTime.length === 0 ||
            (props.PARK_WALK && selectedPaWalkTime.includes(props.PARK_WALK));

        const matchesPaBike =
            selectedPaBikeTime.length === 0 ||
            (props.PARK_BIKE && selectedPaBikeTime.includes(props.PARK_BIKE));

        const matchesPaDrive =
            selectedPaDriveTime.length === 0 ||
            (props.PARK_DRIVE && selectedPaDriveTime.includes(props.PARK_DRIVE));

        const matchZoning =
            selectedZType === 'All' || props.ZONING === selectedZType;

        const matchSnyZoning =
            selectedSnyZType === 'All' || props.ZONING === selectedSnyZType;

        const matchWater =
            selectedWaValue === 'All' ||
            (props.WATER && props.WATER === selectedWaValue)

        const matchSewer =
            selectedSeValue === 'All' ||
            (props.SEWER && props.SEWER === selectedSeValue)

        const matchCsvn =
            selectedCoValue === 'All' ||
            (props.CSVN_LAND && props.CSVN_LAND === selectedCoValue)

        const matchWui =
            selectedWuValue === 'All' ||
            (props.WUI && props.WUI === selectedWuValue)

        return (
            matchVacant &&
            matchOwner && 
            matchesWalk && 
            matchesBike && 
            matchesDrive &&
            matchesSchWalk &&
            matchesSchBike &&
            matchesSchDrive &&
            matchesLiWalk &&
            matchesLiBike &&
            matchesLiDrive &&
            matchesHeWalk &&
            matchesHeBike &&
            matchesHeDrive &&
            matchesCuWalk &&
            matchesCuBike &&
            matchesCuDrive &&
            matchesReWalk &&
            matchesReBike &&
            matchesReDrive &&
            matchesBuWalk &&
            matchesBuBike &&
            matchesGaWalk &&
            matchesGaBike &&
            matchesGaDrive &&
            matchesEhWalk &&
            matchesEhBike &&
            matchesEhDrive &&
            matchesPaWalk &&
            matchesPaBike &&
            matchesPaDrive &&
            matchZoning &&
            matchSnyZoning &&
            matchWater &&
            matchSewer &&
            matchCsvn &&
            matchWui
        );
        });

        console.log("Selected Owner Type:", selectedOwnerType);
        console.log("Filtered features count:", filteredFeatures.length);

        // Return and export
        return (
            <div className="map-container">
                <ParcelInfo/>
                <SplashScreen/>
                <MapContainer 
                    className="map-container" 
                    style={{ height: '100%', width: '100%' }}
                    zoom={12} 
                    center={[40.7, -111.5]}
                >
                        
                    {/* Parcels layer */}
                    <GeoJSON 
                        key={JSON.stringify(this.props.weights) + selectedVType + selectedOwnerType + 
                            selectedGrWalkTime.join(',') +
                            selectedGrBikeTime.join(',') +
                            selectedGrDriveTime.join(',') +
                            selectedSchWalkTime.join(',') +
                            selectedSchBikeTime.join(',') +
                            selectedSchDriveTime.join(',') +
                            selectedLiWalkTime.join(',') +
                            selectedLiBikeTime.join(',') +
                            selectedLiDriveTime.join(',') +
                            selectedHeWalkTime.join(',') +
                            selectedHeBikeTime.join(',') +
                            selectedHeDriveTime.join(',') +
                            selectedCuWalkTime.join(',') +
                            selectedCuBikeTime.join(',') +
                            selectedCuDriveTime.join(',') +
                            selectedReWalkTime.join(',') +
                            selectedReBikeTime.join(',') +
                            selectedReDriveTime.join(',') +
                            selectedBuWalkTime.join(',') +
                            selectedBuBikeTime.join(',') +
                            selectedGaWalkTime.join(',') +
                            selectedGaBikeTime.join(',') +
                            selectedGaDriveTime.join(',') +
                            selectedEhWalkTime.join(',') +
                            selectedEhBikeTime.join(',') +
                            selectedEhDriveTime.join(',') +
                            selectedPaWalkTime.join(',') +
                            selectedPaBikeTime.join(',') +
                            selectedPaDriveTime.join(',') +
                            selectedZType + selectedSnyZType +
                            selectedWaValue + selectedSeValue + selectedCoValue + selectedWuValue }
                        style={this.getParcelStyle}
                        data={filteredFeatures} 
                        onEachFeature={this.onEachParcel}
                    />

                {/* Layers control panel */}
                <LayersControl position="topright">

                    {/* Basemap Layers */}
                    <LayersControl.BaseLayer checked name="OpenStreetMap">
                        <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                        /> 
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="ESRI Imagery">
                        <TileLayer
                            attribution='Tiles &copy; Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, etc.'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.BaseLayer>
                        
                    <LayersControl.BaseLayer name="Light Gray Canvas">
                        <TileLayer
                            attribution='Tiles &copy; Esri — Source: Esri, Garmin basemap layers, OpenStreetMap contributors, etc.'
                            url="https://server.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="Dark Gray Canvas">
                        <TileLayer
                            attribution='Tiles &copy; Esri — Source: Esri, Garmin basemap layers, OpenStreetMap contributors, etc.'
                            url="https://server.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.BaseLayer>

                    {/* Overlay Layers */}
                    <LayersControl.Overlay name="Cities">
                        <GeoJSON
                            data={cities}
                            onEachFeature={this.onEachCity}
                            style={{
                                color: 'grey',
                                weight: 2,
                                fillOpacity: 0.4
                            }}
                        />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="CDPs">
                        <GeoJSON
                            data={cdp}
                            onEachFeature={this.onEachCDP}
                            style={{
                                color: 'pink', 
                                weight: 2, 
                                fillOpacity: 0.2
                            }}
                        />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="Neighborhoods">
                        <GeoJSON
                            data={neighborhoods}
                            onEachFeature={this.onEachNeighborhood}
                            style={{
                                color: '#7852A9', 
                                weight: 2, 
                                fillOpacity: 0.2
                            }}
                        />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="Planning Districts">
                        <GeoJSON
                            data={planningDistricts}
                            onEachFeature={this.onEachPlanningDistrict}
                            style={this.getPlDistStyle}
                        />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="School Districts">
                        <GeoJSON
                            data={schoolDistricts}
                            onEachFeature={this.onEachSchoolDistrict}
                            style={this.getSchDistStyle}
                        />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="Basin Recreation Dist.">
                        <GeoJSON
                            data={basinRec}
                            style={{
                                color: "#ff9100", 
                                weight: 2.5, 
                                fillOpacity: 0.25 
                            }}
                        />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="Sewersheds">
                        <GeoJSON
                            data={sewer}
                            onEachFeature={this.onEachSewer}
                            style={{ 
                                color: "#04ff00", 
                                weight: 2.5, 
                                fillOpacity: 0.25
                            }}
                        />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="UT Senate Districts">
                        <GeoJSON
                            data={senateDistricts}
                            onEachFeature={this.onEachSenateDist}
                            style={{ 
                                color: "#ffff00", 
                                weight: 5, 
                                fillOpacity: 0
                            }}
                        />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="UT House Districts">
                        <GeoJSON
                            data={houseDistricts}
                            onEachFeature={this.onEachHouseDist}
                            style={{ 
                                color: "#38a800", 
                                weight: 5, 
                                fillOpacity: 0
                            }}
                        />
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="Voter Precincts">
                        <GeoJSON
                            data={voterPrecincts}
                            onEachFeature={this.onEachVoterDist}
                            style={{ 
                                color: "#8400A8", 
                                fillColor: "#E8BEFF", 
                                weight: 2, 
                                fillOpacity: 0.55
                            }}
                        />
                    </LayersControl.Overlay>
                </LayersControl>
                
                <SearchBar/>
                <ChartPanel
                        parcel={this.props.selectedParcel}
                        onClose={() => this.props.onParcelClick(null)}
                    />
                {children}
                </MapContainer>

                {/* Neighborhood pop-ups */}
                {this.state.selectedNeighborhood && (
                    <NeighborhoodModal
                        data={this.state.selectedNeighborhood}
                        onClose={this.closeModal}
                    />
                )}
            </div>
        );
    }
}

export default MyMap;
