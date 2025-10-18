import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// НАСТРОЙКА УВЕДОМЛЕНИЙ
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// ЗАПРОС РАЗРЕШЕНИЙ
export const requestNotificationPermissions = async () => {
    try {
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.error('Error requesting notification permissions:', error);
        return false;
    }
};

// ЕЖЕДНЕВНОЕ НАПОМИНАНИЕ
export const scheduleDailyReminder = async (hour = 20, minute = 0) => {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "MoiMoi ждет тебя! 🎯",
                body: "Не забудь выполнить свои привычки сегодня!",
                sound: true,
                data: { type: 'daily_reminder' },
            },
            trigger: {
                hour,
                minute,
                repeats: true,
            },
        });

        console.log('Daily reminder scheduled for:', hour, minute);
    } catch (error) {
        console.error('Error scheduling daily reminder:', error);
    }
};

// УВЕДОМЛЕНИЕ О НИЗКОМ УРОВНЕ СЧАСТЬЯ
export const scheduleLowHappinessNotification = async (happinessLevel) => {
    if (happinessLevel <= 20) {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Твой MoiMoi грустит 😔",
                    body: "Покорми его выполнением задач!",
                    sound: true,
                    data: { type: 'low_happiness' },
                },
                trigger: {
                    seconds: 3600, // Через час
                },
            });
        } catch (error) {
            console.error('Error scheduling low happiness notification:', error);
        }
    }
};

// ПРОВЕРКА ВЫПОЛНЕННЫХ ЗАДАЧ И ОТПРАВКА УВЕДОМЛЕНИЙ
export const checkDailyProgress = async () => {
    try {
        const tasksString = await AsyncStorage.getItem('userTasks');
        const tasks = tasksString ? JSON.parse(tasksString) : [];
        const today = new Date().toDateString();

        const completedToday = tasks.filter(task => {
            const taskDate = new Date(task.createdAt).toDateString();
            return taskDate === today && task.completed;
        }).length;

        const totalToday = tasks.filter(task => {
            const taskDate = new Date(task.createdAt).toDateString();
            return taskDate === today;
        }).length;

        // Если вечером и выполнено меньше половины задач
        const now = new Date();
        if (now.getHours() >= 18 && completedToday < totalToday / 2 && totalToday > 0) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Еще есть время! 🌅",
                    body: `Выполнено ${completedToday} из ${totalToday} задач. Успей до конца дня!`,
                    sound: true,
                },
                trigger: {
                    seconds: 10,
                },
            });
        }
    } catch (error) {
        console.error('Error checking daily progress:', error);
    }
};

// ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ УВЕДОМЛЕНИЙ
export const initializeNotificationSystem = async () => {
    const permissionsGranted = await requestNotificationPermissions();
    if (permissionsGranted) {
        await scheduleDailyReminder(20, 0);
        console.log('Notification system initialized');
    }
};

// ОТМЕНА ВСЕХ УВЕДОМЛЕНИЙ
export const cancelAllNotifications = async () => {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('All notifications cancelled');
    } catch (error) {
        console.error('Error cancelling notifications:', error);
    }
};