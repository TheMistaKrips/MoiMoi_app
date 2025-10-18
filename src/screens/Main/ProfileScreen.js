import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Modal, TextInput, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { BlurView } from 'expo-blur';

export default function ProfileScreen() {
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

            // Проверяем, выполнены ли сегодня задачи
            if (completedTasks === 'true') {
                const lastActiveDate = await AsyncStorage.getItem('lastActiveDate');
                const today = new Date().toDateString();

                if (lastActiveDate !== today) {
                    // Новый день - увеличиваем streak
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
        const parentNavigation = navigation.getParent();
        if (parentNavigation) {
            parentNavigation.navigate('Settings');
        } else {
            console.warn('Parent navigator not available');
            // Альтернативный вариант навигации
            navigation.navigate('Main', { screen: 'Settings' });
        }
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
            <View style={styles.container}>
                <LottieView
                    source={require('../../../assets/Animations/loading.json')}
                    autoPlay
                    loop
                    style={styles.animation}
                />
                <Text style={styles.loadingText}>Загрузка профиля...</Text>
            </View>
        );
    }

    if (!userData) {
        return (
            <View style={styles.container}>
                <LottieView
                    source={require('../../../assets/Animations/Error.json')}
                    autoPlay
                    loop
                    style={styles.animation}
                />
                <Text style={styles.emptyText}>Данные профиля не найдены</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
                    <Text style={styles.retryButtonText}>Попробовать снова</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header с аватаром по центру */}
                <View style={styles.header}>


                    <View style={styles.avatarContainer}>
                        {userData.avatar ? (
                            <Image source={{ uri: userData.avatar }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Ionicons name="person" size={50} color="#bb69f2" />
                            </View>
                        )}
                    </View>

                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{userData.name}</Text>
                        <Text style={styles.userLevel}>Уровень 5 • {userData.moimoiName || 'Moi'}</Text>
                    </View>

                    {/* Ударный режим - стрик */}
                    <View style={styles.streakContainer}>
                        <View style={styles.streakContent}>
                            <Ionicons name="flame" size={24} color="#FF6B35" />
                            <View style={styles.streakInfo}>
                                <Text style={styles.streakDays}>{streakDays} дней</Text>
                                <Text style={styles.streakLabel}>Текущий стрик</Text>
                            </View>
                        </View>
                        <View style={styles.streakFire}></View>
                    </View>
                </View>

                {/* Блок с ударными режимами */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ударные режимы ⚡</Text>
                    <View style={styles.modesContainer}>
                        <TouchableOpacity style={styles.modeCard}>
                            <View style={styles.modeIconContainer}>
                                <Ionicons name="flash" size={28} color="#FF6B6B" />
                            </View>
                            <Text style={styles.modeText}>Интенсив</Text>
                            <Text style={styles.modeSubtext}>15 мин</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modeCard}>
                            <View style={styles.modeIconContainer}>
                                <Ionicons name="time" size={28} color="#4ECDC4" />
                            </View>
                            <Text style={styles.modeText}>Ежедневный</Text>
                            <Text style={styles.modeSubtext}>5 мин</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modeCard}>
                            <View style={styles.modeIconContainer}>
                                <Ionicons name="trophy" size={28} color="#FFD93D" />
                            </View>
                            <Text style={styles.modeText}>Соревнование</Text>
                            <Text style={styles.modeSubtext}>С друзьями</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Блок с друзьями */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Друзья 👥</Text>
                        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddFriendModal(true)}>
                            <Ionicons name="add" size={20} color="#bb69f2" />
                            <Text style={styles.addButtonText}>Добавить</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.shareCard} onPress={copyProfileLink}>
                        <View style={styles.shareIcon}>
                            <Ionicons name="link" size={20} color="#bb69f2" />
                        </View>
                        <Text style={styles.shareText}>Скопировать ссылку на профиль</Text>
                        <Ionicons name="chevron-forward" size={16} color="#999" />
                    </TouchableOpacity>

                    <View style={styles.friendsContainer}>
                        {friends.length > 0 ? (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.friendsScroll}>
                                {friends.map((friend, index) => (
                                    <View key={friend.id} style={styles.friendCircle}>
                                        <View style={styles.friendAvatar}>
                                            <Ionicons name="person" size={20} color="#666" />
                                        </View>
                                        <Text style={styles.friendName} numberOfLines={1}>
                                            {friend.name}
                                        </Text>
                                        <View style={styles.friendStreak}>
                                            <Ionicons name="flame" size={12} color="#FF6B35" />
                                            <Text style={styles.friendStreakText}>{friend.streak}</Text>
                                        </View>
                                    </View>
                                ))}
                                {/* Пустые кружки для добавления */}
                                {Array.from({ length: Math.max(0, 6 - friends.length) }).map((_, index) => (
                                    <View key={`empty-${index}`} style={styles.emptyFriendCircle}>
                                        <Ionicons name="person-add" size={20} color="#ccc" />
                                        <Text style={styles.emptyFriendText}>Добавить</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        ) : (
                            <View style={styles.emptyFriends}>
                                <View style={styles.emptyFriendsCircles}>
                                    {Array.from({ length: 3 }).map((_, index) => (
                                        <View key={index} style={styles.emptyFriendCircle}>
                                            <View style={styles.dashedBorder}>
                                                <Ionicons name="person-add" size={20} color="#ccc" />
                                            </View>
                                        </View>
                                    ))}
                                </View>
                                <Text style={styles.emptyFriendsText}>Пока нет друзей</Text>
                                <Text style={styles.emptyFriendsSubtext}>Добавьте друзей для соревнований</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Блок с медалями */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Медали 🏅</Text>
                        <TouchableOpacity onPress={() => setShowMedalsModal(true)}>
                            <Text style={styles.seeAllText}>Все медали</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.medalsContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.medalsScroll}>
                            {medals.slice(0, 4).map((medal) => (
                                <View key={medal.id} style={[styles.medalCard, !medal.earned && styles.medalCardLocked]}>
                                    <View style={styles.medalIconContainer}>
                                        <Ionicons
                                            name={medal.earned ? "medal" : "lock-closed"}
                                            size={32}
                                            color={medal.earned ?
                                                (medal.type === 'gold' ? '#FFD700' :
                                                    medal.type === 'silver' ? '#C0C0C0' : '#CD7F32') : '#ccc'
                                            }
                                        />
                                    </View>
                                    <Text style={styles.medalMonth}>{medal.month}</Text>
                                    <Text style={styles.medalYear}>{medal.year}</Text>
                                    <Text style={styles.medalType}>
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
                        <Text style={styles.sectionTitle}>Достижения 🏆</Text>
                        <TouchableOpacity onPress={() => setShowAchievementsModal(true)}>
                            <Text style={styles.seeAllText}>Все достижения</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.achievementsGrid}>
                        {achievements.slice(0, 4).map((achievement) => (
                            <View key={achievement.id} style={styles.achievementCard}>
                                <View style={[
                                    styles.achievementIcon,
                                    !achievement.completed && styles.achievementIconLocked
                                ]}>
                                    <Ionicons
                                        name={achievement.icon}
                                        size={24}
                                        color={achievement.completed ? 'white' : '#ccc'}
                                    />
                                </View>
                                <Text style={[
                                    styles.achievementName,
                                    !achievement.completed && styles.achievementNameLocked
                                ]}>
                                    {achievement.name}
                                </Text>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { width: `${achievement.progress}%` }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.progressText}>{achievement.progress}%</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Модальное окно добавления друга */}
            <Modal visible={showAddFriendModal} animationType="fade" transparent statusBarTranslucent>
                <BlurView intensity={100} tint='dark' style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Добавить друга</Text>
                        <Text style={styles.modalSubtitle}>Введите код друга чтобы добавить его в свой список</Text>

                        <View style={styles.inputContainer}>
                            <Ionicons name="person" size={20} color="#bb69f2" />
                            <TextInput
                                style={styles.input}
                                placeholder="Код друга"
                                value={friendCode}
                                onChangeText={setFriendCode}
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowAddFriendModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Отмена</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.addFriendButton, !friendCode.trim() && styles.buttonDisabled]}
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
                    <View style={styles.modalContentLarge}>
                        <Text style={styles.modalTitle}>Все достижения</Text>

                        <ScrollView style={styles.achievementsList} showsVerticalScrollIndicator={false}>
                            {achievements.map((achievement) => (
                                <View key={achievement.id} style={styles.achievementListItem}>
                                    <View style={[
                                        styles.achievementListIcon,
                                        achievement.completed && styles.achievementListIconCompleted
                                    ]}>
                                        <Ionicons
                                            name={achievement.icon}
                                            size={20}
                                            color={achievement.completed ? 'white' : '#ccc'}
                                        />
                                    </View>
                                    <View style={styles.achievementInfo}>
                                        <Text style={styles.achievementListName}>{achievement.name}</Text>
                                        <Text style={styles.achievementListDescription}>
                                            {achievement.description}
                                        </Text>
                                        <View style={styles.progressBar}>
                                            <View
                                                style={[
                                                    styles.progressFill,
                                                    { width: `${achievement.progress}%` }
                                                ]}
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.achievementProgress}>
                                        <Text style={styles.progressPercentage}>{achievement.progress}%</Text>
                                        {achievement.completed && (
                                            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                                        )}
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.closeButton}
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
                    <View style={styles.modalContentLarge}>
                        <Text style={styles.modalTitle}>Все медали</Text>
                        <Text style={styles.modalSubtitle}>Ваши ежемесячные награды за активность</Text>

                        <ScrollView style={styles.medalsList} showsVerticalScrollIndicator={false}>
                            <View style={styles.medalsGrid}>
                                {medals.map((medal) => (
                                    <View key={medal.id} style={styles.medalListItem}>
                                        <View style={styles.medalIconLarge}>
                                            <Ionicons
                                                name={medal.earned ? "medal" : "lock-closed"}
                                                size={40}
                                                color={medal.earned ?
                                                    (medal.type === 'gold' ? '#FFD700' :
                                                        medal.type === 'silver' ? '#C0C0C0' : '#CD7F32') : '#ccc'
                                                }
                                            />
                                        </View>
                                        <View style={styles.medalInfo}>
                                            <Text style={styles.medalListName}>
                                                {medal.month} {medal.year}
                                            </Text>
                                            <Text style={styles.medalListDescription}>
                                                {medal.description}
                                            </Text>
                                            <Text style={[
                                                styles.medalListType,
                                                {
                                                    color: medal.earned ?
                                                        (medal.type === 'gold' ? '#FFD700' :
                                                            medal.type === 'silver' ? '#C0C0C0' : '#CD7F32') : '#ccc'
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
                            style={styles.closeButton}
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
        backgroundColor: '#f8f9fa',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        backgroundColor: 'white',
        padding: 25,
        alignItems: 'center',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    settingsButton: {
        position: 'absolute',
        top: 60,
        right: 25,
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
    },
    avatarContainer: {
        marginBottom: 15,
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
        backgroundColor: '#f0e6ff',
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
        color: '#333',
        marginBottom: 5,
    },
    userLevel: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    streakContainer: {
        backgroundColor: '#FFF5F0',
        padding: 15,
        borderRadius: 16,
        width: '100%',
        borderWidth: 2,
        borderColor: '#FF6B35',
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
        color: '#FF6B35',
    },
    streakLabel: {
        fontSize: 14,
        color: '#666',
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
        color: '#333',
        marginBottom: 10,
    },
    seeAllText: {
        color: '#bb69f2',
        fontSize: 14,
        fontWeight: '500',
    },
    modesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modeCard: {
        flex: 1,
        backgroundColor: 'white',
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
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    modeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    modeSubtext: {
        fontSize: 12,
        color: '#666',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0e6ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    addButtonText: {
        color: '#bb69f2',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 4,
    },
    shareCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
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
        backgroundColor: '#f0e6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    shareText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
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
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#bb69f2',
    },
    friendName: {
        fontSize: 11,
        fontWeight: '500',
        color: '#333',
        textAlign: 'center',
        marginBottom: 4,
    },
    friendStreak: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    friendStreakText: {
        fontSize: 10,
        color: '#FF6B35',
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
        borderColor: '#ccc',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    emptyFriendText: {
        fontSize: 11,
        color: '#999',
        textAlign: 'center',
    },
    emptyFriends: {
        alignItems: 'center',
        padding: 30,
        backgroundColor: 'white',
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
        color: '#666',
        marginBottom: 5,
    },
    emptyFriendsSubtext: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
    medalsContainer: {
        backgroundColor: 'white',
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
        backgroundColor: '#f8f9fa',
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
        color: '#333',
        marginBottom: 2,
    },
    medalYear: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    medalType: {
        fontSize: 10,
        color: '#999',
        fontWeight: '500',
    },
    achievementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    achievementCard: {
        width: '48%',
        backgroundColor: 'white',
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
        backgroundColor: '#bb69f2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    achievementIconLocked: {
        backgroundColor: '#f0f0f0',
    },
    achievementName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    achievementNameLocked: {
        color: '#ccc',
    },
    progressBar: {
        width: '100%',
        height: 4,
        backgroundColor: '#f0f0f0',
        borderRadius: 2,
        marginBottom: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#bb69f2',
        borderRadius: 2,
    },
    progressText: {
        fontSize: 10,
        color: '#666',
        fontWeight: '500',
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 25,
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
    addFriendButton: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#bb69f2',
        marginLeft: 10,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
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
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        marginBottom: 10,
    },
    achievementListIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    achievementListIconCompleted: {
        backgroundColor: '#bb69f2',
    },
    achievementInfo: {
        flex: 1,
    },
    achievementListName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    achievementListDescription: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    achievementProgress: {
        alignItems: 'flex-end',
    },
    progressPercentage: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
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
        backgroundColor: '#f8f9fa',
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
        color: '#333',
        marginBottom: 4,
    },
    medalListDescription: {
        fontSize: 11,
        color: '#666',
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
        backgroundColor: '#bb69f2',
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
        color: '#666',
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#bb69f2',
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