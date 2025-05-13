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
        problem: '2 * 2',
        solution: '4'
      }
    }
  },
  4: {
    title: 'División',
    content: {
      definition: 'Operación para repartir una cantidad en partes iguales.',
      steps: [
        'Identifica dividendo y divisor',
        'Realiza la división paso a paso',
        'Verifica el resultado con multiplicación'
      ],
      example: {
        problem: '144 ÷ 12',
        solution: '12'
      }
    }
  },
  5: {
    title: 'Examen Integrado de Operaciones',
    content: {
      definition: 'Evaluación combinada de suma, resta, multiplicación y división.',
      steps: [
        'Resuelve en el orden correcto (PEMDAS)',
        'Verifica cada operación',
        'Maneja cuidadosamente los decimales'
      ],
      example: {
        problem: '(15 × 3) + (20 ÷ 4) - 7',
        solution: '43'
      }
    }
  },

  // Módulo 2: Álgebra
  6: {
    title: 'Ecuaciones Lineales',
    content: {
      definition: 'Igualdad algebraica con variables de primer grado.',
      steps: [
        'Aísla la variable en un lado',
        'Realiza operaciones inversas',
        'Verifica la solución sustituyendo'
      ],
      example: {
        problem: '2x + 5 = 15',
        solution: 'x = 5'
      }
    }
  },
  7: {
    title: 'Factorización',
    content: {
      definition: 'Proceso de descomposición en factores algebraicos.',
      steps: [
        'Identifica el máximo común divisor',
        'Aplica fórmulas notables',
        'Verifica multiplicando los factores'
      ],
      example: {
        problem: 'x² + 5x + 6',
        solution: '(x + 2)(x + 3)'
      }
    }
  },
  8: {
    title: 'Examen Integrado de Álgebra',
    content: {
      definition: 'Evaluación combinada de ecuaciones y factorización.',
      steps: [
        'Resuelve ecuaciones paso a paso',
        'Factoriza expresiones complejas',
        'Simplifica resultados'
      ],
      example: {
        problem: 'Resolver y factorizar: x² - 4x = 12',
        solution: 'x = 6, -2\nFactores: (x - 6)(x + 2)'
      }
    }
  },

  // Módulo 3: Geometría
  9: {
    title: 'Áreas y Perímetros',
    content: {
      definition: 'Cálculo de medidas en figuras bidimensionales.',
      steps: [
        'Identifica la figura geométrica',
        'Aplica fórmulas específicas',
        'Convierte unidades si es necesario'
      ],
      example: {
        problem: 'Triángulo base 8m, altura 5m',
        solution: 'Área = 20m²'
      }
    }
  },
  10: {
    title: 'Volúmenes',
    content: {
      definition: 'Cálculo de espacio en figuras tridimensionales.',
      steps: [
        'Identifica el cuerpo geométrico',
        'Aplica fórmula de volumen',
        'Maneja unidades cúbicas'
      ],
      example: {
        problem: 'Cubo de 3m de arista',
        solution: 'Volumen = 27m³'
      }
    }
  },
  11: {
    title: 'Examen Integrado de Geometría',
    content: {
      definition: 'Evaluación combinada de áreas y volúmenes.',
      steps: [
        'Diferencia entre 2D y 3D',
        'Aplica fórmulas correctamente',
        'Verifica cálculos intermedios'
      ],
      example: {
        problem: 'Prisma rectangular: 4m × 3m × 2m',
        solution: 'Volumen = 24m³\nÁrea superficial = 52m²'
      }
    }
  },
};

const ConceptGuide = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { conceptId } = route.params as { conceptId: number };
  const { updateConceptProgress } = useProgress();

  const guide = GUIDES[conceptId];

  if (!guide) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Guía no encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInUp.duration(600)}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>{guide.title}</Text>
        </View>

        {/* Contenido Principal */}
        <View style={styles.contentContainer}>
          {/* Definición */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {guide.title.includes('Examen') 
                ? `Sobre este examen`
                : `¿Qué es ${guide.title.toLowerCase().includes('examen') ? 'el' : 'la'} ${guide.title.toLowerCase()}?`}
            </Text>
            <Text style={styles.definitionText}>{guide.content.definition}</Text>
          </View>

          {/* Pasos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {guide.title.includes('Examen') 
                ? 'Estrategias clave' 
                : 'Pasos fundamentales'}
            </Text>
            {guide.content.steps.map((step, index) => (
              <View key={`step-${conceptId}-${index}`} style={styles.stepContainer}>
                <View style={styles.stepNumberContainer}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Ejemplo */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {guide.title.includes('Examen') 
                ? 'Problema de ejemplo' 
                : 'Ejemplo práctico'}
            </Text>
            <View style={styles.exampleContainer}>
              <Text style={styles.exampleLabel}>Enunciado:</Text>
              <Text style={styles.exampleProblem}>
                {guide.content.example.problem}
              </Text>
              
              <View style={styles.exampleDivider} />
              
              <Text style={styles.exampleLabel}>Solución:</Text>
              <Text style={styles.exampleSolution}>
                {guide.content.example.solution.split('\n').map((line, i) => (
                  <Text key={`solution-line-${i}`}>
                    {line}
                    {'\n'}
                  </Text>
                ))}
              </Text>
            </View>
          </View>

          {/* Botón de Práctica */}
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => navigation.navigate('Exercises', { conceptId })}
          >
            <Text style={styles.completeButtonText}>
              {guide.title.includes('Examen') 
                ? 'Realizar examen' 
                : 'Practicar ahora'}
            </Text>
            <Ionicons 
              name={guide.title.includes('Examen') ? "clipboard-outline" : "barbell-outline"} 
              size={24} 
              color="#fff" 
            />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222831'
  },
  errorText: {
    color: '#EEEEEE',
    fontSize: 18,
    fontFamily: 'Din-Round'
  },
  exampleLabel: {
    color: '#888',
    fontSize: 18,
    marginBottom: 12,
    fontFamily: 'Din-Round'
  },
  backButton: {
    padding: 5,
    marginRight: 10
  },
  exampleSolution: {
    color: '#00ADB5',
    fontSize: 24,
    lineHeight: 24,
    fontFamily: 'Din-Round'
  },
});

export default ConceptGuide; 