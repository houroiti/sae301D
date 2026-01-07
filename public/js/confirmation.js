/* =========================
   DONNÉES DE CONFIGURATION
========================= */

const disciplines = {
    'yin-yoga': {
        name: 'Yin Yoga',
        sessions: [
            { id: 'decouverte', name: 'Séance découverte', duration: 60, price: 50 },
            { id: 'flexibilite', name: 'Yin Yoga flexibilité', duration: 75, price: 60 },
            { id: 'sommeil', name: 'Yin Yoga sommeil', duration: 90, price: 75 }
        ]
    },
    'pilates': {
        name: 'Pilates',
        sessions: [
            { id: 'fondamental', name: 'Pilates fondamental', duration: 55, price: 55 },
            { id: 'avance', name: 'Pilates avancé', duration: 70, price: 70 },
            { id: 'prenatal', name: 'Pilates prénatal', duration: 60, price: 65 }
        ]
    },
    'fitness': {
        name: 'Fitness',
        sessions: [
            { id: 'fullbody', name: 'Full Body Circuit', duration: 45, price: 45 },
            { id: 'hiit', name: 'HIIT intensif', duration: 30, price: 40 },
            { id: 'senior', name: 'Fitness senior', duration: 50, price: 50 }
        ]
    }
};

const additionalOptions = [
    { id: 'premium', name: 'Matériel premium', price: 10 },
    { id: 'posture', name: 'Évaluation posturale', price: 20 },
    { id: 'nutrition', name: 'Programme nutritionnel', price: 80 },
    { id: 'suivi', name: 'Suivi mensuel', price: 100 }
];

const frequencies = [
    { id: 'unique', discount: 0 },
    { id: '4sessions', discount: 15 },
    { id: '8sessions', discount: 25 },
    { id: '12sessions', discount: 35 }
];

/* =========================
   ÉTAT
========================= */

let bookingData = {};

/* =========================
   INIT
========================= */

document.addEventListener('DOMContentLoaded', () => {
    loadBookingData();
    displayBookingDetails();
    setupEventListeners();
});

/* =========================
   DONNÉES RÉSERVATION
========================= */

function loadBookingData() {
    const saved = localStorage.getItem('bookingData');

    if (!saved) {
        window.location.href = 'reservation-service.html';
        return;
    }

    bookingData = JSON.parse(saved);

    if (!bookingData.discipline || !bookingData.sessionType || !bookingData.date || !bookingData.time) {
        window.location.href = 'reservation-service.html';
    }
}

/* =========================
   AFFICHAGE
========================= */

function displayBookingDetails() {

    /* -------- EMAIL -------- */
    const clientEmail = document.getElementById('clientEmail');
    if (clientEmail && bookingData.identity?.email) {
        clientEmail.textContent = bookingData.identity.email;
    }

    /* -------- SESSION -------- */
    const sessionDetails = document.getElementById('sessionDetails');
    const sessionInfo = getSessionInfo();

    if (sessionDetails && sessionInfo) {
        const startDate = new Date(`${bookingData.date}T${bookingData.time}`);
        const endDate = new Date(startDate.getTime() + sessionInfo.duration * 60000);
        const endTime = endDate.toTimeString().slice(0, 5);

        const formattedDate = startDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        sessionDetails.innerHTML = `
            <div>• Discipline : ${disciplines[bookingData.discipline].name}</div>
            <div>• Type : ${sessionInfo.name}</div>
            <div>• Durée : ${sessionInfo.duration} minutes</div>
            <div>• Date : ${formattedDate}</div>
            <div>• Horaire : ${bookingData.time} - ${endTime}</div>
        `;
    }

    /* -------- CLIENT -------- */
    const clientDetails = document.getElementById('clientDetails');

    if (clientDetails && bookingData.identity && bookingData.address) {
        let civility = '';
        if (bookingData.identity.civility === 'mme') civility = 'Madame';
        if (bookingData.identity.civility === 'm') civility = 'Monsieur';

        let html = `
            <div>• ${civility} ${bookingData.identity.firstName} ${bookingData.identity.lastName}</div>
            <div>• ${bookingData.identity.email}</div>
            <div>• ${bookingData.identity.phone}</div>
            <div>• ${bookingData.address.street}</div>
        `;

        if (bookingData.address.complement) {
            html += `<div>• ${bookingData.address.complement}</div>`;
        }

        clientDetails.innerHTML = html;
    }

    /* -------- FINANCIER -------- */
    const financialDetails = document.getElementById('financialDetails');
    const total = calculateTotal();

    if (financialDetails && sessionInfo) {
        let html = `<div>• Séance ${sessionInfo.name} : ${sessionInfo.price}€</div>`;

        if (bookingData.options?.length) {
            bookingData.options.forEach(id => {
                const opt = additionalOptions.find(o => o.id === id);
                if (opt) html += `<div>• ${opt.name} : +${opt.price}€</div>`;
            });
        }

        html += `<div class="total-amount">• Total : ${total}€</div>`;
        financialDetails.innerHTML = html;
    }
}

/* =========================
   CALCULS
========================= */

function getSessionInfo() {
    const disc = disciplines[bookingData.discipline];
    return disc?.sessions.find(s => s.id === bookingData.sessionType) || null;
}

function calculateTotal() {
    let total = 0;
    const session = getSessionInfo();

    if (session) total += session.price;

    bookingData.options?.forEach(id => {
        const opt = additionalOptions.find(o => o.id === id);
        if (opt) total += opt.price;
    });

    const freq = frequencies.find(f => f.id === bookingData.frequency);
    if (freq?.discount) {
        total *= (1 - freq.discount / 100);
    }

    return Math.round(total);
}

/* =========================
   EVENTS
========================= */

function setupEventListeners() {

    document.getElementById('downloadPdf')?.addEventListener('click', () => {
        simulateDownload('confirmation-reservation.pdf');
        showNotification('PDF en cours de téléchargement');
    });

    document.getElementById('addCalendar')?.addEventListener('click', addToCalendar);

    document.getElementById('payNow')?.addEventListener('click', initiatePayment);

    document.getElementById('homeButton')?.addEventListener('click', () => {
        if (confirm("Retourner à l’accueil ?")) {
            localStorage.clear();
            window.location.href = 'reservation-service.html';
        }
    });
}

/* =========================
   ACTIONS
========================= */

function simulateDownload(filename) {
    const blob = new Blob(['Confirmation de réservation'], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

function addToCalendar() {
    const session = getSessionInfo();
    if (!session) return;

    const start = new Date(`${bookingData.date}T${bookingData.time}`);
    const end = new Date(start.getTime() + session.duration * 60000);

    const format = d => d.toISOString().replace(/-|:|\.\d+/g, '');
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(session.name)}&dates=${format(start)}/${format(end)}`;

    window.open(url, '_blank');
}

function initiatePayment() {
    showNotification('Redirection vers le paiement sécurisé...', 'info');

    setTimeout(() => {
        const btn = document.getElementById('payNow');
        if (btn) {
            btn.textContent = ' Paiement effectué';
            btn.disabled = true;
        }
        showNotification('Paiement réussi', 'success');
    }, 1500);
}

/* =========================
   NOTIFICATIONS
========================= */

function showNotification(message, type = 'info') {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;

    Object.assign(notif.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '14px 18px',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,.15)',
        zIndex: 999
    });

    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}
