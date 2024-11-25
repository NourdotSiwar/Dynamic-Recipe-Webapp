import React from 'react';
import TopBar from '../header/topbar';
import './home.css';

const HomePage = () => {
  return (
    <div className="home">
      <TopBar /> {/* Use TopBar component */}
      <div className="content">
        <h1>Welcome to the Home Page!</h1>
        {/* Add your home page content here */}
      </div>
    </div>
  );
};

export default HomePage;
