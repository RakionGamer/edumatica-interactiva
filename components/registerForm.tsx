import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated
} from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

import { auth, db } from './db/db'; // Importa desde tu archivo de configuración
import { collection, doc, writeBatch } from "firebase/firestore";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import NetInfo from '@react-native-community/netinfo';




const RegisterForm: React.FC = () => {
  const [fontsLoaded] = useFonts({
    'Din-Round': require('../assets/dinroundpro_bold.otf'),
  });


  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstname, setFirstname] = useState<string>('');
  const [secondname, setSecondname] = useState<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [sucessMessage, setSuccessMessage] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const notificationAnim = useRef(new Animated.Value(-100)).current;
  const processingAnim = useRef(new Animated.Value(-100)).current;
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

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


  useEffect(() => {
    if (sucessMessage) {
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
        }).start(() => setSuccessMessage(''));
      }, 1700);

    }
  }, [sucessMessage]);



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

  const showSuccess = (message: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSuccessMessage(message);
  };


  const validateEmail = (text: string) => {
    if (text.trim() === '') {
      setEmailError('El correo electrónico es requerido');
    } else if (!text.includes('@')) {
      setEmailError('El correo electrónico debe contener "@"');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (text: string) => {
    if (text.trim() === '') {
      setPasswordError('La contraseña es requerida');
    } else if (text.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
    } else {
      setPasswordError('');
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    validateEmail(text);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    validatePassword(text);
  };

  const handleFirstnameChange = (text: string) => {
    const filtered = text.replace(/[0-9]/g, '');
    setFirstname(filtered);
  };

  const handleSecondnameChange = (text: string) => {
    const filtered = text.replace(/[0-9]/g, '');
    setSecondname(filtered);
  };

  const handleRegister = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setErrorMessage('');
    const currentConnection = await NetInfo.fetch();
    if (!currentConnection.isConnected) {
      showError('Se requiere conexión a internet');
      return;
    }


    if (!email.trim() || !password.trim() || !firstname.trim() || !secondname.trim()) {
      setMessage('Todos los campos son obligatorios.');
      return;
    }

    if (emailError || passwordError) {
      setMessage('Corrige los errores antes de continuar.');
      return;
    }

    try {
      // 1. Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (user) {
        const batch = writeBatch(db);
        const userRef = doc(db, "users", user.uid);
        batch.set(userRef, {
          email: email,
          firstname: firstname,
          secondname: secondname,
          password: password,
          createdAt: new Date()
        });

        const defaultModules = [{
          id: 1,
          title: 'Números y Operaciones',
          description: 'Conceptos básicos.',
          unlocked: true,
          completed: false,
          concepts: [
            { id: 1, name: 'Suma', progress: 0, unlocked: true, completed: false },
            { id: 2, name: 'Resta', progress: 0, unlocked: false, completed: false },
            { id: 3, name: 'Multiplicación', progress: 0, unlocked: false, completed: false },
            { id: 4, name: 'División', progress: 0, unlocked: false, completed: false },
            { id: 5, name: 'Examen Integrado', progress: 0, unlocked: false, completed: false },
          ]
        },
        {
          id: 2,
          title: 'Álgebra',
          description: 'Ecuaciones y expresiones.',
          unlocked: false,
          completed: false,
          concepts: [
            { id: 5, name: 'Ecuaciones lineales', progress: 0, unlocked: false, completed: false },
            { id: 6, name: 'Factorización', progress: 0, unlocked: false, completed: false },
          ]
        },
        {
          id: 3,
          title: 'Geometría',
          description: 'Figuras y espacios.',
          unlocked: false,
          completed: false,
          concepts: [
            { id: 7, name: 'Áreas y perímetros', progress: 0, unlocked: false, completed: false },
            { id: 8, name: 'Volúmenes', progress: 0, unlocked: false, completed: false },
          ]
        }];

        defaultModules.forEach(module => {
          const moduleRef = doc(collection(userRef, "modules"), module.id.toString());
          batch.set(moduleRef, module);
        });

        await batch.commit();


        showSuccess('Usuario registrado exitosamente.');
        setEmail('');
        setPassword('');
        setFirstname('');
        setSecondname('');
        setIsProcessing(false);

      }
    } catch (error) {
      console.error('Error durante el registro:', error);



      showError(errorMessage);
    }
  };




  const isFormValid = 
  email.trim() !== '' && 
  password.trim() !== '' && 
  firstname.trim() !== '' && 
  secondname.trim() !== '' &&
  !emailError &&
  !passwordError;


  if (!fontsLoaded || !db) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontFamily: 'Din-Round' }]}>Registro de Usuario</Text>

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


      {
        errorMessage ?
          (
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
          )
          : null
      }
      {
        sucessMessage ?
          (
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
                <Ionicons name="checkmark-circle" size={28} color="#0bc904" />
                <Ionicons
                  name="checkmark"
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
                {sucessMessage}
              </Text>
            </Animated.View>
          )
          : null}


      <TextInput
        style={[styles.input, { fontFamily: 'Din-Round' }]}
        placeholder="Nombre"
        placeholderTextColor="#7D7D7D"
        value={firstname}
        onChangeText={handleFirstnameChange}
      />
      <TextInput
        style={[styles.input, { fontFamily: 'Din-Round' }]}
        placeholder="Apellido"
        placeholderTextColor="#7D7D7D"
        value={secondname}
        onChangeText={handleSecondnameChange}
      />
      <TextInput
        style={[styles.input, { fontFamily: 'Din-Round' }]}
        placeholder="Correo electrónico"
        placeholderTextColor="#7D7D7D"
        value={email}
        onChangeText={handleEmailChange}
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      <TextInput
        style={[styles.input, { fontFamily: 'Din-Round' }]}
        placeholder="Contraseña"
        placeholderTextColor="#7D7D7D"
        secureTextEntry
        value={password}
        onChangeText={handlePasswordChange}
      />
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
      <TouchableOpacity
        style={[
          styles.button,
          !isFormValid && styles.disabledButton
        ]}
        onPress={handleRegister}
        activeOpacity={0.8}
        disabled={!isFormValid || isProcessing} // Deshabilitar también durante el procesamiento
      >
        <Text style={[styles.buttonText, { fontFamily: 'Din-Round' }]}>
          REGISTRARSE
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#222831'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#EEEEEE', // Changed to light text
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#00ADB5', // Accent color border
    backgroundColor: '#393E46', // Darker background for inputs
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#EEEEEE', // Light text color
  },
  button: {
    backgroundColor: '#00ADB5', // Accent color
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#EEEEEE', // Light text 
    fontSize: 18,
    fontWeight: 'bold'
  },
  messageText: {
    textAlign: 'center',
    marginBottom: 15,
    color: '#FF616D', // Error red from previous theme
    fontSize: 16,
  },
  errorText: {
    color: '#FF616D', // Matching error color
    marginBottom: 10,
    fontSize: 14,
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

export default RegisterForm;
