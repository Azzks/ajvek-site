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
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0c0b",
          color: "#f4f1ea",
          overflow: "hidden",
        }}
      >
        {/* CERCLES */}
        <div
          style={{
            position: "absolute",
            width: "520px",
            height: "520px",
            border: "1px solid rgba(244,241,234,0.08)",
            borderRadius: "9999px",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "380px",
            height: "380px",
            border: "1px solid rgba(244,241,234,0.045)",
            borderRadius: "9999px",
          }}
        />

        {/* TOP */}
        <div
          style={{
            position: "absolute",
            top: "50px",
            left: "60px",
            right: "60px",
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "sans-serif",
            textTransform: "uppercase",
            letterSpacing: "6px",
            fontSize: "15px",
            color: "#8a8178",
          }}
        >
          <span>Streetwear</span>
          <span>France</span>
        </div>

        {/* CENTRE SAFE */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "serif",
              fontSize: "150px",
              lineHeight: 1,
              letterSpacing: "-5px",
              whiteSpace: "nowrap",
            }}
          >
            AJVEK
          </div>

          <div
            style={{
              width: "60px",
              height: "1px",
              background: "#8a8178",
              marginTop: "34px",
            }}
          />

          <div
            style={{
              marginTop: "26px",
              fontFamily: "sans-serif",
              textTransform: "uppercase",
              letterSpacing: "6px",
              fontSize: "15px",
              color: "#b3a48c",
            }}
          >
            Du dessin au vêtement
          </div>
        </div>

        {/* BOTTOM */}
        <div
          style={{
            position: "absolute",
            bottom: "45px",
            left: "60px",
            right: "60px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(244,241,234,0.1)",
            paddingTop: "20px",
            fontFamily: "sans-serif",
            textTransform: "uppercase",
            letterSpacing: "4px",
            fontSize: "12px",
            color: "#8a8178",
          }}
        >
          <span>Drop 001 · Bientôt disponible</span>
          <span>ajvek.fr</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}