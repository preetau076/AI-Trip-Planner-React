/*
  Day-by-day itinerary for a destination.
  Uses the destination's own itinerary; if the user asked for a different
  number of days we add free "local exploration" days or trim the middle,
  always keeping the arrival day and the departure day.
*/
export function buildItinerary(destination, days) {
    const base = destination.itinerary;
    const wanted = Math.min(Math.max(days || base.length, 2), 15);

    if (wanted === base.length) return base;

    const first = base[0];
    const last = base[base.length - 1];
    const middle = base.slice(1, -1);

    if (wanted < base.length) {
        return [first, ...middle.slice(0, wanted - 2), last];
    }

    const extra = [];
    for (let i = middle.length; i < wanted - 2; i++) {
        extra.push({
            title: "Free Day — Local Exploration",
            plan: `Explore ${destination.name} at your own pace: revisit favourite spots, try local food, shop for souvenirs or simply relax.`
        });
    }
    return [first, ...middle, ...extra, last];
}
