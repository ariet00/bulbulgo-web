import { initializeApp } from 'firebase/app'
import { getMessaging, Messaging, isSupported } from 'firebase/messaging'

// TODO: Replace with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
  apiKey: 'AIzaSyCPvDWGO04CPdjKC5l3zHGx7prj7xz85xY',
  authDomain: 'doska-f0532.firebaseapp.com',
  projectId: 'doska-f0532',
  storageBucket: 'doska-f0532.firebasestorage.app',
  messagingSenderId: '581148505696',
  appId: '1:581148505696:web:ceb27bea654837206a7505',
  measurementId: 'G-3326QFDKBL',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Cloud Messaging and get a reference to the service
const getMessagingInstance = async (): Promise<Messaging | null> => {
  if (typeof window !== 'undefined') {
    const supported = await isSupported()
    if (supported) {
      return getMessaging(app)
    }
  }
  return null
}

export { getMessagingInstance }
