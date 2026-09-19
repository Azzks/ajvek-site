"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    sendcloud?: {
      servicePoints?: {
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

const SENDCLOUD_SCRIPT =
  "https://embed.sendcloud.sc/spp/1.0.0/api.min.js";

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
  const [configLoading, setConfigLoading] = useState(true);
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
   * Récupération de la clé PUBLIQUE Sendcloud.
   */
  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch(
          "/api/sendcloud-service-points",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.publicKey) {
          throw new Error(
            data.error ||
              "Configuration Sendcloud indisponible."
          );
        }

        setPublicKey(data.publicKey);
      } catch (err) {
        console.error(
          "[ServicePointPicker] Configuration :",
          err
        );

        setError(
          "Impossible de charger la configuration des Points Relais."
        );
      } finally {
        setConfigLoading(false);
      }
    }

    loadConfig();
  }, []);

  /*
   * Chargement robuste du script officiel Sendcloud.
   */
  useEffect(() => {
    if (
      window.sendcloud?.servicePoints?.open
    ) {
      setScriptReady(true);
      return;
    }

    const existingScript =
      document.querySelector<HTMLScriptElement>(
        `script[src="${SENDCLOUD_SCRIPT}"]`
      );

    function checkReady() {
      if (
        window.sendcloud?.servicePoints?.open
      ) {
        setScriptReady(true);
        setScriptError(false);
        return true;
      }

      return false;
    }

    if (existingScript) {
      if (checkReady()) return;

      existingScript.addEventListener(
        "load",
        checkReady
      );

      existingScript.addEventListener(
        "error",
        () => setScriptError(true)
      );

      const interval = window.setInterval(
        () => {
          if (checkReady()) {
            window.clearInterval(interval);
          }
        },
        250
      );

      const timeout = window.setTimeout(
        () => {
          window.clearInterval(interval);

          if (!checkReady()) {
            setScriptError(true);
          }
        },
        10000
      );

      return () => {
        existingScript.removeEventListener(
          "load",
          checkReady
        );

        window.clearInterval(interval);
        window.clearTimeout(timeout);
      };
    }

    const script =
      document.createElement("script");

    script.src = SENDCLOUD_SCRIPT;
    script.async = true;

    script.onload = () => {
      if (!checkReady()) {
        const interval = window.setInterval(
          () => {
            if (checkReady()) {
              window.clearInterval(interval);
            }
          },
          200
        );

        window.setTimeout(() => {
          window.clearInterval(interval);

          if (!checkReady()) {
            setScriptError(true);
          }
        }, 5000);
      }
    };

    script.onerror = () => {
      console.error(
        "[ServicePointPicker] Impossible de charger le script Sendcloud."
      );

      setScriptError(true);
    };

    document.body.appendChild(script);
  }, []);

  function openPicker() {
    setError(null);

    if (postalCode.trim().length !== 5) {
      setError(
        "Entre un code postal français à 5 chiffres."
      );
      return;
    }

    if (!publicKey) {
      setError(
        "Configuration Sendcloud indisponible."
      );
      return;
    }

    if (
      !scriptReady ||
      !window.sendcloud?.servicePoints?.open
    ) {
      setError(
        "La carte des Points Relais n'est pas encore disponible. Réessaie dans quelques secondes."
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

          name: String(
            servicePoint.name ??
              "Point Relais Mondial Relay"
          ),

          street: String(
            servicePoint.street ?? ""
          ),

          houseNumber: String(
            servicePoint.house_number ?? ""
          ),

          postalCode: String(
            servicePoint.postal_code ?? ""
          ),

          city: String(
            servicePoint.city ?? ""
          ),

          carrier: String(
            servicePoint.carrier ??
              "mondial_relay"
          ),

          postNumber:
            postNumber ?? "",
        };

        onSelect(point);
        setError(null);
      },

      (errors) => {
        console.error(
          "[ServicePointPicker] Sendcloud :",
          errors
        );

        if (errors?.length) {
          setError(
            "Impossible d'afficher les Points Relais. Réessaie dans un instant."
          );
        }
      }
    );
  }

  const loading =
    configLoading || !scriptReady;

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={openPicker}
        disabled={
          configLoading || scriptError
        }
        className="w-full rounded-full border border-foreground px-5 py-3 text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
      >
        {configLoading
          ? "Chargement..."
          : selectedPoint
            ? "Changer de Point Relais"
            : "Choisir mon Point Relais"}
      </button>

      {loading &&
        !scriptError &&
        !configLoading && (
          <p className="mt-3 text-xs text-stone">
            Chargement de la carte des Points
            Relais...
          </p>
        )}

      {scriptError && (
        <p className="mt-3 text-xs leading-relaxed text-stone">
          Le service de sélection des Points
          Relais est momentanément indisponible.
          Recharge la page et réessaie.
        </p>
      )}

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
            {selectedPoint.postalCode}{" "}
            {selectedPoint.city}
          </p>
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs leading-relaxed text-stone">
          {error}
        </p>
      )}
    </div>
  );
}