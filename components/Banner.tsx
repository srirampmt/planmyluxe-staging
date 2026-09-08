import Image from "next/image";

type BannerProps = {
  title?: string;
  description?: string;
  image?: string;
  priority?: boolean;
};

export function Banner({ title, description, image, priority = false }: BannerProps) {
  return (
    <section className="w-full font-['Montserrat']">
      {/* Hero Image Section - Full width */}
      <div className="relative w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] h-[300px] sm:h-[400px] md:h-[480px] lg:h-[480px]">
        {image ? (
          <Image
            src={image}
            alt={title || "Banner"}
            fill
            priority={priority}
            fetchPriority={priority ? "high" : "auto"}
            loading={priority ? "eager" : "lazy"}
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-neutral-200" />
        )}
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Hero Text - Constrained width */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]">
            <div className="w-full max-w-[1280px] mx-auto">
              <div className="flex flex-col max-w-[623px] w-full min-w-0">
                <h1 className="font-['Montserrat'] text-white text-[32px] sm:text-[42px] md:text-[64px] lg:text-[64px] font-bold tracking-[-0.01em] leading-[38px] sm:leading-[50px] md:leading-[76px] lg:leading-[76px] w-full break-words">
                  {title}
                </h1>
                <p className="font-['Montserrat'] text-white text-[16px] sm:text-[18px] md:text-[32px] lg:text-[32px] font-semibold leading-[20px] sm:leading-[22px] md:leading-[40px] lg:leading-[40px] w-full break-words">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Banner;


