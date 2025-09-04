import { View, Text, SafeAreaView, ScrollView, ActivityIndicator, RefreshControl, Image, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ServiceAll() {
  const { serviceType } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mapping from serviceType (title case, plural) to API key (lowercase plural)
  const serviceMap = {
    'Hospitals': 'hospitals',
    'Labs': 'labs',
    'Pharmacies': 'pharmacies',
    'Restaurants': 'restaurants',
    'Saloons': 'saloons',
    'Spas': 'spas',
    'Supermarkets': 'supermarkets',
    'Ayurveda': 'ayurveda',
    'BridalMakeups': 'bridalMakeups',
    'Clothing': 'clothing',
    'Private': 'private',
    'Electronics': 'electronics',
    'Fitness Center': 'fitnesscenter',
    'Hardware': 'hardware',
    'Home Repairs': 'homeRepairs',
  };

  // Normalize serviceType to title case plural and get the service key
  const normalizeServiceType = (type) => {
    if (!type) return null;
    let normalized = type
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/(^|[a-z])([A-Z])/g, (m, g1, g2) => g1 + g2.toLowerCase())
      .replace(/^./, (str) => str.toUpperCase());
    if (serviceMap[normalized]) return serviceMap[normalized];
    const typoCorrections = {
      'Ayruwedha': 'Ayurveda',
      'Ayruveda': 'Ayurveda',
      'HomeRepair': 'HomeRepairs',
      'Pharmacy': 'Pharmacies',
      'Private': 'private',
      'HomeRepair': 'homeRepairs',
      'BridleMakeup': 'bridalMakeups',
      'BridleMakeupAndBeauty': 'bridalMakeups',
      'Fitness Center': 'fitnesscenter',
    };
    normalized = typoCorrections[normalized] || normalized;
    if (serviceMap[normalized]) return serviceMap[normalized];
    if (!normalized.endsWith('s')) normalized += 's';
    return serviceMap[normalized] || null;
  };

  const serviceKey = normalizeServiceType(serviceType);
  if (!serviceKey) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="text-xl font-semibold text-gray-800 mt-4">Unsupported service type: {serviceType}</Text>
        <TouchableOpacity
          className="mt-6 bg-teal-500 px-6 py-3 rounded-full flex-row items-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Function to fetch data
  const fetchData = async () => {
    try {
      const response = await axios.get(`https://locato-backend-wxjj.onrender.com/api/all-services?services=${serviceKey}`);
      const serviceData = response.data.data[serviceKey]?.data || [];
      setData(serviceData);
    } catch (error) {
      console.error(`Error fetching ${serviceType}:`, error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [serviceType]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const screenWidth = Dimensions.get('window').width;

  // Shared image carousel component
  const renderImageCarousel = (images, photosKey = 'images') => (
    images?.length > 0 && (
      <View className="relative">
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          className="mt-0 -mx-5"
        >
          {images.map((img, idx) => (
            <View key={idx} style={{ width: screenWidth - 32 }}>
              <Image
                source={{ uri: img }}
                className="w-full h-48 rounded-t-xl"
                resizeMode="cover"
              />
            </View>
          ))}
        </ScrollView>
        <View className="absolute bottom-2 flex-row justify-center w-full">
          {images.map((_, idx) => (
            <View
              key={idx}
              className={`w-2 h-2 rounded-full mx-1 ${idx === 0 ? 'bg-teal-500' : 'bg-gray-300'}`}
            />
          ))}
        </View>
      </View>
    )
  );

  // Shared info row component
  const renderInfoRow = (icon, label, value) => (
    value && value !== 'N/A' && (
      <View className="flex-row items-center mb-2">
        <Ionicons name={icon} size={20} color="#10b981" />
        <Text className="text-gray-700 ml-2 text-base">{label}: {value}</Text>
      </View>
    )
  );

  // Render functions for each service type
  const renderHospital = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.images)}
      <Text className="text-2xl font-bold text-gray-800 mt-4 mb-3">{item.name}</Text>
      {renderInfoRow('medkit-outline', 'Type', item.hospitalType)}
      {renderInfoRow('pulse-outline', 'Departments', item.departments?.join(', '))}
      {renderInfoRow('alert-circle-outline', '24/7 Emergency', item.emergency247 ? 'Yes' : 'No')}
      {renderInfoRow('call-outline', 'Contact', item.contactNo)}
      {renderInfoRow('location-outline', 'Location', item.location)}
      {renderInfoRow('time-outline', 'Visiting Hours', item.visitingHours)}
      {renderInfoRow('globe-outline', 'Website', item.website)}
      {renderInfoRow('ambulance-outline', 'Ambulance', item.ambulanceNo)}
      {renderInfoRow('calendar-outline', 'Next Update', item.nextUpdateDate ? new Date(item.nextUpdateDate).toLocaleDateString() : 'N/A')}
      {renderInfoRow('create-outline', 'Created', new Date(item.createdAt).toLocaleString())}
      {renderInfoRow('refresh-outline', 'Updated', new Date(item.updatedAt).toLocaleString())}
    </View>
  );

  const renderLab = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.images)}
      <Text className="text-2xl font-bold text-gray-800 mt-4 mb-3">{item.name}</Text>
      {renderInfoRow('flask-outline', 'Tests Offered', item.testsOffered?.join(', '))}
      {renderInfoRow('home-outline', 'Home Sample Collection', item.homeSampleCollection ? 'Yes' : 'No')}
      {renderInfoRow('time-outline', 'Open Hours', item.openHours)}
      {renderInfoRow('call-outline', 'Contact', item.contactNo)}
      {renderInfoRow('location-outline', 'Location', item.location)}
      {renderInfoRow('globe-outline', 'Website', item.website)}
      {renderInfoRow('create-outline', 'Created', new Date(item.createdAt).toLocaleString())}
      {renderInfoRow('refresh-outline', 'Updated', new Date(item.updatedAt).toLocaleString())}
    </View>
  );

  const renderPharmacy = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.images)}
      <Text className="text-2xl font-bold text-gray-800 mt-4 mb-3">{item.name}</Text>
      {renderInfoRow('time-outline', 'Open Hours', item.openHours)}
      {renderInfoRow('moon-outline', '24/7 Service', item.service247 ? 'Yes' : 'No')}
      {renderInfoRow('car-outline', 'Delivery', item.deliveryAvailable ? 'Yes' : 'No')}
      {renderInfoRow('call-outline', 'Contact', item.contactNo)}
      {renderInfoRow('location-outline', 'Location', item.location)}
      <View className="flex-row items-center mb-2">
        <Ionicons name="star" size={20} color="#FFD700" />
        <Text className="text-gray-700 ml-2 text-base">Rating: {item.rating || 0} / 5</Text>
      </View>
      {renderInfoRow('calendar-outline', 'Next Update', item.nextUpdateDate ? new Date(item.nextUpdateDate).toLocaleDateString() : 'N/A')}
      {renderInfoRow('create-outline', 'Created', new Date(item.createdAt).toLocaleString())}
      {renderInfoRow('refresh-outline', 'Updated', new Date(item.updatedAt).toLocaleString())}
      {item.reviews?.length > 0 && (
        <View className="mt-3 border-t border-gray-200 pt-3">
          <Text className="text-base font-semibold text-gray-700 mb-2">
            <Ionicons name="chatbubbles-outline" size={20} color="#10b981" /> +{item.reviews.length} Reviews
          </Text>
          {item.reviews.map((review, idx) => (
            <View key={idx} className="ml-2 mb-2">
              <Text className="text-gray-600 text-sm">{review.reviewerName}: {review.comment} (Rating: {review.rating})</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderRestaurant = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.photos, 'photos')}
      <Text className="text-2xl font-bold text-gray-800 mt-4 mb-3">{item.name}</Text>
      {renderInfoRow('restaurant-outline', 'Cuisine', item.cuisineTypes?.join(', '))}
      {renderInfoRow('menu-outline', 'Menu Highlights', item.menuHighlights)}
      {renderInfoRow('cash-outline', 'Price Range', item.priceRange)}
      {renderInfoRow('location-outline', 'Location', item.location)}
      {renderInfoRow('cart-outline', 'Delivery Portals', item.deliveryPortals?.join(', '))}
      {renderInfoRow('call-outline', 'Phone', item.contactInfo?.phone)}
      {renderInfoRow('mail-outline', 'Email', item.contactInfo?.email)}
      {renderInfoRow('logo-instagram', 'Social Media', item.contactInfo?.socialMedia)}
      {renderInfoRow('time-outline', 'Opening Hours', item.openingHours)}
      {renderInfoRow('restaurant-outline', 'Service Modes', item.serviceMode?.join(', '))}
      <View className="flex-row items-center mb-2">
        <Ionicons name="star" size={20} color="#FFD700" />
        <Text className="text-gray-700 ml-2 text-base">Rating: {item.rating || 0} / 5</Text>
      </View>
      {renderInfoRow('information-circle-outline', 'Description', item.description)}
      {renderInfoRow('calendar-outline', 'Next Update', item.nextUpdateDate ? new Date(item.nextUpdateDate).toLocaleDateString() : 'N/A')}
      {renderInfoRow('calendar-outline', 'Reservation', item.reservationAvailable ? 'Yes' : 'No')}
      {renderInfoRow('leaf-outline', 'Dietary Options', item.dietaryOptions?.join(', '))}
      {renderInfoRow('heart-outline', 'Ambiance', item.ambiance)}
      {renderInfoRow('car-outline', 'Parking', item.parkingAvailable ? 'Yes' : 'No')}
      {renderInfoRow('create-outline', 'Created', new Date(item.createdAt).toLocaleString())}
      {renderInfoRow('refresh-outline', 'Updated', new Date(item.updatedAt).toLocaleString())}
    </View>
  );

  const renderSaloon = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.images)}
      <Text className="text-2xl font-bold text-gray-800 mt-4 mb-3">{item.name}</Text>
      {renderInfoRow('people-outline', 'Gender Served', item.genderServed)}
      {renderInfoRow('cut-outline', 'Services', item.services?.join(', '))}
      {renderInfoRow('cash-outline', 'Price List', item.priceList)}
      {renderInfoRow('calendar-outline', 'Working Days', item.workingDays?.join(', '))}
      {renderInfoRow('calendar-outline', 'Appointment Needed', item.appointmentNeeded ? 'Yes' : 'No')}
      {renderInfoRow('walk-outline', 'Walk-In Allowed', item.walkInAllowed ? 'Yes' : 'No')}
      {renderInfoRow('construct-outline', 'Service Modes', item.serviceModes?.join(', '))}
      {renderInfoRow('call-outline', 'Phone', item.contactInfo?.phone)}
      {renderInfoRow('logo-instagram', 'Social Media', item.contactInfo?.socialMedia)}
      {renderInfoRow('location-outline', 'Location', item.location)}
      {renderInfoRow('language-outline', 'Languages', item.languages?.join(', '))}
      <View className="flex-row items-center mb-2">
        <Ionicons name="star" size={20} color="#FFD700" />
        <Text className="text-gray-700 ml-2 text-base">Rating: {item.rating || 0} / 5</Text>
      </View>
      {renderInfoRow('calendar-outline', 'Next Update', item.nextUpdateDate ? new Date(item.nextUpdateDate).toLocaleDateString() : 'N/A')}
      {renderInfoRow('create-outline', 'Created', new Date(item.createdAt).toLocaleString())}
      {renderInfoRow('refresh-outline', 'Updated', new Date(item.updatedAt).toLocaleString())}
    </View>
  );

  const renderSpa = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.images)}
      <Text className="text-2xl font-bold text-gray-800 mt-4 mb-3">{item.name}</Text>
      {renderInfoRow('sparkles-outline', 'Services', item.services?.join(', '))}
      {renderInfoRow('people-outline', 'Gender Served', item.genderServed)}
      {renderInfoRow('time-outline', 'Experience', item.experience)}
      {renderInfoRow('checkmark-circle-outline', 'Certified Therapists', item.certifiedTherapists ? 'Yes' : 'No')}
      {renderInfoRow('hourglass-outline', 'Service Duration', item.serviceDuration)}
      {renderInfoRow('cash-outline', 'Price List', item.priceList)}
      {renderInfoRow('bed-outline', 'Facilities', item.facilities?.join(', '))}
      {renderInfoRow('time-outline', 'Working Hours', item.workingHours)}
      {renderInfoRow('calendar-outline', 'Booking Method', item.bookingMethod)}
      {renderInfoRow('call-outline', 'Contact', item.contactNo)}
      {renderInfoRow('location-outline', 'Locations', item.locations?.join(', '))}
      <View className="flex-row items-center mb-2">
        <Ionicons name="star" size={20} color="#FFD700" />
        <Text className="text-gray-700 ml-2 text-base">Rating: {item.rating || 0} / 5</Text>
      </View>
      {renderInfoRow('calendar-outline', 'Next Update', item.nextUpdateDate ? new Date(item.nextUpdateDate).toLocaleDateString() : 'N/A')}
      {renderInfoRow('create-outline', 'Created', new Date(item.createdAt).toLocaleString())}
      {renderInfoRow('refresh-outline', 'Updated', new Date(item.updatedAt).toLocaleString())}
      {item.reviews?.length > 0 && (
        <View className="mt-3 border-t border-gray-200 pt-3">
          <Text className="text-base font-semibold text-gray-700 mb-2">
            <Ionicons name="chatbubbles-outline" size={20} color="#10b981" /> +{item.reviews.length} Reviews
          </Text>
          {item.reviews.map((review, idx) => (
            <View key={idx} className="ml-2 mb-2">
              <Text className="text-gray-600 text-sm">{review.reviewerName}: {review.comment} (Rating: {review.rating})</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderSupermarket = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.images)}
      <Text className="text-2xl font-bold text-gray-800 mt-4 mb-3">{item.name}</Text>
      {renderInfoRow('storefront-outline', 'Store Type', item.storeType)}
      {renderInfoRow('time-outline', 'Open Now', item.isOpenNow ? 'Yes' : 'No')}
      {renderInfoRow('car-outline', 'Delivery', item.deliveryAvailable ? 'Yes' : 'No')}
      {renderInfoRow('card-outline', 'Payment Methods', item.paymentMethods?.join(', '))}
      {renderInfoRow('map-outline', 'Areas Covered', item.areasCovered?.join(', '))}
      <View className="flex-row items-center mb-2">
        <Ionicons name="star" size={20} color="#FFD700" />
        <Text className="text-gray-700 ml-2 text-base">Rating: {item.rating || 0} / 5</Text>
      </View>
      {renderInfoRow('pricetags-outline', 'Categories', item.categoriesAvailable?.join(', '))}
      {renderInfoRow('car-outline', 'Parking', item.parkingAvailable ? 'Yes' : 'No')}
      {renderInfoRow('pricetag-outline', 'Offers', item.offersAvailable)}
      {renderInfoRow('moon-outline', '24 Hour Open', item.is24HourOpen ? 'Yes' : 'No')}
      {renderInfoRow('pricetag-outline', 'Membership Discount', item.membershipDiscount)}
      {renderInfoRow('call-outline', 'Phone', item.contactInfo?.phone)}
      {renderInfoRow('mail-outline', 'Email', item.contactInfo?.email)}
      {renderInfoRow('logo-instagram', 'Social Media', item.contactInfo?.socialMedia)}
      {renderInfoRow('information-circle-outline', 'Description', item.description)}
      {renderInfoRow('calendar-outline', 'Next Update', item.nextUpdateDate ? new Date(item.nextUpdateDate).toLocaleDateString() : 'N/A')}
      {renderInfoRow('location-outline', 'Location', item.location)}
      {renderInfoRow('time-outline', 'Store Hours', item.storeHours)}
      {renderInfoRow('heart-outline', 'Loyalty Program', item.loyaltyProgram)}
      {renderInfoRow('cart-outline', 'Online Ordering', item.onlineOrdering ? 'Yes' : 'No')}
      {renderInfoRow('create-outline', 'Created', new Date(item.createdAt).toLocaleString())}
      {renderInfoRow('refresh-outline', 'Updated', new Date(item.updatedAt).toLocaleString())}
    </View>
  );

  const renderAyurveda = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.images)}
      <Text className="text-2xl font-bold text-gray-800 mt-4 mb-3">{item.centreName}</Text>
      {renderInfoRow('leaf-outline', 'Service Info', item.serviceInfo)}
      {renderInfoRow('language-outline', 'Languages', item.languages?.join(', '))}
      {renderInfoRow('location-outline', 'Location', item.location)}
      {renderInfoRow('call-outline', 'Phone', item.contactInfo?.phone)}
      {renderInfoRow('mail-outline', 'Email', item.contactInfo?.email)}
      {renderInfoRow('globe-outline', 'Website', item.contactInfo?.website)}
      {renderInfoRow('time-outline', 'Opening Hours', item.openingHours)}
      {renderInfoRow('people-outline', 'Practitioners', item.practitioners?.join(', '))}
      {renderInfoRow('medkit-outline', 'Treatments', item.treatmentsOffered?.join(', '))}
      {renderInfoRow('bed-outline', 'Facilities', item.facilities?.join(', '))}
      {renderInfoRow('cash-outline', 'Price Range', item.priceRange)}
      {renderInfoRow('calendar-outline', 'Appointment Required', item.appointmentRequired ? 'Yes' : 'No')}
      {renderInfoRow('alert-circle-outline', 'Emergency Care', item.emergencyCare ? 'Yes' : 'No')}
      {renderInfoRow('pricetag-outline', 'Special Packages', item.specialPackages?.join(', '))}
      {renderInfoRow('checkmark-circle-outline', 'Certifications', item.certifications?.join(', '))}
      {renderInfoRow('calendar-outline', 'Next Update', item.nextUpdateDate ? new Date(item.nextUpdateDate).toLocaleDateString() : 'N/A')}
      {renderInfoRow('create-outline', 'Created', new Date(item.createdAt).toLocaleString())}
      {renderInfoRow('refresh-outline', 'Updated', new Date(item.updatedAt).toLocaleString())}
    </View>
  );

  const renderBridalMakeup = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.photos, 'photos')}
      <Text className="text-2xl font-bold text-gray-800 mt-4 mb-3">{item.name}</Text>
      {renderInfoRow('sparkles-outline', 'Services', item.services?.join(', '))}
      {renderInfoRow('pricetags-outline', 'Packages', item.packages)}
      {renderInfoRow('cash-outline', 'Prices', item.prices)}
      {renderInfoRow('wallet-outline', 'Advance Received', item.advanceReceived)}
      {renderInfoRow('construct-outline', 'Service Mode', item.serviceMode?.join(', '))}
      {renderInfoRow('time-outline', 'Experience', item.experience ? `${item.experience} years` : 'N/A')}
      {renderInfoRow('heart-outline', 'Available for Wedding', item.availableForWedding ? 'Yes' : 'No')}
      {renderInfoRow('image-outline', 'Samples', item.samples?.join(', '))}
      {renderInfoRow('calendar-outline', 'Availability', item.availabilityDate?.map(date => new Date(date).toLocaleDateString()).join(', '))}
      {renderInfoRow('call-outline', 'Phone', item.contactInfo?.phone)}
      {renderInfoRow('mail-outline', 'Email', item.contactInfo?.email)}
      {renderInfoRow('logo-instagram', 'Social Media', item.contactInfo?.socialMedia)}
      {renderInfoRow('location-outline', 'Location', item.location)}
      {renderInfoRow('people-outline', 'Gender Served', item.genderServed)}
      <View className="flex-row items-center mb-2">
        <Ionicons name="star" size={20} color="#FFD700" />
        <Text className="text-gray-700 ml-2 text-base">Rating: {item.review || 0} / 5</Text>
      </View>
      {renderInfoRow('calendar-outline', 'Next Update', item.nextUpdateDate ? new Date(item.nextUpdateDate).toLocaleDateString() : 'N/A')}
      {renderInfoRow('checkmark-circle-outline', 'Certifications', item.certifications?.join(', '))}
      {renderInfoRow('link-outline', 'Portfolio', item.portfolioLink)}
      {renderInfoRow('car-outline', 'Travel Availability', item.travelAvailability ? 'Yes' : 'No')}
      {renderInfoRow('create-outline', 'Created', new Date(item.createdAt).toLocaleString())}
      {renderInfoRow('refresh-outline', 'Updated', new Date(item.updatedAt).toLocaleString())}
    </View>
  );

  const renderClothing = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.images)}
      <Text className="text-2xl font-bold text-gray-800 mt-4 mb-3">{item.name}</Text>
      {renderInfoRow('shirt-outline', 'Type', item.type)}
      {renderInfoRow('color-palette-outline', 'Style', item.style?.join(', '))}
      {renderInfoRow('cash-outline', 'Price Ranges', item.priceRanges)}
      {renderInfoRow('pricetags-outline', 'Sizes', item.sizes?.join(', '))}
      {renderInfoRow('pricetag-outline', 'Offers', item.offers)}
      <View className="flex-row items-center mb-2">
        <Ionicons name="star" size={20} color="#FFD700" />
        <Text className="text-gray-700 ml-2 text-base">Rating: {item.ratings || 0} / 5</Text>
      </View>
      {renderInfoRow('time-outline', 'Open Hours', item.openHours)}
      {renderInfoRow('map-outline', 'Areas Covered', item.areasCovered?.join(', '))}
      {renderInfoRow('information-circle-outline', 'Description', item.description)}
      {renderInfoRow('call-outline', 'Phone', item.contactInfo?.phone)}
      {renderInfoRow('mail-outline', 'Email', item.contactInfo?.email)}
      {renderInfoRow('logo-instagram', 'Social Media', item.contactInfo?.socialMedia)}
      {renderInfoRow('calendar-outline', 'Next Update', item.nextUpdateDate ? new Date(item.nextUpdateDate).toLocaleDateString() : 'N/A')}
      {renderInfoRow('pricetags-outline', 'Brand Offerings', item.brandOfferings?.join(', '))}
      {renderInfoRow('arrow-undo-outline', 'Return Policy', item.returnPolicy)}
      {renderInfoRow('cart-outline', 'Online Shopping', item.onlineShopping ? 'Yes' : 'No')}
      {renderInfoRow('create-outline', 'Created', new Date(item.createdAt).toLocaleString())}
      {renderInfoRow('refresh-outline', 'Updated', new Date(item.updatedAt).toLocaleString())}
    </View>
  );

  const renderDoctor = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.images)}
      <Text className="text-2xl font-bold text-gray-800 mt-4 mb-3">{item.name}</Text>
      {renderInfoRow('medkit-outline', 'Specialty', item.specialty)}
      {renderInfoRow('call-outline', 'Contact', item.contactInfo)}
      {renderInfoRow('calendar-outline', 'Availability', item.availability?.map(a => `${a.day}: ${a.time}`).join(', '))}
      {renderInfoRow('language-outline', 'Languages', item.languages?.join(', '))}
      {renderInfoRow('location-outline', 'Location', item.location)}
      {renderInfoRow('home-outline', 'Home Visits', item.homeVisits ? 'Yes' : 'No')}
      {renderInfoRow('create-outline', 'Created', new Date(item.createdAt).toLocaleString())}
      {renderInfoRow('refresh-outline', 'Updated', new Date(item.updatedAt).toLocaleString())}
    </View>
  );

  const renderElectronics = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.photos, 'photos')}
      <Text className="text-2xl font-bold text-gray-800 mt-4 mb-3">{item.name}</Text>
      {renderInfoRow('phone-portrait-outline', 'Products Sold', item.productsSold?.join(', '))}
      {renderInfoRow('construct-outline', 'Services Offered', item.servicesOffered?.join(', '))}
      {renderInfoRow('shield-checkmark-outline', 'Warranty', item.warrantyInfo)}
      {renderInfoRow('pricetags-outline', 'Brands', item.brandPurchases?.join(', '))}
      {renderInfoRow('location-outline', 'Location', item.location)}
      {renderInfoRow('call-outline', 'Phone', item.contactInfo?.phone)}
      {renderInfoRow('mail-outline', 'Email', item.contactInfo?.email)}
      {renderInfoRow('logo-instagram', 'Social Media', item.contactInfo?.socialMedia)}
      {renderInfoRow('time-outline', 'Opening Hours', item.openingHours)}
      {renderInfoRow('car-outline', 'Delivery Options', item.deliveryOptions)}
      {renderInfoRow('construct-outline', 'Repair Services', item.repairServices ? 'Yes' : 'No')}
      {renderInfoRow('headset-outline', 'Customer Support', item.customerSupportAvailability)}
      <View className="flex-row items-center mb-2">
        <Ionicons name="star" size={20} color="#FFD700" />
        <Text className="text-gray-700 ml-2 text-base">Rating: {item.rating || 0} / 5</Text>
      </View>
      {renderInfoRow('cart-outline', 'Online Shopping', item.onlineShopping ? 'Yes' : 'No')}
      {renderInfoRow('calendar-outline', 'Next Update', item.nextUpdateDate ? new Date(item.nextUpdateDate).toLocaleDateString() : 'N/A')}
      {renderInfoRow('create-outline', 'Created', new Date(item.createdAt).toLocaleString())}
      {renderInfoRow('refresh-outline', 'Updated', new Date(item.updatedAt).toLocaleString())}
    </View>
  );

  const renderGym = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.images)}
      <Text className="text-2xl font-bold text-gray-800 mt-4 mb-3">{item.name}</Text>
      {renderInfoRow('barbell-outline', 'Services', item.services?.join(', '))}
      {renderInfoRow('people-outline', 'Trainers', item.trainersAvailable?.join(', '))}
      {renderInfoRow('card-outline', 'Membership Plans', item.membershipPlans)}
      {renderInfoRow('bed-outline', 'Facilities', item.facilities?.join(', '))}
      {renderInfoRow('time-outline', 'Ladies Time', item.ladiesTime)}
      {renderInfoRow('time-outline', 'Operating Hours', item.operatingHours)}
      {renderInfoRow('people-outline', 'Capacity', item.capacity)}
      {renderInfoRow('call-outline', 'Phone', item.contactInfo?.phone)}
      {renderInfoRow('logo-instagram', 'Social Media', item.contactInfo?.socialMedia)}
      {renderInfoRow('location-outline', 'Location', item.location)}
      <View className="flex-row items-center mb-2">
        <Ionicons name="star" size={20} color="#FFD700" />
        <Text className="text-gray-700 ml-2 text-base">Rating: {item.rating || 0} / 5</Text>
      </View>
      {renderInfoRow('calendar-outline', 'Next Update', item.nextUpdateDate ? new Date(item.nextUpdateDate).toLocaleDateString() : 'N/A')}
      {renderInfoRow('create-outline', 'Created', new Date(item.createdAt).toLocaleString())}
      {renderInfoRow('refresh-outline', 'Updated', new Date(item.updatedAt).toLocaleString())}
    </View>
  );

  const renderHardware = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.photos, 'photos')}
      <Text className="text-2xl font-bold text-gray-800 mt-4 mb-3">{item.name}</Text>
      {renderInfoRow('construct-outline', 'Categories', item.categories?.join(', '))}
      {renderInfoRow('pricetags-outline', 'Brands', item.brandList?.join(', '))}
      {renderInfoRow('car-outline', 'Delivery Info', item.deliveryInfo)}
      {renderInfoRow('call-outline', 'Phone', item.contactInfo?.phone)}
      {renderInfoRow('mail-outline', 'Email', item.contactInfo?.email)}
      {renderInfoRow('logo-instagram', 'Social Media', item.contactInfo?.socialMedia)}
      {renderInfoRow('cube-outline', 'Stock Status', item.stockStatus)}
      {renderInfoRow('time-outline', 'Opening Hours', item.openingHours)}
      {renderInfoRow('pricetag-outline', 'Discounts', item.discounts)}
      {renderInfoRow('cash-outline', 'Price Info', item.priceInfo)}
      {renderInfoRow('information-circle-outline', 'Description', item.description)}
      {renderInfoRow('location-outline', 'Location', item.location)}
      <View className="flex-row items-center mb-2">
        <Ionicons name="star" size={20} color="#FFD700" />
        <Text className="text-gray-700 ml-2 text-base">Rating: {item.rating || 0} / 5</Text>
      </View>
      {renderInfoRow('calendar-outline', 'Next Update', item.nextUpdateDate ? new Date(item.nextUpdateDate).toLocaleDateString() : 'N/A')}
      {renderInfoRow('shield-checkmark-outline', 'Warranty', item.warrantyInfo)}
      {renderInfoRow('arrow-undo-outline', 'Return Policy', item.returnPolicy)}
      {renderInfoRow('cart-outline', 'Online Ordering', item.onlineOrdering ? 'Yes' : 'No')}
      {renderInfoRow('create-outline', 'Created', new Date(item.createdAt).toLocaleString())}
      {renderInfoRow('refresh-outline', 'Updated', new Date(item.updatedAt).toLocaleString())}
    </View>
  );

  const renderHomeRepair = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.photos, 'photos')}
      <Text className="text-2xl font-bold text-gray-800 mt-4 mb-3">{item.serviceName}</Text>
      {renderInfoRow('construct-outline', 'Subcategory', item.subcategory)}
      {renderInfoRow('hammer-outline', 'Type of Works', item.typeOfWorks?.join(', '))}
      {renderInfoRow('time-outline', 'Experience', item.experiences ? `${item.experiences} years` : 'N/A')}
      {renderInfoRow('cash-outline', 'Pricing Method', item.pricingMethod)}
      {renderInfoRow('wallet-outline', 'Approximate Fee', item.approximateFee)}
      {renderInfoRow('calendar-outline', 'Availability', item.availability?.join(', '))}
      {renderInfoRow('map-outline', 'Area Covered', item.areaCovered?.join(', '))}
      {renderInfoRow('call-outline', 'Phone', item.contactInfo?.phone)}
      {renderInfoRow('mail-outline', 'Email', item.contactInfo?.email)}
      {renderInfoRow('logo-instagram', 'Social Media', item.contactInfo?.socialMedia)}
      {renderInfoRow('language-outline', 'Languages', item.languagesSpoken?.join(', '))}
      <View className="flex-row items-center mb-2">
        <Ionicons name="star" size={20} color="#FFD700" />
        <Text className="text-gray-700 ml-2 text-base">Rating: {item.review || 0} / 5</Text>
      </View>
      {renderInfoRow('information-circle-outline', 'Description', item.description)}
      {renderInfoRow('calendar-outline', 'Next Update', item.nextUpdateDate ? new Date(item.nextUpdateDate).toLocaleDateString() : 'N/A')}
      {renderInfoRow('moon-outline', '24 Hour Available', item.is24HourAvailable ? 'Yes' : 'No')}
      {renderInfoRow('construct-outline', 'Tools Provided', item.toolsProvided ? 'Yes' : 'No')}
      {renderInfoRow('checkmark-circle-outline', 'Certifications', item.certifications?.join(', '))}
      {renderInfoRow('shield-checkmark-outline', 'Warranty', item.warrantyOffered)}
      {renderInfoRow('create-outline', 'Created', new Date(item.createdAt).toLocaleString())}
      {renderInfoRow('refresh-outline', 'Updated', new Date(item.updatedAt).toLocaleString())}
    </View>
  );

  // Map service keys to render functions
  const renderFunctions = {
    hospitals: renderHospital,
    labs: renderLab,
    pharmacies: renderPharmacy,
    restaurants: renderRestaurant,
    saloons: renderSaloon,
    spas: renderSpa,
    supermarkets: renderSupermarket,
    ayurveda: renderAyurveda,
    bridalMakeups: renderBridalMakeup,
    clothing: renderClothing,
    private: renderDoctor,
    electronics: renderElectronics,
    fitnesscenter: renderGym,
    hardware: renderHardware,
    homeRepairs: renderHomeRepair,
  };

  const renderItem = ({ item }) => {
    const renderFunc = renderFunctions[serviceKey];
    return renderFunc ? renderFunc(item) : (
      <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
        <Text className="text-center text-gray-500 text-lg">Unsupported service type</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <LinearGradient
        colors={['#10b981', '#059669']}
        className="px-6 pt-6 pb-3 flex-row items-center justify-between"
      >
        <Text className="text-2xl font-bold text-white">All {serviceType}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
      </LinearGradient>
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          loading ? null : (
            <View className="flex-1 justify-center items-center mt-10">
              <Ionicons name="sad-outline" size={48} color="#6b7280" />
              <Text className="text-gray-500 text-lg mt-4">No {serviceType} available</Text>
            </View>
          )
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
      />
      {loading && (
        <View className="absolute inset-0 flex-1 justify-center items-center bg-gray-100/50">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      )}
    </SafeAreaView>
  );
}           