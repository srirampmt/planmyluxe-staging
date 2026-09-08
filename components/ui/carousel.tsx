'use client';

import * as React from 'react';
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }

  return context;
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = 'horizontal',
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === 'horizontal' ? 'x' : 'y',
      },
      plugins
    );
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return;
      }

      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    }, []);

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev();
    }, [api]);

    const scrollNext = React.useCallback(() => {
      api?.scrollNext();
    }, [api]);

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext]
    );

    React.useEffect(() => {
      if (!api || !setApi) {
        return;
      }

      setApi(api);
    }, [api, setApi]);

    React.useEffect(() => {
      if (!api) {
        return;
      }

      onSelect(api);
      api.on('reInit', onSelect);
      api.on('select', onSelect);

      return () => {
        api?.off('select', onSelect);
      };
    }, [api, onSelect]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn('relative', className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  }
);
Carousel.displayName = 'Carousel';

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation, api } = useCarousel();
  const viewportRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!viewportRef.current || !api) return;

    const imgs = Array.from(viewportRef.current.querySelectorAll('img')) as HTMLImageElement[];

    const doReinit = () => {
      try {
        api.reInit?.();
      } catch {}
    };

    // Debounce helper
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const debouncedReinit = (delay = 120) => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        doReinit();
      }, delay);
    };

    // If no images, just reinit once
    if (!imgs.length) {
      debouncedReinit(0);
      return () => {
        if (debounceTimer) clearTimeout(debounceTimer);
      };
    }

    // Wait for all images to settle (load/error) with a safety timeout
    let settled = false;
    const waitForAll = () =>
      new Promise<void>((resolve) => {
        let remaining = imgs.length;

        const maybeResolve = () => {
          remaining -= 1;
          if (remaining <= 0 && !settled) {
            settled = true;
            resolve();
          }
        };

        // If all already complete
        const alreadyDone = imgs.filter((img) => img.complete).length;
        if (alreadyDone === imgs.length) {
          settled = true;
          resolve();
          return;
        }

        const onFinish = () => maybeResolve();

        imgs.forEach((img) => {
          if (img.complete) {
            maybeResolve();
            return;
          }
          img.addEventListener('load', onFinish, { once: true });
          img.addEventListener('error', onFinish, { once: true });
        });

        setTimeout(() => {
          if (!settled) {
            settled = true;
            resolve();
          }
        }, 1500);
      });

    let cancelled = false;

    waitForAll().then(() => {
      if (cancelled) return;
      debouncedReinit(0);

      // Retry reInit a few times (increasing delays) and trigger a window resize
      const delays = [0, 100, 300, 600, 1200];
      const timers: ReturnType<typeof setTimeout>[] = [];
      delays.forEach((d) => {
        const t = setTimeout(() => {
          try {
            api.reInit?.();
            // some browsers/embla respond to resize events
            try {
              window.dispatchEvent(new Event('resize'));
            } catch {}
          } catch {}
        }, d);
        timers.push(t);
      });

      // clear timers on cleanup
      const cleanupTimers = () => timers.forEach((t) => clearTimeout(t));
      // attach cleanup to return by wrapping
      const originalReturn = () => {
        cleanupTimers();
      };
      // no-op: originalReturn will be handled by outer return
    });

    // Observe mutations: new images or src attribute changes
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList' || (m.type === 'attributes' && (m.target as Element).tagName === 'IMG')) {
          debouncedReinit();
          break;
        }
      }
    });

    mo.observe(viewportRef.current, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });

    return () => {
      cancelled = true;
      mo.disconnect();
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [api]);

  return (
    <div
      ref={(el) => {
        // wire embla's ref and keep local reference for image listeners
        try {
          if (typeof carouselRef === 'function') carouselRef(el as unknown as HTMLDivElement | null);
          else (carouselRef as any).current = el;
        } catch {}
        viewportRef.current = el;
      }}
      className="overflow-hidden"
    >
      <div
        ref={ref}
        className={cn(
          'flex',
          orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col',
          className
        )}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = 'CarouselContent';

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'pl-4' : 'pt-4',
        className
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = 'CarouselItem';

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        'absolute h-8 w-8 rounded-full border-pml-primary text-pml-primary hover:bg-pml-primary/10 hover:text-pml-primary',
        orientation === 'horizontal'
          ? '-left-12 top-1/2 -translate-y-1/2'
          : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
});
CarouselPrevious.displayName = 'CarouselPrevious';

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        'absolute h-8 w-8 rounded-full border-pml-primary text-pml-primary hover:bg-pml-primary/10 hover:text-pml-primary',
        orientation === 'horizontal'
          ? '-right-12 top-1/2 -translate-y-1/2'
          : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
});
CarouselNext.displayName = 'CarouselNext';

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};
