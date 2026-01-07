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
