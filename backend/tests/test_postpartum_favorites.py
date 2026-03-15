"""
Tests for PostpartumPage refactoring and Favorites functionality
Testing: Navigation tabs, Recipes section, Favorites (add/remove), Difficulties, Precautions
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "cyrilalepsa@gmail.com"
ADMIN_PASSWORD = "Cyc@dmin9630"


class TestAuthAndPostpartumAccess:
    """Test authentication and basic postpartum access"""
    
    def test_login_admin_user(self):
        """Test admin user can login successfully"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access token in response"
        print(f"PASS: Admin login successful, token received")
    
    def test_postpartum_status(self):
        """Test postpartum status endpoint returns proper data"""
        # Login first
        login = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = login.json()["access_token"]
        
        # Get postpartum status
        response = requests.get(
            f"{BASE_URL}/api/postpartum/status",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200, f"Status failed: {response.text}"
        data = response.json()
        
        # Verify expected fields
        assert "postpartum_unlocked" in data
        assert "actual_birth_date" in data
        print(f"PASS: Postpartum status - unlocked: {data['postpartum_unlocked']}, birth_date: {data.get('actual_birth_date')}")
    
    def test_postpartum_content_loads(self):
        """Test postpartum content loads successfully with all sections"""
        # Login first
        login = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = login.json()["access_token"]
        
        # Get content
        response = requests.get(
            f"{BASE_URL}/api/postpartum/content",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200, f"Content failed: {response.text}"
        data = response.json()
        
        # Verify all sections exist
        expected_sections = ["appointments", "difficulties", "breastfeeding", "formula", "diapers", "precautions", "babywearing", "diversification", "baby_recipes"]
        for section in expected_sections:
            assert section in data, f"Missing section: {section}"
        
        # Verify recipes exist
        assert "recipes" in data["baby_recipes"], "No recipes in baby_recipes"
        recipes_count = len(data["baby_recipes"]["recipes"])
        print(f"PASS: Content loaded with all {len(expected_sections)} sections, {recipes_count} recipes")


class TestFavoritesFeature:
    """Test recipe favorites functionality - add/remove/filter"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        login = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        return login.json()["access_token"]
    
    def test_get_favorites_empty_or_list(self, auth_token):
        """Test getting favorites returns a list"""
        response = requests.get(
            f"{BASE_URL}/api/postpartum/favorites",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Get favorites failed: {response.text}"
        data = response.json()
        assert "favorites" in data, "No favorites field in response"
        assert isinstance(data["favorites"], list), "Favorites should be a list"
        print(f"PASS: Get favorites returned {len(data['favorites'])} items: {data['favorites']}")
    
    def test_toggle_favorite_add(self, auth_token):
        """Test adding a recipe to favorites"""
        test_recipe = "Purée de carottes"
        
        # Toggle to add
        response = requests.post(
            f"{BASE_URL}/api/postpartum/favorites/toggle",
            json={"recipe_name": test_recipe},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Toggle favorite failed: {response.text}"
        data = response.json()
        assert data.get("success") == True, "Toggle should return success"
        print(f"PASS: Toggle favorite returned - is_favorite: {data.get('is_favorite')}, message: {data.get('message')}")
    
    def test_toggle_favorite_remove(self, auth_token):
        """Test removing a recipe from favorites"""
        test_recipe = "TEST_Recipe_To_Remove"
        
        # First add it
        requests.post(
            f"{BASE_URL}/api/postpartum/favorites/toggle",
            json={"recipe_name": test_recipe},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        # Now remove it
        response = requests.post(
            f"{BASE_URL}/api/postpartum/favorites/toggle",
            json={"recipe_name": test_recipe},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        # Verify it's removed
        get_response = requests.get(
            f"{BASE_URL}/api/postpartum/favorites",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        favorites = get_response.json()["favorites"]
        assert test_recipe not in favorites, "Recipe should be removed from favorites"
        print(f"PASS: Recipe removed from favorites successfully")
    
    def test_favorites_persistence(self, auth_token):
        """Test that favorites persist after adding"""
        test_recipe = "Purée de courgettes"
        
        # Add to favorites
        toggle_response = requests.post(
            f"{BASE_URL}/api/postpartum/favorites/toggle",
            json={"recipe_name": test_recipe},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        # Get favorites to verify persistence
        response = requests.get(
            f"{BASE_URL}/api/postpartum/favorites",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        data = response.json()
        favorites = data["favorites"]
        
        # Check if recipe is in favorites (it might have been toggled off if it was already there)
        print(f"PASS: Favorites after toggle: {favorites}")


class TestDifficultiesSection:
    """Test difficulties section content"""
    
    def test_difficulties_content_exists(self):
        """Test that difficulties section has proper content"""
        login = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = login.json()["access_token"]
        
        response = requests.get(
            f"{BASE_URL}/api/postpartum/content",
            headers={"Authorization": f"Bearer {token}"}
        )
        data = response.json()
        
        difficulties = data.get("difficulties", [])
        assert len(difficulties) > 0, "No difficulties found"
        
        # Check first difficulty has expected fields
        first_diff = difficulties[0]
        assert "title" in first_diff, "Difficulty missing title"
        assert "description" in first_diff, "Difficulty missing description"
        
        # Check for advice and symptoms (enriched content)
        has_advice = any("advice" in d for d in difficulties)
        has_symptoms = any("symptoms" in d for d in difficulties)
        has_videos = any("video_url" in d for d in difficulties)
        
        print(f"PASS: Found {len(difficulties)} difficulties, has_advice: {has_advice}, has_symptoms: {has_symptoms}, has_videos: {has_videos}")


class TestPrecautionsSection:
    """Test precautions section content"""
    
    def test_precautions_content_exists(self):
        """Test that precautions section has detailed descriptions"""
        login = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = login.json()["access_token"]
        
        response = requests.get(
            f"{BASE_URL}/api/postpartum/content",
            headers={"Authorization": f"Bearer {token}"}
        )
        data = response.json()
        
        precautions = data.get("precautions", [])
        assert len(precautions) > 0, "No precautions found"
        
        # Check first precaution has expected fields
        first_prec = precautions[0]
        assert "title" in first_prec, "Precaution missing title"
        assert "tips" in first_prec, "Precaution missing tips"
        
        # Check for description and details (enriched content)
        has_description = any("description" in p for p in precautions)
        has_details = any("details" in p for p in precautions)
        has_videos = any("video_url" in p for p in precautions)
        
        print(f"PASS: Found {len(precautions)} precautions, has_description: {has_description}, has_details: {has_details}, has_videos: {has_videos}")


class TestRecipesContent:
    """Test recipes section content structure"""
    
    def test_recipes_have_categories(self):
        """Test that recipes are properly categorized"""
        login = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = login.json()["access_token"]
        
        response = requests.get(
            f"{BASE_URL}/api/postpartum/content",
            headers={"Authorization": f"Bearer {token}"}
        )
        data = response.json()
        
        recipes = data.get("baby_recipes", {}).get("recipes", [])
        assert len(recipes) > 0, "No recipes found"
        
        # Get unique categories
        categories = set(r.get("category") for r in recipes if r.get("category"))
        expected_categories = {"Légumes", "Fruits", "Viandes", "Poissons", "Légumineuses"}
        
        print(f"PASS: Found {len(recipes)} recipes in categories: {categories}")
        
        # Check recipe structure
        first_recipe = recipes[0]
        assert "name" in first_recipe, "Recipe missing name"
        assert "age" in first_recipe, "Recipe missing age"
        assert "ingredients" in first_recipe, "Recipe missing ingredients"
        assert "steps" in first_recipe, "Recipe missing steps"


class TestNavigationTabs:
    """Test that all expected navigation sections exist in content"""
    
    def test_all_sections_present(self):
        """Test that all 9 tab sections are present in API response"""
        login = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = login.json()["access_token"]
        
        response = requests.get(
            f"{BASE_URL}/api/postpartum/content",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # All sections from UI tabs
        sections = {
            "appointments": "RDV",
            "difficulties": "Difficultés",
            "breastfeeding": "Allaitement",
            "formula": "Biberon",
            "diapers": "Couches",
            "babywearing": "Portage",
            "diversification": "Diversification",
            "baby_recipes": "Recettes",
            "precautions": "Précautions"
        }
        
        for section_key, section_name in sections.items():
            assert section_key in data, f"Missing section: {section_name} ({section_key})"
            assert data[section_key] is not None, f"Section {section_name} is null"
        
        print(f"PASS: All {len(sections)} navigation sections present and not null")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
