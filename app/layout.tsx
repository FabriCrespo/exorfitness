import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExorFitness | Tu libreta de entrenamiento",
  description: "Organiza tu rutina, registra tus series y revisa tu progreso.",
  icons: { icon: "/exorfitness-mark.svg", apple: "/exorfitness-mark.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
