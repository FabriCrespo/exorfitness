import { ImageResponse } from "next/og";

export function renderIcon(size: number) {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0c0b09" }}>
      <div style={{ width: size * 0.62, height: size * 0.62, borderRadius: "50%", background: "#c9a45c", display: "flex", alignItems: "center", justifyContent: "center", border: `${size * 0.03}px solid #0c0b09` }}>
        <div style={{ width: size * 0.3, height: size * 0.3, borderRadius: "50%", background: "#0c0b09" }} />
      </div>
    </div>,
    { width: size, height: size },
  );
}
