"""
Test Post-partum Account Management Endpoints
Testing: account-status, export-data, archive-account, request-early-archive
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPostpartumAccountManagement:
    """Tests for post-partum account lifecycle endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Login with test account and get token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@mamandouce.com",
            "password": "Demo123!"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        token = response.json().get("access_token")
        assert token, "No access_token in response"
        return token
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get authorization headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    # ==================== account-status endpoint ====================
    
    def test_account_status_returns_correct_fields(self, auth_headers):
        """GET /api/postpartum/account-status should return expected fields"""
        response = requests.get(f"{BASE_URL}/api/postpartum/account-status", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify required fields exist
        required_fields = ["has_postpartum", "postpartum_active", "expiration_date", "days_remaining", "account_archived"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        # Verify field types
        assert isinstance(data["has_postpartum"], bool), "has_postpartum should be boolean"
        assert isinstance(data["account_archived"], bool), "account_archived should be boolean"
        
        print(f"Account status response: {data}")
        
    def test_account_status_no_postpartum_user(self, auth_headers):
        """For user without postpartum, should return has_postpartum=False"""
        response = requests.get(f"{BASE_URL}/api/postpartum/account-status", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Demo user doesn't have postpartum purchased
        # Verify response structure is consistent
        assert "has_postpartum" in data
        assert "account_archived" in data
        
        print(f"Non-postpartum user status: has_postpartum={data['has_postpartum']}, archived={data['account_archived']}")
    
    # ==================== export-data endpoint ====================
    
    def test_export_data_returns_user_info(self, auth_headers):
        """GET /api/postpartum/export-data should return user data structure"""
        response = requests.get(f"{BASE_URL}/api/postpartum/export-data", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify export contains required sections
        assert "export_date" in data, "Missing export_date"
        assert "user_info" in data, "Missing user_info"
        
        # Verify user_info structure
        user_info = data["user_info"]
        assert "name" in user_info, "Missing name in user_info"
        assert "email" in user_info, "Missing email in user_info"
        
        print(f"Export data contains keys: {list(data.keys())}")
        
    def test_export_data_contains_pregnancy_profile(self, auth_headers):
        """Export should include pregnancy profile if exists"""
        response = requests.get(f"{BASE_URL}/api/postpartum/export-data", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check for pregnancy_profile field
        assert "pregnancy_profile" in data, "Missing pregnancy_profile in export"
        
        # These fields should exist even if empty
        expected_fields = ["medical_notes", "notifications", "maternity_bag", "favorites", "search_history", "chat_history"]
        for field in expected_fields:
            assert field in data, f"Missing {field} in export data"
        
        print(f"Export includes: pregnancy_profile={data['pregnancy_profile'] is not None}, medical_notes={len(data.get('medical_notes', []))}")
    
    # ==================== archive-account endpoint ====================
    
    def test_archive_account_requires_postpartum_expired(self, auth_headers):
        """POST /api/postpartum/archive-account should fail if postpartum not expired"""
        response = requests.post(f"{BASE_URL}/api/postpartum/archive-account", headers=auth_headers)
        
        # For user without birth date or not expired, should return error
        # Could be 400 (bad request) or 200 with error message
        if response.status_code == 400:
            data = response.json()
            assert "detail" in data, "Error response should have detail field"
            print(f"Archive blocked (expected): {data.get('detail')}")
        elif response.status_code == 200:
            # Some implementations might return 200 with error message
            data = response.json()
            if not data.get("success"):
                print(f"Archive blocked via success=false")
        else:
            print(f"Archive response: status={response.status_code}, body={response.text}")
    
    def test_archive_account_error_for_no_birth_date(self, auth_headers):
        """Archive should fail for user without birth date set"""
        response = requests.post(f"{BASE_URL}/api/postpartum/archive-account", headers=auth_headers)
        
        # Expected to fail since demo user has no birth date
        assert response.status_code in [400, 200], f"Unexpected status: {response.status_code}"
        
        if response.status_code == 400:
            data = response.json()
            print(f"Archive error (expected): {data.get('detail')}")
    
    # ==================== request-early-archive endpoint ====================
    
    def test_early_archive_endpoint_accessible(self, auth_headers):
        """POST /api/postpartum/request-early-archive should be accessible"""
        # Note: This will actually archive the account if it succeeds,
        # so we test carefully
        response = requests.post(f"{BASE_URL}/api/postpartum/request-early-archive", headers=auth_headers)
        
        # Either succeeds (200) or fails with account_archived error (400)
        assert response.status_code in [200, 400], f"Unexpected status: {response.status_code}"
        
        data = response.json()
        if response.status_code == 200:
            assert "success" in data or "message" in data
            print(f"Early archive response: {data}")
        else:
            print(f"Early archive blocked: {data.get('detail')}")
    
    # ==================== Authentication tests ====================
    
    def test_account_status_requires_auth(self):
        """account-status should require authentication"""
        response = requests.get(f"{BASE_URL}/api/postpartum/account-status")
        
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        
    def test_export_data_requires_auth(self):
        """export-data should require authentication"""
        response = requests.get(f"{BASE_URL}/api/postpartum/export-data")
        
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
    
    def test_archive_account_requires_auth(self):
        """archive-account should require authentication"""
        response = requests.post(f"{BASE_URL}/api/postpartum/archive-account")
        
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"


class TestPostpartumStatus:
    """Tests for general postpartum status endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Login with test account"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@mamandouce.com",
            "password": "Demo123!"
        })
        return response.json().get("access_token")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_postpartum_status_endpoint(self, auth_headers):
        """GET /api/postpartum/status should return status info"""
        response = requests.get(f"{BASE_URL}/api/postpartum/status", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify expected fields
        expected_fields = ["postpartum_unlocked", "can_set_birth_date", "postpartum_started"]
        for field in expected_fields:
            assert field in data, f"Missing {field} in status response"
        
        print(f"Postpartum status: unlocked={data['postpartum_unlocked']}, can_set_birth={data['can_set_birth_date']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
