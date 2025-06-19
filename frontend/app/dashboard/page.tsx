"use client";

import { Appbar } from "@/components/Appbar";
import { DarkButton } from "@/components/buttons/DarkButton";
import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL, HOOKS_URL } from "../config";
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
    <div>
      <Appbar />
      <div className="flex justify-center py-8 px-4">
        <div className="max-w-screen-xl w-full">
          <div className="flex justify-between px-8">
            <div className="text-2xl font-semibold font-mono ">My Zaps</div>
            <DarkButton
              onClick={() => {
                router.push("/zap/create");
              }}
            >
              + Create
            </DarkButton>
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
        <table className="min-w-full bg-white border border-orange-200 rounded-xl shadow-lg overflow-hidden">
          <thead>
            <tr className="bg-gradient-to-r from-orange-100 to-white">
              <th className="py-4 px-6 text-left font-bold text-orange-700 uppercase tracking-wider">
                Name
              </th>
              <th className="py-4 px-6 text-left font-bold text-orange-700 uppercase tracking-wider">
                Last Edit
              </th>
              <th className="py-4 px-6 text-left font-bold text-orange-700 uppercase tracking-wider">
                Zap ID
              </th>
              <th className="py-4 px-6 text-left font-bold text-orange-700 uppercase tracking-wider">
                Webhook URL
              </th>
              <th className="py-4 px-6 text-left font-bold text-orange-700 uppercase tracking-wider">
                Go
              </th>
            </tr>
          </thead>
          <tbody>
            {zaps.map((z, i) => {
              const maxVisibleActions = 2;
              const remainingActionsCount = z.actions.length - maxVisibleActions;
              return (
                <tr
                  key={z.id}
                  className={`transition-colors ${
                    i % 2 === 0 ? "bg-white" : "bg-orange-50"
                  } hover:bg-orange-100`}
                >
                  <td className="py-4 px-6 align-middle font-medium text-gray-900">
                    <div className="flex items-center">
                      <div className="flex items-center flex-shrink-0">
                        <img
                          src={z.trigger.type.image}
                          width={40}
                          className="rounded-full border-2 border-white shadow-md"
                          alt={z.trigger.type.name}
                        />
                        {z.actions.slice(0, maxVisibleActions).map((x) => (
                          <img
                            key={x.id}
                            src={x.type.image}
                            width={40}
                            className="rounded-full border-2 border-white shadow-md -ml-4"
                            alt={x.type.name}
                          />
                        ))}
                        {remainingActionsCount > 0 && (
                          <div className="w-10 h-10 rounded-full border-2 border-white shadow-md -ml-4 bg-orange-100 flex items-center justify-center text-orange-700 font-semibold">
                            +{remainingActionsCount}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <span className="font-semibold">
                          {z.trigger.type.name}
                        </span>
                        {z.actions.slice(0, maxVisibleActions).map((x) => (
                          <span key={x.id} className="text-gray-600">
                            {" "}
                            → {x.type.name}
                          </span>
                        ))}
                        {remainingActionsCount > 0 && (
                          <span className="text-gray-600"> → ...</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 align-middle text-gray-600">
                    Nov 13, 2023
                  </td>
                  <td className="py-4 px-6 align-middle break-all text-gray-600">
                    {z.id}
                  </td>
                  <td className="py-4 px-6 align-middle break-all text-gray-600">{`${HOOKS_URL}/hooks/catch/1/${z.id}`}</td>
                  <td className="py-4 px-6 align-middle">
                    <button
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg shadow hover:bg-orange-600 transition-colors duration-150 font-semibold"
                      onClick={() => router.push("/zap/" + z.id)}
                    >
                      Go
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
