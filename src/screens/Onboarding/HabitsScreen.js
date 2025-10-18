import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const defaultHabits = [
    { id: '1', name: 'Упражнения', icon: 'fitness', selected: false },
    { id: '2', name: 'Чтение', icon: 'book', selected: false },
    { id: '3', name: 'Медитация', icon: 'leaf', selected: false },
    { id: '4', name: 'Пить воду', icon: 'water', selected: false },
    { id: '5', name: 'Сон', icon: 'moon', selected: false },
    { id: '6', name: 'Учеба', icon: 'school', selected: false },
    { id: '7', name: 'Курение', icon: 'ban', selected: false },
    { id: '8', name: 'Ходьба', icon: 'walk', selected: false },
];

export default function HabitsScreen() {
    const [habits, setHabits] = useState(defaultHabits);
    const navigation = useNavigation();

    const toggleHabit = (id) => {
        const updatedHabits = habits.map(habit =>
            habit.id === id ? { ...habit, selected: !habit.selected } : habit
        );
        setHabits(updatedHabits);
    };

    const saveHabitsAndContinue = async () => {
        try {
            const selectedHabits = habits.filter(habit => habit.selected);

            // Сохраняем выбранные привычки
            await AsyncStorage.setItem('userHabits', JSON.stringify(selectedHabits));

            // Переходим на экран регистрации
            navigation.navigate('Registration');
        } catch (error) {
            console.error('Error saving habits:', error);
        }
    };

    const selectedCount = habits.filter(habit => habit.selected).length;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Выберите свои привычки 🎯</Text>
            <Text style={styles.subtitle}>
                Выберите привычки, которые вы хотите отслеживать{'\n'}
                <Text style={styles.counter}>({selectedCount} выбрано)</Text>
            </Text>

            <ScrollView style={styles.habitsContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.habitsGrid}>
                    {habits.map((habit) => (
                        <TouchableOpacity
                            key={habit.id}
                            style={[
                                styles.habitCard,
                                habit.selected && styles.habitCardSelected
                            ]}
                            onPress={() => toggleHabit(habit.id)}
                        >
                            <View style={[
                                styles.iconContainer,
                                habit.selected && styles.iconContainerSelected
                            ]}>
                                <Ionicons
                                    name={habit.icon}
                                    size={28}
                                    color={habit.selected ? '#bb69f2' : '#666'}
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
                                    color="#bb69f2"
                                    style={styles.checkIcon}
                                />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <TouchableOpacity
                style={[
                    styles.continueButton,
                    selectedCount === 0 && styles.continueButtonDisabled
                ]}
                onPress={saveHabitsAndContinue}
                disabled={selectedCount === 0}
            >
                <Text style={styles.continueButtonText}>
                    Продолжить ({selectedCount})
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
        textAlign: 'center',
        marginTop: 20,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        color: '#666',
        lineHeight: 22,
    },
    counter: {
        color: '#bb69f2',
        fontWeight: '600',
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
        backgroundColor: '#f8f9fa',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
    },
    habitCardSelected: {
        backgroundColor: '#f0e6ff',
        borderColor: '#bb69f2',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#e9ecef',
    },
    iconContainerSelected: {
        borderColor: '#bb69f2',
        backgroundColor: '#fff',
    },
    habitName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        textAlign: 'center',
    },
    habitNameSelected: {
        color: '#bb69f2',
        fontWeight: '600',
    },
    checkIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    continueButton: {
        backgroundColor: '#69a4fe',
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 10,
    },
    continueButtonDisabled: {
        backgroundColor: '#ccc',
    },
    continueButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
});