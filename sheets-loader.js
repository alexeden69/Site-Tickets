// Google Sheets Loader
// This file loads event data from a published Google Sheet

let eventsData = {
  concerts: [],
  sports: []
};

let dataLoaded = false;

// CONFIGURATION: Replace this URL with your published Google Sheet CSV URL
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTvCQIYzDcNpyFv5Ky0reWleWjeDlz2iPA4kTWzZsKSzOrFUfevS7_AkDvvFF1H3PGIKmhM8RqoUtM-/pub?gid=0&single=true&output=csv';

// Function to parse CSV data
function parseCSV(csv) {
  const lines = csv.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    data.push(row);
  }
  
  return data;
}

// Function to group tickets by event
function groupTicketsByEvent(rows) {
  const events = {};
  
  rows.forEach((row, index) => {
    // Validation des données obligatoires
    if (!row.event_id || row.event_id.trim() === '') {
      console.error(`❌ Ligne ${index + 2}: event_id est vide ou manquant`);
      return;
    }
    
    if (!row.event_name || row.event_name.trim() === '') {
      console.error(`❌ Ligne ${index + 2}: event_name est vide ou manquant`);
      return;
    }
    
    if (!row.category || row.category.trim() === '') {
      console.error(`❌ Ligne ${index + 2}: category est vide ou manquant (doit être "Concert" ou "Sport")`);
      return;
    }
    
    if (!row.venue || row.venue.trim() === '') {
      console.error(`❌ Ligne ${index + 2}: venue est vide ou manquant`);
      return;
    }
    
    if (!row.city || row.city.trim() === '') {
      console.error(`❌ Ligne ${index + 2}: city est vide ou manquant`);
      return;
    }
    
    if (!row.date || row.date.trim() === '') {
      console.error(`❌ Ligne ${index + 2}: date est vide ou manquant`);
      return;
    }
    
    if (!row.section || row.section.trim() === '') {
      console.error(`❌ Ligne ${index + 2}: section est vide ou manquant`);
      return;
    }
    
    if (!row.price || row.price.trim() === '') {
      console.error(`❌ Ligne ${index + 2}: price est vide ou manquant`);
      return;
    }
    
    const eventId = row.event_id.trim();
    
    if (!events[eventId]) {
      events[eventId] = {
        id: eventId,
        name: row.event_name.trim(),
        venue: row.venue.trim(),
        city: row.city.trim(),
        date: row.date.trim(),
        time: row.time ? row.time.trim() : '20:00',
        image: row.image_url ? row.image_url.trim() : 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
        category: row.category.trim().toLowerCase(),
        trending: row.trending === 'TRUE' || row.trending === 'true' || row.trending === '1',
        tickets: []
      };
      
      // Add league for sports events
      if (row.league && row.league.trim() !== '') {
        events[eventId].league = row.league.trim();
      }
    }
    
    // Add ticket to event
    events[eventId].tickets.push({
      section: row.section.trim(),
      row: row.row ? row.row.trim() : 'GA',
      seats: row.seats ? row.seats.trim() : '1',
      price: parseInt(row.price)
    });
  });
  
  return events;
}

// Function to calculate minimum price for each event
function calculateMinPrices(events) {
  Object.values(events).forEach(event => {
    if (event.tickets.length > 0) {
      event.minPrice = Math.min(...event.tickets.map(t => t.price));
    }
  });
}

// Function to load data from Google Sheets
async function loadEventsFromSheet() {
  try {
    console.log('Loading events from Google Sheets...');
    
    const response = await fetch(GOOGLE_SHEET_URL);
    const csvText = await response.text();
    
    const rows = parseCSV(csvText);
    const events = groupTicketsByEvent(rows);
    calculateMinPrices(events);
    
    // Separate events by category
    eventsData.concerts = [];
    eventsData.sports = [];
    
    Object.values(events).forEach(event => {
      if (event.category === 'concert') {
        eventsData.concerts.push(event);
      } else if (event.category === 'sport') {
        eventsData.sports.push(event);
      }
    });
    
    // Sort by date
    eventsData.concerts.sort((a, b) => new Date(a.date) - new Date(b.date));
    eventsData.sports.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    dataLoaded = true;
    console.log('Events loaded successfully:', eventsData);
    
    // Trigger custom event to notify that data is loaded
    document.dispatchEvent(new CustomEvent('eventsLoaded'));
    
    return eventsData;
  } catch (error) {
    console.error('Error loading events from Google Sheets:', error);
    
    // Fallback to static data if Google Sheets fails
    console.log('Using fallback static data...');
    loadFallbackData();
    
    dataLoaded = true;
    document.dispatchEvent(new CustomEvent('eventsLoaded'));
    
    return eventsData;
  }
}

// Fallback static data (same as events-data.js)
function loadFallbackData() {
  eventsData = {
    concerts: [
      {
        id: 'drake-paris-2026',
        name: 'Drake',
        venue: 'Accor Arena',
        city: 'Paris',
        date: '2026-03-15',
        time: '20:00',
        image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
        minPrice: 89,
        trending: true,
        tickets: [
          { section: 'Carré Or', row: 'A', seats: '12-13', price: 350 },
          { section: 'Carré Or', row: 'B', seats: '5-6', price: 320 },
          { section: 'Gradin Latéral', row: 'K', seats: '18-19-20', price: 150 },
          { section: 'Gradin Central', row: 'M', seats: '8-9', price: 180 },
          { section: 'Fosse Debout', row: 'GA', seats: '1', price: 89 }
        ]
      },
      {
        id: 'bruno-mars-lyon-2026',
        name: 'Bruno Mars',
        venue: 'Halle Tony Garnier',
        city: 'Lyon',
        date: '2026-04-22',
        time: '21:00',
        image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&q=80',
        minPrice: 75,
        trending: true,
        tickets: [
          { section: 'VIP', row: 'C', seats: '1-2', price: 450 },
          { section: 'Parterre', row: 'H', seats: '14-15', price: 220 },
          { section: 'Balcon', row: 'P', seats: '22-23-24', price: 140 },
          { section: 'Fosse', row: 'GA', seats: '2', price: 75 }
        ]
      }
    ],
    sports: [
      {
        id: 'psg-marseille-2026',
        name: 'PSG vs Marseille',
        league: 'Ligue 1',
        venue: 'Parc des Princes',
        city: 'Paris',
        date: '2026-02-28',
        time: '21:00',
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
        minPrice: 120,
        trending: true,
        tickets: [
          { section: 'Tribune Présidentielle', row: 'E', seats: '8-9', price: 650 },
          { section: 'Tribune Auteuil', row: 'K', seats: '24-25-26', price: 280 },
          { section: 'Tribune Boulogne', row: 'N', seats: '18-19', price: 220 },
          { section: 'Virage Supérieur', row: 'T', seats: '45-46-47-48', price: 120 }
        ]
      },
      {
        id: 'roland-garros-finale-2026',
        name: 'Roland Garros - Finale Hommes',
        league: 'Grand Slam',
        venue: 'Court Philippe-Chatrier',
        city: 'Paris',
        date: '2026-06-07',
        time: '15:00',
        image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
        minPrice: 250,
        trending: true,
        tickets: [
          { section: 'Loge VIP', row: 'Box A', seats: '1-2-3-4', price: 1850 },
          { section: 'Catégorie 1', row: 'F', seats: '18-19', price: 650 },
          { section: 'Catégorie 2', row: 'N', seats: '24-25-26', price: 420 },
          { section: 'Catégorie 3', row: 'T', seats: '38-39', price: 250 }
        ]
      }
    ]
  };
}

// Helper functions (same as events-data.js)
function getAllEvents() {
  return [...eventsData.concerts, ...eventsData.sports];
}

function getEventById(id) {
  const allEvents = getAllEvents();
  return allEvents.find(event => event.id === id);
}

function getEventsByCategory(category) {
  return eventsData[category] || [];
}

// Auto-load data when script is included
if (GOOGLE_SHEET_URL !== 'YOUR_GOOGLE_SHEET_CSV_URL_HERE') {
  loadEventsFromSheet();
} else {
  console.warn('⚠️ Google Sheets URL not configured. Using fallback data.');
  loadFallbackData();
  dataLoaded = true;
  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('eventsLoaded'));
  }, 100);
}
