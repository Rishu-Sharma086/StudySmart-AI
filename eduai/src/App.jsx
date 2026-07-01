import { AppProvider, useApp } from "./context/AppContext";
import AuthPage   from "./pages/AuthPage";
import AppShell   from "./components/layout/AppShell";
import Toast       from "./components/ui/Toast";

function Inner() {
  const { authed, toast } = useApp();
  return (
    <>
      {authed ? <AppShell /> : <AuthPage />}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Inner />
    </AppProvider>
  );
}
