import React, { useEffect, useState, useContext } from 'react';
import { auth } from '../../firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const AuthContext = React.createContext();

// This function is used to receive the current user in other files
export function useAuth(){
      return useContext(AuthContext);
}

// A firebase function to facilitate authentication
export function AuthProvider({children}){
      const [currentUser, setCurrentUser] = useState(null);
      const [userLoggedIn, setUserLoggedIn] = useState(false);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log('Auth state changed', user);
            if(user){
                  setCurrentUser(user);
                  setUserLoggedIn(true);
            } else {
                  setCurrentUser(null);
                  setUserLoggedIn(false);
            }
            setLoading(false);
      });

      return unsubscribe;
      }, []);

      const logout = async () => {
            try {
                  await signOut(auth);
            } catch (error) {
                  console.log(error);
            }
      };


      const value = {
            currentUser,
            userLoggedIn,
            loading,
            logout
      }

      console.log('AuthProvider Value: ', value);

      return (
            <AuthContext.Provider value={value}>
                  {!loading && children}
            </AuthContext.Provider>
      )
}