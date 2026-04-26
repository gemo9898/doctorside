import { Tabs } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View style={[s.iconWrap, focused && s.iconActive]}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  iconWrap: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  iconActive: { backgroundColor: '#1F5D5018' },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1F5D50',
        tabBarInactiveTintColor: '#AABBB8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 14,
          shadowColor: '#1F5D50',
          shadowOpacity: 0.10,
          shadowRadius: 14,
          height: 70,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Inicio', tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} /> }}
      />
      <Tabs.Screen
        name="citas"
        options={{ title: 'Citas', tabBarIcon: ({ focused }) => <TabIcon icon="📅" focused={focused} /> }}
      />
      <Tabs.Screen
        name="pacientes"
        options={{ title: 'Pacientes', tabBarIcon: ({ focused }) => <TabIcon icon="👥" focused={focused} /> }}
      />
      <Tabs.Screen
        name="expediente"
        options={{ title: 'Expediente', tabBarIcon: ({ focused }) => <TabIcon icon="📂" focused={focused} /> }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{ title: 'Ajustes', tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" focused={focused} /> }}
      />

      {/* Ocultar rutas por defecto de Expo */}
      <Tabs.Screen name="(tabs)"  options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="modal"   options={{ href: null }} />
    </Tabs>
  );
}