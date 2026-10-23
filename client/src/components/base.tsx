import { Outlet } from "react-router-dom";
import Navbar from "./navbar";

/* Layout-scope palette variables are driven by the active hero slide in Phase 2. */
export default function Base() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
