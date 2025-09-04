import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide the header to match your design
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="serviceAll" />
    </Stack>
  );
}