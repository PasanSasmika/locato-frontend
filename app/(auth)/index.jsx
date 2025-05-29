import { View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [greeting, setGreeting] = useState('Welcome Back')

  useEffect(() => {
    // Function to get time-based greeting
    const getGreeting = () => {
      const hour = new Date().getHours();
      
      if (hour >= 5 && hour < 12) {
        return 'Good Morning!';
      } else if (hour >= 12 && hour < 18) {
        return 'Good Afternoon';
      } else {
        return 'Good Evening!';
      }
    };
    
    setGreeting(getGreeting());
  }, []);
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="flex-grow px-6 pt-6 pb-6">
        {/* Logo */}
        <View className="mb-7">
        <Image source={require("../../assets/images/logo.png")} className="w-[150px] h-[150px] resize-contain"/>

        </View>

        {/* Welcome Text */}
        <View className="mb-11">
          <Text className="text-4xl font-bold px-3 font-main text-black">{greeting} !</Text>
          <Text className="text-3xl px-3 mt-2 font-normal text-black">Login for Continue
          </Text>
        </View>

        {/* Input Fields */}
        <View className="space-y-4 mb-6 gap-y-2">
          <TextInput
            className="bg-white rounded-2xl p-4 w-96 h-16 text-gray-500 border border-gray-100"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            className="bg-white rounded-2xl p-4 w-96 h-16 text-gray-500 border border-gray-100"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity 
          className="bg-[#d6f82e] w-96 rounded-xl py-4 items-center mb-4"
          onPress={() => console.log('Login pressed')}
        >
          <Text className="text-black font-semibold text-lg">Login</Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View className="flex-row justify-center mb-12">
          <Text className="text-gray-900 text-[16px] font-thin">Don't have an account? </Text>
           <Link href="/signup" asChild>
            <Text className="text-gray-900 text-[16px] font-normal">Sign up</Text>
          </Link>
        </View>

        {/* Tagline */}
        <View className="mt-4">
          <Text className="px-3 text-[16px] text-black font-normal mb-4">
            Your service belongs on Locato. Let's make it happen.
          </Text>
          
          {/* List Service Button */}
         {/* List Service Button */}
<TouchableOpacity 
  className="bg-[#D2E7F9] w-[208px] mt-3 h-[105px] rounded-xl p-4 self-start"
  onPress={() => console.log('List service pressed')}
>
  <View className="flex-row justify-between items-start">
    <View className="mt-9">
      <Text className="text-gray-900 text-[18px] font-normal">List Your</Text>
      <Text className="text-gray-900 text-[22px] font-semibold">Service</Text>
    </View>
    <View className="bg-[#C0DCF3] rounded-full w-10 h-10 items-center justify-center">
      <Ionicons name="arrow-forward" size={18} color="black" />
    </View>
  </View>
</TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}