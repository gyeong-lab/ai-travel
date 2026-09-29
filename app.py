import os
import time
import logging
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify
from google import genai
from google.genai.errors import APIError

# .env 파일에서 환경변수 로드
load_dotenv()

# 로깅 설정 (시간, 로그 레벨, 메시지 포맷)
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY", "ai-travel-secret-key-default")

def get_gemini_client():
    """환경변수에서 GEMINI_API_KEY를 읽어 Client를 생성합니다."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key.strip() == "" or api_key == "your_gemini_api_key_here":
        raise ValueError("GEMINI_API_KEY가 .env 파일에 올바르게 설정되지 않았습니다. .env 파일을 확인해 주세요.")
    return genai.Client(api_key=api_key)

def build_prompt(data: dict) -> str:
    """사용자가 입력한 여행 조건과 선택한 모드(A/B)에 따라 최적화된 프롬프트를 생성합니다."""
    destination = data.get("destination", "").strip()
    duration = data.get("duration", "").strip()
    budget = data.get("budget", "").strip()
    interests = data.get("interests", "").strip()
    companions = data.get("companions", "").strip()
    transportation = data.get("transportation", "").strip()
    accommodation = data.get("accommodation", "").strip()
    mode = data.get("mode", "A").strip().upper()

    # 모드별 세부 지침 정의
    if mode == "B":
        mode_title = "여유로운 힐링 / 로컬 감성 중심 (Slow & Relaxed Local Trip)"
        mode_instruction = """
- 하루에 1~2개의 핵심 장소만 여유롭게 방문하도록 느긋한 일정으로 구성하세요.
- 북적이는 관광지보다는 현지인이 사랑하는 골목, 조용한 카페, 산책로, 힐링 스팟을 우선 추천하세요.
- 식사 시간과 휴식 시간을 넉넉히 배정하고, 서두르지 않는 쉼이 있는 여행 동선을 만드세요.
"""
    else:
        mode_title = "알찬 가성비 / 핵심 투어 중심 (Efficient & High-Value Tour)"
        mode_instruction = """
- 주요 랜드마크와 필수 방문 명소를 놓치지 않고 최대한 알차게 둘러볼 수 있도록 동선을 최적화하세요.
- 가성비가 뛰어난 맛집과 합리적인 가격의 숙소 및 교통 수단을 적극 추천하세요.
- 시간대별(오전/점심/오후/저녁)로 체계적이고 밀도 높은 일정 계획을 세우세요.
"""

    prompt = f"""
당신은 최고의 여행 플래너이자 투어 컨설턴트입니다.
아래 사용자가 입력한 조건과 여행 모드를 철저히 반영하여, 보기 쉽고 체계적인 맞춤 여행 계획서를 **Markdown** 형식으로 작성해 주세요.

### [사용자 여행 기본 정보]
- 1. 여행지: {destination}
- 2. 여행 기간: {duration}
- 3. 1인당 또는 총 예산: {budget}
- 4. 주요 관심사/여행 테마: {interests}
- 5. 동행자: {companions}
- 6. 선호 이동수단: {transportation}
- 7. 숙소 선호 유형: {accommodation}

### [선택된 여행 모드]
- 모드: {mode_title}
{mode_instruction}

---

### [작성 가이드라인 및 필수 제약 사항]
반드시 다음 6개 항목을 빠짐없이 포함하여 구조화된 Markdown 문서로 작성하세요.
각 항목은 이모지와 큰 제목(###), 표(Table), 글머리 기호(-)를 활용하여 가독성을 극대화해 주세요.

⚠️ [핵심 제약 사항 - 필수 준수]
- 실시간 정보가 필요한 입장료/티켓 가격, 교통 요금 및 각 매장/명소의 운영 시간/휴무일 등은 절대 사실처럼 단정하여 단일 값으로 확정 생성하지 말고, 반드시 **"(방문 전 최신 가격/운영시간 확인 필요)"** 또는 **"(확인 필요)"**라고 명확히 표시하세요.

# ✈️ {destination} {duration} 맞춤 여행 일정표 ({mode_title})

### 1. 📌 여행 개요 및 핵심 테마
- 이번 여행의 핵심 테마와 특징 요약
- 여행지 기본 정보 (현재 시즌 날씨, 특징)

### 2. 🗓️ 일자별 세부 일정 (Day 1부터 마지막 날까지)
각 날짜별로 아래 형식을 지켜 시간순으로 세밀하게 기술하세요:
- **오전**: 주요 방문지, 추천 활동, 이동 소요시간
- **점심**: 추천 메뉴 및 현지 식당 스타일
- **오후**: 추천 투어 및 관광 명소, 즐길 거리
- **저녁**: 추천 저녁 식사 및 야경/야간 명소
- **숙소 복귀 및 휴식 팁**
- *참고: 개별 매장의 영업시간 및 입장 마감 시간은 '(방문 전 확인 필요)'로 표기*

### 3. 💰 예상 경비 예산 분석표
- 표(Table)를 사용하여 항목별 예상 비용(숙소, 식비, 교통, 관광/체험, 예비비)과 총합계를 보기 쉽게 정리하세요.
- *참고: 실시간 환율 및 변동 가격 항목에는 '(확인 필요)' 표기*
- 예산 절약 팁 또는 가성비 지출 팁을 함께 안내하세요.

### 4. 🧭 최적 이동 경로 및 교통 수단 꿀팁
- 추천 이동 경로 및 선택된 이동수단({transportation}) 맞춤 활용법
- 현지 교통 패스, 환승, 티켓 예매 팁 (시간표/요금은 사전 확인 필요 명시)

### 5. 🎒 필수 준비물 체크리스트
- 필수 서류(여권, 비자, 바우처 등)
- 계절별 의류 및 잡화
- 전자기기 및 비상약 등 맞춤 준비물

### 6. ⚠️ 현지 주의사항 및 안전 수칙
- 치안, 결제 수단(현금 vs 카드/모바일페이), 팁 문화
- 현지 에티켓 및 응급상황 발생 시 대처 요령

친절하고 전문적인 톤으로, 여행자가 바로 출력하거나 스마트폰으로 보면서 다닐 수 있을 정도로 구체적인 장소 이름과 유용한 팁을 함께 작성해 주세요.
"""
    return prompt

@app.route("/")
def index():
    """메인 페이지를 렌더링합니다."""
    return render_template("index.html")

@app.route("/generate", methods=["POST"])
def generate_plan():
    """사용자의 입력값을 검증하고 Gemini API를 호출하여 여행 계획을 반환합니다."""
    start_time = time.time()

    # 1. JSON 요청 데이터 수신 확인
    if not request.is_json:
        logger.warning("[요청 실패] JSON 형식이 아닌 요청 수신")
        return jsonify({"success": False, "error": "올바른 JSON 요청이 아닙니다."}), 400

    data = request.get_json()
    logger.info(f"[요청 수신] 여행지: {data.get('destination')}, 기간: {data.get('duration')}, 모드: {data.get('mode')}")

    # 2. 필수 입력값 검증 (Frontend와 Backend 양쪽 검증)
    required_fields = {
        "destination": "여행지",
        "duration": "여행 기간",
        "budget": "예산",
        "interests": "관심사",
        "companions": "동행자",
        "transportation": "이동수단",
        "accommodation": "숙소 선호",
        "mode": "여행 스타일 모드"
    }

    missing_or_empty = []
    for field_key, field_name in required_fields.items():
        val = data.get(field_key)
        if not val or not str(val).strip():
            missing_or_empty.append(field_name)

    if missing_or_empty:
        error_msg = f"다음 필수 입력 항목이 누락되었거나 비어 있습니다: {', '.join(missing_or_empty)}"
        logger.warning(f"[검증 실패] {error_msg}")
        return jsonify({"success": False, "error": error_msg}), 400

    mode = str(data.get("mode", "A")).strip().upper()
    if mode not in ["A", "B"]:
        logger.warning(f"[검증 실패] 잘못된 모드 값: {mode}")
        return jsonify({"success": False, "error": "여행 스타일 모드는 'A' 또는 'B' 중 하나를 선택해야 합니다."}), 400

    # 3. Gemini API 클라이언트 초기화 및 API Key 확인
    try:
        client = get_gemini_client()
    except ValueError as ve:
        logger.error(f"[설정 오류] {str(ve)}")
        return jsonify({"success": False, "error": str(ve)}), 500

    # 4. 프롬프트 구성 및 Gemini API 호출 (안정적인 fallback 지원)
    prompt = build_prompt(data)
    candidate_models = [
        os.getenv("GEMINI_MODEL", "gemini-flash-latest"),
        "gemini-flash-latest",
        "gemini-flash-lite-latest",
        "gemini-3.6-flash"
    ]
    # 중복 제거
    models_to_try = list(dict.fromkeys(candidate_models))

    last_error = None
    for model_name in models_to_try:
        try:
            logger.info(f"[Gemini 호출 시도] 모델: {model_name}")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt
            )

            plan_text = response.text
            if not plan_text:
                raise ValueError("AI로부터 빈 응답이 반환되었습니다.")

            elapsed = time.time() - start_time
            logger.info(f"[Gemini 호출 성공] 모델: {model_name}, 소요 시간: {elapsed:.2f}초, 글자수: {len(plan_text)}자")

            return jsonify({
                "success": True,
                "plan": plan_text,
                "model": model_name,
                "elapsed_seconds": round(elapsed, 2)
            }), 200

        except (APIError, Exception) as err:
            logger.warning(f"[모델 {model_name} 실패] 다음 모델 시도 중... 원인: {err}")
            last_error = err
            continue

    elapsed = time.time() - start_time
    logger.error(f"[모든 모델 호출 실패] 소요 시간: {elapsed:.2f}초, 최종 오류: {str(last_error)}", exc_info=True)
    return jsonify({
        "success": False,
        "error": f"AI 일정 생성 중 오류가 발생했습니다: {str(last_error)}"
    }), 502

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    logger.info(f"AI Travel Planner 서버가 http://127.0.0.1:{port} 에서 시작됩니다.")
    app.run(host="0.0.0.0", port=port, debug=True)
