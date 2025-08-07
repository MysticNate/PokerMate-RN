import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Alert, Platform, ResponseType } from 'react-native';
import { jwtDecode } from 'jwt-decode';
import * as FileSystem from 'expo-file-system';
import { AuthRequest, makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';


const API_URL = 'http://PokerMate.somee.com/api'; // SOMEE URL
const AuthContext = createContext(null);
WebBrowser.maybeCompleteAuthSession();

// Google OAuth discovery document, used to get endpoints
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://www.googleapis.com/oauth2/v4/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({ token: null, authenticated: false, user: null });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setAuthState({ token, authenticated: true, user: null }); 
      }
      setIsLoading(false);
    };
    loadToken();
  }, []);

  
  
  const register = async (email, nickname, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nickname, password }),
      });
      if (!response.ok) {
        const errorData = await response.text();
        Alert.alert('Registration Failed', errorData);
        return;
      }
      // After successful registration, automatically log in
      await login(email, password);
    } catch (e) {
      Alert.alert('Registration Error', e.message);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      console.log("Sending login:", { email, password });
      const data = await response.json();
      if (!response.ok) {
        const text = await response.text();
        console.log("Login failed response:", text);
        Alert.alert('Login Failed', data.message || 'Invalid email/password');
        return;
      }

      // --- DECODE THE TOKEN TO GET USER INFO ---
      const decodedToken = jwtDecode(data.token);
      const user = {
        id: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        nickname: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        email: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      };
      
      setAuthState({ token: data.token, authenticated: true, user: user });
      await AsyncStorage.setItem('token', data.token);
      // Storing user object for persistence across app restarts
      await AsyncStorage.setItem('user', JSON.stringify(user));

      router.replace('/(main)/main');
    } catch (e) {
      Alert.alert('Login Error', e.message);
    }
  };

  const changeNickname = async (newNickname) => {
  try {
    console.log(`Sending request to change nickname to: ${newNickname}`);
    console.log(`Using token: Bearer ${authState.token}`); // Log the token to be sure

    const response = await fetch(`${API_URL}/profile/change-nickname`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authState.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newNickname }),
    });

    // Let's add more detailed logging here
    console.log('Received response with status:', response.status);
    
    // This is a crucial check
    if (response.status === 204) { // 204 means No Content
      console.log('Server returned 204 No Content. Update is successful.');
      // Handle success without parsing JSON
      // (The code to update local state goes here)
      return; 
    }

    const responseText = await response.text();
    console.log('Raw response text:', responseText);

    if (!response.ok) {
      throw new Error(responseText || "Failed to change nickname.");
    }
    
    // Now, we can safely parse
    const data = JSON.parse(responseText);

    // --- IMPORTANT: UPDATE THE LOCAL STATE ---
    const updatedUser = { ...authState.user, nickname: newNickname };
    setAuthState(current => ({
      ...current,
      user: updatedUser
    }));
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    Alert.alert("Success", "Nickname updated!");

  } catch (e) {
    Alert.alert('Error', e.message);
    throw e;
  }
};

  const googleSignIn = async () => {
    try {
        console.log('Starting Google Sign-In...');

        // Use different client IDs for different platforms
        let clientId;
        if (Platform.OS === 'ios') {
        clientId = '1091977169961-n6ethd47hb9uqlt5p9op5i4oif9nc1gf.apps.googleusercontent.com'; // iOS client ID
        } else {
        clientId = '1091977169961-3chhcjpsavp3jmmtndjdtfm0395p89lq.apps.googleusercontent.com'; // Web client ID
        }

        const redirectUri = makeRedirectUri({
        scheme: 'pokermate',
        // This is important for web to work correctly
        // For web, we use the Expo proxy to handle redirects
        useProxy: __DEV__,
        });

        console.log('Redirect URI:', redirectUri);
        console.log('Client ID:', clientId);

        const request = new AuthRequest({
        clientId: clientId,
        scopes: ['openid', 'profile', 'email'],
        responseType: 'id_token', 
        redirectUri: redirectUri,
        extraParams: {},
        });

        console.log('Auth request created, prompting...');

        const result = await request.promptAsync(discovery, {
        useProxy: __DEV__, 
        showInRecents: true,
        });

        console.log('Auth result:', result);

        if (result.type === 'success') {
        const { id_token } = result.params;
        
        if (!id_token) {
            Alert.alert('Error', 'No ID token received from Google');
            return;
        }

        console.log('ID token received, parsing...');

        // Decode the ID token to get user info
        const userInfo = parseJwt(id_token);
        
        console.log('Google user info:', userInfo);

        // Validate required fields
        if (!userInfo.email || !userInfo.name || !userInfo.sub) {
            Alert.alert('Error', 'Incomplete user information from Google');
            return;
        }

        // Send to backend
        const response = await fetch(`${API_URL}/auth/google-signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            idToken: id_token,
            email: userInfo.email,
            name: userInfo.name,
            googleId: userInfo.sub,
            }),
        });

        const responseText = await response.text();
        console.log('Backend response:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse backend response:', parseError);
            Alert.alert('Error', 'Invalid response from server');
            return;
        }
        
        if (!response.ok) {
            Alert.alert('Google Sign-In Failed', data.message || 'Failed to authenticate with Google');
            return;
        }

        // Same login flow as before
        const decodedToken = jwtDecode(data.token);
        const user = {
            id: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
            nickname: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
            email: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        };
        
        setAuthState({ token: data.token, authenticated: true, user: user });
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(user));

        router.replace('/(main)/main');
        
        } else if (result.type === 'cancel') {
        console.log('User cancelled Google Sign-In');
        } else {
        console.log('Google Sign-In failed:', result);
        Alert.alert('Error', 'Google Sign-In failed');
        }
        
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        Alert.alert('Google Sign-In Error', error.message);
    }
    };

    // Helper function to parse JWT token
    const parseJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT:', error);
        return {};
    }
    };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setAuthState({ token: null, authenticated: false, user: null });
    router.replace('/');
  };
  
  const uploadPfp = async (imageUri) => {
    try {
        // Convert image to Base64
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
        });

        // Prefix needed for React Native <Image> to read Base64
        const base64Uri = `data:image/jpeg;base64,${base64}`;

        // Update user in memory and in AsyncStorage
        const updatedUser = { ...authState.user, profilePictureBase64: base64Uri };

        setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        }));

        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

        Alert.alert('Success', 'Profile picture updated!');
        return base64Uri;
    } catch (error) {
        console.error('Failed to save pfp:', error);
        Alert.alert('Failed to save image', error.message);
        throw error;
    }
  };

  const value = {
    ...authState,
    isLoading,
    register,
    login,
    changeNickname,
    googleSignIn,
    logout,
    uploadPfp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}