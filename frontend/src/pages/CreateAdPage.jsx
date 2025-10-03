import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardMedia,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  useTheme,
  Autocomplete,
} from '@mui/material';
import {
  AddPhotoAlternate,
  Delete,
  Pets,
  LocationOn,
  CalendarToday,
  Description,
  Category,
  NavigateNext,
  NavigateBefore,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import adService from '../services/adService';
import animalTypeService from '../services/animalTypeService';

const CreateAdPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    animal_type_id: '',
    breed: '',
    location: '',
    date_lost: '',
  });

  const [photos, setPhotos] = useState([]);
  const [animalTypes, setAnimalTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const addressTimeoutRef = useRef(null);

  const steps = [
    'Basic Information',
    'Pet Description',
    'Photos',
    'Contact Details',
  ];

  useEffect(() => {
    loadAnimalTypes();
  }, []);

  const loadAnimalTypes = async () => {
    try {
      const types = await animalTypeService.getAnimalTypes();
      setAnimalTypes(types);
    } catch (error) {
      console.error('Error loading animal types:', error);
    }
  };

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
        `http://127.0.0.1:8000/api/yandex/suggest/?q=${encodeURIComponent(query)}`,
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

  const getObjectTypeLabel = (type) => {
    const typeLabels = {
      street: 'Улица',
      house: 'Дом',
      city: 'Город',
      district: 'Район',
      area: 'Область',
      region: 'Регион',
      other: 'Адрес',
    };
    return typeLabels[type] || 'Адрес';
  };

  const handleLocationInputChange = (event, value) => {
    setFormData((prev) => ({
      ...prev,
      location: value || '',
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

  const handleAddressSelect = (event, value) => {
    if (value) {
      setFormData((prev) => ({
        ...prev,
        location: value.value || value,
      }));
    }
    setAddressSuggestions([]);
    setApiError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFieldErrors((prev) => ({
      ...prev,
      [name]: [],
    }));

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateTitle = (value) => {
    const errors = [];
    if (value.trim().length < 5) {
      errors.push('Title must contain at least 5 characters.');
    }
    if (value.length > 100) {
      errors.push('Title cannot exceed 100 characters.');
    }
    return errors;
  };

  const validateDescription = (value) => {
    const errors = [];
    if (value.trim().length < 10) {
      errors.push('Description must contain at least 10 characters.');
    }
    if (value.length > 2000) {
      errors.push('Description cannot exceed 2000 characters.');
    }
    return errors;
  };

  const validateDateLost = (value) => {
    const errors = [];
    if (!value) {
      errors.push('Date lost is required.');
      return errors;
    }

    const selectedDate = new Date(value);
    const today = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      errors.push('Lost date cannot be in the future.');
    }
    return errors;
  };

  const validateLocation = (value) => {
    const errors = [];
    if (!value.trim()) {
      errors.push('Location is required.');
    }
    if (value.length > 200) {
      errors.push('Location cannot exceed 200 characters.');
    }
    return errors;
  };

  const validatePhotos = (photosArray) => {
    const errors = [];

    if (photosArray.length > 10) {
      errors.push('You cannot upload more than 10 photos.');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    photosArray.forEach((photo) => {
      const file = photo.file || photo;

      if (!allowedTypes.includes(file.type)) {
        errors.push(
          `Invalid file type: ${file.type}. Allowed types: JPEG, PNG`
        );
      }

      if (file.size > 5 * 1024 * 1024) {
        errors.push(
          `File ${file.name} is too large. Maximum allowed size: 5MB.`
        );
      }
    });

    return errors;
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);

    const tempPhotos = [...photos.map((p) => p.file), ...files];

    const photoErrors = validatePhotos(tempPhotos);
    if (photoErrors.length > 0) {
      setFieldErrors((prev) => ({
        ...prev,
        photos: photoErrors,
      }));
      return;
    }

    const newPhotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);
    e.target.value = '';
  };

  const removePhoto = (photoId) => {
    setPhotos((prev) =>
      prev.filter((photo) => {
        if (photo.id === photoId) {
          URL.revokeObjectURL(photo.preview);
          return false;
        }
        return true;
      })
    );
  };

  const validateStep = (step) => {
    const errors = {};

    switch (step) {
      case 0: {
        const titleErrors = validateTitle(formData.title);
        if (titleErrors.length > 0) {
          errors.title = titleErrors;
        }

        if (!formData.animal_type_id) {
          errors.animal_type_id = ['Please select animal type'];
        }
        break;
      }
      case 1: {
        const descriptionErrors = validateDescription(formData.description);
        if (descriptionErrors.length > 0) {
          errors.description = descriptionErrors;
        }
        break;
      }
      case 2: {
        const photoErrors = validatePhotos(photos);
        if (photoErrors.length > 0) {
          errors.photos = photoErrors;
        }
        break;
      }
      case 3: {
        const locationErrors = validateLocation(formData.location);
        if (locationErrors.length > 0) {
          errors.location = locationErrors;
        }

        const dateErrors = validateDateLost(formData.date_lost);
        if (dateErrors.length > 0) {
          errors.date_lost = dateErrors;
        }
        break;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleStepClick = (stepIndex) => {
    if (stepIndex <= activeStep) {
      setActiveStep(stepIndex);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setFieldErrors({});

    try {
      let hasErrors = false;
      const allErrors = {};

      for (let step = 0; step < steps.length; step++) {
        const stepErrors = {};

        switch (step) {
          case 0: {
            const titleErrors = validateTitle(formData.title);
            if (titleErrors.length > 0) {
              stepErrors.title = titleErrors;
            }
            if (!formData.animal_type_id) {
              stepErrors.animal_type_id = ['Please select animal type'];
            }
            break;
          }
          case 1: {
            const descriptionErrors = validateDescription(formData.description);
            if (descriptionErrors.length > 0) {
              stepErrors.description = descriptionErrors;
            }
            break;
          }
          case 2: {
            const photoErrors = validatePhotos(photos);
            if (photoErrors.length > 0) {
              stepErrors.photos = photoErrors;
            }
            break;
          }
          case 3: {
            const locationErrors = validateLocation(formData.location);
            if (locationErrors.length > 0) {
              stepErrors.location = locationErrors;
            }
            const dateErrors = validateDateLost(formData.date_lost);
            if (dateErrors.length > 0) {
              stepErrors.date_lost = dateErrors;
            }
            break;
          }
        }

        if (Object.keys(stepErrors).length > 0) {
          Object.assign(allErrors, stepErrors);
          hasErrors = true;
        }
      }

      if (hasErrors) {
        setFieldErrors(allErrors);
        setError('Please fix the errors in the form');
        setLoading(false);
        return;
      }

      const submitData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      photos.forEach((photo) => {
        submitData.append('uploaded_photos', photo.file);
      });

      const createdAd = await adService.createAd(submitData);

      setSuccess('Advertisement created successfully!');
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (error) {
      console.error('Error creating ad:', error);

      if (error.response?.data) {
        const serverErrors = {};
        Object.keys(error.response.data).forEach((key) => {
          if (Array.isArray(error.response.data[key])) {
            serverErrors[key] = error.response.data[key];
          }
        });
        setFieldErrors(serverErrors);
      }

      setError(error.response?.data?.message || 'Error creating advertisement');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Advertisement Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Example: Lost cat Barsik in Central Park area"
                  helperText="Brief description of what happened (minimum 5 characters)"
                  error={fieldErrors.title && fieldErrors.title.length > 0}
                  {...(fieldErrors.title && {
                    helperText: fieldErrors.title[0],
                  })}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl
                  fullWidth
                  required
                  error={
                    fieldErrors.animal_type_id &&
                    fieldErrors.animal_type_id.length > 0
                  }
                >
                  <InputLabel>Animal Type</InputLabel>
                  <Select
                    name="animal_type_id"
                    value={formData.animal_type_id}
                    onChange={handleInputChange}
                    label="Animal Type"
                  >
                    <MenuItem value="">
                      <em>Select animal type</em>
                    </MenuItem>
                    {animalTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.animal_type_id && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 1, display: 'block' }}
                    >
                      {fieldErrors.animal_type_id[0]}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Breed"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  placeholder="Example: British Shorthair"
                  helperText="Optional - specify the breed if known"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={6}
                  label="Detailed Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your pet: color, size, special features, was wearing a collar, character..."
                  helperText="The more details you provide, the easier it will be to find your pet (minimum 10 characters)"
                  error={
                    fieldErrors.description &&
                    fieldErrors.description.length > 0
                  }
                  {...(fieldErrors.description && {
                    helperText: fieldErrors.description[0],
                  })}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Add clear photos of your pet from different angles (maximum 10)
            </Typography>

            {fieldErrors.photos && fieldErrors.photos.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {fieldErrors.photos.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </Alert>
            )}

            <Box sx={{ mb: 3 }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<AddPhotoAlternate />}
                disabled={photos.length >= 10}
                sx={{ mb: 2 }}
              >
                Add Photos
                <input
                  type="file"
                  multiple
                  accept="image/jpeg, image/png"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
              </Button>

              <Chip
                label={`Added: ${photos.length}/10`}
                color={photos.length >= 10 ? 'error' : 'primary'}
                variant="outlined"
                sx={{ ml: 2 }}
              />
            </Box>

            {photos.length > 0 && (
              <Grid container spacing={2}>
                {photos.map((photo) => (
                  <Grid item xs={6} sm={4} md={3} key={photo.id}>
                    <Card
                      sx={{
                        position: 'relative',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="140"
                        image={photo.preview}
                        alt="Preview"
                        sx={{ objectFit: 'cover' }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.7)',
                          },
                        }}
                        onClick={() => removePhoto(photo.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Autocomplete
                  freeSolo
                  options={addressSuggestions}
                  getOptionLabel={(option) =>
                    typeof option === 'string'
                      ? option
                      : option.displayName || ''
                  }
                  value={formData.location}
                  onInputChange={handleLocationInputChange}
                  onChange={handleAddressSelect}
                  loading={addressLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      fullWidth
                      label="Место пропажи"
                      placeholder="Начните вводить адрес (улица, дом, район, город)..."
                      helperText="Укажите точный адрес или район, где пропал питомец"
                      error={
                        fieldErrors.location && fieldErrors.location.length > 0
                      }
                      {...(fieldErrors.location && {
                        helperText: fieldErrors.location[0],
                      })}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                        ),
                        endAdornment: (
                          <React.Fragment>
                            {addressLoading ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box sx={{ width: '100%' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {option.displayName}
                            </Typography>
                            {option.fullAddress && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
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

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="date"
                  label="Date Lost"
                  name="date_lost"
                  value={formData.date_lost}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText="When did your pet go missing?"
                  error={
                    fieldErrors.date_lost && fieldErrors.date_lost.length > 0
                  }
                  {...(fieldErrors.date_lost && {
                    helperText: fieldErrors.date_lost[0],
                  })}
                  inputProps={{
                    max: new Date().toISOString().split('T')[0],
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor:
                      theme.palette.mode === 'light' ? '#f5f5f5' : '#424242',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Contact phone will be automatically taken from your profile
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ mt: 1, fontWeight: 'bold' }}
                  >
                    {user?.phone}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  const paperBackground =
    theme.palette.mode === 'light'
      ? 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      : 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)';

  const titleGradient =
    theme.palette.mode === 'light'
      ? 'linear-gradient(45deg, #1976d2, #4dabf5)'
      : 'linear-gradient(45deg, #90caf9, #bbdefb)';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={theme.palette.mode === 'light' ? 0 : 1}
        sx={{
          p: { xs: 2, md: 4 },
          background: paperBackground,
          borderRadius: 3,
          border:
            theme.palette.mode === 'dark'
              ? '1px solid rgba(255,255,255,0.1)'
              : 'none',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Pets
            sx={{
              fontSize: 64,
              color: 'primary.main',
              mb: 2,
              filter:
                theme.palette.mode === 'dark' ? 'brightness(1.2)' : 'none',
            }}
          />
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: titleGradient,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Create Lost Pet Advertisement
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Help find your pet - fill in the information below
          </Typography>
        </Box>

        {/* Сообщения */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(211,47,47,0.1)'
                  : undefined,
            }}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            severity="success"
            sx={{
              mb: 3,
              borderRadius: 2,
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(46,125,50,0.1)'
                  : undefined,
            }}
          >
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  onClick={() => handleStepClick(index)}
                  sx={{
                    cursor: index <= activeStep ? 'pointer' : 'default',
                    '& .MuiStepLabel-label': {
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      '&.Mui-completed': {
                        color: theme.palette.success.main,
                      },
                      '&.Mui-active': {
                        color: theme.palette.primary.main,
                      },
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Paper
          elevation={5}
          sx={{
            p: 3,
            mb: 3,
            backgroundColor:
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(255,255,255,0.1)',
          }}
        >
          <Typography variant="h5" gutterBottom color="primary">
            {steps[activeStep]}
          </Typography>
          {getStepContent(activeStep)}
        </Paper>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
            startIcon={<NavigateBefore />}
          >
            Back
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep > 0 && (
              <Button
                variant="outlined"
                onClick={() => setActiveStep(0)}
                disabled={loading}
              >
                Back to Start
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Pets />}
              size="large"
            >
              {loading ? 'Creating...' : 'Create Advertisement'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              endIcon={<NavigateNext />}
            >
              Next
            </Button>
          )}
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Step {activeStep + 1} of {steps.length}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateAdPage;
