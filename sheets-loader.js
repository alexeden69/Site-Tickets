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
