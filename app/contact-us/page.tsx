import PhoneNumber from "@/components/utm/PhoneNumber";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Contact Plan My Luxe | Luxury Travel Support",
	description: "Get in touch with Plan My Luxe for expert travel advice, booking support and personalised luxury holiday assistance.",
};

export default function ContactUsPage() {
  const headingClass = "text-[#cb2187] font-semibold mt-8 mb-3 text-[24px]";
  const paragraphClass = "text-[#595859] mb-4";
  const linkClass = "no-underline text-[#595859]";

  return (
    <section className="w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] relative bg-white font-['Montserrat'] my-2 md:my-8">
        <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]">
            <div className="w-full max-w-[1280px] mx-auto">
                <div className="block md:grid md:grid-cols-2 md:gap-x-16 md:gap-y-8">
                    <div>
                    <h2 className={headingClass}>Want to book a holiday?</h2>
                    <p className={paragraphClass}>
                        We&apos;ve tried to make it as easy as possible for you to
                        contact us whether you are looking at booking your holiday or if
                        you already have an existing booking. Our dedicated teams are on
                        hand to help with all your queries.
                    </p>

                    <div className="flex items-center mb-3 leading-[1.2] text-[#595859]">
                        <img
                        alt="Phone icon"
                        src="https://cdn.prod.website-files.com/66140c9a5ec77121903d5e0e/661f9a250840b08249b4081f_Vectors-Wrapper.svg"
                        className="mr-2 w-5 h-5"
                        />
                        <PhoneNumber asLink className={linkClass} />
                    </div>

                    <div className="flex items-center mb-3 leading-[1.2] text-[#595859]">
                        <img
                        alt="WhatsApp icon"
                        src="https://cdn.prod.website-files.com/66140c9a5ec77121903d5e0e/661f9a26164956c120d281fb_Vectors-Wrapper.svg"
                        className="mr-2 w-5 h-5"
                        />
                        <span>send a whatsapp</span>
                    </div>

                    <div className="flex items-center mb-3 leading-[1.2] text-[#595859]">
                        <a
                        href="#"
                        id="chat-online-link"
                        className={`${linkClass} flex items-center`}
                        >
                        <img
                            alt="Chat icon"
                            src="https://cdn.prod.website-files.com/66140c9a5ec77121903d5e0e/661f9a257c315b81c7e75ae4_Vectors-Wrapper.svg"
                            className="mr-2 w-5 h-5"
                        />
                        <span>chat online</span>
                        </a>
                    </div>

                    <h2 className={headingClass}>Have you already booked?</h2>
                    <p className={paragraphClass}>
                        For support with an existing booking, please contact our
                        Customer Services Team at{" "}
                        <PhoneNumber />{" "}
                        during office hours.
                        We&apos;re available Monday to Friday from 9am to 5:30pm, and
                        Saturday from 10am to 3pm. We are closed on Sundays.
                    </p>

                    <div className="flex items-center mb-3 leading-[1.2] text-[#595859]">
                        <a
                        href="mailto:customer.support@planmyluxe.co.uk"
                        className={`${linkClass} flex items-center`}
                        >
                        <img
                            alt="Email icon"
                            src="https://cdn.prod.website-files.com/67a8a971897a51255b073c63/67a8a971897a51255b073d77_email%201.svg"
                            className="mr-2 w-5 h-5"
                        />
                        <span>customer.support@planmyluxe.co.uk</span>
                        </a>
                    </div>

                    <h2 className={headingClass}>Already on holiday?</h2>
                    <p className={paragraphClass}>
                        We provide 24/7 in-resort telephone support. If you encounter
                        issues with your hotel, try addressing them with the hotel
                        management first. If needed, contact our in-resort team at +44
                        {" "}
                        <PhoneNumber /> (international charges may apply).
                    </p>

                    <h2 className={headingClass}>Have a question?</h2>
                    <p className={paragraphClass}>
                        Visit our comprehensive FAQs section for answers to common
                        queries.
                    </p>

                    <h2 className={headingClass}>Still need to talk to us?</h2>
                    <p className={paragraphClass}>
                        Our phone lines can be busy, but you can reach our Customer
                        Support Team at{" "}
                        <PhoneNumber />. We are available Monday to Friday
                        from 9am to 5:30pm, and Saturday from 10am to 3pm, with no
                        service on Sundays.
                    </p>
                    </div>

                    <div>
                    <h2 className={headingClass}>Feedback after your holiday</h2>
                    <p className={paragraphClass}>
                        We value your feedback as to how we can improve your experience
                        of PlanMyLuxe.
                    </p>
                    <br />
                    <p className={paragraphClass}>
                        If you have a problem during your holiday, you are obliged to
                        inform our local staff immediately who will endeavour to put
                        things right whilst you are on site. If your complaint is not
                        resolved locally, please complete a report form on site
                        (&ldquo;declaration&rdquo;) and follow this up by writing to our
                        Customer Relations Department:
                    </p>

                    <div className="mt-4 mb-4 text-base">
                        <div className="leading-[1.4] text-[#595859] mb-2">
                        PlanMyTour Ltd t/a PlanMyLuxe
                        </div>
                        <div className="leading-[1.4] text-[#595859]">
                        Customer Relations Department
                        </div>
                        <div className="leading-[1.4] text-[#595859]">
                        314 Midsummer Boulevard,
                        </div>
                        <div className="leading-[1.4] text-[#595859]">
                        Milton Keynes,
                        </div>
                        <div className="leading-[1.4] text-[#595859]">
                        Bedfordshire,
                        </div>
                        <div className="leading-[1.4] text-[#595859]">MK9 2UB</div>
                    </div>

                    <p className={paragraphClass}>
                        Or by email:{" "}
                        <a
                        href="mailto:customer.relations@planmyluxe.co.uk"
                        className={linkClass}
                        >
                        customer.relations@planmyluxe.co.uk
                        </a>
                    </p>
                    <br />
                    <p className={paragraphClass}>
                        Please note the complaint must be received within 28 days of the
                        completion of your holiday as per our terms &amp; conditions.
                        Any complaint received after this period will not be accepted.
                        Please quote your membership and/or booking reference to enable
                        us to process your complaint quickly and efficiently.
                    </p>

                    <p className={paragraphClass}>
                        Please note that enquiries which are not relating to post
                        departure (after travel) will not be answered or processed using
                        this email or postal contact
                    </p>
                    <br />

                    <p className={paragraphClass}>
                        PlanMyTour Ltd t/a PlanMyLuxe has an obligation to acknowledge
                        your complaint within 14 days, and to send a full reply to your
                        complaint within 28 days. For more information please refer to
                        our full terms and conditions{" "}
                        <a href="#" className={linkClass}>
                        here
                        </a>
                        . <br />
                        <br />
                    </p>

                    <p className={paragraphClass}>
                        If you wish to make &quot;General comments&quot; or
                        &quot;recommendations&quot;, please quote &quot;no reply
                        needed&quot; to ensure that your feedback is forwarded to the
                        relevant department or resort for future improvements. <br />
                        <br />
                    </p>

                    <span className="block font-bold mb-2 text-[#cb2187] text-[24px]">
                        HOW TO MAKE A CLAIM
                    </span>
                    <p className={paragraphClass}>
                        If you&apos;ve experienced any issues during your holiday,
                        please submit your claim{" "}
                        <a href="#" className={linkClass}>
                        here
                        </a>{" "}
                        for our assistance.
                    </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
}
