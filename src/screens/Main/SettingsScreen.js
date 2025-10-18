import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [dailyReminders, setDailyReminders] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [vibrationEnabled, setVibrationEnabled] = useState(true);
    const [animationsEnabled, setAnimationsEnabled] = useState(true);
    const [effectsEnabled, setEffectsEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showAppearanceModal, setShowAppearanceModal] = useState(false);

    const [userData, setUserData] = useState(null);
    const [editedName, setEditedName] = useState('');
    const [editedAge, setEditedAge] = useState('');
    const [editedMoiMoiName, setEditedMoiMoiName] = useState('');
    const [selectedColor, setSelectedColor] = useState('#bb69f2');

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
    }, []);

    const loadUserData = async () => {
        try {
            const userDataString = await AsyncStorage.getItem('userData');
            if (userDataString) {
                const data = JSON.parse(userDataString);
                setUserData(data);
                setEditedName(data.name || '');
                setEditedAge(data.age?.toString() || '');
                setEditedMoiMoiName(data.moimoiName || '');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const loadAppSettings = async () => {
        try {
            const settings = await AsyncStorage.getItem('appSettings');
            if (settings) {
                const parsedSettings = JSON.parse(settings);
                setSelectedColor(parsedSettings.themeColor || '#bb69f2');
                setDarkMode(parsedSettings.darkMode || false);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const saveAppSettings = async () => {
        try {
            const settings = {
                themeColor: selectedColor,
                darkMode: darkMode,
            };
            await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
            Alert.alert('Успех!', 'Настройки оформления сохранены');
        } catch (error) {
            console.error('Error saving settings:', error);
            Alert.alert('Ошибка', 'Не удалось сохранить настройки');
        }
    };

    const saveUserData = async () => {
        try {
            const updatedData = {
                ...userData,
                name: editedName,
                age: parseInt(editedAge) || 0,
                moimoiName: editedMoiMoiName,
                updatedAt: new Date().toISOString()
            };

            await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
            setUserData(updatedData);
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
                                routes: [{ name: 'Login' }],
                            });
                        } catch (error) {
                            console.error('Error during logout:', error);
                        }
                    },
                },
            ]
        );
    };

    const applyColorTheme = (color) => {
        setSelectedColor(color);
        // Здесь можно добавить логику для динамического изменения темы во всем приложении
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
                    onValueChange: setNotificationsEnabled,
                    type: 'switch',
                    icon: 'notifications'
                },
                {
                    label: 'Ежедневные напоминания',
                    value: dailyReminders,
                    onValueChange: setDailyReminders,
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
                    value: darkMode,
                    onValueChange: setDarkMode,
                    type: 'switch',
                    icon: 'moon-outline'
                },
                {
                    label: 'Анимации',
                    value: animationsEnabled,
                    onValueChange: setAnimationsEnabled,
                    type: 'switch',
                    icon: 'play-outline'
                }
            ]
        },
        {
            title: 'Конфиденциальность',
            icon: 'shield-checkmark-outline',
            items: [
                {
                    label: 'Настройки приватности',
                    description: 'Управление данными и доступом',
                    type: 'link',
                    onPress: () => setShowPrivacyModal(true),
                    icon: 'lock-closed-outline'
                }
            ]
        },
        {
            title: 'О приложении',
            icon: 'information-circle-outline',
            items: [
                {
                    label: 'Версия',
                    value: '1.0.0',
                    type: 'value',
                    icon: 'logo-react'
                }
            ]
        }
    ];

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Настройки</Text>
                    <Text style={styles.headerSubtitle}>Управление приложением и профилем</Text>
                </View>

                {settingsSections.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <Ionicons name={section.icon} size={22} color={selectedColor} />
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                            </View>
                        </View>

                        <View style={styles.sectionContent}>
                            {section.items.map((item, itemIndex) => (
                                <TouchableOpacity
                                    key={itemIndex}
                                    style={styles.settingItem}
                                    onPress={item.onPress}
                                    disabled={!item.onPress}
                                >
                                    <View style={styles.settingLeft}>
                                        {item.icon && (
                                            <Ionicons
                                                name={item.icon}
                                                size={20}
                                                color={selectedColor}
                                                style={styles.settingIcon}
                                            />
                                        )}
                                        <View style={styles.settingTextContainer}>
                                            <Text style={styles.settingLabel}>{item.label}</Text>
                                            {item.description && (
                                                <Text style={styles.settingDescription}>{item.description}</Text>
                                            )}
                                        </View>
                                    </View>

                                    {item.type === 'switch' && (
                                        <Switch
                                            value={item.value}
                                            onValueChange={item.onValueChange}
                                            trackColor={{ false: '#f0f0f0', true: selectedColor }}
                                            thumbColor={item.value ? '#ffffff' : '#f4f3f4'}
                                        />
                                    )}

                                    {item.type === 'value' && (
                                        <Text style={styles.settingValue}>{item.value}</Text>
                                    )}

                                    {(item.type === 'link' || !item.type) && (
                                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
                    <Text style={styles.logoutText}>Выйти из аккаунта</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Модальное окно редактирования профиля */}
            <Modal visible={showEditProfile} animationType="fade" transparent statusBarTranslucent>
                <BlurView intensity={100} tint='dark' style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Редактировать профиль</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Имя</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={20} color={selectedColor} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Введите ваше имя"
                                    value={editedName}
                                    onChangeText={setEditedName}
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Возраст</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="calendar-outline" size={20} color={selectedColor} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Введите ваш возраст"
                                    value={editedAge}
                                    onChangeText={setEditedAge}
                                    keyboardType="numeric"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Имя MoiMoi</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="sparkles-outline" size={20} color={selectedColor} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Имя вашего помощника"
                                    value={editedMoiMoiName}
                                    onChangeText={setEditedMoiMoiName}
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowEditProfile(false)}
                            >
                                <Text style={styles.cancelButtonText}>Отмена</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: selectedColor }]}
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
                    <View style={styles.modalContentLarge}>
                        <Text style={styles.modalTitle}>Внешний вид</Text>
                        <Text style={styles.modalSubtitle}>Настройте оформление приложения</Text>

                        <View style={styles.appearanceSection}>
                            <Text style={styles.appearanceSectionTitle}>Цветовая схема</Text>
                            <View style={styles.colorGrid}>
                                {colorThemes.map((theme) => (
                                    <TouchableOpacity
                                        key={theme.id}
                                        style={[
                                            styles.colorOption,
                                            { backgroundColor: theme.color },
                                            selectedColor === theme.color && styles.colorOptionSelected
                                        ]}
                                        onPress={() => applyColorTheme(theme.color)}
                                    >
                                        {selectedColor === theme.color && (
                                            <Ionicons name="checkmark" size={20} color="white" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Text style={styles.colorNames}>
                                {colorThemes.find(t => t.color === selectedColor)?.name}
                            </Text>
                        </View>

                        <View style={styles.appearanceSection}>
                            <Text style={styles.appearanceSectionTitle}>Тема</Text>
                            <View style={styles.themeOptions}>
                                <TouchableOpacity
                                    style={[styles.themeOption, !darkMode && styles.themeOptionActive]}
                                    onPress={() => setDarkMode(false)}
                                >
                                    <Ionicons name="sunny" size={24} color={!darkMode ? selectedColor : '#ccc'} />
                                    <Text style={[styles.themeText, !darkMode && styles.themeTextActive]}>Светлая</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.themeOption, darkMode && styles.themeOptionActive]}
                                    onPress={() => setDarkMode(true)}
                                >
                                    <Ionicons name="moon" size={24} color={darkMode ? selectedColor : '#ccc'} />
                                    <Text style={[styles.themeText, darkMode && styles.themeTextActive]}>Темная</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.appearanceSection}>
                            <Text style={styles.appearanceSectionTitle}>Эффекты</Text>
                            <View style={styles.modalSettingItem}>
                                <View style={styles.modalSettingLeft}>
                                    <Ionicons name="play-outline" size={20} color={selectedColor} />
                                    <Text style={styles.modalSettingLabel}>Анимации</Text>
                                </View>
                                <Switch
                                    value={animationsEnabled}
                                    onValueChange={setAnimationsEnabled}
                                    trackColor={{ false: '#f0f0f0', true: selectedColor }}
                                    thumbColor={animationsEnabled ? '#ffffff' : '#f4f3f4'}
                                />
                            </View>
                            <View style={styles.modalSettingItem}>
                                <View style={styles.modalSettingLeft}>
                                    <Ionicons name="sparkles-outline" size={20} color={selectedColor} />
                                    <Text style={styles.modalSettingLabel}>Эффекты</Text>
                                </View>
                                <Switch
                                    value={effectsEnabled}
                                    onValueChange={setEffectsEnabled}
                                    trackColor={{ false: '#f0f0f0', true: selectedColor }}
                                    thumbColor={effectsEnabled ? '#ffffff' : '#f4f3f4'}
                                />
                            </View>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowAppearanceModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Отмена</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: selectedColor }]}
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

            {/* Добавьте другие модальные окна по аналогии */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        padding: 25,
        backgroundColor: 'white',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
    },
    section: {
        backgroundColor: 'white',
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
        borderBottomColor: '#f8f9fa',
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
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
        borderBottomColor: '#f8f9fa',
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
        color: '#333',
        fontWeight: '500',
    },
    settingDescription: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    settingValue: {
        fontSize: 14,
        color: '#999',
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        margin: 20,
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ff6b6b',
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
        backgroundColor: 'white',
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
        backgroundColor: 'white',
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
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginLeft: 10,
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
        backgroundColor: '#f8f9fa',
        marginRight: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
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
    appearanceSection: {
        marginBottom: 25,
    },
    appearanceSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
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
        color: '#333',
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
        backgroundColor: '#f8f9fa',
        marginHorizontal: 5,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    themeOptionActive: {
        borderColor: '#bb69f2',
        backgroundColor: '#f0e6ff',
    },
    themeText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    themeTextActive: {
        color: '#bb69f2',
        fontWeight: '600',
    },
    modalSettingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa',
    },
    modalSettingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    modalSettingLabel: {
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
        fontWeight: '500',
    },
});