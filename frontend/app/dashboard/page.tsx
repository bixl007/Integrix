"use client";

import { Appbar } from "@/components/Appbar";
import { DarkButton } from "@/components/buttons/DarkButton";
import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";
import { useRouter } from "next/navigation";

interface Zap {
  id: string;
  triggerId: string;
  userId: string;
  actions: {
    id: string;
    zapId: string;
    actionId: string;
    sortingOrder: number;
    type: {
      id: string;
      name: string;
    };
  }[];
  trigger: {
    id: string;
    zapId: string;
    triggerId: string;
    type: {
      id: string;
      name: string;
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
  return (
    <div>
      <Appbar />
      <div className="flex justify-center py-8 px-4">
        <div className="max-w-screen-xl w-full">
          <div className="flex justify-between px-8">
            <div className="text-2xl font-semibold font-mono ">My Zaps</div>
            <DarkButton onClick={() => {}}>+ Create</DarkButton>
          </div>
        </div>
      </div>
      {loading ? "Loading..." : <ZapTable zaps={zaps} />}
    </div>
  );
}

function ZapTable({ zaps }: { zaps: Zap[] }) {
  const router = useRouter();

  return (
    <div className="flex justify-center py-8 px-4">
      <div className="max-w-screen-xl w-full px-8">
        <div className="flex text-lg font-semibold py-4">
          <div className="flex-1 text-center">Name</div>
          <div className="flex-1 text-center">Last Edit</div>
          <div className="flex-1 text-center">Running</div>
          <div className="flex-1 text-center">Go</div>
        </div>
        {zaps.map((z) => (
          <div key={z.id} className="flex border-b border-t py-4">
            <div className="flex-1">
              {z.trigger.type.name}{" "}
              {z.actions.map((x) => x.type.name).join(" ")}
            </div>
            <div className="flex-1">{z.id}</div>
            <div className="flex-1">Nov 13, 2023</div>
            <div className="flex-1">
              <button
                className="text-blue-500 underline"
                onClick={() => router.push("/zap/" + z.id)}
              >
                Go
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
