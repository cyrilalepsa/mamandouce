import { useState, useEffect, useMemo } from 'react';
import { Card } from '../ui/card';
import { MapPin, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../utils/api';

// Fix for default marker icons in Leaflet with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom cluster icon
const createClusterIcon = (count) => {
  const size = count < 10 ? 30 : count < 50 ? 40 : 50;
  const color = count < 10 ? '#38bdf8' : count < 50 ? '#f472b6' : '#a855f7';
  
  return L.divIcon({
    html: `
      <div style="
        background: linear-gradient(145deg, ${color}dd, ${color}aa);
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size * 0.4}px;
        box-shadow: 0 4px 12px ${color}66, inset 0 2px 4px rgba(255,255,255,0.3);
        border: 2px solid white;
      ">
        ${count}
      </div>
    `,
    className: 'custom-cluster-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Map bounds adjuster component
function MapBoundsAdjuster({ locations }) {
  const map = useMap();
  
  useEffect(() => {
    if (locations && locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);
  
  return null;
}

export function CityMapWidget() {
  const [cityData, setCityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTable, setShowTable] = useState(true);

  useEffect(() => {
    loadCityData();
  }, []);

  const loadCityData = async () => {
    try {
      const response = await api.admin.getCityStats();
      setCityData(response.data.cities || []);
    } catch (error) {
      console.error('Erreur chargement données villes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Compute locations with geocoding (simplified - use city coordinates)
  const locations = useMemo(() => {
    // Simple French city coordinates mapping
    const cityCoords = {
      'paris': { lat: 48.8566, lng: 2.3522 },
      'marseille': { lat: 43.2965, lng: 5.3698 },
      'lyon': { lat: 45.7640, lng: 4.8357 },
      'toulouse': { lat: 43.6047, lng: 1.4442 },
      'nice': { lat: 43.7102, lng: 7.2620 },
      'nantes': { lat: 47.2184, lng: -1.5536 },
      'strasbourg': { lat: 48.5734, lng: 7.7521 },
      'montpellier': { lat: 43.6108, lng: 3.8767 },
      'bordeaux': { lat: 44.8378, lng: -0.5792 },
      'lille': { lat: 50.6292, lng: 3.0573 },
      'rennes': { lat: 48.1173, lng: -1.6778 },
      'reims': { lat: 49.2583, lng: 4.0317 },
      'le havre': { lat: 49.4944, lng: 0.1079 },
      'saint-étienne': { lat: 45.4397, lng: 4.3872 },
      'toulon': { lat: 43.1242, lng: 5.9280 },
      'grenoble': { lat: 45.1885, lng: 5.7245 },
      'dijon': { lat: 47.3220, lng: 5.0415 },
      'angers': { lat: 47.4784, lng: -0.5632 },
      'nîmes': { lat: 43.8367, lng: 4.3601 },
      'villeurbanne': { lat: 45.7676, lng: 4.8806 },
      'clermont-ferrand': { lat: 45.7772, lng: 3.0870 },
      'le mans': { lat: 48.0061, lng: 0.1996 },
      'aix-en-provence': { lat: 43.5297, lng: 5.4474 },
      'brest': { lat: 48.3904, lng: -4.4861 },
      'limoges': { lat: 45.8336, lng: 1.2611 },
      'tours': { lat: 47.3941, lng: 0.6848 },
      'amiens': { lat: 49.8941, lng: 2.2958 },
      'perpignan': { lat: 42.6887, lng: 2.8948 },
      'metz': { lat: 49.1193, lng: 6.1757 },
      'besançon': { lat: 47.2378, lng: 6.0241 },
      'orléans': { lat: 47.9029, lng: 1.9039 },
      'rouen': { lat: 49.4432, lng: 1.0999 },
      'mulhouse': { lat: 47.7508, lng: 7.3359 },
      'caen': { lat: 49.1829, lng: -0.3707 },
      'nancy': { lat: 48.6921, lng: 6.1844 },
      'argenteuil': { lat: 48.9472, lng: 2.2467 },
      'montreuil': { lat: 48.8638, lng: 2.4486 },
      'roubaix': { lat: 50.6942, lng: 3.1746 },
      'dunkerque': { lat: 51.0343, lng: 2.3768 },
      'tourcoing': { lat: 50.7262, lng: 3.1612 },
      'avignon': { lat: 43.9493, lng: 4.8055 },
      'poitiers': { lat: 46.5802, lng: 0.3404 },
      'versailles': { lat: 48.8014, lng: 2.1301 },
      'nanterre': { lat: 48.8924, lng: 2.2071 },
      'courbevoie': { lat: 48.8966, lng: 2.2526 },
      'vitry-sur-seine': { lat: 48.7874, lng: 2.3929 },
      'créteil': { lat: 48.7909, lng: 2.4628 },
      'pau': { lat: 43.2951, lng: -0.3708 },
      'colombes': { lat: 48.9227, lng: 2.2533 },
      'la rochelle': { lat: 46.1603, lng: -1.1511 },
      'rueil-malmaison': { lat: 48.8765, lng: 2.1895 },
      'champigny-sur-marne': { lat: 48.8177, lng: 2.5156 },
      'antibes': { lat: 43.5808, lng: 7.1239 },
      'saint-maur-des-fossés': { lat: 48.7997, lng: 2.4997 },
      'béziers': { lat: 43.3442, lng: 3.2158 },
      'cannes': { lat: 43.5528, lng: 7.0174 },
      'calais': { lat: 50.9513, lng: 1.8587 },
      'saint-nazaire': { lat: 47.2733, lng: -2.2139 },
      'mérignac': { lat: 44.8386, lng: -0.6439 },
      'drancy': { lat: 48.9302, lng: 2.4506 },
      'colmar': { lat: 48.0794, lng: 7.3558 },
      'issy-les-moulineaux': { lat: 48.8244, lng: 2.2700 },
      'noisy-le-grand': { lat: 48.8497, lng: 2.5528 },
      'évry-courcouronnes': { lat: 48.6311, lng: 2.4295 },
      'levallois-perret': { lat: 48.8938, lng: 2.2875 },
      'ajaccio': { lat: 41.9192, lng: 8.7386 },
      'bastia': { lat: 42.6976, lng: 9.4509 },
      'bourges': { lat: 47.0810, lng: 2.3988 },
      'troyes': { lat: 48.2973, lng: 4.0744 },
      'quimper': { lat: 47.9967, lng: -4.0964 },
      'lorient': { lat: 47.7486, lng: -3.3662 },
      'saint-quentin': { lat: 49.8487, lng: 3.2872 },
      'la seyne-sur-mer': { lat: 43.1039, lng: 5.8853 },
      'beauvais': { lat: 49.4295, lng: 2.0807 },
      'niort': { lat: 46.3237, lng: -0.4588 },
      'vannes': { lat: 47.6586, lng: -2.7600 },
      'valence': { lat: 44.9334, lng: 4.8924 },
      'épinal': { lat: 48.1723, lng: 6.4487 },
      'cholet': { lat: 47.0603, lng: -0.8767 },
      'boulogne-sur-mer': { lat: 50.7264, lng: 1.6147 },
    };
    
    return cityData
      .filter(city => {
        const cityLower = city.city?.toLowerCase() || '';
        return cityCoords[cityLower];
      })
      .map(city => {
        const cityLower = city.city?.toLowerCase() || '';
        const coords = cityCoords[cityLower];
        return {
          city: city.city,
          count: city.count,
          lat: coords?.lat || 46.603354,
          lng: coords?.lng || 1.888334
        };
      });
  }, [cityData]);

  // Default center (France)
  const defaultCenter = [46.603354, 1.888334];
  const defaultZoom = 5;

  if (loading) {
    return (
      <Card className="bg-white rounded-2xl p-6 text-center">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-400" />
        <p className="text-sm text-slate-500 mt-2">Chargement de la carte...</p>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-2xl overflow-hidden border-0" style={{
      boxShadow: `
        -4px -4px 12px rgba(255, 255, 255, 0.9),
        4px 4px 16px rgba(148, 163, 184, 0.25),
        inset 0 2px 4px rgba(255, 255, 255, 0.6)
      `
    }}>
      {/* Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-700">Cartographie des inscrites</h3>
            <p className="text-xs text-slate-500">{cityData.length} ville(s) • {cityData.reduce((sum, c) => sum + c.count, 0)} utilisatrice(s)</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </div>

      {/* Map and Table */}
      {isExpanded && (
        <div className="border-t border-slate-100">
          {/* Map Container */}
          <div className="h-[300px] relative" data-testid="city-map-container">
            <MapContainer 
              center={defaultCenter} 
              zoom={defaultZoom} 
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {locations.map((loc, index) => (
                <Marker 
                  key={index} 
                  position={[loc.lat, loc.lng]}
                  icon={createClusterIcon(loc.count)}
                >
                  <Popup>
                    <div className="text-center p-1">
                      <p className="font-bold text-slate-700">{loc.city}</p>
                      <p className="text-sm text-pink-500">{loc.count} inscrite(s)</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {locations.length > 0 && <MapBoundsAdjuster locations={locations} />}
            </MapContainer>
          </div>

          {/* Toggle Table Button */}
          <div className="p-2 border-t border-slate-100">
            <button
              onClick={(e) => { e.stopPropagation(); setShowTable(!showTable); }}
              className="w-full text-xs text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1"
            >
              {showTable ? 'Masquer le tableau' : 'Afficher le tableau'}
              {showTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* City Table */}
          {showTable && (
            <div className="p-4 pt-0">
              <div className="max-h-[200px] overflow-y-auto overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-sm min-w-[250px]" data-testid="city-stats-table">
                  <thead className="bg-gradient-to-r from-sky-50 to-pink-50 sticky top-0">
                    <tr>
                      <th className="text-left py-2 px-2 sm:px-3 font-semibold text-slate-600 text-xs sm:text-sm">Ville</th>
                      <th className="text-right py-2 px-2 sm:px-3 font-semibold text-slate-600 text-xs sm:text-sm">Inscrites</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cityData.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="text-center py-4 text-slate-400 text-xs sm:text-sm">
                          Aucune donnée de ville
                        </td>
                      </tr>
                    ) : (
                      cityData.sort((a, b) => b.count - a.count).map((city, index) => (
                        <tr key={index} className="border-t border-slate-50 hover:bg-slate-50/50">
                          <td className="py-2 px-2 sm:px-3 text-slate-700 text-xs sm:text-sm truncate max-w-[150px]">{city.city || 'Non renseignée'}</td>
                          <td className="py-2 px-2 sm:px-3 text-right">
                            <span className="inline-flex items-center justify-center min-w-[24px] sm:min-w-[28px] h-5 sm:h-6 px-1.5 sm:px-2 rounded-full bg-gradient-to-r from-pink-100 to-sky-100 text-pink-600 font-semibold text-[10px] sm:text-xs">
                              {city.count}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
