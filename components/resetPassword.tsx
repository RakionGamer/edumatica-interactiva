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
import LottieView from 'lottie-react-native';
import animation from '../assets/recover_password.json';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { auth, db } from './db/db';
import { sendPasswordResetEmail } from 'firebase/auth';
import { collection, getDocs, where, query } from 'firebase/firestore';

const RecoveryPassword: React.FC = () => {
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    'Din-Round': require('../assets/dinroundpro_bold.otf'),
  });
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const processingAnim = useRef(new Animated.Value(-100)).current;
  const notificationAnim = useRef(new Animated.Value(-100)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);



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
    return () => anim.stop();
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

  const showError = (message: string) => {
    setIsProcessing(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

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

      Animated.timing(notificationAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleSendRecovery = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setErrorMessage('');

    const currentConnection = await NetInfo.fetch();
    if (!currentConnection.isConnected) {
      showError('No hay conexión a internet');
      return;
    }

    try {
      // OPCIÓN 1: Si tienes una colección "users" y el email está en un campo "email"
      const usersQuery = query(
        collection(db, 'users'), 
        where('email', '==', email.toLowerCase())
      );
      const querySnapshot = await getDocs(usersQuery);
      
      if (querySnapshot.empty) {
        showError('El correo no está registrado');
        return;
      }

      await sendPasswordResetEmail(auth, email);
      showError('¡Correo enviado! Revisa tu bandeja de entrada');
      setTimeout(() => navigation.goBack(), 2000);

    } catch (error: any) {
      console.error(error);
      let errorMessage = 'Error al enviar el correo. Intente nuevamente.';
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'El formato del correo es inválido';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos. Intente más tarde';
      }
      
      showError(errorMessage);
    }
  };

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#00ADB5" />
      </SafeAreaView>
    );
  }

  const isFormValid = email.trim() !== '' && !emailError;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <LottieView
          source={animation}
          autoPlay
          loop
          style={styles.animation}
          colorFilters={[{ keypath: "bg", color: "transparent" }]}
        />

        <Text style={[styles.title, { fontFamily: 'Din-Round' }]}>
          Recuperar contraseña
        </Text>

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
              <Ionicons 
                name={errorMessage.includes('¡Correo enviado!') ? "checkmark-circle" : "close-circle"} 
                size={28} 
                color={errorMessage.includes('¡Correo enviado!') ? "#4CAF50" : "#f44336"} 
              />
              {!errorMessage.includes('¡Correo enviado!') && (
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
              )}
            </View>
            <Text style={styles.notificationText}>
              {errorMessage}
            </Text>
          </Animated.View>
        ) : null}

        <View style={styles.formContainer}>
          <TextInput
            style={[styles.input, { fontFamily: 'Din-Round' }]}
            placeholder="Correo electrónico registrado"
            placeholderTextColor="#888"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              validateEmail(text);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailError && <Text style={styles.errorText}>{emailError}</Text>}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!isFormValid || isProcessing) && styles.disabledButton,
            ]}
            onPress={handleSendRecovery}
            disabled={!isFormValid || isProcessing}
          >
            <Text style={[styles.primaryButtonText, { fontFamily: 'Din-Round' }]}>
              ENVIAR INSTRUCCIONES
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
    backgroundColor: '#222831',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginBottom: 120,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#EEEEEE',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
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
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF616D',
    alignSelf: 'flex-start',
    marginLeft: 15,
    marginBottom: 15,
    fontFamily: 'Din-Round',
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
  },
});

export default RecoveryPassword;