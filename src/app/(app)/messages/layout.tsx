// @ts-nocheck
export default function MessagesLayout({ children }) {
  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "240px",
        right: "0",
        bottom: "0",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {children}
    </div>
  );
}
