/* =========================
   RÈGLES
========================= */
const RULES = {
    startHour: 8,
    endHour: 20,
    lunchStart: 12,
    lunchEnd: 14,
    slotDuration: 60
};

/* =========================
   DONNÉES
========================= */
// Réservations depuis la DB (passées par Twig)
let reservations = window.reservations || [];


let indisponibilites = window.indisponibilites || [];

// Semaine en cours
let currentWeekStart = getMonday(new Date());

/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', () => {
    addWeekNavigation();
    generateWeekPlanning();
    displayReservations(currentPage);
    document.getElementById('indispoForm')?.addEventListener('submit', addIndisponibilite);
    populateTimeSelect('indispoStart');
    populateTimeSelect('indispoEnd');
});

/* =========================
   NAVIGATION SEMAINE
========================= */
function addWeekNavigation() {
    const container = document.createElement('div');
    container.className = 'week-navigation';
    container.innerHTML = `
        <button id="prevWeek">&lt; Semaine précédente</button>
        <span id="currentWeekLabel"></span>
        <button id="nextWeek">Semaine suivante &gt;</button>
    `;
    document.querySelector('.planning-container')?.prepend(container);

    document.getElementById('prevWeek')?.addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        generateWeekPlanning();
    });

    document.getElementById('nextWeek')?.addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        generateWeekPlanning();
    });
}

/* =========================
   PLANNING SEMAINE
========================= */
function generateWeekPlanning() {
    const tbody = document.querySelector('#planningTable tbody');
    const thead = document.querySelector('#planningTable thead tr');
    if (!tbody || !thead) return;

    tbody.innerHTML = '';

    // Label semaine
    const weekLabel = document.getElementById('currentWeekLabel');
    if (weekLabel) {
        const mondayStr = currentWeekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        const sunday = new Date(currentWeekStart);
        sunday.setDate(sunday.getDate() + 6);
        const sundayStr = sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        weekLabel.textContent = `Semaine : ${mondayStr} - ${sundayStr}`;
    }

    // En-têtes des jours
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    for (let i = 0; i < 7; i++) {
        const th = thead.children[i + 1];
        if (!th) continue;
        const d = new Date(currentWeekStart);
        d.setDate(currentWeekStart.getDate() + i);
        const formatted = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        th.textContent = `${days[i]} (${formatted})`;
    }

    // Lignes horaires
    for (let hour = RULES.startHour; hour < RULES.endHour; hour++) {
        const row = document.createElement('tr');

        const hourCell = document.createElement('td');
        hourCell.textContent = `${hour}:00`;
        row.appendChild(hourCell);

        for (let d = 0; d < 7; d++) {
            const cell = document.createElement('td');
            const cellDate = new Date(currentWeekStart);
            cellDate.setDate(currentWeekStart.getDate() + d);

            const status = getSlotStatus(cellDate, hour);
            cell.className = status;

            const isoDate = cellDate.toISOString().split('T')[0];

            if (status === 'reserved') {
                const res = reservations.find(r =>
                    r.date === isoDate &&
                    hour >= parseInt(r.start?.split(':')[0] || 0, 10) &&
                    hour < parseInt(r.end?.split(':')[0] || 0, 10)
                );
                cell.textContent = res ? `${res.client} (${res.start}-${res.end})` : 'Réservé';
            } else if (status === 'indispo') {
                const ind = indisponibilites.find(i =>
                    i.date === isoDate &&
                    hour >= parseInt(i.start.split(':')[0], 10) &&
                    hour < parseInt(i.end.split(':')[0], 10)
                );
                cell.textContent = ind?.reason || 'Indisponible';
            } else if (status === 'pause') {
                cell.textContent = 'Pause';
            } else if (status === 'blocked') {
                cell.textContent = '-';
            } else {
                cell.textContent = 'Libre';
            }

            row.appendChild(cell);
        }

        tbody.appendChild(row);
    }
}

/* =========================
   STATUT CRÉNEAU
========================= */
function getSlotStatus(date, hour) {
    const today = new Date();
    today.setHours(0,0,0,0);

    const slotDate = new Date(date);
    slotDate.setHours(0,0,0,0);

    if (slotDate < today) return 'blocked';
    if (hour >= RULES.lunchStart && hour < RULES.lunchEnd) return 'pause';

    const isoDate = date.toISOString().split('T')[0];

    if (indisponibilites.some(i =>
        i.date === isoDate &&
        hour >= parseInt(i.start.split(':')[0],10) &&
        hour < parseInt(i.end.split(':')[0],10)
    )) return 'indispo';

    if (reservations.some(r =>
        r.date === isoDate &&
        hour >= parseInt(r.start?.split(':')[0] || 0,10) &&
        hour < parseInt(r.end?.split(':')[0] || 0,10)
    )) return 'reserved';

    return 'free';
}

/* =========================
   INDISPONIBILITÉS
========================= */
function addIndisponibilite(e) {
    e.preventDefault();

    const date = document.getElementById('indispoDate')?.value;
    const start = document.getElementById('indispoStart')?.value;
    const end = document.getElementById('indispoEnd')?.value;
    const reason = document.getElementById('indispoReason')?.value;

    if (!date || !start || !end) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
    }

    // Envoi au back-office
    fetch('/coach/indisponibilite/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, start, end, reason })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('Indisponibilité ajoutée avec succès');
                // Ajoute localement pour l'affichage immédiat
                indisponibilites.push({ date, start, end, reason });
                generateWeekPlanning();
                e.target.reset();
            } else {
                alert('Erreur : ' + (data.message || 'Impossible d’ajouter'));
            }
        })
        .catch(err => {
            console.error(err);
            alert('Erreur lors de l\'ajout de l\'indisponibilité');
        });
}


/* =========================
   LISTE DES RÉSERVATIONS
========================= */
let currentPage = 1;
const reservationsPerPage = 10;

function displayReservations(page = 1) {
    const container = document.getElementById('reservationsList');
    if (!container) return;

    container.innerHTML = '';

    if (!reservations || reservations.length === 0) {
        container.textContent = 'Aucune réservation pour l’instant.';
        container.classList.add('no-reservations');
        return;
    }

    container.classList.remove('no-reservations');

    const startIndex = (page - 1) * reservationsPerPage;
    const paginated = reservations.slice(startIndex, startIndex + reservationsPerPage);

    paginated.forEach(r => {
        const clientName = r.client || 'Client inconnu';
        const city = r.address?.city || '';
        const card = document.createElement('div');
        card.className = 'reservation-card';
        card.innerHTML = `
            <strong>${r.date} ${r.start || '?'} - ${r.end || '?'}</strong>
            <span>${clientName} — ${city}</span>
        `;
        container.appendChild(card);
    });

    addPaginationControls(page);

    // Rafraîchir la carte si nécessaire
    window.refreshMapMarkers?.();
}

/* =========================
   PAGINATION
========================= */
function addPaginationControls(page) {
    const container = document.getElementById('reservationsList');
    const totalPages = Math.ceil(reservations.length / reservationsPerPage);

    const oldControls = document.getElementById('paginationControls');
    if (oldControls) oldControls.remove();

    const controls = document.createElement('div');
    controls.id = 'paginationControls';
    controls.className = 'pagination-controls';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Précédent';
    prevBtn.disabled = page === 1;
    prevBtn.addEventListener('click', () => { currentPage--; displayReservations(currentPage); });

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Suivant';
    nextBtn.disabled = page === totalPages;
    nextBtn.addEventListener('click', () => { currentPage++; displayReservations(currentPage); });

    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${page} / ${totalPages}`;

    controls.appendChild(prevBtn);
    controls.appendChild(pageInfo);
    controls.appendChild(nextBtn);

    container.appendChild(controls);
}

/* =========================
   UTILITAIRES
========================= */
function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function populateTimeSelect(selectId, startHour = 8, endHour = 20) {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = '<option value="">--</option>';

    for (let h = startHour; h <= endHour; h++) {
        if (selectId === 'indispoStart' && h >= RULES.lunchStart && h < RULES.lunchEnd) continue;
        const hour = String(h).padStart(2, '0');
        const option = document.createElement('option');
        option.value = `${hour}:00`;
        option.textContent = `${hour}:00`;
        select.appendChild(option);
    }
}
