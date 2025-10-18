import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function RegistrationScreen() {
    const navigation = useNavigation();
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        moimoiName: 'Moi',
        avatar: null,
    });

    const updateFormData = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
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
            updateFormData('avatar', result.assets[0].uri);
        }
    };

    const saveUserData = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Ошибка', 'Пожалуйста, введите ваше имя');
            return;
        }

        if (!formData.age || parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
            Alert.alert('Ошибка', 'Пожалуйста, введите корректный возраст');
            return;
        }

        try {
            const userData = {
                ...formData,
                age: parseInt(formData.age),
                registeredAt: new Date().toISOString(),
            };

            // Сохраняем данные пользователя
            await AsyncStorage.setItem('userData', JSON.stringify(userData));

            // Переходим на главный экран
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });
        } catch (error) {
            console.error('Error saving user data:', error);
            Alert.alert('Ошибка', 'Не удалось сохранить данные');
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Давайте познакомимся! 👋</Text>

                {/* Avatar Section */}
                <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                    {formData.avatar ? (
                        <Image source={{ uri: formData.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="person-outline" size={40} color="#bb69f2" />
                            <Text style={styles.avatarText}>Добавить фото</Text>
                        </View>
                    )}
                    <View style={styles.avatarOverlay}>
                        <Ionicons name="camera" size={24} color="white" />
                    </View>
                </TouchableOpacity>

                {/* Form Fields */}
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Ваше имя *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Введите ваше имя"
                            value={formData.name}
                            onChangeText={(text) => updateFormData('name', text)}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Ваш возраст *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Введите ваш возраст"
                            value={formData.age}
                            onChangeText={(text) => updateFormData('age', text)}
                            keyboardType="numeric"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Имя вашего MoiMoi</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Введите имя для MoiMoi"
                            value={formData.moimoiName}
                            onChangeText={(text) => updateFormData('moimoiName', text)}
                            placeholderTextColor="#999"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        (!formData.name.trim() || !formData.age) && styles.saveButtonDisabled
                    ]}
                    onPress={saveUserData}
                    disabled={!formData.name.trim() || !formData.age}
                >
                    <Text style={styles.saveButtonText}>Сохранить и начать</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 40,
        color: '#333',
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
        borderColor: '#bb69f2',
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#e9ecef',
        borderStyle: 'dashed',
    },
    avatarText: {
        marginTop: 8,
        color: '#bb69f2',
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
        borderColor: 'white',
    },
    form: {
        marginBottom: 40,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 2,
        borderColor: '#e9ecef',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        backgroundColor: '#f8f9fa',
        color: '#333',
    },
    saveButton: {
        backgroundColor: '#69a4fe',
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 20,
    },
    saveButtonDisabled: {
        backgroundColor: '#ccc',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
});