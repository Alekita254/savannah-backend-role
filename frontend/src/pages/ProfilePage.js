import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Grid,
  Divider
} from '@mui/material';
import { Person, CameraAlt, Save } from '@mui/icons-material';
import { fetchProfile, saveProfile } from '../services/apiService';

const ProfilePage = () => {
  const { userInfo } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    profile_picture: null,
    previewImage: null
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!userInfo?.access_token) {
      navigate('/login');
    } else {
      loadProfileData();
    }
  }, [userInfo, navigate]);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Use username from context/localStorage
      setProfileData(prev => ({
        ...prev,
        username: userInfo.username || ''
      }));

      // Fetch extra profile data from backend
      const data = await fetchProfile(userInfo.access_token);

      setProfileData(prev => ({
        ...prev,
        email: data?.email ?? prev.email,
        first_name: data?.first_name ?? prev.first_name,
        last_name: data?.last_name ?? prev.last_name,
        phone: data?.phone ?? prev.phone,
        address: data?.address ?? prev.address,
        previewImage: data?.profile_picture ?? prev.previewImage
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData(prev => ({
        ...prev,
        profile_picture: file,
        previewImage: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await saveProfile(userInfo.access_token, profileData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(false);
  };

  if (loading && !profileData.username) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <ProfileForm 
        profileData={profileData}
        loading={loading}
        onInputChange={handleInputChange}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
      />
      
      <Notification 
        success={success}
        error={error}
        onClose={handleCloseSnackbar}
      />
    </Container>
  );
};

const ProfileForm = ({ profileData, loading, onInputChange, onFileChange, onSubmit }) => (
  <Paper elevation={3} sx={{ p: 4 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
      <Typography variant="h4" component="h1">
        <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
        {profileData.first_name ? 'Update Profile' : 'Create Profile'}
      </Typography>
    </Box>

    <Divider sx={{ mb: 4 }} />

    <form onSubmit={onSubmit}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <ProfilePicture 
            previewImage={profileData.previewImage}
            onFileChange={onFileChange}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <ProfileFields 
            profileData={profileData}
            onInputChange={onInputChange}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <SubmitButton loading={loading} />
          </Box>
        </Grid>
      </Grid>
    </form>
  </Paper>
);

const ProfilePicture = ({ previewImage, onFileChange }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <Avatar
      src={previewImage || '/default-avatar.png'}
      sx={{ width: 150, height: 150, mb: 2 }}
    />
    <input
      accept="image/*"
      id="profile-picture-upload"
      type="file"
      style={{ display: 'none' }}
      onChange={onFileChange}
    />
    <label htmlFor="profile-picture-upload">
      <Button
        variant="outlined"
        component="span"
        startIcon={<CameraAlt />}
        sx={{ mb: 2 }}
      >
        Change Photo
      </Button>
    </label>
    <Typography variant="caption" color="textSecondary">
      JPG, GIF or PNG. Max size 2MB
    </Typography>
  </Box>
);

const ProfileFields = ({ profileData, onInputChange }) => (
  <>
    <TextField
      fullWidth
      label="Username"
      name="username"
      value={profileData.username}
      margin="normal"
      disabled
      InputProps={{ style: { backgroundColor: '#f5f5f5' } }}
    />

    <TextField
      fullWidth
      label="Email"
      name="email"
      value={profileData.email}
      margin="normal"
      disabled
      InputProps={{ style: { backgroundColor: '#f5f5f5' } }}
    />

    <TextField
      fullWidth
      label="First Name"
      name="first_name"
      value={profileData.first_name}
      onChange={onInputChange}
      margin="normal"
      required
    />

    <TextField
      fullWidth
      label="Last Name"
      name="last_name"
      value={profileData.last_name}
      onChange={onInputChange}
      margin="normal"
      required
    />

    <TextField
      fullWidth
      label="Phone Number"
      name="phone"
      value={profileData.phone}
      onChange={onInputChange}
      margin="normal"
    />

    <TextField
      fullWidth
      label="Address"
      name="address"
      value={profileData.address}
      onChange={onInputChange}
      margin="normal"
      multiline
      rows={2}
    />
  </>
);

const SubmitButton = ({ loading }) => (
  <Button
    type="submit"
    variant="contained"
    color="primary"
    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
    disabled={loading}
    sx={{ minWidth: 120 }}
  >
    {loading ? 'Saving...' : 'Save Profile'}
  </Button>
);

const Notification = ({ success, error, onClose }) => (
  <>
    <Snackbar
      open={success}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity="success" sx={{ width: '100%' }}>
        Profile saved successfully!
      </Alert>
    </Snackbar>

    <Snackbar
      open={!!error}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity="error" sx={{ width: '100%' }}>
        {error}
      </Alert>
    </Snackbar>
  </>
);

export default ProfilePage;
