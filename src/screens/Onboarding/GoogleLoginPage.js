import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GoogleLoginPage() {
    const navigation = useNavigation();

    const handleLogin = async () => {
        try {
            // Сохраняем состояние логина
            await AsyncStorage.setItem('isLoggedIn', 'true');

            // Проверяем, завершал ли пользователь онбординг ранее
            const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');

            if (hasCompletedOnboarding === 'true') {
                // Если онбординг завершен, идем сразу в главное приложение
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Main' }],
                });
            } else {
                // Если онбординг не завершен, идем в онбординг
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Onboarding' }],
                });
            }
        } catch (error) {
            console.error('Error saving login state:', error);
        }
    };

    const handleSkip = async () => {
        try {
            // При пропуске сохраняем состояние логина
            await AsyncStorage.setItem('isLoggedIn', 'true');
            // Помечаем онбординг как завершенный
            await AsyncStorage.setItem('hasCompletedOnboarding', 'true');

            // Переходим в главное приложение
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });
        } catch (error) {
            console.error('Error during skip:', error);
        }
    };

    const handleGoogleLogin = async () => {
        console.log('Google login pressed');
        await handleLogin();
    };

    const handleAppleLogin = async () => {
        console.log('Apple login pressed');
        await handleLogin();
    };

    return (
        <View style={styles.container}>
            {/* Верхняя часть с градиентом и изображением */}
            <LinearGradient
                colors={['#f8fdff', '#e1f7ff']}
                style={styles.gradientContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                <Image
                    source={require('../../../assets/images/page_assets/onboarding_image.png')}
                    style={styles.image}
                    resizeMode="contain"
                />
            </LinearGradient>

            {/* Нижняя часть с кнопками входа */}
            <View style={styles.bottomContainer}>
                <Text style={styles.title}>Добро пожаловать в MoiMoi!</Text>
                <Text style={styles.subtitle}>
                    Войдите в свой аккаунт, чтобы начать использовать приложение
                </Text>

                {/* Кнопка входа через Google */}
                <TouchableOpacity
                    style={styles.googleButton}
                    onPress={handleGoogleLogin}
                >
                    <View style={styles.buttonContent}>
                        <Image
                            source={require('../../../assets/images/icons/google.png')}
                            style={styles.icon}
                        />
                        <Text style={styles.googleButtonText}>Войти через Google</Text>
                    </View>
                </TouchableOpacity>

                {/* Кнопка входа через Apple */}
                <TouchableOpacity
                    style={styles.appleButton}
                    onPress={handleAppleLogin}
                >
                    <View style={styles.buttonContent}>
                        <Image
                            source={require('../../../assets/images/icons/apple.png')}
                            style={[styles.icon, styles.whiteIcon]}
                        />
                        <Text style={styles.appleButtonText}>Войти через Apple</Text>
                    </View>
                </TouchableOpacity>

                {/* Кнопка пропуска */}
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                >
                    <Text style={styles.skipButtonText}>Пропустить и продолжить</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e1f7ff',
    },
    gradientContainer: {
        height: '60%',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        padding: 20,
        marginTop: 60,
    },
    image: {
        width: '200%',
        height: '130%',
    },
    bottomContainer: {
        flex: 1,
        padding: 30,
        justifyContent: 'center',
        backgroundColor: '#e1f7ff',
        marginBottom: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
        color: '#666',
        lineHeight: 22,
    },
    googleButton: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#e9ecef',
        borderRadius: 16,
        paddingVertical: 16,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    appleButton: {
        backgroundColor: '#000000',
        borderRadius: 16,
        paddingVertical: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    skipButton: {
        padding: 16,
        alignItems: 'center',
        marginBottom: 30,
    },
    skipButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '500',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    whiteIcon: {
        tintColor: 'white',
    },
    googleButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
    },
    appleButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
    },
});