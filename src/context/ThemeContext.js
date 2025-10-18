import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [themeColor, setThemeColor] = useState('#bb69f2');
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        loadThemeSettings();
        loadUserData();
    }, []);

    const loadThemeSettings = async () => {
        try {
            const settings = await AsyncStorage.getItem('appSettings');
            if (settings) {
                const parsedSettings = JSON.parse(settings);
                setIsDarkMode(parsedSettings.darkMode || false);
                setThemeColor(parsedSettings.themeColor || '#bb69f2');
            }
        } catch (error) {
            console.error('Error loading theme settings:', error);
        }
    };

    const loadUserData = async () => {
        try {
            const userDataString = await AsyncStorage.getItem('userData');
            if (userDataString) {
                setUserData(JSON.parse(userDataString));
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const updateUserData = async (newUserData) => {
        try {
            const updatedData = { ...userData, ...newUserData };
            setUserData(updatedData);
            await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    };

    const toggleDarkMode = async (value) => {
        setIsDarkMode(value);
        await saveThemeSettings({ darkMode: value });
    };

    const changeThemeColor = async (color) => {
        setThemeColor(color);
        await saveThemeSettings({ themeColor: color });
    };

    const saveThemeSettings = async (newSettings = {}) => {
        try {
            const currentSettings = await AsyncStorage.getItem('appSettings');
            const settings = currentSettings ? JSON.parse(currentSettings) : {};
            const updatedSettings = { ...settings, ...newSettings };
            await AsyncStorage.setItem('appSettings', JSON.stringify(updatedSettings));
        } catch (error) {
            console.error('Error saving theme settings:', error);
        }
    };

    const theme = {
        isDarkMode,
        themeColor,
        userData,
        toggleDarkMode,
        changeThemeColor,
        updateUserData,
        colors: {
            background: isDarkMode ? '#121212' : '#f8f9fa',
            card: isDarkMode ? '#1e1e1e' : '#ffffff',
            text: isDarkMode ? '#ffffff' : '#333333',
            textSecondary: isDarkMode ? '#aaaaaa' : '#666666',
            border: isDarkMode ? '#2a2a2a' : '#e9ecef',
            tabBar: isDarkMode ? '#1e1e1e' : '#ffffff',
            tabBarBorder: isDarkMode ? '#2a2a2a' : '#e9ecef',
        }
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};