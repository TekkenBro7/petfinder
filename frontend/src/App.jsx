import React, { useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CookiesProvider } from 'react-cookie';
import { lightTheme, darkTheme } from './themes/theme';
import { checkAuth } from './store/authSlice';
import { useSelector } from 'react-redux';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Footer from './components/layout/Footer';
import AdminPage from './pages/AdminPage';
import CreateAdPage from './pages/CreateAdPage';
import ProfilePage from './pages/ProfilePage';
import AdDetailPage from './pages/AdDetailPage';
import SearchPage from './pages/SearchPage';
import EditAdPage from './pages/EditAdPage';

function App() {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const theme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CookiesProvider>
        <Router>
          <div className="App">
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-ad"
                element={
                  <ProtectedRoute>
                    <CreateAdPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ad/:id"
                element={
                  <ProtectedRoute>
                    <AdDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-ad/:id"
                element={
                  <ProtectedRoute>
                    <EditAdPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/search" element={<SearchPage />} />

              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </div>
          <Footer />
        </Router>
      </CookiesProvider>
    </ThemeProvider>
  );
}

export default App;
