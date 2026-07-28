"""
Test suite for Referral and Solidarity endpoints
Tests: /api/referral/code, /api/solidarity/wallet, /api/solidarity/badges
"""
import pytest
import requests
import os

BASE_URL = (os.environ.get("BACKEND_URL") or os.environ.get("VITE_BACKEND_URL") or os.environ.get("REACT_APP_BACKEND_URL") or "http://localhost:8000").rstrip("/")

# Test credentials from test_credentials.md
TEST_EMAIL = "admin@mamandouce.com"
TEST_PASSWORD = "AdminPremium2024!"


class TestAuth:
    """Authentication tests to get token for subsequent tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        return data["access_token"]
    
    def test_login_success(self):
        """Test login with admin credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        print(f"✅ Login successful for {TEST_EMAIL}")


class TestReferralCode:
    """Tests for /api/referral/code endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    def test_get_referral_code(self, auth_token):
        """Test GET /api/referral/code - should return unique referral code"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/referral/code", headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "referral_code" in data, "Missing referral_code in response"
        assert "referral_link" in data, "Missing referral_link in response"
        assert "sponsor_name" in data, "Missing sponsor_name in response"
        assert "successful_referrals" in data, "Missing successful_referrals in response"
        assert "wallet_balance" in data, "Missing wallet_balance in response"
        
        # Verify data types
        assert isinstance(data["referral_code"], str), "referral_code should be string"
        assert len(data["referral_code"]) == 8, f"referral_code should be 8 chars, got {len(data['referral_code'])}"
        assert data["referral_link"].startswith("https://"), "referral_link should start with https://"
        assert isinstance(data["successful_referrals"], int), "successful_referrals should be int"
        assert isinstance(data["wallet_balance"], (int, float)), "wallet_balance should be numeric"
        
        print(f"✅ Referral code: {data['referral_code']}")
        print(f"✅ Referral link: {data['referral_link']}")
        print(f"✅ Wallet balance: {data['wallet_balance']}€")
    
    def test_referral_code_consistency(self, auth_token):
        """Test that referral code is consistent across multiple calls"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # First call
        response1 = requests.get(f"{BASE_URL}/api/referral/code", headers=headers)
        assert response1.status_code == 200
        code1 = response1.json()["referral_code"]
        
        # Second call
        response2 = requests.get(f"{BASE_URL}/api/referral/code", headers=headers)
        assert response2.status_code == 200
        code2 = response2.json()["referral_code"]
        
        # Code should be the same
        assert code1 == code2, f"Referral code changed: {code1} vs {code2}"
        print(f"✅ Referral code is consistent: {code1}")
    
    def test_referral_code_unauthorized(self):
        """Test GET /api/referral/code without auth - should fail"""
        response = requests.get(f"{BASE_URL}/api/referral/code")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✅ Unauthorized access correctly rejected")


class TestReferralStatus:
    """Tests for /api/referral/status endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    def test_get_referral_status(self, auth_token):
        """Test GET /api/referral/status"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/referral/status", headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "referrals" in data, "Missing referrals in response"
        assert "completed_count" in data, "Missing completed_count in response"
        assert "postpartum_unlocked" in data, "Missing postpartum_unlocked in response"
        
        # Verify data types
        assert isinstance(data["referrals"], list), "referrals should be a list"
        assert isinstance(data["completed_count"], int), "completed_count should be int"
        assert isinstance(data["postpartum_unlocked"], bool), "postpartum_unlocked should be bool"
        
        print(f"✅ Referral status: {data['completed_count']} completed, postpartum_unlocked: {data['postpartum_unlocked']}")


class TestSolidarityWallet:
    """Tests for /api/solidarity/wallet endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    def test_get_wallet(self, auth_token):
        """Test GET /api/solidarity/wallet - should return wallet data"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/solidarity/wallet", headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "balance" in data, "Missing balance in response"
        assert "total_earned" in data, "Missing total_earned in response"
        assert "total_donated" in data, "Missing total_donated in response"
        assert "transactions" in data, "Missing transactions in response"
        
        # Verify data types
        assert isinstance(data["balance"], (int, float)), "balance should be numeric"
        assert isinstance(data["total_earned"], (int, float)), "total_earned should be numeric"
        assert isinstance(data["total_donated"], (int, float)), "total_donated should be numeric"
        assert isinstance(data["transactions"], list), "transactions should be a list"
        
        print(f"✅ Wallet balance: {data['balance']}€")
        print(f"✅ Total earned: {data['total_earned']}€")
        print(f"✅ Total donated: {data['total_donated']}€")
        print(f"✅ Transactions count: {len(data['transactions'])}")
    
    def test_wallet_unauthorized(self):
        """Test GET /api/solidarity/wallet without auth - should fail"""
        response = requests.get(f"{BASE_URL}/api/solidarity/wallet")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✅ Unauthorized access correctly rejected")


class TestSolidarityBadges:
    """Tests for /api/solidarity/badges endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    def test_get_badges(self, auth_token):
        """Test GET /api/solidarity/badges - should return badges and progress"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/solidarity/badges", headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "badges" in data, "Missing badges in response"
        assert "progress" in data, "Missing progress in response"
        
        # Verify badges is a list
        assert isinstance(data["badges"], list), "badges should be a list"
        
        # Verify progress structure
        progress = data["progress"]
        assert "contributions_validated" in progress, "Missing contributions_validated in progress"
        assert "referrals_completed" in progress, "Missing referrals_completed in progress"
        assert "has_bronze" in progress, "Missing has_bronze in progress"
        assert "has_silver" in progress, "Missing has_silver in progress"
        assert "has_gold" in progress, "Missing has_gold in progress"
        
        print(f"✅ Badges count: {len(data['badges'])}")
        print(f"✅ Contributions validated: {progress['contributions_validated']}")
        print(f"✅ Referrals completed: {progress['referrals_completed']}")
        print(f"✅ Has bronze: {progress['has_bronze']}, silver: {progress['has_silver']}, gold: {progress['has_gold']}")


class TestReferralValidation:
    """Tests for /api/referral/validate/{code} endpoint (public)"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    def test_validate_invalid_code(self):
        """Test validating an invalid referral code"""
        response = requests.get(f"{BASE_URL}/api/referral/validate/INVALID123")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✅ Invalid code correctly rejected with 404")
    
    def test_validate_valid_code(self, auth_token):
        """Test validating a valid referral code"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # First get the user's referral code
        code_response = requests.get(f"{BASE_URL}/api/referral/code", headers=headers)
        assert code_response.status_code == 200
        referral_code = code_response.json()["referral_code"]
        
        # Now validate it (public endpoint)
        response = requests.get(f"{BASE_URL}/api/referral/validate/{referral_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["valid"] == True, "Code should be valid"
        assert "sponsor_name" in data, "Missing sponsor_name"
        assert "sponsor_id" in data, "Missing sponsor_id"
        
        print(f"✅ Valid code {referral_code} validated successfully")
        print(f"✅ Sponsor name: {data['sponsor_name']}")


class TestRelaisMamanStats:
    """Tests for /api/solidarity/relais-maman/stats endpoint (public)"""
    
    def test_get_relais_maman_stats(self):
        """Test GET /api/solidarity/relais-maman/stats - public endpoint"""
        response = requests.get(f"{BASE_URL}/api/solidarity/relais-maman/stats")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "total_collected" in data, "Missing total_collected"
        assert "donations_count" in data, "Missing donations_count"
        assert "gift_cards_sent" in data, "Missing gift_cards_sent"
        assert "beneficiaries_count" in data, "Missing beneficiaries_count"
        
        # Verify data types
        assert isinstance(data["total_collected"], (int, float)), "total_collected should be numeric"
        assert isinstance(data["donations_count"], int), "donations_count should be int"
        assert isinstance(data["gift_cards_sent"], int), "gift_cards_sent should be int"
        assert isinstance(data["beneficiaries_count"], int), "beneficiaries_count should be int"
        
        print(f"✅ Relais Maman stats:")
        print(f"   Total collected: {data['total_collected']}€")
        print(f"   Donations count: {data['donations_count']}")
        print(f"   Gift cards sent: {data['gift_cards_sent']}")
        print(f"   Beneficiaries: {data['beneficiaries_count']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
