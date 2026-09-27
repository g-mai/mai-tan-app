import { createFileRoute } from "@tanstack/react-router";
import { getR2 } from "#/lib/storage/r2.server";

export const Route = createFileRoute("/api/images/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (!import.meta.env.DEV) return new Response(null, { status: 404 });

        const { bucket } = getR2();
        const object = await bucket.get(params._splat ?? "");
        if (!object) return new Response(null, { status: 404 });

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        return new Response(object.body, { headers });
      },
    },
  },
});
