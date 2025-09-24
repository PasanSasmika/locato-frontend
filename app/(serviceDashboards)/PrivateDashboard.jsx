import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // Corrected import
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

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
export default function CreateDoctor() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    contactInfo: '',
    availability: [],
    languages: [],
    location: '',
    homeVisits: null,
    images: [],
  });

  const [timeSlot, setTimeSlot] = useState({ day: '', time: '' });
  const [language, setLanguage] = useState('');

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAvailability = () => {
    if (timeSlot.day && timeSlot.time) {
      setFormData(prev => ({ ...prev, availability: [...prev.availability, timeSlot] }));
      setTimeSlot({ day: '', time: '' });
    }
  };
  const handleRemoveAvailability = (index) => {
    setFormData(prev => ({ ...prev, availability: prev.availability.filter((_, i) => i !== index) }));
  };

  const handleAddLanguage = () => {
    if (language.trim()) {
      setFormData(prev => ({ ...prev, languages: [...prev.languages, language.trim()] }));
      setLanguage('');
    }
  };
  const handleRemoveLanguage = (index) => {
    setFormData(prev => ({ ...prev, languages: prev.languages.filter((_, i) => i !== index) }));
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        // Fixed line: Use ImagePicker.MediaTypeOptions.Images instead of MediaType.Images
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
      });
      if (!result.canceled && result.assets) {
        setLoading(true);
        const processedImages = [];
        for (const asset of result.assets) {
          const compressed = await ImageManipulator.manipulateAsync(
            asset.uri, [{ resize: { width: 800 } }], { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
          );
          const base64 = await FileSystem.readAsStringAsync(compressed.uri, { encoding: 'base64', });
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
    if (!formData.name || !formData.specialty || !formData.contactInfo || !formData.location) {
      setError('Please fill in Name, Specialty, Contact, and Location.');
      return false;
    }
    if (formData.homeVisits === null) {
      setError('Please specify if home visits are available.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    const submissionData = { ...formData, homeVisits: formData.homeVisits === 'Yes' };
    
    try {
      const API_URL = 'https://locato-backend-wxjj.onrender.com/api/doctors';
      const response = await axios.post(API_URL, submissionData);
      
      if (response.status === 201) {
        Alert.alert('Success!', 'Doctor profile has been created.');
        router.back();
      }
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
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2"><Ionicons name="arrow-back" size={28} color="#1F2937" /></TouchableOpacity>
            <Text className="text-3xl font-bold text-gray-800 ml-2">Add Private Doctor</Text>
          </View>

          {error && <View className="bg-red-100 p-3 rounded-lg mb-4 border border-red-200"><Text className="text-red-700 text-center">{error}</Text></View>}

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Doctor Information</Text>
            <FormField label="Name" placeholder="e.g., Dr. John Doe" value={formData.name} onChangeText={v => handleChange('name', v)} />
            <FormField label="Specialty" placeholder="e.g., General Physician (GP)" value={formData.specialty} onChangeText={v => handleChange('specialty', v)} />
            <FormField label="Location" placeholder="e.g., Colombo Medical Center, Colombo 7" value={formData.location} onChangeText={v => handleChange('location', v)} />
            <FormField label="Contact / Appointment" placeholder="Enter phone or booking info" value={formData.contactInfo} onChangeText={v => handleChange('contactInfo', v)} keyboardType="phone-pad" />
          </View>
          
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Availability & Services</Text>
            <SelectionField label="Home Visits" options={['Yes', 'No']} selectedValue={formData.homeVisits} onSelect={v => handleChange('homeVisits', v)} />

            <View className="mt-4">
                <Text className="text-gray-600 mb-2 font-medium">Availability</Text>
                <View className="flex-row gap-2 items-center mb-2">
                    <TextInput className="flex-1 bg-gray-100 rounded-xl p-4 text-black border-gray-200" placeholder="Day (e.g., Monday)" value={timeSlot.day} onChangeText={v => setTimeSlot({...timeSlot, day: v})} />
                    <TextInput className="flex-1 bg-gray-100 rounded-xl p-4 text-black border-gray-200" placeholder="Time (e.g., 5-7 PM)" value={timeSlot.time} onChangeText={v => setTimeSlot({...timeSlot, time: v})} />
                    <TouchableOpacity onPress={handleAddAvailability} className="bg-blue-500 p-3 rounded-full h-14 w-14 justify-center items-center"><Ionicons name="add" size={28} color="white" /></TouchableOpacity>
                </View>
                {formData.availability.map((item, index) => (
                    <View key={index} className="flex-row justify-between items-center bg-blue-50 px-3 py-2 rounded-lg mb-2">
                        <Text className="text-blue-800">{item.day}: {item.time}</Text>
                        <TouchableOpacity onPress={() => handleRemoveAvailability(index)}><Ionicons name="trash-outline" size={20} color="red" /></TouchableOpacity>
                    </View>
                ))}
            </View>

            <View className="mt-4">
                <Text className="text-gray-600 mb-2 font-medium">Languages Spoken</Text>
                <View className="flex-row gap-2 items-center mb-2">
                    <TextInput className="flex-1 bg-gray-100 rounded-xl p-4 text-black border-gray-200" placeholder="e.g., English" value={language} onChangeText={setLanguage} />
                    <TouchableOpacity onPress={handleAddLanguage} className="bg-blue-500 p-3 rounded-full h-14 w-14 justify-center items-center"><Ionicons name="add" size={28} color="white" /></TouchableOpacity>
                </View>
                <View className="flex-row flex-wrap gap-2">
                    {formData.languages.map((item, index) => (
                        <View key={index} className="flex-row items-center bg-blue-50 px-3 py-1 rounded-full">
                            <Text className="text-blue-800">{item}</Text>
                            <TouchableOpacity onPress={() => handleRemoveLanguage(index)} className="ml-2"><Ionicons name="close-circle" size={18} color="red" /></TouchableOpacity>
                        </View>
                    ))}
                </View>
             </View>
          </View>
          
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Images</Text>
            <TouchableOpacity onPress={pickImages} className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center justify-center bg-gray-50 mb-4">
              <Ionicons name="cloud-upload-outline" size={40} color="gray" /><Text className="text-gray-500 mt-2">Tap to upload images</Text>
            </TouchableOpacity>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {formData.images.map((uri, index) => (
                <View key={index} className="relative mr-3">
                  <Image source={{ uri }} className="w-24 h-24 rounded-lg" />
                  <TouchableOpacity onPress={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"><Ionicons name="close" size={16} color="white" /></TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity onPress={handleSubmit} disabled={loading} className="bg-blue-600 w-full rounded-xl py-4 items-center mt-4">
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white font-bold text-lg">Create Doctor Profile</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}