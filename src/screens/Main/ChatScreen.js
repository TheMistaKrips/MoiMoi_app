import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';

const MoiMoiResponses = [
    "Привет! Как твои дела? 😊",
    "Отлично! Не забывай про свои привычки! 💪",
    "Я здесь, чтобы поддержать тебя! 🌟",
    "Как прошел твой день? Расскажи мне! 📝",
    "Помни: маленькие шаги ведут к большим результатам! 🎯",
    "Ты делаешь прекрасные успехи! Продолжай в том же духе! 🚀",
    "Не забывай пить воду и делать перерывы! 💧",
    "Я горжусь тобой! Ты становишься лучше каждый день! 🌈",
    "Что тебя сегодня порадовало? Поделись! 😄",
    "Верь в себя! Ты можешь достичь любых целей! 💫"
];

export default function ChatScreen() {
    const { colors, themeColor } = useTheme();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const flatListRef = useRef(null);

    useEffect(() => {
        loadChatHistory();
        // Автоматическое приветствие от MoiMoi
        if (messages.length === 0) {
            setTimeout(() => {
                addMoiMoiMessage("Привет! Я твой MoiMoi! Готов помочь тебе с привычками и задачами! 😊");
            }, 1000);
        }
    }, []);

    const loadChatHistory = async () => {
        try {
            const chatHistory = await AsyncStorage.getItem('chatHistory');
            if (chatHistory) {
                setMessages(JSON.parse(chatHistory));
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    const saveChatHistory = async (updatedMessages) => {
        try {
            await AsyncStorage.setItem('chatHistory', JSON.stringify(updatedMessages));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    };

    const addMoiMoiMessage = (text) => {
        const newMessage = {
            id: Date.now().toString(),
            text: text,
            isUser: false,
            timestamp: new Date().toISOString(),
        };
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        saveChatHistory(updatedMessages);

        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const sendMessage = () => {
        if (inputText.trim()) {
            // Сообщение пользователя
            const userMessage = {
                id: Date.now().toString(),
                text: inputText.trim(),
                isUser: true,
                timestamp: new Date().toISOString(),
            };
            const updatedMessages = [...messages, userMessage];
            setMessages(updatedMessages);
            saveChatHistory(updatedMessages);
            setInputText('');

            // Ответ MoiMoi
            setTimeout(() => {
                const randomResponse = MoiMoiResponses[Math.floor(Math.random() * MoiMoiResponses.length)];
                addMoiMoiMessage(randomResponse);
            }, 1000);

            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    };

    const renderMessage = ({ item }) => (
        <View style={[
            styles.messageContainer,
            item.isUser ? styles.userMessage : styles.moiMoiMessage
        ]}>
            <View style={[
                styles.messageBubble,
                item.isUser ? [styles.userBubble, { backgroundColor: themeColor }] : [styles.moiMoiBubble, { backgroundColor: colors.card, borderColor: colors.border }]
            ]}>
                <Text style={[
                    styles.messageText,
                    item.isUser ? styles.userMessageText : [styles.moiMoiMessageText, { color: colors.text }]
                ]}>
                    {item.text}
                </Text>
            </View>
            <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
                {new Date(item.timestamp).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </Text>
        </View>
    );

    const containerStyle = { backgroundColor: colors.background };
    const inputContainerStyle = { backgroundColor: colors.card, borderTopColor: colors.border };
    const textInputStyle = { backgroundColor: colors.background, borderColor: colors.border, color: colors.text };

    return (
        <KeyboardAvoidingView
            style={[styles.container, containerStyle]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                style={styles.messagesList}
                contentContainerStyle={[styles.messagesContent, { backgroundColor: colors.background }]}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <View style={[styles.inputContainer, inputContainerStyle]}>
                <TextInput
                    style={[styles.textInput, textInputStyle]}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Напишите сообщение..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    maxLength={500}
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        { backgroundColor: themeColor },
                        !inputText.trim() && styles.sendButtonDisabled
                    ]}
                    onPress={sendMessage}
                    disabled={!inputText.trim()}
                >
                    <Ionicons
                        name="send"
                        size={20}
                        color={inputText.trim() ? "white" : colors.textSecondary}
                    />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    messagesList: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
    },
    messageContainer: {
        marginBottom: 16,
        maxWidth: '80%',
    },
    userMessage: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
    },
    moiMoiMessage: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
    messageBubble: {
        padding: 12,
        borderRadius: 18,
        marginBottom: 4,
    },
    userBubble: {
        borderBottomRightRadius: 4,
    },
    moiMoiBubble: {
        borderBottomLeftRadius: 4,
        borderWidth: 1,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    userMessageText: {
        color: 'white',
    },
    moiMoiMessageText: {
        color: '#333',
    },
    timestamp: {
        fontSize: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 16,
        borderTopWidth: 1,
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginRight: 12,
        maxHeight: 100,
        fontSize: 16,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});