export type EnquirySourceSection =
  | "agent"
  | "chat"
  | "deal"
  | "flight"
  | "footer"
  | "multi-centre"
  | "tailored"
  | "trust";

export type BuildEnquirySourceOptions = {
  section: EnquirySourceSection;
  pathname?: string | null;
  entityName?: string | null;
};

type BuildRouteAwareSourceOptions = {
  pathname?: string | null;
  entityName?: string | null;
};

const HOTELS_SLUG_ROUTE = /^\/hotels\/([^/]+)\/?$/;
const MULTI_CENTRE_SLUG_ROUTE = /^\/multi-centre\/([^/]+)\/?$/;

function normalizeSourceEntity(entityName?: string | null): string | undefined {
  const normalized = entityName?.trim();
  return normalized ? normalized : undefined;
}

export function normalizeSourcePath(pathname?: string | null): string {
  const normalized = String(pathname ?? "").trim().split("?")[0].trim();

  if (!normalized || normalized === "/") {
    return "homepage";
  }

  return normalized;
}

export function sanitizeEnquirySource(source?: string | null, fallback = "unknown"): string {
  const normalized = String(source ?? "").trim().split("?")[0].trim();
  return normalized || fallback;
}

export function buildEnquirySource({
  section,
  pathname,
  entityName,
}: BuildEnquirySourceOptions): string {
  const routeSource = normalizeSourcePath(pathname);
  const namedEntity = normalizeSourceEntity(entityName);

  switch (section) {
    case "footer":
      return `Footer-${routeSource}`;
    case "trust":
      return `Trust-Section ${routeSource}`;
    case "flight":
      return `Flight-${routeSource}`;
    case "agent":
      return `Agent-Section-${routeSource}`;
    case "tailored":
      return `Tailore-Make-Your-Trip ${routeSource}`;
    case "deal":
      return `Deal Page - ${namedEntity ?? routeSource}`;
    case "multi-centre":
      return `Multi Centre Page - ${namedEntity ?? routeSource}`;
    case "chat":
    default:
      return routeSource;
  }
}

export function buildRouteAwareEnquirySource({
  pathname,
  entityName,
}: BuildRouteAwareSourceOptions): string {
  const routeSource = normalizeSourcePath(pathname);
  const namedEntity = normalizeSourceEntity(entityName);
  const hotelsMatch = routeSource.match(HOTELS_SLUG_ROUTE);
  const multiCentreMatch = routeSource.match(MULTI_CENTRE_SLUG_ROUTE);

  if (hotelsMatch) {
    return buildEnquirySource({
      section: "deal",
      pathname: routeSource,
      entityName: namedEntity ?? hotelsMatch[1],
    });
  }

  if (multiCentreMatch) {
    return buildEnquirySource({
      section: "multi-centre",
      pathname: routeSource,
      entityName: namedEntity ?? multiCentreMatch[1],
    });
  }

  return routeSource;
}