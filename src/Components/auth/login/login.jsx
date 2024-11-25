import React, { useState, useEffect } from 'react'
import './login.css'
import { FaEnvelope, FaLock } from 'react-icons/fa'
import { doSignInWithEmailAndPassword } from '../../firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext/context';

const LoginForm = () => {

  const { userLoggedIn } = useAuth();
      console.log('useAuh Value;', useAuth());

  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
      const savedUsername = localStorage.getItem('rememberedUsername');
      if (savedUsername) {
        setEmail(savedUsername);
        setRememberMe(true);
      }
    }, []);

    useEffect(() => {
      if (rememberMe) {
        localStorage.setItem('rememberedUsername', email);
      } else {
        localStorage.removeItem('rememberedUsername');
      }
    }, [rememberMe, email]);

    useEffect(() => {
      if (userLoggedIn) {
        navigate('/home', { replace: true });
      }
    }, [userLoggedIn, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault()
    if(isSigningIn){
      setError('You are already signing in')
      return
    }

      setIsSigningIn(true)
      setError('')

      try {
            await doSignInWithEmailAndPassword(email, password)
            } catch (error) {
            setError(error.message || 'Failed to log in')
            setIsSigningIn(false)
            }
      }


  return (
    <div className='wrapper'>
      <form onSubmit={onSubmit}>
        <h1>Login</h1>
        <div className="input-box">
          <input 
          type="text" 
          placeholder='Email' 
          value = {email}
          onChange = {(e) => setEmail(e.target.value)}
          required
            aria-label="email"
          /> 
          <FaEnvelope className='icon'/> 
        </div>
        <div className="input-box">
          <input type="password" 
          placeholder='Password' 
          value = {password}
          onChange = {(e) => setPassword(e.target.value)}
          required
          aria-label="password"
          />
          <FaLock className='icon'/>
        </div>

        <div className="remember-forgot">
          <label>
            <input 
            type="checkbox" 
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            /> Remember me
            </label>
          <a href="#">Forgot password?</a>
        </div>

        {error && <p className='error'>{error}</p>}

        <button type="submit" disabled={isSigningIn}>
              {isSigningIn ? 'Logging In...' : 'Login'}
            </button>

        <div className="register-link">
          <p>Don't have an account? <a href="/register">Register</a></p>
        </div>
      </form>
      </div>
  )
}

export default LoginForm;