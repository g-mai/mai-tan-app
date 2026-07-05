import { createFileRoute } from "@tanstack/react-router";
import { Rocket } from "lucide-react";
import { TechStackPage } from "#/components/shared/tech-stack-page";

export const Route = createFileRoute("/_protected/stack/tanstack-start")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <TechStackPage
      name="TanStack Start"
      tagline="Full-stack SSR framework, built on TanStack Router"
      icon={Rocket}
      overview="TanStack Start is a full-stack framework built on TanStack Router that adds server-side capabilities to router-first applications. Its core features include server-side rendering (SSR), streaming responses, and server functions with validated boundaries, with deployable output for runtimes like Vercel, Netlify, and Cloudflare."
      role="This app uses TanStack Start end-to-end — file-based routing, server functions (createServerFn) for auth and data access, and SSR with a dehydrated/rehydrated TanStack Query cache across the server/client boundary."
      link="https://tanstack.com/start/latest"
    />
  );
}
