export type ClientUtmParams = {
  utm_details?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_id?: string;
  utmid?: string;
  utm_is_organic?: string;
};

function normalizeUtmValue(value: string | null | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export function getCookieValue(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;

  const prefix = `${encodeURIComponent(name)}=`;
  const found = document.cookie.split("; ").find((row) => row.startsWith(prefix));
  if (!found) return undefined;

  return normalizeUtmValue(decodeURIComponent(found.slice(prefix.length)));
}

export function getUtmFromCookies(): ClientUtmParams {
  const utmId = getCookieValue("utm_id") || getCookieValue("utmid");

  return {
    utm_details: getCookieValue("utm_details"),
    utm_source: getCookieValue("utm_source"),
    utm_medium: getCookieValue("utm_medium"),
    utm_campaign: getCookieValue("utm_campaign"),
    utm_id: utmId,
    utmid: utmId,
    utm_is_organic: getCookieValue("utm_is_organic"),
  };
}

export function getUtmFromUrl(search?: string): ClientUtmParams {
  if (typeof window === "undefined" && typeof search === "undefined") {
    return {};
  }

  const params = new URLSearchParams(search ?? window.location.search);
  const utmId = normalizeUtmValue(params.get("utm_id")) || normalizeUtmValue(params.get("utmid"));

  return {
    utm_source: normalizeUtmValue(params.get("utm_source")),
    utm_medium: normalizeUtmValue(params.get("utm_medium")),
    utm_campaign: normalizeUtmValue(params.get("utm_campaign")),
    utm_id: utmId,
    utmid: utmId,
    utm_is_organic: normalizeUtmValue(params.get("utm_is_organic")),
    utm_details: normalizeUtmValue(params.get("utm_details")),
  };
}

export function mergeUtmParams(...sources: ClientUtmParams[]): ClientUtmParams {
  return sources.reduce<ClientUtmParams>((merged, source) => {
    Object.entries(source).forEach(([key, value]) => {
      if (value) {
        merged[key as keyof ClientUtmParams] = value;
      }
    });

    return merged;
  }, {});
}

export function getSubmissionUtmParams(search?: string): ClientUtmParams {
  return mergeUtmParams(getUtmFromCookies(), getUtmFromUrl(search));
}

export function appendUtmParamsToFormData(formData: FormData, utm: ClientUtmParams): void {
  if (utm.utm_source) formData.set("utm_source", utm.utm_source);
  if (utm.utm_medium) formData.set("utm_medium", utm.utm_medium);
  if (utm.utm_campaign) formData.set("utm_campaign", utm.utm_campaign);
  if (utm.utm_id) formData.set("utm_id", utm.utm_id);
  if (utm.utmid) formData.set("utmid", utm.utmid);
  if (utm.utm_is_organic) formData.set("utm_is_organic", utm.utm_is_organic);
  if (utm.utm_details) formData.set("utm_details", utm.utm_details);
}