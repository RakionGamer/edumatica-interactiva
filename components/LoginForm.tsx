import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Modal,
  Animated,
} from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import animation from '../assets/login_animated.json';


const LoginForm: React.FC = () => {
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    'Din-Round': require('../assets/dinroundpro_bold.otf'),
  });
  const [db, setDb] = useState<any>(null);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const emailAnim = useRef(new Animated.Value(0)).current;
  const passwordAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = (type: 'email' | 'password') => {
    if (type === 'email') {
      setIsEmailFocused(true);
      Animated.timing(emailAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }).start();
    } else {
      setIsPasswordFocused(true);
      Animated.timing(passwordAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleBlur = (type: 'email' | 'password') => {
    if (type === 'email') {
      setIsEmailFocused(false);
      if (!email) {
        Animated.timing(emailAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }).start();
      }
    } else {
      setIsPasswordFocused(false);
      if (!password) {
        Animated.timing(passwordAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function initDb() {
      try {
        const database = await SQLite.openDatabaseAsync('dbMath.db');
        setDb(database);
      } catch (error) {
        console.error('Error al abrir la base de datos:', error);
      }
    }
    initDb();
  }, []);

  if (!fontsLoaded || !db) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const validateEmail = (text: string): void => {
    setEmailError(text.trim() === '' ? 'El correo electrónico es requerido' : !text.includes('@') ? 'El correo electrónico debe contener "@"' : '');
  };

  const validatePassword = (text: string): void => {
    setPasswordError(text.trim() === '' ? 'La contraseña es requerida' : text.length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : '');
  };

  const handleEmailChange = (text: string): void => {
    setEmail(text);
    validateEmail(text);
  };

  const handlePasswordChange = (text: string): void => {
    setPassword(text);
    validatePassword(text);
  };

  const showModal = (message: string) => {
    setModalMessage(message);
    setModalVisible(true);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  };

  const hideModal = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => setModalVisible(false));
  };

  const handleLogin = async (): Promise<void> => {
    if (!emailError && !passwordError && email && password) {
      try {
        const result = await db.getAllAsync(
          'SELECT firstname, secondname FROM users WHERE email = ? AND password = ?',
          [email, password]
        );

        if (result.length > 0) {
          const userData = result[0];
          await AsyncStorage.setItem('userData', JSON.stringify(userData))
          setTimeout(() => navigation.navigate('Dashboard'));
        } else {
          showModal('Credenciales incorrectas');
        }
      } catch (error) {
        console.error('Error:', error);
        showModal('Error al iniciar sesión');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <LottieView
          source={animation}
          autoPlay
          loop
          style={[styles.animation, { backgroundColor: 'transparent' }]}
          colorFilters={[
            {
              keypath: "bg",
              color: "transparent"
            }
          ]}
        />
        <Text style={[styles.title, { fontFamily: 'Din-Round' }]}>Iniciar sesión</Text>
        <View style={styles.formContainer}>

          {/* Campo de Email */}
          <TextInput
            style={[styles.input, { fontFamily: 'Din-Round' }]}
            placeholder="Correo electrónico"
            placeholderTextColor="#888"
            value={email}
            onChangeText={handleEmailChange}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          {/* Campo de Contraseña */}
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { fontFamily: 'Din-Round' }]}
              placeholder="Contraseña"
              placeholderTextColor="#888"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={handlePasswordChange}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color="#7D7D7D"
              />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          {/* Botón de Ingreso */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLogin}
          >
            <Text style={[styles.primaryButtonText, { fontFamily: 'Din-Round' }]}>INGRESAR</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal */}
      <Modal transparent visible={modalVisible} animationType="none" onRequestClose={hideModal}>
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity onPress={hideModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginBottom: 135,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#EEEEEE',
    marginBottom: 20
  },
  formContainer: {
    width: '100%',
    alignItems: 'center'
  },
  input: {
    width: '100%',
    height: 55,
    borderWidth: 2,
    borderColor: '#00ADB5',
    backgroundColor: '#393E46',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#EEEEEE',
  },
  primaryButton: {
    backgroundColor: '#00ADB5',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#EEEEEE',
    fontSize: 18,
    fontWeight: 'bold'
  },
  errorText: {
    color: '#FF616D',
    alignSelf: 'flex-start',
    marginLeft: 15,
    marginBottom: 15
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#393E46',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center'
  },
  modalText: {
    fontSize: 18,
    color: '#EEEEEE',
    marginBottom: 20
  },
  closeButton: {
    backgroundColor: '#00ADB5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10
  },
  closeButtonText: {
    color: '#EEEEEE',
    fontSize: 16
  },
  icon: {
    position: 'absolute',
    left: 15,
    top: 15,
    zIndex: 2,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 2,
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
  },
  animation: {
    width: 270,
    height: 270,
    marginBottom: 20,
  },
});

export default LoginForm;
