// Google Sheets Loader — TicketHub
// Charge les données depuis un Google Sheet publié en CSV
// Fallback automatique sur les données réelles si Google Sheets est indisponible

let eventsData = {
  concerts: [],
  sports: []
};

let dataLoaded = false;

// CONFIGURATION: Remplacer par l'URL de votre Google Sheet publié en CSV
// Fichier > Partager > Publier sur le Web > Feuille 1 > CSV > Publier
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQfVTuvP_7jMZsqc4Cmg2ThaGIuzg7LwD8cM4itIzNCKSRH-WYSLaCRNm5IDFuAYODzT6T9_ZswTOgG/pub?output=csv';

// ─────────────────────────────────────────────
// PARSING CSV
// ─────────────────────────────────────────────
function parseCSV(csv) {
  csv = csv.replace(/^\ufeff/, '');
  const lines = csv.split(/\r?\n/);
  // Trouver la vraie ligne d'en-têtes (celle qui contient "event_id")
  let headerIndex = lines.findIndex(l => l.toLowerCase().includes('event_id'));
  if (headerIndex === -1) headerIndex = 0;
  const headers = lines[headerIndex].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const data = [];
  for (let i = headerIndex + 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((header, index) => { row[header] = values[index] || ''; });
    data.push(row);
  }
  return data;
}

function groupTicketsByEvent(rows) {
  const events = {};
  rows.forEach((row) => {
    if (!row.event_id || !row.event_name || !row.category || !row.venue || !row.city || !row.date || !row.section || !row.price) return;
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
        soldOut: row.sold_out === 'TRUE' || row.sold_out === 'true' || row.sold_out === '1',
        tickets: []
      };
      if (row.league && row.league.trim()) events[eventId].league = row.league.trim();
    }
    events[eventId].tickets.push({
      section: row.section.trim(),
      row: row.row ? row.row.trim() : 'GA',
      seats: row.seats ? row.seats.trim() : '1',
      price: parseInt(row.price)
    });
  });
  return events;
}

function calculateMinPrices(events) {
  Object.values(events).forEach(event => {
    if (event.tickets.length > 0) {
      const prices = event.tickets.map(t => t.price).filter(p => p > 0);
      event.minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    }
  });
}

// ─────────────────────────────────────────────
// CHARGEMENT DEPUIS GOOGLE SHEETS
// ─────────────────────────────────────────────
async function loadEventsFromSheet() {
  try {
    console.log('🔄 Chargement depuis Google Sheets...');
    const response = await fetch(GOOGLE_SHEET_URL);
    const csvText = await response.text();
    const rows = parseCSV(csvText);
    const events = groupTicketsByEvent(rows);
    calculateMinPrices(events);
    eventsData.concerts = [];
    eventsData.sports = [];
    Object.values(events).forEach(event => {
      if (event.category === 'concert') eventsData.concerts.push(event);
      else if (event.category === 'sport') eventsData.sports.push(event);
    });
    eventsData.concerts.sort((a, b) => new Date(a.date) - new Date(b.date));
    eventsData.sports.sort((a, b) => new Date(a.date) - new Date(b.date));
    dataLoaded = true;
    console.log('✅ Événements chargés depuis Google Sheets');
    document.dispatchEvent(new CustomEvent('eventsLoaded'));
    return eventsData;
  } catch (error) {
    console.warn('⚠️ Google Sheets inaccessible, utilisation des données locales...', error);
    loadFallbackData();
    dataLoaded = true;
    document.dispatchEvent(new CustomEvent('eventsLoaded'));
    return eventsData;
  }
}

// ─────────────────────────────────────────────
// DONNÉES DE FALLBACK — Tickets réels au 27/02/2026
// ─────────────────────────────────────────────
function loadFallbackData() {
  const IMG_SPORT = 'https://images.unsplash.com/photo-1519766304817-4f37bda74a26?w=800&h=450&fit=crop&q=80';
  const IMG_CONCERT = 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=450&fit=crop&q=80';
  const IMG_TENNIS = 'https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=800&h=450&fit=crop&q=80';
  const IMG_FOOTBALL = 'https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?w=800&h=450&fit=crop&q=80';

  eventsData.sports = [
    {
      id: 'france-angleterre-6nations',
      name: 'Tournoi des 6 Nations — France vs Angleterre',
      venue: 'Stade de France', city: 'Saint-Denis',
      date: '2026-03-14', time: '20:00',
      image: 'https://images.unsplash.com/photo-1544298621-35a764872f32?w=800&h=450&fit=crop&q=80', category: 'sport', trending: true,
      league: 'Tournoi des 6 Nations',
      minPrice: 200,
      tickets: [
        { section: 'Catégorie 3', row: 'Rang 70', seats: 'Siège 29', price: 280 },
        { section: 'Catégorie 3', row: 'Rang 70', seats: 'Siège 30', price: 280 },
        { section: 'Catégorie 3', row: 'Rang 64', seats: 'Siège 40', price: 280 },
        { section: 'Catégorie 3', row: 'Rang 64', seats: 'Siège 41', price: 280 },
        { section: 'Catégorie 3', row: 'Rang 70', seats: 'Siège 35', price: 280 },
        { section: 'Catégorie 3', row: 'Rang 70', seats: 'Siège 36', price: 280 },
        { section: 'Catégorie 7', row: 'Rang 76', seats: 'Siège 30', price: 200 },
      ]
    },
    {
      id: 'monte-carlo-masters',
      name: 'Rolex Monte Carlo Masters',
      venue: 'Monte-Carlo Country Club', city: 'Monaco',
      date: '2026-04-04', time: '12:00',
      image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=450&fit=crop&q=80', category: 'sport', trending: false,
      league: 'Tennis',
      minPrice: 50,
      tickets: [
        { section: 'Catégorie 1', row: 'Rang 2', seats: 'Place 34', price: 50 },
        { section: 'Catégorie 1', row: 'Rang 2', seats: 'Place 35', price: 50 },
        { section: 'Catégorie 1', row: 'Rang 2', seats: 'Place 36', price: 50 },
        { section: 'Catégorie 1', row: 'Rang 2', seats: 'Place 37', price: 50 },
        { section: 'Catégorie 1', row: 'Rang 2', seats: 'Place 38', price: 50 },
      ]
    },
    {
      id: 'roland-garros-24mai',
      name: 'Roland Garros — 1er Tour (24 mai)',
      venue: 'Roland Garros', city: 'Paris',
      date: '2026-05-24', time: '11:00',
      image: IMG_TENNIS, category: 'sport', trending: true,
      league: 'Roland Garros 2026',
      minPrice: 0,
      tickets: [
        { section: 'Catégorie 3', row: 'Rang 16', seats: 'Place 135', price: 0 },
        { section: 'Catégorie 3', row: 'Rang 16', seats: 'Place 136', price: 0 },
        { section: 'Catégorie 3', row: 'Rang 16', seats: 'Place 137', price: 0 },
        { section: 'Catégorie 3', row: 'Rang 16', seats: 'Place 138', price: 0 },
        { section: 'Catégorie 3', row: 'Rang 16', seats: 'Place 164', price: 0 },
        { section: 'Catégorie 3', row: 'Rang 16', seats: 'Place 165', price: 0 },
      ]
    },
    {
      id: 'roland-garros-qf1',
      name: 'Roland Garros — Quart de Finale 1 (2 juin)',
      venue: 'Roland Garros', city: 'Paris',
      date: '2026-06-02', time: '11:00',
      image: IMG_TENNIS, category: 'sport', trending: true,
      league: 'Roland Garros 2026',
      minPrice: 0,
      tickets: [
        { section: 'Catégorie 1', row: 'Rang 13', seats: 'Place 167', price: 0 },
        { section: 'Catégorie 1', row: 'Rang 13', seats: 'Place 168', price: 0 },
        { section: 'Catégorie 1', row: 'Rang 17', seats: 'Place 91', price: 0 },
        { section: 'Catégorie 1', row: 'Rang 17', seats: 'Place 92', price: 0 },
      ]
    },
    {
      id: 'roland-garros-demifin',
      name: 'Roland Garros — Demi-Finale (5 juin)',
      venue: 'Roland Garros', city: 'Paris',
      date: '2026-06-05', time: '13:00',
      image: IMG_TENNIS, category: 'sport', trending: true,
      league: 'Roland Garros 2026',
      minPrice: 0,
      tickets: [
        { section: 'Catégorie 1', row: 'Rang 17', seats: 'Place 55', price: 0 },
        { section: 'Catégorie 1', row: 'Rang 17', seats: 'Place 56', price: 0 },
        { section: 'Catégorie Or', row: 'Rang 4', seats: 'Place 80', price: 0 },
        { section: 'Catégorie Or', row: 'Rang 4', seats: 'Place 81', price: 0 },
        { section: 'Catégorie Or', row: 'Rang 3', seats: 'Place 76', price: 0 },
        { section: 'Catégorie Or', row: 'Rang 3', seats: 'Place 77', price: 0 },
      ]
    },
    {
      id: 'roland-garros-finale',
      name: 'Roland Garros — Finale Homme (7 juin)',
      venue: 'Roland Garros', city: 'Paris',
      date: '2026-06-07', time: '15:00',
      image: IMG_TENNIS, category: 'sport', trending: true,
      league: 'Roland Garros 2026',
      minPrice: 0,
      tickets: [
        { section: 'Catégorie 1', row: 'Rang 19', seats: 'Place 76', price: 0 },
        { section: 'Catégorie 1', row: 'Rang 19', seats: 'Place 77', price: 0 },
        { section: 'Catégorie 1', row: 'Rang 19', seats: 'Place 78', price: 0 },
        { section: 'Catégorie 1', row: 'Rang 19', seats: 'Place 79', price: 0 },
      ]
    },
    {
      id: 'queens-london-final',
      name: "Queen's London — Final",
      venue: "Queen's Club", city: 'London',
      date: '2026-06-21', time: '14:00',
      image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=450&fit=crop&q=80', category: 'sport', trending: false,
      league: 'Tennis',
      minPrice: 250,
      tickets: [
        { section: 'Catégorie 7', row: 'GA', seats: '1', price: 250 },
        { section: 'Catégorie 7', row: 'GA', seats: '2', price: 250 },
      ]
    },
    {
      id: 'wc2026-match061',
      name: 'FIFA World Cup — France vs Norvège (Match 061)',
      venue: 'Gillette Stadium', city: 'Boston',
      date: '2026-06-26', time: '20:00',
      image: IMG_FOOTBALL, category: 'sport', trending: true,
      league: 'FIFA World Cup 2026',
      minPrice: 900,
      tickets: [
        { section: 'Catégorie 2', row: 'GA', seats: '1', price: 1000 },
        { section: 'Catégorie 2', row: 'GA', seats: '2', price: 1000 },
        { section: 'Catégorie 2', row: 'GA', seats: '3', price: 1000 },
        { section: 'Catégorie 2', row: 'GA', seats: '4', price: 1000 },
        { section: 'Standard Supporter', row: 'GA', seats: '5', price: 900 },
        { section: 'Standard Supporter', row: 'GA', seats: '6', price: 900 },
      ]
    },
    {
      id: 'wc2026-match086',
      name: 'FIFA World Cup — 16ème de finale Miami (Match 086)',
      venue: 'Hard Rock Stadium', city: 'Miami',
      date: '2026-07-03', time: '20:00',
      image: IMG_FOOTBALL, category: 'sport', trending: true,
      league: 'FIFA World Cup 2026',
      minPrice: 1200,
      tickets: [
        { section: 'Catégorie 3', row: 'GA', seats: '1', price: 1200 },
        { section: 'Catégorie 3', row: 'GA', seats: '2', price: 1200 },
        { section: 'Catégorie 3', row: 'GA', seats: '3', price: 1200 },
        { section: 'Catégorie 3', row: 'GA', seats: '4', price: 1200 },
      ]
    },
    {
      id: 'wrc2027-france-usa',
      name: 'Coupe du Monde Rugby — France vs USA',
      venue: 'Stade de France', city: 'Saint-Denis',
      date: '2027-10-02', time: '20:00',
      image: IMG_SPORT, category: 'sport', trending: false,
      league: 'Coupe du Monde Rugby 2027',
      minPrice: 0,
      tickets: [
        { section: 'Category 6', row: 'GA', seats: '1', price: 0 },
        { section: 'Category 6', row: 'GA', seats: '2', price: 0 },
      ]
    },
    {
      id: 'wrc2027-england-tonga',
      name: 'Coupe du Monde Rugby — England vs Tonga',
      venue: 'Allianz Riviera', city: 'Nice',
      date: '2027-10-02', time: '20:00',
      image: IMG_SPORT, category: 'sport', trending: false,
      league: 'Coupe du Monde Rugby 2027',
      minPrice: 0,
      tickets: [
        { section: 'Category 6', row: 'GA', seats: '1', price: 0 },
        { section: 'Category 6', row: 'GA', seats: '2', price: 0 },
      ]
    },
  ];

  eventsData.concerts = [
    {
      id: 'gunna-london',
      name: 'Gunna — London',
      venue: 'The O2 Arena', city: 'London',
      date: '2026-03-31', time: '20:00',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=450&fit=crop&q=80', category: 'concert', trending: true,
      minPrice: 120,
      tickets: [
        { section: 'Section 416', row: 'Row T', seats: 'Seat 826', price: 120 },
        { section: 'Section 416', row: 'Row T', seats: 'Seat 827', price: 120 },
      ]
    },
    {
      id: 'circoloco-ibiza',
      name: 'Circoloco Ibiza',
      venue: 'DC-10', city: 'Ibiza',
      date: '2026-04-27', time: '23:00',
      image: 'https://images.unsplash.com/photo-1571266752020-97e5e6a5e65c?w=800&h=450&fit=crop&q=80',
      category: 'concert', trending: true,
      minPrice: 200,
      tickets: [
        { section: 'General Admission', row: 'GA', seats: '1', price: 200 },
        { section: 'General Admission', row: 'GA', seats: '2', price: 200 },
        { section: 'General Admission', row: 'GA', seats: '3', price: 200 },
        { section: 'General Admission', row: 'GA', seats: '4', price: 200 },
        { section: 'General Admission', row: 'GA', seats: '5', price: 200 },
        { section: 'General Admission', row: 'GA', seats: '6', price: 200 },
      ]
    },
    {
      id: 'the-neighbourhood-paris',
      name: 'The Neighbourhood — Paris',
      venue: 'Zénith de Paris', city: 'Paris',
      date: '2026-05-12', time: '20:00',
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=450&fit=crop&q=80', category: 'concert', trending: false,
      minPrice: 100,
      tickets: [
        { section: 'Catégorie 2', row: 'GA', seats: '1', price: 100 },
        { section: 'Catégorie 2', row: 'GA', seats: '2', price: 100 },
      ]
    },
    {
      id: 'jul-paris-15mai',
      name: 'Jul — Paris (15 mai)',
      venue: 'Stade de France', city: 'Saint-Denis',
      date: '2026-05-15', time: '20:00',
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=450&fit=crop&q=80', category: 'concert', trending: true,
      minPrice: 150,
      tickets: [
        { section: 'Pelouse', row: 'Placement H', seats: 'Nord 1', price: 150 },
        { section: 'Pelouse', row: 'Placement H', seats: 'Nord 2', price: 150 },
        { section: 'Pelouse', row: 'Placement R', seats: 'Nord 1', price: 150 },
        { section: 'Pelouse', row: 'Placement R', seats: 'Nord 2', price: 150 },
      ]
    },
    {
      id: 'jul-paris-16mai',
      name: 'Jul — Paris (16 mai)',
      venue: 'Stade de France', city: 'Saint-Denis',
      date: '2026-05-16', time: '20:00',
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=450&fit=crop&q=80', category: 'concert', trending: true,
      minPrice: 180,
      tickets: [
        { section: 'Catégorie 1', row: 'Rang 72', seats: 'Place 07', price: 180 },
        { section: 'Catégorie 1', row: 'Rang 72', seats: 'Place 08', price: 180 },
        { section: 'Catégorie 1', row: 'Rang 49', seats: 'Place 34', price: 180 },
        { section: 'Catégorie 1', row: 'Rang 49', seats: 'Place 35', price: 180 },
        { section: 'Catégorie 1', row: 'Rang 64', seats: 'Place 41', price: 180 },
        { section: 'Catégorie 1', row: 'Rang 64', seats: 'Place 42', price: 180 },
      ]
    },
    {
      id: 'bts-stanford',
      name: 'BTS — Stanford',
      venue: 'Stanford Stadium', city: 'San Francisco',
      date: '2026-05-17', time: '20:00',
      image: IMG_CONCERT, category: 'concert', trending: false,
      minPrice: 0,
      tickets: [
        { section: 'Section 225', row: 'Row S', seats: 'Seat 1', price: 0 },
        { section: 'Section 225', row: 'Row S', seats: 'Seat 2', price: 0 },
      ]
    },
    {
      id: 'bad-bunny-paris-4jul',
      name: 'Bad Bunny — Paris (4 juillet)',
      venue: 'Accor Arena', city: 'Paris',
      date: '2026-07-04', time: '20:30',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop&q=80', category: 'concert', trending: true,
      minPrice: 0,
      tickets: [
        { section: 'Catégorie Or', row: 'Rang 25', seats: 'Place 5', price: 0 },
        { section: 'Catégorie Or', row: 'Rang 25', seats: 'Place 6', price: 0 },
        { section: 'Catégorie 2 allée', row: 'Rang 57', seats: 'Place 8', price: 0 },
        { section: 'Catégorie 2 allée', row: 'Rang 57', seats: 'Place 9', price: 0 },
        { section: 'Catégorie 2 allée', row: 'Rang 62', seats: 'Place 8', price: 0 },
        { section: 'Catégorie 2 allée', row: 'Rang 62', seats: 'Place 9', price: 0 },
        { section: 'Catégorie 2', row: 'Rang 52', seats: 'Place 1', price: 0 },
        { section: 'Catégorie 2', row: 'Rang 52', seats: 'Place 2', price: 0 },
      ]
    },
    {
      id: 'bad-bunny-paris-5jul',
      name: 'Bad Bunny — Paris (5 juillet)',
      venue: 'Accor Arena', city: 'Paris',
      date: '2026-07-05', time: '20:30',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop&q=80', category: 'concert', trending: false,
      minPrice: 0,
      tickets: [
        { section: 'Catégorie 2 allée', row: 'Rang 51', seats: 'Place 13', price: 0 },
        { section: 'Catégorie 2 allée', row: 'Rang 51', seats: 'Place 14', price: 0 },
        { section: 'Catégorie 2 allée', row: 'Rang 56', seats: 'Place 18', price: 0 },
        { section: 'Catégorie 2 allée', row: 'Rang 56', seats: 'Place 19', price: 0 },
      ]
    },
    {
      id: 'bts-london-1',
      name: 'BTS — Londres (Jour 1)',
      venue: 'Wembley Stadium', city: 'London',
      date: '2026-07-17', time: '19:30',
      image: IMG_CONCERT, category: 'concert', trending: false,
      minPrice: 0,
      tickets: [
        { section: 'Section 530', row: 'Row 19', seats: 'Seat 948', price: 0 },
        { section: 'Section 530', row: 'Row 19', seats: 'Seat 949', price: 0 },
        { section: 'Section 530', row: 'Row 19', seats: 'Seat 950', price: 0 },
      ]
    },
    {
      id: 'bts-london-2',
      name: 'BTS — Londres (Jour 2)',
      venue: 'Wembley Stadium', city: 'London',
      date: '2026-07-18', time: '19:30',
      image: IMG_CONCERT, category: 'concert', trending: false,
      minPrice: 0,
      tickets: [
        { section: 'Standing', row: 'GA', seats: '1', price: 0 },
        { section: 'Standing', row: 'GA', seats: '2', price: 0 },
        { section: 'Section 522', row: 'Row 22', seats: 'Seat 714', price: 0 },
        { section: 'Section 522', row: 'Row 22', seats: 'Seat 715', price: 0 },
      ]
    },
    {
      id: 'bts-madrid',
      name: 'BTS — Madrid',
      venue: 'Estadio Metropolitano', city: 'Madrid',
      date: '2026-07-29', time: '19:30',
      image: IMG_CONCERT, category: 'concert', trending: false,
      minPrice: 0,
      tickets: [
        { section: 'Sector 503', row: 'Row 18', seats: 'Seat 10', price: 0 },
        { section: 'Sector 503', row: 'Row 18', seats: 'Seat 11', price: 0 },
        { section: 'Sector 503', row: 'Row 18', seats: 'Seat 12', price: 0 },
        { section: 'Sector 503', row: 'Row 18', seats: 'Seat 13', price: 0 },
      ]
    },
    {
      id: 'bts-los-angeles',
      name: 'BTS — Los Angeles',
      venue: 'SoFi Stadium', city: 'Los Angeles',
      date: '2026-09-01', time: '19:30',
      image: IMG_CONCERT, category: 'concert', trending: false,
      minPrice: 0,
      tickets: [
        { section: 'Section 535', row: 'Row 16', seats: 'Seat 3', price: 0 },
        { section: 'Section 535', row: 'Row 16', seats: 'Seat 4', price: 0 },
      ]
    },
  ];

  eventsData.concerts.sort((a, b) => new Date(a.date) - new Date(b.date));
  eventsData.sports.sort((a, b) => new Date(a.date) - new Date(b.date));
  console.log('✅ Données de fallback chargées:', eventsData.concerts.length, 'concerts,', eventsData.sports.length, 'sports');
}

// ─────────────────────────────────────────────
// GROUPES D'ÉVÉNEMENTS
// Définit quels events sont regroupés sous une même carte
// ─────────────────────────────────────────────
const EVENT_GROUPS = [
  {
    id: 'group-roland-garros',
    groupName: 'Roland Garros 2026',
    category: 'sport',
    image: 'https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=800&h=450&fit=crop&q=80',
    trending: true,
    eventIds: ['roland-garros-24mai', 'roland-garros-qf1', 'roland-garros-demifin', 'roland-garros-finale']
  },
  {
    id: 'group-fifa-wc-2026',
    groupName: 'FIFA World Cup 2026',
    category: 'sport',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?w=800&h=450&fit=crop&q=80',
    trending: true,
    eventIds: ['wc2026-match061', 'wc2026-match086']
  },
  {
    id: 'group-jul',
    groupName: 'Jul — Paris',
    category: 'concert',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=450&fit=crop&q=80',
    trending: true,
    eventIds: ['jul-paris-15mai', 'jul-paris-16mai']
  },
  {
    id: 'group-bts',
    groupName: 'BTS — World Tour',
    category: 'concert',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=450&fit=crop&q=80',
    trending: false,
    eventIds: ['bts-stanford', 'bts-london-1', 'bts-london-2', 'bts-madrid', 'bts-los-angeles']
  },
  {
    id: 'group-bad-bunny',
    groupName: 'Bad Bunny — Paris',
    category: 'concert',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop&q=80',
    trending: true,
    eventIds: ['bad-bunny-paris-4jul', 'bad-bunny-paris-5jul']
  },
  {
    id: 'group-wrc-2027',
    groupName: 'Coupe du Monde Rugby 2027',
    category: 'sport',
    image: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a26?w=800&h=450&fit=crop&q=80',
    trending: false,
    eventIds: ['wrc2027-france-usa', 'wrc2027-england-tonga']
  },
];

// IDs d'events qui appartiennent à un groupe (ne pas afficher seuls)
const GROUPED_EVENT_IDS = new Set(EVENT_GROUPS.flatMap(g => g.eventIds));

// Construit les groupes avec leurs events résolus
function buildGroups() {
  return EVENT_GROUPS.map(groupDef => {
    const events = groupDef.eventIds
      .map(id => getEventById(id))
      .filter(Boolean);
    const prices = events.flatMap(e => e.tickets.map(t => t.price)).filter(p => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    return {
      ...groupDef,
      events,
      minPrice,
      isGroup: true,
    };
  }).filter(g => g.events.length > 0);
}

// Retourne la liste "concerts" avec groupes substitués
function getConcertsForDisplay() {
  const groups = buildGroups().filter(g => g.category === 'concert');
  const ungrouped = eventsData.concerts.filter(e => !GROUPED_EVENT_IDS.has(e.id) && !e.soldOut);
  const all = [...groups, ...ungrouped];
  all.sort((a, b) => {
    const dateA = a.isGroup ? new Date(a.events[0].date) : new Date(a.date);
    const dateB = b.isGroup ? new Date(b.events[0].date) : new Date(b.date);
    return dateA - dateB;
  });
  return all;
}

// Retourne la liste "sports" avec groupes substitués
function getSportsForDisplay() {
  const groups = buildGroups().filter(g => g.category === 'sport');
  const ungrouped = eventsData.sports.filter(e => !GROUPED_EVENT_IDS.has(e.id) && !e.soldOut);
  const all = [...groups, ...ungrouped];
  all.sort((a, b) => {
    const dateA = a.isGroup ? new Date(a.events[0].date) : new Date(a.date);
    const dateB = b.isGroup ? new Date(b.events[0].date) : new Date(b.date);
    return dateA - dateB;
  });
  return all;
}

// Retourne tous les items (groupes + events solo) pour la home trending
function getAllForDisplay() {
  return [...getConcertsForDisplay(), ...getSportsForDisplay()];
}

// Retourne les events sold out pour la section "Déjà vendus"
function getSoldOutEvents() {
  return [...eventsData.concerts, ...eventsData.sports]
    .filter(e => e.soldOut)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getGroupById(id) {
  return buildGroups().find(g => g.id === id) || null;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function getAllEvents() {
  return [...eventsData.concerts, ...eventsData.sports];
}

function getEventById(id) {
  return getAllEvents().find(event => event.id === id);
}

function getEventsByCategory(category) {
  return eventsData[category] || [];
}

// ─────────────────────────────────────────────
// AUTO-CHARGEMENT
// ─────────────────────────────────────────────
if (GOOGLE_SHEET_URL !== 'VOTRE_URL_GOOGLE_SHEET_CSV_ICI') {
  loadEventsFromSheet();
} else {
  console.warn('⚠️ URL Google Sheets non configurée — utilisation des données locales.');
  loadFallbackData();
  dataLoaded = true;
  setTimeout(() => document.dispatchEvent(new CustomEvent('eventsLoaded')), 100);
}

