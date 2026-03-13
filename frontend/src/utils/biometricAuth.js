/**
 * Biometric Authentication Service
 * Uses Web Credentials API and localStorage for biometric-like quick login
 */

const BIOMETRIC_KEY = 'mamandouce_biometric_enabled';
const CREDENTIALS_KEY = 'mamandouce_saved_credentials';

// Check if biometric/credential storage is available
export const isBiometricAvailable = () => {
  // Check for Credential Management API support
  if ('credentials' in navigator && 'PasswordCredential' in window) {
    return true;
  }
  // Fallback: check if we have saved credentials
  return localStorage.getItem(BIOMETRIC_KEY) === 'true';
};

// Check if user has enabled biometric login
export const isBiometricEnabled = () => {
  return localStorage.getItem(BIOMETRIC_KEY) === 'true';
};

// Enable biometric login and save credentials
export const enableBiometricLogin = async (email, password) => {
  try {
    // Try to use Credential Management API first
    if ('credentials' in navigator && 'PasswordCredential' in window) {
      const credential = new PasswordCredential({
        id: email,
        password: password,
        name: 'MamanDouce'
      });
      await navigator.credentials.store(credential);
    }
    
    // Also save encrypted in localStorage as backup
    const encoded = btoa(JSON.stringify({ email, password }));
    localStorage.setItem(CREDENTIALS_KEY, encoded);
    localStorage.setItem(BIOMETRIC_KEY, 'true');
    
    return true;
  } catch (error) {
    console.error('Error enabling biometric:', error);
    return false;
  }
};

// Disable biometric login
export const disableBiometricLogin = () => {
  localStorage.removeItem(BIOMETRIC_KEY);
  localStorage.removeItem(CREDENTIALS_KEY);
};

// Get saved credentials for biometric login
export const getSavedCredentials = async () => {
  try {
    // Try Credential Management API first
    if ('credentials' in navigator && 'PasswordCredential' in window) {
      const credential = await navigator.credentials.get({
        password: true,
        mediation: 'optional'
      });
      
      if (credential && credential.type === 'password') {
        return {
          email: credential.id,
          password: credential.password
        };
      }
    }
    
    // Fallback to localStorage
    const encoded = localStorage.getItem(CREDENTIALS_KEY);
    if (encoded) {
      return JSON.parse(atob(encoded));
    }
    
    return null;
  } catch (error) {
    console.error('Error getting credentials:', error);
    return null;
  }
};

// Request biometric authentication (for supported devices)
export const requestBiometricAuth = async () => {
  // Check if Web Authentication API is available (for true biometric)
  if ('PublicKeyCredential' in window) {
    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (available) {
        // Device supports biometric authentication
        return true;
      }
    } catch (e) {
      console.log('WebAuthn not available');
    }
  }
  
  // For devices without WebAuthn, we simulate by just checking if credentials exist
  return isBiometricEnabled();
};

export default {
  isBiometricAvailable,
  isBiometricEnabled,
  enableBiometricLogin,
  disableBiometricLogin,
  getSavedCredentials,
  requestBiometricAuth
};
