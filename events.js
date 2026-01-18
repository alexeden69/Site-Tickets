// events.js
window.EVENTS = [
  {
    id: "taylor-swift-paris-2026-06-12",
    category: "music",
    title: "Taylor Swift — Paris",
    date: "2026-06-12",
    venue: "Paris La Défense Arena",
    city: "Paris",
    country: "France",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=60",
    description: "Limited tickets available. Secure transfer & fast response.",
    genres: ["pop"],
    status: "limited",
    featured: true,
    updatedAt: "2026-01-18",
    highlights: ["Instant transfer", "VIP available"],
    ticketTypes: [
      { name: "Category 2", price: 180, currency: "EUR", availability: "Available" },
      { name: "Category 1", price: 290, currency: "EUR", availability: "Limited" },
      { name: "VIP", price: 550, currency: "EUR", availability: "On request" }
    ],
    delivery: "Mobile transfer",
    payment: "Bank transfer / PayPal",
    notes: "Tell us your quantity and preferred section."
  },
  {
    id: "rock-night-lyon-2026-04-12",
    category: "music",
    title: "Rock Night — Lyon",
    date: "2026-04-12",
    venue: "Halle Tony Garnier",
    city: "Lyon",
    country: "France",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=60",
    description: "Great seats available. Fast confirmation.",
    genres: ["rock"],
    status: "available",
    featured: false,
    updatedAt: "2026-01-18",
    highlights: ["Fast response"],
    ticketTypes: [
      { name: "Seated", price: 65, currency: "EUR", availability: "Available" },
      { name: "Front", price: 95, currency: "EUR", availability: "Limited" }
    ],
    delivery: "E-ticket / Mobile transfer",
    payment: "Bank transfer / PayPal",
    notes: "Tell us your budget and quantity."
  },
  {
    id: "dj-set-marseille-2026-05-03",
    category: "music",
    title: "DJ Set — Marseille",
    date: "2026-05-03",
    venue: "Le Dôme",
    city: "Marseille",
    country: "France",
    image: "https://images.unsplash.com/photo-1464375117522-1311dd7f0b0a?auto=format&fit=crop&w=1200&q=60",
    description: "Standing and VIP options. Limited availability.",
    genres: ["edm"],
    status: "limited",
    featured: false,
    updatedAt: "2026-01-18",
    highlights: ["Secure transfer"],
    ticketTypes: [
      { name: "Standing", price: 40, currency: "EUR", availability: "Available" },
      { name: "VIP", price: 120, currency: "EUR", availability: "On request" }
    ],
    delivery: "Mobile transfer",
    payment: "Bank transfer / PayPal",
    notes: "Send your preferred ticket type."
  }
];
