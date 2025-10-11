import React, { useState, useEffect } from "react";
import assets from "../../../assets/assets";

const MaskedImageFullScreen = () => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [pulse, setPulse] = useState(0);

  // Pulsing effect
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => (prev + 1) % 100);
    }, 30); // adjust speed
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // Create mask with 3 concentric circles
  const mask = `radial-gradient(circle 180px at ${mousePos.x}% ${mousePos.y}%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.5) 80%, transparent 100%)`;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        cursor: "none",
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Blurred Background */}
      <img
        src={assets.Landscape}
        alt="Laptop Background"
        style={{
          width: "78%",
          height: "80%",
          objectFit: "cover",
          filter: "blur(10px)",
          transform: "scale(1.1)",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      />

      {/* Masked Foreground */}
      <img
        src={assets.Landscape}
        alt="Laptop"
        style={{
          width: "78%",
          height: "80%",
          objectFit: "cover",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 2,
          maskImage: mask,
          WebkitMaskImage: mask,
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
          maskSize: "cover",
          WebkitMaskSize: "cover",
          transition: "mask-position 0.05s, -webkit-mask-position 0.05s",
          // Animate pulsing by slightly scaling the mask
          transform: `scale(${1 + 0.02 * Math.sin(pulse * 0.1)})`,
        }}
      />
    </div>
  );
};

export default MaskedImageFullScreen;
