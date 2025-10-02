import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Typography, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        flexDirection="column"
        sx={{ p: 3 }}
      >
        <Typography variant="h4" color="error" gutterBottom>
          ⚠️ Доступ запрещен
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 2 }}>
          У вас недостаточно прав для доступа к этой странице.
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Только администраторы могут просматривать эту страницу.
        </Typography>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;
