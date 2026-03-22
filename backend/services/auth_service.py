import uuid
from utils.file_store import read_json, write_json_atomic

def register_user(email, password):
    users = read_json("users.json")

    if any(u["email"] == email for u in users):
        raise Exception("User already exists")

    user = {
        "user_id": str(uuid.uuid4()),
        "email": email,
        "password": password
    }

    users.append(user)
    write_json_atomic("users.json", users)

    return user

def login_user(email, password):
    users = read_json("users.json")

    user = next((u for u in users if u["email"] == email and u["password"] == password), None)

    if not user:
        raise Exception("Invalid credentials")

    token = str(uuid.uuid4())

    sessions = read_json("sessions.json")
    sessions.append({
        "token": token,
        "user_id": user["user_id"]
    })

    write_json_atomic("sessions.json", sessions)

    return token

def social_login_stub(provider: str):
    token = str(uuid.uuid4())

    sessions = read_json("sessions.json")
    sessions.append({
        "token": token,
        "user_id": f"{provider}_user"
    })

    write_json_atomic("sessions.json", sessions)

    return token