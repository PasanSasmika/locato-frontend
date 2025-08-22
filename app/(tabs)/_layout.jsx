import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown:false,
        tabBarActiveTintColor: '#000', // Customize as needed (e.g., your 'colorA')
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#fff' }, // Customize tab bar style
      }}
    >
      <Tabs.Screen 
        name="home" 
        options={{ 
          title: 'Home', 
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }} 
      />
      {/* Add more tabs as needed, e.g., profile, settings, or integrate (listService) here */}
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile', 
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }} 
      />
    </Tabs>
  );
}