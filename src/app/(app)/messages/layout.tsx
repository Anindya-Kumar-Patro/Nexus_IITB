// @ts-nocheck
"use client";
import { useEffect, useState } from "react";

export default function MessagesLayout({ children }) {
  const [dims, setDims] = useState({ mobile: false, ready: false });

  useEffect(() => {
    const check = () => setDims({
      mobile: window.innerWidth < 1024,
      ready: true
    });
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!dims.ready) return <>{children}</>;

  return (
    <div
      style={{
        position: "fixed",
        top: dims.mobile ? "56px" : "0",
        left: dims.mobile ? "0" : "240px",
        right: "0",
        bottom: dims.mobile ? "64px" : "0",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {children}
    </div>
  );
}
