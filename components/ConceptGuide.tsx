// SumaGuide.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useProgress } from './contexts/ProgressContext';

interface GuideContent {
  definition: string;
  steps: string[];
  example: {
    problem: string;
    solution: string;
  };
}

interface Guide {
  title: string;
  content: GuideContent;
}

const GUIDES: { [key: number]: Guide } = {
  1: {
    title: 'Suma',
    content: {
      definition: 'Es la operación matemática básica que representa la combinación de cantidades.',
      steps: [
        'Alinea los números por su valor posicional',
        'Suma comenzando por la derecha (unidades)',
        'Lleva los acarreos si la suma excede 9'
      ],
      example: {
        problem: '23 + 15',
        solution: '38'
      }
    }
  },
  2: {
    title: 'Resta',
    content: {
      definition: 'Es la operación inversa a la suma que representa la sustracción de cantidades.',
      steps: [
        'Alinea los números correctamente',
        'Resta comenzando por la derecha',
        'Toma prestado si el dígito es menor'
      ],
      example: {
        problem: '35 - 12',
        solution: '23'
      }
    }
  },
  3: {
    title: 'Multiplicación',
    content: {
      definition: 'Se suma la cantidad de veces, ejemplo: 2 + 2 + 2 + 2 = 8.',
      steps: [
        'Alinea los números correctamente',
        'Resta comenzando por la derecha',
        'Toma prestado si el dígito es menor'
      ],
      example: {
        problem: '1 * 1',
        solution: '2'
      }
    }
  },
};

const ConceptGuide = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { conceptId } = route.params as { conceptId: number };
  const { updateConceptProgress } = useProgress();

  const guide = GUIDES[conceptId] || GUIDES[1];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View entering={FadeInUp.duration(600)}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>{guide.title}</Text>
        </View>

        {/* Contenido Principal */}
        <View style={styles.contentContainer}>
          {/* Definición */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>¿Qué es la {guide.title.toLowerCase()}?</Text>
            <Text style={styles.definitionText}>{guide.content.definition}</Text>
          </View>

          {/* Pasos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pasos básicos</Text>
            {guide.content.steps.map((step, index) => (
              <View key={index} style={styles.stepContainer}>
                <View style={styles.stepNumberContainer}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Ejemplo */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ejemplo práctico</Text>
            <View style={styles.exampleContainer}>
              <Text style={styles.exampleProblem}>{guide.content.example.problem}</Text>
              <View style={styles.exampleDivider} />
              <Text style={styles.exampleSolution}>{guide.content.example.solution}</Text>
            </View>
          </View>

          {/* Botón de Completado */}
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => navigation.navigate('Exercises', { conceptId })}
          >
            <Text style={styles.completeButtonText}>Poner en práctica</Text>
            <Ionicons name="barbell-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#222831',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginTop: 15,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginLeft: 20,
    fontFamily: 'Din-Round',
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: '#2D333B',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#00ADB5',
    fontSize: 20,
    fontFamily: 'Din-Round',
    marginBottom: 15,
  },
  definitionText: {
    color: '#EEEEEE',
    fontSize: 16,
    lineHeight: 24,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  stepNumberContainer: {
    backgroundColor: '#00ADB5',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumber: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Din-Round',
  },
  stepText: {
    color: '#EEEEEE',
    fontSize: 16,
    flex: 1,
  },
  exampleContainer: {
    backgroundColor: '#393E46',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  exampleProblem: {
    color: '#EEEEEE',
    fontSize: 24,
    fontFamily: 'Din-Round',
    marginBottom: 10,
  },
  exampleDivider: {
    width: '100%',
    height: 2,
    backgroundColor: '#00ADB5',
    marginVertical: 15,
  },
  exampleSolution: {
    color: '#EEEEEE',
    fontSize: 24,
    fontFamily: 'Din-Round',
    fontWeight: 'bold',
  },
  completeButton: {
    flexDirection: 'row',
    backgroundColor: '#00ADB5',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Din-Round',
    marginRight: 10,
  },
});

export default ConceptGuide; 