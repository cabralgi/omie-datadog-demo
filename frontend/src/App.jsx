import { useState } from "react";
import { buildTraceHeaders } from "./trace.js";

const actions = [
  {
    rawId: "btn_X1",
    name: "GetProducts",
    method: "GET",
    path: "/getProducts"
  },
  {
    rawId: "btn_Z99",
    name: "SearchOrders",
    method: "POST",
    path: "/searchOrders",
    body: { query: {} }
  },
  {
    rawId: "btn_Q7",
    name: "Checkout",
    method: "POST",
    path: "/createCheckout",
    body: { cartId: "demo", total: 3200 }
  }
];

const apiBase = import.meta.env.VITE_API_BASE_URL || "";

const App = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleAction = async (action) => {
    setError("");
    setResult(null);

    try {
      const headers = {
        "content-type": "application/json",
        "x-action-name": action.name,
        "x-action-raw-id": action.rawId,
        ...buildTraceHeaders()
      };

      const response = await fetch(`${apiBase}${action.path}`, {
        method: action.method,
        headers,
        body: action.method === "POST" ? JSON.stringify(action.body) : undefined
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      setResult({ status: response.status, data });
    } catch (err) {
      setError(err.message || "Falha ao chamar API");
    }
  };

  const apiBaseReady = Boolean(apiBase);

  return (
    <div className="app">
      <header className="header">
        <h1>Datadog Demo</h1>
        <p>React SPA com botoes reutilizados e nomes legiveis.</p>
      </header>

      {!apiBaseReady && (
        <div className="error">
          Configure o arquivo <code>.env</code> com
          {" "}
          <code>VITE_API_BASE_URL</code> antes de testar.
        </div>
      )}

      <div className="actions">
        {actions.map((action) => (
          <button
            key={action.rawId}
            className="action-button"
            onClick={() => handleAction(action)}
          >
            {action.name} ({action.rawId})
          </button>
        ))}
      </div>

      <section className="panel">
        <h2>Resultado</h2>
        {error && <div className="error">{error}</div>}
        {!error && !result && <div className="muted">Sem chamadas ainda.</div>}
        {result && (
          <pre className="result">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
};

export default App;
