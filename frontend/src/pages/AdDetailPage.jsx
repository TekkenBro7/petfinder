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
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
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
  Send,
  MoreVert,
} from '@mui/icons-material';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import adService from '../services/adService';
import commentService from '../services/commentService';
import favoriteService from '../services/favoriteService';

const AdDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user: authUser } = useSelector((state) => state.auth);

  const [ad, setAd] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    if (authUser) {
      checkFavoriteStatus();
    }
  }, [authUser]);

  const checkFavoriteStatus = async () => {
    try {
      const result = await favoriteService.checkFavorite(id);
      setIsFavorited(result.is_favorited);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!authUser) {
      navigate('/login');
      return;
    }

    setFavoriteLoading(true);
    try {
      const result = await favoriteService.toggleFavorite(id);
      setIsFavorited(result.is_favorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  useEffect(() => {
    loadAd();
    loadComments();
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

  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      const commentsData = await commentService.getCommentsByAd(id);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      return;
    }

    setSubmittingComment(true);
    try {
      const comment = await commentService.createComment(id, newComment.trim());
      setComments((prev) => [comment, ...prev]);
      setNewComment('');
      setSuccess('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      setSuccess('Comment deleted successfully!');
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
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
            <Box mt={2}>
              <Button
                variant={isFavorited ? 'contained' : 'outlined'}
                color="warning"
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                startIcon={isFavorited ? <Favorite /> : <FavoriteBorder />}
              >
                {isFavorited ? 'In Favorites' : 'Add to Favorites'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Comments ({comments.length})
        </Typography>

        {authUser && (
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                endIcon={<Send />}
                onClick={handleAddComment}
                disabled={!newComment.trim() || submittingComment}
              >
                {submittingComment ? (
                  <CircularProgress size={24} />
                ) : (
                  'Add Comment'
                )}
              </Button>
            </Box>
          </Box>
        )}

        <Divider sx={{ mb: 3 }} />

        {commentsLoading ? (
          <Box display="flex" justifyContent="center" sx={{ py: 4 }}>
            <CircularProgress />
          </Box>
        ) : comments.length === 0 ? (
          <Box textAlign="center" sx={{ py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No comments yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Be the first to comment on this advertisement
            </Typography>
          </Box>
        ) : (
          <List>
            {comments.map((comment) => (
              <ListItem key={comment.id} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>
                    <Person />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" component="span">
                        {comment.author}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(comment.created_at)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="body1"
                      sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
                    >
                      {comment.text}
                    </Typography>
                  }
                />
                {(comment.author_id === authUser?.id || isOwner) && (
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleDeleteComment(comment.id)}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
        )}
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
