// @ts-nocheck
"use client";
import { useEffect, useState } from "react";

export default function MessagesLayout({ children }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: isMobile ? "56px" : "0",
        left: isMobile ? "0" : "240px",
        right: "0",
        bottom: isMobile ? "64px" : "0",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {children}
    </div>
  );
}
