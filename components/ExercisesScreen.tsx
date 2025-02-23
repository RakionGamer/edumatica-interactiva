import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Keyboard } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useProgress } from './contexts/ProgressContext';

interface Exercise {
  problem: string;
  answer: number;
}

const EXERCISES: { [key: number]: Exercise[] } = {
  1: [
    { problem: '3 + 5 = ?', answer: 8 },
    { problem: '7 + 2 = ?', answer: 9 },
    { problem: '4 + 6 = ?', answer: 10 },
    { problem: '8 + 8 = ?', answer: 16 },
  ],
  2: [
    { problem: '10 - 3 = ?', answer: 7 },
    { problem: '15 - 8 = ?', answer: 7 },
    { problem: '9 - 4 = ?', answer: 5 },
    { problem: '10 - 4 = ?', answer: 6 },
  ],
  3: [
    { problem: '1 x 1 = ?', answer: 1 },
    { problem: '2 x 2 = ?', answer: 2 },
    { problem: '3 x 3 = ?', answer: 3 },
    { problem: '4 x 4 = ?', answer: 4 },
  ],
  4: [
    { problem: '4 / 4 = ?', answer: 1 },
    { problem: '5 / 5 = ?', answer: 1 },
    { problem: '6 / 6 = ?', answer: 1 },
    { problem: '9 / 9 = ?', answer: 1 },
  ],
};

const ExercisesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { conceptId } = route.params as { conceptId: number };
  const { updateConceptProgress } = useProgress();
  const [currentExercise, setCurrentExercise] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [userAnswer, setUserAnswer] = useState('');
  const [scoreAdded, setScoreAdded] = useState(0);

  const exercises = EXERCISES[conceptId] || [];
  const currentProblem = exercises[currentExercise];

  const handleAnswer = () => {
    Keyboard.dismiss();
    if (!currentProblem) return;

    const parsedAnswer = parseInt(userAnswer);
    if (isNaN(parsedAnswer)) {
      Alert.alert('Error', 'Ingresa un número válido');
      return;
    }

    if (parsedAnswer === currentProblem.answer) {
      const newScore = scoreAdded + 25;
      updateConceptProgress(conceptId, 25);
      setScoreAdded(newScore);

      if (currentExercise + 1 < exercises.length) {
        setCurrentExercise(prev => prev + 1);
        setAttemptsLeft(3);
      } else {
        Alert.alert('¡Buen trabajo!', `Has completado todos los ejercicios (+${newScore}%)`);
        navigation.navigate('Dashboard');
      }
    } else {
      if (attemptsLeft === 1) {
        updateConceptProgress(conceptId, -15);
        Alert.alert('¡Oh no!', 'Has perdido 15% de progreso');
        navigation.navigate('Dashboard');
      } else {
        setAttemptsLeft(prev => prev - 1);
        Alert.alert('Incorrecto', `Intentos restantes: ${attemptsLeft - 1}`);
      }
    }
    setUserAnswer('');
  };

  if (!currentProblem) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No hay ejercicios disponibles</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInUp.duration(600)} style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Ejercicios Prácticos</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.problemText}>{currentProblem.problem}</Text>
          
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Escribe tu respuesta"
            placeholderTextColor="#666"
            value={userAnswer}
            onChangeText={setUserAnswer}
          />

          <View style={styles.statusContainer}>
            <Text style={styles.attemptsText}>Intentos restantes: {attemptsLeft}</Text>
            <Text style={styles.scoreText}>Progreso: +{scoreAdded}%</Text>
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleAnswer}
            disabled={!userAnswer}
          >
            <Text style={styles.buttonText}>Verificar Respuesta</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222831',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 15
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginLeft: 20,
    fontFamily: 'Din-Round',
  },
  card: {
    backgroundColor: '#393E46',
    borderRadius: 15,
    padding: 25,
    elevation: 3,
  },
  problemText: {
    color: '#00ADB5',
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Din-Round',
  },
  input: {
    backgroundColor: '#2D333B',
    color: '#fff',
    fontSize: 18,
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
    fontFamily: 'Din-Round',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  attemptsText: {
    color: '#EEEEEE',
    fontSize: 16,
  },
  scoreText: {
    color: '#00ADB5',
    fontSize: 16,
    fontFamily: 'Din-Round',
  },
  button: {
    backgroundColor: '#00ADB5',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Din-Round',
  },
});

export default ExercisesScreen;