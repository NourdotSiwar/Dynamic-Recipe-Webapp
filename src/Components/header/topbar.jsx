import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSignOutAlt, FaUser, FaBookOpen } from 'react-icons/fa';
import { useAuth } from '../contexts/authContext/context';
import './topbar.css';

const TopBar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="top-bar">
      <div className="top-bar-content">
        <div className="left-section">
          <Link to="/home" className="app-title">
            <FaBookOpen className="app-icon" />
            Dynamic Recipe App
          </Link>
          <Link to="/profile" className="nav-link">
            <FaUser className="nav-icon" />
            Profile
          </Link>
        </div>
        <div className="logout">
          <button onClick={handleLogout}>
            <FaSignOutAlt className="logout-icon" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;