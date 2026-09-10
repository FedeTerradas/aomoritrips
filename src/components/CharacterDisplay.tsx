import React from "react";

interface CharacterDisplayProps {
  character: "sakura" | "haruto";
  size?: "sm" | "md" | "lg";
  quote?: string;
  className?: string;
}

export const CharacterDisplay: React.FC<CharacterDisplayProps> = ({
  character,
  size = "md",
  quote,
  className = "",
}) => {
  const sizeMap = {
    sm: 80,
    md: 140,
    lg: 200,
  };

  const currentSize = sizeMap[size];

  return (
    <div
      className={`character-display ${className}`}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        animation: "float 3s ease-in-out infinite",
      }}
    >
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>

      {quote && (
        <div
          style={{
            position: "absolute",
            top: "-40px",
            backgroundColor: "#ffffff",
            padding: "8px 12px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--color-aomori-blue)",
            whiteSpace: "nowrap",
            zIndex: 2,
            border: `1px solid ${character === "sakura" ? "#fce7f3" : "#e0f2fe"}`,
          }}
        >
          {quote}
          <div
            style={{
              position: "absolute",
              bottom: "-6px",
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: "12px",
              height: "12px",
              backgroundColor: "#ffffff",
              borderBottom: `1px solid ${character === "sakura" ? "#fce7f3" : "#e0f2fe"}`,
              borderRight: `1px solid ${character === "sakura" ? "#fce7f3" : "#e0f2fe"}`,
            }}
          />
        </div>
      )}

      <img
        src={`/characters/${character}.svg`}
        alt={`Personaje guía ${character}`}
        width={currentSize * (200 / 320)}
        height={currentSize}
        loading="lazy"
        style={{
          objectFit: "contain",
          filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.15))",
        }}
      />
    </div>
  );
};
