"""
Test Medical Reminder APIs for MamanDouce
Tests: GET /api/medical/scheduled-reminders, POST /api/medical/schedule-reminder, DELETE /api/medical/reminder/{id}
"""
import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "cyrilalepsa@gmail.com"
TEST_PASSWORD = "Cyc@dmin9630"


class TestMedicalReminderAPIs:
    """Test scheduled reminders for medical appointments"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if response.status_code == 200:
            token_data = response.json()
            self.token = token_data.get("access_token")
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        else:
            pytest.skip(f"Authentication failed with status {response.status_code}")
    
    def test_get_scheduled_reminders(self):
        """Test GET /api/medical/scheduled-reminders - retrieve all reminders"""
        response = self.session.get(f"{BASE_URL}/api/medical/scheduled-reminders")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "reminders" in data, "Response should contain 'reminders' key"
        assert isinstance(data["reminders"], list), "reminders should be a list"
        
        print(f"✓ GET scheduled-reminders: Found {len(data['reminders'])} reminders")
        
        # If there are reminders, validate their structure
        if data["reminders"]:
            reminder = data["reminders"][0]
            assert "appointment_id" in reminder, "Reminder should have appointment_id"
            assert "reminder_datetime" in reminder, "Reminder should have reminder_datetime"
            print(f"  - First reminder for: {reminder.get('appointment_title', 'N/A')}")
    
    def test_schedule_reminder_for_appointment(self):
        """Test POST /api/medical/schedule-reminder - create a new reminder"""
        # Schedule reminder for apt_2 (Échographie T1 - 11-13 weeks)
        reminder_date = (datetime.now() + timedelta(days=7)).isoformat()
        
        response = self.session.post(f"{BASE_URL}/api/medical/schedule-reminder", json={
            "appointment_id": "apt_2",
            "reminder_datetime": reminder_date,
            "reminder_type": "push"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Response should indicate success"
        assert "message" in data, "Response should contain message"
        
        print(f"✓ POST schedule-reminder: {data.get('message')}")
        
        # Verify reminder was created by fetching all reminders
        verify_response = self.session.get(f"{BASE_URL}/api/medical/scheduled-reminders")
        assert verify_response.status_code == 200
        
        reminders = verify_response.json().get("reminders", [])
        apt_2_reminder = next((r for r in reminders if r["appointment_id"] == "apt_2"), None)
        assert apt_2_reminder is not None, "Reminder for apt_2 should exist after creation"
        print(f"  - Verified: Reminder exists for apt_2")
    
    def test_schedule_reminder_invalid_appointment(self):
        """Test POST /api/medical/schedule-reminder - with invalid appointment ID"""
        reminder_date = (datetime.now() + timedelta(days=7)).isoformat()
        
        response = self.session.post(f"{BASE_URL}/api/medical/schedule-reminder", json={
            "appointment_id": "invalid_apt_999",
            "reminder_datetime": reminder_date,
            "reminder_type": "push"
        })
        
        assert response.status_code == 404, f"Expected 404 for invalid appointment, got {response.status_code}"
        print("✓ POST schedule-reminder with invalid appointment: Returns 404 as expected")
    
    def test_schedule_reminder_missing_fields(self):
        """Test POST /api/medical/schedule-reminder - with missing required fields"""
        response = self.session.post(f"{BASE_URL}/api/medical/schedule-reminder", json={
            "appointment_id": "apt_1"
            # Missing reminder_datetime
        })
        
        assert response.status_code == 400, f"Expected 400 for missing fields, got {response.status_code}"
        print("✓ POST schedule-reminder missing fields: Returns 400 as expected")
    
    def test_delete_reminder(self):
        """Test DELETE /api/medical/reminder/{appointment_id} - delete a reminder"""
        # First create a reminder for apt_3
        reminder_date = (datetime.now() + timedelta(days=14)).isoformat()
        
        create_response = self.session.post(f"{BASE_URL}/api/medical/schedule-reminder", json={
            "appointment_id": "apt_3",
            "reminder_datetime": reminder_date,
            "reminder_type": "push"
        })
        
        assert create_response.status_code == 200, f"Failed to create reminder: {create_response.text}"
        print("  - Created reminder for apt_3")
        
        # Now delete it
        delete_response = self.session.delete(f"{BASE_URL}/api/medical/reminder/apt_3")
        
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}: {delete_response.text}"
        
        data = delete_response.json()
        assert data.get("success") == True, "Response should indicate success"
        
        print(f"✓ DELETE reminder: {data.get('message')}")
        
        # Verify reminder was deleted
        verify_response = self.session.get(f"{BASE_URL}/api/medical/scheduled-reminders")
        reminders = verify_response.json().get("reminders", [])
        apt_3_reminder = next((r for r in reminders if r["appointment_id"] == "apt_3"), None)
        assert apt_3_reminder is None, "Reminder for apt_3 should no longer exist"
        print("  - Verified: Reminder deleted successfully")
    
    def test_delete_nonexistent_reminder(self):
        """Test DELETE /api/medical/reminder/{id} - for non-existent reminder"""
        response = self.session.delete(f"{BASE_URL}/api/medical/reminder/nonexistent_apt")
        
        assert response.status_code == 404, f"Expected 404 for non-existent reminder, got {response.status_code}"
        print("✓ DELETE non-existent reminder: Returns 404 as expected")
    
    def test_update_existing_reminder(self):
        """Test POST /api/medical/schedule-reminder - update existing reminder"""
        # Create initial reminder for apt_4
        initial_date = (datetime.now() + timedelta(days=10)).isoformat()
        
        response1 = self.session.post(f"{BASE_URL}/api/medical/schedule-reminder", json={
            "appointment_id": "apt_4",
            "reminder_datetime": initial_date,
            "reminder_type": "push"
        })
        assert response1.status_code == 200
        print("  - Created initial reminder for apt_4")
        
        # Update with new date
        new_date = (datetime.now() + timedelta(days=15)).isoformat()
        
        response2 = self.session.post(f"{BASE_URL}/api/medical/schedule-reminder", json={
            "appointment_id": "apt_4",
            "reminder_datetime": new_date,
            "reminder_type": "both"
        })
        
        assert response2.status_code == 200, f"Expected 200, got {response2.status_code}"
        data = response2.json()
        assert "mis à jour" in data.get("message", "").lower() or data.get("success") == True
        
        print(f"✓ Update existing reminder: {data.get('message')}")
        
        # Cleanup - delete the reminder
        self.session.delete(f"{BASE_URL}/api/medical/reminder/apt_4")


class TestMedicalAppointmentsIntegration:
    """Test medical appointments list includes reminder status"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if response.status_code == 200:
            token_data = response.json()
            self.token = token_data.get("access_token")
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        else:
            pytest.skip("Authentication failed")
    
    def test_get_medical_appointments(self):
        """Test GET /api/medical/appointments returns appointment list"""
        response = self.session.get(f"{BASE_URL}/api/medical/appointments")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "appointments" in data, "Response should contain appointments"
        
        if data["appointments"]:
            apt = data["appointments"][0]
            assert "id" in apt, "Appointment should have id"
            assert "title" in apt, "Appointment should have title"
            assert "week_start" in apt, "Appointment should have week_start"
            print(f"✓ GET appointments: Found {len(data['appointments'])} appointments")
            print(f"  - Current week: {data.get('current_week', 'N/A')}")
        else:
            print("✓ GET appointments: No appointments (pregnancy profile may not be configured)")


class TestMessageNotificationBadge:
    """Test unread messages count for notification badge"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if response.status_code == 200:
            token_data = response.json()
            self.token = token_data.get("access_token")
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        else:
            pytest.skip("Authentication failed")
    
    def test_get_my_messages_includes_unread_count(self):
        """Test GET /api/contact/my-messages returns unread_replies count"""
        response = self.session.get(f"{BASE_URL}/api/contact/my-messages")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "unread_replies" in data, "Response should contain unread_replies count"
        assert isinstance(data["unread_replies"], int), "unread_replies should be an integer"
        
        print(f"✓ GET my-messages: unread_replies = {data['unread_replies']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
