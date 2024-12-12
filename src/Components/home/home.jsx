import React, { useState } from 'react';
import TopBar from '../header/topbar';
import {
  Box,
  Typography,
  FormControl,
  FormGroup,
  FormControlLabel,
  FormLabel,
  Checkbox,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  TextField,
  Button,
  IconButton,
  Paper,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import './home.css';
import { auth, db } from '../firebase/firebase';
import { collection, addDoc } from "firebase/firestore";

const diets = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto'];
const cuisines = [
  'Italian',
  'Chinese',
  'Mexican',
  'Indian',
  'Japanese',
];

const HomePage = () => {
  // State for various user inputs and the AI response
  const [dietPreferences, setDietPreferences] = useState([]);
  const [cuisinePreferences, setCuisinePreferences] = useState([]);
  const [availableIngredient, setAvailableIngredient] = useState('');
  const [ingredientsList, setIngredientsList] = useState([]);
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiKey = process.env.REACT_APP_GROQ_API_KEY;

  // Handle changes to selected cuisine preferences
  const handleCuisineChange = (event) => {
    const { value } = event.target;
    setCuisinePreferences(typeof value === 'string' ? value.split(',') : value);
  };

  // Add a new ingredient to the list
  const handleAddIngredient = () => {
    if (availableIngredient.trim() !== '') {
      setIngredientsList((prevList) => [...prevList, availableIngredient.trim()]);
      setAvailableIngredient('');
    }
  };

  // Remove an ingredient from the list
  const handleRemoveIngredient = (index) => {
    setIngredientsList((prevList) => prevList.filter((_, i) => i !== index));
  };

  // Submit user inputs to the AI model and handle response
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Ensure at least one preference or ingredient is provided
    if (
      ingredientsList.length === 0 &&
      dietPreferences.length === 0 &&
      cuisinePreferences.length === 0
    ) {
      setError('Please provide at least one preference or ingredient.');
      return;
    }

    // Construct the message prompt for the AI
    let messageContent = 'Please suggest a recipe based on the following:';
    if (ingredientsList.length > 0) {
      const userIngredients = ingredientsList.join(', ');
      messageContent += `\n- Ingredients I have: ${userIngredients}`;
    }
    if (dietPreferences.length > 0) {
      const userDiets = dietPreferences.join(', ');
      messageContent += `\n- Dietary preferences: ${userDiets}`;
    }
    if (cuisinePreferences.length > 0) {
      const userCuisines = cuisinePreferences.join(', ');
      messageContent += `\n- Preferred cuisines: ${userCuisines}`;
    }

    const messages = [
      {
        role: 'system',
        content: `You are a helpful assistant...` // (Prompt omitted for brevity)
      },
      { role: 'user', content: messageContent },
    ];

    try {
      setLoading(true);
      setError(null);
      setAiResponse(null);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.error?.message || 'Failed to fetch AI response';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0]?.message?.content;

      if (assistantMessage) {
        try {
          const recipeData = JSON.parse(assistantMessage);
          setAiResponse(recipeData);
          await addSearchedRecipe(recipeData);
        } catch (parseErr) {
          console.error("Error parsing JSON:", parseErr);
          setError('Failed to parse the recipe data. Please try again.');
        }
      } else {
        setError('AI did not return a valid response.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while fetching the AI response.');
    } finally {
      setLoading(false);
    }
  };

  // Store the returned recipe into Firestore
  async function addSearchedRecipe(recipeData) {
    try {
      const userId = auth.currentUser.uid;
      const recipesRef = collection(db, "users", userId, "recipes");
      await addDoc(recipesRef, {
        ...recipeData,
        timestamp: new Date()
      });
      console.log("Recipe added successfully!");
      alert("Recipe added successfully!");
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("Error adding document: ", e);
    }
  }

  return (
    <div>
      <TopBar />
      <Box
        sx={{
          marginTop: '80px',
          padding: '20px',
          maxWidth: '800px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
          Find Recipes Based on Your Preferences
        </Typography>
        <Paper elevation={2} sx={{ padding: '20px' }}>
          <form onSubmit={handleSubmit}>
            {/* Dietary Preferences */}
            <FormControl component="fieldset" fullWidth margin="normal">
              <FormLabel component="legend" sx={{ fontWeight: 'bold' }}>Dietary Preferences</FormLabel>
              <FormGroup row>
                {diets.map((diet) => (
                  <FormControlLabel
                    key={diet}
                    control={
                      <Checkbox
                        checked={dietPreferences.includes(diet)}
                        onChange={(event) => {
                          const { checked } = event.target;
                          setDietPreferences((prev) =>
                            checked ? [...prev, diet] : prev.filter((d) => d !== diet)
                          );
                        }}
                        name={diet}
                      />
                    }
                    label={diet}
                  />
                ))}
              </FormGroup>
            </FormControl>

            {/* Cuisine Preferences */}
            <FormControl fullWidth margin="normal">
              <InputLabel id="cuisine-label">Cuisine Preferences</InputLabel>
              <Select
                labelId="cuisine-label"
                multiple
                value={cuisinePreferences}
                onChange={handleCuisineChange}
                input={<OutlinedInput label="Cuisine Preferences" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => <Chip key={value} label={value} />)}
                  </Box>
                )}
              >
                {cuisines.map((cuisine) => (
                  <MenuItem key={cuisine} value={cuisine}>
                    {cuisine}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Available Ingredients */}
            <FormControl fullWidth margin="normal">
              <FormLabel sx={{ fontWeight: 'bold' }}>Available Ingredients</FormLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Enter an ingredient"
                  value={availableIngredient}
                  onChange={(e) => setAvailableIngredient(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddIngredient();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ marginLeft: '10px', height: '56px', whiteSpace: 'nowrap' }}
                  onClick={handleAddIngredient}
                >
                  Add
                </Button>
              </Box>
              {ingredientsList.length > 0 && (
                <Box sx={{ marginTop: '10px' }}>
                  {ingredientsList.map((ingredient, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                      <Typography variant="body1" sx={{ marginRight: '8px' }}>{ingredient}</Typography>
                      <IconButton size="small" onClick={() => handleRemoveIngredient(index)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </FormControl>

            <Box sx={{ textAlign: 'center', marginTop: '30px' }}>
              <Button variant="contained" color="success" size="large" type="submit" disabled={loading}>
                {loading ? 'Generating...' : 'Find Recipes'}
              </Button>
            </Box>
          </form>

          {/* Loading state */}
          {loading && (
            <Box sx={{ marginTop: '20px', textAlign: 'center' }}>
              <Typography variant="body1">Generating recipe...</Typography>
            </Box>
          )}

          {/* Error message */}
          {error && (
            <Box sx={{ marginTop: '20px' }}>
              <Typography variant="body1" color="error">
                {error}
              </Typography>
            </Box>
          )}

          {/* Display AI response recipe */}
          {aiResponse && (
            <Paper sx={{ marginTop: '30px', padding: '20px' }} elevation={1}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '10px' }}>
                {aiResponse.title}
              </Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
                Ingredients:
              </Typography>
              <ul style={{ marginTop: 0, marginBottom: '16px', paddingLeft: '20px' }}>
                {aiResponse.ingredients && aiResponse.ingredients.map((ing, i) => (
                  <li key={i} style={{ marginBottom: '4px' }}>{ing}</li>
                ))}
              </ul>

              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
                Instructions:
              </Typography>
              <ol style={{ marginTop: 0, marginBottom: '16px', paddingLeft: '20px' }}>
                {aiResponse.instructions && aiResponse.instructions.map((step, i) => (
                  <li key={i} style={{ marginBottom: '8px' }}>{step}</li>
                ))}
              </ol>

              {aiResponse.notes && aiResponse.notes.trim() !== '' && (
                <>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
                    Notes:
                  </Typography>
                  <Typography variant="body1" sx={{ marginBottom: '8px' }}>{aiResponse.notes}</Typography>
                </>
              )}
            </Paper>
          )}
        </Paper>
      </Box>
    </div>
  );
};

export default HomePage;