import { createFileRoute } from "@tanstack/react-router";
import { HomeCta } from "#/components/home/home-cta";
import { HomeFeatures } from "#/components/home/home-features";
import { HomeHeader } from "#/components/home/home-header";
import { HomeHero } from "#/components/home/home-hero";
import { HomeRoadmap } from "#/components/home/home-roadmap";
import { HomeTechStack } from "#/components/home/home-tech-stack";
import { HomeWhy } from "#/components/home/home-why";
import Footer from "#/features/layout/components/footer";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HomeHeader />
      <main className="flex-1">
        <HomeHero />
        <HomeTechStack />
        <HomeWhy />
        <HomeFeatures />
        <HomeRoadmap />
        <HomeCta />
      </main>
      <Footer />
    </div>
  );
}
