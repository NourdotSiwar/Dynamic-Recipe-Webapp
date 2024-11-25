import React, { useState } from 'react';
import './register.css';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import { doCreateUserWithEmailAndPassword } from '../../firebase/auth'; // Import your registration function
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
      const navigate = useNavigate();

      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [error, setError] = useState('');
      const [isRegistering, setIsRegistering] = useState(false);

      const onSubmit = async (e) => {
            e.preventDefault();
            setError('');

            if(password !== confirmPassword){
                  setError('Passwords do not match');
                  return;
            }

            setIsRegistering(true);

            try {
                  await doCreateUserWithEmailAndPassword(email, password);
                  navigate('/home');
            } catch (error) {
                  setError(error.message || 'Failed to create an account');
            } finally {
                  setIsRegistering(false);
            }
      }

      return (
            <div className="wrapper">
            <form onSubmit={onSubmit}>
              <h1>Register</h1>
      
              <div className="input-box">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="email"
                />
                <FaEnvelope className="icon" />
              </div>
      
              <div className="input-box">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-label="password"
                />
                <FaLock className="icon" />
              </div>
      
              <div className="input-box">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  aria-label="confirm password"
                />
                <FaLock className="icon" />
              </div>
      
              {error && <p className="error">{error}</p>}
      
              <button type="submit" disabled={isRegistering}>
                {isRegistering ? 'Registering...' : 'Register'}
              </button>
      
              <div className="register-link">
                <p>
                  Already have an account? <a href="/">Login</a>
                </p>
              </div>
            </form>
          </div>
      )
};

export default RegisterForm;