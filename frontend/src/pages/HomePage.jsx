import React from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import {
  Search,
  Add,
  Pets,
  People,
  VolunteerActivism,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const HomePage = () => {
  const { mode } = useSelector((state) => state.theme);

  const heroGradient =
    mode === 'light'
      ? 'linear-gradient(135deg, #413d86 0%, #667eea 100%)'
      : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)';

  const textGradient =
    mode === 'light'
      ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
      : 'linear-gradient(135deg, #818cf8 0%, #a5b4fc 100%)';

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Paper
        sx={{
          background: heroGradient,
          color: 'white',
          py: 10,
          borderRadius: 0,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700, mb: 3 }}
          >
            Helping pets return home
          </Typography>
          <Typography
            variant="h5"
            component="p"
            sx={{
              mb: 5,
              opacity: 0.9,
              maxWidth: '700px',
              margin: '0 auto',
            }}
          >
            PetFinder — This is a community of people who help to find and bring
            lost animals home. Join us and Save lives!
          </Typography>
          <Box
            sx={{
              display: 'flex',
              mt: 3,
              gap: 3,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              component={Link}
              to="/search"
              variant="contained"
              size="large"
              startIcon={<Search />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: mode === 'light' ? '#413d86' : '#1e293b',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                '&:hover': {
                  backgroundColor: '#f8fafc',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Find a pet
            </Button>
            <Button
              component={Link}
              to="/create-ad"
              variant="outlined"
              size="large"
              startIcon={<Add />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                color: 'white',
                borderColor: 'rgba(255,255,255,0.7)',
                borderRadius: '8px',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Create an ad
            </Button>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 600,
            mb: 6,
            background: textGradient,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Why choose PetFinder?
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {[
            {
              icon: <Pets fontSize="large" color="primary" />,
              title: 'Taking care of pets',
              text: 'Thousands of people search for and find animals every day.',
            },
            {
              icon: <People fontSize="large" color="secondary" />,
              title: 'Community',
              text: 'People come together to help each other.',
            },
            {
              icon: <VolunteerActivism fontSize="large" color="success" />,
              title: 'Quick help',
              text: 'Ads quickly find a response in your area.',
            },
          ].map((item, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  borderRadius: '12px',
                  boxShadow: 3,
                  p: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>{item.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {item.text}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;
