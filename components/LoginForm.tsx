import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Animated,
} from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import animation from '../assets/login_animated.json';
import { Ionicons } from '@expo/vector-icons';

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
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const notificationAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (errorMessage) {
      Animated.timing(notificationAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }).start();

      timeoutRef.current = setTimeout(() => {
        Animated.timing(notificationAnim, {
          toValue: -100,
          duration: 700,
          useNativeDriver: true,
        }).start(() => setErrorMessage(''));
      }, 1700);
    }
  }, [errorMessage]);

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

  const validateEmail = (text: string): void => {
    setEmailError(
      text.trim() === ''
        ? 'El correo electrónico es requerido'
        : !text.includes('@')
          ? 'El correo electrónico debe contener "@"'
          : ''
    );
  };

  const validatePassword = (text: string): void => {
    setPasswordError(
      text.trim() === ''
        ? 'La contraseña es requerida'
        : text.length < 6
          ? 'La contraseña debe tener al menos 6 caracteres'
          : ''
    );
  };

  const handleEmailChange = (text: string): void => {
    setEmail(text);
    validateEmail(text);
  };

  const handlePasswordChange = (text: string): void => {
    setPassword(text);
    validatePassword(text);
  };

  const showError = (message: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setErrorMessage(message);
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
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
          setTimeout(() => navigation.navigate('Dashboard'));
        } else {
          showError('Correo o contraseña incorrectos.');
        }
      } catch (error) {
        console.error('Error:', error);
        showError('Error al iniciar sesión');
      }
    }
  };

  if (!fontsLoaded || !db) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <LottieView
          source={animation}
          autoPlay
          loop
          style={styles.animation}
          colorFilters={[
            {
              keypath: "bg",
              color: "transparent"
            }
          ]}
        />
        <Text style={[styles.title, { fontFamily: 'Din-Round' }]}>Iniciar sesión</Text>

        {/* Notificación de error */}
        {errorMessage ? (
          <Animated.View
            style={[
              styles.notification,
              {
                transform: [{ translateY: notificationAnim }],
                opacity: notificationAnim.interpolate({
                  inputRange: [-100, 0],
                  outputRange: [0, 1]
                })
              }
            ]}
          >

            <View style={{ position: 'relative' }}>
              <Ionicons name="close-circle" size={28} color="#f44336" />
              <Ionicons
                name="close"
                size={18}
                color="white"
                style={{
                  position: 'absolute',
                  top: 5,
                  left: 5
                }}
              />
            </View>



            <Text style={styles.notificationText}>

              {errorMessage}
            </Text>
          </Animated.View>
        ) : null}

        <View style={styles.formContainer}>
          {/* Campo de Email */}
          <TextInput
            style={[styles.input, { fontFamily: 'Din-Round' }]}
            placeholder="Correo electrónico"
            placeholderTextColor="#888"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
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
              autoCapitalize="none"
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
            activeOpacity={0.8}
          >
            <Text style={[styles.primaryButtonText, { fontFamily: 'Din-Round' }]}>INGRESAR</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    marginTop: 10,
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
    marginBottom: 15,
    fontFamily: 'Din-Round',
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
    marginBottom: 5,
  },
  animation: {
    width: 270,
    height: 270,
    marginBottom: 20,
  },
  notification: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: '#222831',
    padding: 13,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    right: 15,
  },
  notificationText: {
    color: 'white',
    marginLeft: 5,
    fontFamily: 'Din-Round',
    fontSize: 17,
  },
});

export default LoginForm;