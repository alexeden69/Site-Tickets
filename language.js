// Language system
let currentLanguage = localStorage.getItem('language') || 'fr';

const translations = {
    fr: {
        from: 'À partir de',
        view: 'Voir',
        buyNow: 'Acheter maintenant',
        ticketsAvailable: 'Billets Disponibles',
        selectTickets: 'Sélectionnez vos places parmi nos différentes catégories',
        row: 'Rangée',
        seats: 'Sièges',
        orderConfirmed: 'Commande confirmée !',
        section: 'Section',
        price: 'Prix',
        thankYou: 'Merci pour votre achat !',
        events: 'événements',
        allConcerts: 'Tous les Concerts',
        allSportsEvents: 'Tous les Événements Sportifs'
    },
    en: {
        from: 'From',
        view: 'View',
        buyNow: 'Buy now',
        ticketsAvailable: 'Available Tickets',
        selectTickets: 'Select your seats from our different categories',
        row: 'Row',
        seats: 'Seats',
        orderConfirmed: 'Order confirmed!',
        section: 'Section',
        price: 'Price',
        thankYou: 'Thank you for your purchase!',
        events: 'events',
        allConcerts: 'All Concerts',
        allSportsEvents: 'All Sports Events'
    }
};

function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    updatePageLanguage();
}

function updatePageLanguage() {
    // Update all elements with data-fr and data-en attributes
    document.querySelectorAll('[data-fr]').forEach(element => {
        if (currentLanguage === 'fr') {
            element.textContent = element.getAttribute('data-fr');
        } else {
            element.textContent = element.getAttribute('data-en');
        }
    });
    
    // Update language selector if it exists
    const selector = document.getElementById('language-selector');
    if (selector) {
        selector.value = currentLanguage;
    }
}

function t(key) {
    return translations[currentLanguage][key] || translations.fr[key];
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('language-selector');
    if (selector) {
        selector.value = currentLanguage;
    }
    updatePageLanguage();
});
