import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { useTheme } from '../../context/ThemeContext';

const ShopScreen = () => {
    const { colors, themeColor } = useTheme();
    const [firePoints, setFirePoints] = useState(0);
    const [ownedSkins, setOwnedSkins] = useState(['default']);
    const [activeSkin, setActiveSkin] = useState('default');

    const skins = [
        { id: 'default', name: 'Стандартный', price: 0, icon: '🎁', description: 'Базовый внешний вид' },
        { id: 'cool', name: 'Крутой MoiMoi', price: 10, icon: '😎', description: 'Стильный и уверенный' },
        { id: 'sport', name: 'Спортивный', price: 15, icon: '💪', description: 'Для активных привычек' },
        { id: 'smart', name: 'Умный', price: 20, icon: '👓', description: 'Интеллектуальный помощник' },
        { id: 'party', name: 'Вечеринка', price: 25, icon: '🎉', description: 'Яркий и праздничный' },
        { id: 'gold', name: 'Золотой', price: 50, icon: '🌟', description: 'Эксклюзивный вид' },
    ];

    useEffect(() => {
        loadShopData();
    }, []);

    const loadShopData = async () => {
        try {
            const points = await AsyncStorage.getItem('totalFirePoints');
            const owned = await AsyncStorage.getItem('ownedSkins');
            const active = await AsyncStorage.getItem('activeSkin');

            if (points) setFirePoints(parseInt(points));
            if (owned) setOwnedSkins(JSON.parse(owned));
            if (active) setActiveSkin(active);
        } catch (error) {
            console.error('Error loading shop data:', error);
        }
    };

    const buySkin = async (skin) => {
        if (firePoints >= skin.price) {
            const newPoints = firePoints - skin.price;
            const newOwnedSkins = [...ownedSkins, skin.id];

            setFirePoints(newPoints);
            setOwnedSkins(newOwnedSkins);

            await AsyncStorage.setItem('totalFirePoints', newPoints.toString());
            await AsyncStorage.setItem('ownedSkins', JSON.stringify(newOwnedSkins));

            Alert.alert('Поздравляем!', `Вы купили скин "${skin.name}"!`);
        } else {
            Alert.alert('Недостаточно Огоньков', `Нужно еще ${skin.price - firePoints} Огоньков для покупки`);
        }
    };

    const equipSkin = async (skinId) => {
        setActiveSkin(skinId);
        await AsyncStorage.setItem('activeSkin', skinId);
        Alert.alert('Успех!', 'Скин активирован!');
    };

    const getSkinPreview = (skinId) => {
        switch (skinId) {
            case 'cool':
                return require('../../../assets/Animations/moimoi_cool.json');
            case 'sport':
                return require('../../../assets/Animations/moimoi_sport.json');
            case 'smart':
                return require('../../../assets/Animations/moimoi_smart.json');
            case 'party':
                return require('../../../assets/Animations/moimoi_party.json');
            case 'gold':
                return require('../../../assets/Animations/moimoi_gold.json');
            default:
                return require('../../../assets/Animations/moimoi_normal.json');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Магазин скинов</Text>
                <View style={[styles.pointsContainer, { backgroundColor: colors.background }]}>
                    <Ionicons name="flame" size={24} color="#FF6B35" />
                    <Text style={[styles.pointsText, { color: colors.text }]}>{firePoints}</Text>
                </View>
            </View>

            {/* Current Skin Preview */}
            <View style={[styles.previewSection, { backgroundColor: colors.card }]}>
                <Text style={[styles.previewTitle, { color: colors.text }]}>Текущий скин</Text>
                <View style={styles.previewContainer}>
                    <LottieView
                        source={getSkinPreview(activeSkin)}
                        autoPlay
                        loop
                        style={styles.previewAnimation}
                    />
                    <Text style={[styles.activeSkinName, { color: themeColor }]}>
                        {skins.find(skin => skin.id === activeSkin)?.name}
                    </Text>
                </View>
            </View>

            {/* Skins List */}
            <ScrollView style={styles.skinsList} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Доступные скины</Text>

                {skins.map((skin) => {
                    const isOwned = ownedSkins.includes(skin.id) || skin.price === 0;
                    const isActive = activeSkin === skin.id;

                    return (
                        <View
                            key={skin.id}
                            style={[
                                styles.skinCard,
                                { backgroundColor: colors.card },
                                isActive && [styles.activeSkinCard, { borderColor: themeColor, backgroundColor: colors.background }]
                            ]}
                        >
                            <View style={styles.skinLeft}>
                                <Text style={styles.skinIcon}>{skin.icon}</Text>
                                <View style={styles.skinInfo}>
                                    <Text style={[styles.skinName, { color: colors.text }]}>{skin.name}</Text>
                                    <Text style={[styles.skinDescription, { color: colors.textSecondary }]}>{skin.description}</Text>
                                    <Text style={[styles.skinPrice, { color: '#FF6B35' }]}>
                                        {skin.price === 0 ? 'Бесплатно' : `${skin.price} Огоньков`}
                                    </Text>
                                </View>
                            </View>

                            {isOwned ? (
                                <TouchableOpacity
                                    style={[
                                        styles.equipButton,
                                        isActive && styles.equippedButton,
                                        { backgroundColor: isActive ? '#4CAF50' : themeColor }
                                    ]}
                                    onPress={() => equipSkin(skin.id)}
                                    disabled={isActive}
                                >
                                    <Text style={styles.equipButtonText}>
                                        {isActive ? 'Активирован' : 'Надеть'}
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[
                                        styles.buyButton,
                                        firePoints < skin.price && styles.buyButtonDisabled,
                                        { backgroundColor: firePoints < skin.price ? colors.border : themeColor }
                                    ]}
                                    onPress={() => buySkin(skin)}
                                    disabled={firePoints < skin.price}
                                >
                                    <Text style={styles.buyButtonText}>
                                        {firePoints < skin.price ? 'Недостаточно' : 'Купить'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}
            </ScrollView>

            {/* Info Section */}
            <View style={[styles.infoSection, { backgroundColor: colors.background, borderLeftColor: themeColor }]}>
                <Text style={[styles.infoText, { color: colors.text }]}>
                    💡 Огоньки можно зарабатывать, выполняя ежедневные задачи!
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef'
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    pointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    pointsText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 5
    },
    previewSection: {
        padding: 20,
        margin: 15,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    previewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    previewContainer: {
        alignItems: 'center',
    },
    previewAnimation: {
        margin: -35,
        width: 220,
        height: 220,
    },
    activeSkinName: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 10,
    },
    skinsList: {
        flex: 1,
        padding: 15
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        marginLeft: 5,
    },
    skinCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    activeSkinCard: {
        borderWidth: 2,
    },
    skinLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    skinIcon: {
        fontSize: 32,
        marginRight: 15
    },
    skinInfo: {
        flex: 1
    },
    skinName: {
        fontSize: 16,
        fontWeight: '600',
    },
    skinDescription: {
        fontSize: 12,
        marginTop: 2,
    },
    skinPrice: {
        fontSize: 14,
        marginTop: 4,
        fontWeight: '500'
    },
    buyButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    buyButtonDisabled: {
        opacity: 0.6,
    },
    buyButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 12,
    },
    equipButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    equippedButton: {
        opacity: 0.8,
    },
    equipButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 12,
    },
    infoSection: {
        margin: 15,
        padding: 15,
        borderRadius: 12,
        borderLeftWidth: 4,
    },
    infoText: {
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default ShopScreen;