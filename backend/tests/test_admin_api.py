"""
Backend API tests for MamanDouce Admin functionality
Tests cover: Users management, Messages, Pending Foods, Promo Codes, and Contact form
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://femme-enceinte-app.preview.emergentagent.com')
API_URL = f"{BASE_URL}/api"

# Admin credentials
ADMIN_EMAIL = "cyrilalepsa@gmail.com"
ADMIN_PASSWORD = "Cyc@dmin9630"
ADMIN_SECRET = "Cyca-admin2026"


class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_login_with_admin_credentials(self):
        """Test admin login - successful"""
        response = requests.post(f"{API_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        print(f"✓ Admin login successful, token received")
    
    def test_login_with_invalid_credentials(self):
        """Test login with wrong credentials - should fail"""
        response = requests.post(f"{API_URL}/auth/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 400


class TestAdminUsers:
    """Admin Users endpoint tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{API_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Admin login failed")
    
    def test_get_admin_users(self, admin_token):
        """Test GET /api/admin/users - get all users with stats"""
        response = requests.get(
            f"{API_URL}/admin/users?admin_secret={ADMIN_SECRET}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Check response structure
        assert "users" in data
        assert "stats" in data
        assert isinstance(data["users"], list)
        
        # Check stats structure
        stats = data["stats"]
        assert "total" in stats
        assert "premium" in stats
        assert "beta_tester" in stats
        assert "free" in stats
        
        print(f"✓ Admin users endpoint working. Total users: {stats['total']}")
        print(f"  - Premium: {stats['premium']}, Beta Testers: {stats['beta_tester']}, Free: {stats['free']}")
    
    def test_admin_users_unauthorized(self):
        """Test admin users without admin_secret - should fail"""
        response = requests.get(
            f"{API_URL}/admin/users?admin_secret=wrong_secret",
        )
        assert response.status_code == 403


class TestAdminMessages:
    """Admin Messages endpoint tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{API_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Admin login failed")
    
    def test_get_admin_messages(self, admin_token):
        """Test GET /api/admin/messages - get all messages"""
        response = requests.get(
            f"{API_URL}/admin/messages?admin_secret={ADMIN_SECRET}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Check response structure
        assert "messages" in data
        assert "stats" in data
        assert isinstance(data["messages"], list)
        
        # Check stats structure
        stats = data["stats"]
        assert "total" in stats
        assert "unread" in stats
        
        print(f"✓ Admin messages endpoint working. Total messages: {stats['total']}, Unread: {stats['unread']}")


class TestAdminPendingFoods:
    """Admin Pending Foods endpoint tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{API_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Admin login failed")
    
    def test_get_pending_foods(self, admin_token):
        """Test GET /api/admin/pending-foods - get foods awaiting validation"""
        response = requests.get(
            f"{API_URL}/admin/pending-foods?admin_secret={ADMIN_SECRET}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Check response structure
        assert "foods" in data
        assert "stats" in data
        assert isinstance(data["foods"], list)
        
        # Check stats structure
        stats = data["stats"]
        assert "pending" in stats
        assert "approved" in stats
        assert "rejected" in stats
        
        print(f"✓ Admin pending foods endpoint working. Stats: {stats}")


class TestAdminPromoCodes:
    """Admin Promo Codes endpoint tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{API_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Admin login failed")
    
    def test_get_promo_codes(self, admin_token):
        """Test GET /api/admin/promo-codes - get all promo codes"""
        response = requests.get(
            f"{API_URL}/admin/promo-codes?admin_secret={ADMIN_SECRET}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Check response structure
        assert "codes" in data
        assert "total" in data
        assert "used" in data
        assert "available" in data
        assert isinstance(data["codes"], list)
        
        print(f"✓ Admin promo codes endpoint working. Total: {data['total']}, Used: {data['used']}, Available: {data['available']}")
    
    def test_generate_promo_code(self, admin_token):
        """Test POST /api/admin/generate-codes - generate new promo code"""
        response = requests.post(
            f"{API_URL}/admin/generate-codes?count=1&note=TEST_auto_generated&admin_secret={ADMIN_SECRET}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "success" in data
        assert data["success"] == True
        assert "codes" in data
        assert len(data["codes"]) == 1
        
        generated_code = data["codes"][0]["code"]
        print(f"✓ Promo code generated successfully: {generated_code}")


class TestContactMessage:
    """Contact message endpoint tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{API_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Admin login failed")
    
    def test_send_contact_message(self, admin_token):
        """Test POST /api/contact/send - send message to admin"""
        response = requests.post(
            f"{API_URL}/contact/send",
            json={
                "subject": "TEST_message_subject",
                "message": "This is a test message for testing purposes"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "success" in data
        assert data["success"] == True
        
        print(f"✓ Contact message sent successfully")
    
    def test_verify_message_received_in_admin(self, admin_token):
        """Verify the sent message appears in admin messages"""
        # First send a message
        send_response = requests.post(
            f"{API_URL}/contact/send",
            json={
                "subject": "TEST_verification_message",
                "message": "Verification message for admin panel"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert send_response.status_code == 200
        
        # Then verify it appears in admin messages
        messages_response = requests.get(
            f"{API_URL}/admin/messages?admin_secret={ADMIN_SECRET}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert messages_response.status_code == 200
        data = messages_response.json()
        
        # Check if our test message is there
        test_messages = [m for m in data["messages"] if "TEST_verification_message" in m.get("subject", "")]
        assert len(test_messages) > 0, "Test message not found in admin messages"
        
        print(f"✓ Message verified in admin panel")


class TestMeEndpoint:
    """Test /auth/me endpoint"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{API_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Admin login failed")
    
    def test_get_current_user(self, admin_token):
        """Test GET /api/auth/me - returns current user info"""
        response = requests.get(
            f"{API_URL}/auth/me",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "email" in data
        assert data["email"] == ADMIN_EMAIL
        
        print(f"✓ Auth/me endpoint working. User: {data['email']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
