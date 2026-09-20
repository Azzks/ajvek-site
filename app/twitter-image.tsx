import { ImageResponse } from "next/og";

export const alt = "AJVEK — Streetwear français";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0c0b",
          color: "#f4f1ea",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "760px",
            height: "760px",
            border: "1px solid rgba(244,241,234,0.07)",
            borderRadius: "9999px",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "480px",
            height: "480px",
            border: "1px solid rgba(244,241,234,0.04)",
            borderRadius: "9999px",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
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
              marginTop: "45px",
              fontFamily: "sans-serif",
              textTransform: "uppercase",
              letterSpacing: "7px",
              fontSize: "17px",
              color: "#8a8178",
            }}
          >
            Du dessin au vêtement
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}