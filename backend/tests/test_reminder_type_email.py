"""
Test module for reminder type email feature
Tests: schedule-reminder with reminder_type parameter (push, email, both)
"""
import pytest
import requests
import os

BASE_URL = (os.environ.get("BACKEND_URL") or os.environ.get("VITE_BACKEND_URL") or os.environ.get("REACT_APP_BACKEND_URL") or "http://localhost:8000").rstrip("/")

# Test credentials
TEST_EMAIL = "cyrilalepsa@gmail.com"
TEST_PASSWORD = "Cyc@dmin9630"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    assert response.status_code == 200, f"Login failed: {response.text}"
    data = response.json()
    assert "access_token" in data
    return data["access_token"]


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Get authentication headers"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestReminderTypeParameter:
    """Tests for reminder_type parameter in schedule-reminder API"""

    def test_schedule_reminder_with_both_type(self, auth_headers):
        """Test scheduling reminder with 'both' type (push + email)"""
        from datetime import datetime, timedelta
        
        reminder_datetime = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%dT10:00:00")
        
        response = requests.post(
            f"{BASE_URL}/api/medical/schedule-reminder",
            json={
                "appointment_id": "apt_2",
                "reminder_datetime": reminder_datetime,
                "reminder_type": "both"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data["success"] is True
        print(f"✅ Schedule reminder with 'both' type: PASSED")
    
    def test_schedule_reminder_with_push_only(self, auth_headers):
        """Test scheduling reminder with 'push' type only"""
        from datetime import datetime, timedelta
        
        reminder_datetime = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%dT09:00:00")
        
        response = requests.post(
            f"{BASE_URL}/api/medical/schedule-reminder",
            json={
                "appointment_id": "apt_3",
                "reminder_datetime": reminder_datetime,
                "reminder_type": "push"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data["success"] is True
        print(f"✅ Schedule reminder with 'push' type: PASSED")

    def test_schedule_reminder_with_email_only(self, auth_headers):
        """Test scheduling reminder with 'email' type only"""
        from datetime import datetime, timedelta
        
        reminder_datetime = (datetime.now() + timedelta(days=4)).strftime("%Y-%m-%dT11:00:00")
        
        response = requests.post(
            f"{BASE_URL}/api/medical/schedule-reminder",
            json={
                "appointment_id": "apt_4",
                "reminder_datetime": reminder_datetime,
                "reminder_type": "email"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data["success"] is True
        print(f"✅ Schedule reminder with 'email' type: PASSED")

    def test_verify_reminder_type_stored_correctly(self, auth_headers):
        """Verify that reminder_type is stored and returned correctly"""
        response = requests.get(
            f"{BASE_URL}/api/medical/scheduled-reminders",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        reminders = data.get("reminders", [])
        
        # Check if reminder types are stored
        for reminder in reminders:
            if reminder.get("appointment_id") == "apt_2":
                assert reminder.get("reminder_type") == "both", f"Expected 'both', got {reminder.get('reminder_type')}"
                print(f"✅ Reminder apt_2 has type 'both': PASSED")
            elif reminder.get("appointment_id") == "apt_3":
                assert reminder.get("reminder_type") == "push", f"Expected 'push', got {reminder.get('reminder_type')}"
                print(f"✅ Reminder apt_3 has type 'push': PASSED")
            elif reminder.get("appointment_id") == "apt_4":
                assert reminder.get("reminder_type") == "email", f"Expected 'email', got {reminder.get('reminder_type')}"
                print(f"✅ Reminder apt_4 has type 'email': PASSED")

    def test_update_reminder_type(self, auth_headers):
        """Test updating an existing reminder's type"""
        from datetime import datetime, timedelta
        
        reminder_datetime = (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%dT14:00:00")
        
        # Update apt_2's reminder from 'both' to 'email'
        response = requests.post(
            f"{BASE_URL}/api/medical/schedule-reminder",
            json={
                "appointment_id": "apt_2",
                "reminder_datetime": reminder_datetime,
                "reminder_type": "email"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data["success"] is True
        
        # Verify the update
        response = requests.get(
            f"{BASE_URL}/api/medical/scheduled-reminders",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        reminders = response.json().get("reminders", [])
        apt_2_reminder = next((r for r in reminders if r.get("appointment_id") == "apt_2"), None)
        
        assert apt_2_reminder is not None
        assert apt_2_reminder.get("reminder_type") == "email"
        print(f"✅ Update reminder type: PASSED")


class TestReminderAPIValidation:
    """Tests for API validation"""
    
    def test_schedule_reminder_missing_appointment_id(self, auth_headers):
        """Test that missing appointment_id returns 400"""
        from datetime import datetime, timedelta
        
        reminder_datetime = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%dT10:00:00")
        
        response = requests.post(
            f"{BASE_URL}/api/medical/schedule-reminder",
            json={
                "reminder_datetime": reminder_datetime,
                "reminder_type": "push"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print(f"✅ Missing appointment_id returns 400: PASSED")

    def test_schedule_reminder_invalid_appointment(self, auth_headers):
        """Test that invalid appointment_id returns 404"""
        from datetime import datetime, timedelta
        
        reminder_datetime = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%dT10:00:00")
        
        response = requests.post(
            f"{BASE_URL}/api/medical/schedule-reminder",
            json={
                "appointment_id": "invalid_apt_999",
                "reminder_datetime": reminder_datetime,
                "reminder_type": "push"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✅ Invalid appointment_id returns 404: PASSED")


class TestCleanup:
    """Cleanup test data"""
    
    def test_cleanup_reminders(self, auth_headers):
        """Delete test reminders"""
        for apt_id in ["apt_2", "apt_3", "apt_4"]:
            response = requests.delete(
                f"{BASE_URL}/api/medical/reminder/{apt_id}",
                headers=auth_headers
            )
            # May return 404 if already deleted or not found
            if response.status_code in [200, 404]:
                print(f"✅ Cleanup reminder {apt_id}: PASSED")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
