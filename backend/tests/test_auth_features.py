"""
Test suite for MamanDouce authentication features:
1. Password update (with current password verification)
2. Account lockout after 4 failed attempts  
3. Email update
4. Login/Logout standard flow
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = (os.environ.get("BACKEND_URL") or os.environ.get("VITE_BACKEND_URL") or os.environ.get("REACT_APP_BACKEND_URL") or "http://localhost:8000").rstrip("/")

# Test credentials
ADMIN_EMAIL = "cyrilalepsa@gmail.com"
ADMIN_PASSWORD = "Cyc@dmin9630"

class TestLoginAndAuth:
    """Test standard login/authentication flow"""
    
    def test_login_success(self):
        """Test successful login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        print(f"PASS: Login successful, token received")
    
    def test_login_invalid_password(self):
        """Test login with wrong password - should show remaining attempts"""
        # Create a fresh test user first to avoid blocking main admin
        unique_email = f"test_auth_{uuid.uuid4().hex[:8]}@test.com"
        
        # Register the test user
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "TestPass123",
            "name": "Test Auth User"
        })
        assert reg_response.status_code == 200, f"Registration failed: {reg_response.text}"
        
        # Try login with wrong password
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": unique_email,
            "password": "wrongpassword"
        })
        assert response.status_code == 400
        data = response.json()
        assert "tentative" in data["detail"].lower() or "incorrect" in data["detail"].lower()
        print(f"PASS: Wrong password rejected with message: {data['detail']}")
    
    def test_login_nonexistent_user(self):
        """Test login with non-existent email"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "anypassword"
        })
        assert response.status_code == 400
        assert "incorrect" in response.json()["detail"].lower()
        print(f"PASS: Non-existent user rejected")
    
    def test_get_current_user(self):
        """Test /auth/me endpoint"""
        # Login first
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # Get current user
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        print(f"PASS: /auth/me returns current user")


class TestAccountLockout:
    """Test account lockout after 4 failed attempts"""
    
    def test_account_lockout_after_4_attempts(self):
        """Test that account gets locked after 4 failed login attempts"""
        # Create a fresh test user
        unique_email = f"test_lockout_{uuid.uuid4().hex[:8]}@test.com"
        
        # Register the test user
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "CorrectPass123",
            "name": "Test Lockout User"
        })
        assert reg_response.status_code == 200, f"Registration failed: {reg_response.text}"
        
        # Attempt 1-3: Wrong password, should show remaining attempts
        for attempt in range(1, 4):
            response = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": unique_email,
                "password": "wrongpassword"
            })
            assert response.status_code == 400, f"Attempt {attempt} should return 400"
            detail = response.json()["detail"]
            expected_remaining = 4 - attempt
            print(f"Attempt {attempt}: {detail}")
            assert str(expected_remaining) in detail or "tentative" in detail.lower()
        
        # Attempt 4: Should lock the account (status 423)
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": unique_email,
            "password": "wrongpassword"
        })
        assert response.status_code == 423, f"Expected 423 (locked), got {response.status_code}"
        detail = response.json()["detail"]
        assert "bloqué" in detail.lower() or "locked" in detail.lower()
        print(f"PASS: Account locked after 4 attempts: {detail}")
        
        # Try one more time - should still be locked (423)
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": unique_email,
            "password": "CorrectPass123"  # Even with correct password
        })
        assert response.status_code == 423, f"Account should remain locked"
        print(f"PASS: Account remains locked even with correct password")
    
    def test_remaining_attempts_message(self):
        """Test that error message shows remaining attempts"""
        unique_email = f"test_attempts_{uuid.uuid4().hex[:8]}@test.com"
        
        # Register
        requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "CorrectPass123",
            "name": "Test Attempts User"
        })
        
        # First failed attempt
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": unique_email,
            "password": "wrong"
        })
        detail = response.json()["detail"]
        # Should mention 3 remaining attempts
        assert "3" in detail or "tentative" in detail.lower()
        print(f"PASS: First failed attempt shows remaining: {detail}")


class TestPasswordUpdate:
    """Test password update functionality"""
    
    def test_password_update_success(self):
        """Test successful password update with correct current password"""
        # Create a test user
        unique_email = f"test_pwd_{uuid.uuid4().hex[:8]}@test.com"
        original_password = "OriginalPass123"
        new_password = "NewPassword456"
        
        # Register
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": original_password,
            "name": "Test Password User"
        })
        token = reg_response.json()["access_token"]
        
        # Update password
        response = requests.post(
            f"{BASE_URL}/api/auth/update-password",
            json={
                "current_password": original_password,
                "new_password": new_password
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200, f"Password update failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        print(f"PASS: Password updated successfully")
        
        # Verify new password works
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": unique_email,
            "password": new_password
        })
        assert login_response.status_code == 200, "Login with new password should work"
        print(f"PASS: Login with new password successful")
    
    def test_password_update_wrong_current(self):
        """Test password update with wrong current password - should fail"""
        # Create a test user
        unique_email = f"test_pwd_wrong_{uuid.uuid4().hex[:8]}@test.com"
        
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "CorrectPass123",
            "name": "Test Wrong Password"
        })
        token = reg_response.json()["access_token"]
        
        # Try to update with wrong current password
        response = requests.post(
            f"{BASE_URL}/api/auth/update-password",
            json={
                "current_password": "WrongCurrent123",
                "new_password": "NewPassword456"
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 400
        assert "incorrect" in response.json()["detail"].lower()
        print(f"PASS: Wrong current password rejected: {response.json()['detail']}")
    
    def test_password_update_too_short(self):
        """Test that new password must be at least 6 characters"""
        unique_email = f"test_pwd_short_{uuid.uuid4().hex[:8]}@test.com"
        
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "CorrectPass123",
            "name": "Test Short Password"
        })
        token = reg_response.json()["access_token"]
        
        # Try short password
        response = requests.post(
            f"{BASE_URL}/api/auth/update-password",
            json={
                "current_password": "CorrectPass123",
                "new_password": "12345"  # Only 5 chars
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 400
        assert "6" in response.json()["detail"] or "caractère" in response.json()["detail"].lower()
        print(f"PASS: Short password rejected: {response.json()['detail']}")
    
    def test_password_update_unauthenticated(self):
        """Test that password update requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/auth/update-password",
            json={
                "current_password": "any",
                "new_password": "newpass123"
            }
        )
        assert response.status_code in [401, 403]
        print(f"PASS: Unauthenticated password update rejected")


class TestEmailUpdate:
    """Test email update functionality"""
    
    def test_email_update_success(self):
        """Test successful email update"""
        unique_email = f"test_email_{uuid.uuid4().hex[:8]}@test.com"
        new_email = f"test_email_new_{uuid.uuid4().hex[:8]}@test.com"
        
        # Register
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "TestPass123",
            "name": "Test Email User"
        })
        token = reg_response.json()["access_token"]
        
        # Update email
        response = requests.post(
            f"{BASE_URL}/api/auth/update-email",
            json={"new_email": new_email},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200, f"Email update failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["new_email"] == new_email
        print(f"PASS: Email updated to {new_email}")
        
        # Verify old email doesn't work anymore for login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": unique_email,
            "password": "TestPass123"
        })
        # Old email should not work
        assert login_response.status_code == 400
        print(f"PASS: Old email no longer works")
    
    def test_email_update_already_used(self):
        """Test that email can't be changed to an already used email"""
        # Create two users
        email1 = f"test_email1_{uuid.uuid4().hex[:8]}@test.com"
        email2 = f"test_email2_{uuid.uuid4().hex[:8]}@test.com"
        
        requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email1,
            "password": "TestPass123",
            "name": "User 1"
        })
        
        reg2_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email2,
            "password": "TestPass123",
            "name": "User 2"
        })
        token2 = reg2_response.json()["access_token"]
        
        # Try to change user2's email to user1's email
        response = requests.post(
            f"{BASE_URL}/api/auth/update-email",
            json={"new_email": email1},
            headers={"Authorization": f"Bearer {token2}"}
        )
        assert response.status_code == 400
        assert "utilisée" in response.json()["detail"].lower() or "already" in response.json()["detail"].lower()
        print(f"PASS: Duplicate email rejected: {response.json()['detail']}")
    
    def test_email_update_unauthenticated(self):
        """Test that email update requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/auth/update-email",
            json={"new_email": "new@email.com"}
        )
        assert response.status_code in [401, 403]
        print(f"PASS: Unauthenticated email update rejected")


class TestEndPremium:
    """Test end premium (after birth) functionality"""
    
    def test_end_premium_unauthenticated(self):
        """Test that end-premium requires authentication"""
        response = requests.post(f"{BASE_URL}/api/auth/end-premium")
        assert response.status_code in [401, 403]
        print(f"PASS: Unauthenticated end-premium rejected")
    
    def test_end_premium_no_premium(self):
        """Test end premium for user without premium"""
        unique_email = f"test_endprem_{uuid.uuid4().hex[:8]}@test.com"
        
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "TestPass123",
            "name": "Test End Premium"
        })
        token = reg_response.json()["access_token"]
        
        response = requests.post(
            f"{BASE_URL}/api/auth/end-premium",
            headers={"Authorization": f"Bearer {token}"}
        )
        # Should fail because user doesn't have premium
        assert response.status_code == 400
        print(f"PASS: End premium for non-premium user rejected: {response.json()['detail']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
