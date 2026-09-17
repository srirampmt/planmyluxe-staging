"use client";

import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { usePathname } from "next/navigation";
// import { useAuth } from "@/lib/auth";
// import { UserAccountNav } from "@/components/layout/user-account-nav";
// import { useLoginModal } from "@/app/store/bookingStore";
import Image from "next/image";
import { useState, useEffect, useRef, type ReactNode } from "react";
import PhoneNumber from "@/components/utm/PhoneNumber";
// import { FAQWidgetMobile } from "../faq-widget-mobile";

// Mega Menu Dropdown Component
interface MegaMenuProps {
  children: ReactNode;
  isOpen: boolean;
  onRequestClose?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const MegaMenu = ({ children, isOpen, onRequestClose, onMouseEnter, onMouseLeave }: MegaMenuProps) => {
  return (
    <div
      className={`
        bg-white
        ${isOpen ? 'flex' : 'hidden'}
        w-full py-3 flex-col
        xl:fixed xl:top-[var(--main-nav-height)] xl:left-0 xl:right-0 xl:w-full
        xl:min-h-[280px] xl:max-h-[600px]
        xl:overflow-y-auto xl:py-6
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => {
        if (!onRequestClose) return;
        const target = e.target as HTMLElement | null;
        if (!target) return;
        if (target.closest('a')) onRequestClose();
      }}
    >
      <div className="w-full max-w-[1320px] mx-auto px-6">
        {children}
      </div>
    </div>
  );
};

// Image Card Component
interface ImageCardProps {
  href: string;
  imageSrc: string;
  text: string;
  alt: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
}

const ImageCard = ({ href, imageSrc, text, alt, target, rel }: ImageCardProps) => {
  const safeRel = target === " _blank" ? (rel ?? "noopener noreferrer") : rel;

  return (
    <a
      href={href}
      target={target}
      rel={target === "_blank" ? (rel ?? "noopener noreferrer") : rel}
      className="block max-w-[420px] w-full no-underline"
    >
      <div className="rounded-[14px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0)] relative">
        <div className="relative overflow-hidden">
          <img
            src={imageSrc}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="w-full h-full max-h-[180px] sm:max-h-[220px] md:max-h-[260px] object-cover scale-100 transition-transform duration-300 hover:scale-105"
          />
          <span className="absolute inset-0 bg-gradient-to-br from-black/55 to-black/35"></span>
        </div>
        <div className="absolute inset-x-0 bottom-0 px-5 py-[18px] flex items-center justify-between text-white font-semibold">
          <p className="m-0 max-w-[75%] text-[0.95rem]">{text}</p>
          <span className="w-9 h-9 rounded-full border-2 border-white inline-flex items-center justify-center text-[0.95rem]">
            <ChevronDown className="w-4 h-4 -rotate-90" />
          </span>
        </div>
      </div>
    </a>
  );
};

export function MainNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isHidden, setIsHidden] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const hoverCloseTimeoutRef = useRef<number | null>(null);

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const isDesktop = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1280;
  };

  const clearHoverCloseTimeout = () => {
    if (hoverCloseTimeoutRef.current) {
      window.clearTimeout(hoverCloseTimeoutRef.current);
      hoverCloseTimeoutRef.current = null;
    }
  };

  const scheduleHoverClose = () => {
    clearHoverCloseTimeout();
    // Small delay prevents flicker when moving across tiny gaps
    hoverCloseTimeoutRef.current = window.setTimeout(() => {
      setOpenDropdown(null);
    }, 180);
  };

  const closeDropdowns = () => {
    setOpenDropdown(null);
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  const handleMegaMenuaClick = () => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth < 1280) {
      closeMenu();
    } else {
      closeDropdowns();
    }
  };

  const handleDropdownMouseEnter = (dropdown: string) => {
    if (!isDesktop()) return;
    clearHoverCloseTimeout();
    setOpenDropdown(dropdown);
  };

  const handleDropdownMouseLeave = () => {
    if (!isDesktop()) return;
    scheduleHoverClose();
  };

  // Handle click outside to close menu on mobile/tablet
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        if (window.innerWidth < 1280) closeMenu();
        else closeDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside as EventListener);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as EventListener);
    };
  }, []);

  // Close dropdowns on ESC
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (window.innerWidth < 1280) closeMenu();
        else closeDropdowns();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    closeMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const updateNavHeightVar = () => {
      const height = headerRef.current?.getBoundingClientRect().height;
      if (!height) return;
      document.documentElement.style.setProperty(
        "--main-nav-height",
        `${Math.round(height)}px`
      );
    };

    updateNavHeightVar();
    window.addEventListener("resize", updateNavHeightVar);
    return () => window.removeEventListener("resize", updateNavHeightVar);
  }, []);

  useEffect(() => {
    const onHide = () => { setIsHidden(true); closeMenu(); };
    const onShow = () => setIsHidden(false);
    window.addEventListener('hideNavbar', onHide);
    window.addEventListener('showNavbar', onShow);
    return () => {
      window.removeEventListener('hideNavbar', onHide);
      window.removeEventListener('showNavbar', onShow);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-[1000] bg-white shadow-sm"
      style={{
        transform: isHidden ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]">
        <div className="w-full max-w-[1280px] mx-auto">
          <div className="py-4 xl:py-6">
            <nav ref={navRef} className="flex justify-between items-center w-full gap-8">
              <a href="/" className="flex flex-row items-start flex-none">
                <Image
                  width={320}
                  height={52}
                  src="https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/homepage/logo-nav.png"
                  className="w-[200px] md:w-[260px] h-auto"
                  alt="Logo"
                  priority
                />
              </a>
              <button
                type="button"
                className="xl:hidden p-2 border-0 bg-transparent cursor-pointer z-50"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="w-7 h-7 text-pml-primary" />
                ) : (
                  <Menu className="w-7 h-7 text-pml-primary" />
                )}
              </button>
              <div className={`
                absolute top-full left-0 right-0 p-4 bg-white max-h-[80vh] overflow-y-auto
                xl:static xl:mt-0 xl:p-0 xl:rounded-none xl:max-h-none xl:overflow-visible
                xl:flex xl:items-center xl:gap-6
                ${mobileMenuOpen ? 'block' : 'hidden xl:flex'}
              `}>
                <ul className="flex flex-col xl:flex-row xl:items-center gap-1 xl:gap-2 items-center">
                  <li className="relative group w-full xl:w-auto">
                    <div
                      onMouseEnter={() => handleDropdownMouseEnter('deals')}
                      onMouseLeave={handleDropdownMouseLeave}
                      className="w-full xl:w-auto"
                    >
                    <button onClick={() => toggleDropdown('deals')} className="flex items-center justify-center xl:justify-start py-2 px-3 gap-1 w-full xl:w-auto cursor-pointer bg-transparent border-none hover:text-pml-primary transition-colors" >
                      <span className="font-['Montserrat'] font-medium text-base text-[#4C4C4C]">Deals & Offers</span>
                      <svg className={`w-4 h-4 text-[#595858] transition-transform duration-300 ${openDropdown === 'deals' ? 'rotate-180' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <path d="M3.0624 5.93937L7.43052 11.0369C7.50093 11.119 7.58827 11.1849 7.68655 11.2301C7.78483 11.2753 7.89173 11.2987 7.9999 11.2987C8.10807 11.2987 8.21497 11.2753 8.31325 11.2301C8.41153 11.1849 8.49887 11.119 8.56927 11.0369L12.9374 5.93937C13.3543 5.45281 13.0086 4.70125 12.368 4.70125H3.63053C2.9899 4.70125 2.64428 5.45281 3.0624 5.93937Z" fill="#595858" />
                      </svg>
                    </button>
                  
                    <MegaMenu
                      isOpen={openDropdown === 'deals'}
                      onRequestClose={handleMegaMenuaClick}
                      onMouseEnter={clearHoverCloseTimeout}
                      onMouseLeave={handleDropdownMouseLeave}
                    >
                      <div className="flex flex-col items-center xl:items-stretch xl:flex-row xl:justify-between w-full gap-4 xl:gap-0">
                        {/* Latest Offers */}
                        <div className="xl:flex-[0_0_32%] xl:border-r xl:border-pml-border xl:pr-6 text-center xl:text-left">
                          <p className="text-[0.95rem] font-bold mb-3 text-[#595858]">Latest Offers & Exclusive Deals</p>
                          <div className="flex flex-col gap-1 items-center xl:items-start">
                            <a href="/top-trending-deals" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Trending Top Deals</a>
                            <a href="/offers/last-minute" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Last‑Minute Bargains</a>
                            <a href="/trending-multi-centres" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Trending Multi Centres</a>
                            <a href="/offers/summer-deals" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Summer 2026 - Early Deals</a>
                            <a href="/offers/top-luxury" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">5-Star Luxury - For Less</a>
                            <a href="/offers/mitsis-hotel-group" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Mitsis Hotel Group Offers</a>
                            {/* <a href="/offers/valentines-specials" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Valentine’s Specials</a> */}
                            <a href="/all-offers" className="py-1 text-pml-primary text-sm font-semibold hover:text-pml-primary/80">All Our Deals & Offers →</a>
                          </div>
                        </div>

                        {/* Holiday Styles - Desktop only */}
                        <div className="hidden xl:block xl:flex-[0_0_30%] xl:pl-6">
                          <p className="text-[0.95rem] font-bold mb-3 text-[#595858]">Our Holiday Styles</p>
                          <div className="flex flex-col gap-1">
                            <a href="/holiday-styles/all-inclusive" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">All Inclusive Holidays</a>
                            <a href="/holiday-styles/adult-only" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Adults Only Holidays</a>
                            <a href="/holiday-styles/city-breaks" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">City Breaks</a>
                            <a href="/holiday-styles/beach-holidays" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Beach Holidays</a>
                            <a href="/holiday-styles/family-holidays" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Family Holidays</a>
                            <a href="/holiday-styles/multi-centre" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Multi Centre Holidays</a>
                            <a href="/holiday-styles/christmas-market-holidays" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Christmas Market Holidays</a>
                            <a href="/holiday-styles" className="py-1 text-pml-primary text-sm font-semibold hover:text-pml-primary/80">Discover more →</a>
                          </div>
                        </div>

                        {/* Image Card - Desktop only */}
                        <div className="hidden xl:flex xl:flex-[0_0_38%] items-center justify-end">
                          <ImageCard
                            href="/all-offers"
                            imageSrc="/assets/images/menu-image-1.jpg"
                            text="Exclusive Offers Free Added Extras"
                            alt="Exclusive offers destination"
                          />
                        </div>
                      </div>
                    </MegaMenu>
                    </div>
                  </li>

                  <li className="relative group w-full xl:w-auto">
                    <div
                      onMouseEnter={() => handleDropdownMouseEnter('holiday')}
                      onMouseLeave={handleDropdownMouseLeave}
                      className="w-full xl:w-auto"
                    >
                    <button
                      onClick={() => toggleDropdown('holiday')}
                      className="flex items-center justify-center xl:justify-start py-2 px-3 gap-1 w-full xl:w-auto cursor-pointer bg-transparent border-none hover:text-pml-primary transition-colors"
                    >
                      <span className="font-['Montserrat'] font-medium text-base text-[#4C4C4C]">Holiday Styles</span>
                      <svg className={`w-4 h-4 text-[#595858] transition-transform duration-300 ${openDropdown === 'holiday' ? 'rotate-180' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <path d="M3.0624 5.93937L7.43052 11.0369C7.50093 11.119 7.58827 11.1849 7.68655 11.2301C7.78483 11.2753 7.89173 11.2987 7.9999 11.2987C8.10807 11.2987 8.21497 11.2753 8.31325 11.2301C8.41153 11.1849 8.49887 11.119 8.56927 11.0369L12.9374 5.93937C13.3543 5.45281 13.0086 4.70125 12.368 4.70125H3.63053C2.9899 4.70125 2.64428 5.45281 3.0624 5.93937Z" fill="#595858" />
                      </svg>
                    </button>
                    
                    <MegaMenu isOpen={openDropdown === 'holiday'} onRequestClose={handleMegaMenuaClick} onMouseEnter={clearHoverCloseTimeout} onMouseLeave={handleDropdownMouseLeave} >
                      <div className="flex flex-col items-center xl:items-stretch xl:flex-row xl:justify-between w-full gap-4 xl:gap-0">
                        {/* Holiday Styles */}
                        <div className="xl:flex-[0_0_32%] xl:border-r xl:border-pml-border xl:pr-6 text-center xl:text-left">
                          <p className="text-[0.95rem] font-bold mb-3 text-[#595858]">Our Holiday Styles</p>
                          <div className="flex flex-col gap-1 items-center xl:items-start">
                            <a href="/holiday-styles/all-inclusive" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">All Inclusive Holidays</a>
                            <a href="/holiday-styles/adult-only" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Adults Only Holidays</a>
                            <a href="/holiday-styles/city-breaks" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">City Breaks</a>
                            <a href="/holiday-styles/beach-holidays" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Beach Holidays</a>
                            <a href="/holiday-styles/family-holidays" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Family Holidays</a>
                            <a href="/holiday-styles/multi-centre" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Multi Centre Holidays</a>
                            <a href="/holiday-styles/christmas-market-holidays" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Christmas Market Holidays</a>
                            <a href="/holiday-styles" className="py-1 text-pml-primary text-sm font-semibold hover:text-pml-primary/80">Discover more →</a>
                          </div>
                        </div>

                        <div className="hidden xl:block xl:flex-[0_0_30%] xl:pl-6">
                          <p className="text-[0.95rem] font-bold mb-3 text-[#595858]">Latest Offers & Exclusive Deals</p>
                          <div className="flex flex-col gap-1 items-center xl:items-start">
                            <a href="/top-trending-deals" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Trending Top Deals</a>
                            <a href="/offers/last-minute" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Last‑Minute Bargains</a>
                            <a href="/trending-multi-centres" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Trending Multi Centres</a>
                            <a href="/offers/summer-deals" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Summer 2026 - Early Deals</a>
                            <a href="/offers/top-luxury" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">5-Star Luxury - For Less</a>
                            <a href="/offers/mitsis-hotel-group" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Mitsis Hotel Group Offers</a>
                            {/* <a href="/offers/valentines-specials" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Valentine’s Specials</a> */}
                            <a href="/all-offers" className="py-1 text-pml-primary text-sm font-semibold hover:text-pml-primary/80">All Our Deals & Offers →</a>
                          </div>
                        </div>

                        <div className="hidden xl:flex xl:flex-[0_0_38%] items-center justify-end">
                          <ImageCard
                            href="/holiday-styles"
                            imageSrc="/assets/images/menu-image-2.jpg"
                            text="Exclusive Including Free Added Extras"
                            alt="Exclusive offers destination"
                          />
                        </div>
                      </div>
                    </MegaMenu>
                    </div>
                  </li>

                  <li className="relative group w-full xl:w-auto">
                    <div onMouseEnter={() => handleDropdownMouseEnter('destinations')} onMouseLeave={handleDropdownMouseLeave} className="w-full xl:w-auto" >
                      <button onClick={() => toggleDropdown('destinations')} className="flex items-center justify-center xl:justify-start py-2 px-3 gap-1 w-full xl:w-auto cursor-pointer bg-transparent border-none hover:text-pml-primary transition-colors" >
                        <span className="font-['Montserrat'] font-medium text-base text-[#4C4C4C]">Destinations</span>
                        <svg className={`w-4 h-4 text-[#595858] transition-transform duration-300 ${openDropdown === 'destinations' ? 'rotate-180' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                          <path d="M3.0624 5.93937L7.43052 11.0369C7.50093 11.119 7.58827 11.1849 7.68655 11.2301C7.78483 11.2753 7.89173 11.2987 7.9999 11.2987C8.10807 11.2987 8.21497 11.2753 8.31325 11.2301C8.41153 11.1849 8.49887 11.119 8.56927 11.0369L12.9374 5.93937C13.3543 5.45281 13.0086 4.70125 12.368 4.70125H3.63053C2.9899 4.70125 2.64428 5.45281 3.0624 5.93937Z" fill="#595858" />
                        </svg>
                      </button>
                      
                      <MegaMenu isOpen={openDropdown === 'destinations'} onRequestClose={handleMegaMenuaClick} onMouseEnter={clearHoverCloseTimeout} onMouseLeave={handleDropdownMouseLeave} >
                        <div className="w-full">
                          <p className="text-[0.95rem] font-bold mb-3 text-[#595858] text-center xl:text-left">Our Destinations</p>
                          <div className="flex gap-4 overflow-x-auto pb-2 xl:justify-start xl:grid xl:grid-cols-4 xl:gap-8 xl:overflow-visible xl:pb-0">
                            {/* Column 1 */}
                            <div className="flex flex-col gap-1 flex-shrink-0 min-w-[140px] xl:min-w-0 xl:border-r xl:border-pml-border xl:pr-4 ">
                              <a href="/destinations/european-cities" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">European Cities</a>
                              <a href="/destinations/mediterranean-beach" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Mediterranean Beach</a>
                              <a href="/destinations/tenerife" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Tenerife</a>
                              <a href="/destinations/gran-canaria" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Gran Canaria</a>
                              <a href="/destinations/lanzarote" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Lanzarote</a>
                              <a href="/destinations/fuerteventura" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Fuerteventura</a>
                              <a href="/destinations/spain" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Mainland Spain</a>
                              <a href="/destinations/costa-blanca" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Costa Blanca</a>
                              <a href="/destinations/costa-del-sol" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Costa del Sol</a>
                              <a href="/destinations/mallorca" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Mallorca</a>
                              <a href="/destinations/ibiza" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Ibiza</a>
                            </div>

                            {/* Column 2 */}
                            <div className="flex flex-col gap-1 flex-shrink-0 min-w-[140px] xl:min-w-0 xl:border-r xl:border-pml-border xl:pr-4">
                              <a href="/destinations/greece" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Greece</a>
                              <a href="/destinations/halkidiki" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Halkidiki</a>
                              <a href="/destinations/crete" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Crete</a>
                              <a href="/destinations/corfu" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Corfu</a>
                              {/* <a href="/destinations/portugal" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Portugal</a> */}
                              <a href="/destinations/rhodes" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Rhodes</a>
                              <a href="/destinations/kos" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Kos</a>
                              <a href="/destinations/kefalonia" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Kefalonia</a>
                              <a href="/destinations/mykonos" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Mykonos</a>
                              <a href="/destinations/zante" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Zante</a>
                              <a href="/destinations/santorini" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Santorini</a>
                            </div>

                            {/* Column 3 */}
                            <div className="flex flex-col gap-1 flex-shrink-0 min-w-[140px] xl:min-w-0 xl:border-r xl:border-pml-border xl:pr-4">
                              <a href="/destinations/cyprus" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Cyprus</a>
                              <a href="/destinations/turkey" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Turkey</a>
                              <a href="/destinations/croatia" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Croatia</a>
                              <a href="/destinations/montenegro" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Montenegro</a>
                              <a href="/destinations/bulgaria" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Bulgaria</a>
                              <a href="/destinations/malta" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Malta</a>
                              <a href="/destinations/italy" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Italy</a>
                              <a href="/destinations" className="py-1 text-pml-primary text-sm font-semibold hover:text-pml-primary/80">Discover more →</a>
                            </div>

                            {/* Column 4 */}
                            <div className="flex flex-col gap-1 flex-shrink-0 min-w-[140px] xl:min-w-0">
                              <a href="/destinations/egypt" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Egypt & Red Sea</a>
                              <a href="/destinations/tunisia" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Tunisia</a>
                              <a href="/destinations/morocco" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Morocco</a>
                              <a href="/destinations/cape-verde" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Cape Verde</a>
                              <a href="/destinations/mexico" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Mexico</a>
                              <a href="/destinations/florida" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Florida</a>
                              <a href="/destinations/new-york" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">New York</a>
                              <a href="/destinations/maldives" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Maldives</a>
                              <a href="/destinations/phuket" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Phuket</a>
                              <a href="/destinations" className="py-1 text-pml-primary text-sm font-semibold hover:text-pml-primary/80">All our destinations</a>
                            </div>
                          </div>
                        </div>
                      </MegaMenu>
                    </div>
                  </li>

                  <li className="relative group w-full xl:w-auto">
                    <div
                      onMouseEnter={() => handleDropdownMouseEnter('support')}
                      onMouseLeave={handleDropdownMouseLeave}
                      className="w-full xl:w-auto"
                    >
                    <button
                      onClick={() => toggleDropdown('support')}
                      className="flex items-center justify-center xl:justify-start py-2 px-3 gap-1 w-full xl:w-auto cursor-pointer bg-transparent border-none hover:text-pml-primary transition-colors"
                    >
                      <span className="font-['Montserrat'] font-medium text-base text-[#4C4C4C]">Support</span>
                      <svg className={`w-4 h-4 text-[#595858] transition-transform duration-300 ${openDropdown === 'support' ? 'rotate-180' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <path d="M3.0624 5.93937L7.43052 11.0369C7.50093 11.119 7.58827 11.1849 7.68655 11.2301C7.78483 11.2753 7.89173 11.2987 7.9999 11.2987C8.10807 11.2987 8.21497 11.2753 8.31325 11.2301C8.41153 11.1849 8.49887 11.119 8.56927 11.0369L12.9374 5.93937C13.3543 5.45281 13.0086 4.70125 12.368 4.70125H3.63053C2.9899 4.70125 2.64428 5.45281 3.0624 5.93937Z" fill="#595858" />
                      </svg>
                    </button>
                    
                    <MegaMenu
                      isOpen={openDropdown === 'support'}
                      onRequestClose={handleMegaMenuaClick}
                      onMouseEnter={clearHoverCloseTimeout}
                      onMouseLeave={handleDropdownMouseLeave}
                    >
                      <div className="grid grid-cols-2 gap-4 xl:flex xl:flex-row xl:justify-between w-full xl:gap-0">
                        {/* Help & Support */}
                        <div className="xl:flex-[0_0_32%] xl:border-r xl:border-pml-border xl:pr-6">
                          <p className="text-[0.95rem] font-bold mb-3 text-[#595858]">Help & Support</p>
                          <div className="flex flex-col gap-1">
                            <a href="/payment-options" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Latest Travel Advice</a>
                            <a href="/contact-us" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Contact Us</a>
                            <a href="/faqs" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Frequently Asked Questions</a>
                            <a href="/groupbookings" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Group Bookings</a>
                            <a href="/contact-us" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Changes to Bookings</a>
                            <a href="/payment-options" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Payment Options</a>
                          </div>
                        </div>

                        {/* Useful as */}
                        <div className="xl:flex-[0_0_32%] xl:pl-6">
                          <p className="text-[0.95rem] font-bold mb-3 text-[#595858]">Useful as</p>
                          <div className="flex flex-col gap-1">
                            <a href="/about-us" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">About Us</a>
                            <a target="_blank" href="https://accelerate-digital.paperturn-view.com/?pid=ODg8871976&v=8.5&p=1&source=qr" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Download our Brochure</a>
                            <a href="/" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Feedback & Reviews</a>
                            <a href="/suppliers" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Become a PlanMyLuxe Supplier</a>
                            <a href="/suppliers" className="py-1 text-pml-primary text-sm hover:text-pml-primary/80">Interesting in Work for Us</a>
                          </div>
                        </div>

                        {/* Image Card - Desktop only */}
                        <div className="hidden xl:flex xl:flex-[0_0_36%] items-center justify-end">
                          <ImageCard
                            href="https://accelerate-digital.paperturn-view.com/?pid=ODg8871976&v=8.5&p=1&source=qr"
                            target="_blank"
                            imageSrc="/assets/images/menu-image-3.png"
                            text="Download our latest brochure"
                            alt="Download our latest brochure"
                          />
                        </div>
                      </div>
                    </MegaMenu>
                    </div>
                  </li>
                </ul>
                <div className="mt-4 xl:mt-0 border-t xl:border-t-0 pt-4 xl:pt-0 px-2 bg-[#FBE8F4] rounded-[8px]">
                  <PhoneNumber>
                    {({ phoneDisplay, phoneTel }) => (
                      <a href={`tel:${phoneTel}`} className="flex items-center justify-center xl:justify-start gap-2 py-2 hover:opacity-80 transition-opacity">
                        <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M22.0505 10.5542L22.0354 10.5573V8.89424C22.0354 4.27154 18.1138 0.509766 13.2936 0.509766H10.7878C5.96758 0.509766 2.04749 4.27004 2.04749 8.89424V10.5648C2.0098 10.5648 1.97211 10.5527 1.93291 10.5527C0.866943 10.5527 0 11.4423 0 12.5384V16.5897C0 17.6873 0.866943 18.5708 1.93291 18.5708C2.02639 18.5708 2.12137 18.5542 2.21184 18.5422C3.08481 21.1521 6.25405 23.1649 10.1862 23.5388C10.6054 24.0921 10.7863 24.4902 12.0694 24.4902C13.7158 24.4902 14.9536 23.8418 14.9536 23.0412C14.9536 22.2421 13.7158 21.5923 12.0694 21.5923C10.7968 21.5923 10.6204 21.9843 10.1937 22.5301C6.64305 22.1758 3.80701 20.4042 3.12853 18.1366C3.80249 18.1366 4.35884 17.2199 4.35884 16.5882V16.4042H4.36789V8.80679C4.36789 4.96661 6.65661 3.35183 10.7878 3.35183H13.2936C17.4142 3.35183 19.5401 4.91384 19.5401 8.82337V16.4223H19.5613V16.5882C19.5613 17.6858 20.6951 18.4291 21.7716 18.4291C22.8481 18.4291 24 17.6858 24 16.5882V12.5369C23.9985 11.4438 23.127 10.5542 22.0505 10.5542Z" fill="#CB2187" />
                        </svg>
                        <span className="font-['Montserrat'] font-semibold text-lg text-pml-primary">{phoneDisplay}</span>
                      </a>
                    )}
                  </PhoneNumber>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
