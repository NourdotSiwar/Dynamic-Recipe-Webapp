import React from 'react';
import './Profile.css';
import { FaUserCircle, FaEdit } from 'react-icons/fa';
import { useAuth } from '../contexts/authContext/context';
import TopBar from '../header/topbar';

const Profile = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <div>Loading...</div>; // Optional: Handle loading state
  }

  return (
    <div>
      <TopBar /> {/* Include TopBar */}
      <div className="profile-container">
        <div className="profile-header">
          <FaUserCircle className="profile-icon" />
          <h1>{currentUser.displayName || 'Your'} Profile</h1>
        </div>
        <div className="profile-details">
          <p>
            <strong>Email:</strong> {currentUser.email}
          </p>
          {currentUser.displayName && (
            <p>
              <strong>Display Name:</strong> {currentUser.displayName}
            </p>
          )}
          {/* Add more user details as needed */}
        </div>
      </div>
    </div>
  );
};

export default Profile;