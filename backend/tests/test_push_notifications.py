"""
Test Push Notifications API endpoints for MamanDouce
Tests: notification preferences, VAPID key, push subscription
"""
import pytest
import requests
import os
import uuid

BASE_URL = (os.environ.get("BACKEND_URL") or os.environ.get("VITE_BACKEND_URL") or os.environ.get("REACT_APP_BACKEND_URL") or "http://localhost:8000").rstrip("/")

# Test credentials
TEST_EMAIL = "cyrilalepsa@gmail.com"
TEST_PASSWORD = "Cyc@dmin9630"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for testing"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    if response.status_code != 200:
        pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")
    return response.json().get("access_token")


@pytest.fixture
def auth_headers(auth_token):
    """Headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestVapidPublicKey:
    """Test VAPID public key endpoint"""
    
    def test_get_vapid_public_key_success(self):
        """GET /api/notifications/vapid-public-key should return VAPID public key"""
        response = requests.get(f"{BASE_URL}/api/notifications/vapid-public-key")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "publicKey" in data, "Response should contain publicKey field"
        assert isinstance(data["publicKey"], str), "publicKey should be a string"
        assert len(data["publicKey"]) > 50, "publicKey should be a valid VAPID key (>50 chars)"


class TestNotificationPreferences:
    """Test notification preferences CRUD"""
    
    def test_get_notification_preferences_success(self, auth_headers):
        """GET /api/notifications/preferences should return user preferences including push fields"""
        response = requests.get(
            f"{BASE_URL}/api/notifications/preferences",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Check email notification fields exist
        assert "email_notifications" in data, "Should have email_notifications field"
        assert "weekly_tips" in data, "Should have weekly_tips field"
        assert "appointment_reminders" in data, "Should have appointment_reminders field"
        
        # Check push notification fields exist (new fields)
        assert "push_enabled" in data, "Should have push_enabled field"
        assert "push_weekly_tips" in data, "Should have push_weekly_tips field"
        assert "push_appointment_reminders" in data, "Should have push_appointment_reminders field"
        assert "push_appointment_24h" in data, "Should have push_appointment_24h field"
        assert "push_appointment_day" in data, "Should have push_appointment_day field"
        
        # Verify types
        assert isinstance(data["push_enabled"], bool), "push_enabled should be boolean"
        assert isinstance(data["push_weekly_tips"], bool), "push_weekly_tips should be boolean"
        assert isinstance(data["push_appointment_reminders"], bool), "push_appointment_reminders should be boolean"
        assert isinstance(data["push_appointment_24h"], bool), "push_appointment_24h should be boolean"
        assert isinstance(data["push_appointment_day"], bool), "push_appointment_day should be boolean"
    
    def test_get_notification_preferences_without_auth_fails(self):
        """GET /api/notifications/preferences without auth should fail"""
        response = requests.get(f"{BASE_URL}/api/notifications/preferences")
        
        # Should be unauthorized
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_update_notification_preferences_success(self, auth_headers):
        """POST /api/notifications/preferences should update preferences"""
        # First get current preferences
        get_response = requests.get(
            f"{BASE_URL}/api/notifications/preferences",
            headers=auth_headers
        )
        assert get_response.status_code == 200
        original_prefs = get_response.json()
        
        # Update with new preferences
        new_prefs = {
            "email_notifications": True,
            "weekly_tips": True,
            "appointment_reminders": True,
            "email_address": TEST_EMAIL,
            "push_enabled": True,
            "push_weekly_tips": False,  # Change this value
            "push_appointment_reminders": True,
            "push_appointment_24h": True,
            "push_appointment_day": False  # Change this value
        }
        
        post_response = requests.post(
            f"{BASE_URL}/api/notifications/preferences",
            headers=auth_headers,
            json=new_prefs
        )
        
        assert post_response.status_code == 200, f"Expected 200, got {post_response.status_code}: {post_response.text}"
        
        data = post_response.json()
        assert data.get("success") == True, "Response should indicate success"
        
        # Verify preferences were saved by fetching again
        verify_response = requests.get(
            f"{BASE_URL}/api/notifications/preferences",
            headers=auth_headers
        )
        assert verify_response.status_code == 200
        
        saved_prefs = verify_response.json()
        assert saved_prefs["push_weekly_tips"] == False, "push_weekly_tips should be updated to False"
        assert saved_prefs["push_appointment_day"] == False, "push_appointment_day should be updated to False"
        assert saved_prefs["push_enabled"] == True, "push_enabled should be updated to True"
        
        # Restore original preferences
        restore_prefs = {
            "email_notifications": original_prefs.get("email_notifications", True),
            "weekly_tips": original_prefs.get("weekly_tips", True),
            "appointment_reminders": original_prefs.get("appointment_reminders", True),
            "email_address": original_prefs.get("email_address", TEST_EMAIL),
            "push_enabled": original_prefs.get("push_enabled", False),
            "push_weekly_tips": original_prefs.get("push_weekly_tips", True),
            "push_appointment_reminders": original_prefs.get("push_appointment_reminders", True),
            "push_appointment_24h": original_prefs.get("push_appointment_24h", True),
            "push_appointment_day": original_prefs.get("push_appointment_day", True)
        }
        
        requests.post(
            f"{BASE_URL}/api/notifications/preferences",
            headers=auth_headers,
            json=restore_prefs
        )


class TestPushSubscription:
    """Test push subscription endpoint"""
    
    def test_subscribe_to_push_success(self, auth_headers):
        """POST /api/notifications/subscribe should register a push subscription"""
        # Create a mock subscription (real subscription requires browser)
        test_subscription = {
            "subscription": {
                "endpoint": f"https://fcm.googleapis.com/fcm/send/TEST_{uuid.uuid4().hex[:8]}",
                "keys": {
                    "p256dh": "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM",
                    "auth": "tBHItJI5svbpez7KI4CCXg"
                }
            }
        }
        
        response = requests.post(
            f"{BASE_URL}/api/notifications/subscribe",
            headers=auth_headers,
            json=test_subscription
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Response should indicate success"
        assert "message" in data, "Response should have a message"
    
    def test_subscribe_without_auth_fails(self):
        """POST /api/notifications/subscribe without auth should fail"""
        test_subscription = {
            "subscription": {
                "endpoint": "https://fcm.googleapis.com/fcm/send/TEST_no_auth",
                "keys": {
                    "p256dh": "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM",
                    "auth": "tBHItJI5svbpez7KI4CCXg"
                }
            }
        }
        
        response = requests.post(
            f"{BASE_URL}/api/notifications/subscribe",
            json=test_subscription
        )
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_unsubscribe_from_push_success(self, auth_headers):
        """POST /api/notifications/unsubscribe should remove a subscription"""
        # First subscribe
        unique_endpoint = f"https://fcm.googleapis.com/fcm/send/TEST_UNSUB_{uuid.uuid4().hex[:8]}"
        test_subscription = {
            "subscription": {
                "endpoint": unique_endpoint,
                "keys": {
                    "p256dh": "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM",
                    "auth": "tBHItJI5svbpez7KI4CCXg"
                }
            }
        }
        
        # Subscribe first
        sub_response = requests.post(
            f"{BASE_URL}/api/notifications/subscribe",
            headers=auth_headers,
            json=test_subscription
        )
        assert sub_response.status_code == 200
        
        # Now unsubscribe
        unsub_response = requests.post(
            f"{BASE_URL}/api/notifications/unsubscribe",
            headers=auth_headers,
            json=test_subscription
        )
        
        assert unsub_response.status_code == 200, f"Expected 200, got {unsub_response.status_code}: {unsub_response.text}"
        
        data = unsub_response.json()
        assert data.get("success") == True, "Response should indicate success"


class TestHealthCheck:
    """Basic API health check"""
    
    def test_health_endpoint(self):
        """GET /api/health should return ok status"""
        response = requests.get(f"{BASE_URL}/api/health")
        
        assert response.status_code == 200, f"Health check failed: {response.status_code}"
        assert response.json().get("status") == "ok"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
