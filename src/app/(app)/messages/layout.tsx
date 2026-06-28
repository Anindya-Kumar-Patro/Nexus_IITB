// @ts-nocheck
export default function MessagesLayout({ children }) {
  return (
    <>
      <style>{`
        .messages-container {
          position: fixed;
          top: 56px;
          left: 0;
          right: 0;
          bottom: 64px;
          overflow: hidden;
          z-index: 10;
          max-width: 100vw;
        }
        @media (min-width: 1024px) {
          .messages-container {
            top: 0;
            left: 240px;
            bottom: 0;
          }
        }
      `}</style>
      <div className="messages-container">
        {children}
      </div>
    </>
  );
}
