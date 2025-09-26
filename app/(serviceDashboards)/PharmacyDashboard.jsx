import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView,
  StyleSheet // --- ADDED ---
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps'; // --- ADDED ---

// Reusable Components
const FormField = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }) => (
  <View className="mb-4">
    <Text className="text-gray-600 mb-2 font-medium">{label}</Text>
    <TextInput
      className="bg-gray-100 rounded-xl p-4 text-black border border-gray-200"
      placeholder={placeholder} placeholderTextColor="#9CA3AF"
      value={value} onChangeText={onChangeText} keyboardType={keyboardType}
    />
  </View>
);

const SelectionField = ({ label, options, selectedValue, onSelect }) => (
  <View className="mb-4">
    <Text className="text-gray-600 mb-2 font-medium">{label}</Text>
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => (
        <TouchableOpacity
          key={option} onPress={() => onSelect(option)}
          className={`px-4 py-2 rounded-full border ${selectedValue === option ? 'bg-blue-600 border-blue-600' : 'bg-gray-100 border-gray-200'}`}
        >
          <Text className={`font-medium ${selectedValue === option ? 'text-white' : 'text-gray-700'}`}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// Main Component
export default function CreatePharmacy() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    openHours: '',
    service247: null,
    deliveryAvailable: null,
    contactNo: '',
    location: '',
    nextUpdateDate: '',
    images: [],
    // --- ADDED ---
    coordinates: { latitude: 6.9271, longitude: 79.8612 }, // Default to Colombo
  });

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // --- ADDED ---
  const handleMapPress = (e) => {
    setFormData(prev => ({
      ...prev,
      coordinates: e.nativeEvent.coordinate,
    }));
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
      });
  
      if (!result.canceled && result.assets) {
        setLoading(true);
        const processedImages = [];
        for (const asset of result.assets) {
          const compressed = await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize: { width: 800 } }],
            { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
          );
          const base64 = await FileSystem.readAsStringAsync(compressed.uri, { encoding: 'base64' });
          processedImages.push(`data:image/jpeg;base64,${base64}`);
        }
        setFormData(prev => ({ ...prev, images: [...prev.images, ...processedImages] }));
        setLoading(false);
      }
    } catch (err) {
      console.error('Image processing error:', err);
      setError('Failed to process images.');
      setLoading(false);
    }
  };
  
  const removeImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.contactNo || !formData.location) {
      setError('Please fill in the Name, Contact, and Location fields.');
      return false;
    }
    if (formData.service247 === null || formData.deliveryAvailable === null) {
      setError('Please select options for 24/7 Service and Delivery.');
      return false;
    }
    if (!formData.coordinates.latitude || !formData.coordinates.longitude) {
      setError('Please pin the location on the map.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    const submissionData = {
      ...formData,
      service247: formData.service247 === 'Yes',
      deliveryAvailable: formData.deliveryAvailable === 'Yes',
    };
    
    try {
      const API_URL = 'https://locato-backend-wxjj.onrender.com/api/pharmacies';
      const response = await axios.post(API_URL, submissionData);
      
      if (response.status === 201) {
        Alert.alert('Success!', 'Pharmacy listing has been created.');
        router.push('/profile/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while submitting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerClassName="p-6">
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => router.push('/profile/')} className="p-2 -ml-2">
              <Ionicons name="arrow-back" size={28} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-gray-800 ml-2">Add New Pharmacy</Text>
          </View>

          {/* --- ADDED MAP SECTION --- */}
          <View className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Pin Location on Map</Text>
            <Text className="text-gray-600 mb-4 font-medium">Tap on the map to set the precise location. 🗺️</Text>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: formData.coordinates.latitude,
                  longitude: formData.coordinates.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                onPress={handleMapPress}
              >
                {formData.coordinates.latitude && (
                  <Marker
                    coordinate={formData.coordinates}
                    title={formData.name || 'New Pharmacy Location'}
                    pinColor="#2563EB"
                  />
                )}
              </MapView>
            </View>
            <View className="flex-row items-center mt-3">
              <Ionicons name="location-outline" size={20} color="#2563EB" />
              <Text className="text-gray-600 ml-2 font-medium">
                Coordinates: {formData.coordinates.latitude.toFixed(4)}, {formData.coordinates.longitude.toFixed(4)}
              </Text>
            </View>
          </View>
          {/* --- END MAP SECTION --- */}

          {error && <View className="bg-red-100 p-3 rounded-lg mb-4 border border-red-200"><Text className="text-red-700 text-center">{error}</Text></View>}

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Pharmacy Information</Text>
            <FormField label="Name" placeholder="e.g., Union Pharmacy" value={formData.name} onChangeText={v => handleChange('name', v)} />
            <FormField label="Location" placeholder="e.g., Colombo 3" value={formData.location} onChangeText={v => handleChange('location', v)} />
            <FormField label="Contact No." placeholder="Enter primary phone number" value={formData.contactNo} onChangeText={v => handleChange('contactNo', v)} keyboardType="phone-pad" />
            <FormField label="Open Hours" placeholder="e.g., 8:00 AM - 10:00 PM" value={formData.openHours} onChangeText={v => handleChange('openHours', v)} />
          </View>
          
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Services</Text>
            <SelectionField label="24/7 Service" options={['Yes', 'No']} selectedValue={formData.service247} onSelect={v => handleChange('service247', v)} />
            <SelectionField label="Delivery Available" options={['Yes', 'No']} selectedValue={formData.deliveryAvailable} onSelect={v => handleChange('deliveryAvailable', v)} />
          </View>

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Other Details</Text>
            <FormField label="Next Update Date" placeholder="YYYY-MM-DD" value={formData.nextUpdateDate} onChangeText={v => handleChange('nextUpdateDate', v)} />
            <Text className="text-gray-600 mb-2 font-medium">Images</Text>
            <TouchableOpacity onPress={pickImages} className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center justify-center bg-gray-50 mb-4">
              <Ionicons name="cloud-upload-outline" size={40} color="gray" />
              <Text className="text-gray-500 mt-2">Tap to upload pharmacy images</Text>
            </TouchableOpacity>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {formData.images.map((uri, index) => (
                <View key={index} className="relative mr-3">
                  <Image source={{ uri }} className="w-24 h-24 rounded-lg" />
                  <TouchableOpacity onPress={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1">
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity onPress={handleSubmit} disabled={loading} className="bg-blue-600 w-full rounded-xl py-4 items-center mt-4">
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white font-bold text-lg">Create Pharmacy Listing</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- ADDED ---
const styles = StyleSheet.create({
  mapContainer: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});