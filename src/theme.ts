import React from 'react';

// High-contrast dark palette with a warm action color (Leela dark theme)
export const colors = {
  primary: '#FF7A59', // warm coral for primary actions
  accent: '#FFD28B',  // warm amber accent
  background: '#071021', // deep navy background
  surface: '#0D1620', // elevated surface panels
  text: '#E6EEF3', // off-white text for high contrast
  muted: '#9AA6B2', // subdued gray for secondary text
};

const ThemeContext = React.createContext(colors);

export const ThemeProvider: React.FC<any> = ({ children }) => {
  return React.createElement(ThemeContext.Provider, { value: colors }, children);
};

export default ThemeContext;
