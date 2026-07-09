import { Hero, Navbar, WhoItsFor } from "@/sections";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <WhoItsFor />
        <section
          id="process"
          className="flex min-h-screen items-center justify-center bg-background"
        >
          <h2 className="text-section-title">Process</h2>
        </section>
        <section
          id="industries"
          className="flex min-h-screen items-center justify-center bg-background-muted"
        >
          <h2 className="text-section-title">Industries</h2>
        </section>
        <section
          id="platform-preview"
          className="flex min-h-screen items-center justify-center bg-background"
        >
          <h2 className="text-section-title">Platform</h2>
        </section>
        <section
          id="contact"
          className="flex min-h-screen items-center justify-center bg-background-muted"
        >
          <h2 className="text-section-title">Contact</h2>
        </section>
      </main>
    </>
  );
}
