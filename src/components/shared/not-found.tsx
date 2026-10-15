import { Link } from "@tanstack/react-router";
import { FileQuestion } from "lucide-react";
import {
  ScreenBody,
  ScreenCard,
  ScreenHeader,
  ScreenStrip,
} from "#/components/shared/screen-shell";
import { Button } from "#/components/ui/button";

export function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <ScreenCard className="max-w-md">
        <ScreenStrip path="404" state="page not found" />
        <ScreenBody>
          <ScreenHeader
            icon={<FileQuestion aria-hidden="true" className="size-5" />}
            title="Page not found"
            description="This page may have moved or the link may be incorrect. Head home to find your way."
          />
          <Button asChild className="mt-6">
            <Link to="/">Go home</Link>
          </Button>
        </ScreenBody>
      </ScreenCard>
    </main>
  );
}
