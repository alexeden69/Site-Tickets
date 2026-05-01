// TicketHub — données des événements
// Pour modifier : parler à Claude directement

let eventsData = { concerts: [], sports: [] };
let dataLoaded = false;

// ─────────────────────────────────────────────
// DONNÉES
// ─────────────────────────────────────────────
function loadData() {
  eventsData.sports = [
    {
      id: 'roland-garros-24mai',
      name: 'Roland Garros — 1er Tour (24 mai)',
      venue: 'Roland Garros', city: 'Paris',
      date: '2026-05-24', time: '11:00',
      category: 'sport', trending: true,
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
      category: 'sport', trending: true,
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
      category: 'sport', trending: true,
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
      category: 'sport', trending: true,
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
      category: 'sport', trending: false,
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
      category: 'sport', trending: true,
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
      category: 'sport', trending: true,
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
      category: 'sport', trending: false,
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
      category: 'sport', trending: false,
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
      id: 'the-neighbourhood-paris',
      name: 'The Neighbourhood — Paris',
      venue: 'Zénith de Paris', city: 'Paris',
      date: '2026-05-12', time: '20:00',
      category: 'concert', trending: false,
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
      category: 'concert', trending: true,
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
      category: 'concert', trending: true,
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
      category: 'concert', trending: false,
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
      category: 'concert', trending: true,
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
      category: 'concert', trending: false,
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
      category: 'concert', trending: false,
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
      category: 'concert', trending: false,
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
      category: 'concert', trending: false,
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
      category: 'concert', trending: false,
      minPrice: 0,
      tickets: [
        { section: 'Section 535', row: 'Row 16', seats: 'Seat 3', price: 0 },
        { section: 'Section 535', row: 'Row 16', seats: 'Seat 4', price: 0 },
      ]
    },
  ];

  eventsData.concerts.sort((a, b) => new Date(a.date) - new Date(b.date));
  eventsData.sports.sort((a, b) => new Date(a.date) - new Date(b.date));
}

// ─────────────────────────────────────────────
// GROUPES D'ÉVÉNEMENTS
// ─────────────────────────────────────────────
const EVENT_GROUPS = [
  {
    id: 'group-roland-garros',
    groupName: 'Roland Garros 2026',
    category: 'sport',
    trending: true,
    eventIds: ['roland-garros-24mai', 'roland-garros-qf1', 'roland-garros-demifin', 'roland-garros-finale']
  },
  {
    id: 'group-fifa-wc-2026',
    groupName: 'FIFA World Cup 2026',
    category: 'sport',
    trending: true,
    eventIds: ['wc2026-match061', 'wc2026-match086']
  },
  {
    id: 'group-jul',
    groupName: 'Jul — Paris',
    category: 'concert',
    trending: true,
    eventIds: ['jul-paris-15mai', 'jul-paris-16mai']
  },
  {
    id: 'group-bts',
    groupName: 'BTS — World Tour',
    category: 'concert',
    trending: false,
    eventIds: ['bts-stanford', 'bts-london-1', 'bts-london-2', 'bts-madrid', 'bts-los-angeles']
  },
  {
    id: 'group-bad-bunny',
    groupName: 'Bad Bunny — Paris',
    category: 'concert',
    trending: true,
    eventIds: ['bad-bunny-paris-4jul', 'bad-bunny-paris-5jul']
  },
  {
    id: 'group-wrc-2027',
    groupName: 'Coupe du Monde Rugby 2027',
    category: 'sport',
    trending: false,
    eventIds: ['wrc2027-france-usa', 'wrc2027-england-tonga']
  },
];

const GROUPED_EVENT_IDS = new Set(EVENT_GROUPS.flatMap(g => g.eventIds));

function buildGroups() {
  return EVENT_GROUPS.map(groupDef => {
    const events = groupDef.eventIds.map(id => getEventById(id)).filter(Boolean);
    const prices = events.flatMap(e => e.tickets.map(t => t.price)).filter(p => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    return { ...groupDef, events, minPrice, isGroup: true };
  }).filter(g => g.events.length > 0);
}

function getConcertsForDisplay() {
  const groups = buildGroups().filter(g => g.category === 'concert');
  const ungrouped = eventsData.concerts.filter(e => !GROUPED_EVENT_IDS.has(e.id) && !e.soldOut);
  return [...groups, ...ungrouped].sort((a, b) => {
    const dateA = a.isGroup ? new Date(a.events[0].date) : new Date(a.date);
    const dateB = b.isGroup ? new Date(b.events[0].date) : new Date(b.date);
    return dateA - dateB;
  });
}

function getSportsForDisplay() {
  const groups = buildGroups().filter(g => g.category === 'sport');
  const ungrouped = eventsData.sports.filter(e => !GROUPED_EVENT_IDS.has(e.id) && !e.soldOut);
  return [...groups, ...ungrouped].sort((a, b) => {
    const dateA = a.isGroup ? new Date(a.events[0].date) : new Date(a.date);
    const dateB = b.isGroup ? new Date(b.events[0].date) : new Date(b.date);
    return dateA - dateB;
  });
}

function getAllForDisplay() {
  return [...getConcertsForDisplay(), ...getSportsForDisplay()];
}

function getSoldOutEvents() {
  return [...eventsData.concerts, ...eventsData.sports]
    .filter(e => e.soldOut)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getGroupById(id) {
  return buildGroups().find(g => g.id === id) || null;
}

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
// INIT
// ─────────────────────────────────────────────
loadData();
dataLoaded = true;
setTimeout(() => document.dispatchEvent(new CustomEvent('eventsLoaded')), 100);
