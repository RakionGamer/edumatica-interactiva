import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import animation from '../assets/index.json';
import EducationIcon from '../assets/education-cap-svgrepo-com.svg';
import { useFocusEffect } from '@react-navigation/native';
import { Animated } from 'react-native';

const Principal = () => {
  const navigation = useNavigation();
  const fadeAnim = new Animated.Value(0);
  const headerY = new Animated.Value(0);
  const contentY = new Animated.Value(0);
  const buttonsY = new Animated.Value(0);
  
  const animateElements = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(headerY, {
        toValue: 0,
        duration: 600,
        delay: 10,
        useNativeDriver: true,
      }),
      
      Animated.timing(contentY, {
        toValue: 0,
        duration: 600,
        delay: 10,
        useNativeDriver: true,
      }),
      
      Animated.timing(buttonsY, {
        toValue: 0,
        duration: 550,
        delay: 10,
        useNativeDriver: true,
      })
    ]).start();
  };

  useFocusEffect(() => {
    fadeAnim.setValue(0);
    headerY.setValue(-15);
    contentY.setValue(-20);
    buttonsY.setValue(20);
    animateElements();
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header con animación */}
        <Animated.View style={[styles.headerFlex, {
          opacity: fadeAnim,
          transform: [{ translateY: headerY }]
        }]}>
          <EducationIcon
            width={45} 
            height={45}
            fill="#EEEEEE"
          />
          <Text style={[styles.titleHeader, { fontFamily: 'Din-Round' }]}>
            Edúmatica Interactiva
          </Text>
        </Animated.View>

        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: contentY }]
        }}>
          <LottieView
            source={animation}
            autoPlay
            loop
            style={[styles.animation, { backgroundColor: 'transparent' }]}
          />
        </Animated.View>

        <Animated.View style={[styles.textContainer, {
          opacity: fadeAnim,
          transform: [{ translateY: contentY }]
        }]}>
          <Text style={[styles.title, { fontFamily: 'Din-Round' }]}>
            La forma divertida, efectiva y gratis de aprender matemáticas!
          </Text>
        </Animated.View>

        <Animated.View style={[styles.buttonsContainer, {
          opacity: fadeAnim,
          transform: [{ translateY: buttonsY }]
        }]}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('registerForm' as never)}
          >
            <Text style={[styles.primaryButtonText, { fontFamily: 'Din-Round' }]}>
              EMPIEZA AHORA
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('LoginForm' as never)}
          >
            <Text style={[styles.secondaryButtonText, { fontFamily: 'Din-Round' }]}>
              YA TENGO UNA CUENTA
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222831',
  },
  headerFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,                  
    paddingHorizontal: 22,    // Padding lateral para evitar bordes pegados
  },
  titleHeader: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#EEEEEE',
    flexShrink: 1,            
    paddingTop: 4,         
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
  },
  logo: {
    top: 25,
    width: 170,
    height: 170,
    resizeMode: 'contain',
    borderRadius: 100,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#EEEEEE',
    textAlign: 'center',
    marginVertical: 4,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#00ADB5',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#EEEEEE',
    fontWeight: 'bold',
    fontSize: 18,
  },
  secondaryButton: {
    borderColor: '#00ADB5',
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#00ADB5',
    fontWeight: 'bold',
    fontSize: 16,
  },


  animation: {
    width: 300,
    height: 300,
    top: 15,
  },
});

export default Principal;
