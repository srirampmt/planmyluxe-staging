import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Payment Options | Secure Travel Payments",
	description: "Explore secure and flexible payment options for your luxury holiday bookings with Plan My Luxe travel services.",
};

export default function PaymentOptionsPage() {
    const headingClass = "text-[#cb2187] font-semibold mt-8 mb-2 text-[24px]";
    const paragraphClass = "text-[#595859] mb-6";
    const listClass = "text-[#595859] mb-6 pl-5";
    const listItemClass = "mb-2";

    return (
        <section className="w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] relative bg-white font-['Montserrat'] my-2 md:my-8">
            <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]">
                <div className="w-full max-w-[1280px] mx-auto">
                    <div>
                        <div>
                            <h2 className={headingClass}>Paying for Your Holiday</h2>
                            <p className={paragraphClass}>
                                There are several ways for you to pay for your holiday.
                            </p>
                        </div>

                        <div>
                            <h2 className={headingClass}>By Deposit</h2>
                            <p className={paragraphClass}>
                                If your departure date is 12 or more weeks away we are pleased to
                                offer the option for you to spread the cost of your holiday with our
                                low deposit payment scheme. Simply pay a deposit from £150 per
                                person and choose to pay the remainder in one further payment 12
                                weeks before departure, or in multiple smaller payments of your
                                choosing. Please check with our Travel Experts as to which holidays
                                are eligible for payment by deposit.
                            </p>
                        </div>

                        <div>
                            <h2 className={headingClass}>Payment In Full</h2>
                            <p className={paragraphClass}>
                                You can pay your balance in full at the time of booking by any of
                                the following methods:
                            </p>
                            <ul className={listClass}>
                                <li className={listItemClass}>Online</li>
                                <li className={listItemClass}>Over the telephone</li>
                                <li className={listItemClass}>By bank transfer</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className={headingClass}>Accepted Payment Methods</h2>
                            <p className={paragraphClass}>
                                You can pay for your holiday with any of the methods listed below –
                                neither debit or credit cards will incur additional charges.
                            </p>
                            <ul className={listClass}>
                                <li className={listItemClass}>Visa</li>
                                <li className={listItemClass}>Mastercard</li>
                                <li className={listItemClass}>Maestro</li>
                                <li className={listItemClass}>American Express</li>
                                <li className={listItemClass}>AMEX Bank Transfer</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}