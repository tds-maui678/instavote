import { createContext, useContext, useState, useCallback, useMemo } from "react";

const ToastCtx = createContext({ push: () => {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((msg, type = "info") => {
    const id = crypto.randomUUID();
    setItems(s => [...s, { id, msg, type }]);
    setTimeout(() => setItems(s => s.filter(x => x.id !== id)), 2500);
  }, []);
  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 space-y-2">
        {items.map(t => (
          <div key={t.id}
            className={`px-4 py-2 rounded shadow text-sm
              ${t.type === "error" ? "bg-red-600 text-white" :
                 t.type === "success" ? "bg-emerald-600 text-white" :
                 "bg-gray-900 text-white"}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
