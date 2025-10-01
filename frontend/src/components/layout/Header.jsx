import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  Pets,
  Login,
  PersonAdd,
  Logout,
  Person,
  Menu as MenuIcon,
  Add,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/authSlice';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      handleClose();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const headerGradient = mode === 'light' 
    ? 'linear-gradient(135deg, #413d86 0%, #667eea 100%)'
    : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)';

  const textGradient = mode === 'light'
    ? 'linear-gradient(45deg, #fff, #e0e7ff)'
    : 'linear-gradient(45deg, #f1f5f9, #cbd5e1)';

  return (
    <AppBar
      position="static"
      elevation={2}
      sx={{
        background: headerGradient,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Pets sx={{ mr: 2, fontSize: 32, color: 'white' }} />
            <Typography
              variant="h4"
              component={Link}
              to="/"
              sx={{
                textDecoration: 'none',
                fontWeight: 700,
                background: textGradient,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              PetFinder
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <Button
                  component={Link}
                  to="/create-ad"
                  variant="outlined"
                  startIcon={<Add />}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.7)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Create an ad
                </Button>

                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <MenuIcon />
                </IconButton>
                
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleProfile}>
                    <Person sx={{ mr: 1 }} />
                    {user?.first_name || user?.username}
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Logout sx={{ mr: 1 }} />
                      Log out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  startIcon={<Login />}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.7)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Log in
                </Button>

                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  startIcon={<PersonAdd />}
                  sx={{
                    backgroundColor: 'white',
                    color: mode === 'light' ? '#413d86' : '#1e293b',
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                      transform: 'translateY(-1px)',
                      boxShadow: 3,
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  Registration
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 