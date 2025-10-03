import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  CircularProgress,
  Avatar,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Person,
  Pets,
  Phone,
  CalendarToday,
  LocationOn,
  Edit,
  Add,
  Cake,
  Close,
  Favorite,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import userService from '../services/userService';
import adService from '../services/adService';
import favoriteService from '../services/favoriteService';

const ProfilePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user: authUser } = useSelector((state) => state.auth);

  const [userData, setUserData] = useState(null);
  const [userAds, setUserAds] = useState([]);
  const [favoriteAds, setFavoriteAds] = useState([]);
  const [, setAllAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0 - мои объявления, 1 - избранные

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editFormData, setEditFormData] = useState({
    username: '',
    first_name: '',
    phone: '',
  });
  const [editErrors, setEditErrors] = useState({});

  useEffect(() => {
    loadProfileData();
  }, []);

  useEffect(() => {
    if (activeTab === 1) {
      loadFavorites();
    }
  }, [activeTab]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const userResponse = await userService.getCurrentUser();
      setUserData(userResponse);

      const allAdsResponse = await adService.getAds();
      const myAds = allAdsResponse.filter((ad) => ad.author === authUser?.id);
      setUserAds(myAds);
      setAllAds(allAdsResponse);
    } catch (error) {
      console.error('Error loading profile data:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      setFavoritesLoading(true);
      const favoritesData = await favoriteService.getMyFavorites();
      // Извлекаем объявления из объектов избранного
      const ads = favoritesData.results
        ? favoritesData.results.map((fav) => fav.ad)
        : favoritesData.map((fav) => fav.ad);
      setFavoriteAds(ads);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setError('Failed to load favorites');
    } finally {
      setFavoritesLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditOpen = () => {
    if (userData) {
      setEditFormData({
        username: userData.username || '',
        first_name: userData.first_name || '',
        phone: userData.phone || '',
      });
      setEditErrors({});
      setEditError('');
    }
    setEditModalOpen(true);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setEditErrors({});
    setEditError('');
  };

  const handleEditInputChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (editErrors[field]) {
      setEditErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateEditForm = () => {
    const newErrors = {};

    if (!editFormData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (editFormData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    } else if (editFormData.username.length > 30) {
      newErrors.username = 'Username must be less than 30 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(editFormData.username)) {
      newErrors.username =
        'Username can only contain letters, numbers and underscores';
    }

    if (editFormData.first_name && editFormData.first_name.length > 50) {
      newErrors.first_name = 'First name must be less than 50 characters';
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateEditForm()) {
      return;
    }

    setEditLoading(true);
    setEditError('');

    try {
      const updatedUser = await userService.updateUser(
        userData.id,
        editFormData
      );
      setUserData(updatedUser);
      setEditModalOpen(false);

      setError('');
    } catch (error) {
      console.error('Error updating profile:', error);

      if (error.response?.data) {
        const apiErrors = error.response.data;

        if (typeof apiErrors === 'object') {
          const fieldErrors = {};
          Object.keys(apiErrors).forEach((key) => {
            if (Array.isArray(apiErrors[key])) {
              fieldErrors[key] = apiErrors[key].join(', ');
            } else {
              fieldErrors[key] = apiErrors[key];
            }
          });
          setEditErrors(fieldErrors);

          const errorMessages = Object.values(fieldErrors).join(', ');
          setEditError(`Update failed: ${errorMessages}`);
        } else if (typeof apiErrors === 'string') {
          setEditError(apiErrors);
        } else {
          setEditError('Failed to update profile. Please check your data.');
        }
      } else if (error.message) {
        setEditError(error.message);
      } else {
        setEditError('Failed to update profile. Please try again.');
      }
    } finally {
      setEditLoading(false);
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

  const renderAdCard = (ad) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={ad.id}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: 6,
          },
          cursor: 'pointer',
        }}
        onClick={() => navigate(`/ad/${ad.id}`)}
      >
        {ad.photos && ad.photos.length > 0 ? (
          <CardMedia
            component="img"
            height="250"
            image={getImageUrl(ad.photos[0].image)}
            alt={ad.title}
            sx={{ objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              height: 250,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor:
                theme.palette.mode === 'light' ? '#f5f5f5' : '#424242',
            }}
          >
            <Pets sx={{ fontSize: 80, color: 'text.secondary' }} />
          </Box>
        )}

        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 2,
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{ fontSize: '1.3rem' }}
            >
              {ad.title}
            </Typography>
            <Chip
              label={ad.is_active ? 'Active' : 'Inactive'}
              color={getStatusColor(ad.is_active)}
              size="medium"
              sx={{ fontSize: '0.9rem' }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Cake sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: '1rem' }}
            >
              {ad.animal_type?.name}
            </Typography>
            {ad.breed && (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ ml: 1, fontSize: '1rem' }}
              >
                • {ad.breed}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationOn sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: '1rem' }}
            >
              {ad.location}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <CalendarToday
              sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }}
            />
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: '1rem' }}
            >
              Lost: {formatDate(ad.date_lost)}
            </Typography>
          </Box>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontSize: '1rem',
              lineHeight: 1.5,
              mb: 2,
            }}
          >
            {ad.description}
          </Typography>

          <Box
            sx={{
              mt: 'auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: '0.9rem' }}
            >
              Created: {formatDate(ad.created_at)}
            </Typography>
            <Chip
              label={`${ad.photos?.length || 0} photos`}
              variant="outlined"
              size="medium"
              sx={{ fontSize: '0.9rem' }}
            />
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  const renderEmptyState = (type) => (
    <Paper sx={{ p: 6, textAlign: 'center' }}>
      {type === 'ads' ? (
        <>
          <Pets sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
          <Typography
            variant="h4"
            color="text.secondary"
            gutterBottom
            sx={{ mb: 2 }}
          >
            No advertisements yet
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Create your first advertisement to help find lost pets
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/create-ad')}
            size="large"
            sx={{ fontSize: '1.1rem', padding: '12px 24px' }}
          >
            Create First Advertisement
          </Button>
        </>
      ) : (
        <>
          <Favorite sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
          <Typography
            variant="h4"
            color="text.secondary"
            gutterBottom
            sx={{ mb: 2 }}
          >
            No favorite ads yet
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Start adding advertisements to your favorites to save them for later
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            size="large"
            sx={{ fontSize: '1.1rem', padding: '12px 24px' }}
          >
            Browse Ads
          </Button>
        </>
      )}
    </Paper>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          background:
            theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
          color: 'white',
          position: 'relative',
        }}
      >
        <IconButton
          onClick={handleEditOpen}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.3)',
            },
          }}
        >
          <Edit />
        </IconButton>

        <Grid container spacing={4} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: 'rgba(255,255,255,0.2)',
                fontSize: '3rem',
              }}
            >
              <Person fontSize="inherit" />
            </Avatar>
          </Grid>

          <Grid item xs>
            <Box>
              <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                {userData?.first_name || userData?.username}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Chip
                  icon={<Person />}
                  label={`@${userData?.username}`}
                  variant="outlined"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    fontSize: '1rem',
                    height: '36px',
                  }}
                />

                <Chip
                  icon={<Phone />}
                  label={userData?.phone}
                  variant="outlined"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    fontSize: '1rem',
                    height: '36px',
                  }}
                />

                {userData?.role === 'admin' && (
                  <Chip
                    label="Administrator"
                    color="warning"
                    variant="filled"
                    sx={{
                      fontSize: '1rem',
                      height: '36px',
                    }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
                  <strong>Registered:</strong>{' '}
                  {formatDate(userData?.date_joined)}
                </Typography>
                {userData?.last_login && (
                  <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
                    <strong>Last login:</strong>{' '}
                    {formatDate(userData?.last_login)}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>

          <Grid item>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/create-ad')}
              sx={{
                backgroundColor: 'white',
                color: theme.palette.mode === 'light' ? '#667eea' : '#2d3748',
                fontSize: '1.1rem',
                padding: '12px 24px',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                },
              }}
            >
              Create New Ad
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Pets />
                My Advertisements
                <Chip label={userAds.length} size="small" color="primary" />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Favorite />
                Favorite Ads
              </Box>
            }
          />
        </Tabs>
      </Paper>

      {activeTab === 0 ? (
        userAds.length === 0 ? (
          renderEmptyState('ads')
        ) : (
          <Grid container spacing={4}>
            {userAds.map(renderAdCard)}
          </Grid>
        )
      ) : favoritesLoading ? (
        <Box display="flex" justifyContent="center" sx={{ py: 4 }}>
          <CircularProgress />
        </Box>
      ) : favoriteAds.length === 0 ? (
        renderEmptyState('favorites')
      ) : (
        <Grid container spacing={4}>
          {favoriteAds.map(renderAdCard)}
        </Grid>
      )}

      <Dialog
        open={editModalOpen}
        onClose={handleEditClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h5" component="h2">
              Edit Profile
            </Typography>
            <IconButton onClick={handleEditClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username *"
                value={editFormData.username}
                onChange={(e) =>
                  handleEditInputChange('username', e.target.value)
                }
                error={!!editErrors.username}
                helperText={editErrors.username}
                variant="outlined"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="First Name"
                value={editFormData.first_name}
                onChange={(e) =>
                  handleEditInputChange('first_name', e.target.value)
                }
                error={!!editErrors.first_name}
                helperText={editErrors.first_name}
                placeholder="Your first name"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number *"
                value={editFormData.phone}
                onChange={(e) => handleEditInputChange('phone', e.target.value)}
                error={!!editErrors.phone}
                helperText={editErrors.phone}
                placeholder="+1234567890"
                variant="outlined"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 1 }}>
                Email cannot be changed. Contact administrator if needed.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleEditClose}
            variant="outlined"
            disabled={editLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            disabled={editLoading}
            startIcon={editLoading ? <CircularProgress size={16} /> : null}
          >
            {editLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;
