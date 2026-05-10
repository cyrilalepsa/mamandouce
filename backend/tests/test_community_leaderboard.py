"""
Test Community Leaderboard Feature
Tests the community-stats endpoint and related gamification features
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@mamandouce.com"
ADMIN_PASSWORD = "AdminPremium2024!"


class TestCommunityLeaderboard:
    """Tests for community leaderboard feature"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_login_works(self):
        """Test login returns access_token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert len(data["access_token"]) > 0
        print("✓ Login works - access_token returned")
    
    def test_community_stats_endpoint_returns_200(self):
        """Test GET /api/contributions/community-stats returns 200"""
        response = requests.get(
            f"{BASE_URL}/api/contributions/community-stats",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✓ Community stats endpoint returns 200")
    
    def test_community_stats_has_total_contributors(self):
        """Test community-stats returns total_contributors field"""
        response = requests.get(
            f"{BASE_URL}/api/contributions/community-stats",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_contributors" in data, "Missing total_contributors field"
        assert isinstance(data["total_contributors"], int), "total_contributors should be int"
        print(f"✓ total_contributors: {data['total_contributors']}")
    
    def test_community_stats_has_total_contributions(self):
        """Test community-stats returns total_contributions field"""
        response = requests.get(
            f"{BASE_URL}/api/contributions/community-stats",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_contributions" in data, "Missing total_contributions field"
        assert isinstance(data["total_contributions"], int), "total_contributions should be int"
        print(f"✓ total_contributions: {data['total_contributions']}")
    
    def test_community_stats_has_badges_counts(self):
        """Test community-stats returns badges with bronze, silver, gold counts"""
        response = requests.get(
            f"{BASE_URL}/api/contributions/community-stats",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "badges" in data, "Missing badges field"
        badges = data["badges"]
        assert "bronze" in badges, "Missing bronze badge count"
        assert "silver" in badges, "Missing silver badge count"
        assert "gold" in badges, "Missing gold badge count"
        assert isinstance(badges["bronze"], int), "bronze count should be int"
        assert isinstance(badges["silver"], int), "silver count should be int"
        assert isinstance(badges["gold"], int), "gold count should be int"
        print(f"✓ badges: bronze={badges['bronze']}, silver={badges['silver']}, gold={badges['gold']}")
    
    def test_community_stats_has_badge_names_with_marraine_or(self):
        """Test community-stats returns badge_names with 'Marraine Or' for gold"""
        response = requests.get(
            f"{BASE_URL}/api/contributions/community-stats",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "badge_names" in data, "Missing badge_names field"
        badge_names = data["badge_names"]
        assert "gold" in badge_names, "Missing gold in badge_names"
        assert badge_names["gold"] == "Marraine Or", f"Expected 'Marraine Or', got '{badge_names['gold']}'"
        assert badge_names["silver"] == "Contributrice Argent", f"Expected 'Contributrice Argent', got '{badge_names['silver']}'"
        assert badge_names["bronze"] == "Contributrice Bronze", f"Expected 'Contributrice Bronze', got '{badge_names['bronze']}'"
        print(f"✓ badge_names: {badge_names}")
    
    def test_badge_progress_endpoint(self):
        """Test badge-progress endpoint returns badge_names"""
        response = requests.get(
            f"{BASE_URL}/api/contributions/badge-progress",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "badge_names" in data, "Missing badge_names in badge-progress"
        assert data["badge_names"]["gold"] == "Marraine Or"
        print("✓ badge-progress also returns badge_names with Marraine Or")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
