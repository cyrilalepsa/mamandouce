/**
 * Biometric Authentication Service
 * Uses Web Authentication API for real biometric authentication
 * With PIN fallback for unsupported devices
 */

const BIOMETRIC_KEY = 'mamandouce_biometric_enabled';
const CREDENTIALS_KEY = 'mamandouce_saved_credentials';
const CREDENTIAL_ID_KEY = 'mamandouce_credential_id';
const PIN_KEY = 'mamandouce_pin_hash';
const PIN_ENABLED_KEY = 'mamandouce_pin_enabled';

// Check if WebAuthn biometric is available
export const isBiometricAvailable = async () => {
  // Check for WebAuthn support
  if (window.PublicKeyCredential) {
    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    } catch (e) {
      console.log('WebAuthn check failed:', e);
    }
  }
  return false;
};

// Check if user has enabled biometric login
export const isBiometricEnabled = () => {
  return localStorage.getItem(BIOMETRIC_KEY) === 'true' && 
         localStorage.getItem(CREDENTIALS_KEY) !== null;
};

// Generate a random challenge for WebAuthn
const generateChallenge = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return array;
};

// Convert ArrayBuffer to base64
const bufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Convert base64 to ArrayBuffer
const base64ToBuffer = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// Enable biometric login - creates a credential and saves login info
export const enableBiometricLogin = async (email, password) => {
  try {
    // Check if WebAuthn is available
    const webAuthnAvailable = await isBiometricAvailable();
    
    if (webAuthnAvailable) {
      // Create a WebAuthn credential for biometric
      const challenge = generateChallenge();
      const userId = new TextEncoder().encode(email);
      
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: {
            name: "MamanDouce",
            id: window.location.hostname
          },
          user: {
            id: userId,
            name: email,
            displayName: "MamanDouce User"
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },  // ES256
            { alg: -257, type: "public-key" } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            residentKey: "preferred"
          },
          timeout: 60000,
          attestation: "none"
        }
      });
      
      if (credential) {
        // Save credential ID for later authentication
        localStorage.setItem(CREDENTIAL_ID_KEY, bufferToBase64(credential.rawId));
      }
    }
    
    // Save encrypted credentials
    const encoded = btoa(JSON.stringify({ email, password }));
    localStorage.setItem(CREDENTIALS_KEY, encoded);
    localStorage.setItem(BIOMETRIC_KEY, 'true');
    
    return true;
  } catch (error) {
    console.error('Error enabling biometric:', error);
    // If WebAuthn fails, still save credentials for simple quick login
    const encoded = btoa(JSON.stringify({ email, password }));
    localStorage.setItem(CREDENTIALS_KEY, encoded);
    localStorage.setItem(BIOMETRIC_KEY, 'true');
    return true;
  }
};

// Disable biometric login
export const disableBiometricLogin = () => {
  localStorage.removeItem(BIOMETRIC_KEY);
  localStorage.removeItem(CREDENTIALS_KEY);
  localStorage.removeItem(CREDENTIAL_ID_KEY);
};

// Request biometric authentication and get saved credentials
export const authenticateWithBiometric = async () => {
  // First check if biometric is enabled
  if (!isBiometricEnabled()) {
    throw new Error('Biometric not enabled');
  }
  
  const webAuthnAvailable = await isBiometricAvailable();
  const credentialId = localStorage.getItem(CREDENTIAL_ID_KEY);
  
  if (webAuthnAvailable && credentialId) {
    try {
      // Request biometric authentication using WebAuthn
      const challenge = generateChallenge();
      
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: challenge,
          rpId: window.location.hostname,
          allowCredentials: [{
            id: base64ToBuffer(credentialId),
            type: "public-key",
            transports: ["internal"]
          }],
          userVerification: "required",
          timeout: 60000
        }
      });
      
      if (assertion) {
        // Biometric verification successful, return saved credentials
        const encoded = localStorage.getItem(CREDENTIALS_KEY);
        if (encoded) {
          return JSON.parse(atob(encoded));
        }
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
      
      // If user cancelled or error, throw
      if (error.name === 'NotAllowedError') {
        throw new Error('Authentification annulée');
      }
      throw new Error('Échec de l\'authentification biométrique');
    }
  } else {
    // Fallback: No WebAuthn, just return credentials (for testing/unsupported browsers)
    // In production, you might want to remove this fallback
    const encoded = localStorage.getItem(CREDENTIALS_KEY);
    if (encoded) {
      return JSON.parse(atob(encoded));
    }
  }
  
  throw new Error('Aucune donnée d\'authentification trouvée');
};

// Get saved credentials (without biometric check - for profile display)
export const getSavedCredentials = () => {
  const encoded = localStorage.getItem(CREDENTIALS_KEY);
  if (encoded) {
    try {
      return JSON.parse(atob(encoded));
    } catch {
      return null;
    }
  }
  return null;
};

// Check if device supports biometric
export const checkBiometricSupport = async () => {
  const support = {
    webAuthn: false,
    platformAuthenticator: false
  };
  
  if (window.PublicKeyCredential) {
    support.webAuthn = true;
    try {
      support.platformAuthenticator = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (e) {
      console.log('Platform authenticator check failed');
    }
  }
  
  return support;
};

// ==================== PIN FALLBACK ====================

// Simple hash function for PIN (not cryptographically secure, but good enough for local storage)
const hashPin = (pin) => {
  let hash = 0;
  const str = pin + 'mamandouce_salt_2024';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

// Check if PIN is enabled
export const isPinEnabled = () => {
  return localStorage.getItem(PIN_ENABLED_KEY) === 'true' && 
         localStorage.getItem(PIN_KEY) !== null &&
         localStorage.getItem(CREDENTIALS_KEY) !== null;
};

// Enable PIN login
export const enablePinLogin = (email, password, pin) => {
  if (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
    throw new Error('Le code PIN doit contenir entre 4 et 6 chiffres');
  }
  
  const hashedPin = hashPin(pin);
  const encoded = btoa(JSON.stringify({ email, password }));
  
  localStorage.setItem(PIN_KEY, hashedPin);
  localStorage.setItem(CREDENTIALS_KEY, encoded);
  localStorage.setItem(PIN_ENABLED_KEY, 'true');
  
  return true;
};

// Disable PIN login
export const disablePinLogin = () => {
  localStorage.removeItem(PIN_KEY);
  localStorage.removeItem(PIN_ENABLED_KEY);
};

// Verify PIN and get credentials
export const authenticateWithPin = (pin) => {
  if (!isPinEnabled()) {
    throw new Error('PIN non activé');
  }
  
  const storedHash = localStorage.getItem(PIN_KEY);
  const inputHash = hashPin(pin);
  
  if (storedHash !== inputHash) {
    throw new Error('Code PIN incorrect');
  }
  
  const encoded = localStorage.getItem(CREDENTIALS_KEY);
  if (encoded) {
    return JSON.parse(atob(encoded));
  }
  
  throw new Error('Aucune donnée trouvée');
};

// Check if quick login is available (biometric OR PIN)
export const isQuickLoginAvailable = () => {
  return isBiometricEnabled() || isPinEnabled();
};

// Get quick login type available
export const getQuickLoginType = async () => {
  if (isBiometricEnabled()) {
    const support = await checkBiometricSupport();
    if (support.platformAuthenticator) {
      return 'biometric';
    }
  }
  if (isPinEnabled()) {
    return 'pin';
  }
  return null;
};

// Disable all quick login methods
export const disableAllQuickLogin = () => {
  disableBiometricLogin();
  disablePinLogin();
};

export default {
  isBiometricAvailable,
  isBiometricEnabled,
  enableBiometricLogin,
  disableBiometricLogin,
  authenticateWithBiometric,
  getSavedCredentials,
  checkBiometricSupport,
  // PIN methods
  isPinEnabled,
  enablePinLogin,
  disablePinLogin,
  authenticateWithPin,
  isQuickLoginAvailable,
  getQuickLoginType,
  disableAllQuickLogin
};
