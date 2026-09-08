import PhoneNumber from "@/components/utm/PhoneNumber";
import { DEFAULT_CALL_PHONE_DISPLAY } from "@/lib/phone";
import { Metadata } from "next";

type PolicySubSection = {
    title: string;
    paragraphs?: string[];
    bullets?: string[];
};

type PolicySection = {
    id: string;
    title: string;
    paragraphs?: string[];
    bullets?: string[];
    subSections?: PolicySubSection[];
};

const highlights = [
    { label: "Trading Name", value: "Plan My Tour LTD (PlanMyLuxe)" },
    { label: "Policy Scope", value: "Website, associated links, and services" },
    { label: "Data Sales", value: "We do not sell, rent, or trade personal data" },
    { label: "Cookie Usage", value: "Used to improve functionality and experience" },
] as const;

const introParagraphs = [
    "PlanMyLuxe operates under the trading name of Plan My Tour LTD. We value customer privacy and maintaining confidentiality.",
    "This Privacy Policy explains how we collect, store, use, delete, and disclose personal information provided when users visit and interact with our website and services.",
    "PlanMyLuxe does not sell, rent, or trade personal information to other entities. Personal details are not disclosed without consent unless required by law or emergency circumstances.",
    "Please review this statement carefully to understand your privacy rights and how your information is handled.",
];

const sections: PolicySection[] = [
    {
        id: "consent",
        title: "Consent",
        paragraphs: [
            "By accessing, browsing, and using this website, you consent to the collection, storage, and use of personal data as described in this Privacy Policy and elsewhere on the PlanMyLuxe website.",
            "Users who do not agree to these conditions should refrain from accessing or using this website.",
        ],
    },
    {
        id: "information-we-collect",
        title: "What Information We Collect",
        paragraphs: [
            "We may collect information from users transacting with us online, in person, or over calls. Additional information may be required depending on booking circumstances.",
        ],
        bullets: [
            "Full name, nationality, date of birth, gender, marital status, address, phone number, and other contact details.",
            "Passport number and complete passport details.",
            "Credit and/or debit card details for payment purposes.",
            "Demographic details such as holiday preferences, interests, and family information.",
            "Details of fellow travellers, including relevant personal and passport information.",
            "Disability, dietary, allergy, illness, or medical information needed for booking requirements.",
            "Records of interactions via calls, website forms, chat, email, messages, or in-person conversations.",
            "Transactional history and interest in products and services.",
            "Reviews, comments, complaints, messages, and post-holiday feedback.",
            "Online behavioural data including IP address, browser details, and visited pages.",
            "Loyalty membership, reward points, and frequent flyer details where applicable.",
            "Images, videos, recordings, and other submitted content.",
            "CCTV footage when users visit office premises.",
            "Public and third-party postings relating to PlanMyLuxe, including social and review platforms.",
        ],
    },
    {
        id: "how-we-collect",
        title: "How We Collect Information",
        subSections: [
            {
                title: "I. Directly",
                bullets: [
                    "When you contact, transact, or communicate with us, including recorded calls, chats, emails, and messages.",
                    "When you submit forms, subscribe to newsletters, or provide feedback voluntarily.",
                    "When you provide medical, dietary, accessibility, and travel preference details for booking support.",
                    "When information is provided during physical office visits.",
                ],
            },
            {
                title: "II. Indirectly",
                bullets: [
                    "Automatically through software tools tracking website usage patterns and booking behaviour.",
                    "Through third-party websites, agents, social media, and travel sources used to contact us.",
                    "Through public sources such as online content and internet searches.",
                    "From business clients who engage our services and may require us to process controlled personal data.",
                ],
            },
        ],
    },
    {
        id: "data-security",
        title: "Data Security - Ensuring User Privacy",
        paragraphs: [
            "We apply data security measures, including encryption and organisational controls, to protect personal information from misuse, loss, theft, and unauthorised alteration.",
            "Security systems, policies, and practices are reviewed and updated as required.",
            "Users should keep passwords, login credentials, and payment details confidential and use secure devices for account access.",
            "Although safeguards are in place, internet transmission cannot be guaranteed as fully secure. PlanMyLuxe is not liable for unauthorised access, transmission errors, or causes beyond our control.",
        ],
    },
    {
        id: "how-we-use-data",
        title: "How We Use Your Personal Information",
        paragraphs: [
            "Personal information is used where contractually necessary to process bookings and provide services.",
            "Information may also be used to support requests, communicate offers and updates, and improve website experience through aggregated insights.",
        ],
        bullets: [
            "Create and manage user accounts.",
            "Keep customer records current with updated details.",
            "Supply booked products and services.",
            "Provide quotes, deals, and requested travel information.",
            "Improve customer support standards and service quality.",
            "Tailor products and services to user requirements where possible.",
            "Enhance existing offerings and develop new services.",
            "Send itinerary, flight, cancellation, verification, and alert communications.",
            "Share relevant special occasion offers and promotions.",
            "Request reviews, feedback, and recommendations.",
        ],
    },
    {
        id: "third-party-disclosure",
        title: "Disclosure of Information to Third Parties",
        paragraphs: [
            "Personal data may be shared with relevant entities where permitted by applicable law.",
        ],
        subSections: [
            {
                title: "Service Providers",
                paragraphs: [
                    "Data may be shared with third-party providers such as airlines, transport companies, hotels, and related suppliers to complete bookings. Some providers may operate outside the UK/EEA.",
                ],
            },
            {
                title: "Business Partners",
                paragraphs: [
                    "Where services are offered jointly, information may be shared with partners and users may be redirected to partner sites with notice.",
                ],
            },
            {
                title: "Market Research and Analysis",
                paragraphs: [
                    "Information may be shared with search engines, social media, and relevant platforms for targeted marketing and analytics activities.",
                ],
            },
            {
                title: "Legal Obligation",
                paragraphs: [
                    "Information may be disclosed to meet regulatory, reporting, subpoena, litigation, or legal protection requirements.",
                ],
            },
            {
                title: "Contractual Obligation",
                paragraphs: [
                    "Information may be shared in corporate transactions such as mergers, sales, consolidation, divestiture, or bankruptcy where legally required.",
                ],
            },
        ],
    },
    {
        id: "links-promotions",
        title: "Links and Promotional Messages",
        paragraphs: [
            "Our website may contain links to external resources. These sites are not governed by this Privacy Policy and PlanMyLuxe does not control their data practices.",
            "Users should review third-party privacy policies before sharing personal information on external platforms.",
        ],
    },
    {
        id: "cookie-policy",
        title: "Cookie Policy",
        paragraphs: [
            "Cookies may be used to improve functionality, performance, and user experience. Cookies are text files stored in your browser to remember preferences.",
            "Cookies may provide information such as IP address, browser type, version, and page activity. On their own, these cookies generally do not identify users unless linked with data already provided.",
            "By continuing to use our website, you consent to cookie use in line with applicable terms.",
        ],
        subSections: [
            {
                title: "Types of Cookies",
                paragraphs: [
                    "These may include strictly necessary cookies (booking and session security), performance/analytics cookies (traffic and performance insights), functional cookies (preferences like currency and destination), and advertising/targeting cookies used by third parties.",
                ],
            },
            {
                title: "Opting Out of Cookies",
                paragraphs: [
                    "Most browsers accept cookies automatically, but settings can be changed to block them. Blocking cookies may limit access to parts of the website or reduce feature functionality.",
                ],
            },
        ],
    },
    {
        id: "data-retention",
        title: "Data Retention",
        paragraphs: [
            "We retain personal information as long as necessary to provide services and meet legitimate business or legal requirements, including investigations, litigation holds, and statutory obligations.",
            "When data is no longer required for original purposes, we may process it by anonymising, pseudonymising, or securely erasing/storing it according to applicable law.",
            "We may retain information after account suspension or termination where legitimately required by law or compliance obligations.",
        ],
        bullets: [
            "Anonymise information for present or future analytical use.",
            "Pseudonymise information where future significant processing may be required.",
            "Erase information from active systems or archive it in a secure non-operational manner.",
        ],
    },
    {
        id: "your-rights",
        title: "Your Data Protection Rights",
        subSections: [
            {
                title: "Accessing Your Details",
                paragraphs: [
                    "You may request access to a copy of your personal information for review, correction, or modification by submitting a signed and dated written request by email.",
                ],
            },
            {
                title: "Complaints",
                paragraphs: [
                    "You may raise a complaint by email if you believe personal data has been handled improperly. Complaints are reviewed in accordance with applicable law.",
                ],
            },
            {
                title: "Withdrawing Consent",
                paragraphs: [
                    "You may withdraw consent for one or more stated purposes. Withdrawal does not affect processing lawfully carried out before withdrawal.",
                    "After withdrawal, access to some products, services, or website features may be limited.",
                ],
            },
            {
                title: "Unsubscribe",
                paragraphs: [
                    "You may unsubscribe from marketing emails using unsubscribe links or by contacting us directly.",
                ],
            },
            {
                title: "Data Erasure",
                paragraphs: [
                    "You may request deletion of personal information after withdrawing consent, subject to lawful retention requirements and regulatory obligations.",
                ],
            },
        ],
    },
    {
        id: "minors",
        title: "Minors",
        paragraphs: [
            "Minors or legally under-aged users are not permitted to transact on the website for product or service purchases.",
            "PlanMyLuxe does not knowingly solicit personal data from minors. Parents and guardians are responsible for supervising access and protecting account details.",
            "Where collection of minor data is necessary for travel bookings, information is handled in line with legal requirements and heightened safeguards.",
        ],
    },
    {
        id: "policy-amendments",
        title: "Amendments and Revisions",
        paragraphs: [
            "PlanMyLuxe may amend, modify, or replace this Privacy Policy at any time to meet business, customer, or legal requirements.",
            "Users are advised to check this page periodically. Continued use of the website after updates indicates acceptance of revised terms.",
        ],
    },
    {
        id: "contact-us",
        title: "Contact Us",
        paragraphs: [
            "If you have questions, comments, or concerns about this Privacy Policy or your personal data rights, contact our team.",
        ],
        bullets: [
            `Call: ${DEFAULT_CALL_PHONE_DISPLAY}`,
            "Email: customer.support@planmyluxe.co.uk",
            "Write to: PlanMyTour Ltd t/a PlanMyLuxe, 314 Midsummer Boulevard, Milton Keynes, Bedfordshire, MK9 2UB",
        ],
    },
    {
        id: "disclaimer",
        title: "Disclaimer",
        paragraphs: [
            "This Privacy Policy does not apply to third-party websites, mobile applications, advertisers, sponsors, or other external entities, even where associated with PlanMyLuxe.",
            "Third-party privacy policies may differ and users should review those policies independently during the booking process.",
        ],
    },
];

export const metadata: Metadata = {
	title: "Privacy Policy | Plan My Luxe",
	description: "Read the Plan My Luxe privacy policy to learn how your personal information is collected, stored and protected.",
};

export default function PrivacyPolicyPage() {
    return (
        <section className="relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] w-screen bg-[radial-gradient(circle_at_top_right,_#FDECF6_0%,_#FFFFFF_48%,_#FFF7FC_100%)] font-['Montserrat'] py-4 md:py-10">
            <div className="mx-auto w-full max-w-[1440px] px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]">
                <div className="mx-auto w-full max-w-[1280px]">
                    <header className="overflow-hidden rounded-[20px] border border-[#F1D3E7] bg-white shadow-[0px_10px_32px_rgba(203,33,135,0.08)]">
                        <div className="bg-[linear-gradient(115deg,#CB2187_0%,#E14EA3_45%,#F58BC4_100%)] px-6 py-8 md:px-10 md:py-10">
                            <p className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                                Legal Information
                            </p>
                            <h1 className="mt-4 text-[30px] font-bold leading-[120%] text-white md:text-[42px]">
                                Privacy Policy
                            </h1>
                            <p className="mt-3 max-w-[860px] text-[14px] leading-[170%] text-white/95 md:text-[16px]">
                                This page explains how PlanMyLuxe collects, uses, stores, and protects your personal information when you interact with our website and services.
                            </p>
                            <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/80">
                                Static policy page from provided Privacy Policy document
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-0 border-t border-[#F7DFEE] md:grid-cols-2 lg:grid-cols-4">
                            {highlights.map((item) => (
                                <div key={item.label} className="border-b border-[#F7DFEE] px-5 py-4 md:[&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0 lg:border-r lg:[&:last-child]:border-r-0">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A06A8D]">{item.label}</p>
                                    <p className="mt-1 text-[14px] font-semibold leading-[145%] text-[#3F2D3A]">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </header>

                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
                        <aside className="lg:sticky lg:top-[calc(var(--main-nav-height,0px)+20px)] lg:self-start">
                            <div className="rounded-[16px] border border-[#EED7E8] bg-white p-4 shadow-[0px_6px_22px_rgba(35,26,33,0.05)]">
                                <h2 className="text-[14px] font-bold uppercase tracking-[0.11em] text-[#CB2187]">On This Page</h2>
                                <nav className="mt-3 max-h-[66vh] space-y-1 overflow-auto pr-1">
                                    {sections.map((section) => (
                                        <a
                                            key={section.id}
                                            href={`#${section.id}`}
                                            className="block rounded-[8px] px-3 py-2 text-[13px] font-medium leading-[145%] text-[#594E58] transition-colors hover:bg-[#FCEEF7] hover:text-[#CB2187]"
                                        >
                                            {section.title}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        </aside>

                        <article className="space-y-6">
                            <section className="rounded-[16px] border border-[#EFE2EC] bg-white p-5 shadow-[0px_6px_24px_rgba(25,20,23,0.04)] md:p-7">
                                <h2 className="text-[22px] font-bold leading-[125%] text-[#372A33] md:text-[28px]">Policy Overview</h2>
                                <div className="mt-4 space-y-3 text-[15px] leading-[175%] text-[#595859] md:text-[16px]">
                                    {introParagraphs.map((paragraph) => (
                                        <p key={paragraph}>{paragraph}</p>
                                    ))}
                                </div>
                            </section>

                            {sections.map((section) => (
                                <section
                                    key={section.id}
                                    id={section.id}
                                    className="scroll-mt-[calc(var(--main-nav-height,0px)+24px)] rounded-[16px] border border-[#EFE2EC] bg-white p-5 shadow-[0px_6px_24px_rgba(25,20,23,0.04)] md:p-7"
                                >
                                    <h2 className="text-[21px] font-bold leading-[130%] text-[#352831] md:text-[26px]">{section.title}</h2>

                                    {section.paragraphs && section.paragraphs.length > 0 && (
                                        <div className="mt-4 space-y-3 text-[15px] leading-[175%] text-[#595859] md:text-[16px]">
                                            {section.paragraphs.map((paragraph) => (
                                                <p key={paragraph}>{paragraph}</p>
                                            ))}
                                        </div>
                                    )}

                                    {section.bullets && section.bullets.length > 0 && (
                                        <ul className="mt-4 space-y-2 pl-5 text-[15px] leading-[170%] text-[#595859] marker:text-[#CB2187] md:text-[16px]">
                                            {section.bullets.map((bullet) => (
                                                <li key={bullet}>
                                                    {section.id === "contact-us" && bullet === "Email: customer.support@planmyluxe.co.uk" ? (
                                                        <>
                                                            <span className="font-bold">Email:{" "}</span>
                                                            <a
                                                                href="mailto:customer.support@planmyluxe.co.uk"
                                                                className="font-semibold text-[#CB2187] underline decoration-[#CB2187]/50 underline-offset-2 hover:text-[#A71C70]"
                                                            >
                                                                customer.support@planmyluxe.co.uk
                                                            </a>
                                                        </>
                                                    ) : section.id === "contact-us" && bullet === `Call: ${DEFAULT_CALL_PHONE_DISPLAY}` ? (
                                                        <>
                                                            <span className="font-bold">Call:{" "}</span>
                                                            <PhoneNumber
                                                                asLink
                                                                className="font-semibold text-[#CB2187] underline decoration-[#CB2187]/50 underline-offset-2 hover:text-[#A71C70]"
                                                            />
                                                        </>
                                                    ) : (
                                                        bullet
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {section.subSections && section.subSections.length > 0 && (
                                        <div className="mt-5 space-y-5">
                                            {section.subSections.map((subSection) => (
                                                <div key={subSection.title} className="rounded-[12px] border border-[#F3E2ED] bg-[#FFF9FD] p-4 md:p-5">
                                                    <h3 className="text-[16px] font-bold text-[#493543] md:text-[18px]">{subSection.title}</h3>

                                                    {subSection.paragraphs && subSection.paragraphs.length > 0 && (
                                                        <div className="mt-3 space-y-3 text-[14px] leading-[170%] text-[#595859] md:text-[15px]">
                                                            {subSection.paragraphs.map((paragraph) => (
                                                                <p key={paragraph}>{paragraph}</p>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {subSection.bullets && subSection.bullets.length > 0 && (
                                                        <ul className="mt-3 space-y-2 pl-5 text-[14px] leading-[165%] text-[#595859] marker:text-[#CB2187] md:text-[15px]">
                                                            {subSection.bullets.map((bullet) => (
                                                                <li key={bullet}>{bullet}</li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            ))}
                        </article>
                    </div>
                </div>
            </div>
        </section>
    );
}
