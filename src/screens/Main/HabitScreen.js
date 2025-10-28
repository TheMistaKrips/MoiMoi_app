import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    Modal,
    TextInput,
    Dimensions,
    Animated,
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Пресеты для карточек
const CARD_PRESETS = [
    {
        type: 'Утренний ритуал',
        duration: '10-15 мин',
        img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
    },
    {
        type: 'Образовательный',
        duration: '20-30 мин',
        img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    },
    {
        type: 'Медитация',
        duration: '5-10 мин',
        img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
    },
    {
        type: 'Физкультура',
        duration: '15-20 мин',
        img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    },
    {
        type: 'Прогулка',
        duration: '25-40 мин',
        img: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=400&h=300&fit=crop',
    },
    {
        type: 'Обучение',
        duration: '30-45 мин',
        img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
    },
    {
        type: 'Планирование',
        duration: '5-10 мин',
        img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    },
    {
        type: 'Отдых',
        duration: '15-20 мин',
        img: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop',
    },
];

const todayKey = () => new Date().toDateString();

export default function HabitScreen() {
    const { colors, themeColor } = useTheme();

    const [habits, setHabits] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [firePoints, setFirePoints] = useState(0);
    const [streakDays, setStreakDays] = useState(0);

    const [showAddHabit, setShowAddHabit] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('health');

    const [showCelebration, setShowCelebration] = useState(false);
    const [showHabitMenu, setShowHabitMenu] = useState(false);
    const [selectedHabit, setSelectedHabit] = useState(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const menuScaleAnim = useRef(new Animated.Value(0)).current;

    const categories = [
        { id: 'all', name: 'Все', icon: 'apps' },
        { id: 'health', name: 'Здоровье', icon: 'fitness' },
        { id: 'education', name: 'Образование', icon: 'school' },
        { id: 'mindfulness', name: 'Осознанность', icon: 'leaf' },
        { id: 'productivity', name: 'Продуктивность', icon: 'flash' },
    ];

    useEffect(() => {
        loadHabits();
        loadUserStats();
    }, []);

    const loadHabits = async () => {
        try {
            // Загружаем привычки, выбранные пользователем при регистрации
            const userHabitsData = await AsyncStorage.getItem('userHabits');
            if (userHabitsData) {
                const userHabits = JSON.parse(userHabitsData);

                // Добавляем поля для отслеживания прогресса
                const habitsWithProgress = userHabits.map(habit => ({
                    ...habit,
                    completed: false,
                    streak: 0,
                    lastCompleted: null
                }));

                setHabits(habitsWithProgress);
            } else {
                // Если нет сохраненных привычек, используем пустой массив
                setHabits([]);
            }
        } catch (error) {
            console.error('Error loading habits:', error);
            setHabits([]);
        }
    };

    const loadUserStats = async () => {
        try {
            const savedFires = await AsyncStorage.getItem('totalFirePoints');
            const streak = await AsyncStorage.getItem('userStreak');
            if (savedFires) setFirePoints(parseInt(savedFires));
            if (streak) setStreakDays(parseInt(streak));
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
    };

    const saveHabits = async (updatedHabits) => {
        try {
            await AsyncStorage.setItem('userHabits', JSON.stringify(updatedHabits));
            setHabits(updatedHabits);
        } catch (error) {
            console.error('Error saving habits:', error);
        }
    };

    const showCelebrationAnimation = () => {
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

    const showHabitMenuModal = (habit) => {
        setSelectedHabit(habit);
        setShowHabitMenu(true);

        // Анимация появления меню
        menuScaleAnim.setValue(0);
        Animated.spring(menuScaleAnim, {
            toValue: 1,
            friction: 8,
            useNativeDriver: true,
        }).start();
    };

    const hideHabitMenuModal = () => {
        Animated.timing(menuScaleAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setShowHabitMenu(false);
            setSelectedHabit(null);
        });
    };

    const toggleHabitCompletion = async (habitId) => {
        const today = todayKey();
        const habit = habits.find(h => h.id === habitId);

        // Проверяем, не выполнена ли уже привычка сегодня
        const lastCompletion = await AsyncStorage.getItem(`habit_${habitId}_last_completion`);
        if (lastCompletion === today && habit.completed) {
            Alert.alert('Уже выполнено', 'Эта привычка уже выполнена сегодня!');
            return;
        }

        const updatedHabits = habits.map(h =>
            h.id === habitId ? {
                ...h,
                completed: !h.completed,
                streak: !h.completed ? h.streak + 1 : Math.max(0, h.streak - 1)
            } : h
        );

        if (!habit.completed) {
            // Начисляем огонек
            const newFires = firePoints + 1;
            setFirePoints(newFires);
            await AsyncStorage.setItem('totalFirePoints', newFires.toString());
            await AsyncStorage.setItem(`habit_${habitId}_last_completion`, today);

            // Обновляем streak дней
            const lastActiveDate = await AsyncStorage.getItem('lastActiveDate');
            const todayDate = new Date().toDateString();

            if (lastActiveDate !== todayDate) {
                const newStreak = lastActiveDate &&
                    new Date(todayDate).getTime() - new Date(lastActiveDate).getTime() === 86400000
                    ? streakDays + 1
                    : 1;
                setStreakDays(newStreak);
                await AsyncStorage.setItem('userStreak', newStreak.toString());
                await AsyncStorage.setItem('lastActiveDate', todayDate);
            }

            // Показываем анимацию
            showCelebrationAnimation();
        }

        setHabits(updatedHabits);
        await saveHabits(updatedHabits);
    };

    const addCustomHabit = () => {
        if (newHabitName.trim()) {
            const newHabit = {
                id: Date.now().toString(),
                name: newHabitName.trim(),
                icon: 'add-circle-outline',
                selected: true,
                category: selectedCategory,
                completed: false,
                streak: 0,
                custom: true
            };
            const updatedHabits = [...habits, newHabit];
            saveHabits(updatedHabits);
            setNewHabitName('');
            setShowAddHabit(false);
        }
    };

    const deleteHabit = () => {
        if (!selectedHabit) return;

        Alert.alert(
            'Удалить привычку',
            `Вы уверены, что хотите удалить привычку "${selectedHabit.name}"?`,
            [
                {
                    text: 'Отмена',
                    style: 'cancel',
                    onPress: hideHabitMenuModal
                },
                {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: () => {
                        const updatedHabits = habits.filter(habit => habit.id !== selectedHabit.id);
                        saveHabits(updatedHabits);
                        hideHabitMenuModal();
                    },
                },
            ]
        );
    };

    const resetHabitProgress = () => {
        if (!selectedHabit) return;

        Alert.alert(
            'Сбросить прогресс',
            `Сбросить прогресс привычки "${selectedHabit.name}"?`,
            [
                {
                    text: 'Отмена',
                    style: 'cancel',
                    onPress: hideHabitMenuModal
                },
                {
                    text: 'Сбросить',
                    onPress: () => {
                        const updatedHabits = habits.map(h =>
                            h.id === selectedHabit.id ? { ...h, completed: false, streak: 0 } : h
                        );
                        saveHabits(updatedHabits);
                        hideHabitMenuModal();
                    },
                },
            ]
        );
    };

    // Получаем отфильтрованные привычки
    const filteredHabits = useMemo(() => {
        if (activeTab === 'all') return habits;
        return habits.filter(habit => habit.category === activeTab);
    }, [habits, activeTab]);

    const completedCount = filteredHabits.filter(habit => habit.completed).length;

    // Создаем карточки привычек
    const habitCards = useMemo(() => {
        return filteredHabits.map((habit, index) => {
            const preset = CARD_PRESETS[index % CARD_PRESETS.length];
            return {
                id: habit.id,
                habitId: habit.id,
                title: habit.name,
                type: preset.type,
                duration: preset.duration,
                image: preset.img,
                completed: habit.completed,
                streak: habit.streak,
                icon: habit.icon,
                custom: habit.custom,
                category: habit.category
            };
        });
    }, [filteredHabits]);

    // Разделяем на утренние и дневные привычки
    const morningHabits = habitCards.filter((_, index) => index % 2 === 0);
    const afternoonHabits = habitCards.filter((_, index) => index % 2 === 1);

    const buildTimelineState = (list, index) => {
        const item = list[index];
        const completedBefore = list.slice(0, index).every(card => card.completed);
        const isActive = !item.completed && (completedBefore || index === 0);

        return {
            isCompleted: item.completed,
            isActive,
        };
    };

    const CelebrationOverlay = () => {
        if (!showCelebration) return null;

        return (
            <Animated.View
                style={[
                    styles.celebrationOverlay,
                    {
                        opacity: fadeAnim
                    }
                ]}
            >
                <View style={[styles.celebrationContent, { backgroundColor: colors.card }]}>
                    <LottieView
                        source={require('../../../assets/Animations/fire.json')}
                        autoPlay
                        loop={false}
                        style={styles.celebrationAnimation}
                    />
                    <Text style={[styles.celebrationTitle, { color: colors.text }]}>+1 Огонёк!</Text>
                    <Text style={[styles.celebrationSubtitle, { color: colors.textSecondary }]}>
                        Отличная работа! Привычка выполнена! 🔥
                    </Text>
                </View>
            </Animated.View>
        );
    };

    const HabitMenuModal = () => {
        if (!showHabitMenu || !selectedHabit) return null;

        return (
            <Modal
                visible={showHabitMenu}
                transparent
                animationType="fade"
                onRequestClose={hideHabitMenuModal}
            >
                <TouchableOpacity
                    style={styles.menuOverlay}
                    activeOpacity={1}
                    onPress={hideHabitMenuModal}
                >
                    <Animated.View
                        style={[
                            styles.menuContent,
                            {
                                backgroundColor: colors.card,
                                transform: [{ scale: menuScaleAnim }]
                            }
                        ]}
                    >
                        <View style={styles.menuHeader}>
                            <Text style={[styles.menuTitle, { color: colors.text }]}>
                                {selectedHabit.name}
                            </Text>
                            <TouchableOpacity
                                onPress={hideHabitMenuModal}
                                style={styles.menuCloseButton}
                            >
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.menuStats}>
                            <View style={styles.statRow}>
                                <Ionicons name="flame" size={20} color="#FF6B35" />
                                <Text style={[styles.statText, { color: colors.text }]}>
                                    Серия: {selectedHabit.streak} дней
                                </Text>
                            </View>
                            <View style={styles.statRow}>
                                <Ionicons
                                    name={selectedHabit.completed ? "checkmark-circle" : "time"}
                                    size={20}
                                    color={selectedHabit.completed ? "#4CAF50" : colors.textSecondary}
                                />
                                <Text style={[styles.statText, { color: colors.text }]}>
                                    {selectedHabit.completed ? "Выполнено сегодня" : "Не выполнено"}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.menuActions}>
                            <TouchableOpacity
                                style={[styles.menuButton, { backgroundColor: colors.background }]}
                                onPress={resetHabitProgress}
                            >
                                <Ionicons name="refresh" size={20} color={colors.text} />
                                <Text style={[styles.menuButtonText, { color: colors.text }]}>
                                    Сбросить прогресс
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.menuButton, { backgroundColor: '#fff0f0' }]}
                                onPress={deleteHabit}
                            >
                                <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
                                <Text style={[styles.menuButtonText, { color: '#ff6b6b' }]}>
                                    Удалить привычку
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        );
    };

    const renderHabitCard = (item, index, isMorning = true) => {
        const timelineState = buildTimelineState(isMorning ? morningHabits : afternoonHabits, index);

        return (
            <View key={item.id} style={styles.habitRow}>
                {/* Timeline */}
                <View style={styles.timelineContainer}>
                    <View style={[styles.timelineLine, { borderColor: colors.border }]} />
                    <View
                        style={[
                            styles.timelineDot,
                            timelineState.isCompleted && styles.timelineDotCompleted,
                            timelineState.isActive && styles.timelineDotActive,
                            !timelineState.isCompleted && !timelineState.isActive && {
                                backgroundColor: colors.card,
                                borderColor: colors.border
                            },
                        ]}
                    >
                        {timelineState.isCompleted && (
                            <Ionicons name="checkmark" size={16} color="white" />
                        )}
                    </View>
                </View>

                {/* Habit Card */}
                <View style={[styles.habitCard, { backgroundColor: colors.card }]}>
                    <TouchableOpacity
                        style={styles.cardTouchable}
                        onPress={() => toggleHabitCompletion(item.habitId)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.textContent}>
                                <Text style={[styles.habitTitle, { color: colors.text }]}>
                                    {item.title}
                                </Text>
                                <View style={styles.habitMeta}>
                                    <Ionicons
                                        name={item.icon}
                                        size={14}
                                        color={colors.textSecondary}
                                    />
                                    <Text style={[styles.habitType, { color: colors.textSecondary }]}>
                                        {item.type}
                                    </Text>
                                </View>
                                <Text style={[styles.habitDuration, { color: colors.textSecondary }]}>
                                    {item.duration}
                                </Text>

                                {/* Streak indicator */}
                                {item.streak > 0 && (
                                    <View style={styles.streakContainer}>
                                        <Ionicons name="flame" size={12} color="#FF6B35" />
                                        <Text style={[styles.streakText, { color: colors.textSecondary }]}>
                                            {item.streak} дн.
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <Image
                                source={{ uri: item.image }}
                                style={styles.habitImage}
                            />
                        </View>
                    </TouchableOpacity>

                    {/* Menu button */}
                    <TouchableOpacity
                        style={[styles.menuButtonDot, { backgroundColor: colors.background }]}
                        onPress={() => showHabitMenuModal({
                            id: item.habitId,
                            name: item.title,
                            streak: item.streak,
                            completed: item.completed
                        })}
                    >
                        <Ionicons name="ellipsis-horizontal" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>

                    {/* Completion badge */}
                    {item.completed && (
                        <View style={[styles.completionBadge, { backgroundColor: themeColor }]}>
                            <Ionicons name="checkmark" size={14} color="white" />
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar backgroundColor={themeColor} barStyle="light-content" />

            {/* Stats Overview - компактный хедер */}
            <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {habits.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Всего</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {completedCount}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Выполнено</Text>
                </View>
                <View style={styles.statItem}>
                    <View style={styles.fireStat}>
                        <Ionicons name="flame" size={20} color="#FF6B35" />
                        <Text style={[styles.statValue, { color: colors.text }]}>{firePoints}</Text>
                    </View>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Огоньки</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {streakDays}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Дней</Text>
                </View>
            </View>

            {/* Category Tabs - компактные */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesContainer}
                contentContainerStyle={styles.categoriesContent}
            >
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.categoryTab,
                            {
                                backgroundColor: activeTab === category.id ? themeColor : colors.card,
                                height: 44
                            },
                        ]}
                        onPress={() => setActiveTab(category.id)}
                    >
                        <Ionicons
                            name={category.icon}
                            size={16}
                            color={activeTab === category.id ? 'white' : colors.textSecondary}
                        />
                        <Text style={[
                            styles.categoryText,
                            { color: activeTab === category.id ? 'white' : colors.textSecondary }
                        ]}>
                            {category.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Habits Content */}
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            >
                {/* Morning Section */}
                {morningHabits.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Начни свой день
                        </Text>
                        {morningHabits.map((habit, index) =>
                            renderHabitCard(habit, index, true)
                        )}
                    </View>
                )}

                {/* Afternoon Section */}
                {afternoonHabits.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Дневная активность
                        </Text>
                        {afternoonHabits.map((habit, index) =>
                            renderHabitCard(habit, index, false)
                        )}
                    </View>
                )}

                {/* Empty State */}
                {habits.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="leaf-outline" size={64} color={themeColor} />
                        <Text style={[styles.emptyText, { color: colors.text }]}>
                            Пока нет привычек
                        </Text>
                        <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                            Добавьте свои первые привычки для отслеживания прогресса
                        </Text>
                        <TouchableOpacity
                            style={[styles.emptyButton, { backgroundColor: themeColor }]}
                            onPress={() => setShowAddHabit(true)}
                        >
                            <Text style={styles.emptyButtonText}>Добавить первую привычку</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Если есть привычки, но они отфильтрованы */}
                {habits.length > 0 && filteredHabits.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="filter-outline" size={64} color={themeColor} />
                        <Text style={[styles.emptyText, { color: colors.text }]}>
                            Нет привычек в этой категории
                        </Text>
                        <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                            Попробуйте выбрать другую категорию или добавить новые привычки
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: themeColor }]}
                onPress={() => setShowAddHabit(true)}
            >
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>

            {/* Add Habit Modal */}
            <Modal
                visible={showAddHabit}
                animationType="slide"
                transparent
                statusBarTranslucent
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                Новая привычка
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowAddHabit(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={[
                                styles.habitInput,
                                {
                                    backgroundColor: colors.background,
                                    borderColor: colors.border,
                                    color: colors.text
                                }
                            ]}
                            placeholder="Название привычки..."
                            placeholderTextColor={colors.textSecondary}
                            value={newHabitName}
                            onChangeText={setNewHabitName}
                            autoFocus
                        />

                        <Text style={[styles.categoryLabel, { color: colors.text }]}>
                            Категория
                        </Text>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.categorySelection}
                        >
                            {categories.filter(c => c.id !== 'all').map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.categoryOption,
                                        {
                                            backgroundColor: selectedCategory === category.id ?
                                                themeColor : colors.background
                                        }
                                    ]}
                                    onPress={() => setSelectedCategory(category.id)}
                                >
                                    <Ionicons
                                        name={category.icon}
                                        size={16}
                                        color={selectedCategory === category.id ? 'white' : colors.textSecondary}
                                    />
                                    <Text style={[
                                        styles.categoryOptionText,
                                        {
                                            color: selectedCategory === category.id ?
                                                'white' : colors.textSecondary
                                        }
                                    ]}>
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.cancelButton, { backgroundColor: colors.background }]}
                                onPress={() => setShowAddHabit(false)}
                            >
                                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                                    Отмена
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.addButton,
                                    { backgroundColor: themeColor },
                                    !newHabitName.trim() && styles.addButtonDisabled
                                ]}
                                onPress={addCustomHabit}
                                disabled={!newHabitName.trim()}
                            >
                                <Text style={styles.addButtonText}>
                                    Добавить
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Habit Menu Modal */}
            <HabitMenuModal />

            {/* Celebration Overlay */}
            <CelebrationOverlay />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    fireStat: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoriesContainer: {
        marginBottom: 16,
        paddingHorizontal: 20,
        maxHeight: 50,
    },
    categoriesContent: {
        paddingRight: 20,
    },
    categoryTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    habitRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    timelineContainer: {
        width: 40,
        alignItems: 'center',
        position: 'relative',
    },
    timelineLine: {
        position: 'absolute',
        left: 19,
        top: 0,
        bottom: 0,
        borderLeftWidth: 2,
        borderStyle: 'dashed',
    },
    timelineDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        zIndex: 1,
    },
    timelineDotCompleted: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    timelineDotActive: {
        backgroundColor: '#FF6B35',
        borderColor: '#FF6B35',
    },
    habitCard: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        marginLeft: 8,
        minHeight: 120,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        position: 'relative',
    },
    cardTouchable: {
        flex: 1,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    textContent: {
        flex: 1,
        paddingRight: 12,
    },
    habitTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    habitMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    habitType: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
    },
    habitDuration: {
        fontSize: 13,
        fontWeight: '500',
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    streakText: {
        fontSize: 12,
        marginLeft: 4,
    },
    habitImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    menuButton: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    completionBadge: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '500',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    emptyButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        marginTop: 10,
    },
    emptyButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        minHeight: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    habitInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 20,
    },
    categoryLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    categorySelection: {
        marginBottom: 24,
    },
    categoryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
    },
    categoryOptionText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        marginRight: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    addButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        marginLeft: 10,
        alignItems: 'center',
    },
    addButtonDisabled: {
        opacity: 0.5,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    // Habit Menu Modal Styles
    menuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    menuContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    menuTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    menuCloseButton: {
        padding: 4,
    },
    menuStats: {
        marginBottom: 20,
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statText: {
        fontSize: 14,
        marginLeft: 8,
    },
    menuActions: {
        gap: 12,
    },
    menuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    menuButtonDot: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 100,
        gap: 12,
        height: 50,
        width: 50,
    },
    menuButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    celebrationOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgb(255, 255, 255)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    celebrationContent: {
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        margin: 20,
    },
    celebrationAnimation: {
        width: 250,
        height: 250,
        marginBottom: 20,
    },
    celebrationTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    celebrationSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 20,
    },
});