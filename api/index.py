import os
import sys

# Vercel Serverless 실행 환경에서 프로젝트 루트 경로를 sys.path에 등록
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app import app as flask_app
import logging
from urllib.parse import parse_qs, urlencode

logger = logging.getLogger(__name__)

class VercelWSGIWrapper:
    """Vercel Serverless rewrite 환경에서 원래 요청 URL(PATH_INFO)을 정상 복원하는 WSGI 미들웨어"""
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        query_string = environ.get("QUERY_STRING", "")
        if "test-env" in query_string or "test-env" in environ.get("PATH_INFO", ""):
            import json
            data = {k: str(v) for k, v in environ.items() if not k.startswith("wsgi.input")}
            body = json.dumps(data, indent=2).encode("utf-8")
            start_response("200 OK", [("Content-Type", "application/json"), ("Content-Length", str(len(body)))])
            return [body]
        extracted_path = None


        # 1. vercel.json rewrite에서 전달된 __vercel_path__ 추출
        if "__vercel_path__=" in query_string:
            params = parse_qs(query_string, keep_blank_values=True)
            if "__vercel_path__" in params and params["__vercel_path__"]:
                extracted_path = params["__vercel_path__"][0]
                del params["__vercel_path__"]
                environ["QUERY_STRING"] = urlencode(params, doseq=True)

        # 2. Vercel 원본 요청 헤더 확인 (x-vercel-original-path, REQUEST_URI 등 실제 사용자 요청 경로 우선)
        header_path = (
            environ.get("HTTP_X_VERCEL_ORIGINAL_PATH")
            or environ.get("REQUEST_URI")
            or environ.get("RAW_URI")
            or environ.get("HTTP_X_FORWARDED_URI")
            or environ.get("HTTP_X_ORIGINAL_URI")
            or environ.get("HTTP_X_MATCHED_PATH")
        )

        target_path = extracted_path or header_path or environ.get("PATH_INFO", "")

        # 쿼리 파라미터 분리
        if target_path and "?" in target_path:
            target_path = target_path.split("?")[0]

        # api/index 내부 호출이거나 빈 경로일 경우 메인 루트('/')로 설정
        if not target_path or target_path in ("/api/index", "/api/index.py", "/api", "/api/", "/index.py", "/index"):
            target_path = "/"

        # 연속 슬래시 정규화 및 시작 슬래시 보장
        while target_path.startswith("//"):
            target_path = target_path[1:]
        if not target_path.startswith("/"):
            target_path = "/" + target_path

        environ["PATH_INFO"] = target_path
        environ["SCRIPT_NAME"] = ""
        return self.wsgi_app(environ, start_response)

flask_app.wsgi_app = VercelWSGIWrapper(flask_app.wsgi_app)
app = flask_app

