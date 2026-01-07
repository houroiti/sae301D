// Données de configuration
const availableSlots = ['08:00', '09:15', '10:30', '14:00', '15:30', '17:00', '18:30'];
const disciplines = {
    'yin-yoga': {
        name: 'Yin Yoga',
        sessions: [
            { id: 'decouverte', name: 'Séance découverte', duration: 60, price: 50 },
            { id: 'flexibilite', name: 'Yin Yoga flexibilité', duration: 75, price: 60 },
            { id: 'sommeil', name: 'Yin Yoga sommeil', duration: 90, price: 70 }
        ]
    },
    'pilates': {
        name: 'Pilates',
        sessions: [
            { id: 'fondamental', name: 'Pilates fondamental', duration: 55, price: 45 },
            { id: 'avance', name: 'Pilates avancé', duration: 70, price: 55 },
            { id: 'prenatal', name: 'Pilates prénatal', duration: 60, price: 50 }
        ]
    },
    'fitness': {
        name: 'Fitness',
        sessions: [
            { id: 'fullbody', name: 'Full Body Circuit', duration: 45, price: 40 },
            { id: 'hiit', name: 'HIIT intensif', duration: 30, price: 35 },
            { id: 'senior', name: 'Fitness senior', duration: 50, price: 45 }
        ]
    }
};

// État de la réservation
let bookingData = {
    discipline: 'pilates', // Simulé pour l'exemple
    sessionType: 'prenatal', // Simulé pour l'exemple (50€, 60 min)
    date: '',
    time: ''
};

// État du calendrier personnalisé
let currentCalendarDate;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadBookingData();
    setupCustomCalendar();
    setupEventListeners();
    updateSidebar();

    // Afficher les créneaux si une date est déjà sélectionnée
    if (bookingData.date) {
        showTimeSlots();
    }
    updateNextButton();
});
// Assurer que le bouton existe avant d'ajouter l'événement
document.addEventListener('DOMContentLoaded', function() {
    const nextButton = document.getElementById('nextButton');
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            if (bookingData.time && bookingData.date) {
                // Sauvegarder les données avant de rediriger
                saveBookingData();

                // Récupérer l'URL depuis l'attribut data-url
                const url = this.dataset.url;
                if (url) {
                    window.location.href = url;
                } else {
                    console.warn('Aucune URL définie pour le bouton Next.');
                }
            }
        });
    }
});


// ===================== LOGIQUE DE RÉSERVATION =====================

function loadBookingData() {
    const saved = localStorage.getItem('bookingData');
    if (saved) {
        const data = JSON.parse(saved);
        // Utiliser les données sauvegardées ou les valeurs par défaut
        bookingData.discipline = data.discipline || 'pilates';
        bookingData.sessionType = data.sessionType || 'prenatal';
        bookingData.date = data.date || '';
        bookingData.time = data.time || '';
    }
}

function saveBookingData() {
    const saved = localStorage.getItem('bookingData');
    const existingData = saved ? JSON.parse(saved) : {};

    const updatedData = {
        ...existingData,
        ...bookingData
    };

    localStorage.setItem('bookingData', JSON.stringify(updatedData));
}

function getSessionInfo() {
    if (!bookingData.discipline || !bookingData.sessionType) return null;

    const disc = disciplines[bookingData.discipline];
    if (!disc) return null;

    return disc.sessions.find(s => s.id === bookingData.sessionType);
}

// ===================== CALENDRIER PERSONNALISÉ =====================

const dateDisplay = document.getElementById('dateDisplay');
const customCalendarPopup = document.getElementById('customCalendarPopup');
const calendarTitle = document.getElementById('calendarTitle');
const calendarDaysGrid = document.getElementById('calendarDaysGrid');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

function setupCustomCalendar() {
    // Définir la date de début du calendrier (par défaut ou sélectionnée)
    if (bookingData.date) {
        currentCalendarDate = new Date(bookingData.date + 'T00:00:00');
    } else {
        // Commencer au mois de demain (règle "Pas de réservation le jour même")
        currentCalendarDate = new Date();
        currentCalendarDate.setDate(currentCalendarDate.getDate() + 1); // Date de demain
        currentCalendarDate.setDate(1); // Aller au 1er du mois de demain
    }

    // Afficher l'état initial
    renderCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
    updateDateDisplay();

    // Événement pour ouvrir/fermer le calendrier
    dateDisplay.addEventListener('click', function(e) {
        e.stopPropagation(); // Empêcher la propagation pour ne pas fermer immédiatement
        toggleCalendar();
    });

    // Événements pour la navigation
    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => changeMonth(1));

    // Fermer le calendrier si on clique en dehors
    document.addEventListener('click', function(event) {
        if (!customCalendarPopup.contains(event.target) && event.target !== dateDisplay) {
            customCalendarPopup.classList.remove('active');
        }
    });
}

function toggleCalendar() {
    customCalendarPopup.classList.toggle('active');
}

function updateDateDisplay() {
    if (bookingData.date) {
        const dateObj = new Date(bookingData.date + 'T00:00');
        const day = dateObj.getDate();
        const month = dateObj.getMonth() + 1;
        const year = dateObj.getFullYear();
        dateDisplay.textContent = `${day} / ${month} / ${year}`;
    } else {
        // État initial (peut être vide ou le format de la maquette '1 / 2 / 2025')
        dateDisplay.textContent = 'Sélectionnez une date';
    }
}

function changeMonth(delta) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
    renderCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
}

function renderCalendar(year, month) {
    calendarDaysGrid.innerHTML = '';

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    // Calculer le jour de la semaine du 1er (0=Dim, 1=Lun... On veut Lun=0)
    const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // La première date réservable

    // Mettre à jour le titre du calendrier (pour le style maquette)
    const monthName = firstDayOfMonth.toLocaleDateString('fr-FR', { month: 'long' });
    const calendarMonthYear = customCalendarPopup.querySelector('.calendar-month-year');
    calendarMonthYear.innerHTML = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} <span class="year">${year}</span>`;

    // Remplir les jours du mois précédent (jours inactifs)
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = document.createElement('span');
        day.className = 'calendar-day inactive';
        day.textContent = prevMonthLastDay - i;
        calendarDaysGrid.appendChild(day);
    }

    // Remplir les jours du mois actuel
    for (let dayNum = 1; dayNum <= lastDayOfMonth.getDate(); dayNum++) {
        const date = new Date(year, month, dayNum);
        date.setHours(0, 0, 0, 0);

        const dayElement = document.createElement('span');
        dayElement.textContent = dayNum;
        dayElement.className = 'calendar-day';

        const isSelectable = date >= tomorrow;

        if (!isSelectable) {
            dayElement.classList.add('disabled');
        } else if (bookingData.date === dateToISOString(date)) {
            dayElement.classList.add('selected');
        } else {
            dayElement.addEventListener('click', () => selectDate(date));
        }

        calendarDaysGrid.appendChild(dayElement);
    }
}

function dateToISOString(date) {
    return date.toISOString().split('T')[0];
}

function selectDate(dateObj) {
    const newDate = dateToISOString(dateObj);

    // Si la même date est cliquée, désélectionner (logique non demandée mais bonne pratique)
    if (bookingData.date === newDate) {
        bookingData.date = '';
        bookingData.time = '';
    } else {
        // Effacer le créneau si la date change
        if (bookingData.date !== newDate) {
            bookingData.time = '';
        }
        bookingData.date = newDate;
    }

    saveBookingData();
    updateDateDisplay();
    // Re-rendre le calendrier pour afficher la sélection
    renderCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
    showTimeSlots();
    updateSidebar();
    updateNextButton();
    toggleCalendar(); // Fermer le calendrier après la sélection
}

// ===================== LOGIQUE DES CRÉNEAUX HORAIRES =====================

function showTimeSlots() {
    const timeSection = document.getElementById('timeSection');
    const timeGrid = document.getElementById('timeGrid');
    const timeTitle = document.getElementById('timeTitle');

    if (!bookingData.date) {
        timeSection.style.display = 'none';
        return;
    }

    // Mettre à jour le titre
    const dateObj = new Date(bookingData.date + 'T00:00');
    const dateString = dateObj.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
    // Format pour ressembler à "Créneaux disponibles pour lundi 1 décembre"
    const formattedDateString = dateString.replace(/(^\w)/, c => c.toUpperCase());
    timeTitle.textContent = `Créneaux disponibles pour ${formattedDateString}`;

    const sessionInfo = getSessionInfo();
    const sessionDuration = sessionInfo ? sessionInfo.duration : null;

    if (!sessionDuration) {
        timeGrid.innerHTML = '<div class="error">Veuillez d\'abord sélectionner une session</div>';
        timeSection.style.display = 'block';
        return;
    }

    // Générer les créneaux
    timeGrid.innerHTML = '';
    availableSlots.forEach(slot => {
        const endTime = getEndTime(slot, sessionDuration);

        const slotElement = document.createElement('button');
        // Simuler le créneau 08:00 sélectionné si aucune sélection n'a été faite
        const isSelected = bookingData.time === slot;

        slotElement.className = `time-slot ${isSelected ? 'selected' : ''}`;

        // Simuler le statut "Disponible" comme sur la maquette
        slotElement.innerHTML = `
            <div class="time-range">${slot} - ${endTime}</div>
            <div class="time-status">
                <i class="fas fa-check-circle"></i> Disponible
            </div>
        `;

        slotElement.addEventListener('click', () => selectTimeSlot(slot));
        timeGrid.appendChild(slotElement);
    });

    timeSection.style.display = 'block';
}

function selectTimeSlot(time) {
    bookingData.time = time;
    saveBookingData();
    showTimeSlots(); // Re-render pour marquer le créneau sélectionné
    updateSidebar();
    updateNextButton();
}


// ===================== LOGIQUE DE LA BARRE LATÉRALE =====================

function updateSidebar() {
    const dateTitle = document.getElementById('dateTitle');
    const sessionDetails = document.getElementById('sessionDetails');
    const totalAmountElement = document.getElementById('totalAmount');

    // Mettre à jour le titre de la date
    if (bookingData.date) {
        const dateObj = new Date(bookingData.date + 'T00:00');
        const dateString = dateObj.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
        const formattedDateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);
        dateTitle.textContent = `DATE SÉLECTIONNÉE : ${formattedDateString}`;
    } else {
        dateTitle.textContent = 'DATE SÉLECTIONNÉE : Aucune';
    }

    // Mettre à jour les détails de la session
    const sessionInfo = getSessionInfo();
    const totalAmount = sessionInfo ? sessionInfo.price : 0;

    if (sessionInfo) {
        const sessionDuration = sessionInfo.duration;
        const selectedSlotTime = bookingData.time || 'Non sélectionné';

        let slotDetailHtml = '<div>• Créneau choisi : Non sélectionné</div>';

        if (bookingData.time) {
            const endTime = getEndTime(bookingData.time, sessionDuration);
            slotDetailHtml = `<div>• Créneau choisi : ${bookingData.time} - ${endTime}</div>`;
        }

        sessionDetails.innerHTML = `
            <div>• Séance : ${sessionInfo.name}</div>
            <div>• Durée : ${sessionDuration} minutes</div>
            ${slotDetailHtml}
        `;
    } else {
        sessionDetails.innerHTML = '<div>Aucune session sélectionnée</div>';
    }

    // Mettre à jour le total
    if (totalAmountElement) {
        totalAmountElement.textContent = `${totalAmount}€`;
    }
}

function getEndTime(startTime, duration) {
    const [startH, startM] = startTime.split(':').map(Number);
    const totalMinutes = startH * 60 + startM + duration;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
}

function updateNextButton() {
    const nextButton = document.getElementById('nextButton');
    nextButton.disabled = !bookingData.time || !bookingData.date;
}


