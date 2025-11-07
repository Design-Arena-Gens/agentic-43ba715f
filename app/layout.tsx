import "../styles/globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="app-header">
            <h1>AVL Tree Visualizer</h1>
          </header>
          <main className="app-main">{children}</main>
          <footer className="app-footer">Built for interactive algorithm learning</footer>
        </div>
      </body>
    </html>
  );
}
