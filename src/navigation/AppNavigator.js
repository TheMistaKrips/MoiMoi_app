import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Импорт экранов
import GoogleLoginPage from '../screens/Onboarding/GoogleLoginPage';
import WelcomeScreen from '../screens/Onboarding/WelcomeScreen';
import PermissionsScreen from '../screens/Onboarding/PermissionsScreen';
import HabitsScreen from '../screens/Onboarding/HabitsScreen';
import RegistrationScreen from '../screens/Onboarding/RegistrationScreen';
import HomeScreen from '../screens/Main/HomeScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';
import ChatScreen from '../screens/Main/ChatScreen';
import CalendarScreen from '../screens/Main/CalendarScreen';
import SettingsScreen from '../screens/Main/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#bb69f2',
                tabBarInactiveTintColor: '#999',
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#e9ecef',
                    height: 80,
                    paddingBottom: 40,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                    headerShown: false,
                    title: 'Главная',
                }}
            />
            <Tab.Screen
                name="Chat"
                component={ChatScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="chatbubble-outline" size={size} color={color} />
                    ),
                    title: 'Чат',
                    headerStyle: {
                        backgroundColor: '#bb69f2',
                    },
                    headerTintColor: 'white',
                }}
            />
            <Tab.Screen
                name="Calendar"
                component={CalendarScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar-outline" size={size} color={color} />
                    ),
                    title: 'Календарь',
                    headerStyle: {
                        backgroundColor: '#bb69f2',
                    },
                    headerTintColor: 'white',
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                    title: 'Профиль',
                    headerStyle: {
                        backgroundColor: '#bb69f2',
                    },
                    headerTintColor: 'white',
                }}
            />
            {/* Добавляем Settings в таб-бар */}
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings-outline" size={size} color={color} />
                    ),
                    title: 'Настройки',
                    headerStyle: {
                        backgroundColor: '#bb69f2',
                    },
                    headerTintColor: 'white',
                }}
            />
        </Tab.Navigator>
    );
}

function OnboardingStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
                options={{
                    animation: 'fade',
                }}
            />
            <Stack.Screen name="Permissions" component={PermissionsScreen} />
            <Stack.Screen name="Habits" component={HabitsScreen} />
            <Stack.Screen name="Registration" component={RegistrationScreen} />
            <Stack.Screen
                name="Main"
                component={MainTabs}
                options={{
                    animation: 'slide_from_bottom',
                }}
            />
        </Stack.Navigator>
    );
}

export default function AppNavigator() {
    const [appReady, setAppReady] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

    useEffect(() => {
        checkAuthState();
    }, []);

    const checkAuthState = async () => {
        try {
            const userLoggedIn = await AsyncStorage.getItem('isLoggedIn');
            const onboardingCompleted = await AsyncStorage.getItem('hasCompletedOnboarding');

            console.log('Auth state check:', {
                userLoggedIn,
                onboardingCompleted
            });

            setIsLoggedIn(userLoggedIn === 'true');
            setHasCompletedOnboarding(onboardingCompleted === 'true');
        } catch (error) {
            console.error('Error checking auth state:', error);
        } finally {
            setAppReady(true);
        }
    };

    if (!appReady) {
        return null;
    }

    console.log('Rendering navigator with:', {
        isLoggedIn,
        hasCompletedOnboarding
    });

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            {!isLoggedIn ? (
                // Пользователь не залогинен - показываем только экран входа
                <Stack.Screen
                    name="Login"
                    component={GoogleLoginPage}
                    options={{
                        animation: 'fade',
                    }}
                />
            ) : !hasCompletedOnboarding ? (
                // Пользователь залогинен, но не завершил онбординг
                <Stack.Screen
                    name="Onboarding"
                    component={OnboardingStack}
                />
            ) : (
                // Пользователь залогинен и завершил онбординг - показываем главное приложение
                <>
                    <Stack.Screen
                        name="Main"
                        component={MainTabs}
                    />
                    <Stack.Screen
                        name="Settings"
                        component={SettingsScreen}
                        options={{
                            headerShown: true,
                            title: 'Настройки',
                            headerStyle: {
                                backgroundColor: '#bb69f2',
                            },
                            headerTintColor: 'white',
                        }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
}