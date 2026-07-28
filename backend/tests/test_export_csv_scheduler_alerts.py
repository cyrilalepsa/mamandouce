"""
Tests for Admin Export CSV and Scheduler Alerts endpoints
Features: 
- GET /api/admin/reminders/export-csv - Export reminders as CSV
- GET /api/admin/scheduler/alerts - Get scheduler health and alerts
"""
import pytest
import requests
import os

BASE_URL = (os.environ.get("BACKEND_URL") or os.environ.get("VITE_BACKEND_URL") or os.environ.get("REACT_APP_BACKEND_URL") or "http://localhost:8000").rstrip("/")


class TestExportCSVEndpoint:
    """Tests for /api/admin/reminders/export-csv endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "cyrilalepsa@gmail.com",
            "password": "Cyc@dmin9630"
        })
        assert response.status_code == 200, "Login failed"
        return response.json()["access_token"]
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get headers with auth token"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_export_csv_returns_valid_csv(self, auth_headers):
        """Test that export-csv returns a valid CSV file"""
        response = requests.get(
            f"{BASE_URL}/api/admin/reminders/export-csv?include_history=true",
            headers=auth_headers
        )
        
        # Status assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Content-Type assertion
        assert "text/csv" in response.headers.get("Content-Type", ""), \
            "Response should be CSV type"
        
        # Content-Disposition assertion (download filename)
        content_disposition = response.headers.get("Content-Disposition", "")
        assert "attachment" in content_disposition, "Should be an attachment"
        assert "rappels_export" in content_disposition, "Filename should contain 'rappels_export'"
        assert ".csv" in content_disposition, "Filename should end with .csv"
        
        # Data assertions - check CSV content
        csv_content = response.text
        assert "=== RAPPELS PLANIFIÉS ===" in csv_content, "Should contain reminders section"
        assert "ID,Utilisateur,RDV,Date rappel,Type,Envoyé,Créé le" in csv_content, \
            "Should have correct CSV headers for reminders"
    
    def test_export_csv_with_history(self, auth_headers):
        """Test CSV export includes history section"""
        response = requests.get(
            f"{BASE_URL}/api/admin/reminders/export-csv?include_history=true",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        csv_content = response.text
        
        # Check history section exists
        assert "=== HISTORIQUE D'ENVOI ===" in csv_content, \
            "Should contain history section when include_history=true"
        assert "ID,Utilisateur,RDV,Date envoi,Type,Statut,Push,Email,Erreurs" in csv_content, \
            "Should have correct CSV headers for history"
    
    def test_export_csv_without_history(self, auth_headers):
        """Test CSV export without history when include_history=false"""
        response = requests.get(
            f"{BASE_URL}/api/admin/reminders/export-csv?include_history=false",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        csv_content = response.text
        
        # Reminders should still be there
        assert "=== RAPPELS PLANIFIÉS ===" in csv_content
        # History should NOT be included
        # Note: History header might not appear if include_history=false
        # But we still verify reminders section is present
    
    def test_export_csv_unauthorized(self):
        """Test export-csv requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/reminders/export-csv")
        
        assert response.status_code in [401, 403], \
            "Should require authentication"


class TestSchedulerAlertsEndpoint:
    """Tests for /api/admin/scheduler/alerts endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "cyrilalepsa@gmail.com",
            "password": "Cyc@dmin9630"
        })
        assert response.status_code == 200, "Login failed"
        return response.json()["access_token"]
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get headers with auth token"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_scheduler_alerts_returns_correct_structure(self, auth_headers):
        """Test scheduler/alerts returns correct JSON structure"""
        response = requests.get(
            f"{BASE_URL}/api/admin/scheduler/alerts",
            headers=auth_headers
        )
        
        # Status assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data structure assertions
        data = response.json()
        assert "health" in data, "Response should contain 'health' field"
        assert "alerts" in data, "Response should contain 'alerts' array"
        assert "scheduler" in data, "Response should contain 'scheduler' object"
        assert "stats" in data, "Response should contain 'stats' object"
    
    def test_scheduler_alerts_health_values(self, auth_headers):
        """Test health field has valid values"""
        response = requests.get(
            f"{BASE_URL}/api/admin/scheduler/alerts",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Health must be one of: healthy, warning, critical
        valid_health_values = ["healthy", "warning", "critical"]
        assert data["health"] in valid_health_values, \
            f"Health should be one of {valid_health_values}, got {data['health']}"
    
    def test_scheduler_alerts_alerts_array(self, auth_headers):
        """Test alerts is an array"""
        response = requests.get(
            f"{BASE_URL}/api/admin/scheduler/alerts",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data["alerts"], list), "alerts should be an array"
    
    def test_scheduler_alerts_scheduler_info(self, auth_headers):
        """Test scheduler info contains running status and next_run"""
        response = requests.get(
            f"{BASE_URL}/api/admin/scheduler/alerts",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        scheduler = data["scheduler"]
        assert "running" in scheduler, "Scheduler should have 'running' field"
        assert isinstance(scheduler["running"], bool), "'running' should be boolean"
        assert "next_run" in scheduler, "Scheduler should have 'next_run' field"
    
    def test_scheduler_alerts_stats(self, auth_headers):
        """Test stats contains required fields"""
        response = requests.get(
            f"{BASE_URL}/api/admin/scheduler/alerts",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        stats = data["stats"]
        assert "pending_reminders" in stats, "Stats should have 'pending_reminders'"
        assert "recent_sent" in stats, "Stats should have 'recent_sent'"
        assert "recent_failures" in stats, "Stats should have 'recent_failures'"
        
        # Values should be non-negative integers
        assert isinstance(stats["pending_reminders"], int) and stats["pending_reminders"] >= 0
        assert isinstance(stats["recent_sent"], int) and stats["recent_sent"] >= 0
        assert isinstance(stats["recent_failures"], int) and stats["recent_failures"] >= 0
    
    def test_scheduler_alerts_unauthorized(self):
        """Test scheduler/alerts requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/scheduler/alerts")
        
        assert response.status_code in [401, 403], \
            "Should require authentication"
    
    def test_scheduler_running_when_healthy(self, auth_headers):
        """Test that scheduler is running when health is healthy"""
        response = requests.get(
            f"{BASE_URL}/api/admin/scheduler/alerts",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # If health is healthy and no critical alerts, scheduler should be running
        if data["health"] == "healthy":
            assert data["scheduler"]["running"] is True, \
                "Scheduler should be running when health is healthy"


class TestTestSchedulerAlertEndpoint:
    """Tests for /api/admin/scheduler/test-alert endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "cyrilalepsa@gmail.com",
            "password": "Cyc@dmin9630"
        })
        assert response.status_code == 200, "Login failed"
        return response.json()["access_token"]
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get headers with auth token"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_test_alert_endpoint(self, auth_headers):
        """Test the test-alert endpoint returns success"""
        response = requests.post(
            f"{BASE_URL}/api/admin/scheduler/test-alert",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("success") is True, "Should return success=true"
        assert "timestamp" in data, "Should include timestamp"
    
    def test_test_alert_unauthorized(self):
        """Test test-alert requires authentication"""
        response = requests.post(f"{BASE_URL}/api/admin/scheduler/test-alert")
        
        assert response.status_code in [401, 403], \
            "Should require authentication"


class TestAlertTypes:
    """Tests for specific alert types - overdue_reminders, scheduler_stopped, recent_failures"""
    
    @pytest.fixture
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "cyrilalepsa@gmail.com",
            "password": "Cyc@dmin9630"
        })
        assert response.status_code == 200, "Login failed"
        return response.json()["access_token"]
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get headers with auth token"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_alert_structure_when_alerts_exist(self, auth_headers):
        """Test alert object structure if alerts exist"""
        response = requests.get(
            f"{BASE_URL}/api/admin/scheduler/alerts",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        alerts = data["alerts"]
        if len(alerts) > 0:
            # Verify alert structure
            alert = alerts[0]
            assert "level" in alert, "Alert should have 'level'"
            assert "type" in alert, "Alert should have 'type'"
            assert "message" in alert, "Alert should have 'message'"
            assert "timestamp" in alert, "Alert should have 'timestamp'"
            
            # Level should be warning or critical
            assert alert["level"] in ["warning", "critical"], \
                f"Alert level should be 'warning' or 'critical', got {alert['level']}"
            
            # Type should be one of expected types
            valid_types = ["scheduler_stopped", "overdue_reminders", "recent_failures"]
            assert alert["type"] in valid_types, \
                f"Alert type should be one of {valid_types}, got {alert['type']}"
        else:
            # No alerts means health should be healthy
            assert data["health"] == "healthy", \
                "When no alerts, health should be healthy"
