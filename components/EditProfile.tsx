import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { auth, db } from './db/db';
import { doc, updateDoc } from 'firebase/firestore';

type RootStackParamList = {
    Dashboard: undefined;
};

const EditProfile: React.FC = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [fontsLoaded] = useFonts({
        'Din-Round': require('../assets/dinroundpro_bold.otf'),
    });
    
    const [user, setUser] = useState({
        firstname: '',
        secondname: '',
        email: ''
    });

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const data = await AsyncStorage.getItem('userData');
                if (data) {
                    const userData = JSON.parse(data);
                    setUser({
                        firstname: userData.firstname,
                        secondname: userData.secondname,
                        email: userData.email
                    });
                }
            } catch (error) {
                Alert.alert('Error', 'No se pudieron cargar los datos del usuario');
            }
        };
        loadUserData();
    }, []);

    const handleSave = async () => {
        if (!user.firstname.trim() || !user.secondname.trim()) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        try {
            const userRef = doc(db, 'users', auth.currentUser?.uid || '');
            await updateDoc(userRef, {
                firstname: user.firstname,
                secondname: user.secondname
            });
            const updatedUser = {
                ...user,
                uid: auth.currentUser?.uid,
                email: auth.currentUser?.email
            };
            await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
            navigation.navigate('Dashboard');
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            Alert.alert('Error', 'No se pudieron guardar los cambios');
        }
    };

    if (!fontsLoaded) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#00ADB5" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View 
                entering={FadeIn.duration(300)}
                exiting={FadeOut.duration(200)}
                style={styles.content}
            >
                <View style={styles.header}>
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={28} color="#ffffff" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Editar Perfil</Text>
                </View>

                <View style={styles.profileHeader}>
                    <Ionicons name="person-circle" size={165} color="#00ADB5" />
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Nombre</Text>
                        <TextInput
                            style={styles.input}
                            value={user.firstname}
                            onChangeText={text => setUser(prev => ({...prev, firstname: text}))}
                            placeholder="Ingresa tu nombre"
                            placeholderTextColor="#888"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Apellido</Text>
                        <TextInput
                            style={styles.input}
                            value={user.secondname}
                            onChangeText={text => setUser(prev => ({...prev, secondname: text}))}
                            placeholder="Ingresa tu apellido"
                            placeholderTextColor="#888"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Correo electrónico</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={user.email}
                            editable={false}
                            placeholderTextColor="#888"
                        />
                    </View>
                </View>

                <TouchableOpacity 
                    style={[
                        styles.primaryButton,
                        (!user.firstname.trim() || !user.secondname.trim()) && styles.disabledButton
                    ]} 
                    onPress={handleSave}
                    disabled={!user.firstname.trim() || !user.secondname.trim()}
                >
                    <Text style={styles.primaryButtonText}>GUARDAR CAMBIOS</Text>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222831'
    },
     content: {
        flex: 1,
        padding: 20,
        marginBottom: 30, // Reducido para mejor ajuste
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    backButton: {
        position: 'absolute',
        left: 0,
        zIndex: 1, 
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontFamily: 'Din-Round',
    },
    profileHeader: {
        alignItems: 'center',
        marginVertical: 20,
    },
    formContainer: {
        marginBottom: 15,
        width: '100%',
    },
    inputContainer: {
        marginBottom: 15,
        width: '100%',
    },
    label: {
        color: '#EEEEEE',
        fontSize: 16,
        marginBottom: 10,
        fontFamily: 'Din-Round',
    },
    input: {
        backgroundColor: '#393E46',
        color: '#EEEEEE',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        fontFamily: 'Din-Round',
        borderWidth: 2,
        borderColor: '#00ADB5',
    },
    disabledInput: {
        backgroundColor: '#2D3238',
        borderColor: '#393E46',
        color: '#888',
    },
    primaryButton: {
        backgroundColor: '#00ADB5',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        width: '100%',
    },
    primaryButtonText: {
        color: '#EEEEEE',
        fontFamily: 'Din-Round',
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#393E46',
        opacity: 0.7,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#222831'
    }
});

export default EditProfile;