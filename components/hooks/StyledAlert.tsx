import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, Easing } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface StyledAlertProps {
  visible: boolean;
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

const StyledAlert: React.FC<StyledAlertProps> = ({ visible, type, message, onClose }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const translateY = useSharedValue(50);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
    } else {
      opacity.value = withTiming(0, { duration: 250 });
      scale.value = withTiming(0.8, { duration: 250 });
      translateY.value = withTiming(50, { duration: 250 });
    }
  }, [visible]);

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  if (!visible) {
    return null;
  }

  const isSuccess = type === 'success';

  return (
    <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
      <Animated.View style={[styles.alertContainer, animatedContainerStyle]}>
        <View style={styles.alertBox}>
          {/* Icono de carita */}
          <View style={[styles.iconContainer, isSuccess ? styles.successIconContainer : styles.errorIconContainer]}>
            <Text style={styles.faceIcon}>
              {isSuccess ? '😊' : '😢'}
            </Text>
          </View>

          {/* Título */}
          <Text style={styles.title}>
            {isSuccess ? '¡Felicidades!' : '¡Lo siento!'}
          </Text>

          {/* Mensaje */}
          <Text style={styles.message}>{message}</Text>

          {/* Botón de cerrar */}
          <TouchableOpacity 
            style={[styles.button, isSuccess ? styles.successButton : styles.errorButton]} 
            onPress={onClose}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>Cerrar</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    width,
    height,
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  alertContainer: {
    width: width * 0.85,
    maxWidth: 340,
  },
  alertBox: {
    backgroundColor: '#393E46',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  successIconContainer: {
    backgroundColor: '#00ADB5',
  },
  errorIconContainer: {
    backgroundColor: '#FF3B30',
  },
  faceIcon: {
    fontSize: 36,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Din-Round',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    color: '#EEEEEE',
    fontSize: 16,
    fontFamily: 'Din-Round',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
    opacity: 0.9,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 120,
  },
  successButton: {
    backgroundColor: '#00ADB5',
    shadowColor: '#00ADB5',
  },
  errorButton: {
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
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
  },
  buttonIcon: {
    marginLeft: 2,
  },
});

export default StyledAlert;