import os
import sys
import time
import json
import secrets
import zlib
import base64
import logging
from datetime import timedelta
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify, send_from_directory, session, redirect, url_for
from google import genai
from google.genai.errors import APIError

# .env 파일에서 환경변수 로드
load_dotenv()

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

# 로깅 설정 (시간, 로그 레벨, 메시지 포맷)
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY", "ai-travel-secret-key-7777-v1")
app.permanent_session_lifetime = timedelta(days=30)

# 공유 계획 인메모리 및 파일 캐시 스토리지 (/tmp는 Vercel serverless에서 쓰기 가능)
SHARED_PLANS_CACHE = {}
SHARED_PLANS_DIR = "/tmp/shared_plans"
try:
    os.makedirs(SHARED_PLANS_DIR, exist_ok=True)
except Exception:
    pass

def compress_plan(plan_data: dict) -> str:
    """계획 데이터를 zlib + base64url로 초경량 압축합니다."""
    try:
        raw = json.dumps(plan_data, ensure_ascii=False).encode("utf-8")
        comp = zlib.compress(raw, level=9)
        return base64.urlsafe_b64encode(comp).decode("utf-8").rstrip("=")
    except Exception as e:
        logger.warning(f"[계획 압축 실패] {e}")
        return ""

def decompress_plan(token: str) -> dict:
    """압축 토큰을 복원하여 계획 객체로 반환합니다."""
    try:
        if not token:
            return None
        pad = "=" * ((4 - len(token) % 4) % 4)
        raw_comp = base64.urlsafe_b64decode((token + pad).encode("utf-8"))
        decomp = zlib.decompress(raw_comp)
        return json.loads(decomp.decode("utf-8"))
    except Exception as e:
        logger.warning(f"[계획 복원 실패] {e}")
        return None

def is_authenticated() -> bool:
    """사이트 접속 비밀번호 인증 여부를 확인합니다."""
    site_pw = str(os.getenv("SITE_PASSWORD", "7777")).strip()
    if not site_pw:
        return True
    return bool(session.get("authenticated"))

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
    dietary_info = data.get("dietary_info", "").strip()
    start_date = data.get("start_date", "").strip()
    end_date = data.get("end_date", "").strip()
    entry_transport = data.get("entry_transport", "✈️ 공항 (항공편 도착)").strip()
    exit_transport = data.get("exit_transport", "✈️ 공항 (항공편 출발)").strip()

    date_label = duration
    if start_date and end_date:
        date_label = f"{start_date} ~ {end_date} ({duration})"
    elif start_date:
        date_label = f"{start_date} 출발 ({duration})"

    # 예산 등급 자동 분석
    tier_title, tier_guide = analyze_budget_tier(budget)

    # 알레르기 및 음식 기피 지침
    if dietary_info:
        dietary_guide = f"""
- 🚨 **[사용자 알레르기 및 기피 음식 엄격 준수 - 최우선]**:
  * 사용자가 지정한 주의 항목: **"{dietary_info}"**
  * 일정표의 모든 식당, 카페, 간식 추천에서 위 알레르기 유발 식재료를 철저히 배제하거나, 방문 시 요청 가능한 안전 대체 메뉴를 최우선으로 안내하세요.
"""
    else:
        dietary_guide = """
- ⚠️ **[알레르기 안심 가이드 기본 준수]**:
  * 대표 음식 및 디저트 추천 시 흔히 알레르기를 유발할 수 있는 성분(갑각류/새우/게, 견과류/땅콩, 돼지고기, 유제품, 글루텐, 메밀 등)을 명확히 명시하고, 알레르기가 있는 여행자를 위한 대체 메뉴/디저트를 안내하세요.
"""

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
- [동선 밀착 & 이동시간 최소화]: 방문지 사이의 이동시간은 최대 10~15분 이내로 제한하고, 점심/카페/저녁/숙소는 모두 당일 코스 반경 5km 이내에서 완벽히 해결하여 이동 피로를 극소화하세요.
"""
    else:
        mode_title = f"알찬 핵심 투어 중심 ({travel_style})"
        mode_instruction = f"""
- 사용자가 직접 설정한 여행 기조 스타일: **"{travel_style}"**
- [스타일 필수 준수]: 주요 랜드마크와 핫플레이스를 놓치지 않고 동선을 최적화하여 알차게 둘러보도록 설계하되, 동서남북으로 튀지 않는 순차 선형 동선으로 구성하세요.
- [동선 밀착 & 이동시간 최소화]: 방문지 사이의 이동시간을 최소화하고, 점심/저녁 식당과 숙소는 철저히 경로상의 가까운 위치(차량 5~10분, 도보권)로 묶어 길 위에서 버리는 시간을 원천 차단하세요.
"""

    prompt = f"""
당신은 최고의 글로벌 여행 플래너이자 투어 컨설턴트입니다.
아래 사용자가 입력한 조건, **여행 날짜/시기**, **입국/귀국 교통 거점**, **예산 등급 지침**, **여행 기조 스타일("{travel_style}")**, **음식/알레르기 지침**을 철저히 반영하여, 보기 쉽고 체계적인 맞춤 여행 계획서를 **Markdown** 형식으로 작성해 주세요.

### [사용자 여행 기본 정보]
- 1. 여행지: {destination}
- 2. 📅 여행 기간 및 일정: **{date_label}**
- 3. 🛫 첫날(입국/도착) 시작 거점: **{entry_transport}**
- 4. 🛬 마지막날(귀국/출발) 종료 거점: **{exit_transport}**
- 5. 예상 예산: {budget}
- 6. 주요 관심사/여행 테마: {interests}
- 7. 동행자: {companions}
- 8. 선호 이동수단: {transportation}
- 9. 숙소 선호 유형: {accommodation}
- 10. ⚡ 여행 기조 스타일: **{travel_style}**
- 11. 🍽️ 음식 선호 & 알레르기/기피: **{dietary_info if dietary_info else '특이사항 없음 (기본 알레르기 안심 가이드 제공)'}**

### [💡 예산 등급 및 맞춤 지침]
- 적용 등급: {tier_title}
{tier_guide}

### [선택된 여행 기조 & 스타일 지침]
- 적용 스타일: **{travel_style}**
{mode_instruction}

### [🍽️ 음식 & 알레르기 안심 가이드 지침]
{dietary_guide}

---

### [작성 가이드라인 및 필수 제약 사항]
반드시 다음 항목들을 빠짐없이 포함하여 구조화된 Markdown 문서로 작성하세요.
각 항목은 이모지와 큰 제목(###), 표(Table), 글머리 기호(-)를 활용하여 가독성을 극대화해 주세요.

⚠️ [핵심 제약 사항 - 필수 준수]
- **🌤️ [필수: 해당 여행 시기({date_label}) 날씨·기온 & 추천 옷차림 코디 가이드]**:
  * {destination}의 {date_label} 시기 예상 평균 기온(최저/최고 ℃), 일교차, 계절 특성(강수, 바람, 바다 날씨 등)을 정밀 분석하세요.
  * **👕 추천 옷차림 (상의, 하의, 아우터, 신발)**: 낮 시간대 활동과 아침저녁 일교차에 대비한 실질적이고 세련된 코디 팁을 제공하세요.
  * **🎒 계절 필수 준비물 & 날씨 대비 소지품**: 접이식 우산, 방풍/보온 아우터, 자외선 차단제 등 해당 시기 필수 소지품을 짚어주세요.
  * *(단, 기상청/현지 기상 변동 가능성을 고려하여 "출발 전 최신 주간 날씨 예보 확인 필요"를 명시하세요.)*
- **🎉 [필수: 해당 여행 시기({date_label}) 추천 대표 지역 축제 & 시즌 이벤트 BEST 2~3]**:
  * 여행 기간({date_label})에 {destination}에서 즐길 수 있는 실제 유명 지역 축제, 야간 마켓, 꽃/단풍/눈꽃 명소, 시즌 제철 페스티벌 2~3곳을 추천하고, 일정 중 자연스럽게 만끽할 수 있도록 코스에 반영하세요.
- **🚨 [필수 준수: 1일차(첫날) 시작은 무조건 '{entry_transport}'에서 시작]**:
  * 1일차 첫 코스는 반드시 **{entry_transport}** 도착/입국 및 {transportation} 픽업/승차로 시작해야 합니다!
  * 비행기/공항이면: `[공항] 도착 및 입국 수속 ➜ 이동수단({transportation}) 픽업 ➜ 첫 번째 오전 목적지로 출발`
  * 배/항구이면: `[항구/여객터미널] 도착 및 하선 ➜ 이동수단({transportation}) 픽업 ➜ 첫 번째 오전 목적지로 출발`
  * 기차역이면: `[KTX/기차역] 도착 ➜ 이동수단 탑승 ➜ 첫 번째 목적지로 출발`
  * 버스/자차면: `[터미널/자차 출발지] 도착 ➜ 첫 번째 목적지로 출발`
- **🚨 [필수 준수: 마지막 날(귀국일) 종료는 무조건 '{exit_transport}'에서 마무리]**:
  * 마지막 일차의 최종 종료 지점은 반드시 **{exit_transport}**여야 합니다!
  * 마지막 날 오후/저녁 코스: `[마지막 여행지/기념품 샵] ➜ [{exit_transport}]으로 이동 ➜ 체크인/발권/수속 ➜ 면세점/특산물 쇼핑 및 휴식 ➜ 탑승 및 안전한 귀국`
  * 여행자가 귀국편을 놓치지 않도록 **"탑승 수속을 위해 출발 1.5~2시간 전 거점 도착 권장"** 문구를 반드시 포함하세요.
- 실시간 정보가 필요한 입장료/티켓 가격, 교통 요금 및 각 매장/명소의 운영 시간/휴무일 등은 절대 사실처럼 단정하여 단일 값으로 확정 생성하지 말고, 반드시 **"(방문 전 최신 가격/운영시간 확인 필요)"** 또는 **"(확인 필요)"**라고 명확히 표시하세요.
- **각 추천 여행 코스마다 호텔 금액을 쪼개어 같이 적어두지 말고, 해당 코스 전체 '예상 가격(경비)'만 깔끔하게 적어주세요.** (숙박비를 별도로 분리하여 혼란을 주지 않도록 합니다.)
- **🏨 [구글 지도 기반 근처 유명 숙소 & 특징 상세 추천]**: 여행 동선 권역에 밀착된 구글 지도 평점 4.6+ 이상의 검증된 실제 유명 숙소 3곳(호텔/리조트/펜션/료칸)을 선정하여, 평점, 핵심 특징 3가지, 예상 1박 요금대를 상세히 작성하세요.
- **조금 더 싸게 할인받을 수 있는 실질적인 방법(조기 예매 할인, 모바일 패스, 사전 예매 혜택 등)을 상세히 설명하세요.**
- **예약이 힘들거나 웨이팅이 긴 인기 스팟은 사전 예약 팁과 함께 캐치테이블, 테이블링, 네이버 예약 등 추천 예약 앱/사이트를 반드시 안내하세요.**
- **⚠️ [놓치면 아쉬운 대표 음식 & 디저트 추가 추천 + 알레르기 안심 가이드 필수]**:
  * 기본 일정표에 포함된 식사 외에도, **해당 여행지({destination})에 방문했을 때 꼭 먹어봐야 할 유명 대표 향토 음식 4가지**와 **인기 감성 디저트/카페 간식 3가지**를 별도 섹션으로 풍성하게 추천하세요.
  * 각 메뉴마다 1) 대표 특징 및 추천 이유, 2) **⚠️ 주요 식재료 & 알레르기 유발 주의 성분(갑각류, 조개류, 견과류/땅콩, 돼지고기, 유제품, 글루텐, 메밀 등)**, 3) **💡 알레르기 안심 대체 메뉴/디저트 옵션**을 상세히 작성하세요!
- **⚠️ [저장한 여행지 코스 예산 초과(오버) 감지 및 가성비 대안 추천 필수]**:
  * 사용자가 선택한 저장 여행지 코스(또는 관심사/목적지)가 원래 일반적인 소요 경비보다 현재 설정한 예산({budget})이 낮아서 예산이 초과(오버)될 수 있는 경우:
    1) 상단 요약에 **"⚠️ [예산 초과 안내]: 선택하신 저장 코스는 원래 예상 비용(약 XX만원)으로, 현재 설정 예산({budget})보다 약 XX만원 초과(오버)됩니다."**라고 명확히 짚어주세요.
    2) **"💡 [비슷한 감성이지만 더 저렴한 가성비 대체 계획 추천]"** 섹션을 작성하여, 원래 원했던 감성(오션뷰, 힐링, 로컬 미식 등)은 100% 동일하게 즐길 수 있으면서도 지출을 줄일 수 있는 현지 도민 추천 가성비 대체 명소, 무료 입장 뷰포인트, 합리적인 대중교통/패스, 가성비 감성 숙소로 최적화한 가성비 알뜰 대체 일정을 제시하세요!
- **🚨 [초강력 동선 최적화: 이동시간 최소화 & 경로 밀착형 식당·숙소 배치 (절대 준수)]**:
  * **[1. 권역 분리 & 당일 지그재그 이동 절대 금지]**:
    - 하루는 오직 하나의 밀착 생활권역(반경 5~10km 내외, 차량 편도 10~20분, 대중교통 25분 이내)으로 한정하세요.
    - 동서남북을 오가는 지그재그식 이동은 절대 금지하며, 반드시 한쪽 방향으로 흐르는 "선형(순차) 최적 경로"로 설계하세요.
  * **[2. 밥(식당) & 카페는 반드시 당일 방문지 도보권 또는 이동 경로 5~10분 이내에서만 추천]**:
    - **점심**: 오전 방문 명소에서 도보 5~10분 거리이거나, 오후 목적지로 가는 짧은 길목에 위치한 검증된 로컬 맛집만 선정하세요.
    - **저녁**: 오후 마지막 관광지 바로 근처(도보 5~10분)이거나, 그날 밤 투숙할 숙소에서 걸어갈 수 있는 맛집으로 선정하여 식사 후 편안하게 바로 숙소로 체크인할 수 있게 하세요.
  * **[3. 숙소는 반드시 당일 마지막 일정이 끝나는 바로 그 권역에 위치 필수]**:
    - 밤늦게 장거리 운전을 하지 않도록, Day N의 숙소는 반드시 Day N의 오후/저녁 일정이 끝나는 바로 그 동네에 잡으세요.
  * **[4. 구간별 예상 이동시간 및 이동거리 투명 표기]**:
    - 모든 시간대마다 `🚗 이동 정보 & 소요시간: (예: 차로 7분, 3.2km / 도보 5분)`을 명확히 표기하세요.
- **⚠️ [교통수단별 맞춤 동선 & 대중교통 최적화 필수]**:
  * 사용자가 입력한 이동수단("{transportation}")을 엄격히 분석하여 일정을 설계하세요.
- **예산 등급({tier_title})에 따라 식당 수준, 이동 수단, 유료 액티비티 여부가 확연히 차이 나도록 계획을 구성하세요.**
- **사용자가 작성/선택한 여행 기조 스타일("{travel_style}")이 전체 일정의 분위기와 동선에 선명하게 드러나야 합니다.**

# ✈️ {destination} {date_label} 맞춤 여행 일정표
> **{tier_title}** | **여행 기조: {travel_style}**  
> **출도착 거점**: 시작({entry_transport}) ➔ 종료({exit_transport})  
> **💡 이번 예산 맞춤 여행 특징**: (설정하신 예산 {budget}에 맞춰 식사, 액티비티, 동선을 어떤 수준과 혜택으로 설계했는지 1~2줄 요약)

### 📱 [채팅 공유용 핵심 요약] 한눈에 보는 여행 가이드
- 📍 **여행 장소 & 기간**: {destination} ({date_label})
- 🛫 **첫날 ➔ 마지막날 거점**: {entry_transport} 시작 ➜ {exit_transport} 귀국
- 💰 **총 예상 가격**: {budget} (1인 약 XX만원 기준 - 실시간 가격 확인 필요)
- 🎯 **핵심 활동**: (선택한 여행 기조를 반영한 대표 시그니처 액티비티 3가지 요약)
- 🏨 **숙소 스타일**: {accommodation} (당일 동선 권역별 최적 매칭)
- 🚗 **이동 수단**: {transportation}
- 🏷️ **할인 & 예약 팁**: (온라인 사전 예매 할인 및 캐치테이블/테이블링 예약 요약)

### 🌤️ [여행 시기 맞춤 날씨 & 옷차림 코디 가이드]
- 🌡️ **{destination} ({date_label}) 예상 기후**: (평균 최저 XX℃ / 최고 XX℃, 일교차 및 강수/바람 특성 요약 - 실시간 예보 확인 필요)
- 👔 **추천 옷차림 가이드**: (낮 시간대 활동복, 아침저녁 쌀쌀함 대비 아우터, 도보 최적화 편안한 신발 등 구체적 코디 팁)
- 🎒 **시즌별 필수 소지품**: (해당 시기 날씨와 여행지 특성에 맞춘 실용 아이템 3~4가지)

### 🎉 [{date_label} 시즌 추천 대표 축제 & 이벤트]
- **[축제/이벤트 1]**: (축제명 / 시기 / 주요 볼거리 & 즐길거리 팁)
- **[축제/이벤트 2]**: (축제명 / 시기 / 주요 볼거리 & 즐길거리 팁)

### 💡 [예산 초과 분석 & 비슷한 분위기의 가성비 대체 추천]
(원래 코스가 예산을 초과하는 경우 반드시 작성하고, 아닐 경우 예산 초과 방지 팁으로 작성하세요.)

### 🗓️ [일자별 상세 일정표] 한눈에 쏙 들어오는 일자별 완벽 코스

---

### 🌟 [Day 1] 1일차 : ({entry_transport} 도착 ➜ 1일차 권역 집중 테마)
> 📍 **1일차 밀착 동선**: {entry_transport} ➜ (차로 XX분) 첫 명소 ➜ 점심 ➜ 오후 명소 ➜ 저녁 ➜ 권역 숙소  
> ⏱️ **1일차 총 이동시간**: 약 XX분 내외 (권역 밀착 최적 동선)  
> 💰 **1일차 예상 경비**: 약 XX만원 내외 (확인 필요)

#### 🌅 [오전] ({entry_transport} 도착 ➜ 첫 번째 명소 이동)
- 📍 **도착 & 첫 코스**: ({entry_transport} 도착 ➜ 입국/하선 수속 ➜ {transportation} 픽업 후 첫 번째 오전 목적지로 출발)
- 🚗 **이동 정보 & 소요시간**: ({entry_transport} ➜ 첫 목적지: 약 XX분, XX km)
- 💡 **오전 여행 꿀팁**: (혼잡 회피 팁, 포토존, '방문 전 확인 필요' 명시)

#### 🍴 [점심] (오전 방문지 근처/오후 경로 5~10분 이내 맛집 & 메뉴)
- 📍 **추천 미식**: (오전 명소 도보 5분 또는 이동 길목 차량 5~10분 거리의 시그니처 로컬 식당 & 대표 메뉴)
- 🚗 **이동 정보 & 소요시간**: (오전 장소에서 도보 XX분 또는 차로 XX분, XX km)

#### 🎯 [오후] (점심 식당에서 10~15분 거리 권역 하이라이트)
- 📍 **핵심 관광 & 액티비티**: (점심 식당과 인접한 같은 권역 내 시그니처 명소 1~2곳)
- 🚗 **이동 정보 & 소요시간**: (점심 식당에서 차로 XX분 / 도보 XX분, XX km)

#### 🌙 [저녁 & 야경] (오후 명소 도보권 또는 숙소 바로 앞 로컬 만찬)
- 📍 **저녁 만찬**: (오후 명소 도보 5~10분 또는 숙소 인근 로컬 찐맛집)
- 🚗 **이동 정보 & 소요시간**: (오후 명소에서 차로 XX분 / 도보 XX분, XX km)

#### 🏨 [숙소 휴식] (당일 권역 내 {accommodation} 스타일 숙소)
- 📍 **숙소 체크인**: (저녁 식당에서 5~10분 거리 숙소 체크인)

---

(2일차 이후부터 마지막 전날까지 🌅 [오전], 🍴 [점심], 🎯 [오후], 🌙 [저녁], 🏨 [숙소] 형식으로 상세 작성)

---

### 🌟 [Day N] 마지막 날 : (마지막 날 핵심 일정 ➜ {exit_transport} 이동 & 안전한 귀국)
> 📍 **마지막 날 동선**: 숙소 체크아웃 ➜ 오전 명소 ➜ 점심 ➜ 마지막 기념품 샵 ➜ {exit_transport} (귀국 수속 및 탑승)  
> ⏱️ **마지막 날 이동시간**: 약 XX분 내외  
> 💰 **마지막 날 예상 경비**: 약 XX만원 내외 (확인 필요)

#### 🌅 [오전] (숙소 체크아웃 ➜ 가벼운 산책 또는 명소)
- 📍 **방문 장소**: (이동 동선상 부담 없는 마지막 명소)
- 🚗 **이동 정보 & 소요시간**: ...

#### 🍴 [점심] (공항/항구 이동 길목의 든든한 마지막 만찬)
- 📍 **추천 미식**: ({exit_transport} 방향 이동 길목의 든든한 로컬 맛집)
- 🚗 **이동 정보 & 소요시간**: ...

#### 🏁 [오후/저녁] ({exit_transport} 도착 ➜ 수속 ➜ 귀국)
- 📍 **최종 행선지**: (마지막 기념품 쇼핑 ➜ {exit_transport} 도착 ➜ 체크인/발권/수속 ➜ 면세점/특산품 쇼핑 및 휴식 ➜ 탑승 및 안전한 귀국)
- 🚗 **이동 정보 & 소요시간**: (마지막 장소 ➜ {exit_transport}: 약 XX분, XX km - 탑승 수속을 위해 출발 1.5~2시간 전 거점 도착 권장)
- 💡 **귀국 수속 꿀팁**: (모바일 체크인, 면세품 인도장 위치, 환급 요령 등)
- 🚗 **이동 정보 & 소요시간**: (오후 명소에서 차로 XX분 / 도보 XX분, XX km)
- ✨ **야간 명소 & 산책**: (숙소 바로 앞 해변 산책로, 야경 스팟, 도보권 야시장 등)

#### 🏨 [숙소 휴식] (저녁 식당에서 5~10분 거리 당일 권역 내 숙소)
- 📍 **숙소 체크인 팁**: (당일 저녁 장소에서 차로 5~10분 / 도보 5분 거리의 {accommodation} 스타일 숙소)
- 🚗 **이동 정보 & 소요시간**: (저녁 식당에서 도보 XX분 또는 차로 XX분, XX km - 야간 장거리 운전 피로 제로)

---

### 🌟 [Day 2] 2일차 : (2일차 핵심 테마 제목 - 예: 사려니숲길 피톤치드 힐링 & 성산일출봉 오션뷰)
> 📍 **2일차 동선 한눈에 보기**: ...  
> 💰 **2일차 예상 경비**: 약 XX만원 내외 (확인 필요)

(위 1일차와 동일하게 🌅 [오전], 🍴 [점심], 🎯 [오후], 🌙 [저녁], 🏨 [숙소] 형식으로 소제목을 명확히 구분하여 선명하고 가독성 높게 작성하세요.)

---

### 🌟 [Day 3] 3일차 (마지막 날까지 위와 동일한 형식으로 명확하게 작성)

---

### 📊 [가격 & 활동 종합 분석표]
가독성을 높이기 위해 마크다운 표(Table)로 가격과 활동의 핵심 차별화 포인트를 요약 제시하세요:

| 항목 분류 | 예상 비용 & 예산 가이드 | 주요 활동 & 시그니처 체험 | 여행 템포 & 추천 포인트 |
| :--- | :--- | :--- | :--- |
| **💰 총 예상 경비** | 총 {budget} (1인 약 XX만원 기준) | 알뜰/스탠다드/럭셔리 최적화 | 예산 초과 방지 최적 가성비 |
| **🏨 숙소 스타일** | (숙소 형태: 감성 호텔/리조트/료칸 등) | (접근성 및 주요 편의시설 특징) | 접근성 및 힐링 만족도 |
| **🎯 핵심 액티비티** | (체험 예상 총비용 약 XX만원) | (일정 중 가장 추천하는 대표 체험 2~3곳) | 특별한 경험 & 인생샷 명소 |
| **🍴 미식 & 식도락** | (식비 예상 약 XX만원) | (현지 대표 추천 메뉴 및 식당 스타일) | 웨이팅/로컬 찐맛집 |
| **🚗 이동 & 피로도** | (교통비 예상) | (주요 이동수단 {transportation} 및 동선) | 동선 피로도 최소화 |

### 🍽️ [놓치면 아쉬운 {destination} 대표 미식 & 감성 디저트 컬렉션 (⚠️ 알레르기 안심 가이드)]
(기본 일정표에 포함된 식당 외에도, {destination}에 오면 꼭 먹어봐야 할 대표 향토 음식과 디저트를 추가 추천합니다. 알레르기나 기피 음식이 있는 여행자를 위해 유발 성분 및 안심 대체 메뉴를 함께 안내하세요.)

#### 🍲 1) {destination} 대표 시그니처 로컬 음식 BEST 4
- **[로컬 음식 1]** (예: 흑돼지 근고기, 고기국수, 갈치조림/구이, 전복돌솥밥, 보말칼국수, 몸국 등)
  * 😋 **맛 & 추천 포인트**: (특징 및 추천 로컬 식당 분위기)
  * ⚠️ **주요 식재료 & 알레르기 주의**: (예: 돼지고기, 갑각류, 조개류, 메밀 등)
  * 💡 **알레르기 안심 대체 메뉴**: (예: 돼지고기 기피 시 성게미역국이나 옥돔구이, 해산물 알레르기 시 흑돼지 수육)
- **[로컬 음식 2]**
  * 😋 **맛 & 추천 포인트**: ...
  * ⚠️ **주요 식재료 & 알레르기 주의**: ...
  * 💡 **알레르기 안심 대체 메뉴**: ...
- **[로컬 음식 3]**
  * 😋 **맛 & 추천 포인트**: ...
  * ⚠️ **주요 식재료 & 알레르기 주의**: ...
  * 💡 **알레르기 안심 대체 메뉴**: ...
- **[로컬 음식 4]**
  * 😋 **맛 & 추천 포인트**: ...
  * ⚠️ **주요 식재료 & 알레르기 주의**: ...
  * 💡 **알레르기 안심 대체 메뉴**: ...

#### 🧁 2) 감성 로컬 디저트 & 시그니처 카페 간식 BEST 3
- **[로컬 디저트 1]** (예: 우도 땅콩 아이스크림/라떼, 제주 감귤/한라봉 젤라또 & 타르트, 오메기떡, 구좌 당근케이크 등)
  * 🍰 **달콤 포인트 & 즐기는 법**: (디저트 매력 및 인기 카페 스타일)
  * ⚠️ **주요 식재료 & 알레르기 주의**: (예: 땅콩/견과류, 유제품(우유/버터), 밀가루, 계란 등)
  * 💡 **알레르기 안심 대체 디저트**: (예: 땅콩/견과류 알레르기 시 한라봉 과일 소르베, 유제품 알레르기 시 100% 착즙 생과일주스 또는 순수 쌀 쑥떡)
- **[로컬 디저트 2]**
  * 🍰 **달콤 포인트 & 즐기는 법**: ...
  * ⚠️ **주요 식재료 & 알레르기 주의**: ...
  * 💡 **알레르기 안심 대체 디저트**: ...
- **[로컬 디저트 3]**
  * 🍰 **달콤 포인트 & 즐기는 법**: ...
  * ⚠️ **주요 식재료 & 알레르기 주의**: ...
  * 💡 **알레르기 안심 대체 디저트**: ...

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

### 🏨 [구글 지도 평점 4.6+ 근처 유명 숙소 & 실시간 예약 가이드]
(여행 일정 동선과 예산에 최적화된 실제 유명 숙소 3곳을 엄선하여 안내하세요)
- **[추천 숙소 1] (실제 유명 호텔/리조트/펜션/료칸 이름)**:
  * ⭐ **구글 지도 평점 & 후기**: (예: 4.7★ / 리뷰 1,800+개)
  * 📍 **위치 & 동선 특징**: (Day N 주요 관광지 및 동선에서 차로 X분 거리)
  * 💡 **핵심 특징 & 장점**: (예: 통창 파노라마 오션뷰, 야외 온천 노천탕, 풍성한 조식 뷔페, 무료 주차/픽업)
  * 💰 **예상 1박 요금대**: (약 XX만원 ~ XX만원)
- **[추천 숙소 2] (숙소명)**:
  * ⭐ **구글 지도 평점 & 후기**: ...
  * 📍 **위치 & 동선 특징**: ...
  * 💡 **핵심 특징 & 장점**: ...
  * 💰 **예상 1박 요금대**: ...
- **[추천 숙소 3] (숙소명)**:
  * ⭐ **구글 지도 평점 & 후기**: ...
  * 📍 **위치 & 동선 특징**: ...
  * 💡 **핵심 특징 & 장점**: ...
  * 💰 **예상 1박 요금대**: ...

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

@app.route("/", methods=["GET", "POST"])
@app.route("/api/index", methods=["GET", "POST"])
@app.route("/api/index.py", methods=["GET", "POST"])
def index():
    """메인 페이지를 렌더링하거나, 로그아웃/비밀번호 검증/일정 생성을 처리합니다."""
    # 0. 로그아웃 요청 처리 (?action=logout 또는 ?logout=true)
    if request.args.get("action") == "logout" or request.args.get("logout") == "true":
        return logout()

    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        # 비밀번호 검증 요청인 경우 즉시 verify_password로 분기
        if "password" in data or "password" in request.form:
            return verify_password()

        # AI 일정 생성 요청인 경우 인증 확인
        if not is_authenticated():
            return jsonify({"success": False, "error": "접속 비밀번호 인증이 필요합니다."}), 401
        return generate_plan()

    # GET 요청: 미인증 시 로그인 화면 (공유 링크 여부 파악)
    if not is_authenticated():
        is_shared = bool(request.args.get("share") or request.args.get("d"))
        return render_template("login.html", is_shared=is_shared)
    return render_template("index.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    """비밀번호 직접 입력 폼 처리 및 로그인 화면 제공"""
    if is_authenticated():
        target = "/"
        if request.query_string:
            target += f"?{request.query_string.decode('utf-8')}"
        return redirect(target)

    if request.method == "POST":
        return verify_password()

    is_shared = bool(request.args.get("share") or request.args.get("d"))
    return render_template("login.html", is_shared=is_shared)

@app.route("/api/verify-password", methods=["POST"])
@app.route("/verify-password", methods=["POST"])
def verify_password():
    """비밀번호 검증 및 세션 발급 API (JSON 및 Form 모두 지원)"""
    data = request.get_json(silent=True) or {}
    input_pw = str(data.get("password") or request.form.get("password") or "").strip()
    site_pw = str(os.getenv("SITE_PASSWORD", "7777")).strip()

    if input_pw == site_pw:
        session.permanent = True
        session["authenticated"] = True
        logger.info("[인증 성공] 비밀번호 일치 (7777)")
        if request.is_json:
            return jsonify({"success": True, "message": "인증되었습니다."}), 200
        
        target = "/"
        if request.query_string:
            target += f"?{request.query_string.decode('utf-8')}"
        return redirect(target)
    else:
        logger.warning("[인증 실패] 비밀번호 불일치")
        if request.is_json:
            return jsonify({"success": False, "error": "비밀번호가 올바르지 않습니다. 다시 입력해주세요."}), 401
        is_shared = bool(request.args.get("share") or request.args.get("d"))
        return render_template("login.html", error="비밀번호가 올바르지 않습니다. 다시 입력해주세요.", is_shared=is_shared)

@app.route("/share-plan", methods=["POST"])
@app.route("/api/share", methods=["POST"])
def create_share_link():
    """현재 계획을 공유 가능한 고유 링크와 압축 토큰으로 생성합니다."""
    data = request.get_json(silent=True) or {}
    plan = data.get("plan")
    if not plan:
        return jsonify({"success": False, "error": "공유할 계획 데이터가 없습니다."}), 400

    share_id = f"s_{secrets.token_hex(4)}"
    token = compress_plan(plan)

    # 1. 인메모리 캐시 저장
    SHARED_PLANS_CACHE[share_id] = plan

    # 2. 로컬 /tmp 파일 저장
    try:
        p_path = os.path.join(SHARED_PLANS_DIR, f"{share_id}.json")
        with open(p_path, "w", encoding="utf-8") as f:
            json.dump(plan, f, ensure_ascii=False)
    except Exception as e:
        logger.warning(f"[공유 파일 저장 실패] {e}")

    # 프로토콜 및 호스트 보정 (Vercel 배포 시 https 보장)
    host_url = request.host_url.rstrip("/")
    if "vercel.app" in host_url and host_url.startswith("http://"):
        host_url = "https://" + host_url[7:]

    share_url = f"{host_url}/?share={share_id}&d={token}"

    return jsonify({
        "success": True,
        "share_id": share_id,
        "token": token,
        "share_url": share_url
    }), 200

@app.route("/share-plan/<share_id>", methods=["GET"])
@app.route("/api/share/<share_id>", methods=["GET"])
def get_shared_plan(share_id):
    """공유 ID 또는 압축 토큰을 통해 원본 여행 계획을 반환합니다."""
    # 1. 인메모리 캐시 확인
    if share_id in SHARED_PLANS_CACHE:
        return jsonify({"success": True, "plan": SHARED_PLANS_CACHE[share_id]}), 200

    # 2. 파일 스토리지 확인
    p_path = os.path.join(SHARED_PLANS_DIR, f"{share_id}.json")
    if os.path.exists(p_path):
        try:
            with open(p_path, "r", encoding="utf-8") as f:
                plan = json.load(f)
                SHARED_PLANS_CACHE[share_id] = plan
                return jsonify({"success": True, "plan": plan}), 200
        except Exception:
            pass

    # 3. 쿼리 파라미터 d (압축 토큰)로 무손실 복원
    token = request.args.get("d") or ""
    if token:
        plan = decompress_plan(token)
        if plan:
            SHARED_PLANS_CACHE[share_id] = plan
            return jsonify({"success": True, "plan": plan}), 200

    return jsonify({"success": False, "error": "공유된 여행 계획을 찾을 수 없습니다."}), 404

@app.route("/share-plan-decode", methods=["GET", "POST"])
@app.route("/api/share/decode", methods=["GET", "POST"])
def decode_shared_token():
    """압축 토큰을 디코딩하여 원본 계획으로 복원합니다."""
    token = request.args.get("d") or (request.get_json(silent=True) or {}).get("token") or ""
    if not token:
        return jsonify({"success": False, "error": "토큰이 필요합니다."}), 400
    plan = decompress_plan(token)
    if plan:
        return jsonify({"success": True, "plan": plan}), 200
    return jsonify({"success": False, "error": "복원에 실패했습니다."}), 400


@app.route("/share/<share_id>")
def redirect_share(share_id):
    """/share/<share_id> 접속 시 메인 페이지 공유 링크로 리다이렉트합니다."""
    qs = request.query_string.decode("utf-8") if request.query_string else ""
    target = f"/?share={share_id}"
    if qs:
        target += f"&{qs}"
    return redirect(target)

@app.route("/logout")
def logout():
    """세션을 완전히 삭제하고 로그인 화면으로 리다이렉트합니다."""
    session.clear()
    session.pop("authenticated", None)
    logger.info("[로그아웃] 세션 및 쿠키 초기화")
    response = redirect("/")
    response.delete_cookie(app.config.get("SESSION_COOKIE_NAME", "session"))
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    return response

@app.route("/debug-env")
def debug_env():
    info = {k: str(v) for k, v in request.environ.items() if isinstance(v, (str, int, bool))}
    return jsonify(info)

@app.route("/favicon.ico")
def favicon():
    """브라우저 기본 요청 파비콘(비행기 아이콘)을 제공합니다."""
    return send_from_directory(os.path.join(app.root_path, "static"), "favicon.svg", mimetype="image/svg+xml")

@app.route("/manifest.json")
def manifest():
    """PWA 웹 앱 매니페스트를 제공합니다."""
    return send_from_directory(os.path.join(app.root_path, "static"), "manifest.json", mimetype="application/manifest+json")

@app.route("/sw.js")
def service_worker():
    """PWA 서비스 워커를 루트 스코프로 제공합니다."""
    response = send_from_directory(os.path.join(app.root_path, "static", "js"), "sw.js", mimetype="application/javascript")
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    return response

@app.route("/generate", methods=["POST"])
def generate_plan():
    """사용자의 입력값을 검증하고 Gemini API를 호출하여 여행 계획을 반환합니다."""
    start_time = time.time()

    # 0. 비밀번호 인증 여부 확인
    if not is_authenticated():
        logger.warning("[요청 차단] 미인증 사용자의 AI 생성 요청")
        return jsonify({"success": False, "error": "접속 비밀번호 인증이 필요합니다. 새로고침 후 로그인해주세요."}), 401

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
        os.getenv("GEMINI_MODEL", "gemini-3.5-flash"),
        "gemini-3.5-flash",
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
