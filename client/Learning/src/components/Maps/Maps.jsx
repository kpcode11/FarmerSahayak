import React, { useRef, useState } from "react";
import useGoogleMaps from "./useGoogleMaps";

// Get API key from Vite environment variable
const API_KEY = import.meta.env.VITE_API_KEY;

function initMap(mapRef, setPlaces, markersRef, mapInstanceRef, infoWindowRef, userLocation) {
  return function () {
    const map = new window.google.maps.Map(mapRef.current, {
      center: userLocation,
      zoom: 15,
    });
    mapInstanceRef.current = map;

    new window.google.maps.Marker({
      position: userLocation,
      map,
      title: "You are here",
    });

    infoWindowRef.current = new window.google.maps.InfoWindow();

    const request = {
      location: userLocation,
      radius: 50000,
      keyword: "department of agriculture OR agriculture office OR krishi vigyan kendra OR nabard OR cooperative bank OR rural development office OR common service center"
    };

    const service = new window.google.maps.places.PlacesService(map);
    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setPlaces(results);
        results.forEach((place) => {
          const marker = new window.google.maps.Marker({
            map,
            position: place.geometry.location,
            title: place.name,
          });
          markersRef.current.set(place.place_id, marker);

          marker.addListener("click", () => {
            infoWindowRef.current.setContent(`<div style="color: black;"><strong>${place.name}</strong><br>${place.vicinity || ''}</div>`);
            infoWindowRef.current.open(map, marker);
          });
        });
      }
    });
  };
}

const Maps = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef(new Map());
  const infoWindowRef = useRef(null);
  const [places, setPlaces] = useState([]);
  const [userLocation, setUserLocation] = useState({ lat: 19.72683088297692, lng: 75.22276582663706 });
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [mobileView, setMobileView] = useState('map'); // 'map' or 'list'

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(newLocation);
        setIsLoadingLocation(false);
        // Reinitialize map with new location
        if (window.google && window.google.maps) {
          initMap(mapRef, setPlaces, markersRef, mapInstanceRef, infoWindowRef, newLocation)();
        }
      },
      (error) => {
        setIsLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please allow location access or enter manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An unknown error occurred.');
            break;
        }
      }
    );
  };

  const handleManualCoordinates = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      setLocationError('Please enter valid latitude and longitude numbers.');
      return;
    }

    if (lat < -90 || lat > 90) {
      setLocationError('Latitude must be between -90 and 90.');
      return;
    }

    if (lng < -180 || lng > 180) {
      setLocationError('Longitude must be between -180 and 180.');
      return;
    }

    const newLocation = { lat, lng };
    setUserLocation(newLocation);
    setLocationError(null);
    setManualLat('');
    setManualLng('');
    
    // Reinitialize map with new location
    if (window.google && window.google.maps) {
      initMap(mapRef, setPlaces, markersRef, mapInstanceRef, infoWindowRef, newLocation)();
    }
  };

  useGoogleMaps(API_KEY, "initMap", initMap(mapRef, setPlaces, markersRef, mapInstanceRef, infoWindowRef, userLocation));

  const focusPlace = (place) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const marker = markersRef.current.get(place.place_id);
    if (marker) {
      map.panTo(marker.getPosition());
      map.setZoom(16);
      infoWindowRef.current.setContent(`<div style="color: black;"><strong>${place.name}</strong><br>${place.vicinity || ''}</div>`);
      infoWindowRef.current.open(map, marker);
    }
  };

  // helper: get lat/lng numbers from a Places result (works with LatLng objects and plain objects)
  const _coords = (place) => {
    const loc = place?.geometry?.location;
    if (!loc) return null;
    const lat = typeof loc.lat === 'function' ? loc.lat() : loc.lat;
    const lng = typeof loc.lng === 'function' ? loc.lng() : loc.lng;
    return { lat, lng };
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (from, to) => {
    if (!from || !to) return null;
    const R = 6371; // Earth radius in km
    const dLat = ((to.lat - from.lat) * Math.PI) / 180;
    const dLng = ((to.lng - from.lng) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((from.lat * Math.PI) / 180) * Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const getDirectionsUrl = (place) => {
    const coords = _coords(place);
    if (coords) return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name || place.vicinity || '')}`;
  };

  const setMapType = (type) => {
    const map = mapInstanceRef.current;
    if (!map || !window.google) return;
    map.setMapTypeId(type === 'satellite' ? window.google.maps.MapTypeId.SATELLITE : window.google.maps.MapTypeId.ROADMAP);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Tab Toggle */}
      <div className="lg:hidden sticky top-16 z-20 bg-white border-b border-gray-200 flex">
        <button
          onClick={() => setMobileView('map')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${mobileView === 'map' ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50' : 'text-gray-600'}`}
        >
          Map View
        </button>
        <button
          onClick={() => setMobileView('list')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${mobileView === 'list' ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50' : 'text-gray-600'}`}
        >
          List ({places.length})
        </button>
      </div>

      <div className="max-w-full h-[calc(100vh-64px)] lg:h-screen flex flex-col lg:flex-row lg:gap-0">
        {/* LEFT SIDEBAR */}
        <aside className={`w-full lg:w-[380px] bg-white border-r border-gray-200 flex flex-col lg:max-h-screen ${mobileView === 'list' ? 'flex' : 'hidden lg:flex'}`}>
          {/* Sticky Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-5 z-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Help Centers</h2>
            <p className="text-xs text-gray-500 mb-4">Find government agricultural offices near you.</p>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="search"
                placeholder="Search by pincode, city, or name..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={getCurrentLocation}
              disabled={isLoadingLocation}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium text-sm transition-colors ${isLoadingLocation ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-700 hover:bg-emerald-800'}`}
            >
              {isLoadingLocation ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Locating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Find Centers Near Me
                </>
              )}
            </button>

            <div className="flex flex-wrap gap-2 mt-3">
              {['All Centers','KVKs','Agri Offices','Warehouses'].map((c) => (
                <button key={c} className="text-xs px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-100">{c}</button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
              <div>RESULTS <span className="text-gray-700 font-semibold">({places.length})</span></div>
              <select className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white hover:border-gray-300">
                <option value="distance">Distance</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          {/* Scrollable Results List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="p-4 space-y-3">
              {places && places.length > 0 ? (
                places.map((p) => {
                  const coords = _coords(p);
                  const distance = calculateDistance(userLocation, coords);
                  return (
                    <div key={p.place_id} className="bg-gray-50 rounded-lg border border-gray-200 p-3.5 hover:border-emerald-300 hover:bg-emerald-50 transition-all">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm ${p.opening_hours && p.opening_hours.open_now ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {p.opening_hours && p.opening_hours.open_now ? 'OPEN NOW' : 'CLOSED'}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">{p.name}</h4>
                        </div>
                        <button className="text-gray-300 hover:text-emerald-600 flex-shrink-0">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      </div>

                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{p.vicinity}</p>

                      <div className="flex items-center justify-between gap-2 text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-3">
                          {distance && (
                            <div className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm0 0c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm0 0V6m0 0c0 1.105 1.343 2 3 2s3-.895 3-2m0 0V6m0 0c0-1.105-1.343-2-3-2s-3 .895-3 2" />
                              </svg>
                              <span className="font-medium">{distance} km</span>
                            </div>
                          )}
                          {p.rating && (
                            <div className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span>{p.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => focusPlace(p)}
                          className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-md text-xs font-medium hover:bg-emerald-700 transition-colors"
                        >
                          View on Map
                        </button>
                        <button
                          onClick={() => window.open(getDirectionsUrl(p), '_blank')}
                          className="flex-1 px-3 py-2 border border-emerald-600 text-emerald-700 rounded-md text-xs font-medium bg-white hover:bg-emerald-50 transition-colors"
                        >
                          Directions
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  {places.length === 0 && !isLoadingLocation ? (
                    <>
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <p className="text-sm text-gray-600">No locations found.</p>
                      <p className="text-xs text-gray-500 mt-1">Try adjusting your location.</p>
                    </>
                  ) : (
                    <>
                      <svg className="animate-spin h-8 w-8 text-emerald-600 mx-auto" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-sm text-gray-600 mt-3">Finding locations...</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT: MAP */}
        <main className={`flex-1 relative bg-white overflow-hidden min-h-[50vh] lg:min-h-screen ${mobileView === 'map' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`}>
          <div className="absolute top-4 right-4 z-30 flex items-center gap-1 bg-white rounded-lg shadow-md border border-gray-200">
            <button onClick={() => setMapType('roadmap')} className="px-4 py-2 text-xs font-medium text-gray-700 border-r border-gray-200 hover:bg-gray-50">Map</button>
            <button onClick={() => setMapType('satellite')} className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">Satellite</button>
          </div>

          <div id="map" ref={mapRef} style={{ width: '100%', height: '100%' }} />

          <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-2">
            <button onClick={getCurrentLocation} className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 hover:shadow-xl hover:bg-gray-50 transition-all">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4m0-5C6.48 3 2 6.48 2 11c0 3.3 2.04 6.31 4.95 7.61C7.8 20.75 9.6 21 12 21s4.2-.25 5.05-.39C19.96 17.31 22 14.3 22 11c0-4.52-4.48-8-10-8z" />
              </svg>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Maps;