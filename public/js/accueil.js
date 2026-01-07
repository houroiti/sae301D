// ===============================
// ACCESSIBILITÉ
// ===============================
const accessibility = document.querySelector('.accessibility');
const menu = document.querySelector('.accessibility-menu');

accessibility.addEventListener('click', (e) => {
    e.stopPropagation();
    accessibility.classList.toggle('active');

    const isOpen = accessibility.classList.contains('active');
    menu.style.opacity = isOpen ? '1' : '0';
    menu.style.pointerEvents = isOpen ? 'auto' : 'none';
    menu.style.transform = isOpen ? 'translateY(0)' : 'translateY(-10px)';
});

menu.addEventListener('click', (e) => {
    e.stopPropagation();
});

document.addEventListener('click', () => {
    accessibility.classList.remove('active');
    menu.style.opacity = '0';
    menu.style.pointerEvents = 'none';
    menu.style.transform = 'translateY(-10px)';
});

// ===============================
// CONTRASTE / MODE SOMBRE / TAILLE TEXTE
// ===============================
document.querySelector('[data-action="contrast"]').addEventListener('click', () => {
    document.body.classList.toggle('high-contrast');
});

document.querySelector('[data-action="dark"]').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

let fontSize = 100;
document.querySelector('[data-action="size"]').addEventListener('click', () => {
    fontSize += 10;
    document.body.style.fontSize = fontSize + '%';
});

// ===============================
// CARROUSEL "POURQUOI ME CHOISIR"
// ===============================
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const prev = document.querySelector('.arrow.left');
const next = document.querySelector('.arrow.right');

let index = 0;

function updateCarousel() {
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
        dots[i].classList.toggle('active', i === index);
    });
}

next.addEventListener('click', () => {
    index = (index + 1) % slides.length;
    updateCarousel();
});

prev.addEventListener('click', () => {
    index = (index - 1 + slides.length) % slides.length;
    updateCarousel();
});

dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
        index = i;
        updateCarousel();
    });
});

// ===============================
// CARROUSEL "TÉMOIGNAGES"
// ===============================
const testimonialSlides = document.querySelectorAll('.testimonial-card');
const testimonialDots = document.querySelectorAll('.dot-testi');
const prevTesti = document.querySelector('.arrow-testi.left');
const nextTesti = document.querySelector('.arrow-testi.right');

let testimonialIndex = 0;

function updateTestimonials() {
    testimonialSlides.forEach((slide, i) => {
        slide.classList.toggle('active', i === testimonialIndex);
        testimonialDots[i].classList.toggle('active', i === testimonialIndex);
    });
}

nextTesti.addEventListener('click', () => {
    testimonialIndex = (testimonialIndex + 1) % testimonialSlides.length;
    updateTestimonials();
});

prevTesti.addEventListener('click', () => {
    testimonialIndex = (testimonialIndex - 1 + testimonialSlides.length) % testimonialSlides.length;
    updateTestimonials();
});

testimonialDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
        testimonialIndex = i;
        updateTestimonials();
    });
});
