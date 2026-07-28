"""
Test User Layout API - /api/user/layout
Tests for GET, PUT, DELETE endpoints for user layout management
"""
import pytest
import requests
import os

BASE_URL = (os.environ.get("BACKEND_URL") or os.environ.get("VITE_BACKEND_URL") or os.environ.get("REACT_APP_BACKEND_URL") or "http://localhost:8000").rstrip("/")

# Test credentials from review request
TEST_EMAIL = "newtest@test.com"
TEST_PASSWORD = "test123456"


class TestUserLayoutAPI:
    """User Layout API tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if login_response.status_code == 200:
            token = login_response.json().get("access_token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.authenticated = True
        else:
            self.authenticated = False
            print(f"Login failed: {login_response.status_code} - {login_response.text}")
    
    def test_get_layout_authenticated(self):
        """Test GET /api/user/layout - should return layout or null"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.get(f"{BASE_URL}/api/user/layout")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "layout" in data, "Response should contain 'layout' key"
        print(f"GET /api/user/layout: layout = {data['layout']}")
    
    def test_put_layout_save(self):
        """Test PUT /api/user/layout - save a new layout"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        # Create a test layout
        test_layout = {
            "layout": {
                "pages": [
                    {
                        "id": "socle",
                        "name": "Page Socle",
                        "isDefault": True,
                        "theme": None,
                        "items": []
                    },
                    {
                        "id": "test-page-1",
                        "name": "Ma Page Test",
                        "isDefault": False,
                        "theme": None,
                        "items": [
                            {"id": "preconception", "type": "section", "category": None, "expanded": False, "size": None}
                        ]
                    }
                ],
                "currentPageIndex": 0,
                "defaultPageId": "socle",
                "version": 1
            }
        }
        
        response = self.session.put(f"{BASE_URL}/api/user/layout", json=test_layout)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Response should indicate success"
        print(f"PUT /api/user/layout: {data}")
    
    def test_get_layout_after_save(self):
        """Test GET /api/user/layout - verify saved layout is returned"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        # First save a layout
        test_layout = {
            "layout": {
                "pages": [
                    {
                        "id": "socle",
                        "name": "Page Socle",
                        "isDefault": True,
                        "theme": None,
                        "items": []
                    }
                ],
                "currentPageIndex": 0,
                "defaultPageId": "socle",
                "version": 1
            }
        }
        
        save_response = self.session.put(f"{BASE_URL}/api/user/layout", json=test_layout)
        assert save_response.status_code == 200
        
        # Then get it back
        get_response = self.session.get(f"{BASE_URL}/api/user/layout")
        assert get_response.status_code == 200
        
        data = get_response.json()
        assert data.get("layout") is not None, "Layout should not be null after save"
        assert "pages" in data["layout"], "Layout should contain pages"
        print(f"GET after PUT: {data['layout']}")
    
    def test_delete_layout(self):
        """Test DELETE /api/user/layout - reset layout"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.delete(f"{BASE_URL}/api/user/layout")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Response should indicate success"
        print(f"DELETE /api/user/layout: {data}")
    
    def test_get_layout_after_delete(self):
        """Test GET /api/user/layout - should return null after delete"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        # First delete
        self.session.delete(f"{BASE_URL}/api/user/layout")
        
        # Then get
        response = self.session.get(f"{BASE_URL}/api/user/layout")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("layout") is None, "Layout should be null after delete"
        print(f"GET after DELETE: layout = {data['layout']}")
    
    def test_get_layout_unauthenticated(self):
        """Test GET /api/user/layout without auth - should fail"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        
        response = session.get(f"{BASE_URL}/api/user/layout")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"Unauthenticated GET: {response.status_code}")


class TestHealthCheck:
    """Basic health check"""
    
    def test_health_endpoint(self):
        """Test /api/health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print(f"Health check: {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
