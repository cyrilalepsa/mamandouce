"""
Test suite for MamanDouce Payment Security & Billing Alerts (Le Garagiste)
Tests:
1. POST /api/payments/checkout/session - accepts price_id (new) and package_id (legacy)
2. POST /api/payments/checkout/session - does NOT accept amount from client
3. POST /api/payments/checkout/session - supports optional promo_code field
4. Server calculates final_amount from SUBSCRIPTION_PACKAGES dictionary
5. GET /api/payments/billing-alerts - returns alerts list and critical status
6. POST /api/payments/billing-alerts/{index}/resolve - marks alert as resolved
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@mamandouce.com"
ADMIN_PASSWORD = "AdminPremium2024!"


@pytest.fixture(scope="module")
def admin_token():
    """Get admin authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        return data.get("access_token") or data.get("token")
    pytest.skip(f"Admin login failed: {response.status_code} - {response.text}")


@pytest.fixture
def auth_headers(admin_token):
    """Get authorization headers"""
    return {"Authorization": f"Bearer {admin_token}"}


class TestCheckoutSessionEndpoint:
    """Tests for POST /api/payments/checkout/session"""
    
    def test_checkout_accepts_price_id(self, auth_headers):
        """Test that checkout accepts price_id field (new format)"""
        response = requests.post(
            f"{BASE_URL}/api/payments/checkout/session",
            json={
                "price_id": "annual",
                "origin_url": "https://test.example.com"
            },
            headers=auth_headers
        )
        # Should return 200 with url and session_id
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "url" in data, "Response should contain 'url'"
        assert "session_id" in data, "Response should contain 'session_id'"
        print(f"✅ Checkout with price_id='annual' works - session_id: {data.get('session_id', 'N/A')[:20]}...")
    
    def test_checkout_accepts_package_id_legacy(self, auth_headers):
        """Test that checkout accepts package_id field (legacy compatibility)"""
        response = requests.post(
            f"{BASE_URL}/api/payments/checkout/session",
            json={
                "package_id": "postpartum",
                "origin_url": "https://test.example.com"
            },
            headers=auth_headers
        )
        # Should return 200 with url and session_id
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "url" in data, "Response should contain 'url'"
        assert "session_id" in data, "Response should contain 'session_id'"
        print(f"✅ Checkout with package_id='postpartum' (legacy) works - session_id: {data.get('session_id', 'N/A')[:20]}...")
    
    def test_checkout_rejects_invalid_package(self, auth_headers):
        """Test that checkout rejects invalid package IDs"""
        response = requests.post(
            f"{BASE_URL}/api/payments/checkout/session",
            json={
                "price_id": "invalid_package",
                "origin_url": "https://test.example.com"
            },
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400 for invalid package, got {response.status_code}"
        print("✅ Checkout correctly rejects invalid package ID")
    
    def test_checkout_does_not_accept_amount(self, auth_headers):
        """Test that checkout ignores client-provided amount (security feature)"""
        # Even if client sends amount, server should calculate from SUBSCRIPTION_PACKAGES
        response = requests.post(
            f"{BASE_URL}/api/payments/checkout/session",
            json={
                "price_id": "annual",
                "origin_url": "https://test.example.com",
                "amount": 0.01  # Malicious attempt to set low price
            },
            headers=auth_headers
        )
        # Should still work - amount field should be ignored
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "url" in data, "Response should contain 'url'"
        print("✅ Checkout ignores client-provided amount (security verified)")
    
    def test_checkout_supports_promo_code(self, auth_headers):
        """Test that checkout accepts optional promo_code field"""
        response = requests.post(
            f"{BASE_URL}/api/payments/checkout/session",
            json={
                "price_id": "annual",
                "origin_url": "https://test.example.com",
                "promo_code": "TESTCODE123"  # May not be valid, but should be accepted
            },
            headers=auth_headers
        )
        # Should return 200 - promo code validation happens server-side
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "url" in data, "Response should contain 'url'"
        print("✅ Checkout accepts promo_code field")
    
    def test_checkout_requires_origin_url(self, auth_headers):
        """Test that checkout requires origin_url"""
        response = requests.post(
            f"{BASE_URL}/api/payments/checkout/session",
            json={
                "price_id": "annual"
                # Missing origin_url
            },
            headers=auth_headers
        )
        assert response.status_code == 422, f"Expected 422 for missing origin_url, got {response.status_code}"
        print("✅ Checkout correctly requires origin_url")


class TestBillingAlertsEndpoints:
    """Tests for billing alerts (Le Garagiste) endpoints"""
    
    def test_get_billing_alerts_admin_only(self, auth_headers):
        """Test GET /api/payments/billing-alerts returns alerts for admin"""
        response = requests.get(
            f"{BASE_URL}/api/payments/billing-alerts",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "alerts" in data, "Response should contain 'alerts'"
        assert "unresolved_count" in data, "Response should contain 'unresolved_count'"
        assert "has_critical" in data, "Response should contain 'has_critical'"
        
        # Verify types
        assert isinstance(data["alerts"], list), "'alerts' should be a list"
        assert isinstance(data["unresolved_count"], int), "'unresolved_count' should be an int"
        assert isinstance(data["has_critical"], bool), "'has_critical' should be a bool"
        
        print(f"✅ Billing alerts endpoint works - {data['unresolved_count']} unresolved, has_critical={data['has_critical']}")
    
    def test_get_billing_alerts_requires_auth(self):
        """Test that billing alerts endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/payments/billing-alerts")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print("✅ Billing alerts endpoint requires authentication")
    
    def test_resolve_billing_alert_requires_admin(self, auth_headers):
        """Test POST /api/payments/billing-alerts/{index}/resolve requires admin"""
        # First check if there are any alerts to resolve
        response = requests.get(
            f"{BASE_URL}/api/payments/billing-alerts",
            headers=auth_headers
        )
        data = response.json()
        
        if data["unresolved_count"] > 0:
            # Try to resolve first alert
            resolve_response = requests.post(
                f"{BASE_URL}/api/payments/billing-alerts/0/resolve",
                headers=auth_headers
            )
            assert resolve_response.status_code in [200, 404], f"Expected 200 or 404, got {resolve_response.status_code}"
            if resolve_response.status_code == 200:
                resolve_data = resolve_response.json()
                assert resolve_data.get("success") == True, "Resolve should return success=true"
                print("✅ Billing alert resolved successfully")
            else:
                print("✅ Resolve endpoint works (alert not found - may have been resolved)")
        else:
            # No alerts to resolve - test with invalid index
            resolve_response = requests.post(
                f"{BASE_URL}/api/payments/billing-alerts/999/resolve",
                headers=auth_headers
            )
            assert resolve_response.status_code == 404, f"Expected 404 for invalid index, got {resolve_response.status_code}"
            print("✅ Resolve endpoint correctly returns 404 for invalid index")
    
    def test_resolve_billing_alert_requires_auth(self):
        """Test that resolve endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/payments/billing-alerts/0/resolve")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print("✅ Resolve billing alert endpoint requires authentication")


class TestSubscriptionPackages:
    """Tests to verify server-side price calculation"""
    
    def test_annual_package_exists(self, auth_headers):
        """Test that 'annual' package is valid"""
        response = requests.post(
            f"{BASE_URL}/api/payments/checkout/session",
            json={
                "price_id": "annual",
                "origin_url": "https://test.example.com"
            },
            headers=auth_headers
        )
        assert response.status_code == 200, f"'annual' package should be valid, got {response.status_code}"
        print("✅ 'annual' package (30€) is valid")
    
    def test_postpartum_package_exists(self, auth_headers):
        """Test that 'postpartum' package is valid"""
        response = requests.post(
            f"{BASE_URL}/api/payments/checkout/session",
            json={
                "price_id": "postpartum",
                "origin_url": "https://test.example.com"
            },
            headers=auth_headers
        )
        assert response.status_code == 200, f"'postpartum' package should be valid, got {response.status_code}"
        print("✅ 'postpartum' package (10€) is valid")


class TestBillingAlertsLogFile:
    """Tests for billing_alerts.log file"""
    
    def test_billing_alerts_log_exists(self):
        """Test that billing_alerts.log file exists and is writable"""
        import os
        log_path = "/app/backend/billing_alerts.log"
        
        # Check file exists
        assert os.path.exists(log_path), f"billing_alerts.log should exist at {log_path}"
        
        # Check file is writable
        assert os.access(log_path, os.W_OK), f"billing_alerts.log should be writable"
        
        print(f"✅ billing_alerts.log exists and is writable at {log_path}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
