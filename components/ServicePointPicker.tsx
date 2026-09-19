"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    sendcloud?: {
      servicePoints: {
        open: (
          options: {
            apiKey: string;
            country: string;
            language?: string;
            postalCode?: string;
            city?: string;
            carriers?: string;
          },
          successCallback: (
            servicePoint: SendcloudServicePoint,
            postNumber?: string
          ) => void,
          failureCallback: (errors: string[]) => void
        ) => void;
      };
    };
  }
}

export type SendcloudServicePoint = {
  id: number;
  name?: string;
  street?: string;
  house_number?: string;
  postal_code?: string;
  city?: string;
  latitude?: string | number;
  longitude?: string | number;
  carrier?: string;
  [key: string]: unknown;
};

export type SelectedServicePoint = {
  id: number;
  name: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  carrier: string;
  postNumber: string;
};

export default function ServicePointPicker({
  postalCode,
  onSelect,
  selectedPoint,
}: {
  postalCode: string;
  onSelect: (point: SelectedServicePoint) => void;
  selectedPoint: SelectedServicePoint | null;
}) {
  const [publicKey, setPublicKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [scriptReady, setScriptReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sendcloud-service-points", {
      cache: "no-store",
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok || !data.publicKey) {
          throw new Error(
            data.error || "Configuration Sendcloud indisponible."
          );
        }

        setPublicKey(data.publicKey);
      })
      .catch((err) => {
        console.error("[ServicePointPicker]", err);
        setError("Impossible de charger les Points Relais.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function openPicker() {
    setError(null);

    if (!postalCode.trim()) {
      setError(
        "Entre d'abord ton code postal pour trouver les Points Relais proches."
      );
      return;
    }

    if (!publicKey) {
      setError("Configuration Sendcloud indisponible.");
      return;
    }

    if (!scriptReady || !window.sendcloud?.servicePoints) {
      setError(
        "La carte des Points Relais est encore en cours de chargement."
      );
      return;
    }

    window.sendcloud.servicePoints.open(
      {
        apiKey: publicKey,
        country: "fr",
        language: "fr-fr",
        postalCode: postalCode.trim(),
        carriers: "mondial_relay",
      },
      (servicePoint, postNumber) => {
        const point: SelectedServicePoint = {
          id: servicePoint.id,
          name: String(servicePoint.name ?? "Point Relais"),
          street: String(servicePoint.street ?? ""),
          houseNumber: String(servicePoint.house_number ?? ""),
          postalCode: String(servicePoint.postal_code ?? ""),
          city: String(servicePoint.city ?? ""),
          carrier: String(
            servicePoint.carrier ?? "mondial_relay"
          ),
          postNumber: postNumber ?? "",
        };

        onSelect(point);
        setError(null);
      },
      (errors) => {
        if (errors?.length) {
          console.error(
            "[ServicePointPicker] Sendcloud :",
            errors
          );
        }
      }
    );
  }

  return (
    <>
      <Script
        src="https://embed.sendcloud.sc/spp/1.0.0/api.min.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />

      <div className="mt-4">
        <button
          type="button"
          onClick={openPicker}
          disabled={loading}
          className="w-full rounded-full border border-foreground px-5 py-3 text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Chargement des Points Relais..."
            : selectedPoint
              ? "Changer de Point Relais"
              : "Choisir mon Point Relais"}
        </button>

        {selectedPoint && (
          <div className="mt-4 rounded border border-surface p-4">
            <p className="text-[10px] uppercase tracking-widest text-stone">
              Point Relais sélectionné
            </p>

            <p className="mt-2 text-sm text-foreground">
              {selectedPoint.name}
            </p>

            <p className="mt-1 text-xs leading-relaxed text-stone">
              {selectedPoint.houseNumber
                ? `${selectedPoint.houseNumber} `
                : ""}
              {selectedPoint.street}
              <br />
              {selectedPoint.postalCode} {selectedPoint.city}
            </p>
          </div>
        )}

        {error && (
          <p className="mt-3 text-xs leading-relaxed text-stone">
            {error}
          </p>
        )}
      </div>
    </>
  );
}