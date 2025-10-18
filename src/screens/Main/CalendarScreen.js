import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CalendarScreen() {
    const [tasks, setTasks] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        loadTasks();
    }, []);

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

    const getTasksForDate = (date) => {
        return tasks.filter(task => {
            const taskDate = new Date(task.createdAt).toDateString();
            return taskDate === date.toDateString();
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('ru-RU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const navigateDate = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
    };

    const todayTasks = getTasksForDate(selectedDate);
    const completedToday = todayTasks.filter(task => task.completed).length;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigateDate(-1)} style={styles.navButton}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>

                <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
                    <Text style={styles.tasksCounter}>
                        {completedToday} из {todayTasks.length} задач выполнено
                    </Text>
                </View>

                <TouchableOpacity onPress={() => navigateDate(1)} style={styles.navButton}>
                    <Ionicons name="chevron-forward" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {todayTasks.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={64} color="#bb69f2" />
                        <Text style={styles.emptyText}>Нет задач на этот день</Text>
                        <Text style={styles.emptySubtext}>
                            Задачи, созданные на эту дату, появятся здесь
                        </Text>
                    </View>
                ) : (
                    <View style={styles.tasksList}>
                        {todayTasks.map((task) => (
                            <View key={task.id} style={styles.taskItem}>
                                <View style={[
                                    styles.statusIndicator,
                                    task.completed ? styles.completed : styles.pending
                                ]} />
                                <Text style={[
                                    styles.taskText,
                                    task.completed && styles.taskTextCompleted
                                ]}>
                                    {task.text}
                                </Text>
                                <View style={styles.taskMeta}>
                                    <Text style={styles.taskTime}>
                                        {new Date(task.createdAt).toLocaleTimeString('ru-RU', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Text>
                                    {task.completed && (
                                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    navButton: {
        padding: 8,
    },
    dateContainer: {
        alignItems: 'center',
        flex: 1,
    },
    dateText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    tasksCounter: {
        fontSize: 14,
        color: '#bb69f2',
        marginTop: 4,
        fontWeight: '500',
    },
    content: {
        flex: 1,
        padding: 20,
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
        textAlign: 'center',
    },
    tasksList: {
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 12,
    },
    completed: {
        backgroundColor: '#4CAF50',
    },
    pending: {
        backgroundColor: '#ff9800',
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
    taskMeta: {
        alignItems: 'flex-end',
    },
    taskTime: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
});