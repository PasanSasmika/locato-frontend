import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export default function ServiceDashboardIndex() {
  const { user } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center p-6">
      <View className="items-center text-center">
        <View className="bg-gray-100 p-4 rounded-full mb-6">
          <Ionicons name="construct-outline" size={48} color="black" />
        </View>

        <Text className="text-3xl font-bold text-black">
          Service Hub
        </Text>

        <Text className="text-lg text-gray-600 mt-2 mb-10">
          Welcome, {user?.firstName || 'Provider'}!
        </Text>

        <Text className="text-base text-gray-500 text-center mb-12">
          Select one of your services below to manage listings, view analytics, and respond to clients.
        </Text>

        <Link href="/(tabs)/profile" asChild>
          <TouchableOpacity className="bg-colorA w-full max-w-xs rounded-xl py-4 items-center">
            <Text className="text-black font-bold text-lg">
              Go to Tuition Dashboard
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}