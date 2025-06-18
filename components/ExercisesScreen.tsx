import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Keyboard } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, } from 'react-native-reanimated';
import { useProgress } from './contexts/ProgressContext';
import StyledAlert from './hooks/StyledAlert';

interface Exercise {
  problem: string;
  answer: number | string;
  difficulty: string;
}

const EXERCISES: { [key: number]: Exercise[] } = {
  1: [ // Suma
    { problem: '23 + 15 = ?', answer: 38, difficulty: 'básico' },
    { problem: '47 + 58 = ?', answer: 105, difficulty: 'básico' },
    { problem: '126 + 234 = ?', answer: 360, difficulty: 'básico' },
    { problem: '899 + 1,101 = ?', answer: 2000, difficulty: 'básico' },
    { problem: '67 + 89 = ?', answer: 156, difficulty: 'básico' },
    { problem: '345 + 678 = ?', answer: 1023, difficulty: 'básico' },
    { problem: '1,234 + 5,678 = ?', answer: 6912, difficulty: 'básico' },
    { problem: '456 + 789 = ?', answer: 1245, difficulty: 'básico' },
    { problem: '98 + 76 = ?', answer: 174, difficulty: 'básico' },
    { problem: '234 + 567 = ?', answer: 801, difficulty: 'básico' },
    { problem: '12 + 88 = ?', answer: 100, difficulty: 'básico' },
    { problem: '345 + 155 = ?', answer: 500, difficulty: 'básico' },
    { problem: '678 + 322 = ?', answer: 1000, difficulty: 'básico' },
    { problem: '789 + 1,211 = ?', answer: 2000, difficulty: 'básico' },
    { problem: '56 + 44 = ?', answer: 100, difficulty: 'básico' },
    { problem: '123 + 877 = ?', answer: 1000, difficulty: 'básico' },
    { problem: '2,345 + 3,655 = ?', answer: 6000, difficulty: 'básico' },
    { problem: '89 + 111 = ?', answer: 200, difficulty: 'básico' },
    { problem: '456 + 544 = ?', answer: 1000, difficulty: 'básico' },
    { problem: '1,999 + 1 = ?', answer: 2000, difficulty: 'básico' },
  ],
  2: [ // Resta
    { problem: '35 - 12 = ?', answer: 23, difficulty: 'básico' },
    { problem: '100 - 45 = ?', answer: 55, difficulty: 'básico' },
    { problem: '785 - 299 = ?', answer: 486, difficulty: 'básico' },
    { problem: '1,002 - 567 = ?', answer: 435, difficulty: 'básico' },
    { problem: '89 - 34 = ?', answer: 55, difficulty: 'básico' },
    { problem: '156 - 78 = ?', answer: 78, difficulty: 'básico' },
    { problem: '234 - 156 = ?', answer: 78, difficulty: 'básico' },
    { problem: '500 - 234 = ?', answer: 266, difficulty: 'básico' },
    { problem: '678 - 345 = ?', answer: 333, difficulty: 'básico' },
    { problem: '1,000 - 456 = ?', answer: 544, difficulty: 'básico' },
    { problem: '200 - 123 = ?', answer: 77, difficulty: 'básico' },
    { problem: '345 - 167 = ?', answer: 178, difficulty: 'básico' },
    { problem: '567 - 289 = ?', answer: 278, difficulty: 'básico' },
    { problem: '800 - 345 = ?', answer: 455, difficulty: 'básico' },
    { problem: '1,234 - 678 = ?', answer: 556, difficulty: 'básico' },
    { problem: '900 - 234 = ?', answer: 666, difficulty: 'básico' },
    { problem: '2,000 - 1,456 = ?', answer: 544, difficulty: 'básico' },
    { problem: '456 - 189 = ?', answer: 267, difficulty: 'básico' },
    { problem: '789 - 345 = ?', answer: 444, difficulty: 'básico' },
    { problem: '1,500 - 678 = ?', answer: 822, difficulty: 'básico' },
  ],
  3: [ // Multiplicación
    { problem: '5 × 8 = ?', answer: 40, difficulty: 'básico' },
    { problem: '12 × 7 = ?', answer: 84, difficulty: 'básico' },
    { problem: '25 × 4 = ?', answer: 100, difficulty: 'básico' },
    { problem: '150 × 6 = ?', answer: 900, difficulty: 'básico' },
    { problem: '9 × 6 = ?', answer: 54, difficulty: 'básico' },
    { problem: '8 × 9 = ?', answer: 72, difficulty: 'básico' },
    { problem: '15 × 8 = ?', answer: 120, difficulty: 'básico' },
    { problem: '20 × 12 = ?', answer: 240, difficulty: 'básico' },
    { problem: '13 × 5 = ?', answer: 65, difficulty: 'básico' },
    { problem: '18 × 4 = ?', answer: 72, difficulty: 'básico' },
    { problem: '16 × 3 = ?', answer: 48, difficulty: 'básico' },
    { problem: '14 × 7 = ?', answer: 98, difficulty: 'básico' },
    { problem: '11 × 9 = ?', answer: 99, difficulty: 'básico' },
    { problem: '17 × 6 = ?', answer: 102, difficulty: 'básico' },
    { problem: '19 × 5 = ?', answer: 95, difficulty: 'básico' },
    { problem: '22 × 4 = ?', answer: 88, difficulty: 'básico' },
    { problem: '24 × 3 = ?', answer: 72, difficulty: 'básico' },
    { problem: '26 × 2 = ?', answer: 52, difficulty: 'básico' },
    { problem: '35 × 3 = ?', answer: 105, difficulty: 'básico' },
    { problem: '45 × 2 = ?', answer: 90, difficulty: 'básico' },
  ],
  4: [ // División
    { problem: '20 ÷ 5 = ?', answer: 4, difficulty: 'básico' },
    { problem: '144 ÷ 12 = ?', answer: 12, difficulty: 'básico' },
    { problem: '450 ÷ 15 = ?', answer: 30, difficulty: 'básico' },
    { problem: '1,000 ÷ 25 = ?', answer: 40, difficulty: 'básico' },
    { problem: '72 ÷ 8 = ?', answer: 9, difficulty: 'básico' },
    { problem: '96 ÷ 6 = ?', answer: 16, difficulty: 'básico' },
    { problem: '84 ÷ 7 = ?', answer: 12, difficulty: 'básico' },
    { problem: '108 ÷ 9 = ?', answer: 12, difficulty: 'básico' },
    { problem: '120 ÷ 10 = ?', answer: 12, difficulty: 'básico' },
    { problem: '132 ÷ 11 = ?', answer: 12, difficulty: 'básico' },
    { problem: '168 ÷ 14 = ?', answer: 12, difficulty: 'básico' },
    { problem: '180 ÷ 15 = ?', answer: 12, difficulty: 'básico' },
    { problem: '240 ÷ 20 = ?', answer: 12, difficulty: 'básico' },
    { problem: '300 ÷ 25 = ?', answer: 12, difficulty: 'básico' },
    { problem: '150 ÷ 10 = ?', answer: 15, difficulty: 'básico' },
    { problem: '200 ÷ 8 = ?', answer: 25, difficulty: 'básico' },
    { problem: '350 ÷ 14 = ?', answer: 25, difficulty: 'básico' },
    { problem: '480 ÷ 16 = ?', answer: 30, difficulty: 'básico' },
    { problem: '600 ÷ 20 = ?', answer: 30, difficulty: 'básico' },
    { problem: '750 ÷ 25 = ?', answer: 30, difficulty: 'básico' },
  ],
  5: [ // Examen Integrado de Operaciones
    { problem: '(15 + 3) × 2 = ?', answer: 36, difficulty: 'básico' },
    { problem: '50 - (12 × 3) = ?', answer: 14, difficulty: 'básico' },
    { problem: '(80 ÷ 4) + 25 = ?', answer: 45, difficulty: 'básico' },
    { problem: '(200 × 2) - (150 ÷ 3) = ?', answer: 350, difficulty: 'básico' },
    { problem: '(24 ÷ 6) × (8 + 7) = ?', answer: 60, difficulty: 'básico' },
    { problem: '100 - (5 × 12) + 8 = ?', answer: 48, difficulty: 'básico' },
    { problem: '(45 + 15) ÷ (12 - 2) = ?', answer: 6, difficulty: 'básico' },
    { problem: '(8 × 9) - (72 ÷ 8) = ?', answer: 63, difficulty: 'básico' },
    { problem: '(35 + 25) × 2 - 20 = ?', answer: 100, difficulty: 'básico' },
    { problem: '150 ÷ (10 + 5) × 4 = ?', answer: 40, difficulty: 'básico' },
    { problem: '(16 × 3) + (84 ÷ 7) = ?', answer: 60, difficulty: 'básico' },
    { problem: '200 - (25 × 4) + 50 = ?', answer: 150, difficulty: 'básico' },
    { problem: '(144 ÷ 12) × (7 + 8) = ?', answer: 180, difficulty: 'básico' },
    { problem: '(30 + 70) ÷ 5 - 5 = ?', answer: 15, difficulty: 'básico' },
    { problem: '(18 × 2) + (96 ÷ 8) = ?', answer: 48, difficulty: 'básico' },
    { problem: '300 - (15 × 8) + 20 = ?', answer: 200, difficulty: 'básico' },
    { problem: '(225 ÷ 15) × 4 - 10 = ?', answer: 50, difficulty: 'básico' },
    { problem: '(40 + 80) ÷ 6 × 3 = ?', answer: 60, difficulty: 'básico' },
    { problem: '(12 × 5) - (120 ÷ 10) = ?', answer: 48, difficulty: 'básico' },
    { problem: '400 ÷ (20 - 10) + 15 = ?', answer: 55, difficulty: 'básico' },
  ],

  // Módulo 2: Álgebra
  6: [ // Ecuaciones Lineales
    { problem: '2x + 5 = 15 (x = ?)', answer: 5, difficulty: 'intermedio' },
    { problem: '3y - 7 = 20 (y = ?)', answer: 9, difficulty: 'intermedio' },
    { problem: '4z + 10 = 2z + 20 (z = ?)', answer: 5, difficulty: 'intermedio' },
    { problem: '5(x - 3) = 20 (x = ?)', answer: 7, difficulty: 'intermedio' },
    { problem: '6x - 8 = 22 (x = ?)', answer: 5, difficulty: 'intermedio' },
    { problem: '2y + 12 = 30 (y = ?)', answer: 9, difficulty: 'intermedio' },
    { problem: '7z - 14 = 35 (z = ?)', answer: 7, difficulty: 'intermedio' },
    { problem: '3x + 9 = 24 (x = ?)', answer: 5, difficulty: 'intermedio' },
    { problem: '4y - 16 = 12 (y = ?)', answer: 7, difficulty: 'intermedio' },
    { problem: '5z + 15 = 40 (z = ?)', answer: 5, difficulty: 'intermedio' },
    { problem: '8x - 24 = 16 (x = ?)', answer: 5, difficulty: 'intermedio' },
    { problem: '3y + 21 = 45 (y = ?)', answer: 8, difficulty: 'intermedio' },
    { problem: '6z - 18 = 30 (z = ?)', answer: 8, difficulty: 'intermedio' },
    { problem: '9x + 27 = 54 (x = ?)', answer: 3, difficulty: 'intermedio' },
    { problem: '4y - 20 = 8 (y = ?)', answer: 7, difficulty: 'intermedio' },
    { problem: '7z + 28 = 49 (z = ?)', answer: 3, difficulty: 'intermedio' },
    { problem: '2x + 6 = 18 (x = ?)', answer: 6, difficulty: 'intermedio' },
    { problem: '5y - 25 = 15 (y = ?)', answer: 8, difficulty: 'intermedio' },
    { problem: '3z + 12 = 27 (z = ?)', answer: 5, difficulty: 'intermedio' },
    { problem: '8x - 32 = 24 (x = ?)', answer: 7, difficulty: 'intermedio' },
  ],
  7: [ // Factorización
    { problem: 'x² + 5x + 6 = ?', answer: '(x+2)(x+3)', difficulty: 'intermedio' },
    { problem: 'y² - 9 = ?', answer: '(y-3)(y+3)', difficulty: 'intermedio' },
    { problem: '2z² + 8z + 6 = ?', answer: '2(z+1)(z+3)', difficulty: 'intermedio' },
    { problem: 'x² - 5x + 6 = ?', answer: '(x-2)(x-3)', difficulty: 'intermedio' },
    { problem: 'x² + 7x + 12 = ?', answer: '(x+3)(x+4)', difficulty: 'intermedio' },
    { problem: 'y² - 25 = ?', answer: '(y-5)(y+5)', difficulty: 'intermedio' },
    { problem: 'x² + 6x + 9 = ?', answer: '(x+3)(x+3)', difficulty: 'intermedio' },
    { problem: 'z² - 8z + 16 = ?', answer: '(z-4)(z-4)', difficulty: 'intermedio' },
    { problem: 'x² + 9x + 20 = ?', answer: '(x+4)(x+5)', difficulty: 'intermedio' },
    { problem: 'y² - 36 = ?', answer: '(y-6)(y+6)', difficulty: 'intermedio' },
    { problem: 'x² - 7x + 12 = ?', answer: '(x-3)(x-4)', difficulty: 'intermedio' },
    { problem: '3x² + 9x + 6 = ?', answer: '3(x+1)(x+2)', difficulty: 'intermedio' },
    { problem: 'x² + 8x + 15 = ?', answer: '(x+3)(x+5)', difficulty: 'intermedio' },
    { problem: 'y² - 49 = ?', answer: '(y-7)(y+7)', difficulty: 'intermedio' },
    { problem: 'x² - 6x + 9 = ?', answer: '(x-3)(x-3)', difficulty: 'intermedio' },
    { problem: 'z² + 10z + 25 = ?', answer: '(z+5)(z+5)', difficulty: 'intermedio' },
    { problem: 'x² + 4x + 3 = ?', answer: '(x+1)(x+3)', difficulty: 'intermedio' },
    { problem: '4y² - 16 = ?', answer: '4(y-2)(y+2)', difficulty: 'intermedio' },
    { problem: 'x² - 9x + 20 = ?', answer: '(x-4)(x-5)', difficulty: 'intermedio' },
    { problem: '2x² + 12x + 18 = ?', answer: '2(x+3)(x+3)', difficulty: 'intermedio' },
  ],
  8: [ // Examen Integrado de Álgebra
    { problem: 'Resolver: 3x + 7 = 22', answer: 'x = 5', difficulty: 'avanzado' },
    { problem: 'Factorizar: x² - 16', answer: '(x-4)(x+4)', difficulty: 'avanzado' },
    { problem: 'Resolver: 2(x+3) = x + 10', answer: 'x = 4', difficulty: 'avanzado' },
    { problem: 'Factorizar: 2y² + 10y + 12', answer: '2(y+2)(y+3)', difficulty: 'avanzado' },
    { problem: 'Resolver: 4x - 12 = 20', answer: 'x = 8', difficulty: 'avanzado' },
    { problem: 'Factorizar: x² - 64', answer: '(x-8)(x+8)', difficulty: 'avanzado' },
    { problem: 'Resolver: 5(y-2) = 25', answer: 'y = 7', difficulty: 'avanzado' },
    { problem: 'Factorizar: 3z² + 15z + 18', answer: '3(z+2)(z+3)', difficulty: 'avanzado' },
    { problem: 'Resolver: 6x + 18 = 48', answer: 'x = 5', difficulty: 'avanzado' },
    { problem: 'Factorizar: y² - 100', answer: '(y-10)(y+10)', difficulty: 'avanzado' },
    { problem: 'Resolver: 3(x+4) = 21', answer: 'x = 3', difficulty: 'avanzado' },
    { problem: 'Factorizar: x² + 12x + 36', answer: '(x+6)(x+6)', difficulty: 'avanzado' },
    { problem: 'Resolver: 8y - 24 = 40', answer: 'y = 8', difficulty: 'avanzado' },
    { problem: 'Factorizar: 4x² - 36', answer: '4(x-3)(x+3)', difficulty: 'avanzado' },
    { problem: 'Resolver: 7(z-3) = 28', answer: 'z = 7', difficulty: 'avanzado' },
    { problem: 'Factorizar: x² - 14x + 49', answer: '(x-7)(x-7)', difficulty: 'avanzado' },
    { problem: 'Resolver: 9x + 27 = 72', answer: 'x = 5', difficulty: 'avanzado' },
    { problem: 'Factorizar: 5y² + 25y + 30', answer: '5(y+2)(y+3)', difficulty: 'avanzado' },
    { problem: 'Resolver: 4(x+2) = 32', answer: 'x = 6', difficulty: 'avanzado' },
    { problem: 'Factorizar: z² - 18z + 81', answer: '(z-9)(z-9)', difficulty: 'avanzado' },
  ],

  // Módulo 3: Geometría
  9: [ // Áreas y Perímetros
    { problem: 'Cuadrado lado 5m (Área)', answer: '25m²', difficulty: 'avanzado' },
    { problem: 'Rectángulo 8m × 5m (Perímetro)', answer: '26m', difficulty: 'avanzado' },
    { problem: 'Triángulo base 10m, altura 6m (Área)', answer: '30m²', difficulty: 'avanzado' },
    { problem: 'Círculo radio 7m (Área aproximada)', answer: '154m²', difficulty: 'avanzado' },
    { problem: 'Cuadrado lado 8m (Perímetro)', answer: '32m', difficulty: 'avanzado' },
    { problem: 'Rectángulo 12m × 4m (Área)', answer: '48m²', difficulty: 'avanzado' },
    { problem: 'Triángulo base 16m, altura 5m (Área)', answer: '40m²', difficulty: 'avanzado' },
    { problem: 'Círculo radio 5m (Perímetro aprox.)', answer: '31.4m', difficulty: 'avanzado' },
    { problem: 'Cuadrado lado 6m (Área)', answer: '36m²', difficulty: 'avanzado' },
    { problem: 'Rectángulo 15m × 3m (Perímetro)', answer: '36m', difficulty: 'avanzado' },
    { problem: 'Triángulo base 8m, altura 9m (Área)', answer: '36m²', difficulty: 'avanzado' },
    { problem: 'Círculo radio 4m (Área aproximada)', answer: '50.24m²', difficulty: 'avanzado' },
    { problem: 'Cuadrado lado 10m (Perímetro)', answer: '40m', difficulty: 'avanzado' },
    { problem: 'Rectángulo 20m × 6m (Área)', answer: '120m²', difficulty: 'avanzado' },
    { problem: 'Triángulo base 14m, altura 8m (Área)', answer: '56m²', difficulty: 'avanzado' },
    { problem: 'Círculo radio 6m (Perímetro aprox.)', answer: '37.68m', difficulty: 'avanzado' },
    { problem: 'Cuadrado lado 12m (Área)', answer: '144m²', difficulty: 'avanzado' },
    { problem: 'Rectángulo 25m × 4m (Perímetro)', answer: '58m', difficulty: 'avanzado' },
    { problem: 'Triángulo base 12m, altura 10m (Área)', answer: '60m²', difficulty: 'avanzado' },
    { problem: 'Círculo radio 8m (Área aproximada)', answer: '200.96m²', difficulty: 'avanzado' },
  ],
  10: [ // Volúmenes
    { problem: 'Cubo arista 4m (Volumen)', answer: '64m³', difficulty: 'avanzado' },
    { problem: 'Prisma 3m × 4m × 5m', answer: '60m³', difficulty: 'avanzado' },
    { problem: 'Cilindro radio 2m, altura 10m (Volumen)', answer: '125.6m³', difficulty: 'avanzado' },
    { problem: 'Esfera radio 3m (Volumen aprox.)', answer: '113.04m³', difficulty: 'avanzado' },
    { problem: 'Cubo arista 5m (Volumen)', answer: '125m³', difficulty: 'avanzado' },
    { problem: 'Prisma 6m × 4m × 3m', answer: '72m³', difficulty: 'avanzado' },
    { problem: 'Cilindro radio 3m, altura 8m (Volumen)', answer: '226.08m³', difficulty: 'avanzado' },
    { problem: 'Esfera radio 4m (Volumen aprox.)', answer: '267.95m³', difficulty: 'avanzado' },
    { problem: 'Cubo arista 6m (Volumen)', answer: '216m³', difficulty: 'avanzado' },
    { problem: 'Prisma 8m × 5m × 2m', answer: '80m³', difficulty: 'avanzado' },
    { problem: 'Cilindro radio 4m, altura 6m (Volumen)', answer: '301.44m³', difficulty: 'avanzado' },
    { problem: 'Esfera radio 5m (Volumen aprox.)', answer: '523.33m³', difficulty: 'avanzado' },
    { problem: 'Cubo arista 3m (Volumen)', answer: '27m³', difficulty: 'avanzado' },
    { problem: 'Prisma 10m × 3m × 4m', answer: '120m³', difficulty: 'avanzado' },
    { problem: 'Cilindro radio 5m, altura 4m (Volumen)', answer: '314m³', difficulty: 'avanzado' },
    { problem: 'Esfera radio 2m (Volumen aprox.)', answer: '33.49m³', difficulty: 'avanzado' },
    { problem: 'Cubo arista 8m (Volumen)', answer: '512m³', difficulty: 'avanzado' },
    { problem: 'Prisma 12m × 2m × 5m', answer: '120m³', difficulty: 'avanzado' },
    { problem: 'Cilindro radio 6m, altura 3m (Volumen)', answer: '339.12m³', difficulty: 'avanzado' },
    { problem: 'Esfera radio 6m (Volumen aprox.)', answer: '904.32m³', difficulty: 'avanzado' },
  ],
  11: [ // Examen Integrado de Geometría
    { problem: 'Área de un trapecio (B=8m, b=4m, h=3m)', answer: '18m²', difficulty: 'avanzado' },
    { problem: 'Volumen de una pirámide base 9m², altura 4m', answer: '12m³', difficulty: 'avanzado' },
    { problem: 'Perímetro de un hexágono regular lado 5m', answer: '30m', difficulty: 'avanzado' },
    { problem: 'Área superficial de un cubo arista 3m', answer: '54m²', difficulty: 'avanzado' },
    { problem: 'Área de un rombo (d1=8m, d2=6m)', answer: '24m²', difficulty: 'avanzado' },
    { problem: 'Volumen de un cono (r=3m, h=8m)', answer: '75.36m³', difficulty: 'avanzado' },
    { problem: 'Perímetro de un octágono regular lado 4m', answer: '32m', difficulty: 'avanzado' },
    { problem: 'Área superficial de una esfera radio 4m', answer: '200.96m²', difficulty: 'avanzado' },
    { problem: 'Área de un trapecio (B=12m, b=6m, h=4m)', answer: '36m²', difficulty: 'avanzado' },
    { problem: 'Volumen de una pirámide base 16m², altura 6m', answer: '32m³', difficulty: 'avanzado' },
    { problem: 'Perímetro de un pentágono regular lado 7m', answer: '35m', difficulty: 'avanzado' },
    { problem: 'Área superficial de un cilindro (r=2m, h=5m)', answer: '87.92m²', difficulty: 'avanzado' },
    { problem: 'Área de un paralelogramo (b=10m, h=6m)', answer: '60m²', difficulty: 'avanzado' },
    { problem: 'Volumen de un prisma triangular (Ab=12m², h=8m)', answer: '96m³', difficulty: 'avanzado' },
    { problem: 'Diagonal de un cuadrado lado 8m', answer: '11.31m', difficulty: 'avanzado' },
    { problem: 'Área superficial de un cono (r=3m, h=4m)', answer: '75.36m²', difficulty: 'avanzado' },
    { problem: 'Área de un sector circular (r=6m, θ=60°)', answer: '18.84m²', difficulty: 'avanzado' },
    { problem: 'Volumen de un tronco de cono (r1=4m, r2=2m, h=6m)', answer: '175.84m³', difficulty: 'avanzado' },
    { problem: 'Perímetro de una elipse (a=5m, b=3m)', answer: '25.53m', difficulty: 'avanzado' },
    { problem: 'Área de una corona circular (R=8m, r=5m)', answer: '122.46m²', difficulty: 'avanzado' },
  ]
};


const shuffleArray = (array: Exercise[]): Exercise[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};


const ExercisesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { conceptId } = route.params as { conceptId: number };
  const { updateConceptProgress, getConceptProgress } = useProgress();

  const [currentExercise, setCurrentExercise] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [userAnswer, setUserAnswer] = useState('');
  const [answerState, setAnswerState] = useState<'unanswered' | 'correct' | 'wrong'>('unanswered');
  const [progress, setProgress] = useState(0);
  const [shuffledExercises, setShuffledExercises] = useState<Exercise[]>([]);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [alertMessage, setAlertMessage] = useState('');



  useFocusEffect(
  useCallback(() => {
    const originalExercises = EXERCISES[conceptId] || [];
    if (originalExercises.length > 0) {
      const mixed = shuffleArray(originalExercises);
      const selectedExercises = mixed.slice(0, 10);
      setShuffledExercises(selectedExercises);
      setCurrentExercise(0);
      
      const initialProgress = getConceptProgress(conceptId) || 0;
      setProgress(initialProgress); // Usa el progreso real
      
      setAttemptsLeft(3);
      setAnswerState('unanswered');
      setUserAnswer('');
    }
  }, [conceptId, getConceptProgress]) 
);
  const exercises = shuffledExercises;
  const currentProblem = exercises[currentExercise];


  const showErrorAlert = (msg: string) => {
    setAlertType('error');
    setAlertMessage(msg);
    setAlertVisible(true);
  };

  const showSuccessAlert = (msg: string) => {
    setAlertType('success');
    setAlertMessage(msg);
    setAlertVisible(true);
  };

  const onCloseAlert = () => {
    setAlertVisible(false);
    if (alertType === 'error') {
      navigation.navigate('Dashboard' as never);
    } else {
      navigation.navigate('Dashboard' as never);
    }
  };

  const handleAnswer = () => {
    Keyboard.dismiss();
    if (!currentProblem || answerState !== 'unanswered') return;
    const normalizedAnswer = typeof currentProblem.answer === 'number'
      ? parseFloat(userAnswer.replace(',', '.'))
      : userAnswer.trim().toLowerCase();

    const isCorrect = normalizedAnswer === currentProblem.answer;

    if (isCorrect) {
      const progressIncrement = 100 / exercises.length;
      const newProgress = Math.min(progress + progressIncrement, 100);
      setProgress(newProgress);
      setAnswerState('correct');
      updateConceptProgress(conceptId, progressIncrement);
    } else {
      setAnswerState('wrong');
      if (attemptsLeft === 1) {
        updateConceptProgress(conceptId, -10);
        showErrorAlert('Has perdido todas tus vidas. Vuelve a intentarlo');
      } else {
        setAttemptsLeft(prev => prev - 1);
      }
    }
  };

  const handleNextExercise = () => {
  if (currentExercise + 1 < exercises.length) {
    setCurrentExercise(prev => prev + 1);
    setAnswerState('unanswered');
    setUserAnswer('');
    if (answerState === 'correct') setAttemptsLeft(3); 
  } else {
    const remainingProgress = 100 - progress;
    if (remainingProgress > 0) {
      updateConceptProgress(conceptId, remainingProgress);
    }
    showSuccessAlert(`¡Has completado todos los ejercicios!`);
  }
};

  if (exercises.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Preparando ejercicios...</Text>
        </View>
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
        </View>

        <View style={styles.card}>
          <View style={styles.progressSection}>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
              <View style={styles.progressGlow} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}% completado</Text>
          </View>

          <View style={styles.problemSection}>
            <View style={styles.problemContainer}>
              <Text style={styles.problemText}>{currentProblem.problem}</Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  answerState === 'correct' && styles.correctInput,
                  answerState === 'wrong' && styles.wrongInput
                ]}
                keyboardType={typeof currentProblem.answer === 'number' ? 'numeric' : 'default'}
                placeholder="Escribe tu respuesta aquí..."
                placeholderTextColor="#666"
                value={userAnswer}
                onChangeText={setUserAnswer}
                editable={answerState === 'unanswered'}
              />
              {answerState === 'unanswered' && userAnswer && (
                <View style={styles.inputIcon}>
                  <Ionicons name="create-outline" size={20} color="#00ADB5" />
                </View>
              )}
            </View>

            {answerState !== 'unanswered' && (
              <Animated.View
                entering={FadeInUp.duration(400)}
                style={[
                  styles.feedbackContainer,
                  answerState === 'correct' && styles.correctFeedback,
                  answerState === 'wrong' && styles.wrongFeedback
                ]}
              >
                <View style={styles.feedbackHeader}>
                  <View style={[
                    styles.feedbackIcon,
                    answerState === 'correct' && styles.correctIcon,
                    answerState === 'wrong' && styles.wrongIcon
                  ]}>
                    <Ionicons
                      name={answerState === 'correct' ? "checkmark" : "close"}
                      size={20}
                      color="#fff"
                    />
                  </View>
                  <Text style={[
                    styles.feedbackText,
                    answerState === 'correct' && styles.correctText,
                    answerState === 'wrong' && styles.wrongText
                  ]}>
                    {answerState === 'correct' ? '¡Excelente!' : 'Casi'}
                  </Text>
                </View>
                {answerState === 'wrong' && (
                  <View style={styles.solutionContainer}>
                    <Text style={styles.solutionLabel}>Respuesta correcta:</Text>
                    <Text style={styles.solutionText}>{currentProblem.answer}</Text>
                  </View>
                )}
              </Animated.View>
            )}
          </View>

          <View style={styles.statusSection}>
            <View style={styles.attemptsContainer}>
              <Text style={styles.attemptsLabel}>Intentos:</Text>
              <View style={styles.heartsContainer}>
                {[...Array(attemptsLeft)].map((_, i) => (
                  <View key={i} style={styles.heartContainer}>
                    <Ionicons name="heart" size={20} color="#00ADB5" />
                  </View>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (answerState === 'unanswered' && !userAnswer) && styles.disabledButton,
              answerState === 'correct' && styles.successButton
            ]}
            onPress={answerState === 'unanswered' ? handleAnswer : handleNextExercise}
            disabled={answerState === 'unanswered' && !userAnswer}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>
                {answerState === 'unanswered' ? 'Verificar Respuesta' : 'Siguiente Ejercicio'}
              </Text>
              <View style={styles.buttonIcon}>
                <Ionicons
                  name={answerState === 'unanswered' ? "checkmark-circle-outline" : "arrow-forward"}
                  size={22}
                  color="#fff"
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>


      <StyledAlert
        visible={alertVisible}
        type={alertType}
        message={alertMessage}
        onClose={onCloseAlert}
      />

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00ADB5',
    fontSize: 18,
    fontFamily: 'Din-Round',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 15
  },
  backButton: {
    padding: 8,
    marginRight: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Din-Round',
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  card: {
    backgroundColor: '#393E46',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  progressSection: {
    marginBottom: 30,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#2D333B',
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00ADB5',
    borderRadius: 3,
    position: 'relative',
  },
  progressGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00ADB5',
    opacity: 0.3,
    borderRadius: 3,
  },
  progressText: {
    color: '#00ADB5',
    fontSize: 14,
    fontFamily: 'Din-Round',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },

  problemSection: {
    marginBottom: 25,
  },
  problemContainer: {
    backgroundColor: 'rgba(0, 173, 181, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 173, 181, 0.2)',
  },
  problemText: {
    color: '#00ADB5',
    fontSize: 24,
    textAlign: 'center',
    fontFamily: 'Din-Round',
    lineHeight: 32,
    fontWeight: '500',
  },

  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#2D333B',
    color: '#fff',
    fontSize: 18,
    padding: 18,
    borderRadius: 14,
    fontFamily: 'Din-Round',
    borderWidth: 2,
    borderColor: 'transparent',
    textAlign: 'center',
  },
  inputIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  correctInput: {
    borderColor: '#00ADB5',
    backgroundColor: 'rgba(0, 173, 181, 0.15)',
  },
  wrongInput: {
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
  },

  feedbackContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  correctFeedback: {
    backgroundColor: 'rgba(0, 173, 181, 0.1)',
    borderColor: 'rgba(0, 173, 181, 0.3)',
  },
  wrongFeedback: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  correctIcon: {
    backgroundColor: '#00ADB5',
  },
  wrongIcon: {
    backgroundColor: '#FF3B30',
  },
  feedbackText: {
    fontSize: 16,
    fontFamily: 'Din-Round',
    fontWeight: '600',
  },
  correctText: {
    color: '#00ADB5',
  },
  wrongText: {
    color: '#FF3B30',
  },
  solutionContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
  },
  solutionLabel: {
    color: '#888',
    fontSize: 13,
    fontFamily: 'Din-Round',
    marginBottom: 4,
  },
  solutionText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Din-Round',
    fontWeight: '600',
  },

  statusSection: {
    marginBottom: 25,
  },
  attemptsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attemptsLabel: {
    color: '#EEEEEE',
    fontSize: 20,
    fontFamily: 'Din-Round',
    marginRight: 10,
  },
  heartsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  heartContainer: {
    padding: 2,
  },

  button: {
    backgroundColor: '#00ADB5',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#00ADB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  successButton: {
    backgroundColor: '#00ADB5',
  },
  disabledButton: {
    backgroundColor: '#393E46',
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Din-Round',
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});

export default ExercisesScreen;