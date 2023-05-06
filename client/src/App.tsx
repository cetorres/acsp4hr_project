import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { useDarkMode } from "./contexts/DarkModeContext";
import { DatasetsPage } from "./pages/DatasetsPage";
import { DashboardPage } from "./pages/DashboardPage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { UsersPage } from "./pages/UsersPage";
import { UserPage } from "./pages/UserPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import RouteRequireAuth from "./components/RouteRequireAuth";
import RouteRequireAdmin from "./components/RouteRequireAdmin";
import { AccountPage } from "./pages/AccountPage";
import { MyDatasetsPage } from "./pages/MyDatasetsPage";
import { FavoriteDatasetsPage } from "./pages/FavoriteDatasetsPage";
import { MyRequestsPage } from "./pages/MyRequestsPage";
import { RequestsPage } from "./pages/RequestsPage";
import { ComputationsPage } from "./pages/ComputationsPage";
import { ComputationsResultsPage } from "./pages/ComputationsResultsPage";
import './App.css';
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import RecoverPasswordPage from "./pages/RecoverPasswordPage";
import { NewDatasetPage } from "./pages/NewDatasetPage";
import DatasetPage from "./pages/DatasetPage";
import Auth from "./api/auth/auth";
import { useNotification } from "./contexts/NotificationContext";
import RequestPage from "./pages/RequestPage";
import { ComputationsAdminPage } from "./pages/ComputationsAdminPage";
import ComputationRunPage from "./pages/ComputationRunPage";
import { ComputationResultPage } from "./pages/ComputationResultPage";
import { ComputationPage } from "./pages/ComputationPage";
import { ComputationSuggestionsPage } from "./pages/ComputationSuggestionsPage";

function App() {
  const { authState, authCheckUserLoggedIn, authLoadedMe, authLogout } = useAuth();
  const { checkForNotifications } = useNotification();
  const { darkModeState, loadDarkMode } = useDarkMode();
  const [checkedUserAuth, setCheckedUserAuth] = useState(false);
  const [checkedUserLoaded, setCheckedUserLoaded] = useState(false);
  const signInPage = '/auth/signin';

  useEffect(() => {
    authCheckUserLoggedIn();
    loadDarkMode();
    setCheckedUserAuth(true);
  }, []);

  useEffect(() => {
    if (authState.isAuthenticated) {
      Auth.getMe().then((user) => {
        authLoadedMe(user);
        setCheckedUserLoaded(true);
        
        // Load notifications (requests to me)
        checkForNotifications();
      }).catch(() => {
        authLogout();
        setCheckedUserAuth(true);
        setCheckedUserLoaded(true);
      });
    }
  }, [authState.isAuthenticated]);

  const theme = createTheme({
    palette: {
      mode: darkModeState.darkMode ? 'dark' : 'light',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {checkedUserAuth ? (
        <Routes>
          {/* Auth routes */}
          <Route path={signInPage} element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/recover-password" element={<RecoverPasswordPage />} />
        
          {/* Admin routes */}
          {checkedUserLoaded ? (
            <>
              <Route path="/admin/users" element={<RouteRequireAuth redirectTo={signInPage}><RouteRequireAdmin><UsersPage /></RouteRequireAdmin></RouteRequireAuth>} />
              <Route path="/admin/computations" element={<RouteRequireAuth redirectTo={signInPage}><RouteRequireAdmin><ComputationsAdminPage /></RouteRequireAdmin></RouteRequireAuth>} />
              <Route path="/admin/suggestions" element={<RouteRequireAuth redirectTo={signInPage}><RouteRequireAdmin><ComputationSuggestionsPage /></RouteRequireAdmin></RouteRequireAuth>} />
            </>
          ) : ''}

          {/* Signed in routes */}
          <Route path="/dashboard" element={<RouteRequireAuth redirectTo={signInPage}><DashboardPage /></RouteRequireAuth>} />
          <Route path="/datasets" element={<RouteRequireAuth redirectTo={signInPage}><DatasetsPage /></RouteRequireAuth>} />
          <Route path="/datasets/:datasetId" element={<RouteRequireAuth redirectTo={signInPage}><DatasetPage /></RouteRequireAuth>} />
          <Route path="/my-datasets" element={<RouteRequireAuth redirectTo={signInPage}><MyDatasetsPage /></RouteRequireAuth>} />
          <Route path="/my-datasets/:datasetId" element={<RouteRequireAuth redirectTo={signInPage}><NewDatasetPage /></RouteRequireAuth>} />
          <Route path="/new-dataset" element={<RouteRequireAuth redirectTo={signInPage}><NewDatasetPage /></RouteRequireAuth>} />
          <Route path="/favorite-datasets" element={<RouteRequireAuth redirectTo={signInPage}><FavoriteDatasetsPage /></RouteRequireAuth>} />
          <Route path="/my-requests" element={<RouteRequireAuth redirectTo={signInPage}><MyRequestsPage /></RouteRequireAuth>} />
          <Route path="/requests" element={<RouteRequireAuth redirectTo={signInPage}><RequestsPage /></RouteRequireAuth>} />
          <Route path="/requests/:requestId" element={<RouteRequireAuth redirectTo={signInPage}><RequestPage /></RouteRequireAuth>} />
          <Route path="/computations" element={<RouteRequireAuth redirectTo={signInPage}><ComputationsPage /></RouteRequireAuth>} />
          <Route path="/computation/:computationId" element={<RouteRequireAuth redirectTo={signInPage}><ComputationPage /></RouteRequireAuth>} />
          <Route path="/computation-run" element={<RouteRequireAuth redirectTo={signInPage}><ComputationRunPage /></RouteRequireAuth>} />
          <Route path="/computation-run/:requestId" element={<RouteRequireAuth redirectTo={signInPage}><ComputationRunPage /></RouteRequireAuth>} />
          <Route path="/my-results" element={<RouteRequireAuth redirectTo={signInPage}><ComputationsResultsPage /></RouteRequireAuth>} />
          <Route path="/my-results/:computationRunId" element={<RouteRequireAuth redirectTo={signInPage}><ComputationResultPage /></RouteRequireAuth>} />
          <Route path="/account" element={<RouteRequireAuth redirectTo={signInPage}><AccountPage /></RouteRequireAuth>} />
          <Route path="/users/:id" element={<RouteRequireAuth redirectTo={signInPage}><UserPage /></RouteRequireAuth>} />
          <Route path="/" element={<RouteRequireAuth redirectTo={signInPage}><Navigate to='/dashboard' /></RouteRequireAuth>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      ) : ''}
    </ThemeProvider>
  );
}

export default App;
