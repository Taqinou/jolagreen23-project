import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import Releases from "./components/Releases";
import Visuals from "./components/Visuals";
import Live from "./components/Live";

export default function Home() {
  return (
    <main className="relative bg-white">
      {/* Fixed Navigation */}
      <Navigation />
      
      {/* Hero - ASCII Art */}
      <Hero />
      
      {/* Releases - Discography */}
      <Releases />
      
      {/* Visuals - Gallery Grid */}
      <Visuals />
      
      {/* Live - Tour Dates */}
      <Live />
    </main>
  );
}
