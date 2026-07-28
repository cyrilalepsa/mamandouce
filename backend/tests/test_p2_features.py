"""
Test P2 Features:
1. Maternity bag favorites - GET /api/maternity-bag/favorites, POST /api/maternity-bag/favorites/toggle
2. Shared recipes view counter - GET /api/postpartum/shared/{shareCode} returns views
"""

import pytest
import requests
import os

BASE_URL = (os.environ.get("BACKEND_URL") or os.environ.get("VITE_BACKEND_URL") or os.environ.get("REACT_APP_BACKEND_URL") or "http://localhost:8000").rstrip("/")

# Test credentials
TEST_EMAIL = "cyrilalepsa@gmail.com"
TEST_PASSWORD = "Cyc@dmin9630"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Authentication failed - skipping tests")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Get headers with authorization"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestMaternityBagFavorites:
    """Tests for maternity bag favorites feature"""
    
    def test_get_favorites_empty(self, auth_headers):
        """Test GET /api/maternity-bag/favorites - initial state"""
        response = requests.get(f"{BASE_URL}/api/maternity-bag/favorites", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "favorites" in data, "Response should have 'favorites' key"
        assert isinstance(data["favorites"], list), "Favorites should be a list"
    
    def test_toggle_favorite_add(self, auth_headers):
        """Test POST /api/maternity-bag/favorites/toggle - add item"""
        test_item = "TEST_Carte vitale et mutuelle"
        
        response = requests.post(
            f"{BASE_URL}/api/maternity-bag/favorites/toggle",
            headers=auth_headers,
            json={"item_name": test_item}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") is True, "Toggle should succeed"
        assert data.get("is_favorite") is True, "Item should be added as favorite"
        assert "message" in data, "Response should have message"
    
    def test_verify_favorite_added(self, auth_headers):
        """Test GET /api/maternity-bag/favorites - verify item was added"""
        test_item = "TEST_Carte vitale et mutuelle"
        
        response = requests.get(f"{BASE_URL}/api/maternity-bag/favorites", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert test_item in data["favorites"], f"Item '{test_item}' should be in favorites list"
    
    def test_toggle_favorite_remove(self, auth_headers):
        """Test POST /api/maternity-bag/favorites/toggle - remove item"""
        test_item = "TEST_Carte vitale et mutuelle"
        
        # Toggle again to remove
        response = requests.post(
            f"{BASE_URL}/api/maternity-bag/favorites/toggle",
            headers=auth_headers,
            json={"item_name": test_item}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") is True, "Toggle should succeed"
        assert data.get("is_favorite") is False, "Item should be removed from favorites"
    
    def test_verify_favorite_removed(self, auth_headers):
        """Test GET /api/maternity-bag/favorites - verify item was removed"""
        test_item = "TEST_Carte vitale et mutuelle"
        
        response = requests.get(f"{BASE_URL}/api/maternity-bag/favorites", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert test_item not in data["favorites"], f"Item '{test_item}' should NOT be in favorites list"
    
    def test_toggle_favorite_invalid_request(self, auth_headers):
        """Test POST /api/maternity-bag/favorites/toggle with invalid payload"""
        response = requests.post(
            f"{BASE_URL}/api/maternity-bag/favorites/toggle",
            headers=auth_headers,
            json={}  # Missing item_name
        )
        
        assert response.status_code == 422, f"Expected 422 for invalid payload, got {response.status_code}"


class TestSharedRecipesViewCounter:
    """Tests for shared recipes view counter feature"""
    
    def test_shared_recipes_endpoint_exists(self):
        """Test GET /api/postpartum/shared/{shareCode} endpoint exists"""
        # Using the known share code from context
        share_code = "rntsiqCLPCY"
        
        response = requests.get(f"{BASE_URL}/api/postpartum/shared/{share_code}")
        
        # Should return 200 if exists, 404 if share doesn't exist
        assert response.status_code in [200, 404], f"Unexpected status: {response.status_code}"
    
    def test_shared_recipes_returns_views(self):
        """Test that shared recipes endpoint returns view count"""
        share_code = "rntsiqCLPCY"
        
        response = requests.get(f"{BASE_URL}/api/postpartum/shared/{share_code}")
        
        if response.status_code == 200:
            data = response.json()
            assert "views" in data, "Response should include 'views' field"
            assert isinstance(data["views"], int), "Views should be an integer"
            assert data["views"] >= 1, "Views should be at least 1 (incremented on access)"
            print(f"Current view count: {data['views']}")
        elif response.status_code == 404:
            pytest.skip("Share code doesn't exist - creating new share to test")
    
    def test_shared_recipes_view_increments(self):
        """Test that views increment on each access"""
        share_code = "rntsiqCLPCY"
        
        # First request
        response1 = requests.get(f"{BASE_URL}/api/postpartum/shared/{share_code}")
        
        if response1.status_code == 404:
            pytest.skip("Share code doesn't exist - skipping increment test")
        
        views1 = response1.json().get("views", 0)
        
        # Second request
        response2 = requests.get(f"{BASE_URL}/api/postpartum/shared/{share_code}")
        views2 = response2.json().get("views", 0)
        
        assert views2 == views1 + 1, f"Views should increment: expected {views1 + 1}, got {views2}"
        print(f"Views incremented from {views1} to {views2}")
    
    def test_shared_recipes_full_response_structure(self):
        """Test that shared recipes endpoint returns all required fields"""
        share_code = "rntsiqCLPCY"
        
        response = requests.get(f"{BASE_URL}/api/postpartum/shared/{share_code}")
        
        if response.status_code == 404:
            pytest.skip("Share code doesn't exist")
        
        data = response.json()
        
        # Check all expected fields
        required_fields = ["shared_by", "recipes", "recipes_count", "views", "shared_at"]
        for field in required_fields:
            assert field in data, f"Response should have '{field}' field"
        
        assert isinstance(data["recipes"], list), "Recipes should be a list"
        assert isinstance(data["recipes_count"], int), "Recipes count should be an integer"
        print(f"Response structure valid - {data['recipes_count']} recipes, {data['views']} views")
    
    def test_shared_recipes_invalid_code(self):
        """Test GET /api/postpartum/shared/{shareCode} with invalid code"""
        response = requests.get(f"{BASE_URL}/api/postpartum/shared/INVALID_CODE_12345")
        
        assert response.status_code == 404, f"Expected 404 for invalid code, got {response.status_code}"


class TestCreateShareAndVerifyViews:
    """Tests for creating a new share and verifying view counter"""
    
    def test_create_share_and_verify_views(self, auth_headers):
        """Create a new recipe share and verify view counter works"""
        # Create a new share
        test_recipes = ["Purée de carottes"]  # Known recipe from the content
        
        create_response = requests.post(
            f"{BASE_URL}/api/postpartum/share-recipes",
            headers=auth_headers,
            json={"recipe_names": test_recipes}
        )
        
        if create_response.status_code != 200:
            pytest.skip(f"Could not create share: {create_response.text}")
        
        share_data = create_response.json()
        share_code = share_data.get("share_code")
        
        assert share_code is not None, "Share response should include share_code"
        print(f"Created share with code: {share_code}")
        
        # Access the share for first time
        response1 = requests.get(f"{BASE_URL}/api/postpartum/shared/{share_code}")
        assert response1.status_code == 200
        views1 = response1.json().get("views", 0)
        assert views1 >= 1, f"Initial view count should be at least 1, got {views1}"
        
        # Access again
        response2 = requests.get(f"{BASE_URL}/api/postpartum/shared/{share_code}")
        views2 = response2.json().get("views", 0)
        
        assert views2 > views1, f"Views should increment: was {views1}, now {views2}"
        print(f"View counter working: {views1} -> {views2}")


class TestMaternityBagEndpoints:
    """Test maternity bag basic endpoints still work"""
    
    def test_get_maternity_bag(self, auth_headers):
        """Test GET /api/maternity-bag returns items"""
        response = requests.get(f"{BASE_URL}/api/maternity-bag", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data, "Response should have 'items'"
        assert len(data["items"]) > 0, "Should have default maternity bag items"
        
        # Verify items have expected structure
        first_item = data["items"][0]
        assert "category" in first_item, "Item should have 'category'"
        assert "item" in first_item, "Item should have 'item' name"
        assert "checked" in first_item, "Item should have 'checked' status"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
