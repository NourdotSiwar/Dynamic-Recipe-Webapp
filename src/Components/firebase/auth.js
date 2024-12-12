import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "./firebase";

export const doCreateUserWithEmailAndPassword = async (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
}

export const doSignInWithEmailAndPassword = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
}

export const doSignOut = () => {
  return auth.signOut();
}

// Function to update the user's displayName and photoURL
export const doUpdateUserProfile = async (displayName, photoURL) => {
  if (!auth.currentUser) return;
  return updateProfile(auth.currentUser, {
    displayName: displayName || null,
    photoURL: photoURL || null
  });
}