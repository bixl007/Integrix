"use client";
/* eslint-disable @next/next/no-img-element */

import { BACKEND_URL, HOOKS_URL } from "@/app/config";
import { Appbar } from "@/components/Appbar";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface ZapDetail {
  id: string;
  userId: number;
  createdAt: string;
  actions: {
    id: string;
    sortingOrder: number;
    type: {
      id: string;
      name: string;
      image: string;
    };
    metadata?: unknown;
  }[];
  trigger: {
    id: string;
    type: {
      id: string;
      name: string;
      image: string;
    };
  } | null;
}

export default function ZapDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [zap, setZap] = useState<ZapDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    axios
      .get(`${BACKEND_URL}/api/v1/zap/${params.id}`, {
        headers: {
          Authorization: token,
        },
      })
      .then((res) => {
        setZap(res.data.zap ?? null);
      })
      .catch(() => {
        setError("Unable to fetch zap details.");
      })
      .finally(() => setLoading(false));
  }, [params.id, router]);

  const webhookUrl = useMemo(() => {
    if (!zap) return "";
    return `${HOOKS_URL}/hooks/catch/${zap.userId}/${zap.id}`;
  }, [zap]);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
      <Appbar />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-primary hover:underline mb-6"
        >
          ← Back to Dashboard
        </button>

        {loading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-muted-foreground">Loading zap details...</div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-destructive">{error}</div>
        ) : !zap ? (
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Zap Not Found</h2>
            <p className="text-muted-foreground">This zap does not exist or does not belong to your account.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">{zap.trigger?.type.name ?? "Unknown"} Workflow</h1>
              <p className="text-sm text-muted-foreground">Created on {new Date(zap.createdAt).toLocaleString()}</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">Webhook URL</h2>
              <p className="text-sm font-mono break-all text-foreground bg-secondary/20 border border-border rounded-md p-3">{webhookUrl}</p>
              <button
                className="mt-3 text-sm text-primary hover:underline"
                onClick={() => navigator.clipboard.writeText(webhookUrl)}
              >
                Copy URL
              </button>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Flow</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  {zap.trigger?.type.image ? (
                    <img src={zap.trigger.type.image} alt={zap.trigger.type.name} className="w-9 h-9 rounded-full bg-background p-1 border border-border" />
                  ) : null}
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Trigger</p>
                    <p className="font-medium text-foreground">{zap.trigger?.type.name ?? "Unknown"}</p>
                  </div>
                </div>

                {zap.actions
                  .slice()
                  .sort((a, b) => a.sortingOrder - b.sortingOrder)
                  .map((action) => (
                    <div key={action.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      {action.type.image ? (
                        <img src={action.type.image} alt={action.type.name} className="w-9 h-9 rounded-full bg-background p-1 border border-border" />
                      ) : null}
                      <div>
                        <p className="text-xs uppercase text-muted-foreground">Action {action.sortingOrder + 1}</p>
                        <p className="font-medium text-foreground">{action.type.name}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
