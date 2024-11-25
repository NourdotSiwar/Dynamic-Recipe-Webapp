import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/authContext/context';
import './topbar.css';

const TopBar = () => {
      const { logout} = useAuth();
      const navigate = useNavigate();

      const handleLogout = async () => {
            try {
                  await logout();
                  navigate('/');
            } catch (error) {
                  console.log(error);
            }
      }

      return (
            <div className="top-bar">
              <div className="brand">
                <h2>Dynamic Recipe App</h2> {/* Customize with your app's name */}
              </div>
              <div className="logout">
                <button onClick={handleLogout}>
                  <FaSignOutAlt className="logout-icon" />
                  Logout
                </button>
              </div>
            </div>
          );
        };
        
      export default TopBar;