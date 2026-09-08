"use client";

import React from "react";
import EnquiryModal from "./hotels/EnquiryModal";
import { buildEnquirySource } from "@/lib/source-builder";
import { openTawkChat } from "@/lib/tawk";

export default function ChatSection({chat_title, chat_subtitle}: {chat_title?: string, chat_subtitle?: string}) {
    const [isEnquiryOpen, setIsEnquiryOpen] = React.useState(false);
    const [pageRoute, setPageRoute] = React.useState<string>("/");

    React.useEffect(() => {
        if (typeof window === "undefined") return;
        const nextRoute = `${window.location.pathname || ""}${window.location.search || ""}`;
        setPageRoute(nextRoute || "/");
    }, []);
    const handleEnquireNow = () => {
        setIsEnquiryOpen(true);
    };

    const handleCloseEnquiry = () => {
        setIsEnquiryOpen(false);
    };

    const handleOpenTawk = () => {
        openTawkChat();
    };

    return(
        <>
            <EnquiryModal
                open={isEnquiryOpen}
                onClose={handleCloseEnquiry}
                initialValues={{
                    destination: "",
                    resort: "",
                    quoteRef: "",
                    dealdata: null,
                    source: buildEnquirySource({ section: "chat", pathname: pageRoute }),
                }}
            />
            <section className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] bg-white font-['Montserrat']">
                <div className="w-full max-w-[1440px] mx-auto px-4 md:px-10 py-[20px] md:py-[50px] lg:py-[50px]">
                    <div className="w-full max-w-[1280px] mx-auto">
                        {/* Header Section */}
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-[10px] md:mb-[20px] lg:mb-[25px]">
                            {/* Left side - Title and description */}
                            <div className="max-w-[700px] mb-[12px] lg:mb-0">
                                <h2 className="font-['Montserrat'] text-[#4c4c4c] text-[24px] sm:text-[32px] md:text-[40px] lg:text-[48px] font-semibold leading-[1.2] sm:leading-[1.25] md:leading-[1.3] lg:leading-[60px] tracking-[-0.005em] mb-[12px] sm:mb-[16px] md:mb-[20px] lg:mb-[24px]">
                                    {chat_title}
                                </h2>
                                <p className="font-['Montserrat'] text-[#4c4c4c] text-[14px] sm:text-[15px] md:text-[16px] lg:text-[18px] font-normal leading-[1.6] sm:leading-[1.7] md:leading-[1.75] lg:leading-[28px] tracking-[0] max-w-[580px]">
                                    {chat_subtitle}
                                </p>
                                <button
                                    type="button"
                                    onClick={handleOpenTawk}
                                    className="inline-flex items-center justify-center px-[28px] md:px-[36px] py-[12px] md:py-[14px] bg-pml-primary rounded-[8px] hover:bg-[#a30d4a] transition-all duration-300 mt-4"
                                >
                                    <span className="font-['Montserrat'] text-white text-[14px] md:text-[16px] font-semibold">
                                        Let&apos;s Chat
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}


