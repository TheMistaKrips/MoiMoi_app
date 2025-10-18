import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Импорт экранов
import GoogleLoginPage from '../screens/Onboarding/GoogleLoginPage';
import CompleteOnboardingScreen from '../screens/Onboarding/CompleteOnboardingScreen';
import HomeScreen from '../screens/Main/HomeScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';
import ChatScreen from '../screens/Main/ChatScreen';
import CalendarScreen from '../screens/Main/CalendarScreen';
import SettingsScreen from '../screens/Main/SettingsScreen';
import ShopScreen from '../screens/Main/ShopScreen';

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
                name="Shop"
                component={ShopScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="storefront-outline" size={size} color={color} />
                    ),
                    title: 'Магазин',
                    headerStyle: {
                        backgroundColor: '#bb69f2',
                    },
                    headerTintColor: 'white',
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
                name="CompleteOnboarding"
                component={CompleteOnboardingScreen}
                options={{
                    animation: 'fade',
                }}
            />
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

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            {!isLoggedIn ? (
                <Stack.Screen
                    name="Login"
                    component={GoogleLoginPage}
                    options={{
                        animation: 'fade',
                    }}
                />
            ) : !hasCompletedOnboarding ? (
                <Stack.Screen
                    name="Onboarding"
                    component={OnboardingStack}
                />
            ) : (
                <Stack.Screen
                    name="Main"
                    component={MainTabs}
                />
            )}
        </Stack.Navigator>
    );
}