import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  display: "swap",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  display: "swap",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Learnium",
  description: "Personalized microlearning powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${bricolage.variable}`}
    >
      <body className="antialiased text-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
