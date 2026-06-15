import os
import sys
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

os.environ.setdefault("PROJECT_NAME", "Test Chatbot")
os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("ALGORITHM", "HS256")

temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
temp_db.close()
os.environ["DATABASE_URL"] = f"sqlite:///{temp_db.name}"

import importlib

import app.database.connection as connection_module
import app.main as main_app
from app.database.base import Base


@pytest.fixture(autouse=True)
def setup_database():
    temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
    temp_db.close()
    os.environ["DATABASE_URL"] = f"sqlite:///{temp_db.name}"

    import importlib

    import app.database.connection as connection_module

    importlib.reload(connection_module)

    Base.metadata.drop_all(bind=connection_module.engine)
    Base.metadata.create_all(bind=connection_module.engine)
    yield
    Base.metadata.drop_all(bind=connection_module.engine)
    Path(temp_db.name).unlink(missing_ok=True)


@pytest.fixture()
def client():
    with TestClient(main_app.app) as test_client:
        yield test_client


def test_protected_me_requires_auth(client):
    response = client.get("/me")

    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"


def test_login_and_me_with_bearer_token(client):
    create_response = client.post(
        "/users",
        json={
            "username": "jagan",
            "email": "jagan@gmail.com",
            "password": "secret123",
        },
    )

    assert create_response.status_code == 200

    login_response = client.post(
        "/login",
        params={"email": "jagan@gmail.com", "password": "secret123"},
    )

    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    me_response = client.get(
        "/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert me_response.status_code == 200
    assert me_response.json()["email"] == "jagan@gmail.com"
