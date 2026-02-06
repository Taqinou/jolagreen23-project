export default function VideoSection() {
  return (
    <section className="relative h-screen w-full bg-background flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          {/* Placeholder - remplacer par la vraie vidéo */}
          <source src="/images/clip.mp4" type="video/mp4" />
        </video>
      </div>


      {/* Bordure ASCII sur les côtés */}
      <div className="absolute left-0 top-0 bottom-0 w-8 z-10 flex flex-col justify-center overflow-hidden opacity-50">
        <pre className="font-ascii text-accent text-xs leading-none">
          {Array(50).fill("│\n").join("")}
        </pre>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-8 z-10 flex flex-col justify-center overflow-hidden opacity-50">
        <pre className="font-ascii text-accent text-xs leading-none text-right">
          {Array(50).fill("│\n").join("")}
        </pre>
      </div>


    </section>
  );
}
