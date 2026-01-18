// ===============================
// État du formulaire
// ===============================
let formData = {
    identity: {
        civility: '',
        lastName: '',
        firstName: '',
        birthDate: '',
        email: '',
        phone: ''
    },
    address: {
        street: '',
        complement: '',
        housingType: '',
        floor: '',
        hasElevator: false,
        accessInfo: '',
        parking: '',
        mapAddress: '',
        city: ''
    },
    health: {
        activityLevel: '',
        goals: [],
        injuries: ''
    },
    consents: {
        healthInfo: false,
        communications: false
    }
};

// ===============================
// État de validation
// ===============================
let validationState = {
    identity: false,
    address: false,
    consents: false
};

//  état adresse géocodée
let addressIsGeocoded = false;

// ===============================
// Initialisation
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    loadFormData();
    populateForm();
    validateAllSections();
    updateNavigationButton();
    setupEventListeners();
    setupFormDependencies();
});

// ===============================
// Géocodage OpenStreetMap
// ===============================
async function geocodeAddress(address) {
    const encoded = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=fr`;

    try {
        const response = await fetch(url, {
            headers: {
                'Accept-Language': 'fr',
                'User-Agent': 'Zenlya-Booking'
            }
        });
        const data = await response.json();
        if (data && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
    } catch (e) {
        console.error('Erreur géocodage', e);
    }
    return null;
}

// ===============================
// Chargement / sauvegarde
// ===============================
function loadFormData() {
    const saved = localStorage.getItem('bookingFormData');
    if (saved) formData = JSON.parse(saved);
}

function saveFormData() {
    localStorage.setItem('bookingFormData', JSON.stringify(formData));
}

// ===============================
// Remplissage du formulaire
// ===============================
function populateForm() {
    Object.keys(formData.identity).forEach(k => {
        const el = document.getElementById(k);
        if (el) el.value = formData.identity[k];
    });

    Object.keys(formData.address).forEach(k => {
        const el = document.getElementById(k);
        if (!el) return;
        el.type === 'checkbox'
            ? el.checked = formData.address[k]
            : el.value = formData.address[k];
    });

    const healthCheckbox = document.getElementById('healthInfo');
    if (healthCheckbox) {
        healthCheckbox.checked = formData.consents.healthInfo;
        formData.consents.healthInfo = healthCheckbox.checked;
    }

    updateHousingTypeFields();
}

// ===============================
// Event listeners
// ===============================
function setupEventListeners() {
    document.querySelectorAll('#civility,#lastName,#firstName,#birthDate,#email,#phone')
        .forEach(el => el.addEventListener('input', handleIdentityChange));

    document.querySelectorAll('#mapAddress,#city,#housingType,#parking,#complement,#floor,#accessInfo')
        .forEach(el => el.addEventListener('input', handleAddressChange));

    document.getElementById('hasElevator')?.addEventListener('change', handleAddressChange);
    document.getElementById('healthInfo')?.addEventListener('change', handleConsentsChange);
    document.getElementById('nextButton')?.addEventListener('click', handleSubmit);
}

// ===============================
// Handlers
// ===============================
function handleIdentityChange(e) {
    formData.identity[e.target.id] = e.target.value;
    validateIdentitySection();
    updateNavigationButton();
    saveFormData();
}

let lastGeocodeValue = '';
let geocodeTimeout;

async function handleAddressChange(e) {
    const field = e.target.id;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    formData.address[field] = value;

    const error = document.getElementById(field + 'Error');

    if (field === 'mapAddress' || field === 'city') {
        addressIsGeocoded = false;
        lastGeocodeValue = `${formData.address.mapAddress}, ${formData.address.city}, France`;

        if (!formData.address.mapAddress.trim() || !formData.address.city.trim()) {
            error.textContent = 'Adresse et ville requises';
            error.classList.add('active');
            validateAddressSection();
            validateConsentsSection();

        }

        if (geocodeTimeout) clearTimeout(geocodeTimeout);
        geocodeTimeout = setTimeout(async () => {
            const coords = await geocodeAddress(lastGeocodeValue);

            const mapError = document.getElementById('mapAddressError');
            const cityError = document.getElementById('cityError');

            if (!coords) {
                mapError.textContent = "Adresse introuvable. Veuillez entrer une adresse complète avec la ville.";
                mapError.classList.add('active');
                cityError.textContent = "Adresse introuvable. Veuillez entrer une adresse complète avec la ville.";
                cityError.classList.add('active');
                addressIsGeocoded = false;
                formData.address.lat = null;
                formData.address.lng = null;
            } else {
                formData.address.lat = coords.lat;
                formData.address.lng = coords.lng;
                mapError.textContent = '';
                mapError.classList.remove('active');
                cityError.textContent = '';
                cityError.classList.remove('active');
                addressIsGeocoded = true;
            }

            validateAddressSection();
            validateAllSections();
            updateNavigationButton();
            saveFormData();
        }, 500);
    } else {
        if (error) {
            if (!value || value.toString().trim() === '') {
                error.textContent = 'Champ requis';
                error.classList.add('active');
            } else {
                error.textContent = '';
                error.classList.remove('active');
            }
        }
        validateAddressSection();
        validateAllSections();
        updateNavigationButton();
        saveFormData();
    }
}

function handleConsentsChange(e) {
    formData.consents[e.target.id] = e.target.checked;
    validateConsentsSection();
    updateNavigationButton();
    saveFormData();
}

// ===============================
// Validation
// ===============================
function validateIdentityField(field) {
    const value = formData.identity[field];
    const error = document.getElementById(`${field}Error`);
    let valid = true;
    let message = '';

    if (!value || value.trim() === '') {
        valid = false;
        message = 'Champ requis';
    } else if (field === 'email') {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!valid) message = 'Email invalide';
    } else if (field === 'phone') {
        valid = /^0[67]\d{8}$/.test(value.replace(/\D/g, ''));
        if (!valid) message = 'Numéro invalide';
    } else if (field === 'birthDate') {
        const age = getAge(value);
        const MIN_AGE = 16;
        const birth = new Date(value);
        const today = new Date();

        if (birth > today) {
            valid = false;
            message = "La date de naissance ne peut pas être dans le futur.";
        } else if (isNaN(age) || age < MIN_AGE) {
            valid = false;
            message = `Vous devez avoir au moins ${MIN_AGE} ans.`;
        }
    }

    if (error) {
        error.textContent = message;
        error.classList.toggle('active', !valid);
    }

    return valid;
}

function validateIdentitySection() {
    validationState.identity = [
        'civility',
        'lastName',
        'firstName',
        'birthDate',
        'email',
        'phone'
    ].every(validateIdentityField);
}

function validateAddressField(field) {
    const value = formData.address[field];
    const error = document.getElementById(`${field}Error`);
    let valid = true;

    if (!value || value.toString().trim() === '') {
        valid = false;
        if (error) {
            error.textContent = 'Champ requis';
            error.classList.add('active');
        }
    } else if (error) {
        error.textContent = '';
        error.classList.remove('active');
    }

    return valid;
}

function validateAddressSection() {
    const baseValid = ['mapAddress', 'city', 'housingType', 'parking']
        .every(validateAddressField);

    validationState.address = baseValid && addressIsGeocoded;

    const mapError = document.getElementById('mapAddressError');
    const cityError = document.getElementById('cityError');

    if (!addressIsGeocoded && formData.address.mapAddress.trim() && formData.address.city.trim()) {
        if (mapError) {
            mapError.textContent = "Adresse introuvable. Veuillez entrer une adresse complète et correcte.";
            mapError.classList.add('active');
        }
        if (cityError) {
            cityError.textContent = "Adresse introuvable. Veuillez entrer une adresse complète et correcte.";
            cityError.classList.add('active');
        }
    } else if (addressIsGeocoded) {
        if (mapError) {
            mapError.textContent = '';
            mapError.classList.remove('active');
        }
        if (cityError) {
            cityError.textContent = '';
            cityError.classList.remove('active');
        }
    }
}

function validateConsentsSection() {
    const error = document.getElementById('healthInfoError');
    validationState.consents = !!formData.consents.healthInfo;

    if (!validationState.consents && error) {
        error.textContent = "Vous devez certifier que les informations de santé sont exactes.";
        error.classList.add('active');
    } else if (error) {
        error.textContent = '';
        error.classList.remove('active');
    }
}

function validateAllSections() {
    validateIdentitySection();
    validateAddressSection();
    validateConsentsSection();
}

// ===============================
// Navigation
// ===============================
function updateNavigationButton() {
    const btn = document.getElementById('nextButton');
    if (!btn) return;

    validateAllSections();

    // récupérer l'état réel du checkbox
    const healthInfoCheckbox = document.getElementById('healthInfo');
    const consentChecked = healthInfoCheckbox ? healthInfoCheckbox.checked : false;

    const canProceed =
        validationState.identity &&
        validationState.address &&
        consentChecked;

    btn.disabled = !canProceed;
}




// ===============================
// Submit final avec calendrier + PDF
// ===============================
async function handleSubmit() {
    validateAllSections();
    updateNavigationButton();

    // Récupère bookingData existant (discipline + session + date + time)
    const previousBooking = JSON.parse(localStorage.getItem('bookingData')) || {};

    // Vérifie qu’une date et un créneau ont été choisis
    if (!previousBooking.date || !previousBooking.time) {
        alert("Veuillez sélectionner une date et un créneau avant de continuer.");
        return;
    }

    // Vérifie géocodage adresse
    const addressValid = await validateAddressBeforeSubmit();
    if (!addressValid) {
        alert("Adresse invalide. Veuillez entrer une adresse réelle et reconnue.");
        return;
    }

    if (!formData.consents.healthInfo) {
        alert("Vous devez certifier que les informations de santé sont exactes.");
        return;
    }

    const btn = document.getElementById('nextButton');
    btn.disabled = true;
    btn.textContent = "Envoi en cours...";

    const bookingData = {
        ...previousBooking, // discipline, sessionType, date, time
        identity: formData.identity,
        address: {
            street: formData.address.mapAddress,
            city: formData.address.city,
            complement: formData.address.complement,
            floor: formData.address.floor,
            hasElevator: formData.address.hasElevator,
            housingType: formData.address.housingType,
            parking: formData.address.parking,
            accessInfo: formData.address.accessInfo,
            lat: addressIsGeocoded ? formData.address.lat : null,
            lng: addressIsGeocoded ? formData.address.lng : null
        },
        health: formData.health,
        consents: formData.consents
    };

    // Sauvegarde locale
    localStorage.setItem('bookingData', JSON.stringify(bookingData));

    // Préparer résumé PDF
    const summary = prepareBookingSummary(bookingData);
    console.log("Résumé réservation pour PDF ou serveur :", summary);

    try {
        const response = await fetch('/reservation/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        const result = await response.json();

        if (!result.success) {
            alert('Erreur serveur : ' + (result.message || 'Impossible de créer la réservation'));
            btn.disabled = false;
            btn.textContent = "Valider ma réservation";
            return;
        }

        // Redirection vers page confirmation
        window.location.href = btn.dataset.confirmationUrl;
    } catch (err) {
        console.error('Erreur lors de la réservation :', err);
        alert('Impossible de contacter le serveur.');
        btn.disabled = false;
        btn.textContent = "Valider ma réservation";
    }
}

// ===============================
// Préparer résumé pour PDF / serveur
// ===============================
function prepareBookingSummary(booking) {
    const disciplines = JSON.parse(localStorage.getItem('disciplines')) || {}; // si tu as une config disciplines
    const session = disciplines[booking.discipline]?.sessions
        .find(s => s.id === booking.sessionType);

    return {
        client: booking.identity,
        address: booking.address,
        sessionName: session?.name || '',
        sessionDuration: session?.duration || '',
        sessionPrice: session?.price || '',
        date: booking.date,
        time: booking.time
    };
}

// ===============================
// Validation adresse avant submit
// ===============================
async function validateAddressBeforeSubmit() {
    const address = `${formData.address.mapAddress}, ${formData.address.city}, France`;

    if (!formData.address.mapAddress.trim() || !formData.address.city.trim()) {
        return false;
    }

    const coords = await geocodeAddress(address);

    if (!coords) return false;

    formData.address.lat = coords.lat;
    formData.address.lng = coords.lng;
    addressIsGeocoded = true;
    saveFormData();

    return true;
}

// ===============================
// Dépendances logement
// ===============================
function setupFormDependencies() {
    document.getElementById('housingType')?.addEventListener('change', updateHousingTypeFields);
}

function updateHousingTypeFields() {
    const housingType = document.getElementById('housingType');
    if (!housingType) return;

    const isApt = housingType.value === 'appartement';
    document.getElementById('floorGroup').style.display = isApt ? 'block' : 'none';
    document.getElementById('elevatorGroup').style.display = isApt ? 'block' : 'none';

    if (!isApt) {
        const floor = document.getElementById('floor');
        const elevator = document.getElementById('hasElevator');
        if (floor) floor.value = '';
        if (elevator) elevator.checked = false;
        formData.address.floor = '';
        formData.address.hasElevator = false;
        saveFormData();
    }
}

// ===============================
// Utilitaires
// ===============================
function getAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

    return age;
}
