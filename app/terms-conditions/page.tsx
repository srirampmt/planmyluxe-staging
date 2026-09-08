import { Metadata } from "next";
import Link from "next/link";

type TermsSubSection = {
	title: string;
	paragraphs?: string[];
	bullets?: string[];
};

type TermsSection = {
	id: string;
	title: string;
	paragraphs?: string[];
	bullets?: string[];
	subSections?: TermsSubSection[];
};

const quickFacts = [
	{ label: "Trading Name", value: "Plan My Tour Ltd (PlanMyLuxe)" },
	{ label: "Registered Address", value: "Regus, 314 Midsummer Boulevard, Milton Keynes, MK9 2UB, UK" },
	{ label: "TTA Membership", value: "Q6399" },
	{ label: "ATOL Number", value: "T7655" },
	{ label: "Minimum Booking Age", value: "18 years" },
	{ label: "Governing Law", value: "English Law" },
] as const;

const introParagraphs = [
	"PlanMyLuxe operates under the registered trade name of Plan My Tour Ltd. We act only as an agent when booking and making reservations on your behalf.",
	"Your contract for travel products and services is with the relevant Provider or Principal. Provider booking conditions may limit and/or exclude their liability.",
	"By browsing, accessing, and transacting on our website, you agree to these Terms and Conditions, along with any related website policies and future updates.",
	"These terms form a binding agreement and apply immediately to your continued use of this website.",
];

const sections: TermsSection[] = [
	{
		id: "agreement",
		title: "Agreement Between PlanMyLuxe and Our Clients",
		subSections: [
			{
				title: "User Account",
				paragraphs: [
					"Registration is optional, but where used, users must provide true, accurate, and complete information.",
					"If information is false, inaccurate, or incomplete, we may suspend or terminate the account and refuse current or future access.",
					"Users are solely responsible for keeping account credentials secure and must not use another person's account without proper authorization.",
				],
			},
			{
				title: "Limited User",
				paragraphs: [
					"Users must not sell, resell, exploit, reverse engineer, modify, copy, reproduce, distribute, publish, or transfer website content, products, services, or software for unauthorized purposes.",
					"Limited sharing may be allowed where PlanMyLuxe is credited and prior permission is obtained where required.",
				],
			},
			{
				title: "Unlawful Use Is Prohibited",
				paragraphs: [
					"Users must not use this website for unlawful, illegal, or unethical activity in the UK or elsewhere.",
					"Users must not impair the website, interfere with others' access, or attempt to obtain data not intentionally made available on the site.",
				],
			},
			{
				title: "User Obligations",
				paragraphs: [
					"Users must be at least 18 years old and legally able to enter binding contracts.",
					"Users are responsible for obtaining and paying for the tools and services needed to access this website, including internet access and related charges.",
				],
			},
		],
	},
	{
		id: "financial-protection",
		title: "TTA and ATOL Protection",
		paragraphs: [
			"We provide financial protection through the Travel Trust Association (TTA), Membership Number Q6399.",
			"PlanMyLuxe is ATOL certified under ATOL Number T7655.",
			"When booking an ATOL-protected flight or flight-inclusive package, customers receive an ATOL Certificate confirming what is financially protected and who to contact in emergencies.",
			"Protection is provided by suppliers listed on your ATOL Certificate, or an appropriate alternative where applicable under booking conditions.",
		],
	},
	{
		id: "booking-terms",
		title: "Booking Terms and Conditions",
		paragraphs: [
			"By booking through us, users confirm they are 18 or over and accept these terms, the Privacy Policy, and other applicable policies across the website.",
			"Users are responsible for providing accurate and lawful information for all travelers in their group and for full payment obligations.",
			"We act as a booking agent only. Contracts for flights, accommodation, transfers, and related services are with the relevant third-party Provider or Supplier.",
			"If a booking is canceled by a Provider, users should contact us promptly so we can assist with applicable refund processes.",
			"Where full payment is not made within required timelines, Providers may cancel reservations and apply cancellation fees.",
			"Content and service information from third-party Providers may change and is supplied based on Provider data.",
			"If users rely solely on images or descriptions without additional checks, they do so at their own discretion.",
		],
	},
	{
		id: "prices-fares",
		title: "Prices and Fares",
		paragraphs: [
			"Displayed prices for holidays, hotels, flights, transfers, and other services generally include applicable taxes unless otherwise stated.",
			"Personal expenses and excluded extras are not included unless explicitly shown.",
			"Prices and fares may change due to seasonality, availability, destination factors, currency exchange, market conditions, and local taxes.",
			"Final total cost is determined at payment stage. Users agree to pay applicable increases, taxes, and surcharges outside our control.",
		],
	},
	{
		id: "payments-refunds",
		title: "Payment Policies and Refund Terms",
		paragraphs: [
			"Users agree to pay the deposit amount required by the relevant Provider at booking.",
			"Full payment is due within 12 weeks of scheduled departure unless Provider terms state otherwise.",
			"Failure to pay may result in deposit retention, cancellation, and cancellation charges.",
			"Any applicable refunds are processed as soon as reasonably possible and usually returned to the original payment method.",
			"Refund eligibility is subject to Provider and supplier terms, and cannot be guaranteed.",
			"Payments may be made through available methods shown at checkout, using legitimate and valid payment details.",
		],
	},
	{
		id: "price-hikes",
		title: "Hikes in Prices, Taxes, and Tariffs",
		paragraphs: [
			"Users accept that sudden increases in fares, taxes, tariffs, fuel costs, guide charges, and related travel costs may arise before or after booking.",
			"Where applicable, customers remain responsible for additional amounts resulting from such revisions, including government-imposed changes.",
		],
	},
	{
		id: "amendments-cancellations",
		title: "Amendments and Cancellations",
		subSections: [
			{
				title: "By You",
				paragraphs: [
					"Requests to amend or cancel must be submitted in writing by email and take effect after receipt and confirmation.",
					"For group bookings, amendment or cancellation requests should come from the lead booking authority.",
					"All changes are subject to availability, Provider terms, and any applicable fees.",
					"Some Providers do not allow changes after booking; cancellations and related charges may then apply.",
				],
			},
			{
				title: "By Supplier",
				paragraphs: [
					"Where a Supplier changes or cancels confirmed arrangements, we will notify users as soon as reasonably possible.",
					"Transport-specific cancellations are governed by the relevant transport provider's own booking and refund conditions.",
					"We will assist communication with Providers regarding alternatives, but we do not assume liability for Provider decisions.",
				],
			},
		],
	},
	{
		id: "website-access",
		title: "Terms of Website Access and Use",
		bullets: [
			"You confirm you are of legal age and can provide proof if requested.",
			"You confirm legal authority to enter into binding agreements.",
			"You will use this website only as permitted by these terms.",
			"You will inform all group members of applicable booking terms and your acceptance of them.",
			"All details provided must be genuine, accurate, and complete.",
			"You are responsible for safeguarding account credentials and sensitive information.",
			"You are responsible for monitoring account usage, including preventing unauthorized minor access.",
			"We may deny website access for breaches of this agreement.",
		],
	},
	{
		id: "passport-visa",
		title: "Passport, Visa, and Immigration Requirements",
		paragraphs: [
			"Users are responsible for holding valid travel documents, including passport and visa where required.",
			"Document and entry requirements can change without notice; users must verify current rules with embassies, consulates, and official authorities.",
			"Users should review latest UK government travel advisories and take full responsibility for travel decisions.",
		],
	},
	{
		id: "indemnity",
		title: "Indemnity",
		paragraphs: [
			"Users agree to indemnify PlanMyLuxe and associated companies, partners, directors, employees, and agents against claims, losses, costs, penalties, and legal expenses arising from user actions where not caused by us.",
		],
		bullets: [
			"Use of this website and its services/products.",
			"Breach of law, rights, or provider terms.",
			"Negligence or breach of website agreements and policies.",
			"Misconduct during travel or related arrangements.",
			"Failure to hold valid passport or required travel documents.",
			"Omission of key personal details needed for booking processing.",
		],
	},
	{
		id: "third-party",
		title: "Third-Party Service Providers",
		paragraphs: [
			"PlanMyLuxe does not control, guarantee, endorse, or assume liability for third-party products, services, content, or marketplace listings.",
			"We disclaim responsibility for deficiencies in third-party services or differences between expected and delivered services.",
			"Users should review each supplier's terms before booking. Ongoing transactions with suppliers are at user discretion and risk.",
		],
	},
	{
		id: "communication-policy",
		title: "Communication Policy",
		bullets: [
			"Users agree to receive booking-related emails, offers, and updates based on provided contact details.",
			"Users may also receive SMS or text updates to support booking communication.",
			"We are not liable where users miss updates due to incorrect personal contact details.",
			"User-submitted communications (feedback, comments, suggestions, etc.) may be treated as non-confidential.",
			"We may store, review, disclose, adapt, publish, and use voluntarily submitted communications where legally or operationally required.",
			"Users must not upload malware, harmful files, chain letters, pyramid schemes, or unlawful promotional content.",
			"Users must not post abusive, threatening, defamatory, obscene, infringing, or otherwise unlawful content.",
			"Commercial advertising or resale through the website is not permitted without explicit written permission.",
			"We may moderate, remove, refuse, store, or disclose communications and suspend accounts for policy violations.",
			"We do not endorse or accept liability for user-generated communication content.",
		],
	},
	{
		id: "minors",
		title: "Unaccompanied Minors",
		paragraphs: [
			"Children and minors are subject to age rules of relevant jurisdictions and transport providers, and generally must travel with a legal guardian unless local law explicitly permits otherwise.",
			"Guardians are responsible for minor safety, security, and seating arrangements during travel.",
		],
	},
	{
		id: "medical-requests",
		title: "Medical Conditions, Disability, and Special Requests",
		paragraphs: [
			"Special requests such as wheelchair support, meal preferences, room accessibility, seat preferences, and similar needs must be submitted in writing at booking time.",
			"While we will try to help, fulfillment depends on third-party Providers and cannot be guaranteed.",
			"Users should disclose relevant medical conditions before travel so suitable arrangements can be attempted.",
			"If material requirements are not disclosed in writing at booking, accommodations may not be possible and cancellation charges may apply where bookings must be changed or canceled.",
		],
	},
	{
		id: "offers-interactions",
		title: "Contests, Special Offers, and Interactions",
		paragraphs: [
			"Offers and discounts are subject to their own terms, conditions, and availability at the time of booking.",
			"Contests, campaigns, and promotional programs run by us or third parties may require personal information and are governed by their specific rules.",
			"Users who do not agree with those rules or required data usage should not participate.",
		],
	},
	{
		id: "account-termination",
		title: "Right to Terminate Account and Restrict Access",
		paragraphs: [
			"PlanMyLuxe may terminate accounts, limit access, or end service relationships at its discretion and without prior notice where terms are breached or where otherwise deemed necessary.",
		],
	},
	{
		id: "behaviour",
		title: "Behaviour",
		paragraphs: [
			"Lead customers and all travelers are responsible for appropriate conduct and for avoiding behavior that causes harm, offence, distress, danger, or property damage.",
			"Suppliers may end arrangements and remove travelers from transport, accommodation, or tours for unacceptable conduct.",
			"In such cases, refunds may not be available and users may be liable for resulting losses and damages, including legal costs.",
			"We are not liable for actions of persons unrelated to your booking arrangements with us or our Providers.",
		],
	},
	{
		id: "copyright",
		title: "Copyright and Trademark",
		paragraphs: [
			"Website products, services, content, branding, and related materials are protected by copyright, trademark, and other proprietary rights.",
			"Unauthorized copying, reuse, distribution, modification, publication, or exploitation is prohibited and may result in civil or criminal action.",
			"Users must retain all copyright and trademark notices when permitted content is downloaded or accessed.",
			"Software and tools on this website are provided subject to their own conditions, and use is at user discretion.",
		],
	},
	{
		id: "privacy",
		title: "Data Protection and Privacy Policy",
		paragraphs: [
			"We treat data protection and confidentiality seriously and process personal information in line with applicable law and our Privacy Policy.",
			"Personal data may be collected to process bookings, provide support, and share relevant offers and updates.",
			"Please review our Privacy Policy for complete details on collection, storage, use, disclosure, and protection of personal information.",
		],
	},
	{
		id: "revisions",
		title: "Revisions to Terms of Use",
		paragraphs: [
			"PlanMyLuxe may amend these terms and related website policies at any time.",
			"Continued use of this website indicates acceptance of updated terms.",
		],
	},
	{
		id: "law-jurisdiction",
		title: "Law and Jurisdiction",
		paragraphs: [
			"These booking terms and website conditions are governed by English Law.",
			"Disputes are subject to the jurisdiction of the English Courts.",
		],
	},
	{
		id: "disclaimer",
		title: "Disclaimer - Limitation of Liability",
		paragraphs: [
			"PlanMyLuxe (Plan My Tour Ltd.) acts as a booking agent between users and third-party Providers.",
			"We are not liable for third-party obligations including pricing, availability, service quality, or delivery timelines.",
			"Use of the website, related tools, and purchases is at user discretion and risk, subject to applicable terms.",
			"Service interruptions may occur due to events beyond our control, including maintenance, technical failures, telecom issues, or supplier unavailability.",
			"Where bookings fail or are canceled, we may assist with alternatives where possible, but replacement services cannot be guaranteed.",
		],
	},
];

export const metadata: Metadata = {
	title: "Terms & Conditions | Plan My Luxe Travel",
	description: "Review Plan My Luxe terms and conditions for bookings, cancellations, payments and travel service policies.",
};

export default function TermsConditionsPage() {
	const renderSectionParagraph = (sectionId: string, paragraph: string) => {
		if (sectionId === "privacy" && paragraph.includes("Privacy Policy")) {
			const [before, after] = paragraph.split("Privacy Policy");

			return (
				<p>
					{before}
					<Link
						href="/privacy-policy"
						className="font-semibold text-[#CB2187] underline decoration-[#CB2187]/50 underline-offset-2 hover:text-[#A71C70]"
					>
						Privacy Policy
					</Link>
					{after}
				</p>
			);
		}

		return <p>{paragraph}</p>;
	};

	return (
		<section className="relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] w-screen bg-[radial-gradient(circle_at_top_right,_#FCECF6_0%,_#FFFFFF_50%,_#FFF8FC_100%)] font-['Montserrat'] py-4 md:py-10">
			<div className="mx-auto w-full max-w-[1440px] px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]">
				<div className="mx-auto w-full max-w-[1280px]">
					<header className="overflow-hidden rounded-[20px] border border-[#F1D3E7] bg-white shadow-[0px_10px_32px_rgba(203,33,135,0.08)]">
						<div className="bg-[linear-gradient(110deg,#CB2187_0%,#E04AA0_45%,#F67FBF_100%)] px-6 py-8 md:px-10 md:py-10">
							<p className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
								Legal Information
							</p>
							<h1 className="mt-4 text-[30px] font-bold leading-[120%] text-white md:text-[42px]">
								Booking Terms and Conditions
							</h1>
							<p className="mt-3 max-w-[860px] text-[14px] leading-[170%] text-white/95 md:text-[16px]">
								These terms govern your access to PlanMyLuxe and all bookings made through our platform. Please read them carefully before you browse, book, or transact.
							</p>
							<p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/80">
								Updated from attached Terms document
							</p>
						</div>

						<div className="grid grid-cols-1 gap-0 border-t border-[#F7DFEE] md:grid-cols-2 lg:grid-cols-3">
							{quickFacts.map((fact) => (
								<div key={fact.label} className="border-b border-[#F7DFEE] px-5 py-4 last:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-last-child(-n+3)]:border-b-0 lg:border-r lg:[&:nth-child(3n)]:border-r-0">
									<p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A06A8D]">{fact.label}</p>
									<p className="mt-1 text-[14px] font-semibold leading-[145%] text-[#3F2D3A]">{fact.value}</p>
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
								<h2 className="text-[22px] font-bold leading-[125%] text-[#372A33] md:text-[28px]">General Terms Overview</h2>
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
													<div key={paragraph}>{renderSectionParagraph(section.id, paragraph)}</div>
											))}
										</div>
									)}

									{section.bullets && section.bullets.length > 0 && (
										<ul className="mt-4 space-y-2 pl-5 text-[15px] leading-[170%] text-[#595859] marker:text-[#CB2187] md:text-[16px]">
											{section.bullets.map((bullet) => (
												<li key={bullet}>{bullet}</li>
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