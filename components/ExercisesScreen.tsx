import React, { useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Keyboard } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useProgress } from './contexts/ProgressContext';

interface Exercise {
  problem: string;
  answer: number | string;
  difficulty: string;
}

const EXERCISES: { [key: number]: Exercise[] } = {
  // Módulo 1: Números y Operaciones
  1: [ // Suma
    { problem: '23 + 15 = ?', answer: 38, difficulty: 'básico' },
    { problem: '47 + 58 = ?', answer: 105, difficulty: 'básico' },
    { problem: '126 + 234 = ?', answer: 360, difficulty: 'básico' },
    { problem: '899 + 1,101 = ?', answer: 2000, difficulty: 'básico' },
  ],
  2: [ // Resta
    { problem: '35 - 12 = ?', answer: 23, difficulty: 'básico' },
    { problem: '100 - 45 = ?', answer: 55, difficulty: 'básico' },
    { problem: '785 - 299 = ?', answer: 486, difficulty: 'básico' },
    { problem: '1,002 - 567 = ?', answer: 435, difficulty: 'básico' },
  ],
  3: [ // Multiplicación
    { problem: '5 × 8 = ?', answer: 40, difficulty: 'básico' },
    { problem: '12 × 7 = ?', answer: 84, difficulty: 'básico' },
    { problem: '25 × 4 = ?', answer: 100, difficulty: 'básico' },
    { problem: '150 × 6 = ?', answer: 900, difficulty: 'básico' },
  ],
  4: [ // División
    { problem: '20 ÷ 5 = ?', answer: 4, difficulty: 'básico' },
    { problem: '144 ÷ 12 = ?', answer: 12, difficulty: 'básico' },
    { problem: '450 ÷ 15 = ?', answer: 30 , difficulty: 'básico'},
    { problem: '1,000 ÷ 25 = ?', answer: 40, difficulty: 'básico' },
  ],
  5: [ // Examen Integrado de Operaciones
    { problem: '(15 + 3) × 2 = ?', answer: 36, difficulty: 'básico' },
    { problem: '50 - (12 × 3) = ?', answer: 14, difficulty: 'básico' },
    { problem: '(80 ÷ 4) + 25 = ?', answer: 45, difficulty: 'básico' },
    { problem: '(200 × 2) - (150 ÷ 3) = ?', answer: 350, difficulty: 'básico' },
  ],

  // Módulo 2: Álgebra
  6: [ // Ecuaciones Lineales
    { problem: '2x + 5 = 15 (x = ?)', answer: 5, difficulty: 'intermedio' },
    { problem: '3y - 7 = 20 (y = ?)', answer: 9 , difficulty: 'intermedio'},
    { problem: '4z + 10 = 2z + 20 (z = ?)', answer: 5 , difficulty: 'intermedio'},
    { problem: '5(x - 3) = 20 (x = ?)', answer: 7, difficulty: 'intermedio' },
  ],
  7: [ // Factorización
    { problem: 'x² + 5x + 6 = ?', answer: '(x+2)(x+3)', difficulty: 'intermedio' },
    { problem: 'y² - 9 = ?', answer: '(y-3)(y+3)' , difficulty: 'intermedio'},
    { problem: '2z² + 8z + 6 = ?', answer: '2(z+1)(z+3)' , difficulty: 'intermedio'},
    { problem: 'x² - 5x + 6 = ?', answer: '(x-2)(x-3)', difficulty: 'intermedio' },
  ],
  8: [ // Examen Integrado de Álgebra
    { problem: 'Resolver: 3x + 7 = 22', answer: 'x = 5' , difficulty: 'avanzado'},
    { problem: 'Factorizar: x² - 16', answer: '(x-4)(x+4)' , difficulty: 'avanzado'},
    { problem: 'Resolver: 2(x+3) = x + 10', answer: 'x = 4' , difficulty: 'avanzado'},
    { problem: 'Factorizar: 2y² + 10y + 12', answer: '2(y+2)(y+3)', difficulty: 'avanzado' },
  ],

  // Módulo 3: Geometría
  9: [ // Áreas y Perímetros
    { problem: 'Cuadrado lado 5m (Área)', answer: '25m²', difficulty: 'avanzado' },
    { problem: 'Rectángulo 8m × 5m (Perímetro)', answer: '26m', difficulty: 'avanzado' },
    { problem: 'Triángulo base 10m, altura 6m (Área)', answer: '30m²' , difficulty: 'avanzado'},
    { problem: 'Círculo radio 7m (Área aproximada)', answer: '154m²', difficulty: 'avanzado' },
  ],
  10: [ // Volúmenes
    { problem: 'Cubo arista 4m (Volumen)', answer: '64m³' , difficulty: 'avanzado'},
    { problem: 'Prisma 3m × 4m × 5m', answer: '60m³' , difficulty: 'avanzado'},
    { problem: 'Cilindro radio 2m, altura 10m (Volumen)', answer: '125.6m³' , difficulty: 'avanzado'},
    { problem: 'Esfera radio 3m (Volumen aprox.)', answer: '113.04m³', difficulty: 'avanzado' },
  ],
  11: [ // Examen Integrado de Geometría
    { problem: 'Área de un trapecio (B=8m, b=4m, h=3m)', answer: '18m²', difficulty: 'avanzado' },
    { problem: 'Volumen de una pirámide base 9m², altura 4m', answer: '12m³', difficulty: 'avanzado' },
    { problem: 'Perímetro de un hexágono regular lado 5m', answer: '30m' , difficulty: 'avanzado'},
    { problem: 'Área superficial de un cubo arista 3m', answer: '54m²' , difficulty: 'avanzado'},
  ]
};

const ExercisesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { conceptId } = route.params as { conceptId: number };
  const { updateConceptProgress } = useProgress();
  
  const [currentExercise, setCurrentExercise] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [userAnswer, setUserAnswer] = useState('');
  const [answerState, setAnswerState] = useState<'unanswered' | 'correct' | 'wrong'>('unanswered');
  const [progress, setProgress] = useState(0);

  const exercises = EXERCISES[conceptId] || [];
  const currentProblem = exercises[currentExercise];

  const handleAnswer = () => {
    Keyboard.dismiss();
    if (!currentProblem || answerState !== 'unanswered') return;
    const normalizedAnswer = typeof currentProblem.answer === 'number' 
      ? parseFloat(userAnswer.replace(',', '.')) 
      : userAnswer.trim().toLowerCase();

    const isCorrect = normalizedAnswer === currentProblem.answer;

    if (isCorrect) {
      const progressIncrement = 100 / exercises.length;
      setProgress(prev => Math.min(prev + progressIncrement, 100));
      setAnswerState('correct');
      updateConceptProgress(conceptId, progressIncrement);
    } else {
      setAnswerState('wrong');
      if (attemptsLeft === 1) {
        updateConceptProgress(conceptId, -25);
        Alert.alert('¡Oh no!', 'Has perdido 15% de progreso');
        navigation.navigate('Dashboard' as never);
      } else {
        setAttemptsLeft(prev => prev - 1);
      }
    }
  };

 const handleNextExercise = () => {
  if (currentExercise + 1 < exercises.length) {
    setCurrentExercise(prev => prev + 1);
    setAttemptsLeft(3);
    setAnswerState('unanswered');
    setUserAnswer('');
  } else {
    updateConceptProgress(conceptId, 100 - progress);
    Alert.alert(
      '¡Buen trabajo!', 
      `Has completado todos los ejercicios\nProgreso total: ${Math.round(progress)}%`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  }
};

  if (!currentProblem) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No hay ejercicios disponibles</Text>
      </View>
    );
  }

  const GUIDES: { [key: number]: { title: string } } = {
    1: { title: 'Suma' },
    2: { title: 'Resta' },
    3: { title: 'Multiplicación' },
    4: { title: 'División' },
    5: { title: 'Examen' },
    6: { title: 'Ecuaciones Lineales' },
    7: { title: 'Factorización' },
    8: { title: 'Examen' },
    9: { title: 'Áreas y Perímetros' },
    10: { title: 'Volúmenes' },
    11: { title: 'Examen' }
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInUp.duration(600)} style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{GUIDES[conceptId]?.title || 'Ejercicios'}</Text>
            <View style={[
              styles.difficultyBadge,
              currentProblem.difficulty === 'básico' && styles.basicBadge,
              currentProblem.difficulty === 'intermedio' && styles.intermediateBadge,
              currentProblem.difficulty === 'avanzado' && styles.advancedBadge
            ]}>
              <Text style={styles.difficultyText}>{currentProblem.difficulty}</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {currentExercise + 1}/{exercises.length}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>

          <Text style={styles.problemText}>{currentProblem.problem}</Text>
          
          <TextInput
            style={[
              styles.input,
              answerState === 'correct' && styles.correctInput,
              answerState === 'wrong' && styles.wrongInput
            ]}
            keyboardType={typeof currentProblem.answer === 'number' ? 'numeric' : 'default'}
            placeholder="Escribe tu respuesta"
            placeholderTextColor="#666"
            value={userAnswer}
            onChangeText={setUserAnswer}
            editable={answerState === 'unanswered'}
          />

          {answerState !== 'unanswered' && (
            <View style={styles.feedbackContainer}>
              <Text style={[
                styles.feedbackText,
                answerState === 'correct' && styles.correctText,
                answerState === 'wrong' && styles.wrongText
              ]}>
                {answerState === 'correct' ? '✓ Correcto!' : '✗ Incorrecto'}
              </Text>
              {answerState === 'wrong' && (
                <Text style={styles.solutionText}>
                  Respuesta correcta: {currentProblem.answer}
                </Text>
              )}
            </View>
          )}

          <View style={styles.statusContainer}>
            <View style={styles.attemptsContainer}>
              {[...Array(attemptsLeft)].map((_, i) => (
                <Ionicons key={i} name="heart" size={20} color="#FF3B30" />
              ))}
            </View>
            <Text style={styles.scoreText}>Progreso: {Math.round(progress)}%</Text>
          </View>

          <TouchableOpacity 
  style={[
    styles.button,
    (answerState === 'unanswered' && !userAnswer) && styles.disabledButton
  ]} 
  onPress={answerState === 'unanswered' ? handleAnswer : handleNextExercise}
  disabled={answerState === 'unanswered' && !userAnswer}
>
  <View style={styles.buttonContent}>
    <Text style={styles.buttonText}>
      {answerState === 'unanswered' ? 'Verificar Respuesta' : 'Siguiente Ejercicio'}
    </Text>
    <Ionicons 
      name={answerState === 'unanswered' ? "checkmark-circle" : "arrow-forward"} 
      size={20} 
      color="#fff" 
    />
  </View>
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
    fontSize: 20,
    fontFamily: 'Din-Round',
    marginBottom: 4,
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

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 15,
    marginLeft: 10,
    marginBottom: 1,
  },
  basicBadge: {
    backgroundColor: '#00ADB5',
  },
  intermediateBadge: {
    backgroundColor: '#FF9F1C',
  },
  advancedBadge: {
    backgroundColor: '#FF3B30',
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Din-Round',
  },
  progressContainer: {
    marginLeft: 'auto',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#393E46',
    borderRadius: 2,
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00ADB5',
    borderRadius: 2,
  },
  feedbackContainer: {
    marginVertical: 10,
  },
  correctText: {
    color: '#00ADB5',
    fontFamily: 'Din-Round',
  },
  wrongText: {
    color: '#FF3B30',
    fontFamily: 'Din-Round',
  },
  solutionText: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
    fontFamily: 'Din-Round',
  },
  correctInput: {
    borderColor: '#00ADB5',
    backgroundColor: '#00ADB522',
  },
  wrongInput: {
    borderColor: '#FF3B30',
    backgroundColor: '#FF3B3022',
  },
  attemptsContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  progressText: {
    color: '#888',
    fontSize: 14,
    marginBottom: 5,
  },

  backButton: {
    padding: 5,
    marginRight: 10
  },

   buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#00ADB5',
    borderRadius: 25,
    padding: 15,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Din-Round',
    marginRight: 10,
  },
  disabledButton: {
    backgroundColor: '#393E46',
    opacity: 0.7,
  },
  feedbackText: {
    fontSize: 16,
    fontFamily: 'Din-Round',
    marginVertical: 5,
  },
});

export default ExercisesScreen;