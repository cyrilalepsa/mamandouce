"""
Test suite for MamanDouce v4.4.0 features:
- Tirelire (Piggy Bank) system with 5€ referral bonus
- Emotional Intelligence endpoints
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@mamandouce.com"
ADMIN_PASSWORD = "AdminPremium2024!"


class TestTirelireAPI:
    """Tirelire (Piggy Bank) API tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if login_response.status_code == 200:
            token = login_response.json().get("access_token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip(f"Login failed: {login_response.status_code}")
    
    def test_tirelire_balance_endpoint_exists(self):
        """Test GET /api/tirelire/balance returns balance data"""
        response = self.session.get(f"{BASE_URL}/api/tirelire/balance")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify response structure
        assert "balance" in data, "Response should contain 'balance'"
        assert "gift_balance" in data, "Response should contain 'gift_balance'"
        assert "can_gift" in data, "Response should contain 'can_gift'"
        assert "premium_after_discount" in data, "Response should contain 'premium_after_discount'"
        assert "postpartum_after_discount" in data, "Response should contain 'postpartum_after_discount'"
        
        # Verify data types
        assert isinstance(data["balance"], (int, float)), "balance should be numeric"
        assert isinstance(data["gift_balance"], (int, float)), "gift_balance should be numeric"
        assert isinstance(data["can_gift"], bool), "can_gift should be boolean"
        
        print(f"✅ Tirelire balance: {data['balance']}€, gift_balance: {data['gift_balance']}€")
    
    def test_tirelire_balance_discount_calculation(self):
        """Test that discount calculations are correct"""
        response = self.session.get(f"{BASE_URL}/api/tirelire/balance")
        
        assert response.status_code == 200
        data = response.json()
        
        balance = data["balance"]
        premium_after = data["premium_after_discount"]
        postpartum_after = data["postpartum_after_discount"]
        
        # Premium price is 30€, postpartum is 10€
        expected_premium = max(0, 30 - balance)
        expected_postpartum = max(0, 10 - balance)
        
        assert premium_after == expected_premium, f"Premium discount calc wrong: {premium_after} != {expected_premium}"
        assert postpartum_after == expected_postpartum, f"Postpartum discount calc wrong: {postpartum_after} != {expected_postpartum}"
        
        print(f"✅ Discount calculations correct: Premium {premium_after}€, Postpartum {postpartum_after}€")
    
    def test_tirelire_use_for_purchase_invalid_type(self):
        """Test POST /api/tirelire/use-for-purchase rejects invalid package type"""
        response = self.session.post(
            f"{BASE_URL}/api/tirelire/use-for-purchase",
            params={"package_type": "invalid_type"}
        )
        
        assert response.status_code == 400, f"Expected 400 for invalid type, got {response.status_code}"
        print("✅ Invalid package type correctly rejected")
    
    def test_tirelire_apply_referral_invalid_code(self):
        """Test POST /api/tirelire/apply-referral-bonus rejects invalid code"""
        response = self.session.post(
            f"{BASE_URL}/api/tirelire/apply-referral-bonus",
            params={"referral_code": "INVALID_CODE_12345"}
        )
        
        # Should return 404 for invalid code or 400 if already received
        assert response.status_code in [400, 404], f"Expected 400/404, got {response.status_code}"
        print(f"✅ Invalid referral code correctly rejected with status {response.status_code}")
    
    def test_tirelire_send_gift_invalid_type(self):
        """Test POST /api/tirelire/send-gift rejects invalid gift type"""
        response = self.session.post(
            f"{BASE_URL}/api/tirelire/send-gift",
            params={
                "recipient_email": "test@test.com",
                "gift_type": "invalid"
            }
        )
        
        assert response.status_code == 400, f"Expected 400 for invalid gift type, got {response.status_code}"
        print("✅ Invalid gift type correctly rejected")
    
    def test_tirelire_send_gift_self_gift_rejected(self):
        """Test that users cannot gift themselves"""
        response = self.session.post(
            f"{BASE_URL}/api/tirelire/send-gift",
            params={
                "recipient_email": ADMIN_EMAIL,
                "gift_type": "premium"
            }
        )
        
        # Should reject self-gifting
        assert response.status_code == 400, f"Expected 400 for self-gift, got {response.status_code}"
        print("✅ Self-gifting correctly rejected")


class TestEmotionalIntelligenceAPI:
    """Emotional Intelligence API tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if login_response.status_code == 200:
            token = login_response.json().get("access_token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip(f"Login failed: {login_response.status_code}")
    
    def test_emotional_cycle_status_endpoint(self):
        """Test GET /api/emotional/cycle-status returns status"""
        response = self.session.get(f"{BASE_URL}/api/emotional/cycle-status")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "status" in data, "Response should contain 'status'"
        assert "show_alert" in data, "Response should contain 'show_alert'"
        
        print(f"✅ Cycle status: {data['status']}, show_alert: {data['show_alert']}")
    
    def test_emotional_special_dates_endpoint(self):
        """Test GET /api/emotional/special-dates returns messages"""
        response = self.session.get(f"{BASE_URL}/api/emotional/special-dates")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "has_messages" in data, "Response should contain 'has_messages'"
        assert "messages" in data, "Response should contain 'messages'"
        assert "checked_at" in data, "Response should contain 'checked_at'"
        
        assert isinstance(data["messages"], list), "messages should be a list"
        
        print(f"✅ Special dates: has_messages={data['has_messages']}, count={len(data['messages'])}")
    
    def test_emotional_pending_notifications_endpoint(self):
        """Test GET /api/emotional/pending-notifications returns notifications"""
        response = self.session.get(f"{BASE_URL}/api/emotional/pending-notifications")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "notifications" in data, "Response should contain 'notifications'"
        assert "count" in data, "Response should contain 'count'"
        
        assert isinstance(data["notifications"], list), "notifications should be a list"
        assert isinstance(data["count"], int), "count should be an integer"
        
        print(f"✅ Pending notifications: count={data['count']}")
    
    def test_emotional_pregnancy_announced_endpoint(self):
        """Test POST /api/emotional/pregnancy-announced triggers celebration"""
        response = self.session.post(f"{BASE_URL}/api/emotional/pregnancy-announced")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "success" in data, "Response should contain 'success'"
        assert "trigger_celebration" in data, "Response should contain 'trigger_celebration'"
        assert "celebration_type" in data, "Response should contain 'celebration_type'"
        
        assert data["success"] == True, "success should be True"
        assert data["trigger_celebration"] == True, "trigger_celebration should be True"
        assert data["celebration_type"] == "pregnancy_announcement", "celebration_type should be 'pregnancy_announcement'"
        
        print(f"✅ Pregnancy announcement: celebration triggered")
    
    def test_emotional_mark_celebrated_endpoint(self):
        """Test POST /api/emotional/mark-celebrated logs celebration"""
        response = self.session.post(
            f"{BASE_URL}/api/emotional/mark-celebrated",
            params={"event_type": "test_celebration"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "success" in data, "Response should contain 'success'"
        assert data["success"] == True, "success should be True"
        
        print("✅ Mark celebrated: success")


class TestAdminTirelireStats:
    """Admin Tirelire statistics tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Login as admin"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if login_response.status_code == 200:
            token = login_response.json().get("access_token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip(f"Login failed: {login_response.status_code}")
    
    def test_admin_tirelire_stats_endpoint(self):
        """Test GET /api/admin/tirelire/stats returns statistics"""
        response = self.session.get(f"{BASE_URL}/api/admin/tirelire/stats")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "total_balance" in data, "Response should contain 'total_balance'"
        assert "total_gift_balance" in data, "Response should contain 'total_gift_balance'"
        assert "users_with_balance" in data, "Response should contain 'users_with_balance'"
        assert "recent_transactions" in data, "Response should contain 'recent_transactions'"
        
        assert isinstance(data["total_balance"], (int, float)), "total_balance should be numeric"
        assert isinstance(data["recent_transactions"], list), "recent_transactions should be a list"
        
        print(f"✅ Admin tirelire stats: total_balance={data['total_balance']}€, users_with_balance={data['users_with_balance']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
