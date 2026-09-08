# Hotel Booking System - Code Mapping Documentation

## Overview
This document explains the static mapping files created for converting API codes to human-readable display names in the hotel booking system.

## Created Files

### 1. `/lib/mappings/airports.ts`
**Purpose**: Maps airport codes (numeric IDs and IATA codes) to full airport names.

**Data Source**: API provider documentation (final/complete list)

**Key Functions**:
- `getAirportName(code)` - Returns full airport name
- `getAirportNameWithCode(code)` - Returns "London Gatwick (LGW)"
- `isValidAirportCode(code)` - Validates airport code exists

**Example Usage**:
```typescript
import { getAirportName } from "@/lib/mappings/airports";

// Convert code to name
getAirportName("STN")  // Returns: "London Stansted"
getAirportName("70")   // Returns: "London Gatwick"
getAirportName("-1")   // Returns: "Any London"
```

**Coverage**:
- UK airports (London + Regional): 47 airports
- Common IATA codes: 30+ codes
- Destination airports (Cyprus, Spain, Greece, Turkey, etc.)

---

### 2. `/lib/mappings/airlines.ts`
**Purpose**: Maps 2-3 letter airline IATA codes to full airline names.

**Data Source**: API provider documentation (final/complete list)

**Key Functions**:
- `getAirlineName(code)` - Returns full airline name
- `getAirlineNameWithCode(code)` - Returns "British Airways (BA)"
- `isValidAirlineCode(code)` - Validates airline code exists

**Example Usage**:
```typescript
import { getAirlineName } from "@/lib/mappings/airlines";

// Convert code to name
getAirlineName("FR")    // Returns: "Ryanair"
getAirlineName("U2")    // Returns: "easyJet"
getAirlineName("BA")    // Returns: "British Airways"
getAirlineName("EZY")   // Returns: "easyJet"
```

**Coverage**: 100+ airline codes including:
- Budget carriers (Ryanair, easyJet, Wizz Air)
- Major airlines (BA, Lufthansa, Emirates, etc.)
- Regional carriers across Europe, Asia, Middle East

---

### 3. `/lib/mappings/board-basis.ts`
**Purpose**: Maps board basis codes to full descriptions.

**Data Source**: API provider documentation (final/complete list)

**Key Functions**:
- `getBoardBasisName(code)` - Returns short name "All Inclusive"
- `getBoardBasisDescription(code)` - Returns full description
- `getBoardBasisWithDescription(code)` - Returns combined format
- `getAllBoardBasisOptions()` - Returns array of all options

**Example Usage**:
```typescript
import { getBoardBasisName, getBoardBasisWithDescription } from "@/lib/mappings/board-basis";

// Convert code to name
getBoardBasisName("AI")  // Returns: "All Inclusive"
getBoardBasisName("HB")  // Returns: "Half Board"
getBoardBasisName("BB")  // Returns: "Bed & Breakfast"

// Get with description
getBoardBasisWithDescription("AI")  
// Returns: "All Inclusive - All meals, snacks, and selected drinks included"
```

**Coverage**: 6 standard types
- RO: Room Only
- BB: Bed & Breakfast
- HB: Half Board
- FB: Full Board
- AI: All Inclusive
- SC: Self Catering

---

### 4. `/lib/mappings/duration.ts`
**Purpose**: Helper functions for formatting duration/nights display.

**Data Source**: Standard formatting conventions

**Key Functions**:
- `formatDuration(nights)` - Returns "7 Nights" or "1 Night"
- `formatDurationWithDays(nights)` - Returns "7 Nights / 8 Days"
- `formatDurationRange(min, max)` - Returns "7-14 Nights"
- `getCommonDurationOptions()` - Returns dropdown-ready array
- `parseDuration(string)` - Extracts number from various formats

**Example Usage**:
```typescript
import { formatDuration, formatDurationWithDays } from "@/lib/mappings/duration";

// Format nights
formatDuration(7)              // Returns: "7 Nights"
formatDuration(1)              // Returns: "1 Night"
formatDurationWithDays(7)      // Returns: "7 Nights / 8 Days"

// Parse from string
parseDuration("7 nights")      // Returns: 7
parseDuration("14N")           // Returns: 14
```

---

### 5. `/lib/mappings/index.ts`
**Purpose**: Central export point for all mapping utilities.

**Usage**:
```typescript
// Import all from single file
import {
  getAirportName,
  getAirlineName,
  getBoardBasisName,
  formatDuration,
} from "@/lib/mappings";
```

---

## Integration with Hotel Page

### Updated Files:

#### `/lib/hotel-utils.ts`
Added new helper functions that use mappings:

```typescript
// New functions
formatAirport(code)      // Uses getAirportName()
formatAirline(code)      // Uses getAirlineName()
formatNights(nights)     // Uses formatDuration()

// Updated function
getBoardBasisText(code)  // Now uses getBoardBasisName()

// New function for dropdown options
prepareFilterOptionsForDisplay(deal)  
// Returns: { airports: string[], boardBases: string[], durations: string[] }
// All with proper display names
```

#### `/app/hotels/[slug]/page.tsx`
**Changes Made**:
1. Imported new mapping helper functions
2. Created `displayFilters` using `prepareFilterOptionsForDisplay()`
3. Updated flight details to show proper airline/airport names:
   ```typescript
   flightNumber: `${formatAirline(supplier)} - ${flightNumber}`
   departureCode: `${formatAirport(code)} (${code})`
   ```
4. Removed hardcoded mock arrays (`airports`, `boardBases`, `durations`)
5. Passed real API data with display names to `HolidayCalendar` component

#### `/components/hotels/HolidayCalendar.tsx`
**Changes Made**:
- Updated `onFilterChange` type signature to match parent callback
- Now receives properly formatted display names in dropdown options

---

## Display Format Examples

### Before (showing codes):
- Departure: "STN"
- Airline: "FR"
- Board Basis: "AI"
- Duration: "7"

### After (showing names):
- Departure: "London Stansted (STN)"
- Airline: "Ryanair - FR123"
- Board Basis: "All Inclusive"
- Duration: "7 Nights"

---

## API Response Processing Flow

```
API Response (codes)
    ↓
extractFilterOptions(deal)  // Extracts raw API data
    ↓
prepareFilterOptionsForDisplay(deal)  // Converts to display names
    ↓
displayFilters = {
  airports: ["London Stansted", "London Gatwick"],
  boardBases: ["All Inclusive", "Half Board"],
  durations: ["7 Nights", "14 Nights"]
}
    ↓
HolidayCalendar component (shows proper names in dropdowns)
```

---

## Benefits

1. **User Experience**: Users see readable names instead of cryptic codes
2. **Centralized Data**: Single source of truth for all code mappings
3. **Type Safety**: TypeScript types ensure correct usage
4. **Maintainability**: Easy to update if API provider adds new codes
5. **Consistency**: Same formatting used throughout application
6. **Validation**: Helper functions to check if codes are valid

---

## Notes

- **Data Source**: All mappings from official API provider documentation (PDF)
- **Completeness**: User confirmed: "this is the final list shared by api provider so beyond this we will not get any new"
- **Future Updates**: If new codes are added by API provider, update the respective mapping file
- **Case Handling**: Airline and board basis codes are case-insensitive (converted to uppercase)
- **Fallback Behavior**: If code not found, functions return the original code instead of throwing errors

---

## Testing Checklist

- [x] Airport codes convert correctly (numeric IDs and IATA codes)
- [x] Airline codes convert correctly (2-3 letter codes)
- [x] Board basis codes convert correctly (standard 2-letter codes)
- [x] Duration formatting handles singular/plural correctly
- [x] Dropdown options display proper names
- [x] Flight summary shows proper airline/airport names
- [x] Invalid codes fallback gracefully (return original code)
- [x] TypeScript types are correct (no compilation errors)

---

## File Structure

```
lib/
└── mappings/
    ├── index.ts           # Central export point
    ├── airports.ts        # Airport code mappings
    ├── airlines.ts        # Airline code mappings
    ├── board-basis.ts     # Board basis mappings
    └── duration.ts        # Duration formatting helpers
```

---

## Quick Reference

| Code Type | Import From | Main Function | Return Example |
|-----------|-------------|---------------|----------------|
| Airport | `mappings/airports` | `getAirportName(code)` | "London Stansted" |
| Airline | `mappings/airlines` | `getAirlineName(code)` | "Ryanair" |
| Board Basis | `mappings/board-basis` | `getBoardBasisName(code)` | "All Inclusive" |
| Duration | `mappings/duration` | `formatDuration(nights)` | "7 Nights" |
