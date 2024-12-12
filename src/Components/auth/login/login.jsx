import React, { useState, useEffect } from 'react'
import { Box, Typography, TextField, Button, FormControlLabel, Checkbox, Link } from '@mui/material';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { doSignInWithEmailAndPassword } from '../../firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext/context';
import '../auth.css';

const LoginForm = () => {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Controlled inputs and error state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Restore remembered email if present
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      setEmail(savedUsername);
      setRememberMe(true);
    }
  }, []);

  // Persist or remove remembered email based on checkbox
  useEffect(() => {
    if (rememberMe) {
      localStorage.setItem('rememberedUsername', email);
    } else {
      localStorage.removeItem('rememberedUsername');
    }
  }, [rememberMe, email]);

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (userLoggedIn) {
      navigate('/home', { replace: true });
    }
  }, [userLoggedIn, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isSigningIn) {
      setError('You are already signing in');
      return;
    }

    setIsSigningIn(true);
    setError('');

    try {
      await doSignInWithEmailAndPassword(email, password);
    } catch (error) {
      setError(error.message || 'Failed to log in');
      setIsSigningIn(false);
    }
  };

  return (
    <div className="auth-background">
      <div className="auth-card">
        <Typography variant="h4" className="auth-title" gutterBottom>
          Welcome Back
        </Typography>
        <Typography variant="body1" className="auth-subtitle">
          Log in to continue exploring delicious recipes.
        </Typography>
        <form onSubmit={onSubmit}>
          {/* Email input */}
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
          {/* Password input */}
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

          {/* Remember me and forgot password link */}
          <div className="auth-remember">
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{ color: '#78C850' }}
                />
              }
              label="Remember me"
            />
            <Link href="#" sx={{ color: '#2ECC71', fontSize: '0.9rem' }}>
              Forgot password?
            </Link>
          </div>

          {/* Display any error messages */}
          {error && <Typography variant="body2" className="auth-error">{error}</Typography>}

          {/* Login button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSigningIn}
            className="auth-button"
          >
            {isSigningIn ? 'Logging In...' : 'Login'}
          </Button>

          {/* Redirect to register if no account */}
          <Typography variant="body2" align="center">
            Don't have an account?{' '}
            <a href="/register" className="auth-link">
              Register
            </a>
          </Typography>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;