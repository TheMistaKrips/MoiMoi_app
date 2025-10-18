import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
    const [userName, setUserName] = useState('Пользователь');
    const [tasks, setTasks] = useState([]);
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTask, setNewTask] = useState('');
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        loadUserData();
        loadTasks();
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

    const toggleTask = (taskId) => {
        const updatedTasks = tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        setTasks(updatedTasks);
        saveTasks(updatedTasks);
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
                    source={require('../../../assets/Animations/moimoi_animation_test.json')}
                    autoPlay
                    loop
                    style={styles.moimoiAnimation}
                />
            </View>

            {/* Stats Section */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>Lvl 1</Text>
                    <Text style={styles.statLabel}>Уровень MoiMoi</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{userData?.moimoiName || 'Moi'}</Text>
                    <Text style={styles.statLabel}>Имя MoiMoi</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{completedTasks}</Text>
                    <Text style={styles.statLabel}>Выполнено</Text>
                </View>
            </View>

            {/* Tasks Section */}
            <View style={styles.tasksContainer}>
                <View style={styles.tasksHeader}>
                    <Text style={styles.tasksTitle}>Сегодняшние задачи</Text>
                    <Text style={styles.tasksCounter}>{tasks.length} задач</Text>
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
                transparent statusBarTranslucent
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
        shadowOffset: {
            width: 0,
            height: 2,
        },
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
        shadowOffset: {
            width: 0,
            height: 4,
        },
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
        shadowOffset: {
            width: 0,
            height: 2,
        },
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
});