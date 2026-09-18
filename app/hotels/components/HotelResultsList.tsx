import { Search } from 'lucide-react';
import { type RefCallback, useEffect, useState, useMemo } from 'react';
import HotelCard, { HotelCardSkeleton, isHotelOnOffer, type HotelCardData } from './HotelCard';

function SkeletonList() {
  return (
    <>
      <HotelCardSkeleton key="sk-0" />
      <HotelCardSkeleton key="sk-1" />
      <HotelCardSkeleton key="sk-2" />
      <HotelCardSkeleton key="sk-3" />
    </>
  );
}

function LoadMoreSkeletons() {
  return (
    <div className="space-y-4">
      <HotelCardSkeleton key="lm-0" />
      <HotelCardSkeleton key="lm-1" />
    </div>
  );
}

function NoResults({ onClearAll, destinationUnavailable }: { onClearAll: () => void; destinationUnavailable?: boolean }) {
  return (
    <div data-testid="no-results" className="text-center py-16 bg-white rounded-[8px] border border-[#ececec]">
      <Search className="w-12 h-12 text-[#d5d5d5] mx-auto mb-4" />
      {destinationUnavailable ? (
        <>
          <h3 className="text-[18px] font-semibold text-[#4c4c4c] mb-2">We don&apos;t cover that destination yet</h3>
          <p className="text-[14px] text-[#666] mb-4">Try a different destination, or browse by date instead</p>
        </>
      ) : (
        <>
          <h3 className="text-[18px] font-semibold text-[#4c4c4c] mb-2">No deals found</h3>
          <p className="text-[14px] text-[#666] mb-4">Try adjusting your filters or search terms</p>
        </>
      )}
      <button onClick={onClearAll} className="text-[#CB2187] font-semibold text-[14px] hover:underline cursor-pointer bg-transparent border-none">
        Clear all filters
      </button>
    </div>
  );
}

function SearchExpired({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div data-testid="search-expired" className="text-center py-16 bg-white rounded-[8px] border border-[#ececec]">
      <Search className="w-12 h-12 text-[#d5d5d5] mx-auto mb-4" />
      <h3 className="text-[18px] font-semibold text-[#4c4c4c] mb-2">Your search has expired</h3>
      <p className="text-[14px] text-[#666] mb-4">You&apos;ve been away for a while, so these results are no longer fresh.</p>
      <button
        onClick={onRefresh}
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-[6px] bg-[#CB2187] text-white font-semibold text-[14px] hover:bg-[#a91c73] cursor-pointer border-none"
      >
        Refresh search
      </button>
    </div>
  );
}

function RateLimitNotice({ retryAfter }: { retryAfter: number }) {
  return (
    <div data-testid="rate-limit-notice" className="text-center py-3 mb-4 bg-[#fff7ed] border border-[#fed7aa] rounded-[8px] text-[13px] text-[#9a3412]">
      You&apos;re searching a little fast — please wait about {retryAfter}s and try again.
    </div>
  );
}

function AllSeen({ total }: { total: number }) {
  return <p className="text-center text-[14px] text-[#999] py-6">You&apos;ve seen all {total} deals</p>;
}

type HotelResultsListProps = {
  hotels: HotelCardData[];
  total: number;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  sentinelRef: RefCallback<Element>;
  onClearAll: () => void;
  destinationUnavailable?: boolean;
  rateLimitRetryAfter?: number | null;
  searchExpired?: boolean;
  onRefreshExpired?: () => void;
  specialOffersOnly?: boolean;
};

export default function HotelResultsList({ hotels, total, loading, loadingMore, hasMore, sentinelRef, onClearAll, destinationUnavailable, rateLimitRetryAfter, searchExpired, onRefreshExpired, specialOffersOnly }: HotelResultsListProps) {
  const [lastViewedId, setLastViewedId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = sessionStorage.getItem("pml_last_viewed_id");
      setLastViewedId(id);
    }
  }, []);

  const processedHotels = useMemo(() => {
    const base = Array.isArray(hotels) ? hotels : [];
    const list = specialOffersOnly ? base.filter(isHotelOnOffer) : base;
    if (!lastViewedId) return list;
    const index = list.findIndex(h => {
      const hId = String(h.hotelId || h.id || "");
      return hId === lastViewedId;
    });
    if (index <= 0) return list; // Already at top or not found

    const item = list[index];
    const rest = list.filter((_, i) => i !== index);
    return [item, ...rest];
  }, [hotels, lastViewedId, specialOffersOnly]);

  if (searchExpired) {
    return <SearchExpired onRefresh={onRefreshExpired!} />;
  }

  if (loading) {
    return (
      <div className="space-y-4 min-h-[80vh]" data-testid="results-loading">
        <SkeletonList />
      </div>
    );
  }

  if (processedHotels.length === 0) {
    return (
      <>
        {rateLimitRetryAfter ? <RateLimitNotice retryAfter={rateLimitRetryAfter} /> : null}
        <NoResults onClearAll={onClearAll} destinationUnavailable={destinationUnavailable} />
      </>
    );
  }

  return (
    <div className="space-y-5" data-testid="results-list">
      {rateLimitRetryAfter ? <RateLimitNotice retryAfter={rateLimitRetryAfter} /> : null}
      {processedHotels.map((hotel, idx) => {
        const hotelId = String(hotel.hotelId || hotel.id || "");
        const isHighlighted = hotelId === lastViewedId;
        return (
          <HotelCard key={`${hotel.slug}-${idx}`} hotel={hotel} index={idx} isHighlighted={isHighlighted} innerRef={idx === processedHotels.length - 1 ? sentinelRef : undefined} />
        );
      })}
      {loadingMore && <LoadMoreSkeletons />}
      {!hasMore && processedHotels.length > 0 && <AllSeen total={total} />}
    </div>
  );
}
