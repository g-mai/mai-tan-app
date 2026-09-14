import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

export function WhatThisIsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>What this is</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Mai Tan App is a production-ready starter kit for building
          multi-tenant B2B SaaS applications. Authentication, organizations,
          teams, and session management already work end-to-end, so you can
          focus on the part of the product that's actually yours instead of
          rebuilding infrastructure every project needs.
        </p>
      </CardContent>
    </Card>
  );
}
