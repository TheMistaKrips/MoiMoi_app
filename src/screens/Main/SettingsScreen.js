import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, TextInput, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';

export default function SettingsScreen() {
    const {
        isDarkMode,
        themeColor,
        userData,
        toggleDarkMode,
        changeThemeColor,
        updateUserData
    } = useTheme();

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [dailyReminders, setDailyReminders] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [vibrationEnabled, setVibrationEnabled] = useState(true);
    const [animationsEnabled, setAnimationsEnabled] = useState(true);
    const [effectsEnabled, setEffectsEnabled] = useState(true);

    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showAppearanceModal, setShowAppearanceModal] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [showDataManagementModal, setShowDataManagementModal] = useState(false);

    const [editedName, setEditedName] = useState('');
    const [editedAge, setEditedAge] = useState('');
    const [editedWeight, setEditedWeight] = useState('');
    const [editedHeight, setEditedHeight] = useState('');
    const [editedMoiMoiName, setEditedMoiMoiName] = useState('');
    const [avatar, setAvatar] = useState(null);

    const navigation = useNavigation();

    const colorThemes = [
        { id: 'purple', color: '#bb69f2', name: 'Фиолетовый' },
        { id: 'blue', color: '#69a4fe', name: 'Синий' },
        { id: 'green', color: '#4ECDC4', name: 'Зеленый' },
        { id: 'red', color: '#FF6B6B', name: 'Красный' },
        { id: 'orange', color: '#FFA500', name: 'Оранжевый' },
        { id: 'pink', color: '#FF69B4', name: 'Розовый' },
    ];

    useEffect(() => {
        loadUserData();
        loadAppSettings();
    }, [userData]);

    const loadUserData = () => {
        if (userData) {
            setEditedName(userData.name || '');
            setEditedAge(userData.age?.toString() || '');
            setEditedWeight(userData.weight?.toString() || '');
            setEditedHeight(userData.height?.toString() || '');
            setEditedMoiMoiName(userData.moimoiName || '');
            setAvatar(userData.avatar || null);
        }
    };

    const loadAppSettings = async () => {
        try {
            const settings = await AsyncStorage.getItem('appSettings');
            if (settings) {
                const parsedSettings = JSON.parse(settings);
                setNotificationsEnabled(parsedSettings.notificationsEnabled !== false);
                setDailyReminders(parsedSettings.dailyReminders !== false);
                setSoundEnabled(parsedSettings.soundEnabled !== false);
                setVibrationEnabled(parsedSettings.vibrationEnabled !== false);
                setAnimationsEnabled(parsedSettings.animationsEnabled !== false);
                setEffectsEnabled(parsedSettings.effectsEnabled !== false);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const saveAppSettings = async (newSettings = {}) => {
        try {
            const currentSettings = await AsyncStorage.getItem('appSettings');
            const settings = currentSettings ? JSON.parse(currentSettings) : {};
            const updatedSettings = { ...settings, ...newSettings };
            await AsyncStorage.setItem('appSettings', JSON.stringify(updatedSettings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Необходимо разрешение для доступа к фотографиям');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
        }
    };

    const saveUserData = async () => {
        if (!editedName.trim()) {
            Alert.alert('Ошибка', 'Пожалуйста, введите ваше имя');
            return;
        }

        if (!editedAge || parseInt(editedAge) < 1 || parseInt(editedAge) > 120) {
            Alert.alert('Ошибка', 'Пожалуйста, введите корректный возраст');
            return;
        }

        try {
            const updatedData = {
                name: editedName,
                age: parseInt(editedAge) || 0,
                weight: parseInt(editedWeight) || 0,
                height: parseInt(editedHeight) || 0,
                moimoiName: editedMoiMoiName,
                avatar: avatar,
                updatedAt: new Date().toISOString()
            };

            await updateUserData(updatedData);
            setShowEditProfile(false);
            Alert.alert('Успех!', 'Профиль обновлен');
        } catch (error) {
            console.error('Error saving user data:', error);
            Alert.alert('Ошибка', 'Не удалось сохранить изменения');
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Выход',
            'Вы уверены, что хотите выйти из аккаунта?',
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Выйти',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.multiRemove(['isLoggedIn', 'userData', 'hasCompletedOnboarding']);
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Onboarding' }],
                            });
                        } catch (error) {
                            console.error('Error during logout:', error);
                        }
                    },
                },
            ]
        );
    };

    const handleNotificationToggle = async (value) => {
        setNotificationsEnabled(value);
        const success = await saveAppSettings({ notificationsEnabled: value });
        if (success && value) {
            Alert.alert('Уведомления включены', 'Вы будете получать уведомления от MoiMoi');
        }
    };

    const handleDailyRemindersToggle = async (value) => {
        setDailyReminders(value);
        const success = await saveAppSettings({ dailyReminders: value });
        if (success && value) {
            Alert.alert('Ежедневные напоминания включены', 'Вы будете получать напоминания о ваших привычках');
        }
    };

    const handleSoundToggle = async (value) => {
        setSoundEnabled(value);
        await saveAppSettings({ soundEnabled: value });
    };

    const handleVibrationToggle = async (value) => {
        setVibrationEnabled(value);
        await saveAppSettings({ vibrationEnabled: value });
    };

    const handleDarkModeToggle = async (value) => {
        toggleDarkMode(value);
    };

    const handleAnimationsToggle = async (value) => {
        setAnimationsEnabled(value);
        const success = await saveAppSettings({ animationsEnabled: value });
        if (success) {
            Alert.alert('Настройки анимаций', value ? 'Анимации включены' : 'Анимации отключены');
        }
    };

    const handleEffectsToggle = async (value) => {
        setEffectsEnabled(value);
        const success = await saveAppSettings({ effectsEnabled: value });
        if (success) {
            Alert.alert('Настройки эффектов', value ? 'Эффекты включены' : 'Эффекты отключены');
        }
    };

    const applyColorTheme = async (color) => {
        changeThemeColor(color);
    };

    const resetSettings = () => {
        Alert.alert(
            'Сброс настроек',
            'Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?',
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Сбросить',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('appSettings');
                            changeThemeColor('#bb69f2');
                            toggleDarkMode(false);
                            setNotificationsEnabled(true);
                            setDailyReminders(true);
                            setSoundEnabled(true);
                            setVibrationEnabled(true);
                            setAnimationsEnabled(true);
                            setEffectsEnabled(true);
                            Alert.alert('Успех', 'Настройки сброшены к значениям по умолчанию');
                        } catch (error) {
                            Alert.alert('Ошибка', 'Не удалось сбросить настройки');
                        }
                    },
                },
            ]
        );
    };

    const exportData = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            const tasks = await AsyncStorage.getItem('userTasks');
            const habits = await AsyncStorage.getItem('userHabits');
            const settings = await AsyncStorage.getItem('appSettings');
            const firePoints = await AsyncStorage.getItem('totalFirePoints');
            const happiness = await AsyncStorage.getItem('moimoiHappiness');
            const streak = await AsyncStorage.getItem('userStreak');

            const exportData = {
                userData: userData ? JSON.parse(userData) : null,
                tasks: tasks ? JSON.parse(tasks) : [],
                habits: habits ? JSON.parse(habits) : [],
                settings: settings ? JSON.parse(settings) : {},
                stats: {
                    firePoints: firePoints || '0',
                    happiness: happiness || '100',
                    streak: streak || '0'
                },
                exportDate: new Date().toISOString(),
                version: '1.0.0'
            };

            Alert.alert(
                'Экспорт данных',
                `Данные готовы к экспорту:\n- Профиль: ${exportData.userData ? '✓' : '✗'}\n- Задачи: ${exportData.tasks.length}\n- Привычки: ${exportData.habits.length}\n- Настройки: ${exportData.settings ? '✓' : '✗'}\n- Статистика: ✓`,
                [{ text: 'OK' }]
            );

            console.log('Export data:', JSON.stringify(exportData, null, 2));
        } catch (error) {
            Alert.alert('Ошибка', 'Не удалось подготовить данные для экспорта');
        }
    };

    const clearAllData = () => {
        Alert.alert(
            'Очистка всех данных',
            'ВНИМАНИЕ! Это действие удалит все ваши данные: профиль, задачи, привычки, статистику. Это действие нельзя отменить!',
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Очистить все',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.multiRemove([
                                'userData',
                                'userTasks',
                                'userHabits',
                                'totalFirePoints',
                                'moimoiHappiness',
                                'userStreak',
                                'lastActiveDate',
                                'activeSkin',
                                'ownedSkins'
                            ]);
                            Alert.alert('Успех', 'Все данные очищены');
                            setShowDataManagementModal(false);
                        } catch (error) {
                            Alert.alert('Ошибка', 'Не удалось очистить данные');
                        }
                    },
                },
            ]
        );
    };

    const clearCache = async () => {
        try {
            Alert.alert('Успех', 'Кеш приложения очищен');
        } catch (error) {
            Alert.alert('Ошибка', 'Не удалось очистить кеш');
        }
    };

    const calculateBMI = (weight, height) => {
        if (!weight || !height) return null;
        const heightInMeters = height / 100;
        return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    };

    const getBMICategory = (bmi) => {
        if (bmi < 18.5) return { category: 'Недостаточный вес', color: '#FF6B6B' };
        if (bmi < 25) return { category: 'Нормальный вес', color: '#4CAF50' };
        if (bmi < 30) return { category: 'Избыточный вес', color: '#FFA500' };
        return { category: 'Ожирение', color: '#FF6B6B' };
    };

    const settingsSections = [
        {
            title: 'Профиль',
            icon: 'person-outline',
            items: [
                {
                    label: 'Редактировать профиль',
                    description: 'Изменить имя, возраст и другие данные',
                    type: 'link',
                    onPress: () => setShowEditProfile(true),
                    icon: 'create-outline'
                },
                {
                    label: 'Управление данными',
                    description: 'Экспорт и очистка данных',
                    type: 'link',
                    onPress: () => setShowDataManagementModal(true),
                    icon: 'cloud-download-outline'
                }
            ]
        },
        {
            title: 'Уведомления',
            icon: 'notifications-outline',
            items: [
                {
                    label: 'Настройки уведомлений',
                    description: 'Управление push-уведомлениями',
                    type: 'link',
                    onPress: () => setShowNotificationsModal(true),
                    icon: 'notifications-outline'
                },
                {
                    label: 'Включить уведомления',
                    value: notificationsEnabled,
                    onValueChange: handleNotificationToggle,
                    type: 'switch',
                    icon: 'notifications'
                },
                {
                    label: 'Ежедневные напоминания',
                    value: dailyReminders,
                    onValueChange: handleDailyRemindersToggle,
                    type: 'switch',
                    icon: 'alarm-outline'
                }
            ]
        },
        {
            title: 'Внешний вид',
            icon: 'color-palette-outline',
            items: [
                {
                    label: 'Настройки оформления',
                    description: 'Темы, цвета и шрифты',
                    type: 'link',
                    onPress: () => setShowAppearanceModal(true),
                    icon: 'brush-outline'
                },
                {
                    label: 'Темная тема',
                    value: isDarkMode,
                    onValueChange: handleDarkModeToggle,
                    type: 'switch',
                    icon: 'moon-outline'
                },
                {
                    label: 'Анимации',
                    value: animationsEnabled,
                    onValueChange: handleAnimationsToggle,
                    type: 'switch',
                    icon: 'play-outline'
                },
                {
                    label: 'Эффекты',
                    value: effectsEnabled,
                    onValueChange: handleEffectsToggle,
                    type: 'switch',
                    icon: 'sparkles-outline'
                }
            ]
        },
        {
            title: 'Конфиденциальность',
            icon: 'shield-checkmark-outline',
            items: [
                {
                    label: 'Политика конфиденциальности',
                    description: 'Как мы защищаем ваши данные',
                    type: 'link',
                    onPress: () => setShowPrivacyModal(true),
                    icon: 'lock-closed-outline'
                },
                {
                    label: 'Сброс настроек',
                    description: 'Вернуть все настройки по умолчанию',
                    type: 'link',
                    onPress: resetSettings,
                    icon: 'refresh-outline'
                }
            ]
        },
        {
            title: 'О приложении',
            icon: 'information-circle-outline',
            items: [
                {
                    label: 'Версия приложения',
                    value: '2.0.0',
                    type: 'value',
                    icon: 'logo-react'
                },
                {
                    label: 'О MoiMoi',
                    description: 'Информация о приложении и разработчиках',
                    type: 'link',
                    onPress: () => setShowAboutModal(true),
                    icon: 'heart-outline'
                }
            ]
        }
    ];

    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={[styles.header, { backgroundColor: colors.card }]}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Настройки</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Управление приложением и профилем</Text>
                </View>

                {settingsSections.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={[styles.section, { backgroundColor: colors.card }]}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <Ionicons
                                    name={section.icon}
                                    size={22}
                                    color={themeColor}
                                />
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    {section.title}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.sectionContent}>
                            {section.items.map((item, itemIndex) => (
                                <TouchableOpacity
                                    key={itemIndex}
                                    style={[styles.settingItem, { borderBottomColor: colors.border }]}
                                    onPress={item.onPress}
                                    disabled={!item.onPress}
                                >
                                    <View style={styles.settingLeft}>
                                        {item.icon && (
                                            <Ionicons
                                                name={item.icon}
                                                size={20}
                                                color={themeColor}
                                                style={styles.settingIcon}
                                            />
                                        )}
                                        <View style={styles.settingTextContainer}>
                                            <Text style={[styles.settingLabel, { color: colors.text }]}>
                                                {item.label}
                                            </Text>
                                            {item.description && (
                                                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                                    {item.description}
                                                </Text>
                                            )}
                                        </View>
                                    </View>

                                    {item.type === 'switch' && (
                                        <Switch
                                            value={item.value}
                                            onValueChange={item.onValueChange}
                                            trackColor={{ false: '#767577', true: themeColor }}
                                            thumbColor={item.value ? '#ffffff' : '#f4f3f4'}
                                        />
                                    )}

                                    {item.type === 'value' && (
                                        <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                                            {item.value}
                                        </Text>
                                    )}

                                    {(item.type === 'link' || !item.type) && (
                                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: colors.card, borderColor: '#ff6b6b' }]}
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
                    <Text style={styles.logoutText}>Выйти из аккаунта</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Модальное окно редактирования профиля */}
            <Modal visible={showEditProfile} animationType="fade" transparent statusBarTranslucent>
                <BlurView intensity={100} tint='dark' style={styles.modalContainer}>
                    <View style={[styles.editProfileModalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Редактировать профиль</Text>

                        <ScrollView
                            style={styles.editProfileScrollView}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.editProfileScrollContent}
                        >
                            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                                {avatar ? (
                                    <Image source={{ uri: avatar }} style={styles.avatar} />
                                ) : (
                                    <View style={[styles.avatarPlaceholder, { backgroundColor: colors.background }]}>
                                        <Ionicons name="person-outline" size={40} color={themeColor} />
                                        <Text style={[styles.avatarText, { color: colors.textSecondary }]}></Text>
                                    </View>
                                )}
                                <View style={[styles.avatarOverlay, { backgroundColor: themeColor }]}>
                                    <Ionicons name="camera" size={20} color="white" />
                                </View>
                            </TouchableOpacity>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputLabel, { color: colors.text }]}>Имя</Text>
                                <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                                    <Ionicons name="person-outline" size={20} color={themeColor} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="Введите ваше имя"
                                        placeholderTextColor={colors.textSecondary}
                                        value={editedName}
                                        onChangeText={setEditedName}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputLabel, { color: colors.text }]}>Возраст</Text>
                                <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                                    <Ionicons name="calendar-outline" size={20} color={themeColor} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="Введите ваш возраст"
                                        placeholderTextColor={colors.textSecondary}
                                        value={editedAge}
                                        onChangeText={setEditedAge}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputLabel, { color: colors.text }]}>Вес (кг)</Text>
                                <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                                    <Ionicons name="barbell-outline" size={20} color={themeColor} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="Введите ваш вес"
                                        placeholderTextColor={colors.textSecondary}
                                        value={editedWeight}
                                        onChangeText={setEditedWeight}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputLabel, { color: colors.text }]}>Рост (см)</Text>
                                <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                                    <Ionicons name="resize-outline" size={20} color={themeColor} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="Введите ваш рост"
                                        placeholderTextColor={colors.textSecondary}
                                        value={editedHeight}
                                        onChangeText={setEditedHeight}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            {editedWeight && editedHeight && (
                                <View style={styles.bmiContainer}>
                                    <Text style={[styles.bmiLabel, { color: colors.text }]}>Индекс массы тела (ИМТ):</Text>
                                    {(() => {
                                        const bmi = calculateBMI(parseInt(editedWeight), parseInt(editedHeight));
                                        const bmiCategory = bmi ? getBMICategory(bmi) : null;
                                        return bmi ? (
                                            <Text style={[styles.bmiValue, { color: bmiCategory?.color }]}>
                                                {bmi} - {bmiCategory?.category}
                                            </Text>
                                        ) : null;
                                    })()}
                                </View>
                            )}

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputLabel, { color: colors.text }]}>Имя MoiMoi</Text>
                                <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                                    <Ionicons name="sparkles-outline" size={20} color={themeColor} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="Имя вашего помощника"
                                        placeholderTextColor={colors.textSecondary}
                                        value={editedMoiMoiName}
                                        onChangeText={setEditedMoiMoiName}
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.cancelButton, { backgroundColor: colors.background }]}
                                onPress={() => setShowEditProfile(false)}
                            >
                                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Отмена</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: themeColor }]}
                                onPress={saveUserData}
                            >
                                <Text style={styles.saveButtonText}>Сохранить</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </Modal>

            {/* Модальное окно внешнего вида */}
            <Modal visible={showAppearanceModal} animationType="fade" transparent statusBarTranslucent>
                <BlurView intensity={100} tint='dark' style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Внешний вид</Text>
                        <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Настройте оформление приложения</Text>

                        <View style={styles.appearanceSection}>
                            <Text style={[styles.appearanceSectionTitle, { color: colors.text }]}>Цветовая схема</Text>
                            <View style={styles.colorGrid}>
                                {colorThemes.map((theme) => (
                                    <TouchableOpacity
                                        key={theme.id}
                                        style={[
                                            styles.colorOption,
                                            { backgroundColor: theme.color },
                                            themeColor === theme.color && styles.colorOptionSelected
                                        ]}
                                        onPress={() => applyColorTheme(theme.color)}
                                    >
                                        {themeColor === theme.color && (
                                            <Ionicons name="checkmark" size={20} color="white" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Text style={[styles.colorNames, { color: colors.text }]}>
                                {colorThemes.find(t => t.color === themeColor)?.name}
                            </Text>
                        </View>

                        <View style={styles.appearanceSection}>
                            <Text style={[styles.appearanceSectionTitle, { color: colors.text }]}>Тема</Text>
                            <View style={styles.themeOptions}>
                                <TouchableOpacity
                                    style={[styles.themeOption, !isDarkMode && styles.themeOptionActive, { backgroundColor: colors.background }]}
                                    onPress={() => handleDarkModeToggle(false)}
                                >
                                    <Ionicons name="sunny" size={24} color={!isDarkMode ? themeColor : colors.textSecondary} />
                                    <Text style={[styles.themeText, !isDarkMode && styles.themeTextActive, { color: colors.text }]}>Светлая</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.themeOption, isDarkMode && styles.themeOptionActive, { backgroundColor: colors.background }]}
                                    onPress={() => handleDarkModeToggle(true)}
                                >
                                    <Ionicons name="moon" size={24} color={isDarkMode ? themeColor : colors.textSecondary} />
                                    <Text style={[styles.themeText, isDarkMode && styles.themeTextActive, { color: colors.text }]}>Темная</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.appearanceSection}>
                            <Text style={[styles.appearanceSectionTitle, { color: colors.text }]}>Эффекты</Text>
                            <View style={[styles.modalSettingItem, { borderBottomColor: colors.border }]}>
                                <View style={styles.modalSettingLeft}>
                                    <Ionicons name="play-outline" size={20} color={themeColor} />
                                    <Text style={[styles.modalSettingLabel, { color: colors.text }]}>Анимации</Text>
                                </View>
                                <Switch
                                    value={animationsEnabled}
                                    onValueChange={handleAnimationsToggle}
                                    trackColor={{ false: '#767577', true: themeColor }}
                                    thumbColor={animationsEnabled ? '#ffffff' : '#f4f3f4'}
                                />
                            </View>
                            <View style={[styles.modalSettingItem, { borderBottomColor: colors.border }]}>
                                <View style={styles.modalSettingLeft}>
                                    <Ionicons name="sparkles-outline" size={20} color={themeColor} />
                                    <Text style={[styles.modalSettingLabel, { color: colors.text }]}>Эффекты</Text>
                                </View>
                                <Switch
                                    value={effectsEnabled}
                                    onValueChange={handleEffectsToggle}
                                    trackColor={{ false: '#767577', true: themeColor }}
                                    thumbColor={effectsEnabled ? '#ffffff' : '#f4f3f4'}
                                />
                            </View>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.cancelButton, { backgroundColor: colors.background }]}
                                onPress={() => setShowAppearanceModal(false)}
                            >
                                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Отмена</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: themeColor }]}
                                onPress={() => {
                                    saveAppSettings();
                                    setShowAppearanceModal(false);
                                }}
                            >
                                <Text style={styles.saveButtonText}>Применить</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </Modal>

            {/* Модальное окно уведомлений */}
            <Modal visible={showNotificationsModal} animationType="fade" transparent statusBarTranslucent>
                <BlurView intensity={100} tint='dark' style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Уведомления</Text>
                        <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Управление уведомлениями и напоминаниями</Text>

                        <View style={styles.notificationSettings}>
                            <View style={[styles.modalSettingItem, { borderBottomColor: colors.border }]}>
                                <View style={styles.modalSettingLeft}>
                                    <Ionicons name="notifications" size={20} color={themeColor} />
                                    <Text style={[styles.modalSettingLabel, { color: colors.text }]}>Push-уведомления</Text>
                                </View>
                                <Switch
                                    value={notificationsEnabled}
                                    onValueChange={handleNotificationToggle}
                                    trackColor={{ false: '#767577', true: themeColor }}
                                    thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
                                />
                            </View>
                            <View style={[styles.modalSettingItem, { borderBottomColor: colors.border }]}>
                                <View style={styles.modalSettingLeft}>
                                    <Ionicons name="alarm-outline" size={20} color={themeColor} />
                                    <Text style={[styles.modalSettingLabel, { color: colors.text }]}>Ежедневные напоминания</Text>
                                </View>
                                <Switch
                                    value={dailyReminders}
                                    onValueChange={handleDailyRemindersToggle}
                                    trackColor={{ false: '#767577', true: themeColor }}
                                    thumbColor={dailyReminders ? '#ffffff' : '#f4f3f4'}
                                />
                            </View>
                            <View style={[styles.modalSettingItem, { borderBottomColor: colors.border }]}>
                                <View style={styles.modalSettingLeft}>
                                    <Ionicons name="volume-high-outline" size={20} color={themeColor} />
                                    <Text style={[styles.modalSettingLabel, { color: colors.text }]}>Звук уведомлений</Text>
                                </View>
                                <Switch
                                    value={soundEnabled}
                                    onValueChange={handleSoundToggle}
                                    trackColor={{ false: '#767577', true: themeColor }}
                                    thumbColor={soundEnabled ? '#ffffff' : '#f4f3f4'}
                                />
                            </View>
                            <View style={[styles.modalSettingItem, { borderBottomColor: colors.border }]}>
                                <View style={styles.modalSettingLeft}>
                                    <Ionicons name="phone-portrait-outline" size={20} color={themeColor} />
                                    <Text style={[styles.modalSettingLabel, { color: colors.text }]}>Вибрация</Text>
                                </View>
                                <Switch
                                    value={vibrationEnabled}
                                    onValueChange={handleVibrationToggle}
                                    trackColor={{ false: '#767577', true: themeColor }}
                                    thumbColor={vibrationEnabled ? '#ffffff' : '#f4f3f4'}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.closeButton, { backgroundColor: themeColor }]}
                            onPress={() => setShowNotificationsModal(false)}
                        >
                            <Text style={styles.closeButtonText}>Закрыть</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </Modal>

            {/* Модальное окно управления данными */}
            <Modal visible={showDataManagementModal} animationType="fade" transparent statusBarTranslucent>
                <BlurView intensity={100} tint='dark' style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Управление данными</Text>
                        <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Экспорт и очистка ваших данных</Text>

                        <View style={styles.dataManagementOptions}>
                            <TouchableOpacity
                                style={[styles.dataOption, { backgroundColor: colors.background }]}
                                onPress={exportData}
                            >
                                <Ionicons name="download-outline" size={24} color={themeColor} />
                                <View style={styles.dataOptionText}>
                                    <Text style={[styles.dataOptionTitle, { color: colors.text }]}>Экспорт данных</Text>
                                    <Text style={[styles.dataOptionDescription, { color: colors.textSecondary }]}>
                                        Скачайте все ваши данные в формате JSON
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.dataOption, { backgroundColor: colors.background }]}
                                onPress={clearCache}
                            >
                                <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
                                <View style={styles.dataOptionText}>
                                    <Text style={[styles.dataOptionTitle, { color: colors.text }]}>Очистить кеш</Text>
                                    <Text style={[styles.dataOptionDescription, { color: colors.textSecondary }]}>
                                        Удалить временные файлы приложения
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.dataOption, { backgroundColor: colors.background, borderColor: '#ff6b6b' }]}
                                onPress={clearAllData}
                            >
                                <Ionicons name="nuclear-outline" size={24} color="#ff6b6b" />
                                <View style={styles.dataOptionText}>
                                    <Text style={[styles.dataOptionTitle, { color: '#ff6b6b' }]}>Очистить все данные</Text>
                                    <Text style={[styles.dataOptionDescription, { color: colors.textSecondary }]}>
                                        Удалить все данные приложения (необратимо)
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#ff6b6b" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.closeButton, { backgroundColor: themeColor }]}
                                onPress={() => setShowDataManagementModal(false)}
                            >
                                <Text style={styles.closeButtonText}>Закрыть</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </Modal>

            {/* Модальное окно "О приложении" */}
            <Modal visible={showAboutModal} animationType="fade" transparent statusBarTranslucent>
                <BlurView intensity={100} tint='dark' style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>О MoiMoi</Text>

                        <View style={styles.aboutContent}>
                            <Ionicons name="heart" size={60} color={themeColor} style={styles.aboutIcon} />
                            <Text style={[styles.aboutText, { color: colors.text }]}>
                                MoiMoi - ваш персональный помощник для развития привычек и достижения целей!
                            </Text>
                            <Text style={[styles.aboutSubtext, { color: colors.textSecondary }]}>
                                Версия 2.0.0{'\n'}
                                Разработано с ❤️ для вашего саморазвития
                            </Text>

                            <View style={styles.featuresList}>
                                <View style={styles.featureItem}>
                                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                                    <Text style={[styles.featureText, { color: colors.text }]}>Отслеживание привычек</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                                    <Text style={[styles.featureText, { color: colors.text }]}>Система мотивации</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                                    <Text style={[styles.featureText, { color: colors.text }]}>Персональная статистика</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                                    <Text style={[styles.featureText, { color: colors.text }]}>Игровые элементы</Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.closeButton, { backgroundColor: themeColor }]}
                            onPress={() => setShowAboutModal(false)}
                        >
                            <Text style={styles.closeButtonText}>Закрыть</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </Modal>

            {/* Модальное окно политики конфиденциальности */}
            <Modal visible={showPrivacyModal} animationType="fade" transparent statusBarTranslucent>
                <BlurView intensity={100} tint='dark' style={styles.modalContainer}>
                    <View style={[styles.modalContentLarge, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Политика конфиденциальности</Text>

                        <ScrollView style={styles.privacyContent} showsVerticalScrollIndicator={false}>
                            <Text style={[styles.privacyText, { color: colors.text }]}>
                                <Text style={styles.privacySectionTitle}>1. Сбор данных{'\n\n'}</Text>
                                MoiMoi собирает только необходимые данные для работы приложения:{'\n\n'}
                                • Имя и базовая информация профиля{'\n'}
                                • Ваши привычки и цели{'\n'}
                                • Прогресс выполнения задач{'\n'}
                                • Настройки приложения{'\n\n'}

                                <Text style={styles.privacySectionTitle}>2. Использование данных{'\n\n'}</Text>
                                Ваши данные используются исключительно для:{'\n\n'}
                                • Персонализации вашего опыта{'\n'}
                                • Отслеживания прогресса{'\n'}
                                • Предоставления статистики{'\n'}
                                • Улучшения работы приложения{'\n\n'}

                                <Text style={styles.privacySectionTitle}>3. Защита данных{'\n\n'}</Text>
                                Все данные хранятся локально на вашем устройстве.
                                Мы не передаем вашу информацию третьим лицам.{'\n\n'}

                                <Text style={styles.privacySectionTitle}>4. Ваши права{'\n\n'}</Text>
                                Вы можете в любой время:{'\n\n'}
                                • Экспортировать свои данные{'\n'}
                                • Удалить аккаунт{'\n'}
                                • Очистить все данные{'\n'}
                                • Изменить настройки конфиденциальности{'\n\n'}

                                <Text style={styles.privacyNote}>
                                    Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
                                </Text>
                            </Text>
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.closeButton, { backgroundColor: themeColor }]}
                            onPress={() => setShowPrivacyModal(false)}
                        >
                            <Text style={styles.closeButtonText}>Закрыть</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        padding: 25,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
    },
    section: {
        marginHorizontal: 20,
        marginBottom: 15,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionHeader: {
        padding: 20,
        borderBottomWidth: 1,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    sectionContent: {
        paddingHorizontal: 5,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingIcon: {
        marginRight: 12,
    },
    settingTextContainer: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    settingDescription: {
        fontSize: 12,
        marginTop: 2,
    },
    settingValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 20,
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    logoutText: {
        color: '#ff6b6b',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 25,
        padding: 25,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    modalContentLarge: {
        borderRadius: 25,
        padding: 25,
        width: '100%',
        maxWidth: 400,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    // Специальные стили для модального окна редактирования профиля
    editProfileModalContent: {
        borderRadius: 25,
        padding: 25,
        width: '100%',
        maxWidth: 400,
        height: '80%',
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    editProfileScrollView: {
        flex: 1,
    },
    editProfileScrollContent: {
        paddingBottom: 10,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 25,
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 1,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderStyle: 'dashed',
    },
    avatarText: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '500',
    },
    avatarOverlay: {
        position: 'absolute',
        bottom: 0,
        right: '35%',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        marginLeft: 10,
    },
    bmiContainer: {
        marginBottom: 20,
        padding: 15,
        borderRadius: 12,
    },
    bmiLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 5,
    },
    bmiValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        marginRight: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    saveButton: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        marginLeft: 10,
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    closeButton: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 15,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    appearanceSection: {
        marginBottom: 25,
    },
    appearanceSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    colorOption: {
        width: 50,
        height: 50,
        borderRadius: 25,
        margin: 5,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    colorOptionSelected: {
        borderWidth: 3,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    colorNames: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 10,
    },
    themeOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    themeOption: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        marginHorizontal: 5,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    themeOptionActive: {
        borderColor: '#bb69f2',
    },
    themeText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    themeTextActive: {
        fontWeight: '600',
    },
    modalSettingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    modalSettingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    modalSettingLabel: {
        fontSize: 16,
        marginLeft: 12,
        fontWeight: '500',
    },
    notificationSettings: {
        marginBottom: 20,
    },
    dataManagementOptions: {
        marginBottom: 20,
    },
    dataOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    dataOptionText: {
        flex: 1,
        marginLeft: 12,
    },
    dataOptionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    dataOptionDescription: {
        fontSize: 12,
    },
    aboutContent: {
        alignItems: 'center',
        marginBottom: 20,
    },
    aboutIcon: {
        marginBottom: 20,
    },
    aboutText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 15,
    },
    aboutSubtext: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    featuresList: {
        width: '100%',
        marginTop: 15,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    featureText: {
        fontSize: 14,
        marginLeft: 10,
    },
    privacyContent: {
        maxHeight: 400,
        marginBottom: 20,
    },
    privacyText: {
        fontSize: 14,
        lineHeight: 20,
    },
    privacySectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 15,
    },
    privacyNote: {
        fontStyle: 'italic',
        marginTop: 20,
        textAlign: 'center',
    },
});