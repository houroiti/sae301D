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
        parking: ''
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

// ===============================
// Initialisation
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    loadFormData();           // Charge formData depuis localStorage
    populateForm();           // Remplit les champs du DOM

    validateAllSections();    // ✅ Valide toutes les sections AVANT les écouteurs
    updateNavigationButton(); // ✅ Active/désactive le bouton

    setupEventListeners();
    setupFormDependencies();

    console.log("ValidationState après DOMContentLoaded:", validationState);
});

// ===============================
// Chargement / sauvegarde
// ===============================
function loadFormData() {
    const saved = localStorage.getItem('bookingFormData');
    if (saved) {
        formData = JSON.parse(saved);
    }
}

function saveFormData() {
    localStorage.setItem('bookingFormData', JSON.stringify(formData));

    const savedBooking = localStorage.getItem('bookingData');
    let bookingData = savedBooking ? JSON.parse(savedBooking) : {};

    bookingData.identity = formData.identity;
    bookingData.address = formData.address;
    bookingData.health = formData.health;
    bookingData.consents = formData.consents;

    localStorage.setItem('bookingData', JSON.stringify(bookingData));
}

// ===============================
// Remplissage du formulaire
// ===============================
function populateForm() {
    Object.keys(formData.identity).forEach(key => {
        const el = document.getElementById(key);
        if (el) el.value = formData.identity[key];
    });

    Object.keys(formData.address).forEach(key => {
        const el = document.getElementById(key);
        if (!el) return;
        el.type === 'checkbox'
            ? el.checked = formData.address[key]
            : el.value = formData.address[key];
    });

    const activity = document.querySelector(
        `input[name="activityLevel"][value="${formData.health.activityLevel}"]`
    );
    if (activity) activity.checked = true;

    document.querySelectorAll('.checkbox-grid input[type="checkbox"]').forEach(cb => {
        cb.checked = formData.health.goals.includes(cb.value);
    });

    const injuries = document.getElementById('injuries');
    if (injuries) injuries.value = formData.health.injuries;

    const healthInfo = document.getElementById('healthInfo');
    if (healthInfo) healthInfo.checked = formData.consents.healthInfo;

    const communications = document.getElementById('communications');
    if (communications) communications.checked = formData.consents.communications;

    updateHousingTypeFields();
}

// ===============================
// Écouteurs
// ===============================
function setupEventListeners() {
    document.querySelectorAll(
        '#lastName, #firstName, #birthDate, #email, #phone'
    ).forEach(el => el.addEventListener('input', handleIdentityChange));

    const civility = document.getElementById('civility');
    if (civility) civility.addEventListener('change', handleIdentityChange);

    document.querySelectorAll(
        '#street, #complement, #floor, #accessInfo'
    ).forEach(el => el.addEventListener('input', handleAddressChange));

    document.querySelectorAll('#housingType, #parking')
        .forEach(el => el.addEventListener('change', handleAddressChange));

    const elevator = document.getElementById('hasElevator');
    if (elevator) elevator.addEventListener('change', handleAddressChange);

    document.querySelectorAll('input[name="activityLevel"]')
        .forEach(r => r.addEventListener('change', handleHealthChange));

    document.querySelectorAll('.checkbox-grid input')
        .forEach(cb => cb.addEventListener('change', handleHealthChange));

    const injuries = document.getElementById('injuries');
    if (injuries) injuries.addEventListener('input', handleHealthChange);

    const healthInfo = document.getElementById('healthInfo');
    if (healthInfo) healthInfo.addEventListener('change', handleConsentsChange);

    const communications = document.getElementById('communications');
    if (communications) communications.addEventListener('change', handleConsentsChange);

    const nextButton = document.getElementById('nextButton');
    if (nextButton) {
        nextButton.onclick = () => {
            if (!canProceed()) return;
            saveFormData();
            window.location.href = nextButton.dataset.confirmationUrl;
        };
    }
}

// ===============================
// Dépendances
// ===============================
function setupFormDependencies() {
    const housingType = document.getElementById('housingType');
    if (housingType) {
        housingType.addEventListener('change', updateHousingTypeFields);
    }
}

function updateHousingTypeFields() {
    const housingType = document.getElementById('housingType');
    if (!housingType) return;

    const isApartment = housingType.value === 'appartement';
    const floorGroup = document.getElementById('floorGroup');
    const elevatorGroup = document.getElementById('elevatorGroup');

    if (floorGroup) floorGroup.style.display = isApartment ? 'block' : 'none';
    if (elevatorGroup) elevatorGroup.style.display = isApartment ? 'block' : 'none';
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

function handleAddressChange(e) {
    const field = e.target.id;
    formData.address[field] =
        e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    validateAddressSection();
    updateNavigationButton();
    saveFormData();
}

function handleHealthChange(e) {
    if (e.target.name === 'activityLevel') {
        formData.health.activityLevel = e.target.value;
    } else if (e.target.type === 'checkbox') {
        const goals = formData.health.goals;
        if (e.target.checked && !goals.includes(e.target.value)) {
            goals.push(e.target.value);
        } else if (!e.target.checked) {
            formData.health.goals = goals.filter(g => g !== e.target.value);
        }
    } else {
        formData.health.injuries = e.target.value;
    }
    saveFormData();
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
function validateIdentitySection() {
    validationState.identity = [
        'civility','lastName','firstName','birthDate','email','phone'
    ].every(validateIdentityField);
}

function validateAddressSection() {
    validationState.address = [
        'street','housingType','parking'
    ].every(validateAddressField);
}

function validateConsentsSection() {
    validationState.consents = !!formData.consents.healthInfo; // force bool
}

function validateAllSections() {
    validateIdentitySection();
    validateAddressSection();
    validateConsentsSection();
}

// ===============================
// Bouton navigation
// ===============================
function updateNavigationButton() {
    const btn = document.getElementById('nextButton');
    if (btn) btn.disabled = !canProceed();
}

function canProceed() {
    return (
        validationState.identity &&
        validationState.address &&
        validationState.consents
    );
}

// ===============================
// Utils
// ===============================
function validateIdentityField(field) {
    const value = formData.identity[field];
    const error = document.getElementById(`${field}Error`);
    let valid = true;

    if (!value || value.trim() === '') valid = false;

    if (field === 'email') {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    if (field === 'phone') {
        valid = /^0[67]\d{8}$/.test(value.replace(/\D/g, '')); // accepte les espaces
    }

    if (error) error.textContent = valid ? '' : 'Champ invalide';
    return valid;
}

function validateAddressField(field) {
    const value = formData.address[field];
    const error = document.getElementById(`${field}Error`);

    let valid = true;
    if (field === 'street' || field === 'housingType' || field === 'parking') {
        valid = value && value.trim().length > 0;
    }

    if (error) error.textContent = valid ? '' : 'Champ requis';
    return valid;
}
