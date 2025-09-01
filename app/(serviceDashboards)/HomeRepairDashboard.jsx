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

// Reusable Components
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
export default function CreateHomeRepair() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    serviceName: '',
    subcategory: '',
    typeOfWorks: [],
    experiences: '',
    pricingMethod: '',
    approximateFee: '',
    availability: [],
    areaCovered: [],
    contactInfo: { phone: '', email: '', socialMedia: '' },
    photos: [],
    languagesSpoken: [],
    review: 0,
    description: '',
    nextUpdateDate: '',
    is24HourAvailable: null,
    toolsProvided: null,
    certifications: [],
    warrantyOffered: '',
  });

  const [tempItem, setTempItem] = useState({ work: '', area: '', language: '', certification: '', availability: '' });

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
          const base64 = await FileSystem.readAsStringAsync(compressed.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          processedImages.push(`data:image/jpeg;base64,${base64}`);
        }
        setFormData(prev => ({ ...prev, photos: [...prev.photos, ...processedImages] }));
        setLoading(false);
      }
    } catch (err) {
      console.error('Image processing error:', err);
      setError('Failed to process images.');
      setLoading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const validateForm = () => {
    if (!formData.serviceName.trim()) {
      setError('Service name is required.');
      return false;
    }
    if (!formData.subcategory) {
      setError('Subcategory is required.');
      return false;
    }
    if (!formData.contactInfo.phone.trim()) {
      setError('Phone number is required.');
      return false;
    }
    if (!formData.pricingMethod) {
      setError('Pricing method is required.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    const submissionData = {
      ...formData,
      experiences: formData.experiences ? parseInt(formData.experiences) : 0,
      approximateFee: formData.approximateFee ? parseFloat(formData.approximateFee) : 0,
      is24HourAvailable: formData.is24HourAvailable === 'Yes',
      toolsProvided: formData.toolsProvided === 'Yes',
    };
    try {
      const API_URL = 'https://locato-backend-wxjj.onrender.com/api/home-repair';
      await axios.post(API_URL, submissionData);
      Alert.alert('Success!', 'Home repair listing has been created.');
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
            <Text className="text-3xl font-bold text-gray-800 ml-2">Add New Home Repair Service</Text>
          </View>
          {error && <View className="bg-red-100 p-3 rounded-lg mb-4 border border-red-200">
            <Text className="text-red-700 text-center">{error}</Text>
          </View>}

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Basic Information</Text>
            <FormField label="Service Name" placeholder="e.g., QuickFix Repairs" value={formData.serviceName} onChangeText={v => handleChange('serviceName', v)} />
            <SelectionField label="Subcategory" options={['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Masonry', 'HVAC', 'Other']} selectedValue={formData.subcategory} onSelect={v => handleChange('subcategory', v)} />
            <FormField label="Description" multiline={true} placeholder="e.g., Expert plumbing and electrical repairs" value={formData.description} onChangeText={v => handleChange('description', v)} />
          </View>

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Service Details</Text>
            <DynamicListField label="Type of Works" placeholder="e.g., Pipe Repair" items={formData.typeOfWorks} item={tempItem.work} setItem={v => setTempItem(p => ({ ...p, work: v }))} onAddItem={() => { if (handleAddItem('typeOfWorks', tempItem.work)) setTempItem(p => ({ ...p, work: '' })); }} onRemoveItem={(i) => handleRemoveItem('typeOfWorks', i)} />
            <FormField label="Experience (Years)" placeholder="e.g., 10" value={formData.experiences} onChangeText={v => handleChange('experiences', v)} keyboardType="numeric" />
            <SelectionField label="Pricing Method" options={['Hourly', 'Fixed', 'Per Project']} selectedValue={formData.pricingMethod} onSelect={v => handleChange('pricingMethod', v)} />
            <FormField label="Approximate Fee (LKR)" placeholder="e.g., 5000" value={formData.approximateFee} onChangeText={v => handleChange('approximateFee', v)} keyboardType="numeric" />
          </View>

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Availability & Contact</Text>
            <DynamicListField label="Availability" placeholder="e.g., Monday 9AM-5PM" items={formData.availability} item={tempItem.availability} setItem={v => setTempItem(p => ({ ...p, availability: v }))} onAddItem={() => { if (handleAddItem('availability', tempItem.availability)) setTempItem(p => ({ ...p, availability: '' })); }} onRemoveItem={(i) => handleRemoveItem('availability', i)} />
            <DynamicListField label="Area Covered" placeholder="e.g., Colombo" items={formData.areaCovered} item={tempItem.area} setItem={v => setTempItem(p => ({ ...p, area: v }))} onAddItem={() => { if (handleAddItem('areaCovered', tempItem.area)) setTempItem(p => ({ ...p, area: '' })); }} onRemoveItem={(i) => handleRemoveItem('areaCovered', i)} />
            <DynamicListField label="Languages Spoken" placeholder="e.g., English" items={formData.languagesSpoken} item={tempItem.language} setItem={v => setTempItem(p => ({ ...p, language: v }))} onAddItem={() => { if (handleAddItem('languagesSpoken', tempItem.language)) setTempItem(p => ({ ...p, language: '' })); }} onRemoveItem={(i) => handleRemoveItem('languagesSpoken', i)} />
            <FormField label="Contact Phone" placeholder="Enter phone number" value={formData.contactInfo.phone} onChangeText={v => handleChange('contactInfo.phone', v)} keyboardType="phone-pad" />
            <FormField label="Contact Email" placeholder="e.g., contact@quickfix.com" value={formData.contactInfo.email} onChangeText={v => handleChange('contactInfo.email', v)} keyboardType="email-address" />
            <FormField label="Social Media" placeholder="e.g., facebook.com/quickfix" value={formData.contactInfo.socialMedia} onChangeText={v => handleChange('contactInfo.socialMedia', v)} />
            <SelectionField label="24/7 Available" options={['Yes', 'No']} selectedValue={formData.is24HourAvailable} onSelect={v => handleChange('is24HourAvailable', v)} />
          </View>

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Additional Details</Text>
            <DynamicListField label="Certifications" placeholder="e.g., Certified Electrician" items={formData.certifications} item={tempItem.certification} setItem={v => setTempItem(p => ({ ...p, certification: v }))} onAddItem={() => { if (handleAddItem('certifications', tempItem.certification)) setTempItem(p => ({ ...p, certification: '' })); }} onRemoveItem={(i) => handleRemoveItem('certifications', i)} />
            <SelectionField label="Tools Provided" options={['Yes', 'No']} selectedValue={formData.toolsProvided} onSelect={v => handleChange('toolsProvided', v)} />
            <FormField label="Warranty Offered" placeholder="e.g., 6 months on labor" value={formData.warrantyOffered} onChangeText={v => handleChange('warrantyOffered', v)} />
            <FormField label="Next Update Date" placeholder="YYYY-MM-DD" value={formData.nextUpdateDate} onChangeText={v => handleChange('nextUpdateDate', v)} />
            <Text className="text-gray-600 mb-2 font-medium">Photos</Text>
            <TouchableOpacity onPress={pickImages} className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center justify-center bg-gray-50 mb-4">
              <Ionicons name="cloud-upload-outline" size={40} color="gray" />
              <Text className="text-gray-500 mt-2">Tap to upload photos</Text>
            </TouchableOpacity>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {formData.photos.map((uri, index) => (
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
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white font-bold text-lg">Create Home Repair Listing</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}