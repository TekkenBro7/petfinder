import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Person,
  Edit,
  Delete,
  AdminPanelSettings,
  Person as PersonIcon,
  Search,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import userService from '../services/userService';

const AdminUsersPage = () => {
  const { user: authUser } = useSelector((state) => state.auth);

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [editFormData, setEditFormData] = useState({
    username: '',
    first_name: '',
    phone: '',
    role: 'user',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    if (authUser?.role === 'admin') {
      loadUsers();
    }
  }, [authUser]);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      setUsers(response);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username?.toLowerCase().includes(term) ||
          user.first_name?.toLowerCase().includes(term) ||
          user.phone?.includes(term)
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleEditOpen = (user) => {
    setSelectedUser(user);
    setEditFormData({
      username: user.username || '',
      first_name: user.first_name || '',
      phone: user.phone || '',
      role: user.role || 'user',
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
    setEditErrors({});
  };

  const handleDeleteOpen = (user) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteModalOpen(false);
    setSelectedUser(null);
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

  const handleSaveUser = async () => {
    setEditLoading(true);
    setError('');

    try {
      await userService.updateUser(selectedUser.id, editFormData);
      setSuccess('User updated successfully!');
      setEditModalOpen(false);
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);

      if (error.response?.data) {
        const apiErrors = error.response.data;
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
        setError(`Update failed: ${errorMessages}`);
      } else {
        setError('Failed to update user');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await userService.deleteUser(selectedUser.id);
      setSuccess('User deleted successfully!');
      setDeleteModalOpen(false);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value);
    setPage(0);
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Never';
    }

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          User Management
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage platform users and their permissions
        </Typography>
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

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search users"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by username, name, phone..."
              InputProps={{
                startAdornment: (
                  <Search sx={{ color: 'text.secondary', mr: 1 }} />
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                onChange={handleRoleFilterChange}
                label="Role"
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary">
              Total: {filteredUsers.length} users
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Id</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Registration</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Typography variant="body2">{user.id}</Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {user.first_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            @{user.username}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{user.phone}</Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={user.role}
                        color={user.role === 'admin' ? 'warning' : 'default'}
                        size="small"
                        icon={
                          user.role === 'admin' ? (
                            <AdminPanelSettings />
                          ) : (
                            <Person />
                          )
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(user.date_joined)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(user.last_login)}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          gap: 1,
                        }}
                      >
                        <IconButton
                          color="primary"
                          onClick={() => handleEditOpen(user)}
                          size="small"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteOpen(user)}
                          size="small"
                          disabled={user.id === authUser.id}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Dialog
        open={editModalOpen}
        onClose={handleEditClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User: {selectedUser?.username}</DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={editFormData.username}
                onChange={(e) =>
                  handleEditInputChange('username', e.target.value)
                }
                error={!!editErrors.username}
                helperText={editErrors.username}
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
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={editFormData.phone}
                onChange={(e) => handleEditInputChange('phone', e.target.value)}
                error={!!editErrors.phone}
                helperText={editErrors.phone}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={editFormData.role}
                  onChange={(e) =>
                    handleEditInputChange('role', e.target.value)
                  }
                  label="Role"
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleEditClose} disabled={editLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={editLoading}
            startIcon={editLoading ? <CircularProgress size={16} /> : null}
          >
            {editLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteModalOpen} onClose={handleDeleteClose}>
        <DialogTitle>Confirm Delete</DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to delete user{' '}
            <strong>{selectedUser?.username}</strong>? This action cannot be
            undone.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUsersPage;
