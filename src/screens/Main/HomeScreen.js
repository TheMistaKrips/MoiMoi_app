import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Modal,
    Alert,
    Animated,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
    const [userName, setUserName] = useState('Пользователь');
    const [tasks, setTasks] = useState([]);
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTask, setNewTask] = useState('');
    const [userData, setUserData] = useState(null);

    // Система огоньков и счастья
    const [firePoints, setFirePoints] = useState(0);
    const [moimoiHappiness, setMoimoiHappiness] = useState(100);
    const [dailyFireLimit, setDailyFireLimit] = useState(5);
    const [firesEarnedToday, setFiresEarnedToday] = useState(0);
    const [activeSkin, setActiveSkin] = useState('default');
    const [streakDays, setStreakDays] = useState(0);

    // Анимации для Duolingo-style эффектов
    const [showCelebration, setShowCelebration] = useState(false);
    const [celebrationType, setCelebrationType] = useState(''); // 'fire' или 'streak'
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        loadUserData();
        loadTasks();
        loadMoimoiState();
        loadStreak();
        startHappinessDecay();
    }, []);

    const loadUserData = async () => {
        try {
            const userDataString = await AsyncStorage.getItem('userData');
            if (userDataString) {
                const data = JSON.parse(userDataString);
                setUserData(data);
                setUserName(data.name || 'Пользователь');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const loadTasks = async () => {
        try {
            const tasksString = await AsyncStorage.getItem('userTasks');
            if (tasksString) {
                setTasks(JSON.parse(tasksString));
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    };

    const saveTasks = async (updatedTasks) => {
        try {
            await AsyncStorage.setItem('userTasks', JSON.stringify(updatedTasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    };

    const loadMoimoiState = async () => {
        try {
            const savedHappiness = await AsyncStorage.getItem('moimoiHappiness');
            const savedFires = await AsyncStorage.getItem('totalFirePoints');
            const today = new Date().toDateString();
            const todayFires = await AsyncStorage.getItem(`fires_${today}`);
            const skin = await AsyncStorage.getItem('activeSkin');

            if (savedHappiness) setMoimoiHappiness(parseInt(savedHappiness));
            if (savedFires) setFirePoints(parseInt(savedFires));
            if (todayFires) setFiresEarnedToday(parseInt(todayFires));
            if (skin) setActiveSkin(skin);
        } catch (error) {
            console.error('Error loading moimoi state:', error);
        }
    };

    const loadStreak = async () => {
        try {
            const streak = await AsyncStorage.getItem('userStreak');
            setStreakDays(streak ? parseInt(streak) : 0);
        } catch (error) {
            console.error('Error loading streak:', error);
        }
    };

    const startHappinessDecay = () => {
        const happinessInterval = setInterval(async () => {
            setMoimoiHappiness(prev => {
                const newHappiness = Math.max(0, prev - 1);
                if (newHappiness % 10 === 0) {
                    AsyncStorage.setItem('moimoiHappiness', newHappiness.toString());
                }
                return newHappiness;
            });
        }, 60000);

        return () => clearInterval(happinessInterval);
    };

    // Анимация празднования
    const showCelebrationAnimation = (type) => {
        setCelebrationType(type);
        setShowCelebration(true);

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            })
        ]).start();

        setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    duration: 500,
                    useNativeDriver: true,
                })
            ]).start(() => {
                setShowCelebration(false);
            });
        }, 2000);
    };

    const toggleTask = async (taskId) => {
        const today = new Date().toDateString();
        const task = tasks.find(t => t.id === taskId);

        // Проверяем, не выполнена ли уже задача сегодня
        const lastCompletion = await AsyncStorage.getItem(`task_${taskId}_last_completion`);
        if (lastCompletion === today && task.completed) {
            Alert.alert('Уже выполнено', 'Эта задача уже выполнена сегодня!');
            return;
        }

        // Проверяем лимит "Огоньков"
        const todayFires = parseInt(await AsyncStorage.getItem(`fires_${today}`) || '0');
        if (todayFires >= dailyFireLimit && !task.completed) {
            Alert.alert('Лимит достигнут', 'Вы уже получили максимальное количество Огоньков сегодня!');
            return;
        }

        const updatedTasks = tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );

        if (!task.completed) {
            // Начисляем огонек
            const newFires = todayFires + 1;
            await AsyncStorage.setItem(`fires_${today}`, newFires.toString());
            await AsyncStorage.setItem('totalFirePoints', (firePoints + 1).toString());

            setFirePoints(prev => prev + 1);
            setFiresEarnedToday(newFires);

            // Увеличиваем счастье
            const newHappiness = Math.min(100, moimoiHappiness + 15);
            setMoimoiHappiness(newHappiness);
            await AsyncStorage.setItem('moimoiHappiness', newHappiness.toString());

            // Обновляем стрик
            const newStreak = await updateStreak();

            // Показываем анимацию
            showCelebrationAnimation('fire');

            // Если это первая задача сегодня - показываем анимацию стрика
            if (newStreak > streakDays) {
                setTimeout(() => {
                    showCelebrationAnimation('streak');
                }, 1500);
            }
        }

        // Сохраняем дату выполнения
        if (!task.completed) {
            await AsyncStorage.setItem(`task_${taskId}_last_completion`, today);
        }

        setTasks(updatedTasks);
        saveTasks(updatedTasks);
    };

    const updateStreak = async () => {
        const today = new Date().toDateString();
        const lastActiveDate = await AsyncStorage.getItem('lastActiveDate');
        const currentStreak = parseInt(await AsyncStorage.getItem('userStreak') || '0');

        let newStreak = currentStreak;

        if (lastActiveDate !== today) {
            if (lastActiveDate) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toDateString();

                if (lastActiveDate === yesterdayStr) {
                    newStreak = currentStreak + 1;
                } else if (lastActiveDate !== today) {
                    newStreak = 1;
                }
            } else {
                newStreak = 1;
            }

            await AsyncStorage.setItem('userStreak', newStreak.toString());
            await AsyncStorage.setItem('lastActiveDate', today);
            setStreakDays(newStreak);
        }

        return newStreak;
    };

    const getMoimoiAnimation = () => {
        // Базовые анимации по уровню счастья
        if (moimoiHappiness >= 80) return require('../../../assets/Animations/moimoi_happy.json');
        if (moimoiHappiness >= 50) return require('../../../assets/Animations/moimoi_normal.json');
        if (moimoiHappiness >= 20) return require('../../../assets/Animations/moimoi_sad.json');
        return require('../../../assets/Animations/moimoi_sleeping.json');
    };

    const CelebrationOverlay = () => {
        if (!showCelebration) return null;

        const celebrationConfig = {
            fire: {
                animation: require('../../../assets/Animations/fire.json'),
                title: '+1 Огонёк!',
                subtitle: 'Отлично! Продолжай в том же духе! 🔥'
            },
            streak: {
                animation: require('../../../assets/Animations/streak.json'),
                title: `Стрик ${streakDays} дней!`,
                subtitle: 'Ты просто машина! 💪'
            }
        };

        const config = celebrationConfig[celebrationType];

        return (
            <Animated.View
                style={[
                    styles.celebrationOverlay,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { scale: scaleAnim },
                            { translateY: slideAnim }
                        ]
                    }
                ]}
            >
                <View style={styles.celebrationContent}>
                    <LottieView
                        source={config.animation}
                        autoPlay
                        loop={false}
                        style={styles.celebrationAnimation}
                    />
                    <Text style={styles.celebrationTitle}>{config.title}</Text>
                    <Text style={styles.celebrationSubtitle}>{config.subtitle}</Text>
                </View>
            </Animated.View>
        );
    };

    const addTask = () => {
        if (newTask.trim()) {
            const task = {
                id: Date.now().toString(),
                text: newTask.trim(),
                completed: false,
                createdAt: new Date().toISOString(),
            };
            const updatedTasks = [...tasks, task];
            setTasks(updatedTasks);
            saveTasks(updatedTasks);
            setNewTask('');
            setShowAddTask(false);
        }
    };

    const deleteTask = (taskId) => {
        Alert.alert(
            'Удалить задачу',
            'Вы уверены, что хотите удалить эту задачу?',
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: () => {
                        const updatedTasks = tasks.filter(task => task.id !== taskId);
                        setTasks(updatedTasks);
                        saveTasks(updatedTasks);
                    },
                },
            ]
        );
    };

    const completedTasks = tasks.filter(task => task.completed).length;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.welcomeText}>Добро пожаловать, {userName}! 👋</Text>
                <Text style={styles.moimoiText}>MoiMoi</Text>
            </View>

            {/* MoiMoi Animation Section */}
            <View style={styles.moimoiContainer}>
                <LottieView
                    source={getMoimoiAnimation()}
                    autoPlay
                    loop
                    style={styles.moimoiAnimation}
                />

                <View style={styles.happinessBar}>
                    <View style={[styles.happinessFill, { width: `${moimoiHappiness}%` }]} />
                </View>
                <Text style={styles.happinessText}>
                    {moimoiHappiness >= 80 ? 'Счастлив! 😊' :
                        moimoiHappiness >= 50 ? 'Нормально 🙂' :
                            moimoiHappiness >= 20 ? 'Грустит 😔' : 'Спит... 💤'}
                </Text>
            </View>

            {/* Stats Section */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>Lvl 1</Text>
                    <Text style={styles.statLabel}>Уровень</Text>
                </View>
                <View style={styles.statItem}>
                    <View style={styles.fireStat}>
                        <Ionicons name="flame" size={20} color="#FF6B35" />
                        <Text style={styles.statValue}>{firePoints}</Text>
                    </View>
                    <Text style={styles.statLabel}>Огоньки</Text>
                </View>
                <View style={styles.statItem}>
                    <View style={styles.streakStat}>
                        <Ionicons name="flash" size={20} color="#FFD93D" />
                        <Text style={styles.statValue}>{streakDays}</Text>
                    </View>
                    <Text style={styles.statLabel}>Стрик</Text>
                </View>
            </View>

            {/* Tasks Section */}
            <View style={styles.tasksContainer}>
                <View style={styles.tasksHeader}>
                    <Text style={styles.tasksTitle}>Сегодняшние задачи</Text>
                    <Text style={styles.tasksCounter}>{completedTasks}/{tasks.length} выполнено</Text>
                </View>

                <ScrollView style={styles.tasksList} showsVerticalScrollIndicator={false}>
                    {tasks.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="checkmark-done-circle-outline" size={64} color="#bb69f2" />
                            <Text style={styles.emptyText}>Пока нет задач</Text>
                            <Text style={styles.emptySubtext}>Добавьте свою первую задачу!</Text>
                        </View>
                    ) : (
                        tasks.map((task) => (
                            <View key={task.id} style={styles.taskItem}>
                                <TouchableOpacity
                                    style={[
                                        styles.checkbox,
                                        task.completed && styles.checkboxCompleted
                                    ]}
                                    onPress={() => toggleTask(task.id)}
                                >
                                    {task.completed && (
                                        <Ionicons name="checkmark" size={16} color="white" />
                                    )}
                                </TouchableOpacity>
                                <Text style={[
                                    styles.taskText,
                                    task.completed && styles.taskTextCompleted
                                ]}>
                                    {task.text}
                                </Text>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => deleteTask(task.id)}
                                >
                                    <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowAddTask(true)}
            >
                <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>

            {/* Add Task Modal */}
            <Modal
                visible={showAddTask}
                animationType="fade"
                transparent
                statusBarTranslucent
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Новая задача</Text>
                        <TextInput
                            style={styles.taskInput}
                            placeholder="Введите задачу..."
                            value={newTask}
                            onChangeText={setNewTask}
                            multiline
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowAddTask(false)}
                            >
                                <Text style={styles.cancelButtonText}>Отмена</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.addButton,
                                    !newTask.trim() && styles.addButtonDisabled
                                ]}
                                onPress={addTask}
                                disabled={!newTask.trim()}
                            >
                                <Text style={styles.addButtonText}>Добавить</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Celebration Overlay */}
            <CelebrationOverlay />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#bb69f2',
    },
    welcomeText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '500',
    },
    moimoiText: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 5,
    },
    moimoiContainer: {
        alignItems: 'center',
        marginTop: -25,
        marginBottom: 10,
    },
    moimoiAnimation: {
        width: 250,
        height: 250,
    },
    happinessBar: {
        width: '80%',
        height: 8,
        backgroundColor: '#e9ecef',
        borderRadius: 4,
        marginTop: 10,
        overflow: 'hidden',
    },
    happinessFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 4,
    },
    happinessText: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 16,
        minWidth: 80,
        shadowColor: '#bb69f2',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    fireStat: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    streakStat: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tasksContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
    },
    tasksHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    tasksTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    tasksCounter: {
        fontSize: 14,
        color: '#bb69f2',
        fontWeight: '600',
    },
    tasksList: {
        flex: 1,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 16,
        fontWeight: '500',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#bb69f2',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#bb69f2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    checkboxCompleted: {
        backgroundColor: '#bb69f2',
        borderColor: '#bb69f2',
    },
    taskText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    taskTextCompleted: {
        textDecorationLine: 'line-through',
        color: '#999',
    },
    deleteButton: {
        padding: 4,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 60,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#69a4fe',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#69a4fe',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
        textAlign: 'center',
    },
    taskInput: {
        borderWidth: 1,
        borderColor: '#e9ecef',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 20,
        backgroundColor: '#f8f9fa',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f8f9fa',
        marginRight: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '500',
    },
    addButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#69a4fe',
        marginLeft: 10,
        alignItems: 'center',
    },
    addButtonDisabled: {
        backgroundColor: '#ccc',
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    celebrationOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    celebrationContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        margin: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    celebrationAnimation: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    celebrationTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    celebrationSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
});