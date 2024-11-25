
import './App.css';
import LoginForm from './Components/auth/login/login';
import { AuthProvider } from './Components/contexts/authContext/context';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './Components/home/home';
import RegisterForm from './Components/auth/register/register';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>

        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/register" element={<RegisterForm />} />
        
        </Routes>
      </AuthProvider>
      </BrowserRouter>
  );
}

export default App;
