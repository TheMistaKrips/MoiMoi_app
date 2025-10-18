import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';

export default function CalendarScreen() {
    const { colors, themeColor } = useTheme();
    const [tasks, setTasks] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [monthData, setMonthData] = useState([]);

    useEffect(() => {
        loadTasks();
        generateMonthData();
    }, [selectedDate]);

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

    const generateMonthData = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const monthArray = [];

        // Добавляем пустые дни в начале месяца
        for (let i = 0; i < startingDay; i++) {
            monthArray.push(null);
        }

        // Добавляем дни месяца
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            monthArray.push(date);
        }

        setMonthData(monthArray);
    };

    const getTasksForDate = (date) => {
        if (!date) return [];
        return tasks.filter(task => {
            const taskDate = new Date(task.createdAt);
            return taskDate.toDateString() === date.toDateString();
        });
    };

    const getCompletedTasksForDate = (date) => {
        return getTasksForDate(date).filter(task => task.completed).length;
    };

    const getTotalTasksForDate = (date) => {
        return getTasksForDate(date).length;
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('ru-RU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setSelectedDate(newDate);
    };

    const getDayColor = (date) => {
        if (!date) return 'transparent';

        const completed = getCompletedTasksForDate(date);
        const total = getTotalTasksForDate(date);

        if (total === 0) return colors.background;
        if (completed === total) return '#4CAF50';
        if (completed > 0) return '#FFD93D';
        return '#ff6b6b';
    };

    const isToday = (date) => {
        if (!date) return false;
        return date.toDateString() === new Date().toDateString();
    };

    const isSelected = (date) => {
        if (!date) return false;
        return date.toDateString() === selectedDate.toDateString();
    };

    const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

    const containerStyle = { backgroundColor: colors.background };
    const headerStyle = { backgroundColor: colors.card };
    const weekDaysStyle = { backgroundColor: colors.card };
    const calendarGridStyle = { backgroundColor: colors.card };
    const detailsContainerStyle = { backgroundColor: colors.background };
    const statsContainerStyle = { backgroundColor: colors.card };
    const tasksListStyle = { backgroundColor: colors.card };

    return (
        <View style={[styles.container, containerStyle]}>
            {/* Header */}
            <View style={[styles.header, headerStyle]}>
                <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navButton}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.dateContainer}>
                    <Text style={[styles.monthText, { color: colors.text }]}>
                        {selectedDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                    </Text>
                </View>

                <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navButton}>
                    <Ionicons name="chevron-forward" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Week Days */}
            <View style={[styles.weekDays, weekDaysStyle]}>
                {weekDays.map((day, index) => (
                    <Text key={index} style={[styles.weekDayText, { color: colors.textSecondary }]}>{day}</Text>
                ))}
            </View>

            {/* Calendar Grid */}
            <View style={[styles.calendarGrid, calendarGridStyle]}>
                {monthData.map((date, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.dayCell,
                            isToday(date) && [styles.todayCell, { backgroundColor: colors.background }],
                            isSelected(date) && [styles.selectedCell, { backgroundColor: themeColor }]
                        ]}
                        onPress={() => date && setSelectedDate(date)}
                        disabled={!date}
                    >
                        <View style={[styles.dayIndicator, { backgroundColor: getDayColor(date) }]}>
                            <Text style={[
                                styles.dayText,
                                { color: colors.text },
                                isToday(date) && [styles.todayText, { color: themeColor }],
                                isSelected(date) && styles.selectedText
                            ]}>
                                {date ? date.getDate() : ''}
                            </Text>
                        </View>
                        {date && getTotalTasksForDate(date) > 0 && (
                            <View style={[styles.taskDot, { backgroundColor: themeColor }]} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Selected Date Details */}
            <ScrollView style={[styles.detailsContainer, detailsContainerStyle]}>
                <Text style={[styles.selectedDateText, { color: colors.text }]}>{formatDate(selectedDate)}</Text>

                <View style={[styles.statsContainer, statsContainerStyle]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: themeColor }]}>
                            {getCompletedTasksForDate(selectedDate)}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Выполнено</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: themeColor }]}>
                            {getTotalTasksForDate(selectedDate)}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Всего задач</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: themeColor }]}>
                            {getTotalTasksForDate(selectedDate) > 0 ?
                                Math.round((getCompletedTasksForDate(selectedDate) / getTotalTasksForDate(selectedDate)) * 100) : 0
                            }%
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Прогресс</Text>
                    </View>
                </View>

                <View style={[styles.tasksList, tasksListStyle]}>
                    {getTasksForDate(selectedDate).length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={64} color={themeColor} />
                            <Text style={[styles.emptyText, { color: colors.text }]}>Нет задач на этот день</Text>
                            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                                Задачи, созданные на эту дату, появятся здесь
                            </Text>
                        </View>
                    ) : (
                        getTasksForDate(selectedDate).map((task) => (
                            <View key={task.id} style={[styles.taskItem, { borderBottomColor: colors.border }]}>
                                <View style={[
                                    styles.statusIndicator,
                                    task.completed ? styles.completed : styles.pending
                                ]} />
                                <Text style={[
                                    styles.taskText,
                                    { color: colors.text },
                                    task.completed && [styles.taskTextCompleted, { color: colors.textSecondary }]
                                ]}>
                                    {task.text}
                                </Text>
                                <View style={styles.taskMeta}>
                                    <Text style={[styles.taskTime, { color: colors.textSecondary }]}>
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
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
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
    monthText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    weekDays: {
        flexDirection: 'row',
        paddingVertical: 10,
    },
    weekDayText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '500',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
    },
    todayCell: {
        borderRadius: 8,
    },
    selectedCell: {
        borderRadius: 8,
    },
    dayIndicator: {
        width: '80%',
        height: '80%',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayText: {
        fontSize: 14,
        fontWeight: '500',
    },
    todayText: {
        fontWeight: 'bold',
    },
    selectedText: {
        color: 'white',
        fontWeight: 'bold',
    },
    taskDot: {
        position: 'absolute',
        bottom: 2,
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    detailsContainer: {
        flex: 1,
        padding: 20,
    },
    selectedDateText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    tasksList: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
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
    },
    taskTextCompleted: {
        textDecorationLine: 'line-through',
    },
    taskMeta: {
        alignItems: 'flex-end',
    },
    taskTime: {
        fontSize: 12,
        marginBottom: 4,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        marginTop: 16,
        fontWeight: '500',
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
});