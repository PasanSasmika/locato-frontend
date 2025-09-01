import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

// Reusable Components (Unchanged)
const FormField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }) => (
  <View className="mb-4">
    <Text className="text-gray-600 mb-2 font-medium">{label}</Text>
    <TextInput
      className={`bg-gray-100 rounded-xl p-4 text-black border border-gray-200 ${multiline ? 'h-36' : ''}`}
      placeholder={placeholder} placeholderTextColor="#9CA3AF" value={value}
      onChangeText={onChangeText} keyboardType={keyboardType} multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

const SelectionField = ({ label, options, selectedValue, onSelect }) => (
  <View className="mb-4">
    <Text className="text-gray-600 mb-2 font-medium">{label}</Text>
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => (
        <TouchableOpacity key={option} onPress={() => onSelect(option)} className={`px-4 py-2 rounded-full border ${selectedValue === option ? 'bg-blue-600 border-blue-600' : 'bg-gray-100 border-gray-200'}`}>
          <Text className={`font-medium ${selectedValue === option ? 'text-white' : 'text-gray-700'}`}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const DynamicListField = ({ label, placeholder, items, onAddItem, onRemoveItem, setItem, item }) => (
  <View className="mb-4">
    <Text className="text-gray-600 mb-2 font-medium">{label}</Text>
    <View className="flex-row gap-2 items-center mb-2">
      <TextInput className="flex-1 bg-gray-100 rounded-xl p-4 text-black border border-gray-200" placeholder={placeholder} value={item} onChangeText={setItem} />
      <TouchableOpacity onPress={onAddItem} className="bg-blue-500 p-3 rounded-full h-14 w-14 justify-center items-center">
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
    <View className="flex-row flex-wrap gap-2">
      {items.map((val, index) => (
        <View key={index} className="flex-row items-center bg-blue-50 px-3 py-1 rounded-full">
          <Text className="text-blue-800">{val}</Text>
          <TouchableOpacity onPress={() => onRemoveItem(index)} className="ml-2">
            <Ionicons name="close-circle" size={18} color="red" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  </View>
);

// Main Component
export default function CreateSpa() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    genderServed: '',
    services: [],
    priceList: '',
    facilities: [],
    workingHours: '',
    bookingMethod: '',
    contactInfo: { phone: '', socialMedia: '' },
    locations: [],
    certifiedTherapists: null,
    serviceDuration: '',
    experience: '',
    images: [],
    nextUpdateDate: '',
  });

  const [tempItem, setTempItem] = useState({ service: '', facility: '', location: '' });

  const handleChange = (name, value) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddItem = (listName, item) => {
    if (item.trim()) {
      setFormData(prev => ({ ...prev, [listName]: [...prev[listName], item.trim()] }));
      return true;
    }
    return false;
  };

  const handleRemoveItem = (listName, index) => {
    setFormData(prev => ({ ...prev, [listName]: prev[listName].filter((_, i) => i !== index) }));
  };

  const pickImages = async () => {
    try {
      // Request media library permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Denied',
          'Please grant access to your media library to upload images.',
          [{ text: 'OK' }]
        );
        setError('Permission to access media library was denied.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images, // Fixed: Use MediaType.Images instead of deprecated MediaTypeOptions.Images
        allowsMultipleSelection: true,
        quality: 0.7,
      });

      if (result.canceled) {
        console.log('Image selection canceled');
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        setError('No images selected.');
        return;
      }

      setLoading(true);
      const processedImages = [];
      for (const asset of result.assets) {
        try {
          // Resize and compress the image
          const compressed = await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize: { width: 800 } }],
            { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
          );
          // Convert to base64
          const base64 = await FileSystem.readAsStringAsync(compressed.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          processedImages.push(`data:image/jpeg;base64,${base64}`);
        } catch (assetError) {
          console.error(`Error processing image ${asset.uri}:`, assetError);
          setError('Failed to process one or more images.');
          continue; // Skip failed images and continue with others
        }
      }

      if (processedImages.length > 0) {
        setFormData(prev => ({ ...prev, images: [...prev.images, ...processedImages] }));
      } else if (processedImages.length === 0 && result.assets.length > 0) {
        setError('All selected images failed to process.');
      }
    } catch (err) {
      console.error('Image uploading error:', err);
      setError('An error occurred while uploading images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Spa name is required.');
      return false;
    }
    if (!formData.genderServed) {
      setError('Please select the gender served.');
      return false;
    }
    if (formData.services.length === 0) {
      setError('At least one service is required.');
      return false;
    }
    if (!formData.priceList.trim()) {
      setError('Price list is required.');
      return false;
    }
    if (formData.locations.length === 0) {
      setError('At least one location is required.');
      return false;
    }
    if (!formData.contactInfo.phone.trim()) {
      setError('Contact phone number is required.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    const submissionData = {
      ...formData,
      certifiedTherapists: formData.certifiedTherapists === 'Yes',
    };
    try {
      const API_URL = 'https://locato-backend-wxjj.onrender.com/api/spas';
      await axios.post(API_URL, submissionData);
      Alert.alert('Success!', 'Spa has been created.');
      router.back();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerClassName="p-6">
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <Ionicons name="arrow-back" size={28} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-gray-800 ml-2">Add New Spa</Text>
          </View>
          {error && (
            <View className="bg-red-100 p-3 rounded-lg mb-4 border border-red-200">
              <Text className="text-red-700 text-center">{error}</Text>
            </View>
          )}

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Basic Information</Text>
            <FormField
              label="Name"
              placeholder="e.g., Serene Spa & Wellness"
              value={formData.name}
              onChangeText={v => handleChange('name', v)}
            />
            <SelectionField
              label="Gender Served"
              options={['Male', 'Female', 'Unisex']}
              selectedValue={formData.genderServed}
              onSelect={v => handleChange('genderServed', v)}
            />
            <FormField
              label="Experience"
              placeholder="e.g., 10+ years in business"
              value={formData.experience}
              onChangeText={v => handleChange('experience', v)}
            />
            <DynamicListField
              label="Locations"
              placeholder="e.g., Colombo 3"
              items={formData.locations}
              item={tempItem.location}
              setItem={v => setTempItem(p => ({ ...p, location: v }))}
              onAddItem={() => {
                if (handleAddItem('locations', tempItem.location)) setTempItem(p => ({ ...p, location: '' }));
              }}
              onRemoveItem={i => handleRemoveItem('locations', i)}
            />
          </View>

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Services & Facilities</Text>
            <SelectionField
              label="Certified Therapists"
              options={['Yes', 'No']}
              selectedValue={formData.certifiedTherapists}
              onSelect={v => handleChange('certifiedTherapists', v)}
            />
            <DynamicListField
              label="Services"
              placeholder="e.g., Full Body Massage"
              items={formData.services}
              item={tempItem.service}
              setItem={v => setTempItem(p => ({ ...p, service: v }))}
              onAddItem={() => {
                if (handleAddItem('services', tempItem.service)) setTempItem(p => ({ ...p, service: '' }));
              }}
              onRemoveItem={i => handleRemoveItem('services', i)}
            />
            <DynamicListField
              label="Facilities"
              placeholder="e.g., Sauna"
              items={formData.facilities}
              item={tempItem.facility}
              setItem={v => setTempItem(p => ({ ...p, facility: v }))}
              onAddItem={() => {
                if (handleAddItem('facilities', tempItem.facility)) setTempItem(p => ({ ...p, facility: '' }));
              }}
              onRemoveItem={i => handleRemoveItem('facilities', i)}
            />
            <FormField
              label="Service Duration"
              placeholder="e.g., 30 mins, 60 mins, 90 mins"
              value={formData.serviceDuration}
              onChangeText={v => handleChange('serviceDuration', v)}
            />
            <FormField
              label="Prices / Price List"
              multiline={true}
              placeholder="e.g., Full Body (60 min): LKR 5000"
              value={formData.priceList}
              onChangeText={v => handleChange('priceList', v)}
            />
          </View>

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Booking & Operations</Text>
            <FormField
              label="Working Hours"
              placeholder="e.g., 9:00 AM - 8:00 PM"
              value={formData.workingHours}
              onChangeText={v => handleChange('workingHours', v)}
            />
            <FormField
              label="Booking Method"
              placeholder="e.g., Phone Call, Website"
              value={formData.bookingMethod}
              onChangeText={v => handleChange('bookingMethod', v)}
            />
            <FormField
              label="Contact Phone"
              placeholder="Enter phone number"
              value={formData.contactInfo.phone}
              onChangeText={v => handleChange('contactInfo.phone', v)}
              keyboardType="phone-pad"
            />
            <FormField
              label="Social Media"
              placeholder="e.g., instagram.com/spa"
              value={formData.contactInfo.socialMedia}
              onChangeText={v => handleChange('contactInfo.socialMedia', v)}
            />
          </View>

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Other Details</Text>
            <FormField
              label="Next Update Date"
              placeholder="YYYY-MM-DD"
              value={formData.nextUpdateDate}
              onChangeText={v => handleChange('nextUpdateDate', v)}
            />
            <Text className="text-gray-600 mb-2 font-medium">Photos</Text>
            <TouchableOpacity onPress={pickImages} className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center justify-center bg-gray-50 mb-4">
              <Ionicons name="cloud-upload-outline" size={40} color="gray" />
              <Text className="text-gray-500 mt-2">Tap to upload photos</Text>
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
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white font-bold text-lg">Create Spa Listing</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}