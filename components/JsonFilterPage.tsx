"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type JsonFilterRecord = {
  totalPrice?: number | string;
  tradingNameId?: string;
  preferred?: boolean;
  premium?: boolean;
  quoteReference?: string;
  hotel?: {
    checkInDate?: string;
    duration?: number | string;
    boardBasis?: string;
    rating?: string;
    hotelName?: string;
    resortName?: string;
    hotelId?: string | number;
    clientHotelId?: string | number;
    giataId?: string | number;
    airportCode?: string;
    rooms?: Array<Record<string, unknown>>;
  };
  flight?: Record<string, unknown>;
  [key: string]: unknown;
};

export type JsonFilterPayload = {
  Status?: string;
  Count?: number;
  Results?: JsonFilterRecord[];
  [key: string]: unknown;
};

type JsonFilterPageProps = {
  initialPayload: JsonFilterPayload;
};

type FilterState = {
  checkInDate: string;
  hotelName: string;
  boardBasis: string;
  hotelId: string;
  giataId: string;
};

type NormalizedResult = {
  id: string;
  record: JsonFilterRecord;
  quoteReference: string;
  checkInDate: string;
  hotelNameValue: string;
  hotelNameDisplay: string;
  boardBasis: string;
  hotelId: string;
  giataId: string;
  resortName: string;
  durationLabel: string;
  totalPriceLabel: string;
};

const EMPTY_FILTERS: FilterState = {
  checkInDate: "",
  hotelName: "",
  boardBasis: "",
  hotelId: "",
  giataId: "",
};

const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

const priceFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const asTrimmedString = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const decodeHtmlEntities = (value: string): string => {
  return value.replace(/&(#x?[0-9a-fA-F]+|amp|lt|gt|quot|apos|nbsp);/g, (match, token) => {
    if (token in ENTITY_MAP) {
      return ENTITY_MAP[token];
    }

    if (token.startsWith("#x") || token.startsWith("#X")) {
      const codePoint = Number.parseInt(token.slice(2), 16);

      try {
        return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
      } catch {
        return match;
      }
    }

    if (token.startsWith("#")) {
      const codePoint = Number.parseInt(token.slice(1), 10);

      try {
        return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
      } catch {
        return match;
      }
    }

    return match;
  });
};

const formatPrice = (value: number | null): string => {
  if (value === null) {
    return "N/A";
  }

  return priceFormatter.format(value);
};

const getDistinctOptions = (values: string[]): string[] => {
  return Array.from(new Set(values.filter(Boolean))).sort((left, right) => {
    return left.localeCompare(right, "en-GB", {
      numeric: true,
      sensitivity: "base",
    });
  });
};

const getDurationLabel = (value: unknown): string => {
  const duration = toNumber(value);

  if (duration === null) {
    return "";
  }

  return `${duration} night${duration === 1 ? "" : "s"}`;
};

const coercePayload = (value: unknown): JsonFilterPayload => {
  if (Array.isArray(value)) {
    return {
      Status: "",
      Count: value.length,
      Results: value as JsonFilterRecord[],
    };
  }

  if (!value || typeof value !== "object") {
    throw new Error("Paste either the full payload object or an array of result objects.");
  }

  const source = value as Record<string, unknown>;
  const resultsCandidate = source.Results ?? source.results;

  if (!Array.isArray(resultsCandidate)) {
    throw new Error("JSON object must contain a Results array, or paste an array directly.");
  }

  const status = asTrimmedString(source.Status ?? source.status);
  const count = typeof source.Count === "number" ? source.Count : resultsCandidate.length;

  return {
    ...source,
    Status: status,
    Count: count,
    Results: resultsCandidate as JsonFilterRecord[],
  };
};

export default function JsonFilterPage({ initialPayload }: JsonFilterPageProps) {
  const initialJsonText = useMemo(() => JSON.stringify(initialPayload, null, 2), [initialPayload]);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [jsonText, setJsonText] = useState(initialJsonText);
  const [jsonError, setJsonError] = useState("");
  const [payload, setPayload] = useState<JsonFilterPayload>(() => coercePayload(initialPayload));

  const results = useMemo(() => {
    return Array.isArray(payload.Results) ? payload.Results : [];
  }, [payload]);

  const totalCount = results.length;
  const status = asTrimmedString(payload.Status);

  const normalizedResults = useMemo<NormalizedResult[]>(() => {
    return results.map((record, index) => {
      const hotel = record.hotel ?? {};
      const quoteReference = asTrimmedString(record.quoteReference) || `record-${index + 1}`;
      const hotelNameRaw = asTrimmedString(hotel.hotelName);
      const hotelNameDisplay = decodeHtmlEntities(hotelNameRaw) || "Unknown hotel";
      const hotelNameValue = hotelNameDisplay.replace(/\s+/g, " ").trim();
      const hotelId = asTrimmedString(hotel.hotelId);

      return {
        id: `${quoteReference}-${hotelId || "hotel"}-${index}`,
        record,
        quoteReference,
        checkInDate: asTrimmedString(hotel.checkInDate),
        hotelNameValue,
        hotelNameDisplay,
        boardBasis: asTrimmedString(hotel.boardBasis),
        hotelId,
        giataId: asTrimmedString(hotel.giataId),
        resortName: decodeHtmlEntities(asTrimmedString(hotel.resortName)).replace(/\s+/g, " ").trim(),
        durationLabel: getDurationLabel(hotel.duration),
        totalPriceLabel: formatPrice(toNumber(record.totalPrice)),
      };
    });
  }, [results]);

  const boardBasisOptions = useMemo(() => {
    return getDistinctOptions(normalizedResults.map((item) => item.boardBasis));
  }, [normalizedResults]);

  const hotelNameOptions = useMemo(() => {
    const availableResults = normalizedResults.filter((item) => {
      if (filters.checkInDate && item.checkInDate !== filters.checkInDate) {
        return false;
      }

      if (filters.boardBasis && item.boardBasis !== filters.boardBasis) {
        return false;
      }

      if (filters.hotelId && item.hotelId !== filters.hotelId) {
        return false;
      }

      if (filters.giataId && item.giataId !== filters.giataId) {
        return false;
      }

      return true;
    });

    return getDistinctOptions(availableResults.map((item) => item.hotelNameValue));
  }, [filters.boardBasis, filters.checkInDate, filters.giataId, filters.hotelId, normalizedResults]);

  const hotelIdOptions = useMemo(() => {
    return getDistinctOptions(normalizedResults.map((item) => item.hotelId));
  }, [normalizedResults]);

  const giataIdOptions = useMemo(() => {
    return getDistinctOptions(normalizedResults.map((item) => item.giataId));
  }, [normalizedResults]);

  const filteredResults = useMemo(() => {
    return normalizedResults.filter((item) => {
      if (filters.checkInDate && item.checkInDate !== filters.checkInDate) {
        return false;
      }

      if (filters.hotelName && item.hotelNameValue !== filters.hotelName) {
        return false;
      }

      if (filters.boardBasis && item.boardBasis !== filters.boardBasis) {
        return false;
      }

      if (filters.hotelId && item.hotelId !== filters.hotelId) {
        return false;
      }

      if (filters.giataId && item.giataId !== filters.giataId) {
        return false;
      }

      return true;
    });
  }, [filters.boardBasis, filters.checkInDate, filters.giataId, filters.hotelId, filters.hotelName, normalizedResults]);

  useEffect(() => {
    const visibleIds = new Set(filteredResults.map((item) => item.id));

    setOpenItems((current) => current.filter((itemId) => visibleIds.has(itemId)));
  }, [filteredResults]);

  useEffect(() => {
    if (!filters.hotelName) {
      return;
    }

    if (!hotelNameOptions.includes(filters.hotelName)) {
      setFilters((current) => ({
        ...current,
        hotelName: "",
      }));
    }
  }, [filters.hotelName, hotelNameOptions]);

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter((value) => value.trim().length > 0).length;
  }, [filters]);

  const matchesLabel = filteredResults.length === 1 ? "1 match" : `${filteredResults.length} matches`;
  const inputClass =
    "w-full min-h-[50px] rounded-[10px] border border-[#d7c7d2] bg-white px-4 py-3 text-[15px] text-[#333333] outline-none transition focus:border-[#cb2187]";
  const labelClass = "mb-2 block text-[13px] font-semibold text-[#4c4c4c]";
  const summaryCardClass = "rounded-[14px] border border-[#ecd6e5] bg-white px-5 py-4 shadow-[0_10px_30px_rgba(203,33,135,0.06)]";

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetFilterView = () => {
    setFilters({ ...EMPTY_FILTERS });
    setOpenItems([]);
  };

  const applyJson = () => {
    const trimmedJsonText = jsonText.trim();

    if (!trimmedJsonText) {
      setPayload({
        Status: "",
        Count: 0,
        Results: [],
      });
      setJsonError("");
      resetFilterView();
      return;
    }

    try {
      const parsedValue = JSON.parse(trimmedJsonText);
      const nextPayload = coercePayload(parsedValue);

      setPayload(nextPayload);
      setJsonError("");
      resetFilterView();
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : "Unable to parse the pasted JSON.");
    }
  };

  const clearFilters = () => {
    resetFilterView();
  };

  const clearJson = () => {
    setJsonText("");
    setPayload({
      Status: "",
      Count: 0,
      Results: [],
    });
    setJsonError("");
    resetFilterView();
  };

  return (
    <section className="relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] w-screen bg-[radial-gradient(circle_at_top_right,_#FCECF6_0%,_#FFFFFF_48%,_#FFF8FC_100%)] font-['Montserrat'] py-4 md:py-10">
      <div className="mx-auto w-full max-w-[1440px] px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#CB2187]">
                test.json filter tool
              </p>
              <h1 className="text-[28px] font-semibold leading-[115%] text-[#4c4c4c] md:text-[42px]">
                Filter offers by any optional combination
              </h1>
              <p className="mt-3 max-w-[780px] text-[14px] leading-[170%] text-[#595859] md:text-[16px]">
                Check-in date, hotel name, board basis, hotel ID, and GIATA ID are all optional. Leave any field blank to ignore it.
              </p>
              {status ? (
                <p className="mt-3 inline-flex rounded-full bg-[#FBE8F4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#CB2187]">
                  Source status: {status}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={clearFilters}
              disabled={activeFilterCount === 0}
              className="inline-flex min-h-[48px] items-center justify-center rounded-[10px] border border-[#CB2187] bg-white px-5 py-3 text-[14px] font-semibold text-[#CB2187] transition hover:bg-[#FFF1F8] disabled:cursor-not-allowed disabled:border-[#d9b6cb] disabled:text-[#d9b6cb]"
            >
              Clear all filters
            </button>
          </div>

          <div className="mb-8 rounded-[18px] border border-[#ecd6e5] bg-white p-5 shadow-[0_14px_40px_rgba(203,33,135,0.06)] md:p-6">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-[20px] font-semibold text-[#4c4c4c]">Paste or edit JSON</h2>
                <p className="mt-1 text-[14px] leading-[170%] text-[#595859]">
                  Paste the full payload or just an array of records. You can also remove records directly here, then apply the updated JSON.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={applyJson}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-[10px] bg-[#CB2187] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#aa1b71]"
                >
                  Apply JSON
                </button>

                <button
                  type="button"
                  onClick={clearJson}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-[10px] border border-[#CB2187] bg-white px-5 py-3 text-[14px] font-semibold text-[#CB2187] transition hover:bg-[#FFF1F8]"
                >
                  Clear JSON
                </button>
              </div>
            </div>

            <textarea
              id="json-editor"
              value={jsonText}
              onChange={(event) => setJsonText(event.target.value)}
              placeholder='Paste JSON here, for example {"Results": [...]} or [...]'
              className="min-h-[260px] w-full rounded-[14px] border border-[#d7c7d2] bg-[#fffafc] p-4 font-mono text-[12px] leading-[165%] text-[#2f2230] outline-none transition focus:border-[#cb2187]"
              spellCheck={false}
            />

            {jsonError ? (
              <p className="mt-3 rounded-[10px] border border-[#f2c2d8] bg-[#fff1f7] px-4 py-3 text-[13px] font-medium text-[#a32069]">
                {jsonError}
              </p>
            ) : (
              <p className="mt-3 text-[13px] text-[#6d5b67]">
                Loaded dataset currently contains {totalCount.toLocaleString("en-GB")} record{totalCount === 1 ? "" : "s"}.
              </p>
            )}
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label>
              <span className={labelClass}>Check-in date</span>
              <input
                id="check-in-date"
                type="date"
                value={filters.checkInDate}
                onChange={(event) => updateFilter("checkInDate", event.target.value)}
                className={inputClass}
              />
            </label>

            <label>
              <span className={labelClass}>Hotel name</span>
              <select
                id="hotel-name"
                value={filters.hotelName}
                onChange={(event) => updateFilter("hotelName", event.target.value)}
                className={inputClass}
              >
                <option value="">All hotel names</option>
                {hotelNameOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className={labelClass}>Board basis</span>
              <select
                id="board-basis"
                value={filters.boardBasis}
                onChange={(event) => updateFilter("boardBasis", event.target.value)}
                className={inputClass}
              >
                <option value="">All board bases</option>
                {boardBasisOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className={labelClass}>Hotel ID</span>
              <select
                id="hotel-id"
                value={filters.hotelId}
                onChange={(event) => updateFilter("hotelId", event.target.value)}
                className={inputClass}
              >
                <option value="">All hotel IDs</option>
                {hotelIdOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className={labelClass}>GIATA ID</span>
              <select
                id="giata-id"
                value={filters.giataId}
                onChange={(event) => updateFilter("giataId", event.target.value)}
                className={inputClass}
              >
                <option value="">All GIATA IDs</option>
                {giataIdOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className={summaryCardClass}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#9A7D90]">Total records</p>
              <p className="mt-2 text-[30px] font-semibold leading-none text-[#4c4c4c]">{totalCount.toLocaleString("en-GB")}</p>
            </div>

            <div className={summaryCardClass}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#9A7D90]">Active filters</p>
              <p className="mt-2 text-[30px] font-semibold leading-none text-[#4c4c4c]">{activeFilterCount}</p>
            </div>

            <div className={summaryCardClass}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#9A7D90]">Matches</p>
              <p className="mt-2 text-[30px] font-semibold leading-none text-[#CB2187]">{filteredResults.length.toLocaleString("en-GB")}</p>
            </div>
          </div>

          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-[22px] font-semibold text-[#4c4c4c]">Matching records</h2>
              <p className="mt-1 text-[14px] text-[#595859]">{matchesLabel}. Expand any item to inspect the full JSON payload.</p>
            </div>
          </div>

          {filteredResults.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-[#d6bfd0] bg-white px-6 py-10 text-center">
              <h3 className="text-[20px] font-semibold text-[#4c4c4c]">No matching records</h3>
              <p className="mx-auto mt-2 max-w-[520px] text-[14px] leading-[170%] text-[#595859]">
                Try removing one or more filters. Every filter on this page is optional, so a single blank field is enough to widen the result set again.
              </p>
            </div>
          ) : (
            <Accordion
              type="multiple"
              value={openItems}
              onValueChange={setOpenItems}
              className="space-y-4"
            >
              {filteredResults.map((item) => {
                const isOpen = openItems.includes(item.id);

                return (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="overflow-hidden rounded-[16px] border border-[#ecd6e5] bg-white px-5 shadow-[0_14px_40px_rgba(203,33,135,0.07)] md:px-6"
                  >
                    <AccordionTrigger className="gap-4 py-5 text-left hover:no-underline">
                      <div className="flex flex-1 flex-col gap-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span className="inline-flex rounded-full bg-[#FBE8F4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#CB2187]">
                                {item.quoteReference}
                              </span>
                              {item.durationLabel ? (
                                <span className="inline-flex rounded-full bg-[#F7F3F6] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7B6171]">
                                  {item.durationLabel}
                                </span>
                              ) : null}
                            </div>
                            <h3 className="text-[20px] font-semibold leading-[125%] text-[#4c4c4c]">
                              {item.hotelNameDisplay}
                            </h3>
                            <p className="mt-1 text-[14px] text-[#6a6267]">
                              {item.resortName || "Resort not available"}
                            </p>
                          </div>

                          <div className="text-left md:text-right">
                            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#9A7D90]">Total price</p>
                            <p className="mt-1 text-[24px] font-semibold leading-none text-[#CB2187]">
                              {item.totalPriceLabel}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 text-[13px] text-[#595859] sm:grid-cols-2 lg:grid-cols-5">
                          <div className="rounded-[10px] bg-[#FCF8FB] px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9A7D90]">Check-in</p>
                            <p className="mt-1 font-medium text-[#4c4c4c]">{item.checkInDate || "N/A"}</p>
                          </div>

                          <div className="rounded-[10px] bg-[#FCF8FB] px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9A7D90]">Board basis</p>
                            <p className="mt-1 font-medium text-[#4c4c4c]">{item.boardBasis || "N/A"}</p>
                          </div>

                          <div className="rounded-[10px] bg-[#FCF8FB] px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9A7D90]">Hotel ID</p>
                            <p className="mt-1 font-medium text-[#4c4c4c]">{item.hotelId || "N/A"}</p>
                          </div>

                          <div className="rounded-[10px] bg-[#FCF8FB] px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9A7D90]">GIATA ID</p>
                            <p className="mt-1 font-medium text-[#4c4c4c]">{item.giataId || "N/A"}</p>
                          </div>

                          <div className="rounded-[10px] bg-[#FCF8FB] px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9A7D90]">JSON view</p>
                            <p className="mt-1 font-medium text-[#4c4c4c]">{isOpen ? "Expanded" : "Collapsed"}</p>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pb-5 pt-1">
                      {isOpen ? (
                        <pre className="max-h-[420px] overflow-auto rounded-[14px] bg-[#241822] p-4 text-[12px] leading-[165%] text-[#F8EAF2]">
                          {JSON.stringify(item.record, null, 2)}
                        </pre>
                      ) : null}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>
      </div>
    </section>
  );
}