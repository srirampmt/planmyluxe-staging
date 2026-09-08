import type { HomePage, HomePageResponse } from "./homepage";

// Destinations homepage currently shares the same response shape as the homepage.
// Keeping this as a dedicated type file lets us evolve it independently later.
export type DestinationsHomepageResponse = HomePageResponse;
export type DestinationsHomepagePage = HomePage;
