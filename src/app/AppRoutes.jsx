import { useInterfaceTranslation } from "../locales/useInterfaceTranslation";
import { cloneElement } from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { AlertsPage } from "../features/alerts/AlertsPage";
import { AnalysisPage } from "../features/analysis/AnalysisPage";
import { CommunityPage } from "../features/community/CommunityPage";
import { HomePage } from "../features/home/HomePage";
import { ScanHistoryPage } from "../features/history/ScanHistoryPage";
import { ScanDetailPage } from "../features/history/ScanDetailPage";
import { ReportHistoryPage } from "../features/history/ReportHistoryPage";
import { LeaderboardPage } from "../features/leaderboard/LeaderboardPage";
import { ReportPage } from "../features/report/ReportPage";
import { FeaturePlaceholder } from "../components/FeaturePlaceholder";
import { SettingsPage } from "../features/settings/SettingsPage";
import { SafetyKnowledgePage } from "../features/safety/SafetyKnowledgePage";
import { SafetyKnowledgeDetailPage } from "../features/safety/SafetyKnowledgeDetailPage";
import { AuthPage } from "../features/auth/AuthPage";
import { PublicProfilePage } from "../features/profile/PublicProfilePage";
import { useAuth } from "../state/AuthStore";

function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  return isAuthenticated ? cloneElement(children, { key: user.id }) : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

function LegacyCommunityPostRedirect() {
  const { postId } = useParams();
  return <Navigate to={`/posts/${encodeURIComponent(postId)}`} replace />;
}

export function AppRoutes() {
  const tr = useInterfaceTranslation();
  return (
    <Routes>
        <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="posts/:postId" element={<CommunityPage />} />
        <Route path="community" element={<Navigate to="/" replace />} />
        <Route path="community/posts/:postId" element={<LegacyCommunityPostRedirect />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
        <Route path="analysis" element={<AnalysisPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="safety" element={<SafetyKnowledgePage />} />
        <Route path="safety/:slug" element={<SafetyKnowledgeDetailPage />} />
        <Route path="settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="saved" element={<ProtectedRoute><FeaturePlaceholder icon="bookmark" eyebrow={tr("Your saved items")} title={tr("Saved")} description={tr("Keep useful scam alerts, community posts, and safety resources here for quick reference.")} /></ProtectedRoute>} />
        <Route path="history" element={<ProtectedRoute><ScanHistoryPage /></ProtectedRoute>} />
        <Route path="history/:scanId" element={<ProtectedRoute><ScanDetailPage /></ProtectedRoute>} />
        <Route path="reports/history" element={<ProtectedRoute><ReportHistoryPage /></ProtectedRoute>} />
        <Route path="about" element={<FeaturePlaceholder icon="book" eyebrow={tr("Learn more")} title={tr("About BanteayDigital")} description={tr("Learn how BanteayDigital helps the community recognise, report, and prevent digital scams.")} />} />
        <Route path=":username" element={<PublicProfilePage />} />
      </Route>
      <Route path="login" element={<AuthPage />} />
      <Route path="signup" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
