import { ImageResponse } from "next/og"

export const alt = "TimeBridge"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const cities = [
  { name: "São Paulo", time: "09:00", offset: "UTC−03:00" },
  { name: "New Delhi", time: "17:30", offset: "UTC+05:30" },
  { name: "Tokyo", time: "21:00", offset: "UTC+09:00" },
]

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: 40,
        backgroundColor: "#ed4817",
        color: "#191614",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 48,
          borderRadius: 44,
          backgroundColor: "#eae8e6",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 36,
          }}
        >
          <div style={{ fontSize: 112, fontWeight: 700, letterSpacing: -7 }}>
            TimeBridge
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 220,
              height: 220,
              borderRadius: 110,
              backgroundColor: "#f8d8ca",
            }}
          >
            <div
              style={{
                display: "flex",
                position: "relative",
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: "#191614",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 24,
                  top: 24,
                  width: 112,
                  height: 112,
                  border: "2px solid #8c8077",
                  borderRadius: 56,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 76,
                  top: 38,
                  width: 8,
                  height: 46,
                  borderRadius: 4,
                  backgroundColor: "#f9f6f4",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 49,
                  top: 76,
                  width: 35,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#f9f6f4",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 72,
                  top: 72,
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: "#ff946e",
                }}
              />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {cities.map(({ name, time, offset }) => (
            <div
              key={name}
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                gap: 8,
                padding: "22px 24px",
                border: "1px solid #ccc5bf",
                borderRadius: 24,
                backgroundColor: "#f3f1ef",
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 700 }}>{name}</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 50, fontWeight: 700 }}>{time}</span>
                <span style={{ fontSize: 20, color: "#594f4a" }}>{offset}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    size,
  )
}
