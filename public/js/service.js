// Configuration des données
const disciplines = {
    'yin-yoga': {
        name: 'Yin Yoga',
        subtitle: 'Relaxation et flexibilité',
        sessions: [
            { id: 'decouverte', name: 'Séance découverte', duration: 60, price: 50, desc: 'Initiation douce au Yin Yoga', level: 'Débutants', material: 'Tapis' },
            { id: 'flexibilite', name: 'Yin Yoga flexibilité', duration: 75, price: 60, desc: 'Amélioration de la mobilité articulaire', level: 'Tous niveaux', material: 'Tapis + blocs' },
            { id: 'sommeil', name: 'Yin Yoga sommeil', duration: 90, price: 75, desc: 'Préparation au sommeil profond', level: 'Tous niveaux', material: 'Tapis + coussins + couverture' }
        ]
    },
    'pilates': {
        name: 'Pilates',
        subtitle: 'Renforcement et posture',
        sessions: [
            { id: 'fondamental', name: 'Pilates fondamental', duration: 55, price: 55, desc: 'Bases du Pilates au sol', level: 'Débutants', material: 'Tapis' },
            { id: 'avance', name: 'Pilates avancé', duration: 70, price: 70, desc: 'Avec équipement (Reformer portable)', level: 'Intermédiaire/avancé', material: 'Reformer + accessoires' },
            { id: 'prenatal', name: 'Pilates prénatal', duration: 60, price: 65, desc: 'Adapté à la grossesse', level: 'Femmes enceintes (2ème-3ème trimestre)', material: 'Tapis', warning: 'Autorisation médicale requise' }
        ]
    },
    'fitness': {
        name: 'Fitness',
        subtitle: 'Énergie et cardio',
        sessions: [
            { id: 'fullbody', name: 'Full Body Circuit', duration: 45, price: 45, desc: 'Circuit complet cardio + renforcement', level: 'Intermédiaire', material: 'Élastiques + haltères légers' },
            { id: 'hiit', name: 'HIIT intensif', duration: 30, price: 40, desc: 'Intervalles haute intensité', level: 'Avancé (bonne condition requise)', material: 'Poids du corps', warning: 'Contre-indications : Problèmes cardiaques' },
            { id: 'senior', name: 'Fitness senior', duration: 50, price: 50, desc: 'Doux, équilibre et autonomie', level: '60 ans et plus', material: 'Chaise de stabilité' }
        ]
    }
};

const additionalOptions = [
    { id: 'premium', name: 'Matériel premium', price: 10, desc: 'Kit complet : Tapis épais, blocs, sangles, rouleau de massage' },
    { id: 'posture', name: 'Évaluation posturale', price: 20, desc: 'Analyse posture avant/après séance\nConseils personnalisés pour le quotidien' },
    { id: 'nutrition', name: 'Programme nutritionnel', price: 80, desc: 'Plan alimentaire 7 jours sur mesure\nConsultation téléphonique de 30 min' },
    { id: 'suivi', name: 'Suivi mensuel', price: 100, desc: '2 appels de suivi/semaine\nAccès à l\'application de coaching\nAjustements du programme' }
];

// État de la réservation
let bookingData = {
    discipline: '',
    sessionType: '',
    options: [],
    frequency: 'unique'
};
/* =========================
   LOCAL STORAGE
========================= */
function loadBookingData() {
    try {
        const saved = localStorage.getItem('bookingData');
        if (saved) bookingData = JSON.parse(saved);
    } catch {
        localStorage.removeItem('bookingData');
    }
}


function saveBookingData() {
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
}
// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadBookingData();
    renderDisciplines();
    updateSummary();
    setupEventListeners();
});

// Rendu des disciplines
function renderDisciplines() {
    const container = document.getElementById('disciplineGrid');
    container.innerHTML = '';

    Object.entries(disciplines).forEach(([key, disc]) => {
        const btn = document.createElement('button');
        btn.className = `discipline-btn ${bookingData.discipline === key ? 'active' : ''}`;
        btn.innerHTML = `
            <div class="discipline-name">${disc.name}</div>
            <div class="discipline-subtitle">${disc.subtitle}</div>
        `;
        btn.addEventListener('click', () => selectDiscipline(key));
        container.appendChild(btn);
    });
}

// Sélection d'une discipline
function selectDiscipline(disciplineId) {
    bookingData.discipline = disciplineId;
    bookingData.sessionType = '';
    bookingData.options = [];
    saveBookingData();
    renderDisciplines();
    renderSessions();
    renderOptions();
    updateSummary();

    document.getElementById('sessionSection').style.display = 'block';
    document.getElementById('optionsSection').style.display = 'none';
}

// Rendu des sessions
function renderSessions() {
    const container = document.getElementById('sessionList');
    if (!bookingData.discipline) return;

    container.innerHTML = '';
    const sessions = disciplines[bookingData.discipline].sessions;

    sessions.forEach(session => {
        const item = document.createElement('div');
        item.className = `session-item ${bookingData.sessionType === session.id ? 'active' : ''}`;
        item.innerHTML = `
            <div class="session-header">
                <div class="session-name">${session.name}</div>
                <div class="session-price">${session.duration} min - ${session.price}€</div>
            </div>
            <div class="session-desc">${session.desc}</div>
            <div class="session-info">Public : ${session.level}</div>
            <div class="session-info">Matériel inclus : ${session.material}</div>
            ${session.warning ? `
                <div class="session-warning">
                    <i class="fas fa-exclamation-circle"></i>
                    ${session.warning}
                </div>
            ` : ''}
        `;
        item.addEventListener('click', () => selectSession(session.id));
        container.appendChild(item);
    });
}

// Sélection d'une session
function selectSession(sessionId) {
    bookingData.sessionType = sessionId;
    saveBookingData();
    renderSessions();
    renderOptions();
    updateSummary();

    document.getElementById('optionsSection').style.display = 'block';
}

// Rendu des options
function renderOptions() {
    const container = document.getElementById('optionsList');
    const summaryContainer = document.getElementById('optionsListSummary');

    container.innerHTML = '';
    summaryContainer.innerHTML = '';

    additionalOptions.forEach(option => {
        const item = document.createElement('label');
        item.className = 'option-item';
        item.innerHTML = `
            <input type="checkbox" value="${option.id}" ${bookingData.options.includes(option.id) ? 'checked' : ''}>
            <div class="option-content">
                <div class="option-header">
                    <span class="option-name">${option.name}</span>
                    <span class="option-price">+${option.price}€</span>
                </div>
                <div class="option-desc">${option.desc}</div>
            </div>
        `;
        const checkbox = item.querySelector('input');
        checkbox.addEventListener('change', (e) => toggleOption(option.id, e.target.checked));
        container.appendChild(item);

        if (bookingData.options.includes(option.id)) {
            const summaryItem = document.createElement('div');
            summaryItem.className = 'option-summary-item';
            summaryItem.textContent = `• ${option.name} : +${option.price}€`;
            summaryContainer.appendChild(summaryItem);
        }
    });

    document.getElementById('summaryOptions').style.display = bookingData.options.length > 0 ? 'block' : 'none';
}

// Basculer une option
function toggleOption(optionId, isChecked) {
    if (isChecked) {
        bookingData.options.push(optionId);
    } else {
        bookingData.options = bookingData.options.filter(id => id !== optionId);
    }
    saveBookingData();
    renderOptions();
    updateSummary();
}

// Mettre à jour le résumé et gérer le bouton
function updateSummary() {
    document.getElementById('summaryDiscipline').textContent =
        bookingData.discipline ? disciplines[bookingData.discipline].name : '—';

    const sessionInfo = getSessionInfo();
    document.getElementById('summarySession').textContent =
        sessionInfo ? sessionInfo.name : '—';
    document.getElementById('summaryDuration').textContent =
        sessionInfo ? `${sessionInfo.duration} minutes` : '—';

    document.getElementById('totalPrice').textContent = `TOTAL : ${calculateTotal()}€`;

    const nextButton = document.getElementById('nextButton');
    if (nextButton) {
        nextButton.onclick = (e) => {
            e.preventDefault(); // bloque la navigation automatique

            if (!bookingData.discipline || !bookingData.sessionType) {
                alert("Vous devez sélectionner un service et une session avant de réserver un créneau !");
                return;
            }

            saveBookingData();
            window.location.href = routeCreneaux;

        }
    }

}

// Calculer le total
function calculateTotal() {
    let total = 0;
    const session = getSessionInfo();
    if (session) total += session.price;

    bookingData.options.forEach(optId => {
        const opt = additionalOptions.find(o => o.id === optId);
        if (opt) total += opt.price;
    });

    return total;
}

// Obtenir les informations de la session
function getSessionInfo() {
    if (!bookingData.discipline || !bookingData.sessionType) return null;
    const disc = disciplines[bookingData.discipline];
    return disc ? disc.sessions.find(s => s.id === bookingData.sessionType) : null;
}

// Gestions d'autres événements si nécessaire
function setupEventListeners() {

}
