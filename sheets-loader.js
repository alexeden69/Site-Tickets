// sheets-loader.js - Adapté pour votre structure de données

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTvCQIYzDcNpyFv5Ky0reWleWjeDlz2iPA4kTWzZsKSzOrFUfevS7_AkDvvFF1H3PGIKmhM8RqoUtM-/pub?gid=0&single=true&output=csv'; // Remplacez par votre URL Google Sheets CSV

/**
 * Parse les données CSV
 */
function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] ? values[index].trim() : '';
        });
        data.push(row);
    }
    
    return data;
}

/**
 * Groupe les tickets par événement
 */
function groupTicketsByEvent(tickets) {
    const events = { concerts: [], sports: [] };
    const eventMap = new Map();
    
    tickets.forEach((ticket, index) => {
        const lineNum = index + 2;
        
        // Validation des champs obligatoires
        if (!ticket.event_id) {
            console.error(`❌ Ligne ${lineNum}: event_id est vide ou manquant`);
            return;
        }
        
        if (!ticket.event_name) {
            console.error(`❌ Ligne ${lineNum}: event_name est vide ou manquant`);
            return;
        }
        
        // Déterminer la catégorie
        const category = ticket.category ? ticket.category.toLowerCase() : 'concerts';
        
        // Créer l'identifiant unique de l'événement
        const eventKey = ticket.event_id;
        
        // Si l'événement n'existe pas encore, le créer
        if (!eventMap.has(eventKey)) {
            // Combiner date et heure
            let eventDateTime = ticket.date || '';
            if (ticket.time) {
                eventDateTime += ` ${ticket.time}`;
            }
            
            // Combiner venue et city pour location
            let location = '';
            if (ticket.venue && ticket.city) {
                location = `${ticket.venue}, ${ticket.city}`;
            } else if (ticket.venue) {
                location = ticket.venue;
            } else if (ticket.city) {
                location = ticket.city;
            }
            
            const event = {
                id: ticket.event_id,
                name: ticket.event_name,
                date: eventDateTime,
                location: location,
                image: ticket.image_url || '',
                category: category,
                trending: ticket.trending === 'TRUE' || ticket.trending === 'true',
                tickets: []
            };
            
            eventMap.set(eventKey, event);
            
            // Ajouter l'événement à la bonne catégorie
            if (category === 'sports') {
                events.sports.push(event);
            } else {
                events.concerts.push(event);
            }
        }
        
        // Ajouter le ticket à l'événement
        const event = eventMap.get(eventKey);
        
        // Créer la description du ticket
        let ticketDescription = '';
        if (ticket.section) ticketDescription += `Section ${ticket.section}`;
        if (ticket.row && ticket.row !== 'TBD') ticketDescription += ` - Rangée ${ticket.row}`;
        if (ticket.seats && ticket.seats !== 'TBD') ticketDescription += ` - Siège ${ticket.seats}`;
        
        event.tickets.push({
            type: ticket.section || 'Standard',
            price: parseFloat(ticket.price) || 0,
            quantity: ticket.seats || 'TBD',
            description: ticketDescription.trim() || 'Billet standard'
        });
    });
    
    console.log('Events loaded successfully:', {
        concerts: events.concerts.length,
        sports: events.sports.length
    });
    
    return events;
}

/**
 * Charge les événements depuis Google Sheets
 */
async function loadEventsFromSheet() {
    try {
        console.log('🔄 Loading events from Google Sheets...');
        
        const response = await fetch(SHEET_CSV_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        const tickets = parseCSV(csvText);
        
        console.log(`📊 Parsed ${tickets.length} tickets from CSV`);
        
        const events = groupTicketsByEvent(tickets);
        
        console.log('Events loaded successfully:', events);
        
        return events;
        
    } catch (error) {
        console.error('❌ Error loading events:', error);
        throw error;
    }
}

/**
 * Formate la date pour l'affichage
 */
function formatEventDate(dateString) {
    if (!dateString) return 'Date à confirmer';
    
    try {
        // Si la date contient déjà l'heure
        if (dateString.includes(' ')) {
            const [datePart, timePart] = dateString.split(' ');
            const [year, month, day] = datePart.split('-');
            return `${day}/${month}/${year} à ${timePart}`;
        }
        
        // Sinon juste la date
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    } catch (error) {
        return dateString;
    }
}

/**
 * Formate le prix pour l'affichage
 */
function formatPrice(price) {
    if (typeof price === 'number') {
        return `${price}€`;
    }
    return price;
}

// Export des fonctions si vous utilisez des modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadEventsFromSheet,
        formatEventDate,
        formatPrice
    };
}

// Chargement automatique au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const events = await loadEventsFromSheet();
        
        // Dispatcher un événement personnalisé avec les données
        const eventLoadedEvent = new CustomEvent('eventsLoaded', { 
            detail: events 
        });
        document.dispatchEvent(eventLoadedEvent);
        
        console.log('✅ Events loaded! Initializing page...');
        
    } catch (error) {
        console.error('Failed to load events on page load:', error);
        
        // Afficher un message d'erreur à l'utilisateur
        const errorMessage = document.createElement('div');
        errorMessage.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #f44336; color: white; padding: 15px; border-radius: 5px; z-index: 9999;';
        errorMessage.textContent = '❌ Impossible de charger les événements. Vérifiez votre connexion.';
        document.body.appendChild(errorMessage);
        
        setTimeout(() => errorMessage.remove(), 5000);
    }
});
