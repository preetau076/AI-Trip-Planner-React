/*
  Single source of truth for every destination on the site.
  Text, prices, durations and images come from the original project;
  itinerary, activities, coordinates and bestTime were added so that
  Trip Details, Results, Dashboard and the map can all work from one place.

  `price` is the package price for 2 travelers for `days` days (INR).
*/

const img = (id) => `/images/${id}.jpg`;

export const destinations = [
    {
        id: "Goa",
        name: "Goa",
        title: "Goa Beach Escape",
        tagline: "Beaches • Nightlife • Food",
        blurb: "Beach, nightlife and amazing food.",
        description:
            "Relax on beautiful beaches, enjoy local food and experience Goa's vibrant nightlife.",
        type: "Beach",
        typeLabel: "🏖️ Beach",
        tags: ["Beach", "Family", "Nightlife", "Food", "Relaxation"],
        price: 22000,
        
        days: 4,
        image: img("photo-1512343879784-a960bf40e7f2"),
        bestTime: "November to February",
        coordinates: { lat: 15.4909, lng: 73.8278 },
        mapName: "Goa",
        mapDescription: "Beaches, nightlife and amazing food.",
        activities: ["Beach hopping", "Fort Aguada visit", "Water sports", "Local seafood trail"],
        itinerary: [
            { title: "Arrival & Beach Evening", plan: "Arrive, check in, relax at a nearby beach and enjoy a sunset dinner by the sea." },
            { title: "North Goa Sightseeing", plan: "Visit Fort Aguada, Baga and Calangute beaches, try water sports and explore evening markets." },
            { title: "South Goa & Culture", plan: "Quiet beaches in South Goa, old churches in Old Goa and a Goan thali lunch." },
            { title: "Leisure & Departure", plan: "Souvenir shopping, a relaxed breakfast, checkout and departure." }
        ]
    },
    {
        id: "Manali",
        name: "Manali",
        title: "Manali Adventure Escape",
        tagline: "Mountains • Adventure • Nature",
        blurb: "Mountains, snow and adventure.",
        description:
            "Enjoy mountains, scenic valleys, adventure activities and peaceful Himalayan landscapes.",
        type: "Adventure",
        typeLabel: "🏔️ Adventure",
        tags: ["Adventure", "Nature", "Photography"],
        price: 28000,
        
        days: 5,
        image: img("photo-1677820915325-d8ce3184c2a4"),
        bestTime: "March to June, December to February for snow",
        coordinates: { lat: 32.2432, lng: 77.1892 },
        mapName: "Manali",
        mapDescription: "Mountains, snow and adventure.",
        activities: ["Solang Valley activities", "Old Manali cafes", "Hadimba Temple", "River walks"],
        itinerary: [
            { title: "Arrival & Mall Road", plan: "Arrive in Manali, check in, rest and stroll along Mall Road in the evening." },
            { title: "Solang Valley", plan: "Adventure activities in Solang Valley such as paragliding or zorbing, depending on the season." },
            { title: "Local Temples & Old Manali", plan: "Visit Hadimba Temple and Vashisht, then explore the cafes of Old Manali." },
            { title: "Scenic Excursion", plan: "Day trip to a scenic viewpoint or river-side spot for photography and a relaxed picnic." },
            { title: "Shopping & Departure", plan: "Pick up woollens and souvenirs, breakfast, checkout and departure." }
        ]
    },
    {
        id: "Rajasthan",
        name: "Rajasthan",
        title: "Royal Rajasthan Experience",
        tagline: "Culture • History • Food",
        blurb: "Royal palaces and Indian heritage.",
        description:
            "Explore magnificent forts, royal palaces, local culture and traditional Rajasthani cuisine.",
        type: "Historical",
        typeLabel: "🏛️ Historical",
        tags: ["Historical", "Spiritual", "Shopping", "Culture", "Food", "Photography"],
        price: 25000,
        
        days: 5,
        image: img("photo-1524229321985-1e1989075d9b"),
        bestTime: "October to March",
        coordinates: { lat: 26.9124, lng: 75.7873 },
        mapName: "Rajasthan - Jaipur",
        mapDescription: "Royal palaces and Indian heritage.",
        activities: ["Amber Fort", "City Palace", "Bazaar shopping", "Rajasthani thali"],
        itinerary: [
            { title: "Arrival in Jaipur", plan: "Arrive in Jaipur, check in and enjoy a Rajasthani dinner." },
            { title: "Forts & Palaces", plan: "Amber Fort, City Palace and Hawa Mahal with time for photographs." },
            { title: "Bazaars & Food", plan: "Explore Johari and Bapu bazaars, then enjoy traditional street food." },
            { title: "Culture Day", plan: "Museums, local handicraft workshops and an evening folk performance." },
            { title: "Departure", plan: "Breakfast, last-minute shopping, checkout and departure." }
        ]
    },
    {
        id: "Kerala",
        name: "Kerala",
        title: "Kerala Nature Escape",
        tagline: "Backwaters • Nature • Relaxation",
        blurb: "Backwaters, greenery and relaxation.",
        description:
            "Experience peaceful backwaters, lush greenery, beaches and relaxing local experiences.",
        type: "Nature",
        typeLabel: "🌿 Nature",
        tags: ["Nature", "Family", "Romantic", "Relaxation", "Food"],
        price: 30000,
        
        days: 5,
        image: img("photo-1602216056096-3b40cc0c9944"),
        bestTime: "September to March",
        coordinates: { lat: 9.9312, lng: 76.2673 },
        mapName: "Kerala - Kochi",
        mapDescription: "Backwaters, nature and relaxation.",
        activities: ["Houseboat cruise", "Tea plantation walk", "Fort Kochi", "Ayurvedic spa"],
        itinerary: [
            { title: "Arrival in Kochi", plan: "Arrive, check in and walk along the Fort Kochi waterfront in the evening." },
            { title: "Hills & Tea Gardens", plan: "Travel to the hills for tea plantations, viewpoints and cool-weather walks." },
            { title: "Backwaters", plan: "Move to the backwaters and board a houseboat for a day-long cruise." },
            { title: "Beach & Relaxation", plan: "Slow morning, optional wellness session and a relaxed beach evening." },
            { title: "Departure", plan: "Breakfast, checkout and departure." }
        ]
    },
    {
        id: "Kashmir",
        name: "Kashmir",
        title: "Kashmir Paradise",
        tagline: "Valleys • Lakes • Mountains",
        blurb: "Mountains, lakes and scenic valleys.",
        description:
            "Explore beautiful valleys, mountain landscapes, lakes and unforgettable Kashmiri experiences.",
        type: "Nature",
        typeLabel: "🏔️ Nature",
        tags: ["Nature", "Romantic", "Photography", "Relaxation"],
        price: 39999,
        
        days: 6,
        image: img("photo-1506461883276-594a12b11cf3"),
        bestTime: "April to October",
        coordinates: { lat: 34.0837, lng: 74.7973 },
        mapName: "Kashmir - Srinagar",
        mapDescription: "Beautiful valleys, lakes and mountain landscapes.",
        activities: ["Dal Lake shikara ride", "Mughal gardens", "Gulmarg", "Pahalgam valley"],
        itinerary: [
            { title: "Arrival in Srinagar", plan: "Arrive, check in and take an evening shikara ride on Dal Lake." },
            { title: "Mughal Gardens", plan: "Visit the Mughal gardens and local markets, enjoy Kashmiri cuisine." },
            { title: "Gulmarg", plan: "Day trip to Gulmarg for meadows, mountain views and the gondola ride." },
            { title: "Pahalgam", plan: "Scenic drive to Pahalgam with river-side walks and photography stops." },
            { title: "Leisure Day", plan: "Relax by the lake, shop for handicrafts and dry fruits." },
            { title: "Departure", plan: "Breakfast, checkout and departure." }
        ]
    },
    {
        id: "Bali",
        name: "Bali",
        title: "Bali Romantic Escape",
        tagline: "Beaches • Temples • Romance",
        blurb: "Perfect for couples and relaxation.",
        description:
            "A relaxing international getaway featuring beaches, temples, nature and romantic experiences.",
        type: "Romantic",
        typeLabel: "❤️ Romantic",
        tags: ["Romantic", "Beach", "Relaxation", "Culture", "Photography"],
        price: 65000,
        
        days: 7,
        image: img("photo-1537996194471-e657df975ab4"),
        bestTime: "April to October",
        coordinates: { lat: -8.4095, lng: 115.1889 },
        mapName: "Bali",
        mapDescription: "Beaches, temples and romantic getaways.",
        activities: ["Ubud rice terraces", "Temple visits", "Beach clubs", "Couples spa"],
        itinerary: [
            { title: "Arrival in Bali", plan: "Arrive, transfer to your stay and unwind with a quiet dinner." },
            { title: "Ubud", plan: "Rice terraces, art markets and the Sacred Monkey Forest." },
            { title: "Temples & Culture", plan: "Visit well-known temples and watch a traditional dance performance." },
            { title: "Beach Day", plan: "Relax on the beaches of the south coast with a sunset dinner." },
            { title: "Island Excursion", plan: "Optional boat trip to a nearby island for snorkelling and viewpoints." },
            { title: "Spa & Leisure", plan: "Couples spa session, souvenir shopping and free time." },
            { title: "Departure", plan: "Breakfast, checkout and airport transfer." }
        ]
    }
];

export const destinationTypes = ["Beach", "Adventure", "Nature", "Historical", "Romantic"];

export function getDestination(id) {
    if (!id) return undefined;
    return destinations.find((d) => d.id.toLowerCase() === String(id).toLowerCase());
}

export const DEFAULT_DESTINATION_ID = "Kashmir";
