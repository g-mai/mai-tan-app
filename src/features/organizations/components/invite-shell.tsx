import { LogoTitle } from "#/components/shared/logo-title";
import { Card } from "#/components/ui/card";
import Footer from "#/features/layout/components/footer";

export function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col justify-center">
        <LogoTitle href="/" className="flex gap-4 mx-auto" />
        <Card className="w-full max-w-md mx-auto mt-10 p-6">{children}</Card>
      </main>
      <Footer />
    </div>
  );
}
