import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    StatusBar,
    Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';

// Локальные ответы MoiMoi
const MOIMOI_RESPONSES = [
    "Привет! Как твои дела сегодня? 😊",
    "Отлично! Не забывай про свои привычки! 💪",
    "Я здесь, чтобы поддержать тебя! 🌟",
    "Как прошел твой день? Расскажи мне! 📝",
    "Помни: маленькие шаги ведут к большим результатам! 🎯",
    "Ты делаешь прекрасные успехи! Продолжай в том же духе! 🚀",
    "Не забывай пить воду и делать перерывы! 💧",
    "Я горжусь тобой! Ты становишься лучше каждый день! 🌈",
    "Что тебя сегодня порадовало? Поделись! 😄",
    "Верь в себя! Ты можешь достичь любых целей! 💫",
    "Отличный прогресс! 🏆 Продолжай двигаться вперед!",
    "Каждая выполненная привычка - это шаг к успеху! 👣",
    "Ты молодец! Помни о балансе работы и отдыха ⚖️",
    "Прекрасная работа! Не сбавляй темп! 🎉",
    "Ты вдохновляешь меня своими успехами! ✨"
];

export default function ChatScreen() {
    const { colors, themeColor } = useTheme();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const flatListRef = useRef(null);
    const textInputRef = useRef(null);

    useEffect(() => {
        initializeChat();

        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
            }
        );

        const keyboardDidHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const initializeChat = async () => {
        await loadChatHistory();

        // Автоматическое приветствие от MoiMoi
        if (messages.length === 0) {
            setTimeout(() => {
                addMoiMoiMessage("Привет! Я твой MoiMoi! 😊 Готов помочь тебе с привычками, задачами и целями! Расскажи, как у тебя дела?");
            }, 1000);
        }
    };

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
            id: Date.now().toString() + '_moimoi',
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

    const getAIResponse = (userMessage) => {
        const lowerMessage = userMessage.toLowerCase();

        // Умные ответы на основе контекста
        if (lowerMessage.includes('привыч') || lowerMessage.includes('habit')) {
            return "Отличное начало! 🎯 Начни с маленьких шагов - выполняй привычку всего 5 минут в день. Постепенно увеличивай время! Главное - постоянство!";
        }

        if (lowerMessage.includes('устал') || lowerMessage.includes('усталость') || lowerMessage.includes('устав')) {
            return "Понимаю тебя! 😴 Важно делать перерывы и отдыхать. Попробуй технику Pomodoro: 25 минут работы, 5 минут отдыха! И не забывай про сон!";
        }

        if (lowerMessage.includes('мотивац') || lowerMessage.includes('motivation') || lowerMessage.includes('лень')) {
            return "Ты можешь больше, чем думаешь! 💪 Вспомни, зачем ты начал. Маленькие шаги каждый день приводят к большим результатам! Ты сильнее, чем кажешься!";
        }

        if (lowerMessage.includes('спасибо') || lowerMessage.includes('thank') || lowerMessage.includes('благодар')) {
            return "Всегда рад помочь! 😊 Ты делаешь прекрасные успехи! Продолжай в том же духе! 🌟";
        }

        if (lowerMessage.includes('привет') || lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('здравств')) {
            return "Привет! 👋 Как твои дела сегодня? Что интересного планируешь? Расскажи мне о своих успехах!";
        }

        if (lowerMessage.includes('цел') || lowerMessage.includes('goal') || lowerMessage.includes('мечт')) {
            return "Отлично, что думаешь о целях! 🎯 Разбей большие цели на маленькие шаги. Что можешь сделать сегодня для их достижения?";
        }

        if (lowerMessage.includes('проблем') || lowerMessage.includes('трудност') || lowerMessage.includes('сложн')) {
            return "Понимаю, что бывают сложные моменты... 🤗 Помни: каждая проблема - это возможность для роста. Давай вместе подумаем над решением!";
        }

        if (lowerMessage.includes('успех') || lowerMessage.includes('достиж') || lowerMessage.includes('горж')) {
            return "Это прекрасно! 🎉 Я так рад за тебя! Поделись, что именно у тебя получилось? Такие моменты нужно отмечать!";
        }

        if (lowerMessage.includes('сон') || lowerMessage.includes('спать') || lowerMessage.includes('бессонниц')) {
            return "Сон очень важен для продуктивности! 🛌 Старайся спать 7-9 часов, избегай экранов перед сном и создай уютную атмосферу в спальне!";
        }

        if (lowerMessage.includes('планирован') || lowerMessage.includes('расписан') || lowerMessage.includes('график')) {
            return "Планирование - ключ к успеху! 📅 Начни с составления списка дел на день, расставь приоритеты и не забывай про время для отдыха!";
        }

        // Контекстные ответы на основе последних сообщений
        const lastUserMessage = messages.filter(m => m.isUser).pop();
        if (lastUserMessage) {
            const lastLower = lastUserMessage.text.toLowerCase();

            if (lastLower.includes('привыч') && lowerMessage.includes('как')) {
                return "Чтобы сформировать привычку: 1) Начни с малого 2) Привяжи к существующему ритуалу 3) Отслеживай прогресс 4) Не ругай себя за пропуски!";
            }

            if (lastLower.includes('цел') && (lowerMessage.includes('достичь') || lowerMessage.includes('достигнуть'))) {
                return "Для достижения целей используй SMART-метод: Конкретные, Измеримые, Достижимые, Релевантные, Ограниченные по времени цели!";
            }
        }

        // Общие поддерживающие ответы
        const generalResponses = [
            "Понимаю тебя! 😊 Помни: каждый маленький шаг важен и приближает тебя к цели!",
            "Ты на правильном пути! 🌟 Продолжай двигаться вперед, даже если медленно!",
            "Отличный вопрос! 💭 Давай подумаем вместе над решением! Что тебя больше всего волнует?",
            "Горжусь твоим прогрессом! 🚀 Не сдавайся, даже когда трудно!",
            "Ты становишься лучше с каждым днем! 🌈 Верь в себя и свои силы!",
            "Маленькие победы ведут к большим успехам! 🏆 Цени каждый свой шаг!",
            "Ты можешь всё, что захочешь! 💫 Просто начни и продолжай идти!",
            "Каждый день - новая возможность! 🌻 Используй её по максимуму!",
            "Ты уникален и способен на многое! ✨ Доверяй себе и своему пути!",
            "Прекрасная мысль! 💡 Развивай её и преврати в действие!"
        ];

        return generalResponses[Math.floor(Math.random() * generalResponses.length)];
    };

    const sendMessage = async () => {
        if (inputText.trim() && !isLoading) {
            // Сохраняем сообщение пользователя сразу
            const userMessage = {
                id: Date.now().toString() + '_user',
                text: inputText.trim(),
                isUser: true,
                timestamp: new Date().toISOString(),
            };

            const updatedMessages = [...messages, userMessage];
            setMessages(updatedMessages);
            saveChatHistory(updatedMessages);

            const userMessageText = inputText.trim();
            setInputText('');
            setIsLoading(true);

            // Фокус на инпут после отправки
            if (textInputRef.current) {
                textInputRef.current.focus();
            }

            try {
                // Имитация задержки ответа для более естественного общения
                setTimeout(() => {
                    const aiResponse = getAIResponse(userMessageText);
                    addMoiMoiMessage(aiResponse);
                    setIsLoading(false);
                }, 1000 + Math.random() * 1000); // Случайная задержка 1-2 секунды

            } catch (error) {
                console.error('Error sending message:', error);
                // Fallback ответ в случае ошибки
                const fallbackResponse = "Извини, у меня временные технические трудности! 😅 Но я все равно здесь для тебя! Как я могу помочь?";
                addMoiMoiMessage(fallbackResponse);
                setIsLoading(false);
            }
        }
    };

    const clearChat = () => {
        Alert.alert(
            'Очистить историю',
            'Вы уверены, что хотите очистить всю историю чата?',
            [
                {
                    text: 'Отмена',
                    style: 'cancel'
                },
                {
                    text: 'Очистить',
                    style: 'destructive',
                    onPress: () => {
                        setMessages([]);
                        saveChatHistory([]);
                        // Добавляем новое приветствие после очистки
                        setTimeout(() => {
                            addMoiMoiMessage("Привет! Я твой MoiMoi! 😊 Чем могу помочь сегодня?");
                        }, 500);
                    },
                },
            ]
        );
    };

    const renderMessage = ({ item }) => (
        <View style={[
            styles.messageContainer,
            item.isUser ? styles.userMessage : styles.moiMoiMessage
        ]}>
            <View style={[
                styles.messageBubble,
                item.isUser ?
                    [styles.userBubble, { backgroundColor: themeColor }] :
                    [styles.moiMoiBubble, { backgroundColor: colors.card, borderColor: colors.border }]
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

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar backgroundColor={themeColor} barStyle="light-content" />

            {/* Messages List */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                style={styles.messagesList}
                contentContainerStyle={[
                    styles.messagesContent,
                    {
                        backgroundColor: colors.background,
                        paddingBottom: 10
                    }
                ]}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="chatbubbles-outline" size={64} color={themeColor} />
                        <Text style={[styles.emptyText, { color: colors.text }]}>
                            Начните общение с MoiMoi!
                        </Text>
                        <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                            Задайте вопрос о привычках, целях или просто поздоровайтесь
                        </Text>
                    </View>
                }
                keyboardShouldPersistTaps="handled"
            />

            {/* Input Area с учетом высоты клавиатуры */}
            <View style={[
                styles.inputContainer,
                {
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                    paddingBottom: Platform.OS === 'ios' ? keyboardHeight : 10,
                    transform: [{ translateY: -keyboardHeight }]
                }
            ]}>
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearChat}
                >
                    <Ionicons name="trash-outline" size={24} color={colors.textSecondary} />
                </TouchableOpacity>

                <TextInput
                    ref={textInputRef}
                    style={[
                        styles.textInput,
                        {
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                            color: colors.text
                        }
                    ]}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Напишите сообщение..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    maxLength={500}
                    editable={!isLoading}
                    onSubmitEditing={sendMessage}
                    returnKeyType="send"
                    blurOnSubmit={false}
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        { backgroundColor: themeColor },
                        (!inputText.trim() || isLoading) && styles.sendButtonDisabled
                    ]}
                    onPress={sendMessage}
                    disabled={!inputText.trim() || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Ionicons
                            name="send"
                            size={20}
                            color="white"
                        />
                    )}
                </TouchableOpacity>
            </View>
        </View>
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
        minHeight: '100%',
    },
    messageContainer: {
        marginBottom: 16,
        maxWidth: '85%',
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
        marginTop: 2,
        opacity: 0.7,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 16,
        paddingTop: 10,
        borderTopWidth: 1,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 12 : 8,
        marginHorizontal: 12,
        maxHeight: 100,
        fontSize: 16,
        textAlignVertical: 'center',
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
    clearButton: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        fontSize: 18,
        marginTop: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
});