"use client";

import { BACKEND_URL } from "@/app/config";
import { Appbar } from "@/components/Appbar";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { ZapCell } from "@/components/ZapCell";
import { ZapModal } from "@/components/ZapModal";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function useAvailableActionsAndTriggers() {
  const [availableActions, setAvailableActions] = useState([]);
  const [availableTriggers, setAvailableTriggers] = useState([]);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/v1/trigger/available`)
      .then((x) => setAvailableTriggers(x.data.availableTriggers));
    axios
      .get(`${BACKEND_URL}/api/v1/action/available`)
      .then((x) => setAvailableActions(x.data.availableActions));
  }, []);

  return {
    availableActions,
    availableTriggers,
  };
}

export default function CreateZap() {
  const router = useRouter();
  const [selectedTrigger, setSelectedTrigger] = useState<{
    id: string;
    name: string;
    image?: string;
  }>();
  const [selectedActions, setSelectedActions] = useState<
    {
      index: number;
      availableActionId: string;
      availableActionName: string;
      image?: string;
      metadata: any;
    }[]
  >([]);
  const [selectedModalIndex, setSelectedModalIndex] = useState<null | number>(
    null
  );
  const { availableActions, availableTriggers } =
    useAvailableActionsAndTriggers();

  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
      <Appbar />

      <main className="flex-1 flex flex-col items-center pt-12 pb-24 px-4 relative z-10">
        <div className="w-full max-w-3xl">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Zap</h1>
            <PrimaryButton
              onClick={async () => {
                if (!selectedTrigger?.id) return;

                const response = await axios.post(
                  `${BACKEND_URL}/api/v1/zap`,
                  {
                    availableTriggerId: selectedTrigger.id,
                    triggerMetadata: {},
                    actions: selectedActions.map((a) => ({
                      availableActionId: a.availableActionId,
                      actionMetadata: a.metadata,
                    })),
                  },
                  {
                    headers: {
                      Authorization: localStorage.getItem("token"),
                    },
                  }
                );
                router.push("/dashboard");
              }}
            >
              Publish Zap
            </PrimaryButton>
          </div>

          <div className="space-y-8 relative">
            <div className="absolute left-[50%] top-0 bottom-0 w-px bg-border -translate-x-1/2 -z-10 bg-gradient-to-b from-transparent via-border to-transparent" />

            <div className="flex flex-col items-center gap-6">
              {/* Trigger Section */}
              <div className="relative group">
                {/* Label */}
                <div className="absolute -left-20 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground uppercase tracking-widest hidden md:block">
                  Trigger
                </div>
                <ZapCell
                  name={selectedTrigger?.name ? selectedTrigger.name : "Select Trigger"}
                  index={1}
                  image={selectedTrigger?.image}
                  onClick={() => setSelectedModalIndex(1)}
                />
              </div>

              {/* Connector */}
              <div className="h-8 w-px bg-border" />

              {/* Actions Section */}
              {selectedActions.map((action, index) => (
                <div key={action.index} className="flex flex-col items-center gap-6 w-full relative">
                  <div className="absolute -left-20 top-[40%] text-sm font-semibold text-muted-foreground uppercase tracking-widest hidden md:block">
                    Action
                  </div>
                  <ZapCell
                    onClick={() => setSelectedModalIndex(action.index)}
                    name={action.availableActionName ? action.availableActionName : "Select Action"}
                    index={action.index}
                    image={action.image}
                  />
                  <div className="h-8 w-px bg-border" />
                </div>
              ))}

              {/* Add Button */}
              <button
                onClick={() => {
                  setSelectedActions((a) => [
                    ...a,
                    {
                      index: a.length + 2,
                      availableActionId: "",
                      availableActionName: "",
                      metadata: {}
                    },
                  ]);
                }}
                className="group flex flex-col items-center gap-2 cursor-pointer transition-all hover:scale-110"
              >
                <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary shadow-sm transition-colors text-2xl pb-1">
                  +
                </div>
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors uppercase tracking-wider">Add Step</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {selectedModalIndex && (
        <ZapModal
          availableItems={
            selectedModalIndex === 1 ? availableTriggers : availableActions
          }
          onSelect={(props) => {
            if (props === null) {
              setSelectedModalIndex(null);
              return;
            }
            if (selectedModalIndex === 1) {
              setSelectedTrigger({
                id: props.id,
                name: props.name,
                image: props.image,
              });
            } else {
              setSelectedActions((a) => {
                let newActions = [...a];
                newActions[selectedModalIndex - 2] = {
                  index: selectedModalIndex,
                  availableActionId: props.id,
                  availableActionName: props.name,
                  image: props.image,
                  metadata: props.metadata,
                };
                return newActions;
              });
            }
            setSelectedModalIndex(null);
          }}
          index={selectedModalIndex}
        />
      )}
    </div>
  );
}
