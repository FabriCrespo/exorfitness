import type { Metadata, Viewport } from "next";
import { Shippori_Mincho, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";
import "./theme.css";
import "./screens.css";
import "./session.css";
import RegisterServiceWorker from "./_components/RegisterServiceWorker";

const body = Zen_Maru_Gothic({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-body-jp", display: "swap" });
const display = Shippori_Mincho({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-display-jp", display: "swap" });

export const metadata: Metadata = {
  title: "ExorFitness | Tu libreta de entrenamiento",
  description: "Organiza tu rutina, registra tus series y revisa tu progreso.",
  applicationName: "ExorFitness",
  icons: { icon: "/exorfitness-mark.svg", apple: "/apple-icon" },
  appleWebApp: { capable: true, title: "ExorFitness", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0908",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-theme="dark" className={`h-full antialiased ${body.variable} ${display.variable}`}>
      <body className="min-h-full flex flex-col">{children}<RegisterServiceWorker /></body>
    </html>
  );
}
