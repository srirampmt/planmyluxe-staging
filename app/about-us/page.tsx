import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "About Plan My Luxe | Luxury Travel Experts",
	description: "Discover Plan My Luxe, specialists in luxury holidays, tailor-made travel, exclusive stays and unforgettable experiences worldwide.",
};

export default function AboutUsPage() {
	return (
		<section className="w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] relative bg-white font-['Montserrat'] my-2 md:my-8">
            <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]">
                <div className="w-full max-w-[1280px] mx-auto">
                    <div className="block md:grid md:grid-cols-2 md:gap-x-16 md:gap-y-8 pt-16">
                        <div className="md:col-span-2 mb-0">
                            <h2>
                                <strong className="text-[#cb2187] font-bold mt-8 mb-2 text-[24px]">
                                    Indulge in Luxe Getaways Without the Luxe PriceTag&mdash;Discover
                                    PlanMyLuxe
                                </strong>
                            </h2>
                            <p className="text-[#595859] mb-1">
                                At PlanMyLuxe we believe that luxury and affordability can go hand
                                in hand. Our mission is to offer you bespoke holiday experiences
                                that combine opulence with exceptional value. From the moment you
                                reach out to us, we are dedicated to crafting a personalised journey
                                that exceeds your expectations while staying within your budget.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-[#cb2187] font-bold mt-4 mb-2 text-[24px]">
                                <strong className="font-semibold">Our Ethos</strong>
                            </h2>
                            <p className="text-[#595859] mb-6">
                                Our mission is to make luxury travel accessible without compromising
                                on quality. We believe that a premium holiday experience should be
                                within reach for everyone. Our carefully curated packages and
                                personalized service ensure that every detail is tailored to your
                                needs, offering exceptional value and style.
                            </p>

                            <h2 className="text-[#cb2187] font-bold mt-8 mb-2 text-[24px]">
                                <strong className="font-semibold">How We Work</strong>
                            </h2>
                            <p className="text-[#595859] mb-6">
                                Our approach is simple yet effective. We leverage our extensive
                                industry expertise and strong relationships with top travel partners
                                to design tailor-made holiday experiences.
                            </p>
                            <p className="text-[#595859] mb-6">
                                From the initial consultation to your return home, our dedicated
                                team will handle every aspect of your trip, ensuring a seamless and
                                luxurious journey. Each itinerary is crafted with meticulous
                                attention to detail, ensuring you receive the very best in comfort
                                and convenience.
                            </p>

                            <h2 className="text-[#cb2187] font-bold mt-8 mb-2 text-[24px]">
                                <strong className="font-semibold">Full Financial Protection</strong>
                            </h2>
                            <p className="text-[#595859] mb-6">
                                We are proud members of the Travel Trust Association (TTA) and hold
                                a fully bonded ATOL License, ensuring 100% financial security for
                                flight-inclusive packages. Unlike other travel associations, the TTA
                                guarantees complete financial protection by using a trust account
                                for your payments. When you book with us, your money is held
                                securely in a TTA-managed account and is only accessed after your
                                holiday.
                            </p>
                            <p className="text-[#595859] mb-6">
                                This means that if we were to face financial difficulties, your
                                funds are protected. Should the unexpected occur, you can contact
                                the TTA for an alternative holiday or a full refund, giving you
                                peace of mind and complete confidence in your booking.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-[#cb2187] font-bold mt-8 mb-2 text-[24px]">
                                <strong className="font-semibold">
                                    Flexible Booking &amp; Payment Options
                                </strong>
                            </h2>
                            <p className="text-[#595859] mb-6">
                                At PlanMyLuxe, we understand that travel plans can change, which is
                                why we offer flexible booking and payment options to suit your
                                needs. Our hassle-free booking process allows you to customize your
                                trip with ease, while our range of payment plans ensures you can
                                secure your dream holiday without financial stress. From low
                                deposits to installment payments, we provide choices that make
                                luxury travel accessible and convenient. Enjoy peace of mind knowing
                                that your plans can adapt as needed, giving you the freedom to book
                                with confidence.
                            </p>

                            <h2 className="text-[#cb2187] font-bold mt-8 mb-2 text-[24px]">
                                <strong className="font-semibold">Experience the Difference</strong>
                            </h2>
                            <p className="text-[#595859] mb-6">
                                Join us at PlanMyLuxe and embark on a journey where luxury meets
                                affordability.
                            </p>
                            <p className="text-[#595859] mb-6">
                                Our exclusive 5-star holiday packages can take you to every corner
                                of the globe, ranging from luxury all-inclusive holidays in Europe
                                and the UAE, to luxury family holidays to Mexico and the Caribbean.
                            </p>
                            <p className="text-[#595859] mb-6">
                                Explore our exclusive holiday packages today and let us help you
                                create the perfect escape. Your dream trip awaits&mdash;let&apos;s make
                                it a reality.
                            </p>

                            <h2 className="text-[#cb2187] font-bold mt-8 mb-2 text-[24px]">
                                <strong className="font-semibold">What our customers are saying</strong>
                            </h2>
                            <p className="text-[#595859] mb-6">
                                At PlanMyLuxe, we take pride in delivering exceptional travel
                                experiences, and our customers consistently share their satisfaction
                                on Trustpilot. With glowing reviews highlighting our personalized
                                service and seamless booking process, we are dedicated to ensuring
                                every journey exceeds expectations. Join our community of happy
                                travelers and see why so many choose PlanMyLuxe for their holiday
                                adventures.
                            </p>

                            <h2 className="text-[#cb2187] font-bold mt-8 mb-2 text-[24px]">
                                <strong className="font-semibold">
                                    Sign up to receive exclusive offers
                                </strong>
                            </h2>
                            <p className="text-[#595859] mb-16">
                                Join our exclusive travel club to access members-only offers and
                                unbeatable deals on luxury getaways. Sign up today to stay informed
                                about our curated promotions and enjoy fantastic savings on your
                                next dream holiday.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
	);
}
