"""
Test suite for Contact Messaging with Image Attachments
Tests: POST /api/contact/send, POST /api/contact/messages/{id}/reply, GET /api/contact/my-messages
Features: Image upload (base64), max 3 images, compression, image validation
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "cyrilalepsa@gmail.com"
TEST_PASSWORD = "Cyc@dmin9630"

# Small test image (1x1 red pixel PNG in base64)
SMALL_TEST_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="

# Create a slightly larger test image (10x10 blue PNG)
BLUE_TEST_IMAGE = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAQIDBP/EACIQAAEDAwQDAQAAAAAAAAAAAAECAxEABAUGEiExE0FR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAZEQADAAMAAAAAAAAAAAAAAAAAAQIRITH/2gAMAwEAAhEDEEA/AK2OAdbK1OXb4Cx+jJPUn5Tsy0LbaAUJIA+UVaqcD//Z"

# Invalid format (not base64 image)
INVALID_IMAGE = "not-a-valid-base64-image"

class TestContactSendWithImages:
    """Tests for POST /api/contact/send with images"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return response.json().get("access_token")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Headers with authorization"""
        return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}
    
    def test_send_message_without_images(self, auth_headers):
        """Send a contact message without images - should work"""
        response = requests.post(f"{BASE_URL}/api/contact/send", 
            json={
                "subject": "TEST_no_images",
                "message": "Message without images"
            },
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["images_count"] == 0
        print(f"PASS: Message without images sent successfully")
    
    def test_send_message_with_one_image(self, auth_headers):
        """Send a contact message with one image"""
        response = requests.post(f"{BASE_URL}/api/contact/send", 
            json={
                "subject": "TEST_one_image",
                "message": "Message with one image",
                "images": [SMALL_TEST_IMAGE]
            },
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["images_count"] == 1
        print(f"PASS: Message with 1 image sent - images_count: {data['images_count']}")
    
    def test_send_message_with_three_images(self, auth_headers):
        """Send a contact message with max 3 images"""
        response = requests.post(f"{BASE_URL}/api/contact/send", 
            json={
                "subject": "TEST_three_images",
                "message": "Message with three images",
                "images": [SMALL_TEST_IMAGE, BLUE_TEST_IMAGE, SMALL_TEST_IMAGE]
            },
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["images_count"] == 3
        print(f"PASS: Message with 3 images sent - images_count: {data['images_count']}")
    
    def test_send_message_with_more_than_three_images(self, auth_headers):
        """Send a message with more than 3 images - should truncate to 3"""
        response = requests.post(f"{BASE_URL}/api/contact/send", 
            json={
                "subject": "TEST_too_many_images",
                "message": "Message with 5 images",
                "images": [SMALL_TEST_IMAGE, SMALL_TEST_IMAGE, SMALL_TEST_IMAGE, SMALL_TEST_IMAGE, SMALL_TEST_IMAGE]
            },
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["images_count"] <= 3, f"Expected max 3 images, got {data['images_count']}"
        print(f"PASS: Message with 5 images truncated to {data['images_count']} images")
    
    def test_send_message_with_invalid_image_format(self, auth_headers):
        """Send a message with invalid image format - should skip invalid images"""
        response = requests.post(f"{BASE_URL}/api/contact/send", 
            json={
                "subject": "TEST_invalid_image",
                "message": "Message with invalid image",
                "images": [INVALID_IMAGE, SMALL_TEST_IMAGE]
            },
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        # Should only count valid image
        assert data["images_count"] == 1, f"Expected 1 valid image, got {data['images_count']}"
        print(f"PASS: Invalid image skipped, valid images_count: {data['images_count']}")
    
    def test_send_message_with_empty_images_list(self, auth_headers):
        """Send a message with empty images list"""
        response = requests.post(f"{BASE_URL}/api/contact/send", 
            json={
                "subject": "TEST_empty_images",
                "message": "Message with empty images list",
                "images": []
            },
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["images_count"] == 0
        print(f"PASS: Message with empty images list sent successfully")


class TestGetMyMessagesWithImages:
    """Tests for GET /api/contact/my-messages - verifying images in response"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return response.json().get("access_token")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Headers with authorization"""
        return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}
    
    def test_get_my_messages_returns_images(self, auth_headers):
        """Verify GET /api/contact/my-messages returns images in messages"""
        response = requests.get(f"{BASE_URL}/api/contact/my-messages", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "messages" in data
        
        # Find a message with images
        messages_with_images = [m for m in data["messages"] if m.get("images")]
        
        if messages_with_images:
            msg = messages_with_images[0]
            assert "images" in msg
            assert isinstance(msg["images"], list)
            assert len(msg["images"]) > 0
            # Verify images are base64 strings starting with data:image/
            for img in msg["images"]:
                assert img.startswith("data:image/"), f"Image should start with data:image/, got: {img[:30]}..."
            print(f"PASS: Found {len(messages_with_images)} message(s) with images, first has {len(msg['images'])} images")
        else:
            print("INFO: No messages with images found - sending one for verification")
            # Send a new message with image
            send_response = requests.post(f"{BASE_URL}/api/contact/send",
                json={
                    "subject": "TEST_verify_images_in_get",
                    "message": "Verification message with image",
                    "images": [SMALL_TEST_IMAGE]
                },
                headers=auth_headers
            )
            assert send_response.status_code == 200
            
            # Get messages again
            response = requests.get(f"{BASE_URL}/api/contact/my-messages", headers=auth_headers)
            data = response.json()
            messages_with_images = [m for m in data["messages"] if m.get("images")]
            assert len(messages_with_images) > 0, "Should have at least one message with images now"
            print(f"PASS: After sending, found {len(messages_with_images)} message(s) with images")
    
    def test_messages_structure_includes_images_field(self, auth_headers):
        """Verify message structure supports images field"""
        response = requests.get(f"{BASE_URL}/api/contact/my-messages", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        if data["messages"]:
            msg = data["messages"][0]
            # Check standard fields exist
            assert "id" in msg
            assert "subject" in msg
            assert "message" in msg
            assert "created_at" in msg
            # Images field can be None or list
            assert msg.get("images") is None or isinstance(msg.get("images"), list)
            images = msg.get("images") or []
            print(f"PASS: Message structure correct, has {len(images)} images")


class TestConversationReplyWithImages:
    """Tests for POST /api/contact/messages/{id}/reply with images"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return response.json().get("access_token")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Headers with authorization"""
        return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}
    
    @pytest.fixture
    def message_id(self, auth_headers):
        """Get or create a message ID to reply to"""
        # First try to get existing messages
        response = requests.get(f"{BASE_URL}/api/contact/my-messages", headers=auth_headers)
        data = response.json()
        
        if data["messages"]:
            # Return first message with admin_reply if exists, otherwise first message
            for msg in data["messages"]:
                if msg.get("admin_reply"):
                    return msg["id"]
            return data["messages"][0]["id"]
        else:
            # Create a new message
            send_response = requests.post(f"{BASE_URL}/api/contact/send",
                json={
                    "subject": "TEST_for_reply",
                    "message": "Message to test reply functionality"
                },
                headers=auth_headers
            )
            assert send_response.status_code == 200
            
            # Get messages to find the new one
            response = requests.get(f"{BASE_URL}/api/contact/my-messages", headers=auth_headers)
            data = response.json()
            return data["messages"][0]["id"]
    
    def test_reply_with_images(self, auth_headers, message_id):
        """Reply to a conversation with images"""
        response = requests.post(f"{BASE_URL}/api/contact/messages/{message_id}/reply",
            json={
                "subject": "",
                "message": "TEST_reply with image attachment",
                "images": [SMALL_TEST_IMAGE]
            },
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data.get("images_count", 0) == 1
        print(f"PASS: Reply with 1 image sent successfully")
    
    def test_reply_with_multiple_images(self, auth_headers, message_id):
        """Reply with multiple images"""
        response = requests.post(f"{BASE_URL}/api/contact/messages/{message_id}/reply",
            json={
                "subject": "",
                "message": "TEST_reply with multiple images",
                "images": [SMALL_TEST_IMAGE, BLUE_TEST_IMAGE]
            },
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data.get("images_count", 0) == 2
        print(f"PASS: Reply with 2 images sent successfully")
    
    def test_reply_without_images(self, auth_headers, message_id):
        """Reply without images - text only"""
        response = requests.post(f"{BASE_URL}/api/contact/messages/{message_id}/reply",
            json={
                "subject": "",
                "message": "TEST_reply text only, no images"
            },
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data.get("images_count", 0) == 0
        print(f"PASS: Reply without images sent successfully")
    
    def test_reply_images_in_conversation_history(self, auth_headers, message_id):
        """Verify images appear in conversation history"""
        # First send a reply with image
        requests.post(f"{BASE_URL}/api/contact/messages/{message_id}/reply",
            json={
                "subject": "",
                "message": "TEST_reply for history check",
                "images": [SMALL_TEST_IMAGE]
            },
            headers=auth_headers
        )
        
        # Get messages and check conversation
        response = requests.get(f"{BASE_URL}/api/contact/my-messages", headers=auth_headers)
        data = response.json()
        
        # Find the message
        msg = next((m for m in data["messages"] if m["id"] == message_id), None)
        assert msg is not None, "Message not found"
        
        # Check conversation history for images
        conversation = msg.get("conversation", [])
        replies_with_images = [c for c in conversation if c.get("images")]
        
        if replies_with_images:
            reply = replies_with_images[-1]
            assert isinstance(reply["images"], list)
            assert len(reply["images"]) > 0
            print(f"PASS: Found {len(replies_with_images)} reply(ies) with images in conversation history")
        else:
            print("INFO: No replies with images found in conversation yet")
    
    def test_reply_to_nonexistent_message(self, auth_headers):
        """Reply to non-existent message - should fail gracefully"""
        fake_id = "nonexistent-message-id-12345"
        response = requests.post(f"{BASE_URL}/api/contact/messages/{fake_id}/reply",
            json={
                "subject": "",
                "message": "Reply to nothing",
                "images": [SMALL_TEST_IMAGE]
            },
            headers=auth_headers
        )
        data = response.json()
        # Should return success=False or 404
        assert response.status_code in [200, 404]
        if response.status_code == 200:
            assert data.get("success") == False
        print(f"PASS: Non-existent message reply handled correctly")


class TestImageValidation:
    """Tests for image validation rules"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return response.json().get("access_token")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Headers with authorization"""
        return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}
    
    def test_rejects_non_base64_images(self, auth_headers):
        """Images without proper data:image/ prefix should be rejected"""
        response = requests.post(f"{BASE_URL}/api/contact/send",
            json={
                "subject": "TEST_invalid_prefix",
                "message": "Test invalid image prefix",
                "images": ["invalid-no-prefix", SMALL_TEST_IMAGE]
            },
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["images_count"] == 1  # Only valid image counted
        print(f"PASS: Invalid image prefix rejected, valid count: {data['images_count']}")
    
    def test_handles_none_images(self, auth_headers):
        """Images field as None should work"""
        response = requests.post(f"{BASE_URL}/api/contact/send",
            json={
                "subject": "TEST_null_images",
                "message": "Test null images field",
                "images": None
            },
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["images_count"] == 0
        print(f"PASS: None images field handled correctly")
    
    def test_max_three_images_enforced(self, auth_headers):
        """Verify max 3 images limit is enforced"""
        response = requests.post(f"{BASE_URL}/api/contact/send",
            json={
                "subject": "TEST_max_limit",
                "message": "Test max images limit",
                "images": [SMALL_TEST_IMAGE] * 10  # Send 10 images
            },
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["images_count"] <= 3, f"Max 3 images expected, got {data['images_count']}"
        print(f"PASS: Max 3 images enforced, count: {data['images_count']}")


class TestUnauthorizedAccess:
    """Tests for authentication requirements"""
    
    def test_send_without_auth(self):
        """POST /api/contact/send requires authentication"""
        response = requests.post(f"{BASE_URL}/api/contact/send",
            json={
                "subject": "TEST_unauth",
                "message": "Unauthorized message",
                "images": [SMALL_TEST_IMAGE]
            }
        )
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"PASS: Unauthorized send blocked with status {response.status_code}")
    
    def test_get_messages_without_auth(self):
        """GET /api/contact/my-messages requires authentication"""
        response = requests.get(f"{BASE_URL}/api/contact/my-messages")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"PASS: Unauthorized get messages blocked with status {response.status_code}")
    
    def test_reply_without_auth(self):
        """POST /api/contact/messages/{id}/reply requires authentication"""
        response = requests.post(f"{BASE_URL}/api/contact/messages/any-id/reply",
            json={
                "subject": "",
                "message": "Unauthorized reply",
                "images": [SMALL_TEST_IMAGE]
            }
        )
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"PASS: Unauthorized reply blocked with status {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
