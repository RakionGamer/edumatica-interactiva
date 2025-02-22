import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Bar } from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProgress } from './contexts/ProgressContext';

const Dashboard: React.FC = () => {
    const navigation = useNavigation();
    const [fontsLoaded] = useFonts({
        'Din-Round': require('../assets/dinroundpro_bold.otf'),
    });

    const [user, setUser] = useState<{ firstname: string; secondname: string } | null>(null);
    const [loading, setLoading] = useState(true);

    const {
        modules,
        updateConceptProgress,
        toggleModuleExpansion,
        expandedModule
    } = useProgress();

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const data = await AsyncStorage.getItem('userData');
                if (data) setUser(JSON.parse(data));
            } catch (error) {
                Alert.alert('Error', 'No se pudieron cargar los datos del usuario');
            } finally {
                setLoading(false);
            }
        };
        loadUserData();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('userData');
        navigation.reset({ index: 0, routes: [{ name: 'Principal' as never }] });
    };

    if (!fontsLoaded || loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#00ADB5" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={28} color="#fff" />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.welcomeContainer}>
                    <Text style={[styles.welcomeTitle, { fontFamily: 'Din-Round' }]}>
                        Bienvenido
                    </Text>
                    <Text style={[styles.userName, { fontFamily: 'Din-Round' }]}>
                        {user?.firstname} {user?.secondname}
                    </Text>
                </View>

                <Text style={[styles.progressTitle, { fontFamily: 'Din-Round' }]}>
                    Tu Progreso
                </Text>

                <Bar
                    progress={modules.filter(mod => mod.completed).length / modules.length}
                    width={0}
                    height={10}
                    color="#00ADB5"
                    borderWidth={0}
                    style={styles.progressBar}
                />

                {modules.map(mod => (
                    <Animated.View key={mod.id} entering={FadeInUp.duration(600)}>
                        <TouchableOpacity
                            style={[styles.moduleCard, mod.unlocked ? styles.unlocked : styles.locked]}
                            disabled={!mod.unlocked}
                            onPress={() => toggleModuleExpansion(mod.id)}
                        >
                            <Ionicons name="book" size={24} color="#fff" style={styles.moduleIcon} />
                            <View style={styles.moduleInfo}>
                                <Text style={styles.moduleTitle}>{mod.title}</Text>
                                <Text style={styles.moduleDesc}>{mod.description}</Text>
                            </View>
                            <Text style={styles.moduleStatus}>
                                {mod.completed ? <Ionicons name="checkmark-circle" size={24} color="#00ADB5" /> : mod.unlocked ? 
                                <Ionicons name="lock-open" size={24} color="#fff" style={styles.moduleIcon} /> : 
                                <Ionicons name="lock-closed" size={24} color="#fff" style={styles.moduleIcon} />   }
                            </Text>
                        </TouchableOpacity>

                        {expandedModule === mod.id && (
                            <Animated.View entering={FadeInUp.duration(600)} style={styles.conceptsList}>
                                {mod.concepts.map((concept, index) => (
                                    <View key={concept.id} style={styles.conceptItem}>
                                        <View style={styles.timelineContainer}>
                                            <View style={[styles.timelineDot, concept.unlocked ? styles.unlockedDot : styles.lockedDot]} />
                                            {index !== mod.concepts.length - 1 && (
                                                <View style={[styles.timelineLine, { backgroundColor: concept.completed ? '#00ADB5' : '#393E46' }]} />
                                            )}
                                        </View>

                                        <TouchableOpacity
                                            style={[styles.conceptCard, !concept.unlocked && styles.lockedConcept]}
                                            onPress={() => {
                                                if (concept.unlocked) {
                                                    navigation.navigate('ConceptGuide', { conceptId: concept.id });
                                                }
                                            }}
                                            disabled={!concept.unlocked}
                                        >
                                            <View style={styles.conceptTextContainer}>
                                                <Text style={styles.conceptTitle}>{concept.name}</Text>
                                                <View style={styles.progressContainer}>
                                                    <Bar
                                                        progress={concept.progress / 100}
                                                        width={null}
                                                        height={8}
                                                        color="#00ADB5"
                                                        borderRadius={4}
                                                        style={styles.progressBar}
                                                    />
                                                    <Text style={styles.percentageText}>
                                                        {concept.progress}%
                                                    </Text>
                                                </View>
                                            </View>
                                            {concept.completed && <Ionicons name="checkmark-circle" size={24} color="#00ADB5" />}
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </Animated.View>
                        )}
                    </Animated.View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222831'
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#222831'
    },


    welcomeContainer: {
        marginBottom: 25,
        marginTop: 10,
    },
    welcomeTitle: {
        color: '#fff',
        fontSize: 26,
        marginBottom: 4,
    },
    userName: {
        color: '#EEEEEE',
        fontSize: 18,
        opacity: 0.9,
    },
    logoutButton: {
        position: 'absolute',
        top: 25,
        right: 25,
        zIndex: 2,
        padding: 10,
    },

    logout: {
        top: 5,
    },
    scrollContainer: {
        padding: 20
    },
    progressTitle: {
        fontSize: 20,
        color: '#EEEEEE',
        marginBottom: 15
    },

    moduleCard: {
        backgroundColor: '#393E46',
        padding: 20,
        borderRadius: 15,
        marginBottom: 15,
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center',
    },
    unlocked: {
        opacity: 1
    },
    locked: {
        opacity: 0.5
    },
    moduleIcon: {
        marginRight: 10,
    },
    moduleInfo: {
        flexDirection: 'column',
        flex: 1,
    },
    moduleTitle: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold'
    },
    moduleDesc: {
        fontSize: 14,
        color: '#EEEEEE',
        marginTop: 5
    },
    moduleStatus: {
        marginTop: 32,
        fontSize: 16,
        color: '#FFD369'
    },
    conceptsList: {
        marginTop: 5,
        marginLeft: 5,
        marginBottom: 15,
    },
    conceptItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    timelineContainer: {
        width: 20,
        marginRight: 10,
        alignItems: 'center',
        top: 20,
    },
    conceptText: {
        fontSize: 18,
        color: '#EEEEEE',
        flex: 1,
        bottom: 6,
    },

    lockedConcept: {
        backgroundColor: '#2D3238',
        opacity: 0.7,
    },


    percentageText: {
        color: '#EEEEEE',
        fontSize: 14,
        minWidth: 40,
    },
    timelineDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginBottom: 4,
    },
    unlockedDot: {
        backgroundColor: '#00ADB5',
    },
    lockedDot: {
        backgroundColor: '#666',
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#00ADB5',
        marginVertical: 2,
    },
    conceptCard: {
        flex: 1,
        backgroundColor: '#393E46',
        borderRadius: 10,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    conceptTextContainer: {
        flex: 1,
        marginRight: 10,
    },
    conceptTitle: {
        color: '#EEEEEE',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8, // Espacio entre título y barra
        flexWrap: 'wrap',
        maxWidth: '90%', // Permite ajuste para el icono de check
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        top: 0, // Elimina el posicionamiento absoluto
        right: 0,
    },
    progressBar: {
        flex: 1,
    },

});

export default Dashboard;
