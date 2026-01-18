// ===================== DONNÉES DE CONFIGURATION =====================
window.reservedSlots = Array.isArray(window.reservedSlots) ? window.reservedSlots : [];
async function fetchReservedSlots(date) {
    if (!date) return [];
    try {
        const res = await fetch(`/reservation/list?date=${date}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.reservedSlots)) {
            window.reservedSlots = data.reservedSlots.map(s => ({
                start: s.start,
                end: s.end
            }));
        } else {
            window.reservedSlots = [];
        }
    } catch (err) {
        console.error('Erreur récupération créneaux réservés:', err);
        window.reservedSlots = [];
    }
}

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

// ===================== ÉTAT =====================
let bookingData = {
    discipline: 'pilates',
    sessionType: 'prenatal',
    date: '',
    time: '',
    options: []
};
let currentCalendarDate;

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', () => {
    loadBookingData();

    if (!bookingData.discipline) bookingData.discipline = 'pilates';
    if (!bookingData.sessionType) bookingData.sessionType = 'prenatal';

    if (!bookingData.date) {
        const urlDate = getDateFromUrl();
        if (urlDate) bookingData.date = urlDate;
    }

    setupCustomCalendar();
    updateSidebar();
    if (bookingData.date) {
        fetchReservedSlots(bookingData.date).then(() => showTimeSlots());
    }
    updateNextButton();

    const nextButton = document.getElementById('nextButton');
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (!bookingData.date || !bookingData.time) {
                alert("Veuillez sélectionner une date et un créneau.");
                return;
            }
            saveBookingData();
            const url = nextButton.dataset.url;
            if (url) window.location.href = url;
        });
    }
});

function getDateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('date');
}

// ===================== STORAGE =====================
function loadBookingData() {
    const saved = localStorage.getItem('bookingData');
    if (saved) Object.assign(bookingData, JSON.parse(saved));
}

function saveBookingData() {
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
}

// ===================== UTILITAIRES =====================
function dateToLocalISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function formatTime(date) {
    return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
}

function isTomorrowOrAfter(dateObj) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return dateObj >= tomorrow;
}

// ===================== CALENDRIER =====================
const dateDisplay = document.getElementById('dateDisplay');
const customCalendarPopup = document.getElementById('customCalendarPopup');
const calendarDaysGrid = document.getElementById('calendarDaysGrid');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

function setupCustomCalendar() {
    currentCalendarDate = bookingData.date ? new Date(bookingData.date + 'T00:00:00') : new Date();
    currentCalendarDate.setDate(1);

    renderCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
    updateDateDisplay();

    dateDisplay.addEventListener('click', e => {
        e.stopPropagation();
        customCalendarPopup.classList.toggle('active');
    });

    prevMonthBtn.onclick = () => changeMonth(-1);
    nextMonthBtn.onclick = () => changeMonth(1);

    document.addEventListener('click', e => {
        if (!customCalendarPopup.contains(e.target) && e.target !== dateDisplay) {
            customCalendarPopup.classList.remove('active');
        }
    });
}

function changeMonth(delta) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
    renderCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
}

function renderCalendar(year, month) {
    calendarDaysGrid.innerHTML = '';
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const offset = (firstDay.getDay() + 6) % 7;
    const monthName = firstDay.toLocaleDateString('fr-FR', { month: 'long' });
    customCalendarPopup.querySelector('.calendar-month-year').innerHTML =
        `${monthName.charAt(0).toUpperCase()+monthName.slice(1)} <span class="year">${year}</span>`;

    const prevLastDay = new Date(year, month, 0).getDate();
    for (let i = offset - 1; i >= 0; i--) {
        const d = document.createElement('span');
        d.className = 'calendar-day inactive';
        d.textContent = prevLastDay - i;
        calendarDaysGrid.appendChild(d);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month, i);
        date.setHours(0,0,0,0);
        const el = document.createElement('span');
        el.className = 'calendar-day';
        el.textContent = i;

        if (!isTomorrowOrAfter(date)) el.classList.add('disabled');
        else if (bookingData.date === dateToLocalISO(date)) el.classList.add('selected');
        else el.onclick = () => selectDate(date);

        calendarDaysGrid.appendChild(el);
    }
}

function selectDate(dateObj) {
    if (!isTomorrowOrAfter(dateObj)) return alert("Vous ne pouvez pas réserver le jour même.");

    bookingData.date = dateToLocalISO(dateObj);
    bookingData.time = '';
    saveBookingData();

    // Récupération créneaux réservés depuis le backend
    fetchReservedSlots(bookingData.date).then(() => {
        showTimeSlots();
    });

    window.location.href = `/creneaux?date=${bookingData.date}`;
}


function updateDateDisplay() {
    dateDisplay.textContent = bookingData.date
        ? new Date(bookingData.date + 'T00:00:00').toLocaleDateString('fr-FR')
        : 'Sélectionnez une date';
}

// ===================== CRÉNEAUX =====================
function selectTimeSlot(slot) {
    bookingData.time = slot;
    saveBookingData();
    showTimeSlots();
    updateSidebar();
    updateNextButton();
}


// Crée  Date en h locale du navigateur.
function dateInParis(dateStr) {
    // dateStr format 'YYYY-MM-DD HH:MM:SS' ou 'YYYY-MM-DDTHH:MM:SS'
    const [datePart, timePart] = dateStr.split(/T| /);
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = (timePart ? timePart.split(':') : [0,0,0]).map(Number);

    // Crée une date JS en heure locale
    return new Date(year, month-1, day, hours, minutes, seconds);
}



// Vérifie si un créneau chevauche une réservation
function isSlotReserved(slotStart, slotEnd) {
    return window.reservedSlots.some(res => {
        const resStart = dateInParis(res.start);
        const resEnd = dateInParis(res.end);

        resStart.setSeconds(0,0);
        resEnd.setSeconds(0,0);

        return slotStart < resEnd && slotEnd > resStart;
    });
}





// Génère les créneaux dynamiquement selon la durée
function generateSlots(sessionDuration, startHour=8, endHour=20) {
    const slots = [];
    let h = startHour, m = 0;
    while (h*60 + m + sessionDuration <= endHour*60) {
        slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
        m += 15;
        if (m >= 60) { h += 1; m -= 60; }
    }
    return slots;
}

function showTimeSlots() {
    const timeSection = document.getElementById('timeSection');
    const timeGrid = document.getElementById('timeGrid');
    const timeTitle = document.getElementById('timeTitle');
    if (!bookingData.date) {
        timeSection.style.display = 'none';
        return;
    }

    const dateObj = new Date(bookingData.date + 'T00:00:00');
    const now = new Date();
    const session = getSessionInfo();
    if (!session) return;

    const sessionDuration = session.duration;
    const startHour = 8;
    const endHour = 20;

    const slots = [];
    for (let h = startHour; h < endHour; h++) {
        for (let m = 0; m < 60; m += 15) {
            const slotStart = dateInParis(`${bookingData.date} ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`);
            slotStart.setSeconds(0,0);

            const slotEnd = new Date(slotStart.getTime() + sessionDuration*60000);
            slotEnd.setSeconds(0,0);

            // Vérifie si le créneau chevauche la pause déjeuner 12h-14h
            const pauseStart = new Date(slotStart);
            pauseStart.setHours(12,0,0,0);
            const pauseEnd = new Date(slotStart);
            pauseEnd.setHours(14,0,0,0);

            if (slotStart < pauseEnd && slotEnd > pauseStart) continue; // chevauche la pause, on skip

            if(slotEnd.getHours() >= endHour && slotEnd.getMinutes() > 0) continue;

            slots.push({start: slotStart, end: slotEnd});
        }
    }



    // Affichage titre
    const dateLabel = dateObj.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' });
    timeTitle.textContent = `Créneaux disponibles pour ${dateLabel.charAt(0).toUpperCase()+dateLabel.slice(1)}`;

    timeGrid.innerHTML = '';

    slots.forEach(slot => {
        const isPast = slot.end <= now && dateObj.toDateString() === now.toDateString();
        const isReserved = isSlotReserved(slot.start, slot.end);
        const slotStr = `${String(slot.start.getHours()).padStart(2,'0')}:${String(slot.start.getMinutes()).padStart(2,'0')}`;
        const isSelected = bookingData.time === slotStr;

        const btn = document.createElement('button');
        btn.className = `time-slot ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''} ${isReserved ? 'disabled reserved' : ''}`;
        btn.disabled = isPast || isReserved;
        btn.innerHTML = `
            <div class="time-range">${slotStr} - ${formatTime(slot.end)}</div>
            <div class="time-status">
                <i class="fas ${isReserved ? 'fa-times-circle' : 'fa-check-circle'}"></i>
                ${isPast ? 'Passé' : (isReserved ? 'Réservé' : 'Disponible')}
            </div>
        `;
        if(!isPast && !isReserved) btn.addEventListener('click', () => selectTimeSlot(slotStr));
        timeGrid.appendChild(btn);
    });

    timeSection.style.display = 'block';
}



// ===================== SIDEBAR =====================
function getSessionInfo() {
    return disciplines[bookingData.discipline]?.sessions.find(s=>s.id===bookingData.sessionType);
}

function updateSidebar() {
    const dateTitle = document.getElementById('dateTitle');
    const sessionDetails = document.getElementById('sessionDetails');
    const totalAmountElement = document.getElementById('totalAmount');

    let slotHtml = '<div>• Créneau choisi : Non sélectionné</div>';
    if (bookingData.time) {
        const session = getSessionInfo();
        const endTime = getEndTime(bookingData.time, session.duration);
        slotHtml = `<div>• Créneau choisi : ${bookingData.time} - ${endTime}</div>`;
    }

    if (bookingData.date){
        const dateObj = new Date(bookingData.date+'T00:00:00');
        const dateString = dateObj.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' });
        dateTitle.textContent = `DATE SÉLECTIONNÉE : ${dateString.charAt(0).toUpperCase()+dateString.slice(1)}`;
    } else dateTitle.textContent='DATE SÉLECTIONNÉE : Aucune';

    const session = getSessionInfo();
    if (session){
        sessionDetails.innerHTML = `
            <div>• Séance : ${session.name}</div>
            <div>• Durée : ${session.duration} minutes</div>
            ${slotHtml}
        `;
        totalAmountElement.textContent = `${session.price}€`;
    } else {
        sessionDetails.innerHTML='<div>Aucune session sélectionnée</div>';
        totalAmountElement.textContent='0€';
    }
}

function getEndTime(start,duration){
    const [h,m]=start.split(':').map(Number);
    const date=new Date();
    date.setHours(h,m,0,0);
    date.setMinutes(date.getMinutes()+duration);
    return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
}

// ===================== BOUTON NEXT =====================
function updateNextButton(){
    document.getElementById('nextButton').disabled = !bookingData.date || !bookingData.time;
}
