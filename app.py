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

def analyze_budget_tier(budget_str: str) -> tuple:
    """예산 문자열을 분석하여 예산 티어(초알뜰 실속형 / 스탠다드 밸런스형 / 럭셔리 프리미엄형)와 특화 지침을 생성합니다."""
    import re
    # '만' 앞의 숫자 또는 일반 숫자 추출
    match_man = re.search(r'(\d+)\s*만', budget_str)
    if match_man:
        total_won = int(match_man.group(1)) * 10000
    else:
        digits = re.findall(r'\d+', budget_str.replace(',', ''))
        if digits:
            num = int(digits[0])
            total_won = num if num > 10000 else num * 10000
        else:
            total_won = 1200000

    if total_won <= 600000:
        tier_title = "💰 [초알뜰 / 짠내투어 실속 가성비 티어]"
        tier_guide = f"""
* [⚠️ 중요 예산 티어 지침 - 총 {total_won:,}원 / 초알뜰 가성비]:
  - 숙소: 게스트하우스 1인실/도미토리, 캡슐 호텔, 가성비 비즈니스 호스텔 위주로 안내하세요.
  - 식비: 현지 로컬 재래시장 먹거리, 가성비 백반/노포, 대학가 맛집, 편의점 인기 꿀조합을 적극 추천하세요.
  - 교통: 1일/다일 무제한 대중교통 패스, 지하철/시내버스, 도보 위주로 동선을 극한으로 아끼세요.
  - 액티비티/체험: 무료 입장 공원/해변 산책, 무료 전망 스팟, 야경 감상, 올레길/숲길 트레킹, 무료 박물관의 날 등 비용 부담 없는 다채로운 무료/저가 체험을 풍성하게 구성하세요.
"""
    elif total_won <= 2200000:
        tier_title = "⚖️ [스탠다드 / 밸런스 여행 티어]"
        tier_guide = f"""
* [⚠️ 중요 예산 티어 지침 - 총 {total_won:,}원 / 스탠다드 밸런스]:
  - 숙소: 접근성과 청결도가 우수한 3~4성급 호텔, 깔끔한 시내 중심 부티크 호텔을 안내하세요.
  - 식비: 평점 4.6+ 현지 대표 시그니처 맛집, 유명 로컬 식당, 감성 오션뷰/루프탑 카페를 골고루 배정하세요.
  - 교통: 대중교통 및 교통 패스를 기본으로 하되, 짐 이동이나 야간 이동 시 택시/차량을 적절히 조합하세요.
  - 액티비티/체험: 주요 랜드마크 유료 입장권, 인기 테마파크, 일일 투어 버스, 원데이 클래스/체험 등 2~3개의 핵심 유료 액티비티를 알차게 포함하세요.
"""
    else:
        tier_title = "👑 [럭셔리 / 프리미엄 VIP 올인클루시브 티어]"
        tier_guide = f"""
* [⚠️ 중요 예산 티어 지침 - 총 {total_won:,}원 / 럭셔리 VIP]:
  - **최저가 계획과 차원이 다른 럭셔리 경험으로 계획 전체를 완전히 차별화하세요! 저가형/알뜰형 요소는 절대 배제하세요.**
  - 숙소: 5성급 최고급 럭셔리 호텔, 오션뷰 프라이빗 독채 풀빌라, 최고급 전통 료칸(노천탕 딸린 스위트룸)을 추천하세요.
  - 식비: 미슐랭 스타 레스토랑, 고급 파인다이닝 코스 요리, 호텔 프리미엄 뷔페, 최고급 루프탑 바 샴페인/와인 페어링을 추천하세요.
  - 교통: 공항 프라이빗 전용 픽업 리무진, 고급 수입 세단/SUV 렌터카, 우버 블랙/전용 콜택시를 기본 이동수단으로 명시하세요.
  - 액티비티/체험: **프라이빗 요트 세일링, 헬기/스카이다이빙/패러글라이딩 투어, VIP 패스트트랙 입장권, 5성급 호텔 시그니처 전신 스파 & 아로마 마사지, 단독 프라이빗 가이드 투어** 등 돈을 아끼지 않는 최상급 액티비티를 매일 1~2개씩 넉넉하게 배치하세요!
"""
    return tier_title, tier_guide

def build_prompt(data: dict) -> str:
    """사용자가 입력한 여행 조건과 예산 티어, 선택한 모드(A/B)에 따라 차별화된 프롬프트를 생성합니다."""
    destination = data.get("destination", "").strip()
    duration = data.get("duration", "").strip()
    budget = data.get("budget", "").strip()
    interests = data.get("interests", "").strip()
    companions = data.get("companions", "").strip()
    transportation = data.get("transportation", "").strip()
    accommodation = data.get("accommodation", "").strip()
    mode = data.get("mode", "A").strip().upper()
    travel_style = data.get("travel_style", "").strip()

    # 예산 등급 자동 분석
    tier_title, tier_guide = analyze_budget_tier(budget)

    # 여행 기조 스타일 처리
    if not travel_style:
        if mode == "B":
            travel_style = "여유로운 힐링 / 쉼이 있는 로컬 감성 여행"
        else:
            travel_style = "알찬 가성비 / 주요 랜드마크 최적 동선 투어"

    if mode == "B" or any(k in travel_style for k in ["힐링", "여유", "휴식", "부모님", "가족", "배려", "낭만", "인생샷"]):
        mode_title = f"여유로운 힐링 감성 중심 ({travel_style})"
        mode_instruction = f"""
- 사용자가 직접 설정한 여행 기조 스타일: **"{travel_style}"**
- [스타일 필수 준수]: 하루 1~2곳만 느긋하게 즐기는 여유로운 동선으로 구성하고, 사용자가 입력한 스타일 요구사항("{travel_style}")을 모든 일자의 오전/오후/저녁 활동과 방문지 선정에 최우선으로 반영하세요.
- 북적이는 관광지 대신 현지 감성, 예쁜 카페, 편안한 쉼터, 휴식 시간을 넉넉하게 배정하세요.
"""
    else:
        mode_title = f"알찬 핵심 투어 중심 ({travel_style})"
        mode_instruction = f"""
- 사용자가 직접 설정한 여행 기조 스타일: **"{travel_style}"**
- [스타일 필수 준수]: 주요 랜드마크와 핫플레이스를 놓치지 않고 동선을 최적화하여 알차게 둘러보도록 설계하고, 사용자가 입력한 스타일 요구사항("{travel_style}")을 시간대별 일정에 빈틈없이 반영하세요.
"""

    prompt = f"""
당신은 최고의 글로벌 여행 플래너이자 투어 컨설턴트입니다.
아래 사용자가 입력한 조건, **예산 등급 지침**, **여행 기조 스타일("{travel_style}")**을 철저히 반영하여, 보기 쉽고 체계적인 맞춤 여행 계획서를 **Markdown** 형식으로 작성해 주세요.

### [사용자 여행 기본 정보]
- 1. 여행지: {destination}
- 2. 여행 기간: {duration}
- 3. 예상 예산: {budget}
- 4. 주요 관심사/여행 테마: {interests}
- 5. 동행자: {companions}
- 6. 선호 이동수단: {transportation}
- 7. 숙소 선호 유형: {accommodation}
- 8. ⚡ 여행 기조 스타일: **{travel_style}**

### [💡 예산 등급 및 맞춤 지침]
- 적용 등급: {tier_title}
{tier_guide}

### [선택된 여행 기조 & 스타일 지침]
- 적용 스타일: **{travel_style}**
{mode_instruction}

---

### [작성 가이드라인 및 필수 제약 사항]
반드시 다음 항목들을 빠짐없이 포함하여 구조화된 Markdown 문서로 작성하세요.
각 항목은 이모지와 큰 제목(###), 표(Table), 글머리 기호(-)를 활용하여 가독성을 극대화해 주세요.

⚠️ [핵심 제약 사항 - 필수 준수]
- 실시간 정보가 필요한 입장료/티켓 가격, 교통 요금 및 각 매장/명소의 운영 시간/휴무일 등은 절대 사실처럼 단정하여 단일 값으로 확정 생성하지 말고, 반드시 **"(방문 전 최신 가격/운영시간 확인 필요)"** 또는 **"(확인 필요)"**라고 명확히 표시하세요.
- **각 추천 여행 코스마다 호텔 금액을 쪼개어 같이 적어두지 말고, 해당 코스 전체 '예상 가격(경비)'만 깔끔하게 적어주세요.** (숙박비를 별도로 분리하여 혼란을 주지 않도록 합니다.)
- **조금 더 싸게 할인받을 수 있는 실질적인 방법(조기 예매 할인, 모바일 패스, 사전 예매 혜택 등)을 상세히 설명하세요.**
- **예약이 힘들거나 웨이팅이 긴 인기 스팟은 사전 예약 팁과 함께 캐치테이블, 테이블링, 네이버 예약 등 추천 예약 앱/사이트를 반드시 안내하세요.**
- **예산 등급({tier_title})에 따라 식당 수준, 이동 수단, 유료 액티비티 여부가 확연히 차이 나도록 계획을 구성하세요.**
- **사용자가 작성/선택한 여행 기조 스타일("{travel_style}")이 전체 일정의 분위기와 동선에 선명하게 드러나야 합니다.**

# ✈️ {destination} {duration} 맞춤 여행 일정표
> **{tier_title}** | **여행 기조: {travel_style}**
> **💡 이번 예산 맞춤 여행 특징**: (설정하신 예산 {budget}에 맞춰 식사, 액티비티, 동선을 어떤 수준과 혜택으로 설계했는지 1~2줄 요약)

### 📱 [채팅 공유용 핵심 요약] 한눈에 보는 여행 가이드
(카카오톡 및 모바일 메신저로 친구나 동행자에게 공유했을 때 한눈에 파악할 수 있도록, 맨 처음에 장소, 가격, 활동을 명확히 요약하세요.)
- 📍 **여행 장소**: {destination}
- 💰 **총 예상 가격**: {budget} (1인 약 XX만원 기준 - 실시간 가격 확인 필요)
- 🎯 **핵심 활동**: (선택한 여행 기조를 반영한 대표 시그니처 액티비티 3가지 요약)
- 🏨 **숙소 스타일**: {accommodation} (호텔/리조트/감성숙소 등 형태)
- 🚗 **이동 수단**: {transportation}
- 🏷️ **할인 & 예약 팁**: (온라인 사전 예매 할인 및 캐치테이블/테이블링 예약 요약)

### 🗓️ [상세 계획] 1일차부터 일자별 세부 일정
(채팅 앱에서도 줄바꿈과 구분이 선명하게 보이도록 1일차, 2일차 순서대로 상세 일정을 제시하세요.)

#### ■ 1일차 (Day 1)
- 💰 **1일차 예상 가격**: 약 XX만원 내외 (확인 필요 - 호텔비 별도 분리하지 말고 해당 일차 통합 예상 경비 제시)
- 🌅 **오전 코스 & 이동**: (방문 장소, 추천 활동, 이동 소요시간)
- 🍴 **점심 미식**: (추천 식당 스타일 및 대표 로컬 메뉴)
- 🎯 **오후 핵심 액티비티**: (오늘의 하이라이트 체험 1~2개 구체적 명시)
- 🌙 **저녁 & 야경**: (추천 저녁 식사 및 야경/야간 명소/루프탑)
- 🏨 **숙소 휴식 팁**: (체크인 및 휴식 안내)
- *참고: 영업시간 및 입장 마감 시간은 '(방문 전 확인 필요)' 표기*

#### ■ 2일차 (Day 2부터 마지막 날까지 위와 동일한 형식으로 상세 작성)

### 📊 [가격 & 활동 종합 분석표]
가독성을 높이기 위해 마크다운 표(Table)로 가격과 활동의 핵심 차별화 포인트를 요약 제시하세요:

| 항목 분류 | 예상 비용 & 예산 가이드 | 주요 활동 & 시그니처 체험 | 여행 템포 & 추천 포인트 |
| :--- | :--- | :--- | :--- |
| **💰 총 예상 경비** | 총 {budget} (1인 약 XX만원 기준) | 알뜰/스탠다드/럭셔리 최적화 | 예산 초과 방지 최적 가성비 |
| **🏨 숙소 스타일** | (숙소 형태: 감성 호텔/리조트/료칸 등) | (접근성 및 주요 편의시설 특징) | 접근성 및 힐링 만족도 |
| **🎯 핵심 액티비티** | (체험 예상 총비용 약 XX만원) | (일정 중 가장 추천하는 대표 체험 2~3곳) | 특별한 경험 & 인생샷 명소 |
| **🍴 미식 & 식도락** | (식비 예상 약 XX만원) | (현지 대표 추천 메뉴 및 식당 스타일) | 웨이팅/로컬 찐맛집 |
| **🚗 이동 & 피로도** | (교통비 예상) | (주요 이동수단 {transportation} 및 동선) | 동선 피로도 최소화 |

### 🏷️ [스마트 할인 공략] 조금 더 싸게 즐기는 할인 꿀팁
- **온라인 사전 예매 할인**: 현장 발권 대비 10~25% 저렴하게 구매할 수 있는 e-티켓 및 얼리버드 예매처 (예: 클룩, 마이리얼트립 등)
- **통합 관광 패스 & 교통 패스 추천**: 해당 여행지 필수 패스(예: 투어패스, 메트로 24/48시간 패스, 주유패스 등)
- **카드사 제휴 / 환전 우대 / 모바일 쿠폰**: 간편결제 프로모션, 환전 수수료 우대, 현지 면세(Tax-Free) 환급 요령

### 🎟️ [예약 & 웨이팅 완벽 정복] 추천 예약 앱 및 핫플 공략법
- **예약 필수 핫플레이스 목록**: 일정 중 예약 없이는 방문이 어려운 인기 식당, 미슐랭/오마카세, 핫플 카페, 인기 어트랙션/전망대
- **추천 예약 플랫폼 & 앱**:
  * **캐치테이블 (CatchTable)**: 인기 레스토랑/오마카세 사전 예약 및 실시간 빈자리 알림
  * **테이블링 (Tabling)**: 현장 웨이팅을 대체하는 스마트 원격 줄서기 앱
  * **네이버 예약**: 국내 주요 명소 및 식당 예약, 사전 결제 할인 혜택
  * **해외 플랫폼**: **OpenTable**, **클룩(Klook)**, **포켓컨시어지**, 공식 홈페이지 사전 추첨/예약
- **예약 성공 팁 & 웨이팅 노하우**: 예약 오픈 날짜(매월 1일/D-30 등), 취소표 노리기 팁, 평일 애매한 시간대(오후 2~4시) 공략

### 💰 예상 경비 예산 분석표
- 표(Table)를 사용하여 항목별 예상 비용(숙소, 식비, 교통, 관광/체험, 예비비)과 총 예상 가격을 보기 쉽게 정리하세요.
- *참고: 실시간 환율 및 변동 가격 항목에는 '(확인 필요)' 표기*

### 🧭 최적 이동 경로 및 교통 수단 꿀팁
- 추천 이동 경로 및 선택된 이동수단({transportation}) 맞춤 활용법
- 현지 교통 패스, 환승, 티켓 예매 팁 (시간표/요금은 사전 확인 필요 명시)

### 🎒 필수 준비물 체크리스트 & 현지 안전 수칙
- 필수 준비물 (여권, 바우처, 계절 의류, 비상약 등)
- 치안, 결제 수단(현금 vs 카드/모바일페이), 현지 에티켓 및 응급상황 대처 요령

친절하고 전문적인 톤으로, 여행자가 바로 스마트폰으로 보면서 다닐 수 있을 정도로 구체적인 장소 이름과 유용한 할인/예약 팁을 함께 작성해 주세요.
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
