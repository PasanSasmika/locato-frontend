import { useState, useRef } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { UIActivityIndicator } from 'react-native-indicators';

import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Define FormField component OUTSIDE ServiceApplication
const FormField = ({ label, value, onChangeText, keyboardType, multiline }) => (
  <View className="mb-3">
    <Text className="text-gray-700 mb-2 font-medium">{label}</Text>
    <TextInput
      className={`border border-gray-200 rounded-xl p-4 bg-white text-gray-800 ${
        multiline ? 'h-24' : ''
      } shadow-sm`}
      placeholder={`Enter ${label.toLowerCase()}`}
      placeholderTextColor="#9CA3AF"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
    />
  </View>
);

export default function ServiceApplication() {
  const { categoryName } = useLocalSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    mobileNo: '',
    nic: '',
    address: '',
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState('');
  const scrollViewRef = useRef();

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
      });

      if (!result.canceled && result.assets.length > 0) {
        setCompressing(true);
        setError('');
        
        const asset = result.assets[0];
        const compressedImage = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        const base64 = await FileSystem.readAsStringAsync(compressedImage.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        setImage({
          uri: compressedImage.uri,
          base64: base64,
        });
        setCompressing(false);
      }
    } catch (err) {
      console.error('Image processing error:', err);
      setError('Failed to process image');
      setCompressing(false);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const validateForm = () => {
    if (!formData.email || 
        !formData.firstName || 
        !formData.lastName || 
        !formData.mobileNo || 
        !formData.nic || 
        !formData.address) {
      setError('All fields are required');
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('Please enter a valid email');
      return false;
    }

    if (!image) {
      setError('Please add a profile image');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const imageData = `data:image/jpeg;base64,${image.base64}`;

      const requestData = {
        ...formData,
        serviceType: categoryName,
        Images: imageData, 
      };

      const response = await axios.post(
        'https://locato-backend-wxjj.onrender.com/api/service/serviceReq',
        requestData
      );

      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        mobileNo: '',
        nic: '',
        address: '',
      });
      setImage(null);
      
      Alert.alert('Success', 'Service request submitted successfully!');
    } catch (err) {
      console.error('Submission error:', err);
      
      if (err.response?.status === 400 && err.response.data?.message?.includes('email')) {
        setError('This email is already registered');
      } else {
        setError(err.response?.data?.message || 'Failed to submit request');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView 
        ref={scrollViewRef}
        className="bg-background"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header Section */}
        {/* Header Section */}
        <LinearGradient
          colors={['#3b82f6', '#2563eb']}
          className="py-10 px-5 rounded-b-3xl"
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View className="items-center">
            <Icon name="assignment-ind" size={40} color="white" />
            <Text className="text-3xl font-bold text-white text-center mt-3">
              {categoryName} Service
            </Text>
            <Text className="text-blue-100 text-center text-base mt-2">
              Complete the form to request service
            </Text>
          </View>
        </LinearGradient>

        {/* Form Container */}
        <View className="px-4 -mt-6">
          <View className="bg-white rounded-2xl p-6 shadow-md">
            {error ? (
              <View className="bg-red-50 p-4 rounded-xl mb-4 border border-red-200">
                <Text className="text-red-600 text-center font-medium">{error}</Text>
              </View>
            ) : null}

            {/* Service Type Display */}
            <View className="mb-6 flex-row items-center justify-between bg-blue-50 p-4 rounded-xl">
              <Text className="text-gray-700 font-medium">Service Type:</Text>
              <Text className="text-blue-700 font-bold text-lg">{categoryName}</Text>
            </View>

            {/* Form Fields */}
            <View className="space-y-4">
              <FormField 
                label="Email Address" 
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                keyboardType="email-address" 
              />
              
              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <FormField 
                    label="First Name" 
                    value={formData.firstName}
                    onChangeText={(text) => handleChange('firstName', text)}
                  />
                </View>
                <View className="flex-1">
                  <FormField 
                    label="Last Name" 
                    value={formData.lastName}
                    onChangeText={(text) => handleChange('lastName', text)}
                  />
                </View>
              </View>
              
              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <FormField 
                    label="Mobile Number" 
                    value={formData.mobileNo}
                    onChangeText={(text) => handleChange('mobileNo', text)}
                    keyboardType="phone-pad" 
                  />
                </View>
                <View className="flex-1">
                  <FormField 
                    label="NIC Number" 
                    value={formData.nic}
                    onChangeText={(text) => handleChange('nic', text)}
                  />
                </View>
              </View>
              
              <FormField 
                label="Full Address" 
                value={formData.address}
                onChangeText={(text) => handleChange('address', text)}
                multiline={true} 
              />
            </View>

            {/* Profile Picture Section */}
            <View className="mt-6">
              <Text className="text-gray-800 font-medium text-lg mb-3">Upload</Text>
              
              <View className="flex-row items-center space-x-4">
                <TouchableOpacity
                  className={`flex-1 border-2 border-dashed border-blue-400 rounded-2xl p-5 items-center justify-center bg-blue-50 ${
                    compressing ? 'opacity-70' : ''
                  }`}
                  onPress={pickImage}
                  disabled={compressing}
                >
                  {compressing ? (
                    <UIActivityIndicator size="small" color="#3b82f6" />
                  ) : (
                    <View className="items-center">
                      <Text className="text-blue-700 font-semibold text-base">
                        {image ? 'Change Photo' : 'Upload Photo'}
                      </Text>
                      <Text className="text-gray-500 text-xs mt-1">
                        Upload Your Identity or Proof of Service Ownership
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                
                {image && (
                  <View className="relative w-20 h-20">
                    <Image 
                      source={{ uri: image.uri }} 
                      className="w-full h-full rounded-xl border border-gray-200"
                    />
                    <TouchableOpacity 
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full w-7 h-7 items-center justify-center shadow-sm"
                      onPress={removeImage}
                    >
                      <Text className="text-white font-bold text-lg">×</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              
              {image && (
                <View className="mt-4 bg-blue-50 p-3 rounded-lg">
                  <Text className="text-blue-700 text-sm text-center">
                    Photo selected ✓
                  </Text>
                </View>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className={`mt-8 p-5 rounded-xl items-center justify-center shadow-lg ${
                loading ? 'bg-blue-700' : 'bg-blue-600'
              }`}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <UIActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-bold text-lg">Submit Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}