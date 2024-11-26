import './App.css';
import LoginForm from './Components/auth/login/login';
import { AuthProvider } from './Components/contexts/authContext/context';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './Components/home/home';
import RegisterForm from './Components/auth/register/register';
import Profile from './Components/profile/Profile';
import PrivateRoute from './Components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route path="/register" element={<RegisterForm />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;