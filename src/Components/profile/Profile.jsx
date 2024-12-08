import React, {useCallback, useEffect, useState } from 'react';
import './Profile.css';
import { FaUserCircle, FaEdit } from 'react-icons/fa';
import { useAuth } from '../contexts/authContext/context';
import TopBar from '../header/topbar';
import { db } from '../firebase/firebase';
import { collection, getDocs} from 'firebase/firestore';

const Profile = () => {
  const { currentUser } = useAuth();
  const [recipes, setRecipes] = useState([]);

   // Fetch user's searched recipes
  const fetchUserSearchedRecipes = useCallback(async (userId) => {
    if(!currentUser) return;

    try {
      const recipesRef = collection(db, "users", userId, "recipes");
      const querySnapshot = await getDocs(recipesRef);

      // map querySnapshot into a usable array
      const fetchedRecipes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error("Error fetching user recipes: ", error);
    }
  }, [currentUser]);

  // Load recipes on component mount or when currentUser changes
  useEffect(() => {
    if(currentUser) {
      fetchUserSearchedRecipes(currentUser.uid);
    }
  }, [currentUser, fetchUserSearchedRecipes]);

   // Handle the loading state
  if(!currentUser) {
    return <div>Loading...</div>;
  }

  // edit button functionality


  return (
    <div>
      <TopBar /> {/* Include TopBar */}
      <div className="profile-container">
        <div className="profile-header">
          <FaUserCircle className="profile-icon" />
          <h1>{currentUser.displayName || 'Your'} Profile</h1>
          <button className='edit-button'><FaEdit />Edit Profile</button>
        </div>
        <div className="profile-details">
        {currentUser.email && (
          <>
          <p><strong>Email:</strong> {currentUser.email}</p>
          <p>
              {/* have user's username to be the name before @  in the*/}
              <strong>Username:</strong> {currentUser.email.split('@')[0]}
          </p>
          </>
          )}

          {/* List of Recipes here */}
          <div className="profile-recipes">
            <h2>Your Searched Recipes</h2>
            <ul>
              {recipes && recipes.length === 0 && <li>No recipes found</li>}
              
              {recipes.map((recipe) => (
              <li key={recipe.id}>
                {recipe.recipe} -{" "}{new Date(recipe.timestamp.seconds * 1000).toLocaleString('en-US', {
                  hour: '2-digit', 
                  minute: '2-digit',
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric'
                })}

              </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;