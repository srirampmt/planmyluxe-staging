/**
 * Central export point for all mapping utilities
 * Import all mapping functions from this single file
 */

// Airport mappings
export {
  AIRPORT_NAMES,
  getAirportName,
  getAirportNameWithCode,
  isValidAirportCode,
} from "./airports";

// Airline mappings
export {
  AIRLINE_NAMES,
  getAirlineName,
  getAirlineNameWithCode,
  isValidAirlineCode,
} from "./airlines";

// Board basis mappings
export {
  BOARD_BASIS_NAMES,
  BOARD_BASIS_DESCRIPTIONS,
  BOARD_BASIS_ID_TO_CODE,
  getBoardBasisCode,
  getBoardBasisIdFromCode,
  getBoardBasisName,
  getBoardBasisDescription,
  getBoardBasisWithDescription,
  isValidBoardBasisCode,
  getAllBoardBasisOptions,
  parseAvailableBoardBasis,
} from "./board-basis";

// Duration helpers
export {
  formatDuration,
  formatDurationWithDays,
  formatDurationRange,
  COMMON_DURATIONS,
  getCommonDurationOptions,
  parseDuration,
  isValidDuration,
} from "./duration";

// Destination mappings (flat /client/api/destinations/ shape)
export {
  getDestinationLevel,
  isSelectableDestinationRow,
  getDestinationLabel,
  getDestinationBreadcrumb,
  makeDestinationSelection,
  isDestinationSelection,
  encodeDestinationParam,
  decodeDestinationParam,
} from "./destinations";
export type { DestinationLevel, DestinationRow, DestinationSelection } from "./destinations";
