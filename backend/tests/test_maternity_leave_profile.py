"""Profile fields for maternity leave estimation."""

from models.schemas import ProfileUpdate, User, UserCreate, normalize_multiple_pregnancy


def test_user_create_defaults_family_fields():
    user = UserCreate(
        email="test@example.com",
        password="secret123",
        name="Test",
    )
    assert user.children_at_home == 0
    assert user.multiple_pregnancy == "none"


def test_user_create_coerces_children_at_home():
    user = UserCreate(
        email="test@example.com",
        password="secret123",
        name="Test",
        children_at_home="2",
    )
    assert user.children_at_home == 2


def test_profile_update_validates_multiple_pregnancy():
    payload = ProfileUpdate(multiple_pregnancy="twins")
    assert payload.multiple_pregnancy == "twins"
    invalid = ProfileUpdate(multiple_pregnancy="quadruplets")
    assert invalid.multiple_pregnancy == "none"


def test_user_model_includes_family_fields():
    user = User(
        email="test@example.com",
        name="Test",
        children_at_home=3,
        multiple_pregnancy="triplets_or_more",
    )
    assert user.children_at_home == 3
    assert user.multiple_pregnancy == "triplets_or_more"


def test_normalize_multiple_pregnancy_aliases():
    assert normalize_multiple_pregnancy("TWINS") == "twins"
    assert normalize_multiple_pregnancy("invalid") == "none"
