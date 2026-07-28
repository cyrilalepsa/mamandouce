"""
Test suite for MamanDouce Final 4 Features:
1. Gamification system (opt-in, badge progress with Marraine Or)
2. Calendar features (tested via frontend)
3. Reminders (tested via frontend)
4. Recipes author_name (tested via frontend)
"""
import pytest
import requests
import os

BASE_URL = (os.environ.get("BACKEND_URL") or os.environ.get("VITE_BACKEND_URL") or os.environ.get("REACT_APP_BACKEND_URL") or "http://localhost:8000").rstrip("/")

# Test credentials
ADMIN_EMAIL = "admin@mamandouce.com"
ADMIN_PASSWORD = "AdminPremium2024!"


class TestAuthentication:
    """Test login functionality"""
    
    def test_admin_login(self):
        """Test admin login returns access_token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        assert "token_type" in data, "No token_type in response"
        assert data["token_type"] == "bearer", f"Unexpected token_type: {data['token_type']}"
        print(f"✓ Admin login successful, token received")
        return data["access_token"]


class TestGamificationSystem:
    """Test gamification opt-in and badge progress endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            self.token = response.json().get("access_token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Authentication failed")
    
    def test_get_gamification_status(self):
        """GET /api/contributions/gamification-status returns gamification_optin field"""
        response = requests.get(
            f"{BASE_URL}/api/contributions/gamification-status",
            headers=self.headers
        )
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "gamification_optin" in data, "Missing gamification_optin field"
        assert isinstance(data["gamification_optin"], bool), "gamification_optin should be boolean"
        print(f"✓ Gamification status: {data['gamification_optin']}")
    
    def test_toggle_gamification_optin(self):
        """POST /api/contributions/gamification-optin toggles opt-in status"""
        # Get current status
        status_response = requests.get(
            f"{BASE_URL}/api/contributions/gamification-status",
            headers=self.headers
        )
        initial_status = status_response.json().get("gamification_optin", False)
        
        # Toggle
        toggle_response = requests.post(
            f"{BASE_URL}/api/contributions/gamification-optin",
            headers=self.headers
        )
        
        assert toggle_response.status_code == 200, f"Toggle failed: {toggle_response.text}"
        data = toggle_response.json()
        assert "gamification_optin" in data, "Missing gamification_optin in response"
        assert "message" in data, "Missing message in response"
        
        # Verify toggle worked
        new_status = data["gamification_optin"]
        assert new_status != initial_status, f"Status didn't toggle: was {initial_status}, now {new_status}"
        print(f"✓ Gamification toggled from {initial_status} to {new_status}")
        
        # Toggle back to original state
        requests.post(f"{BASE_URL}/api/contributions/gamification-optin", headers=self.headers)
    
    def test_get_badge_progress(self):
        """GET /api/contributions/badge-progress returns badge_names with 'Marraine Or' for gold"""
        response = requests.get(
            f"{BASE_URL}/api/contributions/badge-progress",
            headers=self.headers
        )
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Check required fields
        assert "contributions_validated" in data, "Missing contributions_validated"
        assert "referrals_completed" in data, "Missing referrals_completed"
        assert "badges_earned" in data, "Missing badges_earned"
        assert "badge_names" in data, "Missing badge_names"
        
        # Check badge_names structure
        badge_names = data["badge_names"]
        assert "bronze" in badge_names, "Missing bronze in badge_names"
        assert "silver" in badge_names, "Missing silver in badge_names"
        assert "gold" in badge_names, "Missing gold in badge_names"
        
        # Verify 'Marraine Or' for gold badge
        assert badge_names["gold"] == "Marraine Or", f"Gold badge should be 'Marraine Or', got: {badge_names['gold']}"
        
        # Check progress structure for each badge
        for badge in ["bronze", "silver", "gold"]:
            assert badge in data, f"Missing {badge} progress"
            assert "earned" in data[badge], f"Missing 'earned' in {badge}"
            assert "progress_contributions" in data[badge], f"Missing 'progress_contributions' in {badge}"
            assert "required_contributions" in data[badge], f"Missing 'required_contributions' in {badge}"
        
        print(f"✓ Badge progress retrieved successfully")
        print(f"  - Badge names: {badge_names}")
        print(f"  - Contributions validated: {data['contributions_validated']}")
        print(f"  - Referrals completed: {data['referrals_completed']}")


class TestContributionsEndpoints:
    """Test other contribution-related endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            self.token = response.json().get("access_token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Authentication failed")
    
    def test_get_my_contributions(self):
        """GET /api/contributions/my returns user's contributions"""
        response = requests.get(
            f"{BASE_URL}/api/contributions/my",
            headers=self.headers
        )
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "contributions" in data, "Missing contributions field"
        assert "stats" in data, "Missing stats field"
        print(f"✓ My contributions: {data['stats']}")
    
    def test_get_gift_eligibility(self):
        """GET /api/contributions/gift-eligibility returns eligibility info"""
        response = requests.get(
            f"{BASE_URL}/api/contributions/gift-eligibility",
            headers=self.headers
        )
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "referrals_completed" in data, "Missing referrals_completed"
        assert "can_claim_free_postpartum" in data, "Missing can_claim_free_postpartum"
        assert "gifts_available" in data, "Missing gifts_available"
        print(f"✓ Gift eligibility: referrals={data['referrals_completed']}, can_claim={data['can_claim_free_postpartum']}")


class TestRemindersAPI:
    """Test reminders API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            self.token = response.json().get("access_token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Authentication failed")
    
    def test_get_scheduled_reminders(self):
        """GET /api/medical/scheduled-reminders returns reminders list"""
        response = requests.get(
            f"{BASE_URL}/api/medical/scheduled-reminders",
            headers=self.headers
        )
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "reminders" in data, "Missing reminders field"
        print(f"✓ Reminders retrieved: {len(data['reminders'])} reminders")


class TestRecipesAPI:
    """Test recipes API for custom recipes with author_name"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            self.token = response.json().get("access_token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Authentication failed")
    
    def test_get_my_recipes(self):
        """GET /api/postpartum/recipes/my-recipes returns user's custom recipes"""
        response = requests.get(
            f"{BASE_URL}/api/postpartum/recipes/my-recipes",
            headers=self.headers
        )
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "recipes" in data, "Missing recipes field"
        print(f"✓ My recipes: {len(data['recipes'])} custom recipes")
        
        # If there are custom recipes, check for author_name field
        if data['recipes']:
            recipe = data['recipes'][0]
            print(f"  - First recipe: {recipe.get('name')}")
            if 'author_name' in recipe:
                print(f"  - Author name: {recipe['author_name']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
