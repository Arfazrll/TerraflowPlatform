"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [msg, setMsg] = useState("Loading...");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
      .then((r) => r.json())
      .then((d) => setMsg(`Backend: ${d.status} (${d.app})`))
      .catch(() => setMsg("Backend: ERROR (cek backend running)"));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Terraflow Dashboard</h1>
      <p>{msg}</p>
    </main>
  );
}
