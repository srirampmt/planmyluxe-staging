"use client";

interface MapProps {
  iframeSrc: string;
  title?: string;
}

export default function Map({ iframeSrc, title = "Location Map" }: MapProps) {
  // if (!iframeSrc) return null;

  return (
    <section className="w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] relative bg-white font-['Montserrat']">
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-10 md:py-20">
        <div className="w-full max-w-[1280px] mx-auto">
          <div className="w-full h-[250px] md:h-[350px] lg:h-[400px] rounded-[8px] overflow-hidden shadow-md">
            <iframe
              src={iframeSrc}
              title={title}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}