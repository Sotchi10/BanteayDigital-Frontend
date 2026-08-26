import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { AlertsPage } from "../features/alerts/AlertsPage";
import { AnalysisPage } from "../features/analysis/AnalysisPage";
import { CommunityPage } from "../features/community/CommunityPage";
import { HomePage } from "../features/home/HomePage";
import { LeaderboardPage } from "../features/leaderboard/LeaderboardPage";
import { ReportPage } from "../features/report/ReportPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="report" element={<ReportPage />} />
        <Route path="analysis" element={<AnalysisPage />} />
        <Route path="alerts" element={<AlertsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
