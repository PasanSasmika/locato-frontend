import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const index = () => {
  return (
    <View>
      <Text>Home</Text>
      <Link href={"/(auth)/"}>Login</Link>
      <Link href={"/(auth)/signup"}>Signup</Link>
    </View>
  )
}

export default index