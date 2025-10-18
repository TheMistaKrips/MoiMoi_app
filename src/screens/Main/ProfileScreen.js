import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Modal, TextInput, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileScreen() {
    const { colors, themeColor } = useTheme();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [friends, setFriends] = useState([]);
    const [showAddFriendModal, setShowAddFriendModal] = useState(false);
    const [showAchievementsModal, setShowAchievementsModal] = useState(false);
    const [showMedalsModal, setShowMedalsModal] = useState(false);
    const [friendCode, setFriendCode] = useState('');
    const [streakDays, setStreakDays] = useState(0);
    const navigation = useNavigation();

    useFocusEffect(
        React.useCallback(() => {
            loadUserData();
            loadFriends();
            loadStreak();
        }, [])
    );

    const loadUserData = async () => {
        try {
            const userDataString = await AsyncStorage.getItem('userData');
            if (userDataString) {
                setUserData(JSON.parse(userDataString));
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadFriends = async () => {
        try {
            const friendsData = await AsyncStorage.getItem('userFriends');
            if (friendsData) {
                setFriends(JSON.parse(friendsData));
            }
        } catch (error) {
            console.error('Error loading friends:', error);
        }
    };

    const loadStreak = async () => {
        try {
            const streakData = await AsyncStorage.getItem('userStreak');
            const completedTasks = await AsyncStorage.getItem('completedTasksToday');

            let currentStreak = streakData ? parseInt(streakData) : 0;

            if (completedTasks === 'true') {
                const lastActiveDate = await AsyncStorage.getItem('lastActiveDate');
                const today = new Date().toDateString();

                if (lastActiveDate !== today) {
                    currentStreak += 1;
                    await AsyncStorage.setItem('userStreak', currentStreak.toString());
                    await AsyncStorage.setItem('lastActiveDate', today);
                }
            }

            setStreakDays(currentStreak);
        } catch (error) {
            console.error('Error loading streak:', error);
        }
    };

    const handleSettingsPress = () => {
        navigation.navigate('Settings');
    };

    const copyProfileLink = () => {
        const profileLink = `moimoi://profile/${userData?.id || 'user'}`;
        Alert.alert('Ссылка скопирована!', `Ваша ссылка: ${profileLink}`);
    };

    const addFriend = async () => {
        if (friendCode.trim()) {
            const newFriend = {
                id: Date.now().toString(),
                name: `Друг ${friends.length + 1}`,
                avatar: null,
                joinedDate: new Date().toISOString(),
                level: Math.floor(Math.random() * 10) + 1,
                code: friendCode,
                streak: Math.floor(Math.random() * 30) + 1
            };

            const updatedFriends = [...friends, newFriend];
            setFriends(updatedFriends);
            await AsyncStorage.setItem('userFriends', JSON.stringify(updatedFriends));
            setFriendCode('');
            setShowAddFriendModal(false);
            Alert.alert('Успех!', 'Друг добавлен в ваш список');
        }
    };

    const achievements = [
        { id: 1, name: 'Первая привычка', description: 'Создайте свою первую привычку', completed: true, icon: 'star', progress: 100 },
        { id: 2, name: 'Неделя активности', description: 'Выполняйте задачи 7 дней подряд', completed: true, icon: 'calendar', progress: 100 },
        { id: 3, name: 'Мастер привычек', description: 'Выполните 30 привычек', completed: false, icon: 'trophy', progress: 45 },
        { id: 4, name: 'Социальная бабочка', description: 'Добавьте 5 друзей', completed: false, icon: 'people', progress: 20 },
        { id: 5, name: 'Стратег', description: 'Завершите 10 ударных режимов', completed: false, icon: 'flash', progress: 60 },
        { id: 6, name: 'Легенда', description: 'Достигните 100-дневного стрика', completed: false, icon: 'diamond', progress: 12 },
    ];

    const medals = [
        { id: 1, month: 'Январь', year: '2024', type: 'gold', earned: true, description: 'Золотая медаль за активность' },
        { id: 2, month: 'Февраль', year: '2024', type: 'gold', earned: true, description: 'Золотая медаль за стрик' },
        { id: 3, month: 'Март', year: '2024', type: 'silver', earned: true, description: 'Серебряная медаль за друзей' },
        { id: 4, month: 'Апрель', year: '2024', type: 'bronze', earned: false, description: 'Бронзовая медаль за достижения' },
        { id: 5, month: 'Май', year: '2024', type: 'gold', earned: false, description: 'Золотая медаль за мастерство' },
        { id: 6, month: 'Июнь', year: '2024', type: 'silver', earned: false, description: 'Серебряная медаль за прогресс' },
    ];

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <LottieView
                    source={require('../../../assets/Animations/loading.json')}
                    autoPlay
                    loop
                    style={styles.animation}
                />
                <Text style={[styles.loadingText, { color: colors.text }]}>Загрузка профиля...</Text>
            </View>
        );
    }

    if (!userData) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <LottieView
                    source={require('../../../assets/Animations/Error.json')}
                    autoPlay
                    loop
                    style={styles.animation}
                />
                <Text style={[styles.emptyText, { color: colors.text }]}>Данные профиля не найдены</Text>
                <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: themeColor }]}
                    onPress={loadUserData}
                >
                    <Text style={styles.retryButtonText}>Попробовать снова</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header с аватаром по центру */}
                <View style={[styles.header, { backgroundColor: colors.card }]}>
                    {/* Кнопка настроек в правом верхнем углу */}
                    <TouchableOpacity
                        style={[styles.settingsButton, { backgroundColor: colors.background }]}
                        onPress={handleSettingsPress}
                    >
                        <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <View style={styles.avatarContainer}>
                        {userData.avatar ? (
                            <Image source={{ uri: userData.avatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.background }]}>
                                <Ionicons name="person" size={50} color={themeColor} />
                            </View>
                        )}
                    </View>

                    <View style={styles.userInfo}>
                        <Text style={[styles.userName, { color: colors.text }]}>{userData.name}</Text>
                        <Text style={[styles.userLevel, { color: colors.textSecondary }]}>Уровень 5 • {userData.moimoiName || 'Moi'}</Text>
                    </View>

                    {/* Ударный режим - стрик */}
                    <View style={[styles.streakContainer, { backgroundColor: colors.background, borderColor: '#FF6B35' }]}>
                        <View style={styles.streakContent}>
                            <Ionicons name="flame" size={24} color="#FF6B35" />
                            <View style={styles.streakInfo}>
                                <Text style={[styles.streakDays, { color: '#FF6B35' }]}>{streakDays} дней</Text>
                                <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>Текущий стрик</Text>
                            </View>
                        </View>
                        <View style={styles.streakFire}></View>
                    </View>
                </View>

                {/* Блок с ударными режимами */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Ударные режимы ⚡</Text>
                    <View style={styles.modesContainer}>
                        <TouchableOpacity style={[styles.modeCard, { backgroundColor: colors.card }]}>
                            <View style={[styles.modeIconContainer, { backgroundColor: colors.background }]}>
                                <Ionicons name="flash" size={28} color="#FF6B6B" />
                            </View>
                            <Text style={[styles.modeText, { color: colors.text }]}>Интенсив</Text>
                            <Text style={[styles.modeSubtext, { color: colors.textSecondary }]}>15 мин</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modeCard, { backgroundColor: colors.card }]}>
                            <View style={[styles.modeIconContainer, { backgroundColor: colors.background }]}>
                                <Ionicons name="time" size={28} color="#4ECDC4" />
                            </View>
                            <Text style={[styles.modeText, { color: colors.text }]}>Ежедневный</Text>
                            <Text style={[styles.modeSubtext, { color: colors.textSecondary }]}>5 мин</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modeCard, { backgroundColor: colors.card }]}>
                            <View style={[styles.modeIconContainer, { backgroundColor: colors.background }]}>
                                <Ionicons name="trophy" size={28} color="#FFD93D" />
                            </View>
                            <Text style={[styles.modeText, { color: colors.text }]}>Соревнование</Text>
                            <Text style={[styles.modeSubtext, { color: colors.textSecondary }]}>С друзьями</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Блок с друзьями */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Друзья 👥</Text>
                        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.background }]} onPress={() => setShowAddFriendModal(true)}>
                            <Ionicons name="add" size={20} color={themeColor} />
                            <Text style={[styles.addButtonText, { color: themeColor }]}>Добавить</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={[styles.shareCard, { backgroundColor: colors.card }]} onPress={copyProfileLink}>
                        <View style={[styles.shareIcon, { backgroundColor: colors.background }]}>
                            <Ionicons name="link" size={20} color={themeColor} />
                        </View>
                        <Text style={[styles.shareText, { color: colors.text }]}>Скопировать ссылку на профиль</Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <View style={styles.friendsContainer}>
                        {friends.length > 0 ? (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.friendsScroll}>
                                {friends.map((friend, index) => (
                                    <View key={friend.id} style={styles.friendCircle}>
                                        <View style={[styles.friendAvatar, { backgroundColor: colors.background, borderColor: themeColor }]}>
                                            <Ionicons name="person" size={20} color={colors.textSecondary} />
                                        </View>
                                        <Text style={[styles.friendName, { color: colors.text }]} numberOfLines={1}>
                                            {friend.name}
                                        </Text>
                                        <View style={[styles.friendStreak, { backgroundColor: colors.background }]}>
                                            <Ionicons name="flame" size={12} color="#FF6B35" />
                                            <Text style={[styles.friendStreakText, { color: '#FF6B35' }]}>{friend.streak}</Text>
                                        </View>
                                    </View>
                                ))}
                                {Array.from({ length: Math.max(0, 6 - friends.length) }).map((_, index) => (
                                    <View key={`empty-${index}`} style={styles.emptyFriendCircle}>
                                        <View style={[styles.dashedBorder, { borderColor: colors.textSecondary }]}>
                                            <Ionicons name="person-add" size={20} color={colors.textSecondary} />
                                        </View>
                                        <Text style={[styles.emptyFriendText, { color: colors.textSecondary }]}>Добавить</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        ) : (
                            <View style={[styles.emptyFriends, { backgroundColor: colors.card }]}>
                                <View style={styles.emptyFriendsCircles}>
                                    {Array.from({ length: 3 }).map((_, index) => (
                                        <View key={index} style={styles.emptyFriendCircle}>
                                            <View style={[styles.dashedBorder, { borderColor: colors.textSecondary }]}>
                                                <Ionicons name="person-add" size={20} color={colors.textSecondary} />
                                            </View>
                                        </View>
                                    ))}
                                </View>
                                <Text style={[styles.emptyFriendsText, { color: colors.text }]}>Пока нет друзей</Text>
                                <Text style={[styles.emptyFriendsSubtext, { color: colors.textSecondary }]}>Добавьте друзей для соревнований</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Блок с медалями */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Медали 🏅</Text>
                        <TouchableOpacity onPress={() => setShowMedalsModal(true)}>
                            <Text style={[styles.seeAllText, { color: themeColor }]}>Все медали</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.medalsContainer, { backgroundColor: colors.card }]}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.medalsScroll}>
                            {medals.slice(0, 4).map((medal) => (
                                <View key={medal.id} style={[styles.medalCard, { backgroundColor: colors.background }, !medal.earned && styles.medalCardLocked]}>
                                    <View style={styles.medalIconContainer}>
                                        <Ionicons
                                            name={medal.earned ? "medal" : "lock-closed"}
                                            size={32}
                                            color={medal.earned ?
                                                (medal.type === 'gold' ? '#FFD700' :
                                                    medal.type === 'silver' ? '#C0C0C0' : '#CD7F32') : colors.textSecondary
                                            }
                                        />
                                    </View>
                                    <Text style={[styles.medalMonth, { color: colors.text }]}>{medal.month}</Text>
                                    <Text style={[styles.medalYear, { color: colors.textSecondary }]}>{medal.year}</Text>
                                    <Text style={[styles.medalType, { color: colors.textSecondary }]}>
                                        {medal.earned ? (medal.type === 'gold' ? 'Золото' : medal.type === 'silver' ? 'Серебро' : 'Бронза') : 'Заблокировано'}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* Блок с достижениями */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Достижения 🏆</Text>
                        <TouchableOpacity onPress={() => setShowAchievementsModal(true)}>
                            <Text style={[styles.seeAllText, { color: themeColor }]}>Все достижения</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.achievementsGrid}>
                        {achievements.slice(0, 4).map((achievement) => (
                            <View key={achievement.id} style={[styles.achievementCard, { backgroundColor: colors.card }]}>
                                <View style={[
                                    styles.achievementIcon,
                                    { backgroundColor: achievement.completed ? themeColor : colors.background },
                                    !achievement.completed && styles.achievementIconLocked
                                ]}>
                                    <Ionicons
                                        name={achievement.icon}
                                        size={24}
                                        color={achievement.completed ? 'white' : colors.textSecondary}
                                    />
                                </View>
                                <Text style={[
                                    styles.achievementName,
                                    { color: colors.text },
                                    !achievement.completed && styles.achievementNameLocked
                                ]}>
                                    {achievement.name}
                                </Text>
                                <View style={[styles.progressBar, { backgroundColor: colors.background }]}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { width: `${achievement.progress}%`, backgroundColor: themeColor }
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.progressText, { color: colors.textSecondary }]}>{achievement.progress}%</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Модальное окно добавления друга */}
            <Modal visible={showAddFriendModal} animationType="fade" transparent statusBarTranslucent>
                <BlurView intensity={100} tint='dark' style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Добавить друга</Text>
                        <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Введите код друга чтобы добавить его в свой список</Text>

                        <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                            <Ionicons name="person" size={20} color={themeColor} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Код друга"
                                placeholderTextColor={colors.textSecondary}
                                value={friendCode}
                                onChangeText={setFriendCode}
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.cancelButton, { backgroundColor: colors.background }]}
                                onPress={() => setShowAddFriendModal(false)}
                            >
                                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Отмена</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.addFriendButton, { backgroundColor: themeColor }, !friendCode.trim() && styles.buttonDisabled]}
                                onPress={addFriend}
                                disabled={!friendCode.trim()}
                            >
                                <Text style={styles.addFriendButtonText}>Добавить друга</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </Modal>

            {/* Модальное окно достижений */}
            <Modal visible={showAchievementsModal} animationType="fade" transparent statusBarTranslucent>
                <BlurView intensity={100} tint='dark' style={styles.modalContainer}>
                    <View style={[styles.modalContentLarge, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Все достижения</Text>

                        <ScrollView style={styles.achievementsList} showsVerticalScrollIndicator={false}>
                            {achievements.map((achievement) => (
                                <View key={achievement.id} style={[styles.achievementListItem, { backgroundColor: colors.background }]}>
                                    <View style={[
                                        styles.achievementListIcon,
                                        { backgroundColor: achievement.completed ? themeColor : colors.card },
                                        achievement.completed && styles.achievementListIconCompleted
                                    ]}>
                                        <Ionicons
                                            name={achievement.icon}
                                            size={20}
                                            color={achievement.completed ? 'white' : colors.textSecondary}
                                        />
                                    </View>
                                    <View style={styles.achievementInfo}>
                                        <Text style={[styles.achievementListName, { color: colors.text }]}>{achievement.name}</Text>
                                        <Text style={[styles.achievementListDescription, { color: colors.textSecondary }]}>
                                            {achievement.description}
                                        </Text>
                                        <View style={[styles.progressBar, { backgroundColor: colors.card }]}>
                                            <View
                                                style={[
                                                    styles.progressFill,
                                                    { width: `${achievement.progress}%`, backgroundColor: themeColor }
                                                ]}
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.achievementProgress}>
                                        <Text style={[styles.progressPercentage, { color: colors.text }]}>{achievement.progress}%</Text>
                                        {achievement.completed && (
                                            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                                        )}
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.closeButton, { backgroundColor: themeColor }]}
                            onPress={() => setShowAchievementsModal(false)}
                        >
                            <Text style={styles.closeButtonText}>Закрыть</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </Modal>

            {/* Модальное окно медалей */}
            <Modal visible={showMedalsModal} animationType="fade" transparent statusBarTranslucent>
                <BlurView intensity={100} tint='dark' style={styles.modalContainer}>
                    <View style={[styles.modalContentLarge, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Все медали</Text>
                        <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Ваши ежемесячные награды за активность</Text>

                        <ScrollView style={styles.medalsList} showsVerticalScrollIndicator={false}>
                            <View style={styles.medalsGrid}>
                                {medals.map((medal) => (
                                    <View key={medal.id} style={[styles.medalListItem, { backgroundColor: colors.background }]}>
                                        <View style={styles.medalIconLarge}>
                                            <Ionicons
                                                name={medal.earned ? "medal" : "lock-closed"}
                                                size={40}
                                                color={medal.earned ?
                                                    (medal.type === 'gold' ? '#FFD700' :
                                                        medal.type === 'silver' ? '#C0C0C0' : '#CD7F32') : colors.textSecondary
                                                }
                                            />
                                        </View>
                                        <View style={styles.medalInfo}>
                                            <Text style={[styles.medalListName, { color: colors.text }]}>
                                                {medal.month} {medal.year}
                                            </Text>
                                            <Text style={[styles.medalListDescription, { color: colors.textSecondary }]}>
                                                {medal.description}
                                            </Text>
                                            <Text style={[
                                                styles.medalListType,
                                                {
                                                    color: medal.earned ?
                                                        (medal.type === 'gold' ? '#FFD700' :
                                                            medal.type === 'silver' ? '#C0C0C0' : '#CD7F32') : colors.textSecondary
                                                }
                                            ]}>
                                                {medal.earned ?
                                                    (medal.type === 'gold' ? 'Золотая медаль' :
                                                        medal.type === 'silver' ? 'Серебряная медаль' : 'Бронзовая медаль') :
                                                    'Заблокировано'
                                                }
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.closeButton, { backgroundColor: themeColor }]}
                            onPress={() => setShowMedalsModal(false)}
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
        alignItems: 'center',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        position: 'relative',
    },
    settingsButton: {
        position: 'absolute',
        top: 60,
        right: 25,
        padding: 8,
        borderRadius: 20,
        zIndex: 10,
    },
    avatarContainer: {
        marginBottom: 15,
        marginTop: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfo: {
        alignItems: 'center',
        marginBottom: 20,
    },
    userName: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    userLevel: {
        fontSize: 16,
        fontWeight: '500',
    },
    streakContainer: {
        padding: 15,
        borderRadius: 16,
        width: '100%',
        borderWidth: 2,
        position: 'relative',
        overflow: 'hidden',
    },
    streakContent: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 2,
    },
    streakInfo: {
        marginLeft: 12,
    },
    streakDays: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    streakLabel: {
        fontSize: 14,
    },
    streakFire: {
        position: 'absolute',
        top: -10,
        right: -10,
        width: 60,
        height: 60,
        backgroundColor: '#FF6B35',
        borderRadius: 30,
        opacity: 0.1,
    },
    section: {
        marginTop: 25,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '500',
    },
    modesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modeCard: {
        flex: 1,
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginHorizontal: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    modeIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    modeText: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    modeSubtext: {
        fontSize: 12,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 4,
    },
    shareCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    shareIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    shareText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    friendsContainer: {
        marginBottom: 10,
    },
    friendsScroll: {
        marginHorizontal: -5,
    },
    friendCircle: {
        alignItems: 'center',
        marginHorizontal: 8,
        width: 70,
    },
    friendAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 2,
    },
    friendName: {
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 4,
    },
    friendStreak: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    friendStreakText: {
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 2,
    },
    emptyFriendCircle: {
        alignItems: 'center',
        marginHorizontal: 8,
        width: 70,
    },
    dashedBorder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    emptyFriendText: {
        fontSize: 11,
        textAlign: 'center',
    },
    emptyFriends: {
        alignItems: 'center',
        padding: 30,
        borderRadius: 16,
    },
    emptyFriendsCircles: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyFriendsText: {
        fontSize: 16,
        marginBottom: 5,
    },
    emptyFriendsSubtext: {
        fontSize: 12,
        textAlign: 'center',
    },
    medalsContainer: {
        borderRadius: 16,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    medalsScroll: {
        marginHorizontal: -5,
    },
    medalCard: {
        alignItems: 'center',
        marginHorizontal: 10,
        padding: 15,
        borderRadius: 12,
        minWidth: 100,
    },
    medalCardLocked: {
        opacity: 0.6,
    },
    medalIconContainer: {
        marginBottom: 8,
    },
    medalMonth: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    medalYear: {
        fontSize: 12,
        marginBottom: 4,
    },
    medalType: {
        fontSize: 10,
        fontWeight: '500',
    },
    achievementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    achievementCard: {
        width: '48%',
        padding: 15,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    achievementIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    achievementIconLocked: {
        opacity: 0.7,
    },
    achievementName: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    achievementNameLocked: {
        opacity: 0.6,
    },
    progressBar: {
        width: '100%',
        height: 4,
        borderRadius: 2,
        marginBottom: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    progressText: {
        fontSize: 10,
        fontWeight: '500',
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 25,
    },
    input: {
        flex: 1,
        fontSize: 16,
        marginLeft: 10,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    addFriendButton: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        marginLeft: 10,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    addFriendButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    achievementsList: {
        maxHeight: 400,
    },
    achievementListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 16,
        marginBottom: 10,
    },
    achievementListIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    achievementListIconCompleted: {
        // Стиль для завершенных иконок
    },
    achievementInfo: {
        flex: 1,
    },
    achievementListName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    achievementListDescription: {
        fontSize: 12,
        marginBottom: 8,
    },
    achievementProgress: {
        alignItems: 'flex-end',
    },
    progressPercentage: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    medalsList: {
        maxHeight: 400,
    },
    medalsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    medalListItem: {
        width: '48%',
        alignItems: 'center',
        padding: 15,
        borderRadius: 16,
        marginBottom: 15,
    },
    medalIconLarge: {
        marginBottom: 10,
    },
    medalInfo: {
        alignItems: 'center',
    },
    medalListName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    medalListDescription: {
        fontSize: 11,
        textAlign: 'center',
        marginBottom: 4,
    },
    medalListType: {
        fontSize: 10,
        fontWeight: '500',
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
    animation: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    loadingText: {
        fontSize: 16,
    },
    emptyText: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});