"use client";

import { BACKEND_URL } from "@/app/config";
import { Appbar } from "@/components/Appbar";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { ZapCell } from "@/components/ZapCell";
import axios from "axios";
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
    }[]
  >([]);
  const [selectedModalIndex, setSelectedModalIndex] = useState<null | number>(
    null
  );
  const { availableActions, availableTriggers } =
    useAvailableActionsAndTriggers();

  return (
    <div>
      <Appbar />
      <div className="w-full min-h-screen bg-slate-200 flex flex-col justify-center">
        <div className="flex justify-center w-full">
          <ZapCell
            name={selectedTrigger?.name ? selectedTrigger.name : "Trigger"}
            index={1}
            image={selectedTrigger?.image}
            onClick={() => {
              setSelectedModalIndex(1);
            }}
          />
        </div>
        <div className="w-full py-2">
          {selectedActions.map((action, index) => (
            <div className="flex justify-center" key={action.index}>
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
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <div className="w-1/6">
            <PrimaryButton
              onClick={() => {
                setSelectedActions((a) => [
                  ...a,
                  {
                    index: a.length + 2,
                    availableActionId: "",
                    availableActionName: "",
                  },
                ]);
              }}
            >
              <div className="text-xl">+</div>
            </PrimaryButton>
          </div>
        </div>
      </div>
      {selectedModalIndex && (
        <Modal
          availableItems={
            selectedModalIndex === 1 ? availableTriggers : availableActions
          }
          onSelect={(props: null | { name: string; id: string; image?: string }) => {
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
  onSelect: (props: null | { name: string; id: string; image?: string }) => void;
  availableItems: { id: string; name: string; image: string }[];
}) {
  return (
    <div
      id="static-modal"
      data-modal-backdrop="static"
      tabIndex={-1}
      className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-screen max-h-full flex bg-[#57565663]"
    >
      <div className="relative p-4 w-full max-w-2xl max-h-full">
        {/* Modal content */}
        <div className="relative bg-white rounded-lg shadow-sm">
          {/* Modal header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              Select {index === 1 ? "Trigger" : "Action"}
            </h3>
            <button
              type="button"
              onClick={() => {
                onSelect(null);
              }}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
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
          {/* Modal body */}
          <div className="p-4 md:p-5 space-y-4">
            {availableItems.map(({ id, name, image }) => {
              return (
                <div
                  onClick={() => {
                    onSelect({
                      id,
                      name,
                      image, // Pass image to onSelect
                    });
                  }}
                  className="flex border p-4 cursor-pointer hover:bg-slate-100"
                >
                  <img
                    src={image}
                    width={30}
                    className="rounder-full"
                    alt=""
                  />
                  <div className="flex flex-col justify-center px-3">
                    {name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
