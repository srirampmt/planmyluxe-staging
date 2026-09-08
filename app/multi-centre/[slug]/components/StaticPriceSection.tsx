import React, { useMemo, useState } from 'react';
import {
    Calendar,
    Tag,
    ShieldCheck,
    PlaneTakeoff,
    Info,
    Clock,
    ChevronDown,
    ChevronUp,
    Phone,
} from 'lucide-react';
import { useUtmPhone } from '@/components/utm/UtmPhoneProvider';
import { openTawkChat } from '@/lib/tawk';
import { buildEnquirySource } from '@/lib/source-builder';
import { attachCurrentPageToWhatsAppHref, getWhatsAppUrl } from '@/lib/utils';
import { formatGbpPrice } from '@/lib/multi-centre-selected-price';
import type { StaticPricingData } from '@/types/hotel';

export type SelectedSeasonInfo = { label: string; dates: string; price: string };

const EMPTY_STATIC_PRICING_DATA: StaticPricingData = {
    totalDuration: '',
    fromPrice: '',
    seasons: [],
    departureDates: [],
    localTaxes: [],
};

type StaticPriceSectionProps = {
    slug?: string;
    data?: StaticPricingData | null;
    onEnquire?: (season: SelectedSeasonInfo) => void;
};

const StaticPriceSection = ({ slug, data, onEnquire }: StaticPriceSectionProps) => {
    const [isDatesExpanded, setIsDatesExpanded] = useState(true);

    const { totalDuration, fromPrice, seasons = [], departureDates, localTaxes } = data ?? EMPTY_STATIC_PRICING_DATA;

    const { phoneDisplay, phoneTel } = useUtmPhone();
    const handleOpenChat = () => openTawkChat();
    const whatsappSource = buildEnquirySource({ section: 'multi-centre', entityName: slug });

    const [selected, setSelected] = useState<{ type: 'season' | 'departure'; index: number }>(
        () => (seasons.length > 0 ? { type: 'season', index: 0 } : { type: 'departure', index: 0 })
    );

    const selectedSeasonInfo: SelectedSeasonInfo | null = useMemo(() => {
        if (selected.type === 'season') {
            const s = seasons[selected.index];
            return s ? { label: s.name, dates: s.dates, price: s.price } : null;
        }
        const g = departureDates[selected.index];
        return g ? { label: 'Departure Dates', dates: g.dates.join(', '), price: g.price } : null;
    }, [selected, seasons, departureDates]);

    const whatsappContextLine = selectedSeasonInfo
        ? `from ${formatGbpPrice(selectedSeasonInfo.price)}pp`
        : undefined;

    const handleCardSelect = (season: SelectedSeasonInfo, type: 'season' | 'departure', index: number) => {
        setSelected({ type, index });
        onEnquire?.(season);
    };

    const handleCardKeyDown = (
        event: React.KeyboardEvent<HTMLDivElement>,
        season: SelectedSeasonInfo,
        type: 'season' | 'departure',
        index: number
    ) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleCardSelect(season, type, index);
        }
    };

    return (
        <div id="multi-centre-calendar" className="flex justify-center items-center bg-gray-50 font-['Montserrat'] text-slate-800">

            {/* Main Vertical Widget Container */}
            <div className="w-full max-w-md bg-white rounded-xl overflow-hidden border border-gray-200">

                {/* Header (From Image 1) */}
                <div className="bg-[#5a5a5a] text-white px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold tracking-wide flex items-center gap-2">
                        <PlaneTakeoff className="w-5 h-5" />
                        Holiday Summary
                    </h2>
                    {/* <span className="text-xs bg-white/20 px-2 py-1 rounded">Ref: ABC123456</span> */}
                </div>

                <div className="p-4 flex flex-col gap-6">

                    {/* Top Overview Section */}
                    <div className="flex justify-between items-end pb-5 border-b border-gray-100 ">
                        <div>
                            <p className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
                                <Clock className="w-4 h-4" /> Total Duration
                            </p>
                            <p className="text-2xl font-light text-pml-primary">{totalDuration}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1 flex items-center justify-end gap-1">
                                From (incl. Flights) <Info className="w-3 h-3" />
                            </p>
                            <p className="text-3xl font-bold text-pml-primary">{formatGbpPrice(fromPrice)}<span className="text-sm text-gray-500 mb-1">/pp</span></p>
                        </div>
                    </div>



                    {/* Seasonal Pricing List (Cleaned up from Image 2) */}
                    {seasons.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Seasonal Pricing</h3>
                            <div className="flex flex-col gap-2.5">
                                {seasons.map((season, idx) => {
                                    const seasonInfo: SelectedSeasonInfo = { label: season.name, dates: season.dates, price: season.price };
                                    const isSelected = selected.type === 'season' && selected.index === idx;
                                    return (
                                        <div
                                            key={idx}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => handleCardSelect(seasonInfo, 'season', idx)}
                                            onKeyDown={(event) => handleCardKeyDown(event, seasonInfo, 'season', idx)}
                                            className={`flex justify-between items-center p-3.5 rounded-[8px] bg-pml-primary shadow-sm hover:shadow-md transition-all group cursor-pointer ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-pml-primary' : ''
                                                }`}
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-[15px] font-bold text-white">{season.name}</p>
                                                <p className="text-[9px] md:text-[13px] font-medium text-white/80">{season.dates}</p>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-2">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[12px] md:text-[14px] font-semibold tracking-wide text-white/80">From</span>
                                                    <div>
                                                        <span className="text-[16px] md:text-[20px] font-semibold text-white">{formatGbpPrice(season.price)}</span>
                                                        <span className="text-[9px] md:text-[12px] text-white/80 ml-0.5 font-medium uppercase">pp</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <a
                                                        href={`tel:${phoneTel}`}
                                                        onClick={(event) => event.stopPropagation()}
                                                        aria-label={`Call ${phoneDisplay}`}
                                                        className="inline-flex items-center justify-center bg-white text-pml-primary hover:bg-white/90 px-1.5 py-1.5 rounded-full transition-colors"
                                                    >
                                                        <Phone className="h-3 w-3" />
                                                    </a>
                                                    <a
                                                        href={getWhatsAppUrl({
                                                            source: whatsappSource,
                                                            contextLine: seasonInfo ? `from ${formatGbpPrice(seasonInfo.price)}pp` : undefined,
                                                        })}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            attachCurrentPageToWhatsAppHref(event, {
                                                                source: whatsappSource,
                                                                contextLine: seasonInfo ? `from ${formatGbpPrice(seasonInfo.price)}pp` : undefined,
                                                            });
                                                        }}
                                                        aria-label="Send a WhatsApp message"
                                                        className="inline-flex items-center justify-center bg-white text-pml-whatsapp hover:bg-white/90 px-1.5 py-1.5 rounded-full transition-colors"
                                                    >
                                                        <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
                                                            <path d="M20.52 3.449C12.831-3.984.106 1.407.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c7.905 4.27 17.661-1.4 17.665-10.449 0-3.176-1.24-6.165-3.495-8.402ZM22.002 11.866c-.006 7.633-8.385 12.4-15.012 8.504l-.36-.214-3.75.975 1.005-3.645-.239-.375C-.478 10.546 4.26 1.966 12.072 1.966c2.654 0 5.145 1.035 7.021 2.91 1.875 1.859 2.909 4.35 2.909 6.99Z" />
                                                            <path d="M17.507 14.307c-2.199-1.096-2.429-1.242-2.713-.816-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.293-.506.32-.578.878-1.634.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.576-.05-.997-.042-1.368.344-1.614 1.774-1.207 3.604.174 5.55 2.714 3.552 4.16 4.206 6.804 5.114.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345Z" />
                                                        </svg>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Departure Dates Section (Redesigned) */}
                    {departureDates.length > 0 && (
                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                            <button
                                onClick={() => setIsDatesExpanded(!isDatesExpanded)}
                                className={`w-full px-4 py-3.5 flex justify-between items-center transition-colors ${isDatesExpanded ? 'bg-gray-50 border-b border-gray-200' : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                            >
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Calendar className="w-4.5 h-4.5 text-[#c82586]" />
                                    Detailed Departure Dates
                                </h3>
                                {isDatesExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                            </button>

                            {isDatesExpanded && (
                                <div className="p-3.5 bg-gray-50/50 flex flex-col gap-2.5">
                                    {departureDates.map((group, idx) => {
                                        const groupInfo: SelectedSeasonInfo = { label: 'Departure Dates', dates: group.dates.join(', '), price: group.price };
                                        const isSelected = selected.type === 'departure' && selected.index === idx;
                                        return (
                                            <div
                                                key={idx}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => handleCardSelect(groupInfo, 'departure', idx)}
                                                onKeyDown={(event) => handleCardKeyDown(event, groupInfo, 'departure', idx)}
                                                className={`flex justify-between items-center gap-4 p-3.5 rounded-[8px] bg-pml-primary shadow-sm hover:shadow-md transition-all group cursor-pointer ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-pml-primary' : ''
                                                    }`}
                                            >
                                                <div className="flex flex-col gap-1.5">
                                                    {group.dates.map((dateLine, dIdx) => (
                                                        <div key={dIdx} className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-white/80"></div>
                                                            <span className="text-[13px] font-medium text-white">{dateLine}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="text-right flex flex-col items-end shrink-0 gap-2">
                                                    <div>
                                                        <span className="text-[20px] font-extrabold text-white">{formatGbpPrice(group.price)}</span>
                                                        <span className="text-[11px] text-white/80 ml-0.5 font-medium uppercase">pp</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <a
                                                            href={`tel:${phoneTel}`}
                                                            onClick={(event) => event.stopPropagation()}
                                                            aria-label={`Call ${phoneDisplay}`}
                                                            className="inline-flex items-center justify-center bg-white text-pml-primary hover:bg-white/90 px-1.5 py-1.5 rounded-full transition-colors"
                                                        >
                                                            <Phone className="h-3 w-3" />
                                                        </a>
                                                        <a
                                                            href={getWhatsAppUrl({
                                                                source: whatsappSource,
                                                                contextLine: groupInfo ? `from ${formatGbpPrice(groupInfo.price)}pp` : undefined,
                                                            })}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                attachCurrentPageToWhatsAppHref(event, {
                                                                    source: whatsappSource,
                                                                    contextLine: groupInfo ? `from ${formatGbpPrice(groupInfo.price)}pp` : undefined,
                                                                });
                                                            }}
                                                            aria-label="Send a WhatsApp message"
                                                            className="inline-flex items-center justify-center bg-white text-pml-whatsapp hover:bg-white/90 px-1.5 py-1.5 rounded-full transition-colors"
                                                        >
                                                            <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
                                                                <path d="M20.52 3.449C12.831-3.984.106 1.407.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c7.905 4.27 17.661-1.4 17.665-10.449 0-3.176-1.24-6.165-3.495-8.402ZM22.002 11.866c-.006 7.633-8.385 12.4-15.012 8.504l-.36-.214-3.75.975 1.005-3.645-.239-.375C-.478 10.546 4.26 1.966 12.072 1.966c2.654 0 5.145 1.035 7.021 2.91 1.875 1.859 2.909 4.35 2.909 6.99Z" />
                                                                <path d="M17.507 14.307c-2.199-1.096-2.429-1.242-2.713-.816-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.293-.506.32-.578.878-1.634.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.576-.05-.997-.042-1.368.344-1.614 1.774-1.207 3.604.174 5.55 2.714 3.552 4.16 4.206 6.804 5.114.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345Z" />
                                                            </svg>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                    {/* Local Tax Alert */}
                    {localTaxes.length > 0 && (
                        <div className="bg-fuchsia-50 border border-fuchsia-100 rounded-[8px] p-3 flex items-start gap-3">
                            <Tag className="w-5 h-5 text-[#c82586] shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-[#c82586] mb-0.5">Local Tax</h4>
                                <ul>
                                    {localTaxes.map((tax, idx) => (
                                        <li key={idx} className="text-xs text-fuchsia-900/80 leading-relaxed mt-1">
                                            {tax}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    {/* Call to Action & Footer (Updated with Contact Buttons) */}
                    <div className="pt-2">

                        {/* Contact Buttons Row */}
                        <div className="flex flex-col sm:flex-row gap-2.5 w-full">
                            <a
                                href={`tel:${phoneTel}`}
                                data-testid="mc-cta-call"
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-[10px] px-3 py-2 text-[12px] font-semibold leading-[140%] bg-pml-primary text-white border border-pml-primary transition-colors duration-200 hover:bg-pml-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pml-primary focus-visible:ring-offset-2"
                                aria-label={`Call ${phoneDisplay}`}
                            >
                                <Phone className="h-3.5 w-3.5" />
                                <span>{phoneDisplay}</span>
                            </a>

                            <button
                                type="button"
                                onClick={handleOpenChat}
                                data-testid="mc-cta-chat"
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-[10px] px-3 py-2 text-[12px] font-semibold leading-[140%] bg-white text-pml-primary border border-pml-primary transition-colors duration-200 hover:bg-pml-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pml-primary focus-visible:ring-offset-2"
                                aria-label="Open chat"
                            >
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 23 21"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M5.25 21C5.13975 21 5.02875 20.9753 4.9245 20.9257C4.66575 20.8005 4.5 20.5387 4.5 20.25V16.5H2.25C1.0095 16.5 0 15.4905 0 14.25V2.25C0 1.0095 1.0095 0 2.25 0H20.25C21.4905 0 22.5 1.0095 22.5 2.25V14.25C22.5 15.4905 21.4905 16.5 20.25 16.5H11.1383L5.71875 20.8358C5.583 20.9445 5.41725 21 5.25 21ZM2.25 1.5C1.836 1.5 1.5 1.83675 1.5 2.25V14.25C1.5 14.6632 1.836 15 2.25 15H5.25C5.66475 15 6 15.3352 6 15.75V18.69L10.4062 15.1642C10.5398 15.0577 10.704 15 10.875 15H20.25C20.664 15 21 14.6632 21 14.25V2.25C21 1.83675 20.664 1.5 20.25 1.5H2.25Z"
                                        fill="#CB2187"
                                    />
                                    <path
                                        d="M17.25 7.5H5.25C4.83525 7.5 4.5 7.164 4.5 6.75C4.5 6.336 4.83525 6 5.25 6H17.25C17.6648 6 18 6.336 18 6.75C18 7.164 17.6648 7.5 17.25 7.5Z"
                                        fill="#CB2187"
                                    />
                                    <path
                                        d="M11.25 10.5H5.25C4.83525 10.5 4.5 10.164 4.5 9.75C4.5 9.336 4.83525 9 5.25 9H11.25C11.6648 9 12 9.336 12 9.75C12 10.164 11.6648 10.5 11.25 10.5Z"
                                        fill="#CB2187"
                                    />
                                </svg>
                                chat online
                            </button>

                            <a
                                href={getWhatsAppUrl({
                                    source: whatsappSource,
                                    contextLine: whatsappContextLine,
                                })}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(event) =>
                                    attachCurrentPageToWhatsAppHref(event, {
                                        source: whatsappSource,
                                        contextLine: whatsappContextLine,
                                    })
                                }
                                data-testid="mc-cta-whatsapp"
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-[10px] px-3 py-2 text-[12px] font-semibold leading-[140%] bg-pml-whatsapp text-white border border-pml-whatsapp transition-colors duration-200 hover:bg-pml-whatsapp/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pml-whatsapp focus-visible:ring-offset-2"
                                aria-label="Send a WhatsApp message"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-3.5 w-3.5 fill-current"
                                    aria-hidden="true"
                                >
                                    <path d="M20.52 3.449C12.831-3.984.106 1.407.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c7.905 4.27 17.661-1.4 17.665-10.449 0-3.176-1.24-6.165-3.495-8.402ZM22.002 11.866c-.006 7.633-8.385 12.4-15.012 8.504l-.36-.214-3.75.975 1.005-3.645-.239-.375C-.478 10.546 4.26 1.966 12.072 1.966c2.654 0 5.145 1.035 7.021 2.91 1.875 1.859 2.909 4.35 2.909 6.99Z" />
                                    <path d="M17.507 14.307c-2.199-1.096-2.429-1.242-2.713-.816-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.293-.506.32-.578.878-1.634.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.576-.05-.997-.042-1.368.344-1.614 1.774-1.207 3.604.174 5.55 2.714 3.552 4.16 4.206 6.804 5.114.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345Z" />
                                </svg>
                                whatsapp
                            </a>
                        </div>

                        {/* <div className="mt-5 flex items-center justify-center gap-2 text-gray-500">
              <div className="bg-gray-100 p-1 rounded-full">
                <ShieldCheck className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-sm font-medium">All holidays are ATOL protected!</span>
            </div> */}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StaticPriceSection;