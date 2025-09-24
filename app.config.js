import 'dotenv/config';

export default {
  "expo": {
    "name": "locato-frontend",
    "slug": "locato-frontend",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "locatofrontend",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.pasan-sasmika.locatofrontend",
      "config": {
        // Use the API key from the environment variable
        "googleMapsApiKey": process.env.GOOGLE_MAPS_API_KEY
      },
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "This app needs access to your location to show it on the map and find nearby services."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "android.permission.ACCESS_FINE_LOCATION"
      ],
      "config": {
        "googleMaps": {
          // Use the API key from the environment variable
          "apiKey": process.env.GOOGLE_MAPS_API_KEY
        }
      },
      "package": "com.pasan_sasmika.locatofrontend"
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      // Include any necessary plugins here
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
};