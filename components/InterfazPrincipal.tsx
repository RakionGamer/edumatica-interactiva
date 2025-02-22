import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { SvgUri } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import animation from '../assets/index.json';
const Principal = () => {
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    'Din-Round': require('../assets/dinroundpro_bold.otf'),
  });


  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerFlex}>
        <SvgUri
          uri="https://www.svgrepo.com/show/443633/education-cap.svg"
          width="20%"
          height="20%"
          fill="#EEEEEE"
          style={styles.paddingSvg}>
        </SvgUri>
        <Text style={[styles.titleHeader, { fontFamily: 'Din-Round' }]}>Edúmatica Interactiva</Text>
      </View>
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
        {/* Texto principal */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { fontFamily: 'Din-Round' }]}>La forma divertida, efectiva y gratis de aprender matematicas!</Text>
        </View>
        {/* Botones */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('registerForm')}
          >
            <Text style={[styles.primaryButtonText,{ fontFamily: 'Din-Round' }]}>EMPIEZA AHORA</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('LoginForm')}
          >
            <Text style={[styles.secondaryButtonText, { fontFamily: 'Din-Round' }]}>YA TENGO UNA CUENTA</Text>
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
  headerFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', 
    marginTop: 40,
    width: '100%', 
    position: 'relative', 
  },
  paddingSvg: {
    padding: 20,
  },
  titleHeader: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#EEEEEE',
    textAlign: 'center',
    right: 15,
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
