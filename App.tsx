import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Principal from 'components/InterfazPrincipal';
import LoginForm from 'components/LoginForm';
import Dashboard from 'components/Dashboard';
import registerForm from 'components/registerForm';
import ConceptGuide from 'components/ConceptGuide';
import ExercisesScreen from 'components/ExercisesScreen';
import EditProfile from 'components/EditProfile';
import resetPassword from 'components/resetPassword'
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { ProgressProvider } from './components/contexts/ProgressContext';
const Stack = createNativeStackNavigator();
export default function App() {
  const [fontsLoaded] = useFonts({
    'Din-Round': require('./assets/dinroundpro_bold.otf'),
  });
  if (!fontsLoaded) {
          return (
              <View style={styles.loaderContainer}>
                  <ActivityIndicator
                      size="large"
                      color="#00ADB5"
                      style={{ transform: [{ scale: 1.4 }] }}
                  />
                  <Text style={styles.loadingText}>
                      Cargando..
                  </Text>
              </View>
          );
      }

  return (
    <>
      <NavigationContainer>
        <ProgressProvider>
          <Stack.Navigator
            initialRouteName="Principal"
            screenOptions={{
              presentation: 'transparentModal',
              animation: 'fade'
            }}
          >
            <Stack.Screen
              name="Principal"
              component={Principal}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="registerForm"
              component={registerForm}
              options={{
                title: 'Ingresa tus datos',
                headerBackTitle: 'Volver',
                headerTitleAlign: 'center',
                headerStyle: {
                  backgroundColor: '#222831',
                },
                headerTintColor: '#EEEEEE',
                headerTitleStyle: {
                  fontFamily: 'Din-Round',
                  color: '#EEEEEE',
                },
                presentation: 'transparentModal'
              }}
            />
            <Stack.Screen
              name="resetPassword"
              component={resetPassword}
              options={{
                title: 'Ingresa tus datos',
                headerBackTitle: 'Volver',
                headerTitleAlign: 'center',
                headerStyle: {
                  backgroundColor: '#222831',
                },
                headerTintColor: '#EEEEEE',
                headerTitleStyle: {
                  fontFamily: 'Din-Round',
                  color: '#EEEEEE',
                },
                presentation: 'transparentModal'
              }}
            />
            <Stack.Screen
              name="Exercises"
              component={ExercisesScreen}
              options={{ headerShown: false, presentation: 'transparentModal', animation: 'fade' }}
            />
            <Stack.Screen
              name="ConceptGuide"
              component={ConceptGuide}
              options={{ headerShown: false, presentation: 'transparentModal', animation: 'fade' }}
            />
            <Stack.Screen
              name="Dashboard"
              component={Dashboard}
              options={{ headerShown: false, presentation: 'transparentModal', animation: 'fade' }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfile}
              options={{ headerShown: false, presentation: 'transparentModal', animation: 'fade' }}
            />
            <Stack.Screen
              name="LoginForm"
              component={LoginForm}
              options={{
                title: 'Ingresa tus datos',
                headerTitleAlign: 'center',
                headerStyle: {
                  backgroundColor: '#222831',
                },
                headerTintColor: '#EEEEEE',
                headerTitleStyle: {
                  fontFamily: 'Din-Round',
                  color: '#EEEEEE',
                },
              }}
            />
          </Stack.Navigator>
          <StatusBar style="dark"  backgroundColor="#222831"  translucent={true} />

        </ProgressProvider>
      </NavigationContainer>
    </>
  );
}



const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#222831',
    },
    loadingText: {
        color: '#00ADB5',
        fontSize: 22,
        marginTop: 20,
        fontFamily: 'Din-Round',
        opacity: 0.9,
    },

})