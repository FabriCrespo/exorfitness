import type { Metadata, Viewport } from "next";
import { Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";
import "./theme.css";
import RegisterServiceWorker from "./_components/RegisterServiceWorker";

const body = Zen_Maru_Gothic({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-body-jp", display: "swap" });

export const metadata: Metadata = {
  title: "ExorFitness | Tu libreta de entrenamiento",
  description: "Organiza tu rutina, registra tus series y revisa tu progreso.",
  applicationName: "ExorFitness",
  icons: { icon: "/exorfitness-mark.svg", apple: "/apple-icon" },
  appleWebApp: { capable: true, title: "ExorFitness", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f3f5f8",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-theme="light" className={`h-full antialiased ${body.variable}`}>
      <body className="min-h-full flex flex-col">{children}<RegisterServiceWorker /></body>
    </html>
  );
}
