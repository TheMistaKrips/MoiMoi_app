import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Импорт экранов
import CompleteOnboardingScreen from '../screens/Onboarding/CompleteOnboardingScreen';
import HomeScreen from '../screens/Main/HomeScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';
import ChatScreen from '../screens/Main/ChatScreen';
import CalendarScreen from '../screens/Main/CalendarScreen';
import SettingsScreen from '../screens/Main/SettingsScreen';
import ShopScreen from '../screens/Main/ShopScreen';
import HabitScreen from '../screens/Main/HabitScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Создаем отдельный стек для профиля с настройками
const ProfileStackNavigator = createNativeStackNavigator();

function ProfileStack() {
    const { colors, themeColor } = useTheme();

    return (
        <ProfileStackNavigator.Navigator>
            <ProfileStackNavigator.Screen
                name="ProfileMain"
                component={ProfileScreen}
                options={{
                    headerShown: false,
                }}
            />
            <ProfileStackNavigator.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    title: 'Настройки',
                    headerStyle: {
                        backgroundColor: themeColor,
                    },
                    headerTintColor: 'white',
                }}
            />
        </ProfileStackNavigator.Navigator>
    );
}

// Создаем стек для главного приложения с чатом
const MainStackNavigator = createNativeStackNavigator();

function MainStack() {
    const { colors, themeColor } = useTheme();

    return (
        <MainStackNavigator.Navigator>
            <MainStackNavigator.Screen
                name="MainTabs"
                component={MainTabs}
                options={{
                    headerShown: false,
                }}
            />
            <MainStackNavigator.Screen
                name="Chat"
                component={ChatScreen}
                options={{
                    title: 'Чат с MoiMoi',
                    headerStyle: {
                        backgroundColor: themeColor,
                    },
                    headerTintColor: 'white',
                }}
            />
        </MainStackNavigator.Navigator>
    );
}

function MainTabs() {
    const { colors, themeColor, isDarkMode } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: themeColor,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.tabBar,
                    borderTopWidth: 1,
                    borderTopColor: colors.tabBarBorder,
                    height: 80,
                    paddingBottom: 40,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
                headerStyle: {
                    backgroundColor: themeColor,
                },
                headerTintColor: 'white',
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
                }}
            />
            <Tab.Screen
                name="Habits"
                component={HabitScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="leaf-outline" size={size} color={color} />
                    ),
                    title: 'Привычки',
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                    title: 'Профиль',
                    headerShown: false,
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
        </Stack.Navigator>
    );
}

export default function AppNavigator() {
    const [appReady, setAppReady] = useState(false);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

    useEffect(() => {
        checkOnboardingState();
    }, []);

    const checkOnboardingState = async () => {
        try {
            const onboardingCompleted = await AsyncStorage.getItem('hasCompletedOnboarding');
            setHasCompletedOnboarding(onboardingCompleted === 'true');
        } catch (error) {
            console.error('Error checking onboarding state:', error);
        } finally {
            setAppReady(true);
        }
    };

    // Слушаем изменения в AsyncStorage
    useEffect(() => {
        const checkOnboardingChange = async () => {
            const onboardingCompleted = await AsyncStorage.getItem('hasCompletedOnboarding');
            setHasCompletedOnboarding(onboardingCompleted === 'true');
        };

        // Проверяем каждую секунду (можно оптимизировать)
        const interval = setInterval(checkOnboardingChange, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!appReady) {
        return null;
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            {!hasCompletedOnboarding ? (
                <Stack.Screen
                    name="Onboarding"
                    component={OnboardingStack}
                />
            ) : (
                <Stack.Screen
                    name="Main"
                    component={MainStack}
                />
            )}
        </Stack.Navigator>
    );
}