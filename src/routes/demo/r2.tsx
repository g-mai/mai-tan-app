import { createFileRoute } from "@tanstack/react-router";
import { getPresignedUploadUrl } from "#/lib/storage/upload.functions";

export const Route = createFileRoute("/demo/r2")({
  component: RouteComponent,
  loader: async () => {
    // const response = await getPresignedUploadUrl({
    //   data: {
    //     prefix: "avatars",
    //     entityId: "test-entity-id",
    //     fileType: "image/png",
    //     fileSize: 1024 * 1024, // 1MB
    //   },
    // });
    // return response;
  },
});

function RouteComponent() {
  const loaderData = Route.useLoaderData();
  return (
    <div>
      <h1>R2 Presigned URL Demo</h1>
      <pre>{JSON.stringify(loaderData, null, 2)}</pre>
    </div>
  );
}
