import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { AddPhotoAlternate, Delete, Pets } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import adService from '../services/adService';
import animalTypeService from '../services/animalTypeService';

const CreateAdPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    animal_type_id: '',
    breed: '',
    location: '',
    date_lost: '',
    contact_phone: user?.phone || '',
  });

  const [photos, setPhotos] = useState([]);
  const [animalTypes, setAnimalTypes] = useState([]);
  const [, setLoading] = useState(false);
  const [animalTypesLoading, setAnimalTypesLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAnimalTypes();
  }, []);

  const loadAnimalTypes = async () => {
    try {
      setAnimalTypesLoading(true);
      const types = await animalTypeService.getAnimalTypes();
      setAnimalTypes(types);
    } catch (error) {
      console.error('Error loading animal types:', error);
      setError('Could not load animal types');
    } finally {
      setAnimalTypesLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (
        !formData.title ||
        !formData.description ||
        !formData.animal_type_id ||
        !formData.location ||
        !formData.date_lost
      ) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }

      if (photos.length === 0) {
        setError('Add at least one photo.');
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

      setSuccess('The ad was created successfully!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error creating ad:', error);
      setError(error.response?.data?.message || 'Error when creating an ad');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      photos.forEach((photo) => {
        URL.revokeObjectURL(photo.preview);
      });
    };
  }, [photos]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Pets sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Create a missing persons notice
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Fill in the information about the missing pet
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

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Ad title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="For example: A Badger cat has disappeared in the Central Park area"
                helperText="A brief description of what happened"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Type of animal</InputLabel>
                <Select
                  name="animal_type_id"
                  value={formData.animal_type_id}
                  onChange={handleInputChange}
                  label="Type of animal"
                  disabled={animalTypesLoading}
                >
                  {animalTypesLoading ? (
                    <MenuItem disabled>Загрузка...</MenuItem>
                  ) : (
                    animalTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Breed"
                name="breed"
                value={formData.breed}
                onChange={handleInputChange}
                placeholder="For example: British Shorthair"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Place of loss"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="For example: Moscow, Central Administrative District, Tverskaya St."
                helperText="Specify the exact address or area where the animal disappeared."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="date"
                label="Date of loss"
                name="date_lost"
                value={formData.date_lost}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateAdPage;
