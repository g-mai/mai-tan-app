import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { PageTitle } from "#/components/shared/page-title";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

export function TechStackPage({
  name,
  tagline,
  icon: Icon,
  overview,
  role,
  link,
}: {
  name: string;
  tagline: string;
  icon: LucideIcon;
  overview: string;
  role: string;
  link: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-6" />
        </div>
        <PageTitle title={name} subtitle={tagline} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What it is</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{overview}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>In this starter</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{role}</p>
        </CardContent>
      </Card>

      <Button variant="outline" className="self-start" asChild>
        <a href={link} target="_blank" rel="noopener noreferrer">
          Visit official site
          <ArrowUpRight />
        </a>
      </Button>
    </div>
  );
}
