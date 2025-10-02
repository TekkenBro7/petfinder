import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardMedia,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Pets,
  Phone,
  CalendarToday,
  LocationOn,
  Cake,
  Edit,
  Delete,
  ArrowBack,
  Person,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import adService from '../services/adService';

const AdDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user: authUser } = useSelector((state) => state.auth);

  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAd();
  }, [id]);

  const loadAd = async () => {
    try {
      setLoading(true);
      const adData = await adService.getAdById(id);
      setAd(adData);
    } catch (error) {
      console.error('Error loading ad:', error);
      setError('Failed to load advertisement');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'default';
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return null;
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    const baseUrl = import.meta.env.VITE_MEDIA_URL;
    return `${baseUrl}${imagePath}`;
  };

  const handleDelete = async () => {
    try {
      await adService.deleteAd(id);
      setSuccess('Advertisement deleted successfully!');
      setTimeout(() => {
        navigate('/profile');
      }, 500);
    } catch (error) {
      console.error('Error deleting ad:', error);
      setError('Failed to delete advertisement');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const updatedAd = await adService.toggleAdStatus(id, !ad.is_active);
      setAd(updatedAd);
      setSuccess(
        `Advertisement ${updatedAd.is_active ? 'activated' : 'deactivated'} successfully!`
      );
    } catch (error) {
      console.error('Error toggling ad status:', error);
      setError('Failed to update advertisement status');
    }
  };

  const isOwner = ad?.author === authUser?.id;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!ad) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Advertisement not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/profile')}
          sx={{ mb: 2 }}
        >
          Back to Profile
        </Button>

        {isOwner && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => navigate(`/edit-ad/${id}`)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color={ad.is_active ? 'warning' : 'success'}
              onClick={handleToggleStatus}
            >
              {ad.is_active ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<Delete />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            {ad.photos && ad.photos.length > 0 ? (
              <Box>
                <Card>
                  <CardMedia
                    component="img"
                    height="400"
                    image={getImageUrl(ad.photos[0].image)}
                    alt={ad.title}
                    sx={{ objectFit: 'cover', borderRadius: 1 }}
                  />
                </Card>
                {ad.photos.length > 1 && (
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    {ad.photos.slice(1).map((photo, index) => (
                      <Grid item xs={4} key={photo.id}>
                        <Card>
                          <CardMedia
                            component="img"
                            height="100"
                            image={getImageUrl(photo.image)}
                            alt={`${ad.title} ${index + 2}`}
                            sx={{ objectFit: 'cover', borderRadius: 1 }}
                          />
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor:
                    theme.palette.mode === 'light' ? '#f5f5f5' : '#424242',
                  borderRadius: 1,
                }}
              >
                <Pets sx={{ fontSize: 80, color: 'text.secondary' }} />
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 2,
                }}
              >
                <Typography variant="h3" component="h1" gutterBottom>
                  {ad.title}
                </Typography>
                <Chip
                  label={ad.is_active ? 'Active' : 'Inactive'}
                  color={getStatusColor(ad.is_active)}
                  size="large"
                />
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Chip
                  icon={<Cake />}
                  label={ad.animal_type?.name}
                  variant="outlined"
                />
                {ad.breed && <Chip label={ad.breed} variant="outlined" />}
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1">{ad.location}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarToday sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Date Lost
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(ad.date_lost)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Phone sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Contact Phone
                    </Typography>
                    <Typography variant="body1">{ad.contact_phone}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {ad.description}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2">
                Created: {formatDate(ad.created_at)}
              </Typography>
              <Typography variant="body2">
                Updated: {formatDate(ad.updated_at)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Advertisement</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{ad.title}"? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdDetailPage;
