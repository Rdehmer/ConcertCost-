import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "Concert Cost Tracker",
  description: "Track concert spending and fun ratings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="cupcake" suppressHydrationWarning>
      <body
        className={`${nunito.variable} ${fraunces.variable} antialiased font-sans`}
        style={
          {
            fontFamily: "var(--font-nunito), ui-sans-serif, system-ui, sans-serif",
            ["--font-display" as string]:
              "var(--font-fraunces), ui-serif, Georgia, serif",
          } as React.CSSProperties
        }
      >
        <style>{`.font-display { font-family: var(--font-fraunces), ui-serif, Georgia, serif; }`}</style>
        {children}
      </body>
    </html>
  );
}
