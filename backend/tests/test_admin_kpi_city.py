"""
Test Admin KPI Stats, City Stats, and Messages endpoints
Tests for MamanDouce Dashboard Admin features:
- GET /api/admin/kpi-stats - KPI statistics
- GET /api/admin/city-stats - City statistics for map
- DELETE /api/admin/messages - Clear all messages
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@mamandouce.com"
ADMIN_PASSWORD = "AdminPremium2024!"


class TestAdminAuth:
    """Test admin authentication"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for admin user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        return data["access_token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers with token"""
        return {"Authorization": f"Bearer {auth_token}"}


class TestKPIStats(TestAdminAuth):
    """Test GET /api/admin/kpi-stats endpoint"""
    
    def test_kpi_stats_returns_200(self, auth_headers):
        """Test that KPI stats endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/admin/kpi-stats", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    def test_kpi_stats_has_required_fields(self, auth_headers):
        """Test that KPI stats response has all required fields"""
        response = requests.get(f"{BASE_URL}/api/admin/kpi-stats", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        
        # Check required fields
        assert "total_users" in data, "Missing total_users field"
        assert "premium_users" in data, "Missing premium_users field"
        assert "conversion_rate" in data, "Missing conversion_rate field"
        assert "gold_godmothers" in data, "Missing gold_godmothers field"
        
        # Check data types
        assert isinstance(data["total_users"], int), "total_users should be int"
        assert isinstance(data["premium_users"], int), "premium_users should be int"
        assert isinstance(data["conversion_rate"], (int, float)), "conversion_rate should be numeric"
        assert isinstance(data["gold_godmothers"], int), "gold_godmothers should be int"
    
    def test_kpi_stats_values_are_valid(self, auth_headers):
        """Test that KPI stats values are valid (non-negative)"""
        response = requests.get(f"{BASE_URL}/api/admin/kpi-stats", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        
        assert data["total_users"] >= 0, "total_users should be non-negative"
        assert data["premium_users"] >= 0, "premium_users should be non-negative"
        assert data["conversion_rate"] >= 0, "conversion_rate should be non-negative"
        assert data["conversion_rate"] <= 100, "conversion_rate should be <= 100"
        assert data["gold_godmothers"] >= 0, "gold_godmothers should be non-negative"


class TestCityStats(TestAdminAuth):
    """Test GET /api/admin/city-stats endpoint"""
    
    def test_city_stats_returns_200(self, auth_headers):
        """Test that city stats endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/admin/city-stats", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    def test_city_stats_has_required_fields(self, auth_headers):
        """Test that city stats response has all required fields"""
        response = requests.get(f"{BASE_URL}/api/admin/city-stats", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        
        # Check required fields
        assert "cities" in data, "Missing cities field"
        assert "total_cities" in data, "Missing total_cities field"
        assert "total_users_with_city" in data, "Missing total_users_with_city field"
        
        # Check data types
        assert isinstance(data["cities"], list), "cities should be a list"
        assert isinstance(data["total_cities"], int), "total_cities should be int"
        assert isinstance(data["total_users_with_city"], int), "total_users_with_city should be int"
    
    def test_city_stats_cities_structure(self, auth_headers):
        """Test that each city in the list has correct structure"""
        response = requests.get(f"{BASE_URL}/api/admin/city-stats", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        
        # If there are cities, check their structure
        if len(data["cities"]) > 0:
            city = data["cities"][0]
            assert "city" in city, "City object missing 'city' field"
            assert "count" in city, "City object missing 'count' field"
            assert isinstance(city["count"], int), "City count should be int"
            assert city["count"] > 0, "City count should be positive"


class TestChartStats(TestAdminAuth):
    """Test GET /api/admin/chart-stats endpoint"""
    
    def test_chart_stats_returns_200(self, auth_headers):
        """Test that chart stats endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/admin/chart-stats", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    def test_chart_stats_has_registrations_30d(self, auth_headers):
        """Test that chart stats has registrations_30d field"""
        response = requests.get(f"{BASE_URL}/api/admin/chart-stats", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        
        assert "registrations_30d" in data, "Missing registrations_30d field"
        assert isinstance(data["registrations_30d"], list), "registrations_30d should be a list"
        
        # Should have 30 days of data
        assert len(data["registrations_30d"]) == 30, f"Expected 30 days, got {len(data['registrations_30d'])}"
        
        # Check structure of each day
        if len(data["registrations_30d"]) > 0:
            day = data["registrations_30d"][0]
            assert "date" in day, "Day object missing 'date' field"
            assert "count" in day, "Day object missing 'count' field"


class TestDeleteAllMessages(TestAdminAuth):
    """Test DELETE /api/admin/messages endpoint"""
    
    def test_delete_all_messages_returns_200(self, auth_headers):
        """Test that delete all messages endpoint returns 200"""
        response = requests.delete(f"{BASE_URL}/api/admin/messages", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    def test_delete_all_messages_response_structure(self, auth_headers):
        """Test that delete all messages response has correct structure"""
        response = requests.delete(f"{BASE_URL}/api/admin/messages", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        
        assert "success" in data, "Missing success field"
        assert data["success"] == True, "success should be True"
        assert "deleted_count" in data, "Missing deleted_count field"
        assert isinstance(data["deleted_count"], int), "deleted_count should be int"
        assert data["deleted_count"] >= 0, "deleted_count should be non-negative"


class TestUnauthorizedAccess:
    """Test that endpoints require authentication"""
    
    def test_kpi_stats_requires_auth(self):
        """Test that KPI stats requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/kpi-stats")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_city_stats_requires_auth(self):
        """Test that city stats requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/city-stats")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_delete_messages_requires_auth(self):
        """Test that delete messages requires authentication"""
        response = requests.delete(f"{BASE_URL}/api/admin/messages")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
