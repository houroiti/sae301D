// ===============================
// Initialisation après DOM
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé, initialisation carte...');
    initMap();
});

// ===============================
// Carte Leaflet + markers
// ===============================
function initMap() {
    // Création de la carte
    const map = L.map('map').setView([48.2973, 4.0744], 12);

    // Tiles Carto
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OSM &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    console.log('Carte initialisée !');

    const markers = [];

    //  marker personnalisé
    function createZenMarker(lat, lon, popupText) {
        const marker = L.marker([lat, lon], {
            icon: L.divIcon({
                className: 'zen-marker',
                html: '<div></div>',
                iconSize: [16, 16]
            })
        }).addTo(map);

        marker.bindPopup(popupText, {
            className: 'zen-popup',
            closeButton: true,
            autoClose: false,
            closeOnClick: false
        });

        marker.on('click', function() {
            map.flyTo(this.getLatLng(), 16, { duration: 0.7 });
            this.openPopup();
        });

        return marker;
    }

    // Ajout des markers à partir de la liste de réservations
    async function addMarkersFromReservations(resList) {
        // Supprime anciens markers
        markers.forEach(m => map.removeLayer(m));
        markers.length = 0;

        for (let res of resList) {
            // Si coordonnées manquantes, géocode l'adresse
            if (typeof res.lat !== 'number' || typeof res.lng !== 'number') {
                const fullAddress = res.address?.full || '';

                if (!fullAddress) {
                    console.warn('Adresse vide pour', res.client);
                    continue;
                }

                const coords = await geocodeAddress(fullAddress);
                if (!coords) {
                    console.warn('Géocodage échoué pour', fullAddress);
                    continue;
                }

                res.lat = coords.lat;
                res.lng = coords.lng;
            }

            markers.push(createZenMarker(res.lat, res.lng, `<b>${res.client}</b>`));
        }

        // Sauvegarde mise à jour dans localStorage
        localStorage.setItem('reservations', JSON.stringify(resList));
    }

    // ===============================
    // Initialisation des données
    // ===============================
    //
    console.log('Reservations initiales :', window.reservations);
    addMarkersFromReservations(window.reservations);

    // rafraîchir les markers après ajout réservation
    window.refreshMapMarkers = () => {
        const stored = JSON.parse(localStorage.getItem('reservations') || '[]');
        if (stored.length > 0) {
            window.reservations = stored;
        }
        addMarkersFromReservations(window.reservations);
    };
}

// ===============================
// Géocodage via Nominatim
// ===============================
async function geocodeAddress(address) {
    if (!address) return null;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
    } catch(e) {
        console.error('Erreur géocodage:', e);
    }
    return null;
}
