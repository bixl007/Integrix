"use client";

import { useState } from "react";
import { PrimaryButton } from "./buttons/PrimaryButton";
import { Input } from "./Input";

export function ZapModal({
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => onSelect(null)}
        >
            <div
                className="relative w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl p-6 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-foreground">
                        Select {index === 1 ? "Trigger" : "Action"}
                    </h3>
                    <button
                        onClick={() => onSelect(null)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
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

                    {step === 0 &&
                        availableItems.map(({ id, name, image }) => (
                            <div
                                key={id}
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
                                className="flex items-center gap-4 p-4 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/50 hover:border-primary/50 cursor-pointer transition-all active:scale-[0.99]"
                            >
                                <img
                                    src={image}
                                    width={40}
                                    className="rounded-full bg-background p-1 border border-border"
                                    alt=""
                                />
                                <span className="font-semibold text-foreground text-lg">
                                    {name}
                                </span>
                            </div>
                        ))}
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
        <div className="space-y-4 pt-2">
            <Input
                label={"To"}
                type={"text"}
                placeholder="recipient@example.com"
                onChange={(e) => setEmail(e.target.value)}
            />
            <Input
                label={"Body"}
                type={"text"}
                placeholder="Email content..."
                onChange={(e) => setBody(e.target.value)}
            />
            <div className="flex justify-end pt-4">
                <PrimaryButton
                    onClick={() => {
                        setMetaData({
                            email,
                            body,
                        });
                    }}
                >
                    Confirm
                </PrimaryButton>
            </div>
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
        <div className="space-y-4 pt-2">
            <Input
                label={"Amount"}
                type={"text"}
                placeholder="0.1"
                onChange={(e) => setAmount(e.target.value)}
            />
            <Input
                label={"Address"}
                type={"text"}
                placeholder="Public Key"
                onChange={(e) => setAddress(e.target.value)}
            />
            <div className="flex justify-end pt-4">
                <PrimaryButton
                    onClick={() => {
                        setMetaData({
                            amount,
                            address,
                        });
                    }}
                >
                    Confirm
                </PrimaryButton>
            </div>
        </div>
    );
}
