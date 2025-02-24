// RotatableIcon.js
import React, { useRef, useEffect } from 'react';
import { Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RotatableIconProps {
    isExpanded: boolean;
    onPress: () => void;
    mod: {
        completed: boolean;
        unlocked: boolean;
    };
    size?: number;
    color?: string;
    disabled?: boolean;
}

const RotatableIcon: React.FC<RotatableIconProps> = ({ 
    isExpanded, 
    onPress, 
    mod, 
    size = 24, 
    color = "#fff",
    disabled = false 
}) => {
    const rotateAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(rotateAnim, {
            toValue: isExpanded ? 1 : 0,
            duration: 200,
            useNativeDriver: true
        }).start();
    }, [isExpanded]);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-180deg']
    });

    const renderIcon = () => {
        if (mod.completed) {
            return <Ionicons name="checkmark-circle" size={size} color="#00ADB5" />;
        }
        
        if (!mod.unlocked) {
            return <Ionicons name="lock-closed" size={size} color={color} />;
        }
        
        return (
            <Animated.View 
                style={{
                    transform: [
                        { rotate: rotation },
                        { perspective: 1000 }
                    ]
                }}
            >
                <Ionicons 
                    name="chevron-down" 
                    size={size} 
                    color={color} 
                />
            </Animated.View>
        );
    };

    return (
        <TouchableOpacity 
            onPress={onPress} 
            disabled={disabled}
        >
            {renderIcon()}
        </TouchableOpacity>
    );
};

export default RotatableIcon;