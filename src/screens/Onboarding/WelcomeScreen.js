import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

export default function WelcomeScreen() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Познакомься со своим MoiMoi! 👋</Text>

            {/* Lottie анимация вместо статичного изображения */}
            <LottieView
                source={require('../../../assets/Animations/moimoi_starter_Animation.json')} // Убедитесь, что путь верный
                autoPlay
                loop
                style={styles.animation}
            />

            <Text style={styles.description}>
                Привет! Я твой личный компаньон для выработки лучших привычек и достижения целей.
            </Text>

            <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Permissions')}
            >
                <Text style={styles.primaryButtonText}>Продолжить</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Main')}
            >
                <Text style={styles.secondaryButtonText}>Пропустить</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 40,
        color: '#333',
        textAlign: 'center',
    },
    animation: {
        width: 300,
        height: 300,
        marginBottom: 20,
    },
    description: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 50,
        lineHeight: 24,
        color: '#666',
        paddingHorizontal: 20,
    },
    primaryButton: {
        backgroundColor: '#69a4fe',
        paddingHorizontal: 50,
        paddingVertical: 15,
        borderRadius: 25,
        marginBottom: 15,
        width: '100%',
        alignItems: 'center',
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    secondaryButton: {
        padding: 15,
    },
    secondaryButtonText: {
        color: '#666',
        fontSize: 16,
    },
});