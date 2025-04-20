const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// 1. Obtenemos la configuración por defecto de Expo
const config = getDefaultConfig(__dirname);

// 2. Añadimos soporte para SVG
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts.push('svg');

// 3. Aplicamos NativeWind (DEBE ser el último paso)
module.exports = withNativeWind(config, { input: './global.css' });