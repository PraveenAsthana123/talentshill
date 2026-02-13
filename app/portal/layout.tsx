import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Portal - Talents Hill Inc",
  description:
    "Explore Talents Hill Inc AI solutions: Robotics, IoT, GenAI across Banking, Healthcare, Real Estate, and AgriTech domains.",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
