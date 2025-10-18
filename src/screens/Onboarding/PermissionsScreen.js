import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function PermissionsScreen() {
    const navigation = useNavigation();

    const handleEnablePermissions = async () => {
        try {
            // Фейковый запрос разрешений - просто показываем сообщение
            Alert.alert(
                'Уведомления включены!',
                'Теперь вы будете получать напоминания от MoiMoi (в будущих версиях)',
                [
                    {
                        text: 'Отлично!',
                        onPress: () => navigation.navigate('Habits')
                    }
                ]
            );
        } catch (error) {
            console.error('Ошибка:', error);
            Alert.alert('Ошибка', 'Что-то пошло не так');
            navigation.navigate('Habits');
        }
    };

    const handleSkip = () => {
        navigation.navigate('Habits');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Необходимые разрешения 🔔</Text>

            <ScrollView style={styles.permissionsList}>
                <View style={styles.permissionItem}>
                    <Ionicons name="notifications-outline" size={32} color="#bb69f2" />
                    <View style={styles.permissionText}>
                        <Text style={styles.permissionTitle}>Уведомления</Text>
                        <Text style={styles.permissionDescription}>
                            Чтобы напоминать вам о ваших задачах и следить за вашим прогрессом
                        </Text>
                    </View>
                </View>

                <View style={styles.permissionItem}>
                    <Ionicons name="time-outline" size={32} color="#bb69f2" />
                    <View style={styles.permissionText}>
                        <Text style={styles.permissionTitle}>Напоминания</Text>
                        <Text style={styles.permissionDescription}>
                            Чтобы помочь вам оставаться в курсе ваших повседневных привычек
                        </Text>
                    </View>
                </View>

                <View style={styles.noteBox}>
                    <Ionicons name="information-circle-outline" size={20} color="#69a4fe" />
                    <Text style={styles.noteText}>
                        В текущей версии уведомления работают в тестовом режиме. Полная функциональность будет добавлена в следующих обновлениях.
                    </Text>
                </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleEnablePermissions}
                >
                    <Text style={styles.primaryButtonText}>Включить уведомления</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleSkip}
                >
                    <Text style={styles.secondaryButtonText}>Пропустить</Text>
                </TouchableOpacity>
            </View>
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
        marginBottom: 30,
        color: '#333',
        textAlign: 'center',
        marginTop: 20,
    },
    permissionsList: {
        flex: 1,
    },
    permissionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f8f9fa',
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#bb69f2',
    },
    permissionText: {
        flex: 1,
        marginLeft: 15,
    },
    permissionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 5,
        color: '#333',
    },
    permissionDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    noteBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#e3f2fd',
        padding: 15,
        borderRadius: 12,
        marginTop: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#69a4fe',
    },
    noteText: {
        flex: 1,
        fontSize: 14,
        color: '#1976d2',
        lineHeight: 20,
        marginLeft: 10,
    },
    buttonContainer: {
        marginTop: 20,
    },
    primaryButton: {
        backgroundColor: '#69a4fe',
        paddingVertical: 15,
        borderRadius: 25,
        marginBottom: 15,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    secondaryButton: {
        padding: 15,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#666',
        fontSize: 16,
    },
});