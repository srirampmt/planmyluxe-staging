/**
 * Airport Code to Display Name Mappings
 * Complete list from API provider documentation
 */

export const AIRPORT_NAMES: Record<string, string> = {
  // Any/All Options
  "-1": "Any London",
  "-2": "Any Midland",
  "-3": "Any Scotland",
  "-5": "Any Eurostar",
  "-7": "Any Northern Ireland",
  "-8": "Any Ireland (South)",
  "-9": "Any East Anglia",
  "-10": "Any North East / Yorkshire",
  "-11": "Any North West",
  "-12": "Any South East",
  "-13": "Any South West/Wales",
  "69": "London City (LCY)",
  "70": "Gatwick (LGW)",
  "71": "Heathrow (LHR)",
  "72": "Luton (LTN)",
  
  // 75 is used by some provider feeds as "Londonderry"; keep London City on 69/LCY.
  "75": "Londonderry",
  
  // UK Airports - Regional
  // NOTE: Provider numeric IDs can differ between feeds.
  // The mappings below are aligned with the current provider list used by the dropdowns.
  "1": "Aberdeen",
  "2": "Belfast International",
  "3": "Belleek",
  "4": "Aberdeen (ABZ)",
  "5": "Birmingham",
  "6": "Blackpool",
  "7": "Bournemouth",
  "9": "Belfast-city (BHD)",
  "10": "Belfast-intl (BFS)",
  "11": "Carlisle",
  "12": "Coventry",
  "13": "Doncaster Sheffield",
  "14": "Birmingham (BHX)",
  "15": "Dundee",
  "16": "Blackpool (BLK)",
  "17": "Bournemouth (BOH)",
  "18": "Edinburgh",
  "19": "Bristol (BRS)",
  "20": "Farnborough",
  "21": "Glasgow",
  "22": "Glasgow Prestwick",
  "23": "Gloucester Cheltenham",
  "24": "Hawarden",
  "25": "Cardiff (CWL)",
  "26": "Inverness",
  "27": "Isle of Man",
  "28": "Kirkwall",
  "29": "Cork (ORK)",
  "30": "Coventry (CVT)",
  "31": "Liverpool",
  "32": "Doncaster Sheffield (DSA)",
  "33": "Manchester",
  "34": "Dublin (DUB)",
  "35": "Dundee (DND)",
  "36": "East Midlands (EMA)",
  "37": "Edinburgh (EDI)",
  "38": "Oxford",
  "39": "Exeter (EXT)",
  "40": "Robin Hood",
  "41": "Southampton",
  "42": "Stornoway",
  "43": "Sumburgh",
  "44": "Swansea",
  "45": "Glasgow (GLA)",
  "46": "Prestwick (PIK)",
  "47": "Wick",

  // Departures (provider IDs)
  "55": "Humberside",
  "56": "Inverness (INV)",
  "63": "Jersey",
  "66": "Leeds Bradford (LBA)",
  "67": "Liverpool (LPL)",
  "73": "Southend (SEN)",
  "74": "Stansted (STN)",
  "77": "Manchester (MAN)",
  "80": "Newcastle (NCL)",
  "81": "Newquay (NQY)",
  "84": "Norwich (NWI)",
  "88": "Plymouth (PLY)",
  "95": "Southampton (SOU)",
  "99": "Teesside (MME)",
  "220": "Shannon (SNN)",
  "221": "Kent International (MSE)",
  
  // Common IATA Codes (for flight data)
  "LGW": "Gatwick",
  "LHR": "Heathrow",
  "LTN": "Luton",
  "STN": "Stansted",
  "LCY": "London City",
  "SEN": "Southend",
  "BHX": "Birmingham",
  "MAN": "Manchester",
  "EMA": "East Midlands",
  "NCL": "Newcastle",
  "GLA": "Glasgow",
  "EDI": "Edinburgh",
  "BRS": "Bristol",
  "LBA": "Leeds Bradford",
  "BFS": "Belfast International",
  "BHD": "Belfast City",
  "ABZ": "Aberdeen",
  "LPL": "Liverpool",
  "CWL": "Cardiff",
  "BOH": "Bournemouth",
  "EXT": "Exeter",
  "NQY": "Newquay",
  "SOU": "Southampton",
  "DSA": "Doncaster Sheffield",
  "PIK": "Glasgow Prestwick",
  "INV": "Inverness",
  "IOM": "Isle of Man",
  "CVT": "Coventry",
  "HUY": "Humberside",
  "DND": "Dundee",
  "LDY": "Londonderry",
  "ORK": "Cork",
  "DUB": "Dublin",
  "SNN": "Shannon",
  "NWI": "Norwich",
  "MME": "Teesside",
  "BLK": "Blackpool",
  "JER": "Jersey",
  "MSE": "Kent International",
  "PLY": "Plymouth",
  
  // Destination Airports (Cyprus)
  "PFO": "Paphos",
  "LCA": "Larnaca",
  
  // Other European Destinations
  "ALC": "Alicante",
  "AGP": "Malaga",
  "PMI": "Palma de Mallorca",
  "BCN": "Barcelona",
  "MAD": "Madrid",
  "FAO": "Faro",
  "HER": "Heraklion",
  "CHQ": "Chania",
  "RHO": "Rhodes",
  "CFU": "Corfu",
  "ZTH": "Zakynthos",
  "ATH": "Athens",
  "DLM": "Dalaman",
  "AYT": "Antalya",
  "BJV": "Bodrum",
  "SSH": "Sharm El Sheikh",
  "HRG": "Hurghada",
  "DXB": "Dubai",
  "AUH": "Abu Dhabi",
};

/**
 * Get airport display name from code
 * @param code Airport code (either numeric ID or IATA code)
 * @returns Full airport name or code if not found
 */
export function getAirportName(code: string | number): string {
  const codeStr = String(code);
  return AIRPORT_NAMES[codeStr] || codeStr;
}

/**
 * Get airport name with code in parentheses
 * @param code Airport code
 * @returns "London Gatwick (LGW)" or just code if not found
 */
export function getAirportNameWithCode(code: string): string {
  const name = getAirportName(code);
  if (name === code) return code;
  return `${name}`;
}

/**
 * Check if airport code exists in mappings
 */
export function isValidAirportCode(code: string | number): boolean {
  return String(code) in AIRPORT_NAMES;
}

export const IATA_TO_ID: Record<string, string> = {
  'LCY': '69',
  'LGW': '70',
  'LHR': '71',
  'LTN': '72',
  'STN': '74',
  'BHX': '14',
  'CVT': '30',
  'DSA': '32',
  'EMA': '36',
  'HUY': '55',
  'LBA': '66',
  'ABZ': '4',
  'DND': '35',
  'EDI': '37',
  'GLA': '45',
  'PIK': '46',
  'INV': '56',
  'BHD': '9',
  'BFS': '10',
  'LDY': '75',
  'ORK': '29',
  'DUB': '34',
  'SNN': '220',
  'NWI': '84',
  'NCL': '80',
  'MME': '99',
  'BLK': '16',
  'LPL': '67',
  'MAN': '77',
  'JER': '63',
  'SEN': '73',
  'SOU': '95',
  'MSE': '221',
  'BOH': '17',
  'BRS': '19',
  'CWL': '25',
  'EXT': '39',
  'NQY': '81',
  'PLY': '88',
};

export function resolveAirportIataToId(iata: string): string {
  const clean = iata.trim().toUpperCase();
  return IATA_TO_ID[clean] || clean;
}

export const ID_TO_IATA: Record<string, string> = Object.fromEntries(
  Object.entries(IATA_TO_ID).map(([iata, id]) => [id, iata])
);

export function resolveAirportIdToIata(id: string): string {
  const clean = id.trim();
  return ID_TO_IATA[clean] || clean;
}
