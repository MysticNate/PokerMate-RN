import { MD3DarkTheme as DefaultTheme } from 'react-native-paper';

export const customTheme = {
  ...DefaultTheme, // Start with the default dark theme settings
  roundness: 10,   // Make components like Buttons and Cards more rounded
  colors: {
    ...DefaultTheme.colors, // Inherit the default dark theme colors
    
    // ---- OVERRIDE COLORS HERE ----
    primary: '#00A3FF',       // A vibrant blue for primary actions (buttons, etc.)
    background: '#1c1c1e',   // The main background color - not pure black
    surface: '#2c2c2e',      // The color of card-like surfaces (like TextInput and Card)
    text: '#FFFFFF',          // Default text color for <Text> components
    placeholder: '#a9a9a9',   // Color for placeholder text in inputs
  },
};