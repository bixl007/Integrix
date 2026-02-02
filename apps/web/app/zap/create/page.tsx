"use client";

import { BACKEND_URL } from "@/app/config";
import { Appbar } from "@/components/Appbar";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { Input } from "@/components/Input";
import { ZapCell } from "@/components/ZapCell";
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

export default function () {
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
    <div className="min-h-screen w-full bg-gray-50">
      <Appbar />
      <div className="flex justify-center items-start pt-24">
        <div className="w-full max-w-2xl px-4">
          <div className="flex justify-end mb-8">
            <PrimaryButton
              size="large"
              onClick={async () => {
                if (!selectedTrigger?.id) {
                  return;
                }

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
              Publish
            </PrimaryButton>
          </div>

          <div className="flex flex-col items-center w-full">
            <div className="flex flex-col items-center gap-4 w-++ull">
              <ZapCell
                name={selectedTrigger?.name ? selectedTrigger.name : "Trigger"}
                index={1}
                image={selectedTrigger?.image}
                onClick={() => {
                  setSelectedModalIndex(1);
                }}
              />
              <div className="h-12 w-1 bg-orange-200 rounded-full"></div>
              {selectedActions.map((action, index) => (
                <div
                  key={action.index}
                  className="flex flex-col items-center gap-4 w-full"
                >
                  <ZapCell
                    onClick={() => {
                      setSelectedModalIndex(action.index);
                    }}
                    name={
                      action.availableActionName
                        ? action.availableActionName
                        : "Action"
                    }
                    index={action.index}
                    image={action.image}
                  />
                  <div className="h-12 w-1 bg-orange-200 rounded-full"></div>
                </div>
              ))}
              <button
                type="button"
                className="bg-orange-500 hover:bg-orange-600 text-white text-2xl rounded-full w-12 h-12 flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all duration-150"
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
                aria-label="Add Action"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
      {selectedModalIndex && (
        <Modal
          availableItems={
            selectedModalIndex === 1 ? availableTriggers : availableActions
          }
          onSelect={(
            props: null | { name: string; id: string; image?: string; metadata: any }
          ) => {
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
            setSelectedModalIndex(null); // Close modal after selection
          }}
          index={selectedModalIndex}
        />
      )}
    </div>
  );
}

function Modal({
  index,
  onSelect,
  availableItems,
}: {
  index: number;
  onSelect: (
    props: null | { name: string; id: string; image?: string; metadata: any }
  ) => void;
  availableItems: { id: string; name: string; image: string }[];
}) {
  const [step, setStep] = useState(0);
  const isTrigger = index === 1;
  const [selectedAction, setSelectedAction] = useState<{
    id: string;
    name: string;
    image: string;
  }>();

  return (
    <div
      id="static-modal"
      data-modal-backdrop="static"
      tabIndex={-1}
      className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-screen max-h-full flex bg-orange-100/60"
    >
      <div className="relative p-4 w-full max-w-2xl max-h-full">
        {/* Modal content */}
        <div className="relative bg-white rounded-xl shadow-lg border border-orange-100">
          {/* Modal header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-orange-100 bg-orange-50">
            <h3 className="text-xl font-semibold text-orange-700">
              Select {index === 1 ? "Trigger" : "Action"}
            </h3>
            <button
              type="button"
              onClick={() => {
                onSelect(null);
              }}
              className="text-orange-400 bg-transparent hover:bg-orange-100 hover:text-orange-700 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="static-modal"
            >
              <svg
                className="w-3 h-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          {step === 1 && selectedAction?.id === "email" && (
            <EmailSelector
              setMetaData={(metadata) => {
                onSelect({
                  ...selectedAction,
                  metadata,
                });
              }}
            />
          )}
          {step === 1 && selectedAction?.id === "solana" && (
            <SolanaSelector
              setMetaData={(metadata) => {
                onSelect({
                  ...selectedAction,
                  metadata,
                });
              }}
            />
          )}

          {step === 0 && (
            <div className="p-4 md:p-5 space-y-4">
              {availableItems.map(({ id, name, image }) => {
                return (
                  <div
                    onClick={() => {
                      if (isTrigger) {
                        onSelect({
                          id,
                          name,
                          image,
                          metadata: {},
                        });
                      } else {
                        setStep((s) => s + 1);
                        setSelectedAction({
                          id,
                          name,
                          image,
                        });
                      }
                    }}
                    className="flex border border-orange-50 p-4 cursor-pointer hover:bg-orange-50 rounded-lg items-center gap-3"
                  >
                    <img
                      src={image}
                      width={36}
                      className="rounded-full bg-orange-100"
                      alt=""
                    />
                    <div className="flex flex-col justify-center px-3 text-orange-700 font-semibold">
                      {name}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmailSelector({
  setMetaData,
}: {
  setMetaData: (params: any) => void;
}) {
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");

  return (
    <div className="p-4">
      <Input
        label={"To"}
        type={"text"}
        placeholder="To"
        onChange={(e) => {
          setEmail(e.target.value);
        }}
      />
      <Input
        label={"Body"}
        type={"text"}
        placeholder="Body"
        onChange={(e) => {
          setBody(e.target.value);
        }}
      />
      <PrimaryButton
        onClick={() => {
          setMetaData({
            email,
            body,
          });
        }}
      >
        Sumbit
      </PrimaryButton>
    </div>
  );
}

function SolanaSelector({
  setMetaData,
}: {
  setMetaData: (params: any) => void;
}) {
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  return (
    <div className="p-4">
      <Input
        label={"Amount"}
        type={"text"}
        placeholder="Amount"
        onChange={(e) => {
          setAmount(e.target.value);
        }}
      />
      <Input
        label={"Address"}
        type={"text"}
        placeholder="Address"
        onChange={(e) => {
          setAddress(e.target.value);
        }}
      />
      <PrimaryButton
        onClick={() => {
          setMetaData({
            amount,
            address,
          });
        }}
      >
        Sumbit
      </PrimaryButton>
    </div>
  );
}
