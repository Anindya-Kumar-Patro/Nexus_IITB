// @ts-nocheck
export default function MessagesLayout({ children }) {
  return (
    <div style={{ height: "calc(100vh - 56px)", overflow: "hidden" }}
      className="-mx-4 -my-4 lg:-mx-7 lg:-my-7">
      {children}
    </div>
  );
}
