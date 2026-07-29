export function getTrafficBadge(traffic) {
  const map = { Low: "badge-green", Moderate: "badge-orange", Heavy: "badge-red" };
  return map[traffic] ?? "badge-gray";
}

export function getWeatherBadge(weather) {
  const map = {
    Sunny: "badge-yellow",
    Cloudy: "badge-gray",
    Rain:   "badge-blue",
    Fog:    "badge-purple",
  };
  return map[weather] ?? "badge-gray";
}
