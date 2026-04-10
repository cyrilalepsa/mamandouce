"""
Test suite for MamanDouce iteration 5 features:
1. Notification preferences endpoints
2. Subscription status endpoint
3. 2FA endpoints (toggle, status)
4. Admin set-role endpoint for multi-admin management
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "cyrilalepsa@gmail.com"
ADMIN_PASSWORD = "Cyc@dmin9630"


class TestHealth:
    """Basic health check tests"""
    
    def test_backend_accessible(self):
        """Verify backend is accessible"""
        response = requests.get(f"{BASE_URL}/api/auth/me", timeout=10)
        # Should return 401/403 without auth, not 500
        assert response.status_code in [401, 403, 422], f"Backend error: {response.status_code}"
        print("✓ Backend is accessible")


class TestAuthentication:
    """Login tests to get auth token"""
    
    @pytest.fixture
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        token = response.json().get("access_token")
        assert token, "No token received"
        return token
    
    def test_admin_login(self, auth_token):
        """Test admin can login successfully"""
        assert auth_token is not None
        print(f"✓ Admin login successful, token: {auth_token[:20]}...")


class TestNotificationPreferences:
    """Tests for GET/POST /api/notifications/preferences"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authenticated headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Cannot authenticate")
        token = response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_notification_preferences(self, auth_headers):
        """Test GET /api/notifications/preferences returns user preferences"""
        response = requests.get(f"{BASE_URL}/api/notifications/preferences", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify default fields exist
        assert "email_notifications" in data, "Missing email_notifications field"
        assert "weekly_tips" in data, "Missing weekly_tips field"
        assert "appointment_reminders" in data, "Missing appointment_reminders field"
        print(f"✓ GET notifications/preferences: {data}")
    
    def test_update_notification_preferences(self, auth_headers):
        """Test POST /api/notifications/preferences updates preferences"""
        update_data = {
            "email_notifications": False,
            "weekly_tips": True,
            "appointment_reminders": True,
            "email_address": "test@example.com"
        }
        response = requests.post(f"{BASE_URL}/api/notifications/preferences", 
                                 json=update_data, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, f"Expected success: {data}"
        print(f"✓ POST notifications/preferences: {data}")
        
        # Verify the update persisted with GET
        get_response = requests.get(f"{BASE_URL}/api/notifications/preferences", headers=auth_headers)
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data.get("email_notifications") == False, "Preference not persisted"
        print(f"✓ Preference persisted correctly")


class TestSubscriptionStatus:
    """Tests for GET /api/subscription-status"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authenticated headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Cannot authenticate")
        token = response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_subscription_status(self, auth_headers):
        """Test GET /api/subscription-status returns subscription info"""
        response = requests.get(f"{BASE_URL}/api/subscription-status", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "subscription_status" in data, "Missing subscription_status field"
        # Valid values: free, premium
        assert data["subscription_status"] in ["free", "premium"], f"Invalid status: {data['subscription_status']}"
        print(f"✓ GET subscription-status: {data}")


class TestTwoFactorAuth:
    """Tests for 2FA endpoints"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authenticated headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Cannot authenticate")
        token = response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_2fa_status(self, auth_headers):
        """Test GET /api/auth/2fa/status returns 2FA status"""
        response = requests.get(f"{BASE_URL}/api/auth/2fa/status", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "two_factor_enabled" in data, "Missing two_factor_enabled field"
        assert isinstance(data["two_factor_enabled"], bool), "two_factor_enabled should be boolean"
        print(f"✓ GET 2fa/status: two_factor_enabled={data['two_factor_enabled']}")
    
    def test_toggle_2fa_enable(self, auth_headers):
        """Test POST /api/auth/2fa/toggle can enable 2FA"""
        response = requests.post(f"{BASE_URL}/api/auth/2fa/toggle", 
                                json={"enable": True}, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, f"Expected success: {data}"
        print(f"✓ POST 2fa/toggle (enable): {data}")
        
        # Verify status changed
        status_response = requests.get(f"{BASE_URL}/api/auth/2fa/status", headers=auth_headers)
        status_data = status_response.json()
        assert status_data.get("two_factor_enabled") == True, "2FA not enabled after toggle"
        print(f"✓ 2FA status verified as enabled")
    
    def test_toggle_2fa_disable(self, auth_headers):
        """Test POST /api/auth/2fa/toggle can disable 2FA"""
        response = requests.post(f"{BASE_URL}/api/auth/2fa/toggle", 
                                json={"enable": False}, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, f"Expected success: {data}"
        print(f"✓ POST 2fa/toggle (disable): {data}")
        
        # Verify status changed
        status_response = requests.get(f"{BASE_URL}/api/auth/2fa/status", headers=auth_headers)
        status_data = status_response.json()
        assert status_data.get("two_factor_enabled") == False, "2FA not disabled after toggle"
        print(f"✓ 2FA status verified as disabled")


class TestAdminSetRole:
    """Tests for admin role management - /api/admin/user/{id}/set-role"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get admin authenticated headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Cannot authenticate as admin")
        token = response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_users_list(self, auth_headers):
        """Test admin can get users list to find user IDs"""
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "users" in data, "Missing users field"
        assert "stats" in data, "Missing stats field"
        assert isinstance(data["users"], list), "users should be a list"
        print(f"✓ GET admin/users: {len(data['users'])} users found")
        print(f"  Stats: {data['stats']}")
    
    def test_set_role_invalid_role(self, auth_headers):
        """Test set-role with invalid role returns 400"""
        # Get a user first
        users_response = requests.get(f"{BASE_URL}/api/admin/users", headers=auth_headers)
        if users_response.status_code != 200 or len(users_response.json().get("users", [])) == 0:
            pytest.skip("No users available for testing")
        
        user_id = users_response.json()["users"][0]["id"]
        
        response = requests.post(f"{BASE_URL}/api/admin/user/{user_id}/set-role?role=invalid",
                                headers=auth_headers)
        assert response.status_code == 400, f"Expected 400 for invalid role, got {response.status_code}"
        print(f"✓ Invalid role correctly rejected with 400")
    
    def test_admin_cannot_remove_own_role(self, auth_headers):
        """Test admin cannot remove their own admin role"""
        # First get admin's user ID
        me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=auth_headers)
        if me_response.status_code != 200:
            pytest.skip("Cannot get admin user info")
        
        admin_id = me_response.json().get("id")
        assert admin_id, "Admin ID not found"
        
        # Try to remove own admin role
        response = requests.post(f"{BASE_URL}/api/admin/user/{admin_id}/set-role?role=user",
                                headers=auth_headers)
        # Should be rejected with 400
        assert response.status_code == 400, f"Expected 400 when removing own admin role, got {response.status_code}: {response.text}"
        print(f"✓ Admin correctly prevented from removing own admin role")


class TestAdminStats:
    """Tests for admin dashboard stats"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get admin authenticated headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Cannot authenticate as admin")
        token = response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_admin_stats(self, auth_headers):
        """Test GET /api/admin/stats returns dashboard statistics"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "users" in data, "Missing users stats"
        assert "visits" in data, "Missing visits count"
        assert "unread_messages" in data, "Missing unread_messages count"
        assert "pending_foods" in data, "Missing pending_foods count"
        
        # Validate users sub-structure
        users = data["users"]
        assert "total" in users, "Missing total users count"
        assert "premium" in users, "Missing premium count"
        assert "beta_tester" in users, "Missing beta_tester count"
        assert "free" in users, "Missing free count"
        print(f"✓ GET admin/stats: {data}")


class TestAdminTabs:
    """Tests for admin page tabs data endpoints"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get admin authenticated headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Cannot authenticate as admin")
        token = response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_promo_codes(self, auth_headers):
        """Test codes tab - GET /api/admin/promo-codes"""
        response = requests.get(f"{BASE_URL}/api/admin/promo-codes", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "codes" in data, "Missing codes list"
        assert "total" in data, "Missing total count"
        assert "used" in data, "Missing used count"
        assert "available" in data, "Missing available count"
        print(f"✓ GET admin/promo-codes: {data['total']} total, {data['available']} available")
    
    def test_get_pending_foods(self, auth_headers):
        """Test foods tab - GET /api/admin/pending-foods"""
        response = requests.get(f"{BASE_URL}/api/admin/pending-foods", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "foods" in data, "Missing foods list"
        assert "stats" in data, "Missing stats"
        print(f"✓ GET admin/pending-foods: {data['stats']}")
    
    def test_get_admin_messages(self, auth_headers):
        """Test messages tab - GET /api/admin/messages"""
        response = requests.get(f"{BASE_URL}/api/admin/messages", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "messages" in data, "Missing messages list"
        assert "stats" in data, "Missing stats"
        print(f"✓ GET admin/messages: {data['stats']}")
    
    def test_get_refund_requests(self, auth_headers):
        """Test refunds tab - GET /api/admin/refund-requests"""
        response = requests.get(f"{BASE_URL}/api/admin/refund-requests", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "requests" in data, "Missing requests list"
        print(f"✓ GET admin/refund-requests: {len(data['requests'])} requests")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
