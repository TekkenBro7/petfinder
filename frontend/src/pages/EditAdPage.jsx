import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  IconButton,
  FormHelperText,
  Divider,
  Autocomplete,
} from '@mui/material';
import {
  ArrowBack,
  Delete as DeleteIcon,
  AddPhotoAlternate,
  Pets,
  LocationOn,
  CalendarToday,
  Title,
  Description,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { adService, animalTypeService } from '../services';

const EditAdPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useSelector((state) => state.auth);
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [animalTypes, setAnimalTypes] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    animal_type_id: '',
    breed: '',
    location: '',
    date_lost: '',
    is_active: true,
  });

  const [photos, setPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [photosToDelete, setPhotosToDelete] = useState([]);
  const [errors, setErrors] = useState({});

  // Добавляем состояния для Autocomplete
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const addressTimeoutRef = useRef(null);

  useEffect(() => {
    loadAnimalTypes();
    loadAd();
  }, [id]);

  const loadAnimalTypes = async () => {
    try {
      const types = await animalTypeService.getAnimalTypes();
      setAnimalTypes(types);
    } catch (error) {
      console.error('Error loading animal types:', error);
    }
  };

  const loadAd = async () => {
    try {
      setLoading(true);
      const adData = await adService.getAdById(id);

      if (adData.author !== authUser?.id) {
        setError('You are not authorized to edit this advertisement');
        return;
      }

      setFormData({
        title: adData.title || '',
        description: adData.description || '',
        animal_type_id: adData.animal_type?.id || '',
        breed: adData.breed || '',
        location: adData.location || '',
        date_lost: adData.date_lost || '',
        is_active: adData.is_active ?? true,
      });

      setPhotos(adData.photos || []);
    } catch (error) {
      console.error('Error loading ad:', error);
      setError('Failed to load advertisement');
    } finally {
      setLoading(false);
    }
  };

  // Добавляем функцию для получения подсказок адресов
  const fetchAddressSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setAddressSuggestions([]);
      setApiError('');
      return;
    }

    setAddressLoading(true);
    setApiError('');

    try {
      const response = await fetch(
        `/api/yandex/suggest/?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Response status:', response.status);

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but got:', contentType);
        console.error('Response preview:', text.substring(0, 200));
        throw new Error(
          `Server returned ${contentType || 'unknown content-type'}`
        );
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);

      if (data.results) {
        const suggestions = data.results.map((item) => ({
          displayName: item.title?.text || '',
          fullAddress: item.subtitle?.text || '',
          value: `${item.title?.text || ''}${item.subtitle?.text ? `, ${item.subtitle.text}` : ''}`,
          type: 'geo',
        }));
        setAddressSuggestions(suggestions);
      } else {
        setAddressSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setApiError(`Ошибка загрузки подсказок: ${error.message}`);
      setAddressSuggestions([]);
    } finally {
      setAddressLoading(false);
    }
  };

  // Функция для обработки изменения ввода адреса
  const handleLocationInputChange = (event, value) => {
    setFormData(prev => ({
      ...prev,
      location: value || ''
    }));

    setApiError('');

    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current);
    }

    if (value && value.length >= 2) {
      addressTimeoutRef.current = setTimeout(() => {
        fetchAddressSuggestions(value);
      }, 500);
    } else {
      setAddressSuggestions([]);
    }
  };

  // Функция для выбора адреса из подсказок
  const handleAddressSelect = (event, value) => {
    if (value) {
      setFormData(prev => ({
        ...prev,
        location: value.value || value
      }));
    }
    setAddressSuggestions([]);
    setApiError('');
  };

  const getObjectTypeLabel = (type) => {
    const typeLabels = {
      'street': 'Улица',
      'house': 'Дом',
      'city': 'Город',
      'district': 'Район',
      'other': 'Адрес'
    };
    return typeLabels[type] || 'Адрес';
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);

    const remainingExistingPhotos = photos.filter(
      (photo) => !photosToDelete.includes(photo.id)
    );
    const totalPhotos =
      remainingExistingPhotos.length + newPhotos.length + files.length;

    if (totalPhotos > 10) {
      setErrors((prev) => ({
        ...prev,
        photos: 'Maximum 10 photos allowed',
      }));
      return;
    }

    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          photos: 'File size should be less than 10MB',
        }));
        return false;
      }
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({
          ...prev,
          photos: 'Only image files are allowed',
        }));
        return false;
      }
      return true;
    });

    setNewPhotos((prev) => [...prev, ...validFiles]);

    if (validFiles.length > 0 && errors.photos) {
      setErrors((prev) => ({
        ...prev,
        photos: '',
      }));
    }

    event.target.value = '';
  };

  const handleRemoveExistingPhoto = (photoId) => {
    setPhotosToDelete((prev) => [...prev, photoId]);
  };

  const handleRemoveNewPhoto = (index) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveAllPhotos = () => {
    setPhotosToDelete(photos.map((photo) => photo.id));
    setNewPhotos([]);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    }

    if (!formData.animal_type_id) {
      newErrors.animal_type_id = 'Animal type is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.date_lost) {
      newErrors.date_lost = 'Date lost is required';
    } else if (new Date(formData.date_lost) > new Date()) {
      newErrors.date_lost = 'Date lost cannot be in the future';
    }

    const remainingExistingPhotos = photos.filter(
      (photo) => !photosToDelete.includes(photo.id)
    );
    if (remainingExistingPhotos.length === 0 && newPhotos.length === 0) {
      newErrors.photos = 'At least one photo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const submitData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key]);
        }
      });

      const remainingExistingPhotos = photos.filter(
        (photo) => !photosToDelete.includes(photo.id)
      );

      if (photosToDelete.length > 0 || newPhotos.length > 0) {
        for (const photo of remainingExistingPhotos) {
          try {
            const response = await fetch(getImageUrl(photo.image));
            const blob = await response.blob();
            const file = new File([blob], `existing_${photo.id}.jpg`, {
              type: 'image/jpeg',
            });
            submitData.append('uploaded_photos', file);
          } catch (error) {
            console.error('Error converting existing photo to file:', error);
          }
        }

        newPhotos.forEach((photo) => {
          submitData.append('uploaded_photos', photo);
        });
      }

      await adService.updateAd(id, submitData);

      setSuccess('Advertisement updated successfully!');
      setTimeout(() => {
        navigate(`/ad/${id}`);
      }, 1000);
    } catch (error) {
      console.error('Error updating ad:', error);
      setError(
        error.response?.data?.message || 'Failed to update advertisement'
      );
    } finally {
      setSubmitting(false);
    }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toISOString().split('T')[0];
  };

  const isDeletingAllPhotos =
    photosToDelete.length === photos.length && photos.length > 0;
  const remainingExistingPhotos = photos.filter(
    (photo) => !photosToDelete.includes(photo.id)
  );

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

  if (error && !loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/profile')}>
          Back to Profile
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/ad/${id}`)}
          sx={{ mr: 2 }}
        >
          Back to Ad
        </Button>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 600, color: 'primary.main' }}
        >
          Edit Advertisement
        </Typography>
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

      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Title sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Basic Information
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Advertisement Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={!!errors.title}
                  helperText={errors.title}
                  required
                  variant="outlined"
                  size="medium"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  error={!!errors.description}
                  helperText={errors.description}
                  multiline
                  rows={4}
                  required
                  variant="outlined"
                  size="medium"
                />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Pets sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Animal Details
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  error={!!errors.animal_type_id}
                  variant="outlined"
                >
                  <InputLabel>Animal Type *</InputLabel>
                  <Select
                    value={formData.animal_type_id}
                    label="Animal Type *"
                    onChange={(e) =>
                      handleInputChange('animal_type_id', e.target.value)
                    }
                  >
                    {animalTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.animal_type_id && (
                    <FormHelperText>{errors.animal_type_id}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Breed"
                  value={formData.breed}
                  onChange={(e) => handleInputChange('breed', e.target.value)}
                  placeholder="e.g., British Shorthair, Labrador Retriever"
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Location & Details
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Autocomplete
                  freeSolo
                  options={addressSuggestions}
                  loading={addressLoading}
                  getOptionLabel={(option) => 
                    typeof option === 'string' ? option : option.displayName || ''
                  }
                  value={formData.location}
                  onInputChange={handleLocationInputChange}
                  onChange={handleAddressSelect}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      label="Место пропажи"
                      placeholder="Начните вводить адрес (улица, дом, район, город)..."
                      helperText="Укажите точный адрес или район, где пропал питомец"
                      error={!!errors.location}
                      {...(errors.location && { helperText: errors.location })}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />,
                        endAdornment: (
                          <React.Fragment>
                            {addressLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                      required
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {option.displayName}
                            </Typography>
                            {option.fullAddress && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {option.fullAddress}
                              </Typography>
                            )}
                          </Box>
                          <Chip 
                            label={getObjectTypeLabel(option.type)} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                        </Box>
                      </Box>
                    </li>
                  )}
                />
                {apiError && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    {apiError}
                  </Alert>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date Lost"
                  type="date"
                  value={formatDate(formData.date_lost)}
                  onChange={(e) =>
                    handleInputChange('date_lost', e.target.value)
                  }
                  error={!!errors.date_lost}
                  helperText={errors.date_lost}
                  InputLabelProps={{ shrink: true }}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Advertisement Status</InputLabel>
                  <Select
                    value={formData.is_active}
                    label="Advertisement Status"
                    onChange={(e) =>
                      handleInputChange('is_active', e.target.value)
                    }
                  >
                    <MenuItem value={true}>Active</MenuItem>
                    <MenuItem value={false}>Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Остальной код остается без изменений */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AddPhotoAlternate sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Photos
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {isDeletingAllPhotos && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                All photos will be removed from this advertisement
              </Alert>
            )}

            {errors.photos && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.photos}
              </Alert>
            )}

            <Box
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                p: 2,
                borderRadius: 1,
                mb: 3,
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Photo Summary: {remainingExistingPhotos.length} current +{' '}
                {newPhotos.length} new ={' '}
                {remainingExistingPhotos.length + newPhotos.length}/10 total
              </Typography>
              <Typography variant="caption" color="text.secondary">
                First photo will be used as the main image
              </Typography>
            </Box>

            {remainingExistingPhotos.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  Current Photos
                </Typography>
                <Grid container spacing={2}>
                  {remainingExistingPhotos.map((photo, index) => (
                    <Grid item xs={6} sm={4} md={3} key={photo.id}>
                      <Card
                        sx={{
                          position: 'relative',
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="140"
                          image={getImageUrl(photo.image)}
                          alt={`Photo ${index + 1}`}
                          sx={{ objectFit: 'cover' }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'error.main',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'error.dark',
                            },
                          }}
                          onClick={() => handleRemoveExistingPhoto(photo.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        {index === 0 && (
                          <Chip
                            label="Main"
                            size="small"
                            color="primary"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              fontWeight: 'bold',
                            }}
                          />
                        )}
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {newPhotos.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  New Photos
                </Typography>
                <Grid container spacing={2}>
                  {newPhotos.map((photo, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Card
                        sx={{
                          position: 'relative',
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="140"
                          image={URL.createObjectURL(photo)}
                          alt={`New photo ${index + 1}`}
                          sx={{ objectFit: 'cover' }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'error.main',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'error.dark',
                            },
                          }}
                          onClick={() => handleRemoveNewPhoto(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<AddPhotoAlternate />}
                disabled={
                  remainingExistingPhotos.length + newPhotos.length >= 10
                }
                sx={{ borderRadius: 2 }}
              >
                Upload Photos
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </Button>

              {photos.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleRemoveAllPhotos}
                  sx={{ borderRadius: 2 }}
                >
                  Remove All Photos
                </Button>
              )}
            </Box>

            <Typography variant="caption" color="text.secondary">
              Supported formats: JPEG, PNG, GIF • Max file size: 10MB
            </Typography>
          </Box>

          <Box sx={{ pt: 2 }}>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/ad/${id}`)}
                disabled={submitting}
                sx={{ borderRadius: 2, px: 4 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{ borderRadius: 2, px: 4, minWidth: 120 }}
              >
                {submitting ? <CircularProgress size={24} /> : 'Update Ad'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default EditAdPage;
