import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link, useRouter } from 'expo-router'
import { Image } from 'react-native'
import { useAuthStore } from '../../store/authStore'

export default function Signup() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const {user, isLoading, register} = useAuthStore();
 const router = useRouter();

   const handleSignup = async ()=>{
    const result = await register(firstName,lastName,email,password);

   if (result.success) {
    // Get the current state from the auth store
    const { user, token } = useAuthStore.getState();
    console.log("User:", user);
    console.log("Token:", token);
  } else {
    Alert.alert("Error", result.error || "Something went wrong");
  }
   }
  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS ==="ios"? "padding":"height"}>
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="flex-grow px-6 pt-6 pb-6">

         {/* Logo */}
      <View className="mb-7 flex">
      <Image source={require("../../assets/images/logo.png")} className="w-[150px] h-[150px] resize-contain"/>
     </View>
        {/* Welcome Text */}
       <View className="mb-11">
  <Text className="text-3xl px-3 mt-2 font-normal text-black">
    Create your account to get started
  </Text>
</View>

        {/* Input Fields */}
        <View className="space-y-4 mb-6 gap-y-2">
          <View className="flex-row space-x-4">
            <TextInput
              className="bg-white rounded-2xl p-4 flex-1 h-16 text-gray-500 border border-gray-100"
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
            <TextInput
              className="bg-white rounded-2xl p-4 flex-1 h-16 text-gray-500 border border-gray-100"
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>
          
          <TextInput
            className="bg-white rounded-2xl p-4 w-full h-16 text-gray-500 border border-gray-100"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            className="bg-white rounded-2xl p-4 w-full h-16 text-gray-500 border border-gray-100"
            placeholder="Create password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity 
          className="bg-[#d6f82e] w-full rounded-xl py-4 items-center mb-4"
          onPress={handleSignup} disabled={isLoading}
        >
          <Text className="text-black font-semibold text-lg">Sign Up</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View className="flex-row justify-center mb-12">
          <Text className="text-gray-900 text-[16px] font-thin">
            Already have an account? 
          </Text>

           <TouchableOpacity onPress={()=> router.back()}>
             <Text className="text-gray-900 text-[16px] font-normal ml-1">Login</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
    </KeyboardAvoidingView>
  )
}