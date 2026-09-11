import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { AlertsPage } from "../features/alerts/AlertsPage";
import { AnalysisPage } from "../features/analysis/AnalysisPage";
import { CommunityPage } from "../features/community/CommunityPage";
import { HomePage } from "../features/home/HomePage";
import { LeaderboardPage } from "../features/leaderboard/LeaderboardPage";
import { ReportPage } from "../features/report/ReportPage";
import { FeaturePlaceholder } from "../components/FeaturePlaceholder";
import { SettingsPage } from "../features/settings/SettingsPage";

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
        <Route path="settings" element={<SettingsPage />} />
        <Route path="saved" element={<FeaturePlaceholder icon="bookmark" eyebrow="Your saved items" title="Saved" description="Keep useful scam alerts, community posts, and safety resources here for quick reference." />} />
        <Route path="history" element={<FeaturePlaceholder icon="clock" eyebrow="Your activity" title="History" description="Review your previous scam analyses, reports, and safety activity in one place." />} />
        <Route path="about" element={<FeaturePlaceholder icon="book" eyebrow="Learn more" title="About BanteayDigital" description="Learn how BanteayDigital helps the community recognise, report, and prevent digital scams." />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
