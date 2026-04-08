"use client";

import { Appbar } from "@/components/Appbar";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL, HOOKS_URL } from "../config";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Zap {
  id: string;
  triggerId: string;
  userId: string;
  createdAt: string;
  actions: {
    id: string;
    zapId: string;
    actionId: string;
    sortingOrder: number;
    type: {
      id: string;
      name: string;
      image: string;
    };
  }[];
  trigger: {
    id: string;
    zapId: string;
    triggerId: string;
    type: {
      id: string;
      name: string;
      image: string;
    };
  };
}

function useZaps() {
  const [loading, setLoading] = useState(true);
  const [zaps, setZaps] = useState<Zap[]>([]);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/v1/zap`, {
        headers: {
          Authorization: localStorage.getItem("token") ?? "",
        },
      })
      .then((res) => {
        setZaps(res.data.zaps);
        setLoading(false);
      });
  }, []);

  return {
    loading,
    zaps,
  };
}

export default function Dashboard() {
  const { loading, zaps } = useZaps();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
      <Appbar />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your automated workflows.</p>
          </div>
          <PrimaryButton
            onClick={() => {
              router.push("/zap/create");
            }}
          >
            + Create New Zap
          </PrimaryButton>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-secondary/30 animate-pulse" />
            ))}
          </div>
        ) : zaps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl text-center">
            <p className="text-muted-foreground mb-4">You haven't created any Zaps yet.</p>
            <PrimaryButton onClick={() => router.push("/zap/create")}>Create your first Zap</PrimaryButton>
          </div>
        ) : (
          <ZapGrid zaps={zaps} />
        )}
      </div>
    </div>
  );
}

function ZapGrid({ zaps }: { zaps: Zap[] }) {
  const router = useRouter();

  const buildWebhookUrl = (zap: Zap) => {
    return `${HOOKS_URL}/hooks/catch/${zap.userId}/${zap.id}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {zaps.map((z, i) => (
        <motion.div
          key={z.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
          className="group relative bg-card hover:bg-secondary/20 border border-border hover:border-primary/50 rounded-2xl p-6 transition-all shadow-sm hover:shadow-lg cursor-pointer"
          onClick={() => router.push("/zap/" + z.id)}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <img
                src={z.trigger.type.image}
                className="w-10 h-10 rounded-full bg-background p-1 border border-border"
                alt={z.trigger.type.name}
              />
              <span className="text-muted-foreground">→</span>
              <div className="flex -space-x-3">
                {z.actions.slice(0, 3).map((a) => (
                  <img
                    key={a.id}
                    src={a.type.image}
                    className="w-10 h-10 rounded-full bg-background p-1 border border-border"
                    alt={a.type.name}
                  />
                ))}
              </div>
            </div>
            <div className="text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
              ID: {z.id.substring(0, 4)}...
            </div>
          </div>

          <h3 className="font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors">
            {z.trigger.type.name} Workflow
          </h3>

          <div className="text-sm text-muted-foreground mb-4 line-clamp-2">
            Automated workflow triggered by {z.trigger.type.name} performing {z.actions.length} action{z.actions.length !== 1 ? 's' : ''}.
          </div>

          <div className="rounded-lg border border-border/50 bg-secondary/20 p-2 mb-4">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Webhook URL</p>
            <p className="text-xs font-mono text-foreground break-all">{buildWebhookUrl(z)}</p>
            <button
              className="mt-2 text-xs font-medium text-primary hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(buildWebhookUrl(z));
              }}
            >
              Copy URL
            </button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <span className="text-xs text-muted-foreground">{new Date(z.createdAt).toLocaleDateString()}</span>
            <button className="text-sm font-medium text-primary hover:underline">View Details →</button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
