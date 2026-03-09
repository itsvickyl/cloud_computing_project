export const countryList = [
  "United States",
  "Canada", 
  "United Kingdom",
  "Germany",
  "France",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Switzerland",
  "Australia",
  "New Zealand",
  "Japan",
  "Singapore",
  "South Korea",
  "India",
  "Remote"
];

export function getFlagEmoji(country: string): string {
  const countryFlags: Record<string, string> = {
    "United States": "🇺🇸",
    "Canada": "🇨🇦", 
    "United Kingdom": "🇬🇧",
    "Germany": "🇩🇪",
    "France": "🇫🇷",
    "Netherlands": "🇳🇱",
    "Sweden": "🇸🇪",
    "Norway": "🇳🇴", 
    "Denmark": "🇩🇰",
    "Switzerland": "🇨🇭",
    "Australia": "🇦🇺",
    "New Zealand": "🇳🇿",
    "Japan": "🇯🇵",
    "Singapore": "🇸🇬",
    "South Korea": "🇰🇷",
    "India": "🇮🇳",
    "Remote": "🌐"
  };

  if (country.includes(", CA") || country.includes("California")) {
    return "🇺🇸";
  }
  if (country.includes(", NY") || country.includes("New York")) {
    return "🇺🇸"; 
  }
  if (country.includes(", TX") || country.includes("Texas")) {
    return "🇺🇸";
  }
  if (country.includes(", WA") || country.includes("Washington")) {
    return "🇺🇸";
  }
  if (country.includes(", MA") || country.includes("Massachusetts")) {
    return "🇺🇸";
  }
  
  return countryFlags[country] || "🌍";
}