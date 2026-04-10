"""
MamanDouce API Tests - Comprehensive backend testing
Tests authentication, subscription, postpartum, and other key endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://tirelire-staging.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "admin@mamandouce.com"
ADMIN_PASSWORD = "AdminPremium2024!"

class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print("✓ Health endpoint working")


class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test successful login with admin credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data.get("token_type") == "bearer"
        print("✓ Login successful")
        return data["access_token"]
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code in [401, 400, 404]
        print("✓ Invalid login rejected correctly")
    
    def test_get_me_authenticated(self):
        """Test getting user profile with valid token"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # Get user profile
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("email") == ADMIN_EMAIL
        print(f"✓ User profile retrieved: {data.get('email')}")
    
    def test_get_me_unauthenticated(self):
        """Test getting user profile without token"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code in [401, 403, 422]
        print("✓ Unauthenticated request rejected")


class TestSubscription:
    """Subscription status endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_subscription_status(self, auth_token):
        """Test getting subscription status"""
        response = requests.get(f"{BASE_URL}/api/subscription-status", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert "subscription_status" in data
        print(f"✓ Subscription status: {data.get('subscription_status')}")
    
    def test_get_full_subscription_status(self, auth_token):
        """Test getting full subscription status"""
        response = requests.get(f"{BASE_URL}/api/subscription/full-status", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Full subscription status retrieved")


class TestPostpartum:
    """Postpartum endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_postpartum_content(self, auth_token):
        """Test getting postpartum content"""
        response = requests.get(f"{BASE_URL}/api/postpartum/content", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        # Check for expected content sections
        print(f"✓ Postpartum content retrieved")
    
    def test_get_postpartum_status(self, auth_token):
        """Test getting postpartum status"""
        response = requests.get(f"{BASE_URL}/api/postpartum/status", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Postpartum status: unlocked={data.get('postpartum_unlocked')}")


class TestFoodLibrary:
    """Food library endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_food_library(self, auth_token):
        """Test getting food library"""
        response = requests.get(f"{BASE_URL}/api/food-library?page=1&limit=10", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert "foods" in data
        assert "total" in data
        print(f"✓ Food library: {data.get('total')} foods")
    
    def test_get_favorites(self, auth_token):
        """Test getting food favorites"""
        response = requests.get(f"{BASE_URL}/api/favorites", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        print(f"✓ Favorites endpoint working")


class TestMedical:
    """Medical appointments endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_medical_appointments(self, auth_token):
        """Test getting medical appointments"""
        response = requests.get(f"{BASE_URL}/api/medical/appointments", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        print(f"✓ Medical appointments endpoint working")
    
    def test_get_upcoming_appointments(self, auth_token):
        """Test getting upcoming appointments"""
        response = requests.get(f"{BASE_URL}/api/medical/upcoming", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        print(f"✓ Upcoming appointments endpoint working")


class TestPregnancy:
    """Pregnancy profile endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_pregnancy_profile(self, auth_token):
        """Test getting pregnancy profile"""
        response = requests.get(f"{BASE_URL}/api/pregnancy/profile", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        # May return 404 if no profile exists
        assert response.status_code in [200, 404]
        print(f"✓ Pregnancy profile endpoint working (status: {response.status_code})")


class TestBabyNames:
    """Baby names favorites endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_babynames_favorites(self, auth_token):
        """Test getting baby names favorites"""
        response = requests.get(f"{BASE_URL}/api/babynames-favorites", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        print(f"✓ Baby names favorites endpoint working")


class TestNotifications:
    """Notifications endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_notifications(self, auth_token):
        """Test getting notifications"""
        response = requests.get(f"{BASE_URL}/api/notifications", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        print(f"✓ Notifications endpoint working")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
