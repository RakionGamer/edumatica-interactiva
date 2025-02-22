import { ActivityIndicator, View, Text } from 'react-native';


const CustomLoading = () => (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#222831' 
    }}>
      <ActivityIndicator 
        size="large" 
        color="#00ADB5"
        style={{ marginBottom: 20 }}
      />
      {/* Agrega texto o más elementos */}
      <Text style={{ 
        color: '#EEEEEE', 
        fontFamily: 'Din-Round',
        fontSize: 16 
      }}>
        Cargando...
      </Text>
    </View>
  );



export default CustomLoading