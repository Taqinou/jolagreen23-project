export default function Portrait() {
  return (
    <section className="relative min-h-screen w-full bg-background flex items-center overflow-hidden">
      {/* Photo asymétrique - côté gauche */}
      <div className="relative w-[55%] h-screen">
        <div className="absolute inset-0">
          <img
            src="/images/portrait.png"
            alt="Portrait"
            className="w-full h-full object-cover relative z-10"
          />
        </div>
      </div>

      {/* Espace vide - côté droit */}
      <div className="flex-1 h-screen flex flex-col justify-end p-12">
      </div>
    </section>
  );
}
