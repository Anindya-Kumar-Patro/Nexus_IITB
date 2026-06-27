// @ts-nocheck
export default function MessagesLayout({ children }) {
  return (
    <div style={{ height: "calc(100vh - 56px)" }} className="overflow-hidden -mx-4 lg:-mx-7 -my-4 lg:-my-7">
      {children}
    </div>
  );
}
