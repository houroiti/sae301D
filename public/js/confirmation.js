
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
   OUTILS
========================= */

function formatTime(date) {
    return date.toTimeString().slice(0, 5);
}

function formatForGoogleCalendar(date) {
    const pad = n => n.toString().padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

/* =========================
   DONNÉES RÉSERVATION
========================= */

function loadBookingData() {
    const saved = localStorage.getItem('bookingData');

    if (!saved) {
        showNotification("Aucune réservation trouvée. Veuillez remplir le formulaire.", "error");
        setTimeout(() => { window.location.href = '/client'; }, 2000);
        return;
    }

    try {
        bookingData = JSON.parse(saved);
    } catch (err) {
        console.error("Erreur parsing bookingData:", err);
        showNotification("Données de réservation corrompues. Veuillez remplir le formulaire.", "error");
        setTimeout(() => { window.location.href = '/client'; }, 2000);
        return;
    }

    if (!bookingData.discipline || !bookingData.sessionType || !bookingData.date || !bookingData.time) {
        showNotification("Informations de réservation incomplètes. Veuillez remplir le formulaire.", "error");
        setTimeout(() => { window.location.href = '/client'; }, 2000);
        return;
    }
}

/* =========================
   AFFICHAGE
========================= */

function displayBookingDetails() {
    if (!bookingData.identity || !bookingData.address) return;

    // Email client
    const clientEmail = document.getElementById('clientEmail');
    if (clientEmail) clientEmail.textContent = bookingData.identity.email || '';

    // Détails séance
    const sessionDetails = document.getElementById('sessionDetails');
    const sessionInfo = getSessionInfo();
    if (sessionDetails && sessionInfo) {
        const startDate = new Date(`${bookingData.date}T${bookingData.time}`);
        const endDate = new Date(startDate.getTime() + sessionInfo.duration * 60000);
        const formattedDate = startDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        sessionDetails.innerHTML = `
            <div>• Discipline : ${disciplines[bookingData.discipline].name}</div>
            <div>• Type : ${sessionInfo.name}</div>
            <div>• Durée : ${sessionInfo.duration} minutes</div>
            <div>• Date : ${formattedDate}</div>
            <div>• Horaire : ${formatTime(startDate)} - ${formatTime(endDate)}</div>
        `;

        // Bouton Paiement
        const payBtn = document.getElementById('payNow');
        if (payBtn) {
            if (bookingData.paidFromBackend === true) {
                payBtn.textContent = 'Paiement effectué';
                payBtn.disabled = true;
            } else {
                payBtn.textContent = 'Payer maintenant';
                payBtn.disabled = false;
            }
        }
    }

    // Infos client
    const clientInfo = document.getElementById('clientInfo');
    if (clientInfo) {
        const addr = bookingData.address;
        const birthDate = bookingData.identity.birthDate ? new Date(bookingData.identity.birthDate).toLocaleDateString('fr-FR') : '';
        clientInfo.innerHTML = `
            <li>Civilité : ${bookingData.identity.civility || ''}</li>
            <li>Nom : ${bookingData.identity.lastName || ''}</li>
            <li>Prénom : ${bookingData.identity.firstName || ''}</li>
            <li>Date de naissance : ${birthDate}</li>
            <li>Email : ${bookingData.identity.email || ''}</li>
            <li>Téléphone : ${bookingData.identity.phone || ''}</li>
            <li>Adresse : ${addr.street}${addr.complement ? ', ' + addr.complement : ''}</li>
            <li>Ville : ${addr.city || ''}</li>
            <li>Type de logement : ${addr.housingType || ''}</li>
            ${addr.floor ? `<li>Étage : ${addr.floor}</li>` : ''}
            ${addr.hasElevator ? `<li>Ascenseur : Oui</li>` : ''}
            ${addr.accessInfo ? `<li>Accès : ${addr.accessInfo}</li>` : ''}
            <li>Parking : ${addr.parking || ''}</li>
        `;
    }

    // Récap financier
    const financialSummary = document.getElementById('financialSummary');
    if (financialSummary && sessionInfo) {
        const total = calculateTotal();
        const optionsTotal = bookingData.options?.length
            ? bookingData.options.map(id => additionalOptions.find(o => o.id === id)?.price || 0).reduce((a, b) => a + b, 0)
            : 0;

        financialSummary.innerHTML = `
            <li>Prix : ${sessionInfo.price.toFixed(2)} €</li>
            <li>Options : ${optionsTotal.toFixed(2)} €</li>
            <li><strong>Total : ${total.toFixed(2)} €</strong></li>
        `;
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

    if (bookingData.options?.length) {
        bookingData.options.forEach(optId => {
            const opt = additionalOptions.find(o => o.id === optId);
            if (opt) total += opt.price || 0;
        });
    }

    const freq = frequencies.find(f => f.id === bookingData.frequency);
    if (freq?.discount) total *= (1 - freq.discount / 100);

    return total;
}


/* =========================
   EVENTS
========================= */

function setupEventListeners() {
    // Bouton Payer maintenant
    const payBtn = document.getElementById('payNow');
    if (payBtn) {
        payBtn.addEventListener('click', () => {
            console.log('initiatePayment déclenchée !');
            initiatePayment();
        });
    }

    // Boutons PDF et Google Calendar
    document.getElementById('addCalendar')?.addEventListener('click', addToGoogleCalendar);
    document.getElementById('downloadPdf')?.addEventListener('click', downloadPDF);
}


/* =========================
   ACTIONS
========================= */

function initiatePayment() {
    showNotification('Redirection vers le paiement sécurisé...', 'info');

    setTimeout(async () => {
        const session = getSessionInfo();
        if (!session) return;

        const startDate = new Date(`${bookingData.date}T${bookingData.time}`);
        const endDate = new Date(startDate.getTime() + session.duration * 60000);
        const optionsData = bookingData.options?.map(id => additionalOptions.find(o => o.id === id)) || [];
        const prixOptions = optionsData.reduce((sum, o) => sum + (o?.price || 0), 0);
        const total = calculateTotal();

        const reservationPayload = {
            identity: {
                lastName: bookingData.identity.lastName,
                firstName: bookingData.identity.firstName,
                email: bookingData.identity.email,
                phone: bookingData.identity.phone || '',
                birthDate: bookingData.identity.birthDate || '',
                civility: bookingData.identity.civility || ''
            },
            address: {
                street: bookingData.address.street || '',
                complement: bookingData.address.complement || '',
                city: bookingData.address.city || '',
                housingType: bookingData.address.housingType || '',
                floor: bookingData.address.floor || 0,
                hasElevator: bookingData.address.hasElevator || false,
                accessInfo: bookingData.address.accessInfo || '',
                parking: bookingData.address.parking || '',
                lat: bookingData.address.lat || 0,
                lng: bookingData.address.lng || 0
            },
            discipline: bookingData.discipline,
            sessionType: getSessionInfo()?.id || '',
            sessionName: getSessionInfo()?.name || '',
            date: bookingData.date,
            time: bookingData.time,
            duration: getSessionInfo()?.duration || 0,
            price: getSessionInfo()?.price || 0,
            options: bookingData.options?.map(id => {
                const o = additionalOptions.find(opt => opt.id === id);
                return o ? { id: o.id, name: o.name, price: o.price } : null;
            }).filter(Boolean),
            total: calculateTotal(),
            frequency: bookingData.frequency || 'unique',
            status: 'pending'

        };


        try {
            const response = await fetch('/reservation/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reservationPayload)
            });
            const result = await response.json();



            if (result.success) {
                bookingData.paidFromBackend = true; // flag réel backend
                localStorage.setItem('bookingData', JSON.stringify(bookingData));


                const btn = document.getElementById('payNow');
                if (btn) {
                    btn.textContent = 'Paiement effectué';
                    btn.disabled = true;
                }


                showNotification("Vous pouvez maintenant télécharger le PDF ou ajouter la séance au calendrier.", "success");

                const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
                reservations.push(reservationPayload);
                localStorage.setItem('reservations', JSON.stringify(reservations));
            } else {
                showNotification('Erreur lors de l’enregistrement de la réservation', 'error');
                console.error('Backend response:', result);
            }
        } catch (err) {
            console.error(err);
            showNotification('Erreur serveur : impossible de sauvegarder la réservation', 'error');
        }
    }, 1500);
}


function addToGoogleCalendar(e) {
    e.preventDefault();
    const session = getSessionInfo();
    if (!session || !bookingData.date || !bookingData.time || !bookingData.identity) {
        showNotification("Impossible d'ajouter au calendrier : données manquantes.", "error");
        return;
    }

    const startDate = new Date(`${bookingData.date}T${bookingData.time}`);
    const endDate = new Date(startDate.getTime() + session.duration * 60000);

    const title = `${disciplines[bookingData.discipline].name} - ${session.name}`;
    const details = `Séance réservée avec ${bookingData.identity.firstName} ${bookingData.identity.lastName}`;

    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatForGoogleCalendar(startDate)}/${formatForGoogleCalendar(endDate)}&details=${encodeURIComponent(details)}`;

    window.open(url, '_blank');
}

function downloadPDF() {
    if (!bookingData || !bookingData.identity || !bookingData.address) {
        alert('Aucune réservation à exporter.');
        return;
    }
    const JsPDF = window.jspdf?.jsPDF || window.jsPDF;
    if (!JsPDF) {
        alert('Erreur : jsPDF non chargé.');
        return;
    }

    const doc = new JsPDF();


    doc.setFontSize(18);
    doc.text('Confirmation de réservation', 20, 20);
    doc.setFontSize(12);

    let y = 40;

// On récupère les options valides
    const optionsData = (bookingData.options || [])
        .map(opt => {
            if (typeof opt === 'string') return additionalOptions.find(o => o.id === opt);
            return opt;
        })
        .filter(opt => opt && typeof opt.price === 'number');


    // =======================
    // Informations client
    // =======================
    doc.text('Informations client :', 20, y); y += 10;
    doc.text(`Civilité : ${bookingData.identity.civility || ''}`, 25, y); y += 7;
    doc.text(`Nom : ${bookingData.identity.lastName || ''}`, 25, y); y += 7;
    doc.text(`Prénom : ${bookingData.identity.firstName || ''}`, 25, y); y += 7;
    if (bookingData.identity.birthDate) {
        doc.text(`Date de naissance : ${new Date(bookingData.identity.birthDate).toLocaleDateString('fr-FR')}`, 25, y); y += 7;
    }
    doc.text(`Email : ${bookingData.identity.email || ''}`, 25, y); y += 7;
    doc.text(`Téléphone : ${bookingData.identity.phone || ''}`, 25, y); y += 7;

    const addr = bookingData.address;
    doc.text('Adresse :', 25, y); y += 7;
    doc.text(`${addr.street}${addr.complement ? ', ' + addr.complement : ''}`, 30, y); y += 7;
    doc.text(`${addr.city || ''} - Type logement : ${addr.housingType || ''}`, 30, y); y += 7;
    if (addr.floor) doc.text(`Étage : ${addr.floor}`, 30, y); y += addr.floor ? 7 : 0;
    if (addr.hasElevator) doc.text(`Ascenseur : Oui`, 30, y); y += addr.hasElevator ? 7 : 0;
    if (addr.accessInfo) doc.text(`Accès : ${addr.accessInfo}`, 30, y); y += addr.accessInfo ? 7 : 0;
    doc.text(`Parking : ${addr.parking || ''}`, 30, y); y += 10;

    // =======================
    // Détails de la séance
    // =======================
    const session = getSessionInfo();
    if (session) {
        const startDate = new Date(`${bookingData.date}T${bookingData.time}`);
        const endDate = new Date(startDate.getTime() + session.duration * 60000);

        doc.text('Détails de la séance :', 20, y); y += 10;
        doc.text(`Discipline : ${disciplines[bookingData.discipline].name}`, 25, y); y += 7;
        doc.text(`Type : ${session.name}`, 25, y); y += 7;
        doc.text(`Durée : ${session.duration} minutes`, 25, y); y += 7;
        doc.text(`Date : ${startDate.toLocaleDateString('fr-FR')}`, 25, y); y += 7;
        doc.text(`Horaire : ${formatTime(startDate)} - ${formatTime(endDate)}`, 25, y); y += 10;

// Affichage des options
        if (optionsData.length) {
            doc.text('Options choisies :', 20, y);
            y += 10;

            optionsData.forEach(opt => {
                if (!opt) return; // ignore undefined
                const name = opt.name || 'Option inconnue';
                const price = typeof opt.price === 'number' ? opt.price : 0;
                doc.text(`${name} : ${price.toFixed(2)} €`, 25, y);
                y += 7;
            });

            y += 5;
        }


    }

    // =======================
    // Récapitulatif financier
    // =======================
    const total = calculateTotal();
    doc.text('Récapitulatif financier :', 20, y); y += 10;
    if (session) doc.text(`Prix séance : ${session.price.toFixed(2)} €`, 25, y); y += 7;

    if (optionsData.length) {
        const optionsTotal = optionsData.reduce((sum, o) => sum + o.price, 0);
        doc.text(`Total options : ${optionsTotal.toFixed(2)} €`, 25, y);
        y += 7;
    }



    doc.text(`Total : ${total.toFixed(2)} €`, 25, y);

    doc.save('reservation.pdf');
}


/* =========================
   NOTIFICATIONS
========================= */

function showNotification(message, type = 'info') {
    const notif = document.createElement('div');
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
    setTimeout(() => notif.remove(), 4000);
}
