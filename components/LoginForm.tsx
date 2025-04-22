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
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import animation from '../assets/login_animated.json';
import { Ionicons } from '@expo/vector-icons';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  query,
  where,
  getDocs
} from "firebase/firestore";
import NetInfo from '@react-native-community/netinfo';
import { db } from './db/db';


const LoginForm: React.FC = () => {
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    'Din-Round': require('../assets/dinroundpro_bold.otf'),
  });
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingAnim = useRef(new Animated.Value(-100)).current;

  const notificationAnim = useRef(new Animated.Value(-100)).current;
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let anim: Animated.CompositeAnimation;

    if (isProcessing) {
      anim = Animated.timing(processingAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      });
    } else {
      anim = Animated.timing(processingAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      });
    }

    anim.start();
    return () => anim.stop(); // Detener animación si el componente se desmonta
  }, [isProcessing]);


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
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isConnected === false) {
      showError('No hay conexión a internet');
    }
  }, [isConnected]);





  const handleLogin = async (): Promise<void> => {
    if (isProcessing) return;
    setIsProcessing(true);
    setErrorMessage('');

    const currentConnection = await NetInfo.fetch();
    if (!currentConnection.isConnected) {
      showError("No hay conexión a internet");
      return;
    }
    if (!emailError && !passwordError && email && password) {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          showError("Usuario o contraseña incorrectas.");
          return;
        }
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        if (userData.password === password) {
          await AsyncStorage.setItem("userData", JSON.stringify({
            uid: userDoc.id,
            ...userData
          }));
          navigation.reset({
            index: 0,
            routes: [{ name: 'Dashboard' as never }]
          });
        } else {
          showError("Usuario o contraseña incorrectas.");
        }
      } catch (error) {
        console.error("Error:", error);
        showError("Error de conexión o no hay acceso a internet.");
      }
    }
  };
  useEffect(() => {
    return () => {
      notificationAnim.stopAnimation();
      processingAnim.stopAnimation();
    };
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
    setIsProcessing(false); // Asegurar que primero se desactiva el procesamiento
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Reiniciar posición de ambas animaciones
    Animated.parallel([
      Animated.timing(processingAnim, {
        toValue: -100,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.timing(notificationAnim, {
        toValue: -100,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setErrorMessage(message);

      // Animación de entrada para el error
      Animated.timing(notificationAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#00ADB5" />
      </SafeAreaView>
    );
  }

  {
    isConnected === null && (
      <ActivityIndicator size="large" color="#00ADB5" />
    )
  }

  const isFormValid = 
  email.trim() !== '' && 
  password.trim() !== '' && 
  !emailError &&
  !passwordError;


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


        <Animated.View
          style={[
            styles.processingNotification,
            {
              transform: [{ translateY: processingAnim }],
              opacity: processingAnim.interpolate({
                inputRange: [-100, 0],
                outputRange: [0, 1],
              }),
            },
          ]}
        >
          <ActivityIndicator size="small" color="#00ADB5" />
          <Text style={styles.processingNotificationText}>Procesando solicitud...</Text>
        </Animated.View>

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
                  style={[
                    styles.primaryButton,
                    !isFormValid && styles.disabledButton
                  ]}
                  onPress={handleLogin}
                  activeOpacity={0.8}
                  disabled={!isFormValid || isProcessing} // Deshabilitar también durante el procesamiento
                >
                  <Text style={[styles.primaryButtonText, { fontFamily: 'Din-Round' }]}>
                    REGISTRARSE
                  </Text>
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
    marginBottom: 120,
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

  processingNotification: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: '#222831',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  processingNotificationText: {
    color: '#EEEEEE',
    marginLeft: 10,
    fontFamily: 'Din-Round',
    fontSize: 16,
  },

  disabledButton: {
    backgroundColor: '#393E46',
    opacity: 0.7,
  }
});

export default LoginForm;