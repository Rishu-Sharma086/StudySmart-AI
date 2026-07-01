import { useApp } from "../../context/AppContext";
import Sidebar      from "./Sidebar";
import DashboardPage from "../../pages/DashboardPage";
import UploadPage    from "../../pages/UploadPage";
import QAPage        from "../../pages/QAPage";
import QuizPage      from "../../pages/QuizPage";
import ProfilePage   from "../../pages/ProfilePage";

export default function AppShell() {
  const { page } = useApp();

  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        {page === "dashboard" && <DashboardPage />}
        {page === "upload"    && <UploadPage    />}
        {page === "qa"        && <QAPage        />}
        {page === "quiz"      && <QuizPage      />}
        {page === "profile"   && <ProfilePage   />}
      </main>
    </div>
  );
}
