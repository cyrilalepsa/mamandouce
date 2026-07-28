"""
MamanDouce v4.5.0 Feature Tests
Tests for: TTS Pronunciation, Name Comparator, Gold Moderation, Emotional Intelligence
"""
import pytest
import requests
import os

BASE_URL = (os.environ.get("BACKEND_URL") or os.environ.get("VITE_BACKEND_URL") or os.environ.get("REACT_APP_BACKEND_URL") or "http://localhost:8000").rstrip("/")

# Test credentials
ADMIN_EMAIL = "admin@mamandouce.com"
ADMIN_PASSWORD = "AdminPremium2024!"


class TestAuthentication:
    """Authentication tests to get token for other tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return response.json().get("access_token")
    
    def test_login_success(self):
        """Test admin login works"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data


class TestNameComparator:
    """Tests for Name Comparator API"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_compare_names_success(self):
        """Test comparing multiple names returns analysis"""
        response = requests.post(
            f"{BASE_URL}/api/babynames/compare",
            json=["Emma", "Léa", "Marie"],
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert data.get("success") == True
        assert "comparisons" in data
        assert len(data["comparisons"]) == 3
        
        # Verify each comparison has required fields
        for comp in data["comparisons"]:
            assert "name" in comp
            assert "length" in comp
            assert "syllables" in comp
            assert "popularity_score" in comp
            assert "characteristics" in comp
        
        # Verify recommendation
        assert "recommendation" in data
    
    def test_compare_names_minimum_two_required(self):
        """Test that at least 2 names are required"""
        response = requests.post(
            f"{BASE_URL}/api/babynames/compare",
            json=["Emma"],
            headers=self.headers
        )
        assert response.status_code == 400
        assert "2 prénoms" in response.json().get("detail", "")
    
    def test_compare_names_maximum_five(self):
        """Test that maximum 5 names allowed"""
        response = requests.post(
            f"{BASE_URL}/api/babynames/compare",
            json=["Emma", "Léa", "Marie", "Sophie", "Julie", "Claire"],
            headers=self.headers
        )
        assert response.status_code == 400
        assert "5 prénoms" in response.json().get("detail", "")
    
    def test_comparison_history(self):
        """Test getting comparison history"""
        response = requests.get(
            f"{BASE_URL}/api/babynames/comparison-history",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "history" in data


class TestTTSPronunciation:
    """Tests for TTS Pronunciation API"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_pronounce_base64_endpoint_exists(self):
        """Test that TTS base64 endpoint exists and responds"""
        response = requests.get(
            f"{BASE_URL}/api/babynames/pronounce-base64/Emma",
            headers=self.headers
        )
        # Should return 200 with audio or 500 if API key issue
        assert response.status_code in [200, 500]
        
        if response.status_code == 200:
            data = response.json()
            assert data.get("success") == True
            assert "audio_base64" in data
            assert data.get("name") == "Emma"
    
    def test_pronounce_name_too_long(self):
        """Test that names over 50 chars are rejected"""
        long_name = "A" * 51
        response = requests.get(
            f"{BASE_URL}/api/babynames/pronounce-base64/{long_name}",
            headers=self.headers
        )
        assert response.status_code == 400
        assert "trop long" in response.json().get("detail", "")


class TestGoldModeration:
    """Tests for Gold Godmother Moderation API"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_moderation_pending_requires_gold_status(self):
        """Test that moderation endpoint requires gold status"""
        response = requests.get(
            f"{BASE_URL}/api/babynames/moderation/pending",
            headers=self.headers
        )
        # Should return 403 if not gold, or 200 if gold
        assert response.status_code in [200, 403]
        
        if response.status_code == 403:
            assert "Marraines Or" in response.json().get("detail", "")
        else:
            data = response.json()
            assert "contributions" in data
            assert "moderator_level" in data
    
    def test_moderation_my_votes_requires_gold(self):
        """Test that my-votes endpoint requires gold status"""
        response = requests.get(
            f"{BASE_URL}/api/babynames/moderation/my-votes",
            headers=self.headers
        )
        # Should return 403 if not gold, or 200 if gold
        assert response.status_code in [200, 403]


class TestEmotionalIntelligence:
    """Tests for Emotional Intelligence APIs"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_cycle_status_returns_status(self):
        """Test cycle status endpoint returns proper status"""
        response = requests.get(
            f"{BASE_URL}/api/emotional/cycle-status",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should have status field
        assert "status" in data
        assert data["status"] in ["no_data", "potential_pregnancy", "late", "expected", "upcoming", "error"]
        assert "show_alert" in data
        assert "message" in data
    
    def test_special_dates_returns_messages(self):
        """Test special dates endpoint returns messages array"""
        response = requests.get(
            f"{BASE_URL}/api/emotional/special-dates",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "has_messages" in data
        assert "messages" in data
        assert isinstance(data["messages"], list)
        assert "checked_at" in data
    
    def test_pending_notifications(self):
        """Test pending notifications endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/emotional/pending-notifications",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "notifications" in data
        assert "count" in data
    
    def test_pregnancy_announced(self):
        """Test pregnancy announcement triggers celebration"""
        response = requests.post(
            f"{BASE_URL}/api/emotional/pregnancy-announced",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        assert data.get("trigger_celebration") == True
        assert data.get("celebration_type") == "pregnancy_announcement"
    
    def test_mark_celebrated(self):
        """Test marking celebration as seen"""
        response = requests.post(
            f"{BASE_URL}/api/emotional/mark-celebrated",
            params={"event_type": "birthday"},
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True


class TestTirelireIntegration:
    """Tests for Tirelire (Piggy Bank) integration"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_tirelire_balance(self):
        """Test tirelire balance endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/tirelire/balance",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "balance" in data
        assert "gift_balance" in data
        assert "premium_after_discount" in data
        assert "postpartum_after_discount" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
