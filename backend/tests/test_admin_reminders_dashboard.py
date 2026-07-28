"""
Backend tests for Admin Reminders Dashboard feature
Tests: GET /api/admin/reminders/dashboard, GET /api/admin/reminders/history, POST /api/admin/reminders/send-now
"""
import pytest
import requests
import os
import uuid

BASE_URL = (os.environ.get("BACKEND_URL") or os.environ.get("VITE_BACKEND_URL") or os.environ.get("REACT_APP_BACKEND_URL") or "http://localhost:8000").rstrip("/")
AUTH_EMAIL = "cyrilalepsa@gmail.com"
AUTH_PASSWORD = "Cyc@dmin9630"


class TestAdminRemindersDashboard:
    """Test admin reminders dashboard endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": AUTH_EMAIL,
            "password": AUTH_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Authentication failed: {response.status_code}")
        return response.json().get("access_token")
    
    @pytest.fixture
    def auth_headers(self, admin_token):
        """Get auth headers for API calls"""
        return {"Authorization": f"Bearer {admin_token}"}
    
    def test_get_reminders_dashboard_success(self, auth_headers):
        """Test GET /api/admin/reminders/dashboard returns correct data structure"""
        response = requests.get(f"{BASE_URL}/api/admin/reminders/dashboard", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Check stats structure
        assert "stats" in data, "Response should contain 'stats'"
        stats = data["stats"]
        assert "total" in stats, "Stats should contain 'total'"
        assert "pending" in stats, "Stats should contain 'pending'"
        assert "sent" in stats, "Stats should contain 'sent'"
        assert "due_now" in stats, "Stats should contain 'due_now'"
        assert "by_type" in stats, "Stats should contain 'by_type'"
        
        # Check by_type structure
        by_type = stats["by_type"]
        assert "push" in by_type, "by_type should contain 'push'"
        assert "email" in by_type, "by_type should contain 'email'"
        assert "both" in by_type, "by_type should contain 'both'"
        
        # Check scheduler structure
        assert "scheduler" in data, "Response should contain 'scheduler'"
        scheduler = data["scheduler"]
        assert "running" in scheduler, "Scheduler should contain 'running' status"
        assert "jobs" in scheduler, "Scheduler should contain 'jobs'"
        
        # Check users_with_reminders
        assert "users_with_reminders" in data, "Response should contain 'users_with_reminders'"
        
        # Check recent_reminders
        assert "recent_reminders" in data, "Response should contain 'recent_reminders'"
        
        # Check history
        assert "history" in data, "Response should contain 'history'"
        
        print(f"Dashboard loaded successfully with stats: {stats}")
    
    def test_get_reminders_dashboard_scheduler_status(self, auth_headers):
        """Test scheduler status field contains running boolean"""
        response = requests.get(f"{BASE_URL}/api/admin/reminders/dashboard", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        scheduler = data.get("scheduler", {})
        assert isinstance(scheduler.get("running"), bool), "Scheduler 'running' should be a boolean"
        print(f"Scheduler running: {scheduler.get('running')}")
        
        # Check jobs structure if present
        jobs = scheduler.get("jobs", [])
        for job in jobs:
            assert "id" in job, "Job should have 'id'"
            assert "name" in job, "Job should have 'name'"
            if job.get("next_run"):
                print(f"Next run time: {job.get('next_run')}")
    
    def test_get_reminders_history_success(self, auth_headers):
        """Test GET /api/admin/reminders/history returns correct data structure"""
        response = requests.get(f"{BASE_URL}/api/admin/reminders/history", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Check history array
        assert "history" in data, "Response should contain 'history'"
        assert isinstance(data["history"], list), "History should be a list"
        
        # Check stats structure
        assert "stats" in data, "Response should contain 'stats'"
        stats = data["stats"]
        assert "total" in stats, "Stats should contain 'total'"
        assert "success" in stats, "Stats should contain 'success'"
        assert "failed" in stats, "Stats should contain 'failed'"
        assert "partial" in stats, "Stats should contain 'partial'"
        assert "success_rate" in stats, "Stats should contain 'success_rate'"
        
        print(f"History stats: {stats}")
    
    def test_get_reminders_history_with_limit(self, auth_headers):
        """Test GET /api/admin/reminders/history with limit parameter"""
        response = requests.get(f"{BASE_URL}/api/admin/reminders/history?limit=5", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        history = data.get("history", [])
        assert len(history) <= 5, f"History should be limited to 5 items, got {len(history)}"
    
    def test_get_all_reminders_default(self, auth_headers):
        """Test GET /api/admin/reminders/all returns all reminders"""
        response = requests.get(f"{BASE_URL}/api/admin/reminders/all", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "reminders" in data, "Response should contain 'reminders'"
        assert "total" in data, "Response should contain 'total'"
        assert "filter" in data, "Response should contain 'filter'"
        assert data["filter"] == "all", f"Expected filter 'all', got {data['filter']}"
    
    def test_get_all_reminders_pending_filter(self, auth_headers):
        """Test GET /api/admin/reminders/all with pending filter"""
        response = requests.get(f"{BASE_URL}/api/admin/reminders/all?status=pending", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["filter"] == "pending", f"Expected filter 'pending', got {data['filter']}"
        
        # Verify all returned reminders are not sent
        for reminder in data.get("reminders", []):
            assert reminder.get("sent") == False, "Pending reminders should have sent=False"
    
    def test_get_all_reminders_sent_filter(self, auth_headers):
        """Test GET /api/admin/reminders/all with sent filter"""
        response = requests.get(f"{BASE_URL}/api/admin/reminders/all?status=sent", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["filter"] == "sent", f"Expected filter 'sent', got {data['filter']}"
        
        # Verify all returned reminders are sent
        for reminder in data.get("reminders", []):
            assert reminder.get("sent") == True, "Sent reminders should have sent=True"
    
    def test_send_due_reminders_success(self, auth_headers):
        """Test POST /api/admin/reminders/send-now works"""
        response = requests.post(f"{BASE_URL}/api/admin/reminders/send-now", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Response should indicate success"
        assert "message" in data, "Response should contain message"
        print(f"Send now response: {data.get('message')}")
    
    def test_delete_reminder_not_found(self, auth_headers):
        """Test DELETE /api/admin/reminders/{id} returns 404 for non-existent reminder"""
        fake_id = str(uuid.uuid4())
        response = requests.delete(f"{BASE_URL}/api/admin/reminders/{fake_id}", headers=auth_headers)
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    def test_dashboard_unauthorized(self):
        """Test dashboard returns 401 without auth token"""
        response = requests.get(f"{BASE_URL}/api/admin/reminders/dashboard")
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_history_unauthorized(self):
        """Test history returns 401 without auth token"""
        response = requests.get(f"{BASE_URL}/api/admin/reminders/history")
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"


class TestAdminDashboardDataIntegrity:
    """Test data integrity and consistency across dashboard endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": AUTH_EMAIL,
            "password": AUTH_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Authentication failed: {response.status_code}")
        return response.json().get("access_token")
    
    @pytest.fixture
    def auth_headers(self, admin_token):
        """Get auth headers for API calls"""
        return {"Authorization": f"Bearer {admin_token}"}
    
    def test_stats_total_equals_pending_plus_sent(self, auth_headers):
        """Verify total = pending + sent in stats"""
        response = requests.get(f"{BASE_URL}/api/admin/reminders/dashboard", headers=auth_headers)
        
        assert response.status_code == 200
        stats = response.json().get("stats", {})
        
        total = stats.get("total", 0)
        pending = stats.get("pending", 0)
        sent = stats.get("sent", 0)
        
        assert total == pending + sent, f"Total ({total}) should equal pending ({pending}) + sent ({sent})"
        print(f"Stats consistency check passed: {total} = {pending} + {sent}")
    
    def test_by_type_sums_to_total(self, auth_headers):
        """Verify by_type counts sum to total"""
        response = requests.get(f"{BASE_URL}/api/admin/reminders/dashboard", headers=auth_headers)
        
        assert response.status_code == 200
        stats = response.json().get("stats", {})
        
        total = stats.get("total", 0)
        by_type = stats.get("by_type", {})
        
        type_sum = by_type.get("push", 0) + by_type.get("email", 0) + by_type.get("both", 0)
        
        assert type_sum == total, f"Type sum ({type_sum}) should equal total ({total})"
        print(f"Type distribution: push={by_type.get('push')}, email={by_type.get('email')}, both={by_type.get('both')}")
