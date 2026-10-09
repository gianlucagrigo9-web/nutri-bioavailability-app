import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "App nutrizione — biodisponibilità e Golden Set",
  description:
    "Prototipo: biodisponibilità nutrizionale, microbiota, cottura e impatto ambientale, sui 20 alimenti verificati del Golden Set.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
