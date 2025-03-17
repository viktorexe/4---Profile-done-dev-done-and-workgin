document.addEventListener('DOMContentLoaded', () => {
    const developerButton = document.querySelector('.header-button:nth-child(4)');
    const developerOverlay = document.getElementById('developerOverlay');
    const closeButton = document.getElementById('closeDevModal');
    const animateItems = document.querySelectorAll('.animate-item');

    function openDeveloperModal() {
        developerOverlay.classList.add('active');
        setTimeout(() => {
            animateItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('active');
                }, index * 200);
            });
        }, 300);
    }

    function closeDeveloperModal() {
        animateItems.forEach(item => item.classList.remove('active'));
        developerOverlay.classList.remove('active');
    }

    developerButton.addEventListener('click', openDeveloperModal);
    closeButton.addEventListener('click', closeDeveloperModal);
    
    developerOverlay.addEventListener('click', (e) => {
        if (e.target === developerOverlay) {
            closeDeveloperModal();
        }
    });
});
