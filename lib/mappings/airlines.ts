/**
 * Airline Code to Display Name Mappings
 * Complete list from API provider documentation
 */

export const AIRLINE_NAMES: Record<string, string> = {
  "2L": "Helvetic Airways",
  "3O": "Air Arabia Maroc",
  "3U": "Sichuan Airlines",
  "5W": "Wizz Air Abu Dhabi",
  "6H": "Israir",
  "6N": "Norse Atlantic Airways UK",
  "8Q": "Onur Air",
  "9I": "Alliance Air",
  "9W": "Jet Airways",
  "A3": "Aegean Airlines",
  "A9": "Georgian Airways",
  "AA": "American Airlines",
  "AC": "Air Canada",
  "AF": "Air France",
  "AI": "Air India",
  "AR": "Aerolineas Argentinas",
  "AT": "Royal Air Maroc",
  "AV": "Avianca",
  "AY": "Finnair",
  "AZ": "ITA Airways",
  "BA": "British Airways",
  "BI": "Royal Brunei Airlines",
  "BT": "Air Baltic",
  "BZ": "Blue Bird Airways",
  "CA": "Air China",
  "CJ": "BA CityFlyer",
  "CM": "Copa Airlines",
  "CX": "Cathay Pacific",
  "CZ": "China Southern Airlines",
  "DE": "Condor",
  "DL": "Delta Air Lines",
  "DY": "Norwegian Air Shuttle",
  "E2": "eSky",
  "E4": "Enter Air",
  "EI": "Aer Lingus",
  "EK": "Emirates",
  "ET": "Ethiopian Airlines",
  "EW": "Eurowings",
  "EY": "Etihad Airways",
  "EZY": "easyJet",
  "FB": "Bulgaria Air",
  "FI": "Icelandair",
  "FR": "Ryanair",
  "FZ": "flydubai",
  "GA": "Garuda Indonesia",
  "GF": "Gulf Air",
  "GQ": "Sky Express",
  "HU": "Hainan Airlines",
  "HV": "Transavia",
  "IB": "Iberia",
  "IR": "Iran Air",
  "JL": "Japan Airlines",
  "JU": "Air Serbia",
  "KE": "Korean Air",
  "KL": "KLM Royal Dutch Airlines",
  "KM": "Air Malta",
  "KQ": "Kenya Airways",
  "KU": "Kuwait Airways",
  "LA": "LATAM Airlines",
  "LH": "Lufthansa",
  "LO": "LOT Polish Airlines",
  "LS": "Jet2",
  "LX": "Swiss International Air Lines",
  "LY": "El Al",
  "ME": "Middle East Airlines",
  "MH": "Malaysia Airlines",
  "MS": "EgyptAir",
  "MU": "China Eastern Airlines",
  "NH": "All Nippon Airways",
  "NI": "Portugalia",
  "NZ": "Air New Zealand",
  "OK": "Czech Airlines",
  "OM": "MIAT Mongolian Airlines",
  "OS": "Austrian Airlines",
  "OU": "Croatia Airlines",
  "OV": "Estonian Air",
  "PC": "Pegasus Airlines",
  "PK": "Pakistan International Airlines",
  "PS": "Ukraine International Airlines",
  "QF": "Qantas",
  "QR": "Qatar Airways",
  "QS": "Travel Service Airlines",
  "RJ": "Royal Jordanian",
  "RO": "Tarom",
  "S7": "S7 Airlines",
  "SA": "South African Airways",
  "SK": "Scandinavian Airlines (SAS)",
  "SN": "Brussels Airlines",
  "SQ": "Singapore Airlines",
  "SU": "Aeroflot",
  "SV": "Saudi Arabian Airlines",
  "T7": "Twin Jet",
  "TG": "Thai Airways International",
  "TK": "Turkish Airlines",
  "TOM": "TUI Airways",
  "TP": "TAP Air Portugal",
  "U2": "easyJet",
  "UA": "United Airlines",
  "UX": "Air Europa",
  "VY": "Vueling Airlines",
  "W6": "Wizz Air",
  "WS": "WestJet",
  "WY": "Oman Air",
  "XC": "Corendon Airlines",
  "XL": "LATAM Ecuador",
  "XQ": "SunExpress",
  "ZB": "Monarch Airlines",
};

/**
 * Get airline display name from code
 * @param code IATA airline code (2 letters or 3 letters)
 * @returns Full airline name or code if not found
 */
export function getAirlineName(code: string): string {
  const upperCode = code?.toUpperCase() || "";
  return AIRLINE_NAMES[upperCode] || code;
}

/**
 * Get airline name with code in parentheses
 * @param code Airline code
 * @returns "British Airways (BA)" or just code if not found
 */
export function getAirlineNameWithCode(code: string): string {
  const name = getAirlineName(code);
  if (name === code) return code;
  return `${name} (${code})`;
}

/**
 * Check if airline code exists in mappings
 */
export function isValidAirlineCode(code: string): boolean {
  return code?.toUpperCase() in AIRLINE_NAMES;
}
