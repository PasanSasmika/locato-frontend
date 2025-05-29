import { View, Text } from 'react-native'
import React from 'react'

export default function SafeScreen({ children }) {
  return (
    <View className="flex-1 bg-background pt-safe">
      {children}
    </View>
  )
}