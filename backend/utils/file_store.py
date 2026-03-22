import json
import os
import tempfile
from utils.locks import get_lock

BASE_PATH = os.path.join(os.path.dirname(__file__), "..", "data_store")

def ensure_data_store():
    os.makedirs(BASE_PATH, exist_ok=True)

def _get_file_path(filename):
    return os.path.join(BASE_PATH, filename)

def read_json(filename):
    path = _get_file_path(filename)
    if not os.path.exists(path):
        return []
    with open(path, "r") as f:
        return json.load(f)

def write_json_atomic(filename, data):
    path = _get_file_path(filename)
    lock = get_lock(path)

    with lock:
        dir_name = os.path.dirname(path)

        # create temp file in same dir
        fd, temp_path = tempfile.mkstemp(dir=dir_name)

        try:
            with os.fdopen(fd, 'w') as tmp:
                json.dump(data, tmp, indent=2)

            # atomic replace (same disk now)
            os.replace(temp_path, path)

        except Exception as e:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise e