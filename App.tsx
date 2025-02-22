import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Principal from 'components/InterfazPrincipal';
import LoginForm from 'components/LoginForm';
import Dashboard from 'components/Dashboard';
import registerForm from 'components/registerForm';
import ConceptGuide from 'components/ConceptGuide';
import ExercisesScreen from 'components/ExercisesScreen';
import { StatusBar } from 'expo-status-bar';
import DatabaseManager from './components/db/db';
import { useFonts } from 'expo-font';
import { ActivityIndicator, View } from 'react-native';
import { ProgressProvider } from './components/contexts/ProgressContext';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Din-Round': require('./assets/dinroundpro_bold.otf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor:'#222831' }}>
        <ActivityIndicator size="large" color="#EEEEEE" />
      </View>
    );
  }

  return (
    <>
    <DatabaseManager />
    <NavigationContainer
        theme={DarkTheme
        }>
      
      <ProgressProvider>
        
          <Stack.Navigator initialRouteName="Principal">
            <Stack.Screen
              name="Principal"
              component={Principal}
              options={{ headerShown: false, presentation: 'transparentModal'
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
              name="Exercises"
              component={ExercisesScreen}
              options={{ headerShown: false, presentation: 'transparentModal' }}
            />
            <Stack.Screen
              name="ConceptGuide"
              component={ConceptGuide}
              options={{ headerShown: false, presentation: 'transparentModal' }}
            />
            <Stack.Screen
              name="Dashboard"
              component={Dashboard}
              options={{ headerShown: false, presentation: 'transparentModal' }}
            />
            <Stack.Screen
              name="LoginForm"
              component={LoginForm}
              options={{
                title: 'Ingresa tus datos',
                headerBackTitle: 'Volver',
                headerTitleAlign: 'center',
                headerStyle: {
                  backgroundColor: '#222831', // Dark background color
                },
                headerTintColor: '#EEEEEE',
                headerTitleStyle: {
                  fontFamily: 'Din-Round',
                  color: '#EEEEEE', // Explicit text color for title
                },
                presentation: 'transparentModal'

              }}
            />
          </Stack.Navigator>
          <StatusBar style="auto" />
        
      </ProgressProvider>
      </NavigationContainer>
    </>
  );
}