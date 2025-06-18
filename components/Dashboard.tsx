import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator, Pressable } from 'react-native';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Bar } from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProgress } from './contexts/ProgressContext';
import RotatableIcon from './rotateChevronIcon'
import { auth, db } from './db/db';
import { doc, getDoc } from 'firebase/firestore';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { MaterialIcons } from '@expo/vector-icons';

type RootStackParamList = {
    Principal: undefined;
    ConceptGuide: { conceptId: number };
};

const Dashboard: React.FC = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [fontsLoaded] = useFonts({
        'Din-Round': require('../assets/dinroundpro_bold.otf'),
    });
    const [user, setUser] = useState<{ firstname: string; secondname: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);

    const {
        modules,
        loading: progressLoading,
        updateConceptProgress,
        toggleModuleExpansion,
        expandedModule
    } = useProgress();

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const data = await AsyncStorage.getItem('userData');
                if (data) {
                    const localUserData = JSON.parse(data);

                    if (auth.currentUser) {
                        const docRef = doc(db, 'users', auth.currentUser.uid);
                        const docSnap = await getDoc(docRef);

                        if (docSnap.exists()) {
                            const firestoreData = docSnap.data();

                            if (firestoreData.firstname !== localUserData.firstname ||
                                firestoreData.secondname !== localUserData.secondname) {

                                const updatedUser = {
                                    ...localUserData,
                                    ...firestoreData
                                };

                                await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
                                setUser(updatedUser);
                                return;
                            }
                        }
                    }
                    setUser(localUserData);
                }
            } catch (error) {
                Alert.alert('Error', 'Error cargando datos del usuario');
            } finally {
                setLoading(false);
            }
        };

        loadUserData();

        const unsubscribeFocus = navigation.addListener('focus', loadUserData);

        return () => {
            unsubscribeFocus();
        };
    }, [navigation]);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            await AsyncStorage.removeItem('userData');
            navigation.navigate('Principal');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            Alert.alert('Error', 'No se pudo cerrar sesión');
        }
    };

    if (!fontsLoaded || loading || progressLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator
                    size="large"
                    color="#00ADB5"
                    style={{ transform: [{ scale: 1.4 }] }}
                />
                <Text style={styles.loadingText}>
                    Cargando..
                </Text>
            </View>
        );
    }

    const ModuleIcon = ({ title }: { title: string }) => {
        const iconProps = {
            size: 32,
            color: "#fff",
            style: styles.moduleIcon
        };

        switch (title) {
            case 'Números y Operaciones':
                return <MaterialIcons name="calculate" {...iconProps} />;
            case 'Álgebra':
                return <MaterialCommunityIcons name="matrix" {...iconProps} />;
            case 'Geometría':
                return <MaterialCommunityIcons name="shape" {...iconProps} />;
            default:
                return <Ionicons name="calculator" {...iconProps} />;
        }
    };

    const ModulesCompleted = modules.filter(mod => mod.completed).length
    return (
        <SafeAreaView style={styles.container}>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.welcomeTitle, { fontFamily: 'Din-Round' }]}>
                        Bienvenido
                    </Text>

                    <TouchableOpacity
                        style={styles.profileContainer}
                        onPress={() => setShowDropdown(!showDropdown)}
                    >
                        <View style={styles.profileContent}>
                            <Ionicons
                                name="person-circle-outline"
                                size={32}
                                color="#00ADB5"
                            />
                            <View style={styles.profileTextContainer}>
                                <Text style={styles.userName}>
                                    {user?.firstname} {user?.secondname}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    {showDropdown && (
                        <Animated.View
                            style={styles.dropdownMenu}
                            entering={FadeInUp.duration(200)}
                        >
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    setShowDropdown(false);
                                    navigation.navigate('EditProfile' as never);
                                }}
                            >
                                <Ionicons name="create-outline" size={20} color="#EEEEEE" />
                                <Text style={styles.menuItemText}>Editar Perfil</Text>
                            </TouchableOpacity>

                            <View style={styles.divider} />
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={handleLogout}
                            >
                                <Ionicons name="log-out-outline" size={20} color="#EEEEEE" />
                                <Text style={styles.menuItemText}>Cerrar Sesión</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                </View>

                <Text style={[styles.progressTitle, { fontFamily: 'Din-Round' }]}>
                    Tu Progreso
                </Text>

                <View style={styles.timelineContainerStar}>
                    <View style={styles.starsWrapper}>
                        <View style={styles.starsContainer}>
                            {modules.map((mod, index) => (
                                <View
                                    style={styles.starWrapper}
                                    key={`star-${mod.id}`}>
                                    <View style={styles.starBackground} />
                                    <Ionicons
                                        name={mod.completed ? 'star' : 'star-outline'}
                                        size={24}
                                        color={mod.completed ? '#00ADB5' : '#393E46'}
                                    />
                                </View>
                            ))}
                        </View>
                        <View style={styles.connectingLineContainer}>
                            {modules.slice(0, -1).map((mod, index) => (
                                <View
                                    key={`segment-${mod.id}-${index}`}
                                    style={[
                                        styles.connectingSegment,
                                        {
                                            backgroundColor: mod.completed ? '#00ADB5' : '#393E46',
                                            marginRight: index === modules.length - 2 ? 0 : 3
                                        }
                                    ]}
                                />
                            ))}
                        </View>
                    </View>
                    {ModulesCompleted == 1 ?
                        <Text style={styles.completedModulesText}>
                            {ModulesCompleted} módulo completado
                        </Text>
                        :
                        <Text style={styles.completedModulesText}>
                            {ModulesCompleted} módulos completados
                        </Text>
                    }
                </View>
                {

                    modules.map(mod => (
                        <Animated.View key={mod.id} entering={FadeInUp.duration(600)}>
                            <TouchableOpacity
                                style={[styles.moduleCard, mod.unlocked ? styles.unlocked : styles.locked]}
                                onPress={() => toggleModuleExpansion(mod.id)}
                            >
                                <ModuleIcon title={mod.title}/>
                                <View style={styles.moduleInfo}>
                                    <Text style={styles.moduleTitle}>{mod.title}</Text>
                                    <Text style={styles.moduleDesc}>{mod.description}</Text>
                                </View>
                                <RotatableIcon
                                    isExpanded={expandedModule === mod.id}
                                    onPress={() => toggleModuleExpansion(mod.id)}
                                    mod={mod}
                                    disabled={!mod.unlocked}
                                />
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
                                                    concept.unlocked ? navigation.navigate('ConceptGuide', { conceptId: concept.id }) : console.log('No se encuentra la guia')
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
                    ))


                }
            </ScrollView>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222831'
    },


    logoutButton: {
        position: 'absolute',
        right: 1,
        zIndex: 2,
        top: 7.5,
        marginRight: 5,
    },

    scrollContainer: {
        padding: 20
    },
    progressTitle: {
        fontSize: 20,
        color: '#EEEEEE',

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

    starsWrapper: {
        flex: 1,
        height: 24,
        position: 'relative',
        backgroundColor: '#222831', // Color de fondo principal

    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 2, // Asegura que esté sobre las líneas
        right: 8,
        width: '75%',
    },
    starWrapper: {
        width: 30, // Aumentado para contener el fondo
        alignItems: 'center',
        justifyContent: 'center',
    },
    starBackground: {
        position: 'absolute',
        width: 10, // Diámetro del círculo de fondo
        height: 20,
        borderRadius: 14, // Circular
        backgroundColor: '#222831', // Mismo que el fondo principal
    },
    connectingLineContainer: {
        position: 'absolute',
        left: 10, // Ajuste fino para alineación
        right: 75,
        top: '56.5%',
        height: 3,
        flexDirection: 'row',
        justifyContent: 'space-between',
        transform: [{ translateY: -1 }],
        zIndex: 1,
    },
    connectingSegment: {
        flex: 1,
        height: '100%',
    },



    completedModulesText: {
        color: '#00ADB5',
        fontFamily: 'Din-Round',
        fontSize: 14,
        marginLeft: 15,
    },

    timelineContainerStar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 16,
        paddingHorizontal: 2,
        marginBottom: 22,
    },
    modulesContainer: {
        width: '100%',
        gap: 12,
    },

    headerIcons: {
        position: 'absolute',
        right: 0,
        top: 7.5,
        flexDirection: 'row',
        gap: 15,
    },
    profileButton: {
        marginTop: 2,
    },


    /*Dropdown*/

    profileSection: {
        marginTop: 8,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    profileIcon: {
        marginRight: 10,
    },

    chevronIcon: {
        marginLeft: 8,
        marginTop: 2,
    },

    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
        paddingHorizontal: 1,
        position: 'relative',
        marginTop: 12,
    },
    profileContainer: {
        alignItems: 'flex-end',
    },
    profileContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    profileTextContainer: {
        alignItems: 'flex-end',
    },
    userName: {
        color: '#EEEEEE',
        fontSize: 16,
        fontFamily: 'Din-Round',
        maxWidth: 150,
    },
    dropdownMenu: {
        position: 'absolute',
        right: 10,
        top: 45,
        backgroundColor: '#393E46',
        borderRadius: 12,
        paddingVertical: 8,
        width: 180,
        elevation: 5,
        zIndex: 100,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    menuItemText: {
        color: '#EEEEEE',
        fontSize: 16,
        marginLeft: 12,
        fontFamily: 'Din-Round',
    },
    divider: {
        height: 1,
        backgroundColor: '#4A4F57',
        marginVertical: 4,
    },
    dropdownOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 99,
    },
    welcomeTitle: {
        color: '#fff',
        fontSize: 26,
        marginBottom: 4,
    },

    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#222831',
    },
    loadingText: {
        color: '#00ADB5',
        fontSize: 22,
        marginTop: 20,
        fontFamily: 'Din-Round',
        opacity: 0.9,
    },



});

export default Dashboard;
