"use client";

interface LiveDate {
  id: string;
  dateISO: string;
  city: string;
  country: string;
  venue: string;
}

const LIVE_DATES: LiveDate[] = [
  {
    id: "herouville-beauregard-2026",
    dateISO: "2026-07-04",
    city: "Hérouville-Saint-Clair",
    country: "France",
    venue: "Château de Beauregard",
  },
  {
    id: "paris-yoyo-2026",
    dateISO: "2026-01-18",
    city: "Paris",
    country: "France",
    venue: "YOYO, Palais de Tokyo",
  },
  {
    id: "villeurbanne-transbordeur-2025",
    dateISO: "2025-11-26",
    city: "Villeurbanne",
    country: "France",
    venue: "Transbordeur",
  },
  {
    id: "marseille-espace-julien-2025",
    dateISO: "2025-10-30",
    city: "Marseille",
    country: "France",
    venue: "Espace Julien",
  },
  {
    id: "lanester-lann-sevelin-2025",
    dateISO: "2025-10-24",
    city: "Lanester",
    country: "France",
    venue: "Parc des Expositions, Lann-Sevelin",
  },
];

function formatDate(dateISO: string): string {
  const [datePart] = dateISO.split("T");
  if (!datePart) return dateISO;

  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return dateISO;

  return `${day}.${month}.${year.slice(-2)}`;
}

function getCityTypographyClass(city: string): string {
  const cityLength = city.replace(/\s+/g, "").length;

  if (cityLength >= 9) {
    return "text-[clamp(2.2rem,5.2vw,4.35rem)] tracking-[-0.034em]";
  }

  if (cityLength >= 7) {
    return "text-[clamp(2.3rem,5.5vw,4.6rem)] tracking-[-0.03em]";
  }

  return "text-[clamp(2.4rem,6vw,5rem)] tracking-[-0.025em]";
}

export default function Live(): JSX.Element {
  return (
    <section id="live" className="relative w-full border-t border-foreground/12 bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1520px] px-5 pb-20 pt-[calc(var(--nav-height)+3rem)] md:px-10 md:pb-28 md:pt-[calc(var(--nav-height)+4rem)]">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-[clamp(3.5rem,11vw,8rem)] leading-[0.78] uppercase tracking-[-0.05em]">
            Live
          </h2>
        </div>

        <ul className="mt-8 border-t border-foreground/12">
          {LIVE_DATES.map((show) => (
            <li key={show.id} className="border-b border-foreground/12">
              <article className="grid grid-cols-12 items-start gap-x-3 gap-y-3 py-6 md:items-baseline md:gap-x-6 md:py-8">
                <p className="col-span-12 min-w-0 font-mono text-[15px] uppercase tracking-[0.12em] text-foreground/72 md:col-span-3 md:text-[20px]">
                  {formatDate(show.dateISO)}
                </p>

                <p
                  className={`col-span-8 min-w-0 break-words font-display leading-[0.84] uppercase md:col-span-5 ${getCityTypographyClass(show.city)}`}
                >
                  {show.city}
                </p>

                <p className="col-span-4 min-w-0 break-words font-display text-[1.35rem] uppercase tracking-[0.01em] text-foreground/72 md:col-span-4 md:pl-2 md:text-[1.9rem]">
                  {show.venue}
                  <span className="mt-1 block font-mono text-[12px] tracking-[0.12em] text-foreground/62 md:text-[14px]">
                    {show.country}
                  </span>
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
