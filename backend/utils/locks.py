import threading

locks = {}

def get_lock(file_path: str):
    if file_path not in locks:
        locks[file_path] = threading.Lock()
    return locks[file_path]