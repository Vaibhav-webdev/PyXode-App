import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Tab() {
  return (
    <View style={styles.container}>
      <Text>Tab [Home]</Text>
      <TouchableOpacity onPress={() => '/settings'}>
        <Text>Go To Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
