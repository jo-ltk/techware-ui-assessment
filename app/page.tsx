import { Footer, Hero, Navbar, PlatformPreview, WhoItsFor } from "@/sections";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <WhoItsFor />
        <PlatformPreview />
        <Footer />
      </main>
    </>
  );
}
