// Base de données des événements
const eventsData = {
  concerts: [
    {
      id: 'drake-paris-2026',
      name: 'Drake',
      venue: 'Accor Arena',
      city: 'Paris',
      date: '2026-03-15',
      time: '20:00',
      image: 'https://ibb.co/b5553MKF?w=800&q=80',
      minPrice: 89,
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
      tickets: [
        { section: 'VIP', row: 'C', seats: '1-2', price: 450 },
        { section: 'Parterre', row: 'H', seats: '14-15', price: 220 },
        { section: 'Balcon', row: 'P', seats: '22-23-24', price: 140 },
        { section: 'Fosse', row: 'GA', seats: '2', price: 75 }
      ]
    },
    {
      id: 'the-weeknd-paris-2026',
      name: 'The Weeknd',
      venue: 'Stade de France',
      city: 'Paris',
      date: '2026-05-10',
      time: '19:30',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
      minPrice: 65,
      tickets: [
        { section: 'Golden Circle', row: 'GA', seats: '1-2', price: 280 },
        { section: 'Tribune Sud', row: 'L', seats: '45-46-47', price: 120 },
        { section: 'Pelouse Est', row: 'GA', seats: '3', price: 65 },
        { section: 'Tribune Nord', row: 'R', seats: '12-13', price: 95 }
      ]
    },
    {
      id: 'taylor-swift-london-2026',
      name: 'Taylor Swift',
      venue: 'Wembley Stadium',
      city: 'Londres',
      date: '2026-06-18',
      time: '18:00',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
      minPrice: 95,
      tickets: [
        { section: 'VIP Package', row: 'A', seats: '5-6', price: 580 },
        { section: 'Lower Tier', row: 'M', seats: '33-34', price: 240 },
        { section: 'Standing', row: 'GA', seats: '2', price: 95 },
        { section: 'Upper Tier', row: 'Z', seats: '18-19-20', price: 145 }
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
      tickets: [
        { section: 'Tribune Présidentielle', row: 'E', seats: '8-9', price: 650 },
        { section: 'Tribune Auteuil', row: 'K', seats: '24-25-26', price: 280 },
        { section: 'Tribune Boulogne', row: 'N', seats: '18-19', price: 220 },
        { section: 'Virage Supérieur', row: 'T', seats: '45-46-47-48', price: 120 }
      ]
    },
    {
      id: 'france-italie-rugby-2026',
      name: 'France vs Italie',
      league: 'Tournoi des 6 Nations',
      venue: 'Stade de France',
      city: 'Paris',
      date: '2026-03-14',
      time: '15:15',
      image: 'https://images.unsplash.com/photo-1510925751558-41b43d5e7d4d?w=800&q=80',
      minPrice: 85,
      tickets: [
        { section: 'Tribune VIP', row: 'D', seats: '12-13-14', price: 420 },
        { section: 'Tribune Jean Bouin', row: 'L', seats: '28-29', price: 180 },
        { section: 'Tribune Supérieure', row: 'V', seats: '34-35-36', price: 110 },
        { section: 'Virage Nord', row: 'GA', seats: '4', price: 85 }
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
      tickets: [
        { section: 'Loge VIP', row: 'Box A', seats: '1-2-3-4', price: 1850 },
        { section: 'Catégorie 1', row: 'F', seats: '18-19', price: 650 },
        { section: 'Catégorie 2', row: 'N', seats: '24-25-26', price: 420 },
        { section: 'Catégorie 3', row: 'T', seats: '38-39', price: 250 }
      ]
    },
    {
      id: 'champions-league-finale-2026',
      name: 'Finale UEFA Champions League',
      league: 'Champions League',
      venue: 'Allianz Arena',
      city: 'Munich',
      date: '2026-05-30',
      time: '21:00',
      image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80',
      minPrice: 350,
      tickets: [
        { section: 'VIP Hospitality', row: 'Box 12', seats: '1-2-3-4', price: 2500 },
        { section: 'Catégorie 1', row: 'J', seats: '14-15', price: 850 },
        { section: 'Catégorie 2', row: 'P', seats: '28-29-30', price: 550 },
        { section: 'Catégorie 3', row: 'U', seats: '45-46', price: 350 }
      ]
    }
  ]
};

// Fonction pour obtenir tous les événements
function getAllEvents() {
  return [...eventsData.concerts, ...eventsData.sports];
}

// Fonction pour obtenir un événement par ID
function getEventById(id) {
  const allEvents = getAllEvents();
  return allEvents.find(event => event.id === id);
}

// Fonction pour obtenir les événements par catégorie
function getEventsByCategory(category) {
  return eventsData[category] || [];
}
