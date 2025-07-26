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
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { isLoading, register } = useAuthStore();
  const router = useRouter();

  const handleSignup = async () => {
    const result = await register(firstName, lastName, email, password);

    if (result.success) {
      const { user, token } = useAuthStore.getState();
      console.log("User:", user);
      console.log("Token:", token);
    } else {
      Alert.alert("Error", result.error || "Something went wrong");
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView contentContainerClassName="flex-grow px-6 pt-6 pb-6">
          {/* Logo */}
          <View className="mb-6 items-center">
            <Image 
              source={require('../../assets/images/logoII.png')} 
              className="w-[180px] h-[180px]" 
              resizeMode="contain"
            />
          </View>

          {/* Welcome Text */}
          <View className="mb-11">
            <Text className="text-3xl px-3 mt-2 font-semibold text-white">
              Create Your Account
            </Text>
          </View>

          {/* Input Fields */}
          <View className="space-y-4 mb-6 gap-4">
            {/* First Name - Full width */}
            <View className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-4">
              <Ionicons name="person-outline" size={20} color="#888" />
              <TextInput
                className="flex-1 p-4 text-gray-600"
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>
            
            {/* Last Name - Full width */}
            <View className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-4">
              <Ionicons name="people-outline" size={20} color="#888" />
              <TextInput
                className="flex-1 p-4 text-gray-600"
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>

            {/* Email */}
            <View className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-4">
              <Ionicons name="mail-outline" size={20} color="#888" />
              <TextInput
                className="flex-1 p-4 text-gray-600"
                placeholder="Enter Your Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-4">
              <Ionicons name="lock-closed-outline" size={20} color="#888" />
              <TextInput
                className="flex-1 p-4 text-gray-600"
                placeholder="Create Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity 
            className="bg-secondary w-full rounded-xl py-4 items-center mb-4 shadow-lg shadow-gray-800"
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center mb-12">
            <Text className="text-white text-[16px] font-thin">
              Already have an account? 
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-secondary text-[16px] font-medium ml-1">
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}