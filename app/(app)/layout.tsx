import { AppNav } from "@/app/components/nav/AppNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <AppNav />
      <main id="main-content" className="pb-[6.5rem] md:pb-0 md:pt-16">
        {children}
      </main>
    </>
  );
}
