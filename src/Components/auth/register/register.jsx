import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import { doCreateUserWithEmailAndPassword } from '../../firebase/auth'; 
import { useNavigate } from 'react-router-dom';
import '../auth.css';

const RegisterForm = () => {
  const navigate = useNavigate();

  // Controlled inputs and state for registering
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Ensure passwords match before attempting registration
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsRegistering(true);

    try {
      // Create a new user account and then navigate to home
      await doCreateUserWithEmailAndPassword(email, password);
      navigate('/home');
    } catch (error) {
      setError(error.message || 'Failed to create an account');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="auth-background">
      <div className="auth-card">
        {/* Page title and subtitle */}
        <Typography variant="h4" className="auth-title" gutterBottom>
          Create Account
        </Typography>
        <Typography variant="body1" className="auth-subtitle">
          Join us and start exploring personalized recipes.
        </Typography>

        <form onSubmit={onSubmit}>
          {/* Email input field */}
          <div className="auth-field">
            <TextField
              fullWidth
              variant="outlined"
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, color: '#555', display: 'flex', alignItems: 'center' }}>
                    <FaEnvelope />
                  </Box>
                )
              }}
            />
          </div>
          {/* Password input field */}
          <div className="auth-field">
            <TextField
              fullWidth
              variant="outlined"
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, color: '#555', display: 'flex', alignItems: 'center' }}>
                    <FaLock />
                  </Box>
                )
              }}
            />
          </div>
          {/* Confirm password input field */}
          <div className="auth-field">
            <TextField
              fullWidth
              variant="outlined"
              label="Confirm Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, color: '#555', display: 'flex', alignItems: 'center' }}>
                    <FaLock />
                  </Box>
                )
              }}
            />
          </div>

          {/* Display any error messages during registration */}
          {error && <Typography variant="body2" className="auth-error">{error}</Typography>}

          {/* Registration submit button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isRegistering}
            className="auth-button"
          >
            {isRegistering ? 'Registering...' : 'Register'}
          </Button>

          {/* Link to go back to login if user already has an account */}
          <Typography variant="body2" align="center">
            Already have an account?{' '}
            <a href="/" className="auth-link">
              Login
            </a>
          </Typography>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;