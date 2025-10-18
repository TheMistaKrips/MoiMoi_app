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

    const navigation = useNavigation();

    useEffect(() => {
        loadUserData();
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
                            await AsyncStorage.multiRemove(['isLoggedIn', 'userData', 'hasLaunched']);
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Welcome' }],
                            });
                        } catch (error) {
                            console.error('Error during logout:', error);
                        }
                    },
                },
            ]
        );
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
                    label: 'Мой MoiMoi',
                    description: 'Настройки вашего помощника',
                    type: 'link',
                    onPress: () => { },
                    icon: 'sparkles-outline'
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
                },
                {
                    label: 'Звук уведомлений',
                    value: soundEnabled,
                    onValueChange: setSoundEnabled,
                    type: 'switch',
                    icon: 'volume-medium-outline'
                },
                {
                    label: 'Вибрация',
                    value: vibrationEnabled,
                    onValueChange: setVibrationEnabled,
                    type: 'switch',
                    icon: 'phone-portrait-outline'
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
                },
                {
                    label: 'Эффекты',
                    value: effectsEnabled,
                    onValueChange: setEffectsEnabled,
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
                    label: 'Настройки приватности',
                    description: 'Управление данными и доступом',
                    type: 'link',
                    onPress: () => setShowPrivacyModal(true),
                    icon: 'lock-closed-outline'
                },
                {
                    label: 'Политика конфиденциальности',
                    type: 'link',
                    onPress: () => { },
                    icon: 'document-text-outline'
                },
                {
                    label: 'Условия использования',
                    type: 'link',
                    onPress: () => { },
                    icon: 'reader-outline'
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
                },
                {
                    label: 'Обратная связь',
                    type: 'link',
                    onPress: () => { },
                    icon: 'chatbubble-outline'
                },
                {
                    label: 'Оценить приложение',
                    type: 'link',
                    onPress: () => { },
                    icon: 'star-outline'
                },
                {
                    label: 'Поделиться приложением',
                    type: 'link',
                    onPress: () => { },
                    icon: 'share-social-outline'
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
                                <Ionicons name={section.icon} size={22} color="#bb69f2" />
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
                                                color="#bb69f2"
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
                                            trackColor={{ false: '#f0f0f0', true: '#bb69f2' }}
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
                                <Ionicons name="person-outline" size={20} color="#bb69f2" />
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
                                <Ionicons name="calendar-outline" size={20} color="#bb69f2" />
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
                                <Ionicons name="sparkles-outline" size={20} color="#bb69f2" />
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
                                style={styles.saveButton}
                                onPress={saveUserData}
                            >
                                <Text style={styles.saveButtonText}>Сохранить</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </Modal>

            {/* Модальное окно уведомлений */}
            <Modal visible={showNotificationsModal} animationType="fade" transparent statusBarTranslucent>
                <BlurView intensity={100} tint='dark' style={styles.modalContainer}>
                    <View style={styles.modalContentLarge}>
                        <Text style={styles.modalTitle}>Настройки уведомлений</Text>
                        <Text style={styles.modalSubtitle}>Управление push-уведомлениями и напоминаниями</Text>

                        <View style={styles.modalSection}>
                            <Text style={styles.modalSectionTitle}>Основные уведомления</Text>
                            <View style={styles.modalSettingItem}>
                                <View style={styles.modalSettingLeft}>
                                    <Ionicons name="notifications" size={20} color="#bb69f2" />
                                    <Text style={styles.modalSettingLabel}>Включить уведомления</Text>
                                </View>
                                <Switch
                                    value={notificationsEnabled}
                                    onValueChange={setNotificationsEnabled}
                                    trackColor={{ false: '#f0f0f0', true: '#bb69f2' }}
                                    thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
                                />
                            </View>
                        </View>

                        <View style={styles.modalSection}>
                            <Text style={styles.modalSectionTitle}>Напоминания</Text>
                            <View style={styles.modalSettingItem}>
                                <View style={styles.modalSettingLeft}>
                                    <Ionicons name="alarm-outline" size={20} color="#bb69f2" />
                                    <Text style={styles.modalSettingLabel}>Ежедневные напоминания</Text>
                                </View>
                                <Switch
                                    value={dailyReminders}
                                    onValueChange={setDailyReminders}
                                    trackColor={{ false: '#f0f0f0', true: '#bb69f2' }}
                                    thumbColor={dailyReminders ? '#ffffff' : '#f4f3f4'}
                                />
                            </View>
                        </View>

                        <View style={styles.modalSection}>
                            <Text style={styles.modalSectionTitle}>Звук и вибрация</Text>
                            <View style={styles.modalSettingItem}>
                                <View style={styles.modalSettingLeft}>
                                    <Ionicons name="volume-medium-outline" size={20} color="#bb69f2" />
                                    <Text style={styles.modalSettingLabel}>Звук уведомлений</Text>
                                </View>
                                <Switch
                                    value={soundEnabled}
                                    onValueChange={setSoundEnabled}
                                    trackColor={{ false: '#f0f0f0', true: '#bb69f2' }}
                                    thumbColor={soundEnabled ? '#ffffff' : '#f4f3f4'}
                                />
                            </View>
                            <View style={styles.modalSettingItem}>
                                <View style={styles.modalSettingLeft}>
                                    <Ionicons name="phone-portrait-outline" size={20} color="#bb69f2" />
                                    <Text style={styles.modalSettingLabel}>Вибрация</Text>
                                </View>
                                <Switch
                                    value={vibrationEnabled}
                                    onValueChange={setVibrationEnabled}
                                    trackColor={{ false: '#f0f0f0', true: '#bb69f2' }}
                                    thumbColor={vibrationEnabled ? '#ffffff' : '#f4f3f4'}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowNotificationsModal(false)}
                        >
                            <Text style={styles.closeButtonText}>Готово</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </Modal>

            {/* Модальное окно конфиденциальности */}
            <Modal visible={showPrivacyModal} animationType="fade" transparent statusBarTranslucent>
                <BlurView intensity={100} tint='dark' style={styles.modalContainer}>
                    <View style={styles.modalContentLarge}>
                        <Text style={styles.modalTitle}>Конфиденциальность</Text>
                        <Text style={styles.modalSubtitle}>Управление вашими данными и приватностью</Text>

                        <View style={styles.privacySection}>
                            <Text style={styles.privacySectionTitle}>Данные профиля</Text>
                            <View style={styles.privacyItem}>
                                <Ionicons name="eye-outline" size={20} color="#bb69f2" />
                                <View style={styles.privacyText}>
                                    <Text style={styles.privacyLabel}>Видимость профиля</Text>
                                    <Text style={styles.privacyDescription}>Кто может видеть ваш профиль</Text>
                                </View>
                                <Text style={styles.privacyValue}>Все</Text>
                            </View>
                            <View style={styles.privacyItem}>
                                <Ionicons name="people-outline" size={20} color="#bb69f2" />
                                <View style={styles.privacyText}>
                                    <Text style={styles.privacyLabel}>Друзья</Text>
                                    <Text style={styles.privacyDescription}>Кто может добавлять вас в друзья</Text>
                                </View>
                                <Text style={styles.privacyValue}>Все</Text>
                            </View>
                        </View>

                        <View style={styles.privacySection}>
                            <Text style={styles.privacySectionTitle}>Данные приложения</Text>
                            <View style={styles.privacyItem}>
                                <Ionicons name="analytics-outline" size={20} color="#bb69f2" />
                                <View style={styles.privacyText}>
                                    <Text style={styles.privacyLabel}>Сбор данных</Text>
                                    <Text style={styles.privacyDescription}>Анонимная статистика использования</Text>
                                </View>
                                <Switch
                                    value={true}
                                    onValueChange={() => { }}
                                    trackColor={{ false: '#f0f0f0', true: '#bb69f2' }}
                                />
                            </View>
                            <TouchableOpacity style={styles.privacyItem}>
                                <Ionicons name="download-outline" size={20} color="#bb69f2" />
                                <View style={styles.privacyText}>
                                    <Text style={styles.privacyLabel}>Экспорт данных</Text>
                                    <Text style={styles.privacyDescription}>Скачайте ваши данные</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color="#ccc" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.privacyItem}>
                                <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
                                <View style={styles.privacyText}>
                                    <Text style={[styles.privacyLabel, { color: '#ff6b6b' }]}>Удалить данные</Text>
                                    <Text style={styles.privacyDescription}>Безвозвратно удалить все данные</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color="#ccc" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowPrivacyModal(false)}
                        >
                            <Text style={styles.closeButtonText}>Готово</Text>
                        </TouchableOpacity>
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
                            <Text style={styles.appearanceSectionTitle}>Тема</Text>
                            <View style={styles.themeOptions}>
                                <TouchableOpacity style={[styles.themeOption, !darkMode && styles.themeOptionActive]}>
                                    <Ionicons name="sunny" size={24} color={!darkMode ? '#bb69f2' : '#ccc'} />
                                    <Text style={[styles.themeText, !darkMode && styles.themeTextActive]}>Светлая</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.themeOption, darkMode && styles.themeOptionActive]}>
                                    <Ionicons name="moon" size={24} color={darkMode ? '#bb69f2' : '#ccc'} />
                                    <Text style={[styles.themeText, darkMode && styles.themeTextActive]}>Темная</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.appearanceSection}>
                            <Text style={styles.appearanceSectionTitle}>Цветовая схема</Text>
                            <View style={styles.colorOptions}>
                                {['#bb69f2', '#69a4fe', '#4ECDC4', '#FF6B6B', '#FFD93D'].map((color) => (
                                    <TouchableOpacity
                                        key={color}
                                        style={[styles.colorOption, { backgroundColor: color }]}
                                    />
                                ))}
                            </View>
                        </View>

                        <View style={styles.appearanceSection}>
                            <Text style={styles.appearanceSectionTitle}>Эффекты</Text>
                            <View style={styles.modalSettingItem}>
                                <View style={styles.modalSettingLeft}>
                                    <Ionicons name="play-outline" size={20} color="#bb69f2" />
                                    <Text style={styles.modalSettingLabel}>Анимации</Text>
                                </View>
                                <Switch
                                    value={animationsEnabled}
                                    onValueChange={setAnimationsEnabled}
                                    trackColor={{ false: '#f0f0f0', true: '#bb69f2' }}
                                    thumbColor={animationsEnabled ? '#ffffff' : '#f4f3f4'}
                                />
                            </View>
                            <View style={styles.modalSettingItem}>
                                <View style={styles.modalSettingLeft}>
                                    <Ionicons name="sparkles-outline" size={20} color="#bb69f2" />
                                    <Text style={styles.modalSettingLabel}>Эффекты</Text>
                                </View>
                                <Switch
                                    value={effectsEnabled}
                                    onValueChange={setEffectsEnabled}
                                    trackColor={{ false: '#f0f0f0', true: '#bb69f2' }}
                                    thumbColor={effectsEnabled ? '#ffffff' : '#f4f3f4'}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowAppearanceModal(false)}
                        >
                            <Text style={styles.closeButtonText}>Готово</Text>
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
        backgroundColor: '#bb69f2',
        marginLeft: 10,
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    modalSection: {
        marginBottom: 25,
    },
    modalSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
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
    privacySection: {
        marginBottom: 25,
    },
    privacySectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
    },
    privacyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa',
    },
    privacyText: {
        flex: 1,
        marginLeft: 12,
    },
    privacyLabel: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    privacyDescription: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    privacyValue: {
        fontSize: 14,
        color: '#999',
        fontWeight: '500',
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
    colorOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginHorizontal: 5,
    },
    closeButton: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#bb69f2',
        alignItems: 'center',
        marginTop: 10,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});