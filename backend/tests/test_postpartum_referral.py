"""
Test suite for Postpartum and Referral features in MamanDouce
Covers: Maternity bag checklist, Postpartum content, Referral system
"""
import pytest
import requests
import os
import time

BASE_URL = (os.environ.get("BACKEND_URL") or os.environ.get("VITE_BACKEND_URL") or os.environ.get("REACT_APP_BACKEND_URL") or "http://localhost:8000").rstrip("/")
API_URL = f"{BASE_URL}/api"

# Test credentials
ADMIN_EMAIL = "cyrilalepsa@gmail.com"
ADMIN_PASSWORD = "Cyc@dmin9630"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for tests"""
    response = requests.post(
        f"{API_URL}/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    assert response.status_code == 200, f"Login failed: {response.text}"
    return response.json()["access_token"]


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Auth headers for authenticated requests"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestMaternityBag:
    """Tests for Maternity Bag checklist feature"""
    
    def test_get_maternity_bag_list(self, auth_headers):
        """GET /api/maternity-bag - Should return list of items by category"""
        response = requests.get(f"{API_URL}/maternity-bag", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "items" in data
        assert "custom_items" in data
        assert isinstance(data["items"], list)
        assert len(data["items"]) > 0
        
        # Verify item structure
        first_item = data["items"][0]
        assert "category" in first_item
        assert "item" in first_item
        assert "checked" in first_item
        
        # Verify categories exist
        categories = set(item["category"] for item in data["items"])
        assert "Pour maman" in categories
        assert "Pour bébé" in categories
        assert "Pour le retour" in categories
    
    def test_toggle_item_check(self, auth_headers):
        """POST /api/maternity-bag/check - Should toggle item checked status"""
        # Check item
        response = requests.post(
            f"{API_URL}/maternity-bag/check?item_index=1&checked=true&is_custom=false",
            headers=auth_headers
        )
        assert response.status_code == 200
        assert response.json()["success"] is True
        
        # Verify change persisted
        get_response = requests.get(f"{API_URL}/maternity-bag", headers=auth_headers)
        assert get_response.status_code == 200
        items = get_response.json()["items"]
        assert items[1]["checked"] is True
        
        # Uncheck item (cleanup)
        response = requests.post(
            f"{API_URL}/maternity-bag/check?item_index=1&checked=false&is_custom=false",
            headers=auth_headers
        )
        assert response.status_code == 200
    
    def test_suggest_item(self, auth_headers):
        """POST /api/maternity-bag/suggest - Should submit suggestion for validation"""
        # Create unique suggestion
        timestamp = int(time.time())
        suggestion_data = {
            "category": "Pour bébé",
            "item": f"TEST_Article suggéré {timestamp}"
        }
        
        response = requests.post(
            f"{API_URL}/maternity-bag/suggest",
            json=suggestion_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "validation" in data["message"].lower() or "envoyée" in data["message"].lower()
    
    def test_maternity_bag_unauthorized(self):
        """GET /api/maternity-bag - Should require authentication"""
        response = requests.get(f"{API_URL}/maternity-bag")
        assert response.status_code in [401, 403]  # Accept both unauthorized codes


class TestPostpartumContent:
    """Tests for Postpartum content feature"""
    
    def test_get_postpartum_content(self, auth_headers):
        """GET /api/postpartum/content - Should return all postpartum content"""
        response = requests.get(f"{API_URL}/postpartum/content", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify all sections present
        expected_sections = ["appointments", "difficulties", "breastfeeding", "formula", "diapers", "precautions"]
        for section in expected_sections:
            assert section in data, f"Missing section: {section}"
    
    def test_postpartum_appointments_structure(self, auth_headers):
        """Verify appointments section has correct structure"""
        response = requests.get(f"{API_URL}/postpartum/content", headers=auth_headers)
        assert response.status_code == 200
        
        appointments = response.json()["appointments"]
        assert isinstance(appointments, list)
        assert len(appointments) > 0
        
        # Verify appointment structure
        apt = appointments[0]
        assert "week" in apt
        assert "title" in apt
        assert "description" in apt
        assert "type" in apt
        assert apt["type"] in ["obligatoire", "recommandé"]
    
    def test_postpartum_difficulties_structure(self, auth_headers):
        """Verify difficulties section has correct structure"""
        response = requests.get(f"{API_URL}/postpartum/content", headers=auth_headers)
        assert response.status_code == 200
        
        difficulties = response.json()["difficulties"]
        assert isinstance(difficulties, list)
        assert len(difficulties) > 0
        
        # Verify difficulty structure
        diff = difficulties[0]
        assert "title" in diff
        assert "description" in diff
        assert "symptoms" in diff
        assert "advice" in diff
        assert "alert" in diff
        assert isinstance(diff["symptoms"], list)
    
    def test_postpartum_breastfeeding_structure(self, auth_headers):
        """Verify breastfeeding section has correct structure"""
        response = requests.get(f"{API_URL}/postpartum/content", headers=auth_headers)
        assert response.status_code == 200
        
        breastfeeding = response.json()["breastfeeding"]
        assert "benefits" in breastfeeding
        assert "tips" in breastfeeding
        assert "positions" in breastfeeding
        assert "alert" in breastfeeding
        assert isinstance(breastfeeding["benefits"], list)
        assert isinstance(breastfeeding["tips"], list)
    
    def test_postpartum_formula_structure(self, auth_headers):
        """Verify formula section has correct structure"""
        response = requests.get(f"{API_URL}/postpartum/content", headers=auth_headers)
        assert response.status_code == 200
        
        formula = response.json()["formula"]
        assert "info" in formula
        assert "tips" in formula
        assert "types" in formula
        assert "alert" in formula
        
        # Verify formula types
        assert len(formula["types"]) >= 3
        formula_type = formula["types"][0]
        assert "name" in formula_type
        assert "age" in formula_type
        assert "description" in formula_type
    
    def test_postpartum_diapers_structure(self, auth_headers):
        """Verify diapers section has correct structure"""
        response = requests.get(f"{API_URL}/postpartum/content", headers=auth_headers)
        assert response.status_code == 200
        
        diapers = response.json()["diapers"]
        assert "frequency" in diapers
        assert "tips" in diapers
        assert "sizes" in diapers
        assert "alert" in diapers
        
        # Verify sizes
        assert len(diapers["sizes"]) >= 4
        size = diapers["sizes"][0]
        assert "size" in size
        assert "weight" in size
        assert "age" in size
    
    def test_postpartum_precautions_structure(self, auth_headers):
        """Verify precautions section has correct structure"""
        response = requests.get(f"{API_URL}/postpartum/content", headers=auth_headers)
        assert response.status_code == 200
        
        precautions = response.json()["precautions"]
        assert isinstance(precautions, list)
        assert len(precautions) > 0
        
        prec = precautions[0]
        assert "title" in prec
        assert "tips" in prec
        assert isinstance(prec["tips"], list)
    
    def test_postpartum_content_unauthorized(self):
        """GET /api/postpartum/content - Should require authentication"""
        response = requests.get(f"{API_URL}/postpartum/content")
        assert response.status_code in [401, 403]  # Accept both unauthorized codes


class TestReferralSystem:
    """Tests for Referral (Parrainage) feature"""
    
    def test_get_referral_status(self, auth_headers):
        """GET /api/referral/status - Should return referral status"""
        response = requests.get(f"{API_URL}/referral/status", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "referrals" in data
        assert "completed_count" in data
        assert "postpartum_unlocked" in data
        assert isinstance(data["referrals"], list)
        assert isinstance(data["completed_count"], int)
        assert isinstance(data["postpartum_unlocked"], bool)
    
    def test_submit_referral(self, auth_headers):
        """POST /api/referral/submit - Should submit referral contacts"""
        timestamp = int(time.time())
        referral_data = {
            "referral1_email": f"test_filleule_{timestamp}@example.com",
            "referral1_name": f"Filleule Test {timestamp}"
        }
        
        response = requests.post(
            f"{API_URL}/referral/submit",
            json=referral_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["referrals_count"] == 1
    
    def test_submit_two_referrals(self, auth_headers):
        """POST /api/referral/submit - Should accept two referrals at once"""
        timestamp = int(time.time())
        referral_data = {
            "referral1_email": f"test_duo1_{timestamp}@example.com",
            "referral1_name": f"Duo1 Test {timestamp}",
            "referral2_email": f"test_duo2_{timestamp}@example.com",
            "referral2_name": f"Duo2 Test {timestamp}"
        }
        
        response = requests.post(
            f"{API_URL}/referral/submit",
            json=referral_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["referrals_count"] == 2
    
    def test_submit_duplicate_referral(self, auth_headers):
        """POST /api/referral/submit - Should reject duplicate email"""
        timestamp = int(time.time())
        referral_data = {
            "referral1_email": f"test_unique_{timestamp}@example.com",
            "referral1_name": "Unique Test"
        }
        
        # First submission
        response1 = requests.post(
            f"{API_URL}/referral/submit",
            json=referral_data,
            headers=auth_headers
        )
        assert response1.status_code == 200
        
        # Second submission with same email
        response2 = requests.post(
            f"{API_URL}/referral/submit",
            json=referral_data,
            headers=auth_headers
        )
        assert response2.status_code == 400
        assert "déjà parrainé" in response2.json()["detail"]
    
    def test_referral_missing_required_fields(self, auth_headers):
        """POST /api/referral/submit - Should require at least one referral"""
        referral_data = {
            "referral1_email": "",
            "referral1_name": ""
        }
        
        response = requests.post(
            f"{API_URL}/referral/submit",
            json=referral_data,
            headers=auth_headers
        )
        
        # Should return error for empty fields
        assert response.status_code in [400, 422]
    
    def test_referral_status_unauthorized(self):
        """GET /api/referral/status - Should require authentication"""
        response = requests.get(f"{API_URL}/referral/status")
        assert response.status_code in [401, 403]  # Accept both unauthorized codes


class TestSubscriptionStatus:
    """Tests for Subscription status with postpartum eligibility"""
    
    def test_get_full_subscription_status(self, auth_headers):
        """GET /api/subscription/full-status - Should return full status"""
        response = requests.get(f"{API_URL}/subscription/full-status", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "subscription_status" in data
        assert "months_subscribed" in data
        assert "postpartum_eligible" in data
        assert "postpartum_unlocked" in data
        assert "completed_referrals" in data
        assert "referrals_needed_for_free" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
