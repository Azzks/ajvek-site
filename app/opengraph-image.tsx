import { ImageResponse } from "next/og";

export const alt = "AJVEK — Streetwear français";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c0c0b",
          color: "#f4f1ea",
          padding: "64px 72px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "720px",
            height: "720px",
            border: "1px solid rgba(244,241,234,0.08)",
            borderRadius: "9999px",
            top: "-230px",
            right: "-180px",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "460px",
            height: "460px",
            border: "1px solid rgba(244,241,234,0.05)",
            borderRadius: "9999px",
            top: "-100px",
            right: "-50px",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "sans-serif",
            fontSize: "18px",
            letterSpacing: "7px",
            textTransform: "uppercase",
            color: "#8a8178",
          }}
        >
          <span>Streetwear</span>
          <span>France</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontFamily: "serif",
              fontSize: "190px",
              lineHeight: 0.8,
              letterSpacing: "-10px",
            }}
          >
            AJVEK
          </div>

          <div
            style={{
              width: "72px",
              height: "1px",
              background: "#8a8178",
              marginTop: "48px",
              marginBottom: "28px",
            }}
          />

          <div
            style={{
              maxWidth: "650px",
              fontFamily: "sans-serif",
              fontSize: "25px",
              lineHeight: 1.5,
              color: "#b3a48c",
            }}
          >
            Du dessin au vêtement.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "1px solid rgba(244,241,234,0.1)",
            paddingTop: "25px",
            fontFamily: "sans-serif",
            fontSize: "15px",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "#8a8178",
          }}
        >
          <span>Collection en précommande</span>
          <span>ajvek.fr</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}