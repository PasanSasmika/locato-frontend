import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Link, useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { isLoading, login, token, user } = useAuthStore();
  const router = useRouter();

  const handleRedirect = (userType) => {
    // IMPORTANT: The text must match exactly (e.g., 'Tuition' is not the same as 'tuition').

    if (userType === 'customer') {
      router.replace('/(tabs)/home');
    } else if (userType === 'Tuition') {
      router.replace('/(serviceDashboards)/TuitionDashboard');
    } else if (userType === 'Home Repair') {
      router.replace('/(serviceDashboards)/HomeRepairDashboard');
    } else if (userType === 'Supermarkets') {
      router.replace('/(serviceDashboards)/SupermarketsDashboard');
    } else if (userType === 'Electronics') {
      router.replace('/(serviceDashboards)/ElectronicsDashboard');
    } else if (userType === 'Hardware') {
      router.replace('/(serviceDashboards)/HardwareDashboard');
    } else if (userType === 'Restaurant') {
      router.replace('/(serviceDashboards)/RestaurantDashboard');
    } else if (userType === 'Clothing') {
      router.replace('/(serviceDashboards)/ClothingDashboard');
    } else if (userType === 'Pharmacy') {
      router.replace('/(serviceDashboards)/PharmacyDashboard');
    } else if (userType === 'Hospital') {
      router.replace('/(serviceDashboards)/HospitalDashboard');
    } else if (userType === 'Private') {
      router.replace('/(serviceDashboards)/PrivateDashboard');
    } else if (userType === 'Labs') {
      router.replace('/(serviceDashboards)/LabsDashboard');
    } else if (userType === 'Ayruwedha') {
      router.replace('/(serviceDashboards)/AyurvedaDashboard');
    } else if (userType === 'Saloon') {
      router.replace('/(serviceDashboards)/SaloonDashboard');
    } else if (userType === 'Spa') {
      router.replace('/(serviceDashboards)/SpaDashboard');
    } else if (userType === 'Fitness Center') {
      router.replace('/(serviceDashboards)/FitnessCenterDashboard');
    } else if (userType === 'Bridle makeup & Beauty') {
      router.replace('/(serviceDashboards)/BridlemakeupBeautycareDashboard');
    } else {
      // This is a fallback for any other user type
      console.warn(`Unknown user type: ${userType}`);
      router.replace('/(serviceDashboards)/'); 
    }
  };

  useEffect(() => {
    if (token && user) {
      handleRedirect(user.type);
    }
  }, [token, user]);

  const handleLogin = async () => {
    const result = await login(email, password);

    if (result.success) {
      handleRedirect(result.user.type);
    } else {
      Alert.alert('Login Failed', result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView contentContainerClassName="flex-grow px-6 pt-6 pb-6 items-center">
          {/* Logo */}
          <View className="mb-6">
            <Image
              source={require('../../assets/images/logoIII.png')}
              className="w-[200px] h-[200px]"
              resizeMode="contain"
            />
          </View>

          {/* Welcome Text */}
          <View className="mb-12 w-full">
            <Text className="text-5xl font-serif font-medium text-black text-left mb-2">
              Hey,
            </Text>
            <Text className="text-5xl font-serif font-medium text-black text-left mb-4">
              Login Now!
            </Text>
            <View className="flex-row items-center mt-2">
              <Text className="text-base text-gray-600">
                I Am A New User /
              </Text>
              {/* Updated link style to be black and bold */}
              <Link href="/signup" asChild>
                <TouchableOpacity>
                  <Text className="text-base text-black font-bold ml-1">Create New</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Input Fields */}
          <View className="space-y-4 w-full mb-6">
            {/* Email */}
            <View className="flex-row items-center bg-gray-100 rounded-md px-4 py-6 mb-2">
              <TextInput
                className="flex-1 p-0 text-black"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-6">
              <TextInput
                className="flex-1 p-0 text-black"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Forgot Password */}
            <View className="items-end mt-4">
              <Text className="text-sm text-black">
                Forget Password? / Reset
              </Text>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            className="bg-colorA w-full rounded-xl py-4 items-center mb-4"
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text className="text-black font-bold text-lg">Login Now</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}