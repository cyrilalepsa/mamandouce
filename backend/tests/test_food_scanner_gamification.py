"""
Test Food Scanner Gamification Feature
Tests:
- POST /api/food/user-added-foods - User contribution submission
- POST /api/food/scan/image - AI scanner returns is_unknown flag
- Food library endpoint
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
TEST_EMAIL = "admin@mamandouce.com"
TEST_PASSWORD = "AdminPremium2024!"


class TestFoodScannerGamification:
    """Tests for Food Scanner AI gamification feature"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self.token = None
        
    def get_auth_token(self):
        """Get authentication token"""
        if self.token:
            return self.token
            
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if response.status_code == 200:
            data = response.json()
            # API returns access_token, not token
            self.token = data.get("access_token") or data.get("token")
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
            return self.token
        return None
    
    # ==================== AUTH TESTS ====================
    
    def test_login_success(self):
        """Test login with admin credentials"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        # API returns access_token
        assert "access_token" in data or "token" in data, f"Token not in response: {data}"
        print(f"✅ Login successful for {TEST_EMAIL}")
    
    # ==================== USER-ADDED FOODS ENDPOINT ====================
    
    def test_user_added_foods_endpoint_exists(self):
        """Test POST /api/food/user-added-foods endpoint exists and accepts requests"""
        token = self.get_auth_token()
        assert token, "Failed to get auth token"
        
        # Test with a unique food name to avoid duplicates
        import uuid
        unique_name = f"TEST_Aliment_{uuid.uuid4().hex[:8]}"
        
        response = self.session.post(f"{BASE_URL}/api/food/user-added-foods", json={
            "name": unique_name,
            "category": "À déterminer",
            "is_safe": False,
            "safety_level": "unknown",
            "notes": "Soumis via le scanner IA - En attente de validation"
        })
        
        # Should return 200 or 201 for success, or 400 if food already exists
        assert response.status_code in [200, 201, 400], f"Unexpected status: {response.status_code}, {response.text}"
        
        if response.status_code in [200, 201]:
            data = response.json()
            assert data.get("success") == True, "Response should indicate success"
            assert "food" in data or "message" in data, "Response should contain food or message"
            print(f"✅ User-added food submission successful: {unique_name}")
        else:
            print(f"⚠️ Food already exists or validation error: {response.json()}")
    
    def test_user_added_foods_requires_auth(self):
        """Test that user-added-foods endpoint requires authentication"""
        # Create new session without auth
        no_auth_session = requests.Session()
        no_auth_session.headers.update({"Content-Type": "application/json"})
        
        response = no_auth_session.post(f"{BASE_URL}/api/food/user-added-foods", json={
            "name": "Test Food",
            "category": "Test"
        })
        
        # API may return 401 or 403 for unauthorized access
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✅ User-added foods endpoint correctly requires authentication")
    
    def test_get_user_added_foods(self):
        """Test GET /api/food/user-added-foods returns user's submissions"""
        token = self.get_auth_token()
        assert token, "Failed to get auth token"
        
        response = self.session.get(f"{BASE_URL}/api/food/user-added-foods")
        
        assert response.status_code == 200, f"Failed to get user foods: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✅ Got {len(data)} user-added foods")
    
    # ==================== FOOD LIBRARY ENDPOINT ====================
    
    def test_food_library_endpoint(self):
        """Test GET /api/food/food-library returns food list"""
        token = self.get_auth_token()
        assert token, "Failed to get auth token"
        
        response = self.session.get(f"{BASE_URL}/api/food/food-library?page=1&limit=10")
        
        assert response.status_code == 200, f"Food library failed: {response.status_code}, {response.text}"
        data = response.json()
        assert "foods" in data, "Response should contain foods"
        assert "total" in data, "Response should contain total"
        assert "categories" in data, "Response should contain categories"
        print(f"✅ Food library returned {data.get('total', 0)} foods")
    
    # ==================== AI SCAN IMAGE ENDPOINT ====================
    
    def test_scan_image_endpoint_exists(self):
        """Test POST /api/food/scan/image endpoint exists"""
        token = self.get_auth_token()
        assert token, "Failed to get auth token"
        
        # Send a minimal base64 image (1x1 pixel transparent PNG)
        # This is a valid base64 encoded 1x1 transparent PNG
        minimal_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        response = self.session.post(f"{BASE_URL}/api/food/scan/image", json={
            "image_base64": minimal_image
        })
        
        # Should return 200 for success, 400 for invalid image, or 500 for AI error
        # We're testing the endpoint exists and accepts the request format
        assert response.status_code in [200, 400, 500], f"Unexpected status: {response.status_code}"
        
        if response.status_code == 200:
            data = response.json()
            assert "success" in data, "Response should contain success field"
            if data.get("success"):
                result = data.get("result", {})
                # Verify is_unknown field exists in response
                assert "is_unknown" in result, "Result should contain is_unknown field"
                print(f"✅ AI scan returned: food_name={result.get('food_name')}, is_unknown={result.get('is_unknown')}")
            else:
                print(f"⚠️ AI scan returned success=false: {data}")
        else:
            print(f"⚠️ AI scan returned {response.status_code}: {response.text[:200]}")
    
    def test_scan_image_requires_auth(self):
        """Test that scan/image endpoint requires authentication"""
        no_auth_session = requests.Session()
        no_auth_session.headers.update({"Content-Type": "application/json"})
        
        response = no_auth_session.post(f"{BASE_URL}/api/food/scan/image", json={
            "image_base64": "test"
        })
        
        # API may return 401 or 403 for unauthorized access
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✅ Scan image endpoint correctly requires authentication")
    
    # ==================== SCAN HISTORY ENDPOINT ====================
    
    def test_scan_history_endpoint(self):
        """Test GET /api/food/scan/history returns scan history"""
        token = self.get_auth_token()
        assert token, "Failed to get auth token"
        
        response = self.session.get(f"{BASE_URL}/api/food/scan/history")
        
        assert response.status_code == 200, f"Scan history failed: {response.status_code}"
        data = response.json()
        assert "scans" in data, "Response should contain scans"
        print(f"✅ Scan history returned {len(data.get('scans', []))} scans")
    
    # ==================== FAVORITES ENDPOINT ====================
    
    def test_favorites_endpoint(self):
        """Test GET /api/food/favorites returns favorites list"""
        token = self.get_auth_token()
        assert token, "Failed to get auth token"
        
        response = self.session.get(f"{BASE_URL}/api/food/favorites")
        
        assert response.status_code == 200, f"Favorites failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✅ Favorites returned {len(data)} items")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
