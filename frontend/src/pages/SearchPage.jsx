import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
  Checkbox,
  ListItemText,
  OutlinedInput,
  FormControlLabel,
  Pagination,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import { Search, Pets, LocationOn, CalendarToday } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { adService, animalTypeService } from '../services';

const ITEMS_PER_PAGE = 10;

const SearchPage = () => {
  const { mode } = useSelector((state) => state.theme);
  const [allAds, setAllAds] = useState([]);
  const [displayedAds, setDisplayedAds] = useState([]);
  const [animalTypes, setAnimalTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    search: '',
    location: '',
    date_lost_from: '',
    date_lost_to: '',
    animal_type: [],
    is_active: true,
  });

  const textGradient =
    mode === 'light'
      ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
      : 'linear-gradient(135deg, #818cf8 0%, #a5b4fc 100%)';

  useEffect(() => {
    loadAnimalTypes();
    loadAllAds();
  }, []);

  useEffect(() => {
    applyFiltersAndPagination();
  }, [allAds, filters, page]);

  const loadAnimalTypes = async () => {
    try {
      const types = await animalTypeService.getAnimalTypes();
      setAnimalTypes(types);
    } catch (error) {
      console.error('Error loading animal types:', error);
    }
  };

  const loadAllAds = async () => {
    setLoading(true);
    setError('');
    try {
      const ads = await adService.getAds();
      setAllAds(ads);
    } catch (error) {
      console.error('Error loading ads:', error);
      setError('Failed to load ads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndPagination = () => {
    let filteredAds = [...allAds];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredAds = filteredAds.filter(
        (ad) =>
          ad.title.toLowerCase().includes(searchLower) ||
          ad.breed.toLowerCase().includes(searchLower) ||
          ad.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      filteredAds = filteredAds.filter((ad) =>
        ad.location.toLowerCase().includes(locationLower)
      );
    }

    if (filters.animal_type.length > 0) {
      filteredAds = filteredAds.filter((ad) =>
        filters.animal_type.includes(ad.animal_type.id)
      );
    }

    // Фильтр по дате "от"
    if (filters.date_lost_from) {
      filteredAds = filteredAds.filter(
        (ad) => new Date(ad.date_lost) >= new Date(filters.date_lost_from)
      );
    }

    if (filters.date_lost_to) {
      filteredAds = filteredAds.filter(
        (ad) => new Date(ad.date_lost) <= new Date(filters.date_lost_to)
      );
    }

    if (filters.is_active) {
      filteredAds = filteredAds.filter((ad) => ad.is_active);
    }

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedAds = filteredAds.slice(startIndex, endIndex);

    setDisplayedAds(paginatedAds);
    setTotalPages(Math.ceil(filteredAds.length / ITEMS_PER_PAGE));
  };

  const handleSearchWithBackend = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};

      if (filters.search) {
        params.search = filters.search;
      }
      if (filters.location) {
        params.location = filters.location;
      }
      if (filters.date_lost_from) {
        params.date_lost_from = filters.date_lost_from;
      }
      if (filters.date_lost_to) {
        params.date_lost_to = filters.date_lost_to;
      }
      if (filters.animal_type.length > 0) {
        params.animal_type = filters.animal_type.join(',');
      }
      if (filters.is_active) {
        params.is_active = filters.is_active;
      }

      console.log('Sending params to backend:', params);

      const ads = await adService.getAds(params);
      setAllAds(ads);
      setPage(1);
    } catch (error) {
      console.error('Error searching ads:', error);
      setError('Failed to search ads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    setPage(1);
    handleSearchWithBackend();
  };

  const handleReset = () => {
    setFilters({
      search: '',
      location: '',
      date_lost_from: '',
      date_lost_to: '',
      animal_type: [],
      is_active: true,
    });
    setPage(1);
    loadAllAds();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 600,
            background: textGradient,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Find Lost Pets
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Search through our database to help reunite lost pets with their
          families
        </Typography>
      </Box>

      <Card sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search by title or breed"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Enter keywords..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              placeholder="City, district..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Animal Type</InputLabel>
              <Select
                multiple
                value={filters.animal_type}
                onChange={(e) =>
                  handleFilterChange('animal_type', e.target.value)
                }
                input={<OutlinedInput label="Animal Type" />}
                renderValue={(selected) =>
                  selected
                    .map((id) => {
                      const type = animalTypes.find((t) => t.id === id);
                      return type ? type.name : '';
                    })
                    .join(', ')
                }
              >
                {animalTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    <Checkbox
                      checked={filters.animal_type.indexOf(type.id) > -1}
                    />
                    <ListItemText primary={type.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Lost from date"
              type="date"
              value={filters.date_lost_from}
              onChange={(e) =>
                handleFilterChange('date_lost_from', e.target.value)
              }
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Lost to date"
              type="date"
              value={filters.date_lost_to}
              onChange={(e) =>
                handleFilterChange('date_lost_to', e.target.value)
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.is_active}
                  onChange={(e) =>
                    handleFilterChange('is_active', e.target.checked)
                  }
                  color="primary"
                />
              }
              label="Active only"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Search />}
              onClick={handleSearch}
              sx={{ height: '56px' }}
            >
              Search
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleReset}
              sx={{ height: '56px' }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              {displayedAds.length}{' '}
              {displayedAds.length === 1 ? 'result' : 'results'} found
              {allAds.length !== displayedAds.length &&
                ` (from ${allAds.length} total)`}
            </Typography>
          </Box>

          {displayedAds.length === 0 ? (
            <Card sx={{ p: 8, textAlign: 'center' }}>
              <Pets sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No pets found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Try adjusting your search criteria or browse all active listings
              </Typography>
              <Button variant="contained" onClick={handleReset}>
                Show all pets
              </Button>
            </Card>
          ) : (
            <>
              <Grid container spacing={3}>
                {displayedAds.map((ad) => (
                  <Grid item xs={12} sm={6} md={4} key={ad.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 6,
                        },
                      }}
                    >
                      {/* Photo */}
                      {ad.photos?.[0] ? (
                        <CardMedia
                          component="img"
                          height="200"
                          image={ad.photos[0].image}
                          alt={ad.title}
                          sx={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: 200,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'grey.100',
                          }}
                        >
                          <Pets sx={{ fontSize: 64, color: 'grey.400' }} />
                        </Box>
                      )}

                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ mb: 2 }}>
                          <Chip
                            label={ad.is_active ? 'Active' : 'Inactive'}
                            color={ad.is_active ? 'success' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </Box>

                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{ fontWeight: 600 }}
                        >
                          {ad.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          <Box component="span" sx={{ fontWeight: 600 }}>
                            {ad.animal_type.name}
                          </Box>
                          {ad.breed && ` • ${ad.breed}`}
                        </Typography>

                        <Box
                          sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                        >
                          <LocationOn
                            sx={{
                              fontSize: 16,
                              mr: 0.5,
                              color: 'text.secondary',
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {ad.location}
                          </Typography>
                        </Box>

                        <Typography variant="caption" color="text.secondary">
                          Lost: {formatDate(ad.date_lost)}
                        </Typography>
                      </CardContent>

                      {/* Action Button */}
                      <Box sx={{ p: 2 }}>
                        <Button
                          component={Link}
                          to={`/ads/${ad.id}`}
                          variant="outlined"
                          fullWidth
                        >
                          View Details
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default SearchPage;
