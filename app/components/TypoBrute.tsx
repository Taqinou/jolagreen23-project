"use client";

export default function TypoBrute() {
  return (
    <section className="relative min-h-screen w-full bg-background flex items-center justify-center overflow-hidden">
      {/* Typo massive - centrée */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <h2 
          className="font-display text-[20vw] font-black leading-[0.85] tracking-tighter text-foreground uppercase text-center"
          style={{
            WebkitTextStroke: "2px rgba(0, 255, 102, 0.3)",
          }}
        >
          JOLA
        </h2>
        <h2 
          className="font-display text-[20vw] font-black leading-[0.85] tracking-tighter text-transparent uppercase text-center"
          style={{
            WebkitTextStroke: "2px rgba(0, 0, 0, 0.2)",
          }}
        >
          GREEN
        </h2>
        <h2 
          className="font-display text-[25vw] font-black leading-[0.85] tracking-tighter text-accent uppercase text-center"
          style={{
            textShadow: "0 0 60px rgba(0, 255, 102, 0.3)",
          }}
        >
          23
        </h2>
      </div>
    </section>
  );
}
