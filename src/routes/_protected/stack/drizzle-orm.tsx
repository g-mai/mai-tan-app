import { createFileRoute } from "@tanstack/react-router";
import { Database } from "lucide-react";
import { TechStackPage } from "#/components/shared/tech-stack-page";

export const Route = createFileRoute("/_protected/stack/drizzle-orm")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <TechStackPage
      name="Drizzle ORM"
      tagline="Lightweight, type-safe SQL toolkit for TypeScript"
      icon={Database}
      overview="Drizzle ORM describes itself as a headless TypeScript ORM with a head — it functions more like a type-safe SQL query builder than a traditional ORM, with strong performance and support for PostgreSQL, MySQL, SQLite, and more. It ships with an intuitive schema declaration system, relational queries, and migration tooling via Drizzle Kit."
      text="Every schema, migration, and query in src/lib/db runs through Drizzle against PostgreSQL, including the auto-generated Better Auth schema in auth-schema.ts."
      link="https://orm.drizzle.team"
    />
  );
}
