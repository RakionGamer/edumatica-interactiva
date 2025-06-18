import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import animation from '../assets/index.json';
import EducationIcon from '../assets/education-cap-svgrepo-com.svg';
import { Animated } from 'react-native';

const Principal = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.headerFlex, {
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
        }}>
          <LottieView
            source={animation}
            autoPlay
            loop
            style={[styles.animation, { backgroundColor: 'transparent' }]}
          />
        </Animated.View>
        <Animated.View style={[styles.textContainer, {
        }]}>
          <Text style={[styles.title, { fontFamily: 'Din-Round' }]}>
            La forma divertida, efectiva y gratis de aprender matemáticas!
          </Text>
        </Animated.View>
        <Animated.View style={[styles.buttonsContainer, {
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
    paddingHorizontal: 22, 
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
