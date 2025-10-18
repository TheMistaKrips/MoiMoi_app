import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    Image,
    Animated,
    Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const defaultHabits = [
    { id: '1', name: 'Упражнения', icon: 'fitness', selected: false, category: 'health' },
    { id: '2', name: 'Чтение', icon: 'book', selected: false, category: 'education' },
    { id: '3', name: 'Медитация', icon: 'leaf', selected: false, category: 'mindfulness' },
    { id: '4', name: 'Пить воду', icon: 'water', selected: false, category: 'health' },
    { id: '5', name: 'Сон', icon: 'moon', selected: false, category: 'health' },
    { id: '6', name: 'Учеба', icon: 'school', selected: false, category: 'education' },
    { id: '7', name: 'Прогулка', icon: 'walk', selected: false, category: 'health' },
    { id: '8', name: 'Планирование', icon: 'calendar', selected: false, category: 'productivity' },
];

export default function CompleteOnboardingScreen() {
    const navigation = useNavigation();
    const { updateUserData } = useTheme();
    const [currentStep, setCurrentStep] = useState(0);
    const [userData, setUserData] = useState({
        name: '',
        age: 25,
        weight: 70,
        height: 175,
        moimoiName: 'Moi',
        avatar: null,
        habits: [],
        hasCompletedOnboarding: true,
        registeredAt: new Date().toISOString()
    });

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    const ageScrollRef = useRef(null);
    const weightScrollRef = useRef(null);
    const heightScrollRef = useRef(null);

    const steps = [
        { title: 'Добро пожаловать! 👋', subtitle: 'Создадим твой идеальный профиль' },
        { title: 'Как тебя зовут? ✨', subtitle: 'Как мы можем к тебе обращаться?' },
        { title: 'Твой возраст 🎂', subtitle: 'Выбери свой возраст' },
        { title: 'Твой вес 💪', subtitle: 'Мы сделаем тебе комплимент!' },
        { title: 'Твой рост 📏', subtitle: 'Для точных расчетов и рекомендаций' },
        { title: 'Выбери привычки 🎯', subtitle: 'Что будем улучшать вместе?' },
        { title: 'Твой MoiMoi 🌟', subtitle: 'Как назовешь своего помощника?' },
        { title: 'Готово! 🎉', subtitle: 'Начинаем наше путешествие!' }
    ];

    const updateUserDataState = (field, value) => {
        setUserData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const animateStep = (direction = 'next') => {
        fadeAnim.setValue(0);
        slideAnim.setValue(direction === 'next' ? 50 : -50);

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            })
        ]).start();
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            animateStep('next');
            setCurrentStep(prev => prev + 1);
        } else {
            saveAllData();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            animateStep('prev');
            setCurrentStep(prev => prev - 1);
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
            updateUserDataState('avatar', result.assets[0].uri);
        }
    };

    const toggleHabit = (habitId) => {
        const updatedHabits = defaultHabits.map(habit =>
            habit.id === habitId ? { ...habit, selected: !habit.selected } : habit
        );

        const selectedHabits = updatedHabits.filter(h => h.selected);
        updateUserDataState('habits', selectedHabits);
    };

    const getWeightCompliment = (weight) => {
        if (weight < 50) return "Ты невесомо прекрасна! ✨";
        if (weight < 60) return "Идеальные формы! 🌸";
        if (weight < 70) return "Спортивное телосложение! 💪";
        if (weight < 80) return "Сила и грация! 🐆";
        if (weight < 90) return "Мощь и уверенность! 🦁";
        return "Великолепная мощь! 🐘";
    };

    const getAgeRecommendation = (age) => {
        if (age < 18) return "Молодость - время возможностей! 🌟";
        if (age < 25) return "Идеальное время для развития! 🚀";
        if (age < 35) return "Расцвет сил и энергии! 💫";
        if (age < 45) return "Опыт и мудрость! 📚";
        if (age < 55) return "Золотой возраст! 🏆";
        return "Жизненная мудрость! 👑";
    };

    const getHeightComment = (height) => {
        if (height < 160) return "Изящная и грациозная! 🦋";
        if (height < 170) return "Идеальные пропорции! 🌸";
        if (height < 180) return "Статная и величественная! 👑";
        if (height < 190) return "Впечатляющий рост! 🌟";
        return "Великолепная стать! 🏔️";
    };

    const calculateBMI = (weight, height) => {
        const heightInMeters = height / 100;
        return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    };

    const getBMICategory = (bmi) => {
        if (bmi < 18.5) return { category: 'Недостаточный вес', color: '#FF6B6B', advice: 'Рекомендуем увеличить калорийность питания' };
        if (bmi < 25) return { category: 'Нормальный вес', color: '#4CAF50', advice: 'Отличная форма! Продолжайте в том же духе' };
        if (bmi < 30) return { category: 'Избыточный вес', color: '#FFA500', advice: 'Рекомендуем больше физической активности' };
        return { category: 'Ожирение', color: '#FF6B6B', advice: 'Рекомендуем консультацию специалиста' };
    };

    const AgeSelector = () => {
        const ages = Array.from({ length: 83 }, (_, i) => i + 18);

        const scrollToAge = (age) => {
            const index = ages.indexOf(age);
            if (ageScrollRef.current && index !== -1) {
                ageScrollRef.current.scrollTo({ y: index * 60, animated: true });
            }
        };

        return (
            <View style={styles.selectorContainer}>
                <View style={styles.pickerContainer}>
                    <View style={styles.selectionIndicator} />
                    <ScrollView
                        ref={ageScrollRef}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.pickerContent}
                        snapToInterval={60}
                        decelerationRate="fast"
                    >
                        {ages.map((age) => (
                            <TouchableOpacity
                                key={age}
                                style={[
                                    styles.pickerItem,
                                    userData.age === age && styles.pickerItemSelected
                                ]}
                                onPress={() => {
                                    updateUserDataState('age', age);
                                    scrollToAge(age);
                                }}
                            >
                                <Text style={[
                                    styles.pickerText,
                                    userData.age === age && styles.pickerTextSelected
                                ]}>
                                    {age}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.recommendationBox}>
                    <Ionicons name="sparkles" size={20} color="#FFD700" />
                    <Text style={styles.recommendationText}>
                        {getAgeRecommendation(userData.age)}
                    </Text>
                </View>
            </View>
        );
    };

    const WeightSelector = () => {
        const weights = Array.from({ length: 121 }, (_, i) => i + 40);

        const scrollToWeight = (weight) => {
            const index = weights.indexOf(weight);
            if (weightScrollRef.current && index !== -1) {
                weightScrollRef.current.scrollTo({ y: index * 60, animated: true });
            }
        };

        return (
            <View style={styles.selectorContainer}>
                <View style={styles.pickerContainer}>
                    <View style={styles.selectionIndicator} />
                    <ScrollView
                        ref={weightScrollRef}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.pickerContent}
                        snapToInterval={60}
                        decelerationRate="fast"
                    >
                        {weights.map((weight) => (
                            <TouchableOpacity
                                key={weight}
                                style={[
                                    styles.pickerItem,
                                    userData.weight === weight && styles.pickerItemSelected
                                ]}
                                onPress={() => {
                                    updateUserDataState('weight', weight);
                                    scrollToWeight(weight);
                                }}
                            >
                                <Text style={[
                                    styles.pickerText,
                                    userData.weight === weight && styles.pickerTextSelected
                                ]}>
                                    {weight}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={[styles.recommendationBox, styles.complimentBox]}>
                    <Ionicons name="heart" size={20} color="#FF6B6B" />
                    <Text style={styles.recommendationText}>
                        {getWeightCompliment(userData.weight)}
                    </Text>
                </View>
            </View>
        );
    };

    const HeightSelector = () => {
        const heights = Array.from({ length: 71 }, (_, i) => i + 140);

        const scrollToHeight = (height) => {
            const index = heights.indexOf(height);
            if (heightScrollRef.current && index !== -1) {
                heightScrollRef.current.scrollTo({ y: index * 60, animated: true });
            }
        };

        return (
            <View style={styles.selectorContainer}>
                <View style={styles.pickerContainer}>
                    <View style={styles.selectionIndicator} />
                    <ScrollView
                        ref={heightScrollRef}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.pickerContent}
                        snapToInterval={60}
                        decelerationRate="fast"
                    >
                        {heights.map((height) => (
                            <TouchableOpacity
                                key={height}
                                style={[
                                    styles.pickerItem,
                                    userData.height === height && styles.pickerItemSelected
                                ]}
                                onPress={() => {
                                    updateUserDataState('height', height);
                                    scrollToHeight(height);
                                }}
                            >
                                <Text style={[
                                    styles.pickerText,
                                    userData.height === height && styles.pickerTextSelected
                                ]}>
                                    {height}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={[styles.recommendationBox, styles.heightBox]}>
                    <Ionicons name="trending-up" size={20} color="#4ECDC4" />
                    <Text style={styles.recommendationText}>
                        {getHeightComment(userData.height)}
                    </Text>
                </View>

                {/* Расчет ИМТ */}
                {userData.weight > 0 && userData.height > 0 && (
                    <View style={styles.bmiContainer}>
                        <Text style={styles.bmiTitle}>Индекс массы тела (ИМТ)</Text>
                        <Text style={styles.bmiValue}>
                            {calculateBMI(userData.weight, userData.height)}
                        </Text>
                        {(() => {
                            const bmi = calculateBMI(userData.weight, userData.height);
                            const bmiCategory = getBMICategory(bmi);
                            return (
                                <>
                                    <Text style={[styles.bmiCategory, { color: bmiCategory.color }]}>
                                        {bmiCategory.category}
                                    </Text>
                                    <Text style={styles.bmiAdvice}>{bmiCategory.advice}</Text>
                                </>
                            );
                        })()}
                    </View>
                )}
            </View>
        );
    };

    const saveAllData = async () => {
        if (!userData.name.trim()) {
            Alert.alert('Ошибка', 'Пожалуйста, введите ваше имя');
            setCurrentStep(1);
            return;
        }

        try {
            // Сохраняем в AsyncStorage
            await AsyncStorage.setItem('userData', JSON.stringify(userData));

            // Обновляем в контексте темы
            updateUserData(userData);

            const tasks = userData.habits.map(habit => ({
                id: habit.id,
                text: habit.name,
                completed: false,
                createdAt: new Date().toISOString(),
                category: habit.category
            }));
            await AsyncStorage.setItem('userTasks', JSON.stringify(tasks));
            await AsyncStorage.setItem('userHabits', JSON.stringify(userData.habits));
            await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
            await AsyncStorage.setItem('isLoggedIn', 'true');

            // Инициализируем начальные значения
            await AsyncStorage.setItem('totalFirePoints', '0');
            await AsyncStorage.setItem('moimoiHappiness', '100');
            await AsyncStorage.setItem('activeSkin', 'default');
            await AsyncStorage.setItem('ownedSkins', JSON.stringify(['default']));

            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });

        } catch (error) {
            console.error('Error saving data:', error);
            Alert.alert('Ошибка', 'Не удалось сохранить данные');
        }
    };

    const renderStepContent = () => {
        const animatedStyle = {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
        };

        switch (currentStep) {
            case 0:
                return (
                    <Animated.View style={[styles.stepContent, animatedStyle]}>
                        <View style={styles.welcomeContainer}>
                            <Ionicons name="sparkles" size={80} color="#FFD700" />
                            <Text style={styles.welcomeText}>
                                Привет! Я твой MoiMoi - персональный помощник для развития привычек и достижения целей!
                            </Text>
                        </View>
                    </Animated.View>
                );

            case 1:
                return (
                    <Animated.View style={[styles.stepContent, animatedStyle]}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Твое имя *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Например, Алексей"
                                value={userData.name}
                                onChangeText={(text) => updateUserDataState('name', text)}
                                placeholderTextColor="rgba(255,255,255,0.6)"
                                autoFocus
                            />
                        </View>
                    </Animated.View>
                );

            case 2:
                return (
                    <Animated.View style={[styles.stepContent, animatedStyle]}>
                        <AgeSelector />
                    </Animated.View>
                );

            case 3:
                return (
                    <Animated.View style={[styles.stepContent, animatedStyle]}>
                        <WeightSelector />
                    </Animated.View>
                );

            case 4:
                return (
                    <Animated.View style={[styles.stepContent, animatedStyle]}>
                        <HeightSelector />
                    </Animated.View>
                );

            case 5:
                return (
                    <Animated.View style={[styles.stepContent, animatedStyle]}>
                        <ScrollView
                            style={styles.habitsContainer}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.habitsGrid}>
                                {defaultHabits.map((habit) => (
                                    <TouchableOpacity
                                        key={habit.id}
                                        style={[
                                            styles.habitCard,
                                            habit.selected && styles.habitCardSelected
                                        ]}
                                        onPress={() => toggleHabit(habit.id)}
                                    >
                                        <View style={[
                                            styles.habitIcon,
                                            habit.selected && styles.habitIconSelected
                                        ]}>
                                            <Ionicons
                                                name={habit.icon}
                                                size={28}
                                                color={habit.selected ? '#fff' : '#667eea'}
                                            />
                                        </View>
                                        <Text style={[
                                            styles.habitName,
                                            habit.selected && styles.habitNameSelected
                                        ]}>
                                            {habit.name}
                                        </Text>
                                        {habit.selected && (
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={20}
                                                color="#4CAF50"
                                                style={styles.checkIcon}
                                            />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                        <Text style={styles.habitsCounter}>
                            Выбрано: {userData.habits.length} привычек
                        </Text>
                    </Animated.View>
                );

            case 6:
                return (
                    <Animated.View style={[styles.stepContent, animatedStyle]}>
                        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                            {userData.avatar ? (
                                <Image source={{ uri: userData.avatar }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Ionicons name="person-outline" size={40} color="#fff" />
                                    <Text style={styles.avatarText}>Добавить фото</Text>
                                </View>
                            )}
                            <View style={styles.avatarOverlay}>
                                <Ionicons name="camera" size={20} color="white" />
                            </View>
                        </TouchableOpacity>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Имя твоего MoiMoi</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Например, Спарки"
                                value={userData.moimoiName}
                                onChangeText={(text) => updateUserDataState('moimoiName', text)}
                                placeholderTextColor="rgba(255,255,255,0.6)"
                            />
                        </View>
                    </Animated.View>
                );

            case 7:
                const bmi = calculateBMI(userData.weight, userData.height);
                const bmiCategory = getBMICategory(bmi);

                return (
                    <Animated.View style={[styles.stepContent, animatedStyle]}>
                        <View style={styles.finalStep}>
                            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
                            <Text style={styles.finalTitle}>Великолепно! 🎉</Text>
                            <Text style={styles.finalSubtitle}>
                                {userData.name}, твой MoiMoi "{userData.moimoiName}" готов к приключениям!
                            </Text>

                            <View style={styles.summaryBox}>
                                <Text style={styles.summaryTitle}>Твой профиль:</Text>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Имя:</Text>
                                    <Text style={styles.summaryValue}>{userData.name}</Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Возраст:</Text>
                                    <Text style={styles.summaryValue}>{userData.age} лет</Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Вес:</Text>
                                    <Text style={styles.summaryValue}>{userData.weight} кг</Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Рост:</Text>
                                    <Text style={styles.summaryValue}>{userData.height} см</Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>ИМТ:</Text>
                                    <Text style={[styles.summaryValue, { color: bmiCategory.color }]}>
                                        {bmi} ({bmiCategory.category})
                                    </Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Привычки:</Text>
                                    <Text style={styles.summaryValue}>{userData.habits.length} выбрано</Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>MoiMoi:</Text>
                                    <Text style={styles.summaryValue}>{userData.moimoiName}</Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                );

            default:
                return null;
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1: return userData.name.trim().length > 0;
            case 5: return userData.habits.length > 0;
            default: return true;
        }
    };

    return (
        <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.container}
        >
            <View style={styles.header}>
                {currentStep > 0 && (
                    <TouchableOpacity style={styles.backButton} onPress={prevStep}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                )}

                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${((currentStep + 1) / steps.length) * 100}%` }
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {currentStep + 1} / {steps.length}
                    </Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{steps[currentStep].title}</Text>
                    <Text style={styles.subtitle}>{steps[currentStep].subtitle}</Text>
                </View>

                {renderStepContent()}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        !canProceed() && styles.continueButtonDisabled
                    ]}
                    onPress={nextStep}
                    disabled={!canProceed()}
                >
                    <Text style={styles.continueButtonText}>
                        {currentStep === steps.length - 1 ? 'Начать! 🚀' : 'Далее'}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
    },
    backButton: {
        padding: 8,
        marginRight: 10,
    },
    progressContainer: {
        flex: 1,
    },
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 3,
    },
    progressText: {
        color: 'white',
        fontSize: 12,
        opacity: 0.8,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        lineHeight: 22,
    },
    stepContent: {
        flex: 1,
        justifyContent: 'center',
    },
    welcomeContainer: {
        alignItems: 'center',
        padding: 20,
    },
    welcomeText: {
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
        lineHeight: 24,
        marginTop: 20,
    },
    inputContainer: {
        marginBottom: 30,
    },
    label: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: 'white',
    },
    input: {
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: 16,
        padding: 20,
        fontSize: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        color: 'white',
    },
    selectorContainer: {
        alignItems: 'center',
    },
    pickerContainer: {
        height: 200,
        width: 120,
        position: 'relative',
        marginBottom: 30,
    },
    pickerContent: {
        paddingVertical: 80,
    },
    selectionIndicator: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        marginTop: -30,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    pickerItem: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 2,
    },
    pickerItemSelected: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 8,
    },
    pickerText: {
        fontSize: 20,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '500',
    },
    pickerTextSelected: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 24,
    },
    recommendationBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
    },
    complimentBox: {
        backgroundColor: 'rgba(255,107,107,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255,107,107,0.3)',
    },
    heightBox: {
        backgroundColor: 'rgba(78,205,196,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(78,205,196,0.3)',
    },
    recommendationText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 10,
        flex: 1,
    },
    bmiContainer: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    bmiTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    bmiValue: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    bmiCategory: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    bmiAdvice: {
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 18,
    },
    habitsContainer: {
        flex: 1,
        marginBottom: 20,
    },
    habitsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    habitCard: {
        width: '48%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 15,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
    },
    habitCardSelected: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderColor: 'rgba(255,255,255,0.5)',
    },
    habitIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    habitIconSelected: {
        backgroundColor: '#667eea',
    },
    habitName: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
    },
    habitNameSelected: {
        color: 'white',
        fontWeight: '600',
    },
    checkIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    habitsCounter: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 40,
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
        borderStyle: 'dashed',
    },
    avatarText: {
        marginTop: 8,
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },
    avatarOverlay: {
        position: 'absolute',
        bottom: 0,
        right: '35%',
        backgroundColor: '#69a4fe',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.8)',
    },
    finalStep: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    finalTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginVertical: 20,
    },
    finalSubtitle: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    summaryBox: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        padding: 20,
        borderRadius: 20,
        width: '100%',
    },
    summaryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 16,
        textAlign: 'center',
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    summaryLabel: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    footer: {
        padding: 20,
        paddingBottom: 40,
    },
    continueButton: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingVertical: 18,
        borderRadius: 25,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    continueButtonDisabled: {
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    continueButtonText: {
        color: '#667eea',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
    },
});