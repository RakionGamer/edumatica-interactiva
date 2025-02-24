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




const RegisterForm: React.FC = () => {
  const [fontsLoaded] = useFonts({
    'Din-Round': require('../assets/dinroundpro_bold.otf'),
  });

  // Estado para guardar el objeto de base de datos
  const [db, setDb] = useState<any>(null);

  // Inicializamos la base de datos de forma asíncrona
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

  // Estados de los campos del formulario y mensajes
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
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setErrorMessage(message);
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

  // Validación de la contraseña
  const validatePassword = (text: string) => {
    if (text.trim() === '') {
      setPasswordError('La contraseña es requerida');
    } else if (text.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
    } else {
      setPasswordError('');
    }
  };

  // Manejo de cambio en el correo y validación inmediata
  const handleEmailChange = (text: string) => {
    setEmail(text);
    validateEmail(text);
  };

  // Manejo de cambio en la contraseña y validación inmediata
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    validatePassword(text);
  };

  // Para nombre y apellido, eliminamos cualquier dígito al escribir
  const handleFirstnameChange = (text: string) => {
    const filtered = text.replace(/[0-9]/g, '');
    setFirstname(filtered);
  };

  const handleSecondnameChange = (text: string) => {
    const filtered = text.replace(/[0-9]/g, '');
    setSecondname(filtered);
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !firstname.trim() || !secondname.trim()) {
      setMessage('Todos los campos son obligatorios.');
      return;
    }
    if (emailError || passwordError) {
      setMessage('Corrige los errores antes de continuar.');
      return;
    }

    console.log({ email, password, firstname, secondname });

    try {
      const existingEmails = await db.getAllAsync(
        'SELECT email FROM users WHERE email = ?',
        [email]
      );

      if (existingEmails && existingEmails.length > 0) {
        showError('Este correo ya está registrado.');
        return;
      }

      await db.runAsync(
        'INSERT INTO users (email, password, firstname, secondname) VALUES (?, ?, ?, ?)',
        [email, password, firstname, secondname]
      );

      showSuccess('Usuario registrado exitosamente.');
      setEmail('');
      setPassword('');
      setFirstname('');
      setSecondname('');
    } catch (error) {
      if (error) {
        showError('Error interno.');
      } else {
        console.error('Error durante el registro:', error);
        showError('Error al registrar el usuario.');
      }
    }
  };





  if (!fontsLoaded || !db) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontFamily: 'Din-Round' }]}>Registro de Usuario</Text>

      {/* Notificación de error */}
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
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={[styles.buttonText, { fontFamily: 'Din-Round' }]}>Registrar</Text>
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
});

export default RegisterForm;
