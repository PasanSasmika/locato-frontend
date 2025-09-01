import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

// A reusable styled form field component
const FormField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }) => (
  <View className="mb-4">
    <Text className="text-gray-600 mb-2 font-medium">{label}</Text>
    <TextInput
      className={`bg-gray-100 rounded-xl p-4 text-black border border-gray-200 ${multiline ? 'h-28' : ''}`}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

// A custom selection component using TouchableOpacity buttons
const SelectionField = ({ label, options, selectedValue, onSelect }) => (
  <View className="mb-4">
    <Text className="text-gray-600 mb-2 font-medium">{label}</Text>
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => onSelect(option)}
          className={`px-4 py-2 rounded-full border ${
            selectedValue === option
              ? 'bg-colorA border-colorB'
              : 'bg-gray-100 border-gray-200'
          }`}
        >
          <Text
            className={`font-medium ${
              selectedValue === option ? 'text-white' : 'text-gray-700'
            }`}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default function CreateTuition() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State for all form fields based on your schema
  const [formData, setFormData] = useState({
    tutorName: '',
    instituteName: '',
    classType: '',
    subjectStream: '',
    subject: '',
    teachingMode: '',
    feeRange: '',
    languageMedium: '',
    location: '', // Changed to string to match backend expectation
    description: '',
    contactInfo: {
      phone: '',
      email: '',
    },
    daysTimes: [],
    images: [], // Will store base64 strings
  });

  // State for the temporary day/time slot entry
  const [timeSlot, setTimeSlot] = useState({ day: '', time: '' });

  const handleChange = (name, value) => {
    // Handle nested contactInfo state
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddTimeSlot = () => {
    if (timeSlot.day && timeSlot.time) {
      setFormData(prev => ({
        ...prev,
        daysTimes: [...prev.daysTimes, timeSlot],
      }));
      setTimeSlot({ day: '', time: '' }); // Reset for next entry
    } else {
      Alert.alert('Incomplete', 'Please provide both day and time.');
    }
  };

  const handleRemoveTimeSlot = (index) => {
    setFormData(prev => ({
      ...prev,
      daysTimes: prev.daysTimes.filter((_, i) => i !== index),
    }));
  };

  const pickImages = async () => {
    try {
      // FIX: Use the correct API based on available options
      let mediaTypes;
      if (ImagePicker.MediaTypeOptions) {
        // Older API
        mediaTypes = ImagePicker.MediaTypeOptions.Images;
      } else {
        // Newer API - use MediaType instead
        mediaTypes = ImagePicker.MediaType.Images;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsMultipleSelection: true, // Allow multiple images
        quality: 0.7,
      });

      if (!result.canceled && result.assets) {
        setLoading(true); // Show loader while processing images
        const processedImages = [];
        for (const asset of result.assets) {
          const compressed = await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize: { width: 800 } }],
            { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
          );
          const base64 = await FileSystem.readAsStringAsync(compressed.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
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
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };
  
  const validateForm = () => {
    const requiredFields = ['tutorName', 'classType', 'subjectStream', 'subject', 'teachingMode', 'feeRange', 'languageMedium', 'location'];
    for (const field of requiredFields) {
        if (!formData[field]) {
            setError(`'${field}' is a required field.`);
            return false;
        }
    }
    if (!formData.contactInfo.phone) {
        setError('Phone number is required.');
        return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // IMPORTANT: Replace with your network IP address, not localhost.
      const API_URL = 'https://locato-backend-wxjj.onrender.com/api/dashboard/';
      
      // FIX: Send location as a string instead of object
      const response = await axios.post(API_URL, formData);
      
      if (response.status === 201) {
        Alert.alert('Success!', 'Your tuition listing has been created.');
        // Safe navigation back
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/'); // Fallback to home if no back stack
        }
      }
    } catch (err) {
      console.error('Submission Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerClassName="p-6">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity 
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/');
                }
              }} 
              className="p-2 -ml-2"
            >
              <Ionicons name="arrow-back" size={28} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-gray-800 ml-2">Create Tuition Listing</Text>
          </View>

          {error && (
            <View className="bg-red-100 p-3 rounded-lg mb-4 border border-red-200">
              <Text className="text-red-700 text-center">{error}</Text>
            </View>
          )}

          {/* Form Sections */}
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Basic Information</Text>
            <FormField label="Tutor Name" placeholder="e.g., John Doe" value={formData.tutorName} onChangeText={v => handleChange('tutorName', v)} />
            <FormField label="Institute Name (Optional)" placeholder="e.g., Premier Education" value={formData.instituteName} onChangeText={v => handleChange('instituteName', v)} />
            <FormField label="Location" placeholder="e.g., Colombo 5" value={formData.location} onChangeText={v => handleChange('location', v)} />
          </View>
          
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
             <Text className="text-xl font-semibold text-gray-700 mb-4">Class Details</Text>
            <SelectionField label="Subject Stream" options={['Science', 'Commerce', 'Arts', 'Other']} selectedValue={formData.subjectStream} onSelect={v => handleChange('subjectStream', v)} />
            <FormField label="Subject" placeholder="e.g., Combined Mathematics" value={formData.subject} onChangeText={v => handleChange('subject', v)} />
            <SelectionField label="Class Type" options={['Group', 'Individual']} selectedValue={formData.classType} onSelect={v => handleChange('classType', v)} />
            <SelectionField label="Teaching Mode" options={['Online', 'Physical', 'Hybrid']} selectedValue={formData.teachingMode} onSelect={v => handleChange('teachingMode', v)} />
            <SelectionField label="Language Medium" options={['English', 'Sinhala', 'Tamil', 'Bilingual']} selectedValue={formData.languageMedium} onSelect={v => handleChange('languageMedium', v)} />
            <FormField label="Fee Range" placeholder="e.g., 2000-4000 LKR" value={formData.feeRange} onChangeText={v => handleChange('feeRange', v)} />
          </View>
          
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Schedule</Text>
            <View className="flex-row gap-3 items-end">
                <View className="flex-1">
                    <Text className="text-gray-600 mb-2 font-medium">Day</Text>
                    <TextInput className="bg-gray-100 rounded-xl p-4 text-black border border-gray-200" placeholder="e.g., Monday" value={timeSlot.day} onChangeText={v => setTimeSlot({...timeSlot, day: v})} />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-600 mb-2 font-medium">Time</Text>
                    <TextInput className="bg-gray-100 rounded-xl p-4 text-black border border-gray-200" placeholder="e.g., 5PM - 7PM" value={timeSlot.time} onChangeText={v => setTimeSlot({...timeSlot, time: v})} />
                </View>
                <TouchableOpacity onPress={handleAddTimeSlot} className="bg-colorA p-3 rounded-full h-14 w-14 justify-center items-center">
                    <Ionicons name="add" size={28} color="white" />
                </TouchableOpacity>
            </View>
            <View className="mt-4">
                {formData.daysTimes.map((item, index) => (
                    <View key={index} className="flex-row justify-between items-center bg-blue-50 p-3 rounded-lg mb-2">
                        <Text className="font-semibold text-blue-800">{item.day}: <Text className="font-normal">{item.time}</Text></Text>
                        <TouchableOpacity onPress={() => handleRemoveTimeSlot(index)}>
                            <Ionicons name="trash-outline" size={20} color="red" />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
          </View>
          
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Contact & Media</Text>
            <FormField label="Contact Phone" placeholder="Enter phone number" value={formData.contactInfo.phone} onChangeText={v => handleChange('contactInfo.phone', v)} keyboardType="phone-pad" />
            <FormField label="Contact Email (Optional)" placeholder="Enter email address" value={formData.contactInfo.email} onChangeText={v => handleChange('contactInfo.email', v)} keyboardType="email-address" />
            <FormField label="Description (Optional)" placeholder="Add a description about your class..." value={formData.description} onChangeText={v => handleChange('description', v)} multiline={true} />

            <Text className="text-gray-600 mb-2 font-medium">Flyers or Images</Text>
            <TouchableOpacity onPress={pickImages} className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center justify-center bg-gray-50 mb-4">
                <Ionicons name="cloud-upload-outline" size={40} color="gray" />
                <Text className="text-gray-500 mt-2">Tap to upload images</Text>
            </TouchableOpacity>
             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {formData.images.map((base64Uri, index) => (
                    <View key={index} className="relative mr-3">
                        <Image source={{ uri: base64Uri }} className="w-24 h-24 rounded-lg" />
                        <TouchableOpacity onPress={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1">
                            <Ionicons name="close" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="bg-colorA w-full rounded-xl py-4 items-center mt-4"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-bold text-lg">Create Listing</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}