import React from 'react';
import { View, Text, Button } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

type RootStackParamList = { Home: undefined; Details: undefined };

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
      <Text>Workout Tracker</Text>
      <Button title="Details" onPress={() => navigation.navigate('Details')} />
    </View>
  );
};

export default HomeScreen;
