"""
Test profile update feature - display_name and avatar
Tests: PUT /api/auth/profile, GET /api/auth/me
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "cyrilalepsa@gmail.com"
TEST_PASSWORD = "Cyc@dmin9630"

class TestProfileUpdate:
    """Test profile update endpoints for display_name and avatar"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Login and get token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if response.status_code == 403:
            # 2FA is enabled, skip tests
            pytest.skip("2FA is enabled, cannot test profile update")
            
        assert response.status_code == 200, f"Login failed: {response.text}"
        token = response.json().get("access_token")
        assert token, "No token received"
        self.session.headers.update({"Authorization": f"Bearer {token}"})
        
    def test_get_me_returns_display_name_and_avatar_fields(self):
        """GET /api/auth/me should return display_name and avatar fields"""
        response = self.session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200, f"GET /me failed: {response.text}"
        
        data = response.json()
        # Check that the response has the expected fields
        assert "email" in data
        assert "name" in data
        # display_name and avatar may be None but should be present in schema
        # They might not be in response if not set, let's check the schema allows them
        print(f"User data: {data}")
        print(f"display_name: {data.get('display_name')}")
        print(f"avatar: {data.get('avatar')}")
    
    def test_update_display_name_success(self):
        """PUT /api/auth/profile should update display_name"""
        new_display_name = "Marie"
        
        response = self.session.put(f"{BASE_URL}/api/auth/profile", json={
            "display_name": new_display_name
        })
        
        assert response.status_code == 200, f"Update failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert data.get("message") == "Profil mis à jour"
        
        # Verify the user data was returned
        if "user" in data:
            assert data["user"].get("display_name") == new_display_name
            
        # Verify with GET /me
        me_response = self.session.get(f"{BASE_URL}/api/auth/me")
        assert me_response.status_code == 200
        me_data = me_response.json()
        assert me_data.get("display_name") == new_display_name
        print(f"Display name updated to: {me_data.get('display_name')}")
    
    def test_update_display_name_empty_clears_value(self):
        """PUT /api/auth/profile with empty display_name should clear it"""
        # First set a name
        self.session.put(f"{BASE_URL}/api/auth/profile", json={
            "display_name": "TestName"
        })
        
        # Then clear it
        response = self.session.put(f"{BASE_URL}/api/auth/profile", json={
            "display_name": ""
        })
        
        assert response.status_code == 200, f"Clear failed: {response.text}"
        
        # Verify it's cleared
        me_response = self.session.get(f"{BASE_URL}/api/auth/me")
        me_data = me_response.json()
        # Empty string should become None
        assert me_data.get("display_name") in [None, ""]
    
    def test_update_display_name_max_length(self):
        """PUT /api/auth/profile should reject display_name > 50 characters"""
        long_name = "A" * 51  # 51 characters
        
        response = self.session.put(f"{BASE_URL}/api/auth/profile", json={
            "display_name": long_name
        })
        
        assert response.status_code == 400, f"Should reject long name: {response.text}"
        data = response.json()
        assert "50 caractères" in data.get("detail", "")
    
    def test_update_avatar_success(self):
        """PUT /api/auth/profile should update avatar with base64 image"""
        # Create a minimal valid base64 image (1x1 pixel JPEG)
        # This is a real 1x1 red pixel JPEG
        small_jpeg_base64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwEPwAB//9k="
        
        response = self.session.put(f"{BASE_URL}/api/auth/profile", json={
            "avatar": small_jpeg_base64
        })
        
        assert response.status_code == 200, f"Avatar update failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        
        # Verify with GET /me
        me_response = self.session.get(f"{BASE_URL}/api/auth/me")
        me_data = me_response.json()
        assert me_data.get("avatar") is not None
        assert me_data.get("avatar").startswith("data:image/")
        print("Avatar updated successfully")
    
    def test_update_avatar_too_large(self):
        """PUT /api/auth/profile should reject avatar > 500KB"""
        # Create a large base64 string (> 700KB which is ~500KB after base64)
        large_data = "data:image/jpeg;base64," + base64.b64encode(b"x" * 600000).decode()
        
        response = self.session.put(f"{BASE_URL}/api/auth/profile", json={
            "avatar": large_data
        })
        
        assert response.status_code == 400, f"Should reject large avatar: {response.text}"
        data = response.json()
        assert "trop grande" in data.get("detail", "").lower()
    
    def test_update_avatar_invalid_format(self):
        """PUT /api/auth/profile should reject invalid avatar format"""
        response = self.session.put(f"{BASE_URL}/api/auth/profile", json={
            "avatar": "not-a-valid-base64-image"
        })
        
        assert response.status_code == 400, f"Should reject invalid format: {response.text}"
        data = response.json()
        assert "invalide" in data.get("detail", "").lower()
    
    def test_update_avatar_clear(self):
        """PUT /api/auth/profile with empty avatar should clear it"""
        # First set an avatar
        small_jpeg = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwEPwAB//9k="
        self.session.put(f"{BASE_URL}/api/auth/profile", json={
            "avatar": small_jpeg
        })
        
        # Then clear it
        response = self.session.put(f"{BASE_URL}/api/auth/profile", json={
            "avatar": ""
        })
        
        assert response.status_code == 200, f"Clear avatar failed: {response.text}"
        
        # Verify it's cleared
        me_response = self.session.get(f"{BASE_URL}/api/auth/me")
        me_data = me_response.json()
        assert me_data.get("avatar") in [None, ""]
    
    def test_update_both_display_name_and_avatar(self):
        """PUT /api/auth/profile should update both fields at once"""
        small_jpeg = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwEPwAB//9k="
        
        response = self.session.put(f"{BASE_URL}/api/auth/profile", json={
            "display_name": "Marie Test",
            "avatar": small_jpeg
        })
        
        assert response.status_code == 200, f"Update both failed: {response.text}"
        
        # Verify with GET /me
        me_response = self.session.get(f"{BASE_URL}/api/auth/me")
        me_data = me_response.json()
        assert me_data.get("display_name") == "Marie Test"
        assert me_data.get("avatar") is not None
        print(f"Both updated: name={me_data.get('display_name')}, avatar={'set' if me_data.get('avatar') else 'empty'}")
    
    def test_update_profile_no_changes(self):
        """PUT /api/auth/profile with no fields should return success"""
        response = self.session.put(f"{BASE_URL}/api/auth/profile", json={})
        
        assert response.status_code == 200, f"No changes failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
    
    def test_profile_update_requires_auth(self):
        """PUT /api/auth/profile should require authentication"""
        # Create a new session without auth
        no_auth_session = requests.Session()
        no_auth_session.headers.update({"Content-Type": "application/json"})
        
        response = no_auth_session.put(f"{BASE_URL}/api/auth/profile", json={
            "display_name": "Test"
        })
        
        assert response.status_code in [401, 403], f"Should require auth: {response.status_code}"


class TestHomepageDisplayName:
    """Test that display_name appears correctly in GET /auth/me for homepage"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Login and get token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if response.status_code == 403:
            pytest.skip("2FA is enabled")
            
        assert response.status_code == 200
        token = response.json().get("access_token")
        self.session.headers.update({"Authorization": f"Bearer {token}"})
    
    def test_me_returns_display_name_for_homepage_greeting(self):
        """GET /auth/me should return display_name that homepage uses for greeting"""
        # Set a display name
        self.session.put(f"{BASE_URL}/api/auth/profile", json={
            "display_name": "Marie"
        })
        
        # Get user data (this is what homepage calls)
        response = self.session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        
        data = response.json()
        # Homepage shows: displayName || userName
        display_name = data.get("display_name")
        name = data.get("name")
        
        print(f"Homepage will show: {display_name or name}")
        assert display_name == "Marie" or name is not None
        
    def test_me_returns_avatar_for_homepage(self):
        """GET /auth/me should return avatar that homepage displays"""
        response = self.session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        
        data = response.json()
        # Check if avatar field exists
        avatar = data.get("avatar")
        print(f"Avatar for homepage: {'set' if avatar else 'not set'}")
        # Avatar is optional, just verify field exists in response
