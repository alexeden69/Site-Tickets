// events.js
window.EVENTS = [
  {
    id: "taylor-swift-paris-2026-06-12",
    category: "music", // music | sports | countries (si tu veux)
    title: "Taylor Swift — Paris",
    date: "2026-06-12",
    venue: "Paris La Défense Arena",
    city: "Paris",
    country: "France",
    image: "https://example.com/taylor.jpg",
    description: "Limited tickets available. Fast delivery and secure transfer.",
    ticketTypes: [
      { name: "General Admission", price: 180, currency: "EUR", stockNote: "Few left" },
      { name: "Category 1", price: 290, currency: "EUR", stockNote: "Available" },
      { name: "VIP", price: 550, currency: "EUR", stockNote: "On request" }
    ]
  },
  {
    id: "arsenal-vs-chelsea-2026-04-03",
    category: "sports",
    title: "Arsenal vs Chelsea",
    date: "2026-04-03",
    venue: "Emirates Stadium",
    city: "London",
    country: "United Kingdom",
    image: "https://example.com/arsenal.jpg",
    description: "Great seats available. Tell us your preferred section.",
    ticketTypes: [
      { name: "Standard", price: 120, currency: "GBP", stockNote: "Available" },
      { name: "Lower Tier", price: 190, currency: "GBP", stockNote: "Limited" }
    ]
  }
];
