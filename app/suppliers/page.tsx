import { Metadata } from "next";
import SuppliersForm from "./SuppliersForm";

export const metadata: Metadata = {
	title: "Suppliers | Partner With Plan My Luxe",
	description: "Work with Plan My Luxe as a trusted travel supplier and connect with clients seeking premium travel experiences.",
};

export default function SuppliersPage() {
  const headingPink = "text-[#cb2187]";
  const textGrey = "text-[#595859]";

  return (
    <section className="w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] relative bg-white font-['Montserrat'] my-2 md:my-8">
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]">
        <div className="w-full max-w-[1280px] mx-auto">
          <section className="space-y-3">
            <h4 className={`font-semibold text-[18px] md:text-[20px] ${textGrey}`}>
              Join Us at PlanMyLuxe: Your Partner in Luxury Travel Solutions
            </h4>
            <p className={`${textGrey} leading-[1.5]`}>
              At PlanMyLuxe, we&apos;re a new brand in the luxury holiday market,
              and we&apos;re experiencing rapid growth through our media
              partnerships. We&apos;re committed to building strong relationships
              with our key suppliers. Our goal is to offer our members
              exceptional deals on hand-picked hotels, holidays, and
              experiences, creating a unique platform for our partners to
              reach new audiences. To achieve this, we&apos;re looking to expand
              our network with more destinations, hotels, and ancillary
              products.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className={`font-semibold text-[18px] md:text-[20px] ${headingPink}`}>
              Who Are We
            </h4>
            <p className={`${textGrey} leading-[1.5]`}>
              PlanMyLuxe is a recently developed brand, part of the PlanMyTour
              group of brands and is dedicated to enhancing the luxury travel
              experience. We focus on forming collaborative partnerships that
              benefit both our members and our suppliers. Our mission is to
              provide high-quality offerings that elevate travel experiences.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className={`font-semibold text-[18px] md:text-[20px] ${headingPink}`}>
              Our Products
            </h4>
            <p className={`${textGrey} leading-[1.5]`}>
              We offer a curated selection of luxury accommodations, tailored
              holiday packages, and unique experiences. Our focus is on
              quality and exclusivity, ensuring that every option we present
              meets our high standards and provides real value.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className={`font-semibold text-[18px] md:text-[20px] ${headingPink}`}>
              Our Membership
            </h4>
            <p className={`${textGrey} leading-[1.5]`}>
              Currently, we welcome both subscribers and non-subscribers, but
              starting in the first quarter of 2025, all members will need to
              sign up fully. Our free sign-up process allows members to
              access hotel sales exclusive to PlanMyLuxe, ensuring that your
              brand remains protected as our rates are not visible on external
              platforms.
            </p>
          </section>

          <section className="space-y-4">
            <div className="space-y-3">
              <h4 className={`font-semibold text-[18px] md:text-[20px] ${headingPink}`}>
                Marketing Your Products
              </h4>
              <p className={`${textGrey} leading-[1.5]`}>
                We engage in a variety of digital marketing activities and
                collaborate with key channels, such as Travelzoo, where
                PlanMyLuxe is recognized. We can promote your products in
                several ways, including creating dedicated pages on our
                website and featuring them in our upcoming 2025 digital
                brochure. We focus on bundling offers to provide added value
                to our members, such as upgraded room types and complimentary
                extras. For partners with a large inventory to sell quickly,
                our marketing team can develop targeted campaigns, including
                placements in Travelzoo’s Top 20 listings, reaching millions
                of active travelers.
              </p>
            </div>

            <div className="flex flex-col items-center sm:flex-row sm:flex-wrap gap-4">
              <div className="bg-white p-2  w-full sm:w-[320px]">
                <img
                  src="/assets/images/travelzoo.jpg"
                  loading="lazy"
                  alt="Travelzoo Partner Logo"
                  className="w-full h-auto rounded-lg"
                />
              </div>

              <div className="bg-white border border-[#e0e0e0] rounded-xl p-2 shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:-translate-y-[2px] w-full sm:w-[320px]">
                <img
                  src="/assets/images/travelzoo.png"
                  loading="lazy"
                  alt="Travelzoo Top 20 Feature"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h4 className={`font-semibold text-[18px] md:text-[20px] ${headingPink}`}>
              Working With Us
            </h4>
            <p className={`${textGrey} leading-[1.5]`}>
              When you partner with PlanMyLuxe, you’ll have a dedicated account
              executive to guide you through the process. We establish
              connectivity via our technology platform or directly with your
              systems. Our flexible pricing model allows for adjustments based
              on occupancy and demand, and we maintain regular communication
              to analyze performance and bookings.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className={`font-semibold text-[18px] md:text-[20px] ${headingPink}`}>
              Your Security
            </h4>
            <p className={`${textGrey} leading-[1.5]`}>
              As a proud member of the Travel Trust Association, we prioritise
              the security of your payments. All customer funds are held in a
              trust account, ensuring timely payments to our suppliers and
              protecting your financial interests.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className={`font-semibold text-[18px] md:text-[20px] ${headingPink}`}>
              Get In Touch
            </h4>
            <p className={`${textGrey} leading-[1.5]`}>
              If you’re interested in exploring how a partnership with
              PlanMyLuxe can align with your business goals and support mutual
              sales objectives, <strong className="font-semibold">contact us</strong> to discuss how we
              can work together.
            </p>
          </section>

          {/* Form */}
          <SuppliersForm />
        </div>
      </div>
    </section>
  );
}
