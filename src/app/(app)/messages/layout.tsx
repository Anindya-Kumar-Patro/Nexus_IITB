// @ts-nocheck
export default function MessagesLayout({ children }) {
  return (
    <div
      className="-mx-4 -my-4 lg:-mx-7 lg:-my-7"
      style={{ height: "calc(100vh - 64px)" }}
    >
      {children}
    </div>
  );
}
