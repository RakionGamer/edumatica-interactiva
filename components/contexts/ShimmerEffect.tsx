import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Dimensions, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ShimmerEffect = ({ style = {} }) => {
    const shimmerAnim = useRef(new Animated.Value(-width)).current;

    useEffect(() => {
        // Creamos una secuencia más suave con Animated.sequence
        const animation = Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: width * 1.5, // Animamos más allá del ancho para dar tiempo a la transición
                duration: 2500,      // Duración más larga para movimiento más suave
                useNativeDriver: false,
                easing: Easing.ease, // Easing suave
            })
        );
        
        animation.start();
        return () => animation.stop();
    }, []);

    return (
        <View style={[StyleSheet.absoluteFill, style]}>
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        transform: [{ translateX: shimmerAnim }],
                    },
                ]}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)', 'transparent']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.gradient}
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
        width: width * 3, // Gradiente aún más ancho para transiciones suaves
    }
});

export default ShimmerEffect;