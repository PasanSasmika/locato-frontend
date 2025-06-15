import { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';

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
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled) {
        const newImages = result.assets.map(asset => 
          `data:image/jpeg;base64,${asset.base64}`
        );
        setImages(prev => [...prev, ...newImages]);
      }
    } catch (err) {
      console.error('Image picker error:', err);
      setError('Failed to select images');
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.email || 
        !formData.firstName || 
        !formData.lastName || 
        !formData.mobileNo || 
        !formData.nic || 
        !formData.address || 
        images.length === 0) {
      setError('All fields are required');
      return;
    }

    if (images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const requestData = {
        ...formData,
        serviceType: categoryName,
        Images: images,
      };

      // Replace with your actual API endpoint
      const response = await axios.post(
        'https://locato-backend.onrender.com/api/service/serviceReq',
        requestData
      );

      console.log('Submission successful:', response.data);
      // Reset form on success
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        mobileNo: '',
        nic: '',
        address: '',
      });
      setImages([]);
      alert('Service request submitted successfully!');
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="p-4 bg-white">
      <Text className="text-2xl font-bold mb-6 text-center">
        {categoryName} Service Request
      </Text>

      {error ? (
        <Text className="text-red-500 mb-4 text-center">{error}</Text>
      ) : null}

      <View className="space-y-4">
        {/* Email */}
        <View>
          <Text className="text-gray-700 mb-1">Email</Text>
          <TextInput
            className="border border-gray-300 rounded p-3"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Name Fields */}
        <View className="flex-row space-x-4">
          <View className="flex-1">
            <Text className="text-gray-700 mb-1">First Name</Text>
            <TextInput
              className="border border-gray-300 rounded p-3"
              placeholder="First name"
              value={formData.firstName}
              onChangeText={(text) => handleChange('firstName', text)}
            />
          </View>
          <View className="flex-1">
            <Text className="text-gray-700 mb-1">Last Name</Text>
            <TextInput
              className="border border-gray-300 rounded p-3"
              placeholder="Last name"
              value={formData.lastName}
              onChangeText={(text) => handleChange('lastName', text)}
            />
          </View>
        </View>

        {/* Contact Info */}
        <View className="flex-row space-x-4">
          <View className="flex-1">
            <Text className="text-gray-700 mb-1">Mobile Number</Text>
            <TextInput
              className="border border-gray-300 rounded p-3"
              placeholder="Mobile number"
              value={formData.mobileNo}
              onChangeText={(text) => handleChange('mobileNo', text)}
              keyboardType="phone-pad"
            />
          </View>
          <View className="flex-1">
            <Text className="text-gray-700 mb-1">NIC Number</Text>
            <TextInput
              className="border border-gray-300 rounded p-3"
              placeholder="NIC number"
              value={formData.nic}
              onChangeText={(text) => handleChange('nic', text)}
            />
          </View>
        </View>

        {/* Address */}
        <View>
          <Text className="text-gray-700 mb-1">Address</Text>
          <TextInput
            className="border border-gray-300 rounded p-3 h-24"
            placeholder="Full address"
            value={formData.address}
            onChangeText={(text) => handleChange('address', text)}
            multiline
          />
        </View>

        {/* Image Upload */}
        <View>
          <Text className="text-gray-700 mb-1">Upload Images (Max 5)</Text>
          <Button
            title="Select Images"
            onPress={pickImages}
            disabled={images.length >= 5}
          />
          
          <View className="flex-row flex-wrap mt-2">
            {images.map((img, index) => (
              <View key={index} className="relative m-1">
                <Image 
                  source={{ uri: img }} 
                  className="w-20 h-20 rounded"
                />
                <TouchableOpacity 
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                  onPress={() => removeImage(index)}
                >
                  <Text className="text-white">×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="bg-blue-500 p-4 rounded items-center mt-6"
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold">Submit Request</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}