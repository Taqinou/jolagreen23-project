"use client";

interface Show {
  id: string;
  date: string;
  city: string;
  venue: string;
}

const SHOWS: Show[] = [
  { id: "1", date: "04.07.26", city: "HÉROUVILLE", venue: "Château de Beauregard" },
  { id: "2", date: "18.01.26", city: "PARIS", venue: "YOYO" },
  { id: "3", date: "26.11.25", city: "LYON", venue: "Transbordeur" },
  { id: "4", date: "30.10.25", city: "MARSEILLE", venue: "Espace Julien" },
  { id: "5", date: "24.10.25", city: "LANESTER", venue: "Parc des Expo" },
];

export default function Live(): JSX.Element {
  return (
    <section id="live" className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/background-show.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen w-full flex flex-col justify-center px-4 md:px-8 lg:px-12 py-20">
        {/* Villes empilées */}
        <div className="flex flex-col items-start">
          {SHOWS.map((show) => (
            <div 
              key={show.id} 
              className="flex items-baseline gap-3 md:gap-6 group cursor-pointer"
            >
              {/* Date */}
              <span className="font-mono text-accent text-[2vw] md:text-[1.2vw] tracking-[0.1em] opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                {show.date}
              </span>

              {/* City */}
              <h2 className="font-display text-white text-[15vw] md:text-[14vw] leading-[0.75] tracking-[-0.05em] uppercase group-hover:text-accent transition-colors duration-300">
                {show.city}
              </h2>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
