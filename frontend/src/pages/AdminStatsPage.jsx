import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Pets,
  Person,
  Comment,
  Favorite,
  TrendingUp,
  CalendarToday,
  LocationOn,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import adService from '../services/adService';
import userService from '../services/userService';
import commentService from '../services/commentService';

const AdminStatsPage = () => {
  const { user: authUser } = useSelector((state) => state.auth);

  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authUser?.role === 'admin') {
      loadStats();
    }
  }, [authUser]);

  const loadStats = async () => {
    try {
      setLoading(true);

      const [users, ads, comments, favorites] = await Promise.all([
        userService.getUsers(),
        adService.getAds(),
        getCommentsData(),
        getFavoritesData(),
      ]);

      const statsData = calculateStats(users, ads, comments, favorites);
      setStats(statsData);

      const activity = getRecentActivity(ads, comments);
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading stats:', error);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const getCommentsData = async () => {
    try {
      const ads = await adService.getAds();
      const commentsPromises = ads
        .slice(0, 10)
        .map((ad) => commentService.getCommentsByAd(ad.id).catch(() => []));
      const commentsResults = await Promise.all(commentsPromises);
      return commentsResults.flat();
    } catch (error) {
      return [];
    }
  };

  const getFavoritesData = async () => {
    try {
      const ads = await adService.getAds();
      return ads.reduce((acc, ad) => acc + (ad.favorited_by_count || 0), 0);
    } catch (error) {
      return 0;
    }
  };

  const calculateStats = (users, ads, comments, favoritesCount) => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalUsers = users.length;
    const adminUsers = users.filter((user) => user.role === 'admin').length;
    const newUsersThisWeek = users.filter(
      (user) => new Date(user.date_joined) > lastWeek
    ).length;
    const newUsersThisMonth = users.filter(
      (user) => new Date(user.date_joined) > lastMonth
    ).length;

    const totalAds = ads.length;
    const activeAds = ads.filter((ad) => ad.is_active).length;
    const inactiveAds = totalAds - activeAds;
    const newAdsThisWeek = ads.filter(
      (ad) => new Date(ad.created_at) > lastWeek
    ).length;
    const newAdsThisMonth = ads.filter(
      (ad) => new Date(ad.created_at) > lastMonth
    ).length;

    const animalTypeStats = ads.reduce((acc, ad) => {
      const type = ad.animal_type?.name || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const locationStats = ads.reduce((acc, ad) => {
      const location = ad.location || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});

    const topLocations = Object.entries(locationStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      users: {
        total: totalUsers,
        admins: adminUsers,
        regular: totalUsers - adminUsers,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
      },
      ads: {
        total: totalAds,
        active: activeAds,
        inactive: inactiveAds,
        newThisWeek: newAdsThisWeek,
        newThisMonth: newAdsThisMonth,
      },
      engagement: {
        totalComments: comments.length,
        totalFavorites: favoritesCount,
        commentsPerAd:
          totalAds > 0 ? (comments.length / totalAds).toFixed(1) : 0,
        favoritesPerAd:
          totalAds > 0 ? (favoritesCount / totalAds).toFixed(1) : 0,
      },
      animalTypes: Object.entries(animalTypeStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      topLocations,
    };
  };

  const getRecentActivity = (ads, comments) => {
    const allActivities = [
      ...ads.map((ad) => ({
        type: 'ad',
        title: ad.title,
        user: ad.author_name || 'Unknown',
        date: ad.created_at,
        action: 'created advertisement',
      })),
      ...comments.map((comment) => ({
        type: 'comment',
        title: `Comment on ad`,
        user: comment.author || 'Unknown',
        date: comment.created_at,
        action: 'added comment',
      })),
    ];

    return allActivities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              color: `${color}.main`,
              borderRadius: 1,
              p: 1,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (authUser?.role !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          You do not have permission to access this page. Admin access required.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" sx={{ py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          Platform Statistics
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Overview of platform usage and engagement
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {stats && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Users"
                value={stats.users.total}
                icon={<Person />}
                color="primary"
                subtitle={`${stats.users.newThisWeek} new this week`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Ads"
                value={stats.ads.total}
                icon={<Pets />}
                color="success"
                subtitle={`${stats.ads.active} active`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Comments"
                value={stats.engagement.totalComments}
                icon={<Comment />}
                color="info"
                subtitle={`${stats.engagement.commentsPerAd} per ad`}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Pets />
                  Advertisement Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Active Ads
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="success.main"
                    >
                      {stats.ads.active}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Inactive Ads
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="text.secondary"
                    >
                      {stats.ads.inactive}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      New This Month
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="success.main"
                    >
                      +{stats.ads.newThisMonth}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      New This Week
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="success.main"
                    >
                      +{stats.ads.newThisWeek}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Топ типов животных */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Pets />
                  Animal Types Distribution
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Animal Type</TableCell>
                        <TableCell align="right">Count</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.animalTypes.map(([type, count]) => (
                        <TableRow key={type}>
                          <TableCell>
                            <Chip
                              label={type}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">{count}</TableCell>
                          <TableCell align="right">
                            {((count / stats.ads.total) * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Топ локаций */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <LocationOn />
                  Top Locations
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Location</TableCell>
                        <TableCell align="right">Ads Count</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.topLocations.map(([location, count]) => (
                        <TableRow key={location}>
                          <TableCell>
                            <Typography variant="body2">{location}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip label={count} size="small" color="primary" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default AdminStatsPage;
