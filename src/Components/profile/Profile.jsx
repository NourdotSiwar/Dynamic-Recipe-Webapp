import React, { useCallback, useEffect, useState } from 'react';
import './Profile.css';
import { FaUserCircle, FaEdit, FaTrash,  FaStar, FaRegStar } from 'react-icons/fa';
import { useAuth } from '../contexts/authContext/context';
import TopBar from '../header/topbar';
import { db, auth } from '../firebase/firebase';
import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { doUpdateUserProfile } from '../firebase/auth'; // Import the new helper function
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search'; // Import SearchIcon from @mui/icons-material


const Profile = () => {
  const { currentUser } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [photoURL, setPhotoURL] = useState('');

  const [editRecipeOpen, setEditRecipeOpen] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  // use some because this field is stored as array of strings
    recipe.ingredients?.some((ingredient) =>
      ingredient.toLowerCase().includes(searchQuery.toLowerCase())
    ) ||
    recipe.instructions?.some((ingredient) =>
      ingredient.toLowerCase().includes(searchQuery.toLowerCase())
    ) ||
        // use includes because these fields are string type
    recipe.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  

  // Allow user to search their searched recipes
  const fetchUserSearchedRecipes = useCallback(async (userId) => {
    if (!currentUser) return;
    try {
      const recipesRef = collection(db, "users", userId, "recipes");
      const querySnapshot = await getDocs(recipesRef);
      const fetchedRecipes = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error("Error fetching user recipes: ", error);
    }
  }, [currentUser]);

    // Making sure user is valid and displaying their correct infomraiton
    useEffect(() => {
      if (currentUser) {
        fetchUserSearchedRecipes(currentUser.uid);
        setUsername(currentUser.displayName || '');
        setPhotoURL(currentUser.photoURL || '');
      }
    }, [currentUser, fetchUserSearchedRecipes]);  

    const handleEditRecipeClick = (recipe) => {
      setCurrentRecipe(recipe);
      setEditRecipeOpen(true);
    };

  const handleDeleteRecipe = async (recipeId) => {
    if (!currentUser) return;
    const userId = currentUser.uid;

    try {
      await deleteDoc(doc(db, "users", userId, "recipes", recipeId));
      setRecipes((prevRecipes) => prevRecipes.filter((r) => r.id !== recipeId));
    } catch (error) {
      console.error("Error deleting recipe: ", error);
    }
  };

  const handleToggleFavorite = async (recipeId) => {
    if (!currentUser) return;
    const userId = currentUser.uid;
    const recipeRef = doc(db, "users", userId, "recipes", recipeId);

    try {
      const recipe = recipes.find((r) => r.id === recipeId);
      if (recipe) {
        // Toggle favorite status
        const updatedRecipe = { ...recipe, isFavorite: !recipe.isFavorite };
        await setDoc(recipeRef, updatedRecipe, { merge: true });

        // Update local state
        setRecipes((prevRecipes) => {
          const newRecipes = prevRecipes.map((r) =>
            r.id === recipeId ? updatedRecipe : r
          );
          // Sort by favorite status: favorites at the top
          return newRecipes.sort((a, b) => (b.isFavorite ? 1 : -1));
        });
      }
    } catch (error) {
      console.error("Error updating favorite status: ", error);
    }
  };
  

  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => (
      <span
        key={index}
        style={{
          color: part.toLowerCase() === query.toLowerCase() ? '#FF5722' : 'inherit',
        }}
      >
        {part}
      </span>
    ));
  };
  

  const handleEditProfileClick = () => {
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
  };

  const handleSaveProfile = async () => {
    try {
      const displayName = username.trim() || '';
      const imageURL = photoURL.trim() || '';

      // Update auth profile
      await doUpdateUserProfile(displayName, imageURL);

      // Update Firestore user document (optional)
      const userId = auth.currentUser.uid;
      const userDocRef = doc(db, "users", userId);
      await setDoc(userDocRef, {
        displayName: displayName,
        photoURL: imageURL
      }, { merge: true });

      // Update local state so UI updates immediately
      setUsername(displayName);
      setPhotoURL(imageURL);

    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setEditOpen(false);
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // This function is mainly used when recipe's note section or title has been edited
  const handleSaveRecipe = async () => {
    if (!currentUser || !currentRecipe) return;
    
    const userId = currentUser.uid;
    const recipeRef = doc(db, "users", userId, "recipes", currentRecipe.id);
  
    try {
      await setDoc(recipeRef, { ...currentRecipe }, { merge: true });
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe.id === currentRecipe.id ? currentRecipe : recipe
        )
      );
      setEditRecipeOpen(false);
    } catch (error) {
      console.error("Error updating recipe:", error);
    }
  };
  

  return (
    <div>
      <TopBar />
      <Box 
        className="profile-container"
        sx={{
          marginTop: '80px',
          padding: '20px',
          maxWidth: '800px',
          marginLeft: 'auto',
          marginRight: 'auto',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
        }}
      >
        <Box className="profile-header" sx={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          {currentUser.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt="Profile"
              style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginRight: '20px' }}
            />
          ) : (
            <FaUserCircle style={{ fontSize: '60px', color: '#555', marginRight: '20px' }} />
          )}
          <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            {currentUser.displayName || currentUser.email.split('@')[0]}'s Profile
          </Typography>
          <Button variant="contained" color="success" startIcon={<FaEdit />} onClick={handleEditProfileClick}>
            Edit Profile
          </Button>
        </Box>
        
        {currentUser.email && (
          <>
            <Typography variant="body1" sx={{ fontSize: '18px', marginBottom: '10px' }}>
              <strong>Email:</strong> {currentUser.email}
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '18px', marginBottom: '20px' }}>
              <strong>Username:</strong> {currentUser.displayName || currentUser.email.split('@')[0]}
            </Typography>
          </>
        )}

        <Typography variant="h5" sx={{ marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>
          Your Searched Recipes
        </Typography>

          <TextField
          label="Search Recipes"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            marginBottom: '20px',
            borderRadius: '8px', // Add rounded corners
            backgroundColor: '#f9f9f9', // Light background color
          }}
          placeholder="Search by recipe title, ingredient, instruction, or note..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

      {filteredRecipes.length === 0 && (
        <Typography variant="body1" align="center">
          No recipes match your search criteria.
        </Typography>
      )}

        {filteredRecipes.map((recipe) => (
          <Paper key={recipe.id} sx={{ padding: '20px', marginBottom: '20px', position: 'relative' }} elevation={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
      {highlightText(recipe.title, searchQuery)}
      </Typography>
          <Box>
          <IconButton color="primary" onClick={() => handleToggleFavorite(recipe.id)}>
                  {recipe.isFavorite ? <FaStar /> : <FaRegStar />}
            </IconButton>
            <IconButton color="primary" onClick={() => handleEditRecipeClick(recipe)}>
              <FaEdit />
            </IconButton>
            <IconButton color="error" onClick={() => handleDeleteRecipe(recipe.id)}>
              <FaTrash />
            </IconButton>
          </Box>
        </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
              Ingredients:
            </Typography>
            <ul style={{ marginTop: 0, marginBottom: '16px', paddingLeft: '20px' }}>
              {recipe.ingredients && recipe.ingredients.map((ing, i) => (
                <span key={i}>
                <li key={i} style={{ marginBottom: '4px' }}>{highlightText(ing, searchQuery)}{i < recipe.ingredients.length - 1 && ', '}</li>
                </span>
              ))}
            </ul>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
              Instructions:
            </Typography>
            <ol style={{ marginTop: 0, marginBottom: '16px', paddingLeft: '20px' }}>
              {recipe.instructions && recipe.instructions.map((step, i) => (
                <li key={i} style={{ marginBottom: '8px' }}>{highlightText(step, searchQuery)}</li>
              ))}
            </ol>

            {recipe.notes && recipe.notes.trim() !== '' && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
                  Notes:
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: '16px' }}>
                {recipe.notes.split('\n').map((line, index) => (
                <span key={index}>
                 {highlightText(line, searchQuery)}
                <br />
                </span>
                ))}
                </Typography>

              </>
            )}

            {recipe.timestamp && (
              <Typography variant="body2" sx={{ color: '#888' }}>
                <em>
                  Added on:{" "}
                  {new Date(recipe.timestamp.seconds * 1000).toLocaleString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </em>
              </Typography>
            )}
          </Paper>
        ))}

        {/* Edit Profile Dialog */}
        <Dialog open={editOpen} onClose={handleCloseEdit}>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '400px', marginTop: '16px' }}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              label="Profile Picture URL"
              variant="outlined"
              fullWidth
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              helperText="Enter an image URL for your profile picture"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEdit} color="inherit">Cancel</Button>
            <Button onClick={handleSaveProfile} variant="contained" color="primary">Save</Button>
          </DialogActions>
        </Dialog>
      </Box>

      <Dialog open={editRecipeOpen} onClose={() => setEditRecipeOpen(false)}>
      <DialogTitle>Edit Recipe</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '600px', marginTop: '16px' }}>
        <TextField
          label="Recipe Title"
          variant="outlined"
          fullWidth
          value={currentRecipe?.title || ''}
          onChange={(e) => setCurrentRecipe({ ...currentRecipe, title: e.target.value })}
        />
        <TextField
          label="Ingredients (comma-separated)"
          variant="outlined"
          fullWidth
          value={currentRecipe?.ingredients?.join(', ') || ''}
          onChange={(e) =>
            setCurrentRecipe({
              ...currentRecipe,
              ingredients: e.target.value.split(',').map((ing) => ing.trim()),
            })
          }
        />
        <TextField
          label="Instructions (one per line)"
          variant="outlined"
          multiline
          rows={5}
          fullWidth
          value={currentRecipe?.instructions?.join('\n') || ''}
          onChange={(e) =>
            setCurrentRecipe({
              ...currentRecipe,
              instructions: e.target.value.split('\n').map((step) => step.trim()),
            })
          }
        />
        <TextField
          label="Notes"
          variant="outlined"
          multiline
          rows={5}
          fullWidth
          value={currentRecipe?.notes || ''}
          onChange={(e) => setCurrentRecipe({ ...currentRecipe, notes: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditRecipeOpen(false)} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSaveRecipe} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
    </div>
  );
}

export default Profile;