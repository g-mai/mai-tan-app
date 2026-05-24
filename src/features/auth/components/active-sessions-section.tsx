import type { Session } from "better-auth";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";
import { UAParser } from "ua-parser-js";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { SignOutButton } from "#/features/auth/components/sign-out-button";
import { useRevokeSession } from "../hooks/useRevokeSession";

interface SessionsListProps {
  sessions: Session[];
  currentSessionId: string;
}

export function ActiveSessionsSection({
  sessions,
  currentSessionId,
}: SessionsListProps) {
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [tokenToRevoke, setTokenToRevoke] = useState<string>("");
  const [sessionIndexToRevoke, setSessionIndexToRevoke] = useState<
    number | null
  >(null);

  const { revokeSession, isPending, isSuccess, isError } = useRevokeSession();

  const getDeviceIcon = (userAgent?: string | null) => {
    if (!userAgent) return <Monitor className="h-5 w-5" />;

    const { device } = UAParser(userAgent);

    if (device.type === "mobile") {
      return <Smartphone className="h-5 w-5" />;
    } else if (device.type === "tablet") {
      return <Tablet className="h-5 w-5" />;
    }

    return <Monitor className="h-5 w-5" />;
  };

  const getDeviceInfo = (userAgent?: string | null) => {
    if (!userAgent) return { browser: "Unknown", device: "Unknown" };

    const { browser, device, os } = UAParser(userAgent);

    return {
      browser: browser.name || "Unknown",
      device: device.model || os.name || "Desktop",
    };
  };

  const revokeSessionConfirmation = (token: string, index: number) => {
    setTokenToRevoke(token);
    setSessionIndexToRevoke(index);
    setShowRevokeDialog(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.map((session, index) => {
              const isCurrentSession = session.id === currentSessionId;
              const deviceInfo = getDeviceInfo(session.userAgent) || "--";
              const ipAddress = session.ipAddress
                ? `IP: ${session.ipAddress} • `
                : "";
              const createdAt = session.createdAt
                ? new Date(session.createdAt).toLocaleString()
                : "";

              return (
                <div
                  key={session.id}
                  className="flex items-start gap-4 rounded-lg border p-4"
                >
                  <div className="mt-1">{getDeviceIcon(session.userAgent)}</div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-sm font-medium">
                        #{index + 1} - {deviceInfo.browser}
                      </p>
                      {isCurrentSession && (
                        <Badge variant="secondary" className="text-xs">
                          Current Session
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {deviceInfo.device}
                    </p>
                    <p
                      className="text-muted-foreground mt-1 text-xs"
                      suppressHydrationWarning
                    >
                      {ipAddress}
                      {createdAt}
                    </p>
                  </div>
                  {!isCurrentSession && (
                    <Button
                      variant="destructive"
                      onClick={() =>
                        revokeSessionConfirmation(session.token, index + 1)
                      }
                      disabled={isPending}
                    >
                      Revoke Session
                    </Button>
                  )}
                  {isCurrentSession && <SignOutButton />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Revoke session #{sessionIndexToRevoke}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will sign you out of on that device. You will remain signed
              in on this device. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => revokeSession(tokenToRevoke)}
              variant="destructive"
            >
              Revoke Sessions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
