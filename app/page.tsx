import { Hero, Navbar } from "@/sections";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <section
          id="solution"
          className="flex min-h-screen items-center justify-center bg-background-muted"
        >
          <h2 className="text-section-title">Solution</h2>
        </section>
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
