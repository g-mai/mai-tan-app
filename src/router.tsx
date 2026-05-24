import {
  createRouter as createTanStackRouter,
  Link,
} from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
// import { captureOwnerStack } from "react";
import { getContext } from "#/lib/query/root-provider";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const context = getContext();

  // TODO: proper not found component
  function DefaultNotFound() {
    // console.log(
    //   "[router] defaultNotFoundComponent",
    //   router.state.location.pathname,
    // );
    // console.log(captureOwnerStack());
    return (
      <div>
        <p>Not found!</p>
        <Link to="/">Go home</Link>
      </div>
    );
  }

  const router = createTanStackRouter({
    routeTree,
    context: {
      ...context,
      session: undefined,
    },
    defaultNotFoundComponent: DefaultNotFound,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
