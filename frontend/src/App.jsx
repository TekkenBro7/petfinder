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
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                      <h1>Профиль пользователя</h1>
                      <p>Добро пожаловать в ваш профиль!</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-ad" 
                element={
                  <ProtectedRoute>
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                      <h1>Создание объявления</h1>
                      <p>Форма создания объявления будет здесь</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
          <Footer />
        </Router>
      </CookiesProvider>
    </ThemeProvider>
  );
}

export default App;
