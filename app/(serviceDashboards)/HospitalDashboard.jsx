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

// Reusable Components (can be in a separate file)
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
export default function CreateHospital() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    hospitalType: '', // 'Government' or 'Private'
    departments: [],
    emergency247: null, // Will be boolean true/false
    contactNo: '',
    location: '',
    visitingHours: '',
    website: '',
    ambulanceNo: '',
    nextUpdateDate: '',
    images: [],
  });

  const [department, setDepartment] = useState('');

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDepartment = () => {
    if (department.trim()) {
      setFormData(prev => ({ ...prev, departments: [...prev.departments, department.trim()] }));
      setDepartment('');
    }
  };

  const handleRemoveDepartment = (index) => {
    setFormData(prev => ({ ...prev, departments: prev.departments.filter((_, i) => i !== index) }));
  };

    const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        // The fix is on this line:
        mediaTypes: ImagePicker.MediaType.Images,
        allowsMultipleSelection: true,
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
      setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const validateForm = () => {
    const required = ['name', 'hospitalType', 'contactNo', 'location'];
    for (const field of required) {
      if (!formData[field]) {
        setError(`Please provide the ${field}.`);
        return false;
      }
    }
    if (formData.emergency247 === null) {
      setError('Please specify if there is 24/7 emergency service.');
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
        emergency247: formData.emergency247 === 'Yes' // Convert 'Yes'/'No' to boolean
    };
    
    try {
      const API_URL = 'https://locato-backend-wxjj.onrender.com/api/hospitals';
      const response = await axios.post(API_URL, submissionData);
      
      if (response.status === 201) {
        Alert.alert('Success!', 'Hospital listing has been created.');
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
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <Ionicons name="arrow-back" size={28} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-gray-800 ml-2">Add Hospital</Text>
          </View>

          {error && <View className="bg-red-100 p-3 rounded-lg mb-4 border border-red-200"><Text className="text-red-700 text-center">{error}</Text></View>}

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Hospital Details</Text>
            <FormField label="Name" placeholder="e.g., General Hospital Colombo" value={formData.name} onChangeText={v => handleChange('name', v)} />
            <SelectionField label="Type" options={['Government', 'Private']} selectedValue={formData.hospitalType} onSelect={v => handleChange('hospitalType', v)} />
            <FormField label="Location" placeholder="e.g., Colombo 7" value={formData.location} onChangeText={v => handleChange('location', v)} />
          </View>
          
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
             <Text className="text-xl font-semibold text-gray-700 mb-4">Services & Departments</Text>
             <SelectionField label="24/7 Emergency" options={['Yes', 'No']} selectedValue={formData.emergency247} onSelect={v => handleChange('emergency247', v)} />
             <View>
                <Text className="text-gray-600 mb-2 font-medium">Departments</Text>
                <View className="flex-row gap-2 items-center mb-2">
                    <TextInput className="flex-1 bg-gray-100 rounded-xl p-4 text-black border border-gray-200" placeholder="e.g., Cardiology" value={department} onChangeText={setDepartment} />
                    <TouchableOpacity onPress={handleAddDepartment} className="bg-blue-500 p-3 rounded-full h-14 w-14 justify-center items-center"><Ionicons name="add" size={28} color="white" /></TouchableOpacity>
                </View>
                <View className="flex-row flex-wrap gap-2">
                    {formData.departments.map((item, index) => (
                        <View key={index} className="flex-row items-center bg-blue-50 px-3 py-1 rounded-full">
                            <Text className="text-blue-800">{item}</Text>
                            <TouchableOpacity onPress={() => handleRemoveDepartment(index)} className="ml-2"><Ionicons name="close-circle" size={18} color="red" /></TouchableOpacity>
                        </View>
                    ))}
                </View>
             </View>
          </View>
          
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Contact & Other Info</Text>
            <FormField label="Contact No." placeholder="Enter primary phone number" value={formData.contactNo} onChangeText={v => handleChange('contactNo', v)} keyboardType="phone-pad" />
            <FormField label="Ambulance" placeholder="Enter ambulance hotline" value={formData.ambulanceNo} onChangeText={v => handleChange('ambulanceNo', v)} keyboardType="phone-pad" />
            <FormField label="Visiting Hours" placeholder="e.g., 4:00 PM - 6:00 PM" value={formData.visitingHours} onChangeText={v => handleChange('visitingHours', v)} />
            <FormField label="Website" placeholder="e.g., https://hospital.gov.lk" value={formData.website} onChangeText={v => handleChange('website', v)} keyboardType="url" />
            <FormField label="Next Update" placeholder="YYYY-MM-DD" value={formData.nextUpdateDate} onChangeText={v => handleChange('nextUpdateDate', v)} />
            <Text className="text-gray-600 mb-2 font-medium">Hospital Images</Text>
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
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white font-bold text-lg">Creatcvbcve Hospital Listing</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}