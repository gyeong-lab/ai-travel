/**
 * agoda AI Travel Planner - Frontend Application Logic
 * Every button and interaction is 100% functional.
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. 폼 및 입력 필드
    const travelForm = document.getElementById("travelForm");
    const submitBtn = document.getElementById("submitBtn");
    const destinationInput = document.getElementById("destination");
    const durationInput = document.getElementById("duration");
    const budgetInput = document.getElementById("budget");
    const budgetPersonBadge = document.getElementById("budgetPersonBadge");
    const btnPeopleMinus = document.getElementById("btnPeopleMinus");
    const btnPeoplePlus = document.getElementById("btnPeoplePlus");
    const peopleCountDisplay = document.getElementById("peopleCountDisplay");
    const peopleSelect = document.getElementById("peopleSelect");
    const budgetPerPersonText = document.getElementById("budgetPerPersonText");
    const interestsInput = document.getElementById("interests");
    const companionsInput = document.getElementById("companions");
    const transportationInput = document.getElementById("transportation");
    const accommodationInput = document.getElementById("accommodation");
    const travelStyleInput = document.getElementById("travelStyle");
    const travelModeInput = document.getElementById("travelMode");
    const dietaryInput = document.getElementById("dietaryInfo");
    const allergyChips = document.querySelectorAll(".btn-allergy-chip");
    const styleChips = document.querySelectorAll(".style-chip");

    // 여행 날짜 및 교통 거점 선택 요소
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");
    const durationDisplay = document.getElementById("durationDisplay");
    const seasonDisplay = document.getElementById("seasonDisplay");
    const quickDurationChips = document.querySelectorAll(".btn-duration-chip");
    const entryTransportSelect = document.getElementById("entryTransport");
    const exitTransportSelect = document.getElementById("exitTransport");
    const btnHubRoundFlight = document.getElementById("btnHubRoundFlight");
    const btnHubRoundShip = document.getElementById("btnHubRoundShip");
    const hubQuickChips = document.querySelectorAll(".btn-hub-chip");

    // 상단 네비게이션 & 검색창
    const headerResetBtn = document.getElementById("headerResetBtn");
    const topSearchInput = document.getElementById("topSearchInput");
    const topSearchBtn = document.getElementById("topSearchBtn");

    // 필터 조건 & 슬라이더
    const resetFiltersBtn = document.getElementById("resetFiltersBtn");
    const chipDestination = document.getElementById("chipDestination");
    const chipCategory = document.getElementById("chipCategory");
    const priceRange = document.getElementById("priceRange");
    const priceMax = document.getElementById("priceMax");

    // 카테고리 탭 & 프리셋
    const categoryButtons = document.querySelectorAll(".cat-item");
    const presetButtons = document.querySelectorAll(".preset-btn");
    const modeCards = document.querySelectorAll(".mode-card");

    // 상품 카드 & 위시리스트
    const productCards = document.querySelectorAll(".agoda-card");
    const wishlistButtons = document.querySelectorAll(".card-wishlist");

    // 결과 및 로딩 상태
    const loadingState = document.getElementById("loadingState");
    const loadingTip = document.getElementById("loadingTip");
    const errorAlert = document.getElementById("errorAlert");
    const errorMessage = document.getElementById("errorMessage");
    const resultWrapper = document.getElementById("resultWrapper");
    const resultHeaderTitle = document.getElementById("resultHeaderTitle");
    const resultMeta = document.getElementById("resultMeta");
    const planOutput = document.getElementById("planOutput");
    const btnSaveCurrentPlan = document.getElementById("btnSaveCurrentPlan");
    const copyBtn = document.getElementById("copyBtn");
    const copyChatBtn = document.getElementById("copyChatBtn");
    const downloadBtn = document.getElementById("downloadBtn");

    // 플랜 비교 모드 & 다중 플랜 탭 요소
    const planTabsBar = document.getElementById("planTabsBar");
    const planTabsScroll = document.getElementById("planTabsScroll");
    const btnToggleCompare = document.getElementById("btnToggleCompare");
    const planCompareDashboard = document.getElementById("planCompareDashboard");
    const planDetailView = document.getElementById("planDetailView");
    const compareSelectA = document.getElementById("compareSelectA");
    const compareSelectB = document.getElementById("compareSelectB");
    const compareGrid = document.getElementById("compareGrid");
    const compareTableResponsive = document.getElementById("compareTableResponsive");
    const btnCloseCompare = document.getElementById("btnCloseCompare");

    // 숙소 예약 & 구글 지도 추천 숙소 요소
    const accommodationBookingSection = document.getElementById("accommodationBookingSection");
    const bookingDestName = document.getElementById("bookingDestName");
    const bookingDateSpan = document.getElementById("bookingDateSpan");
    const bookingDateBadge = document.getElementById("bookingDateBadge");
    const linkYeogiPortal = document.getElementById("linkYeogiPortal");
    const linkAirbnbPortal = document.getElementById("linkAirbnbPortal");
    const linkGoogleMapsPortal = document.getElementById("linkGoogleMapsPortal");
    const famousHotelsGrid = document.getElementById("famousHotelsGrid");
    const btnShareLink = document.getElementById("btnShareLink");
    const sharedPlanBanner = document.getElementById("sharedPlanBanner");
    const btnCloseSharedBanner = document.getElementById("btnCloseSharedBanner");

    // 상태 관리 변수
    let currentPlanMarkdown = "";
    let loadingInterval = null;
    let currentCityKey = "제주";
    let currentCategory = "all";
    let wishlist = JSON.parse(localStorage.getItem("ai_travel_wishlist") || "[]");

    // 영구 저장된 여행 계획 (localStorage)
    let savedPlans = JSON.parse(localStorage.getItem("ai_travel_saved_plans") || "[]");

    // AI 플랜 비교 및 히스토리 관리 (이전 저장된 계획이 있으면 연동)
    let generatedPlans = [...savedPlans];
    let activePlanId = generatedPlans.length > 0 ? generatedPlans[0].id : null;
    let isCompareMode = false;
    let comparePlanIdA = null;
    let comparePlanIdB = null;


    // 10대 인기 여행지 프리셋 데이터
    const presets = {
        jeju: {
            keyword: "제주",
            shortName: "제주도",
            destination: "제주도 서귀포 & 애월",
            duration: "2박 3일",
            budget: "2인 총 120만원",
            interests: "오션뷰 감성 카페, 애월 해안도로, 흑돼지 맛집, 사려니숲길 힐링",
            companions: "연인과 둘이서",
            transportation: "렌터카 (전기차)",
            accommodation: "동선에 맞춘 오션뷰 감성 숙소",
            mode: "B",
            travel_style: "🌿 여유로운 힐링 / 쉼이 있는 로컬 감성 여행"
        },
        busan: {
            keyword: "부산",
            shortName: "부산",
            destination: "부산 해운대 & 광안리 & 영도",
            duration: "2박 3일",
            budget: "2인 총 95만원",
            interests: "해운대 블루라인파크 해변열차, 광안대교 오션뷰 카페, 영도 흰여울문화마을, 자갈치 꼼장어 & 밀면 투어",
            companions: "친구 또는 연인",
            transportation: "KTX (부산역) & 지하철/택시",
            accommodation: "광안리 해변 1열 정면 오션뷰 호텔",
            mode: "A",
            travel_style: "📸 감성 인생샷 & 인스타 핫플 카페 투어"
        },
        gangneung: {
            keyword: "강릉",
            shortName: "강릉/속초",
            destination: "강원도 강릉 & 속초",
            duration: "2박 3일",
            budget: "2인 총 85만원",
            interests: "안목해변 커피거리, 초당순두부 짬뽕, 속초 중앙시장 만석닭강정, 설악산 권금성 케이블카, 아르떼뮤지엄",
            companions: "가족 또는 연인",
            transportation: "KTX 강릉선 & 렌터카",
            accommodation: "경포대/강문해변 인피니티풀 오션뷰 호텔",
            mode: "B",
            travel_style: "🌿 여유로운 힐링 / 쉼이 있는 로컬 감성 여행"
        },
        gyeongju: {
            keyword: "경주",
            shortName: "경주",
            destination: "경주 황리단길 & 보문단지",
            duration: "1박 2일",
            budget: "2인 총 60만원",
            interests: "황리단길 감성 한옥 카페 & 십원빵, 대릉원 포토존, 동궁과 월지 야경, 첨성대, 불국사 산책",
            companions: "연인과 둘이서",
            transportation: "KTX 신경주역 & 시내버스/택시",
            accommodation: "황리단길 중심 전통 프라이빗 한옥 스테이",
            mode: "B",
            travel_style: "📸 감성 인생샷 & 인스타 핫플 카페 투어"
        },
        yeosu: {
            keyword: "여수",
            shortName: "여수",
            destination: "여수 돌산도 & 오동도",
            duration: "2박 3일",
            budget: "2인 총 88만원",
            interests: "여수 해상케이블카, 오동도 동백열차, 낭만포차 거리 돌문어해물삼합, 하멜등대 야경, 예술의섬 장도",
            companions: "연인 또는 친구",
            transportation: "KTX 여수엑스포역 & 렌터카",
            accommodation: "돌산대교 야경 뷰 오션 테라스 리조트",
            mode: "A",
            travel_style: "🍽️ 웨이팅 필수 현지 찐맛집 & 미식 탐방"
        },
        osaka: {
            keyword: "오사카",
            shortName: "오사카",
            destination: "일본 오사카 & 교토",
            duration: "3박 4일",
            budget: "1인당 100만원",
            interests: "도톤보리 미식 투어, USJ 닌텐도 월드, 교토 청수사/아라시야마, 쇼핑",
            companions: "친구와 둘이서",
            transportation: "대중교통 (지하철, 라피트)",
            accommodation: "난바역 근처 가성비 비즈니스 호텔",
            mode: "A",
            travel_style: "⚡ 알찬 핵심 투어 / 주요 랜드마크 정복"
        },
        tokyo: {
            keyword: "도쿄",
            shortName: "도쿄",
            destination: "일본 도쿄 (시부야 & 긴자)",
            duration: "3박 4일",
            budget: "1인당 120만원",
            interests: "시부야 스카이 전망대, 긴자 쇼핑, 신주쿠 야경, 감성 카페 투어",
            companions: "친구와 둘이서",
            transportation: "도쿄 메트로 72시간 패스",
            accommodation: "시부야/신주쿠 역세권 모던 호텔",
            mode: "A",
            travel_style: "⚡ 알찬 핵심 투어 / 주요 랜드마크 정복"
        },
        fukuoka: {
            keyword: "후쿠오카",
            shortName: "후쿠오카",
            destination: "일본 후쿠오카 & 유후인",
            duration: "2박 3일",
            budget: "1인당 85만원",
            interests: "하카타 돈코츠 라멘, 유후인 료칸 온천욕, 긴린코 호수, 나카스 포장마차",
            companions: "부모님과 함께",
            transportation: "유후인노모리 관광열차 & 버스",
            accommodation: "유후인 전통 온천 료칸 (가이세키 석식)",
            mode: "B",
            travel_style: "🌿 여유로운 힐링 / 쉼이 있는 로컬 감성 여행"
        },
        sapporo: {
            keyword: "삿포로",
            shortName: "삿포로",
            destination: "일본 삿포로 & 오타루 & 비에이",
            duration: "4박 5일",
            budget: "1인당 145만원",
            interests: "비에이 청의 호수 & 흰그림자 투어, 오타루 운하 오르골당, 삿포로 맥주박물관 & 징기스칸 양고기, 스스키노 미소라멘",
            companions: "친구 또는 연인",
            transportation: "JR 홋카이도 레일패스 & 비에이 일일 투어버스",
            accommodation: "스스키노역 천연온천 대욕장 호텔",
            mode: "A",
            travel_style: "🍽️ 웨이팅 필수 현지 찐맛집 & 미식 탐방"
        },
        bangkok: {
            keyword: "방콕",
            shortName: "방콕",
            destination: "태국 방콕 & 파타야",
            duration: "4박 5일",
            budget: "1인당 90만원",
            interests: "쩟페어 야시장 먹거리, 차오프라야 크루즈 디너, 왓아룬 사원 뷰 루프탑, 1일 1스파",
            companions: "친구 2명",
            transportation: "대중교통 (BTS/MRT) 및 그랩(Grab)",
            accommodation: "차오프라야 강변 가성비 5성급 호텔",
            mode: "A",
            travel_style: "🍽️ 웨이팅 필수 현지 찐맛집 & 미식 탐방"
        },
        danang: {
            keyword: "다낭",
            shortName: "다낭",
            destination: "베트남 다낭 & 호이안",
            duration: "3박 5일",
            budget: "1인당 80만원",
            interests: "미케비치 힐링, 바나힐 골든브릿지, 호이안 올드타운 야경 & 소원배, 마사지",
            companions: "가족 (아이 동반)",
            transportation: "전용 렌터카 & 그랩(Grab)",
            accommodation: "미케비치 오션뷰 풀빌라 리조트",
            mode: "B",
            travel_style: "👨‍👩‍👧‍👦 부모님/아이 배려 편안한 이동 & 무리 없는 동선"
        },
        taipei: {
            keyword: "타이베이",
            shortName: "타이베이",
            destination: "대만 타이베이",
            duration: "3박 4일",
            budget: "1인당 75만원",
            interests: "예스진지 투어, 딘타이펑 딤섬 & 우육면, 지우펀 홍등 거리, 스린 야시장",
            companions: "친구와 함께",
            transportation: "타이베이 MRT & 예스진지 일일 투어버스",
            accommodation: "시먼딩역 중심 3성급 호텔",
            mode: "A",
            travel_style: "🍽️ 웨이팅 필수 현지 찐맛집 & 미식 탐방"
        },
        singapore: {
            keyword: "싱가포르",
            shortName: "싱가포르",
            destination: "싱가포르 마리나베이 & 센토사",
            duration: "3박 5일",
            budget: "1인당 155만원",
            interests: "마리나베이샌즈 스카이파크 & 분수쇼, 가든스바이더베이 슈퍼트리쇼, 유니버설스튜디오 싱가포르, 점보씨푸드 칠리크랩",
            companions: "가족 또는 친구",
            transportation: "싱가포르 지하철 (MRT) 및 그랩",
            accommodation: "마리나베이 도보권 모던 4~5성급 호텔",
            mode: "A",
            travel_style: "⚡ 알찬 핵심 투어 / 주요 랜드마크 정복"
        },
        bali: {
            keyword: "발리",
            shortName: "발리",
            destination: "인도네시아 발리 (우붓 & 짱구)",
            duration: "5박 7일",
            budget: "1인당 175만원",
            interests: "우붓 뜨갈랄랑 계단식 논 & 발리스윙, 짱구 비치클럽 선셋 파티, 울루와투 절벽사원 케착댄스, 플로팅 조식",
            companions: "연인과 함께",
            transportation: "전용 기사 차량 렌트 & 그랩",
            accommodation: "우붓 정글 프라이빗 풀빌라",
            mode: "B",
            travel_style: "🌿 여유로운 힐링 / 쉼이 있는 로컬 감성 여행"
        },
        guam: {
            keyword: "괌",
            shortName: "괌",
            destination: "미국 괌 투몬 비치",
            duration: "3박 5일",
            budget: "1인당 135만원",
            interests: "투몬비치 에메랄드 스노클링, 돌핀 워칭 크루즈, 사랑의 절벽 선셋, 괌 T갤러리아 면세 쇼핑, 남부 렌터카 드라이브",
            companions: "가족 (아이 동반) 또는 연인",
            transportation: "오픈카 렌터카 & 트롤리 버스",
            accommodation: "투몬비치 전용 프라이빗 비치 보유 오션프론트 리조트",
            mode: "B",
            travel_style: "👨‍👩‍👧‍👦 부모님/아이 배려 편안한 이동 & 무리 없는 동선"
        },
        paris: {
            keyword: "파리",
            shortName: "파리",
            destination: "프랑스 파리",
            duration: "5박 6일",
            budget: "1인당 300만원",
            interests: "루브르 & 오르세 미술관, 에펠탑 야경, 세느강 바토무슈, 몽마르트르 골목",
            companions: "혼자 떠나는 여행",
            transportation: "대중교통 (파리 메트로) 및 도보",
            accommodation: "시내 중심 3성급 부티크 호텔",
            mode: "B",
            travel_style: "📸 감성 인생샷 & 인스타 핫플 카페 투어"
        },
        london: {
            keyword: "런던",
            shortName: "런던",
            destination: "영국 런던 템스강 & 소호",
            duration: "5박 7일",
            budget: "1인당 320만원",
            interests: "빅벤 & 런던아이 야경, 대영박물관 & 내셔널갤러리, 웨스트엔드 뮤지컬, 버로우 마켓 미식 투어, 타워브리지",
            companions: "친구 또는 나홀로 여행",
            transportation: "런던 언더그라운드 (지하철)",
            accommodation: "소호/코벤트가든 중심 부티크 호텔",
            mode: "A",
            travel_style: "⚡ 알찬 핵심 투어 / 주요 랜드마크 정복"
        },
        rome: {
            keyword: "로마",
            shortName: "로마",
            destination: "이탈리아 로마 & 바티칸",
            duration: "4박 6일",
            budget: "1인당 260만원",
            interests: "콜로세움 & 포로 로마노, 바티칸 미술관 패스트트랙 투어, 트레비 분수 & 스페인광장 젤라또, 판테온 신전",
            companions: "친구와 둘이서",
            transportation: "로마 메트로 & 도보",
            accommodation: "테르미니역 도보 5분 4성급 호텔",
            mode: "A",
            travel_style: "⚡ 알찬 핵심 투어 / 주요 랜드마크 정복"
        },
        barcelona: {
            keyword: "바르셀로나",
            shortName: "바르셀로나",
            destination: "스페인 바르셀로나",
            duration: "5박 7일",
            budget: "1인당 280만원",
            interests: "사그라다 파밀리아 대성당, 구엘 공원 가우디 투어, 보케리아 시장 타파스, 바르셀로네타 해변",
            companions: "친구와 둘이서",
            transportation: "바르셀로나 메트로 및 도보",
            accommodation: "람블라스 거리 근처 감성 호텔",
            mode: "B",
            travel_style: "📸 감성 인생샷 & 인스타 핫플 카페 투어"
        },
        newyork: {
            keyword: "뉴욕",
            shortName: "뉴욕",
            destination: "미국 뉴욕 맨해튼",
            duration: "6박 8일",
            budget: "1인당 400만원",
            interests: "타임스퀘어 브로드웨이 뮤지컬, 센트럴파크, 탑오브더락 전망대, 소호 쇼핑",
            companions: "연인과 함께",
            transportation: "뉴욕 지하철 (MTA)",
            accommodation: "맨해튼 미드타운 4성급 호텔",
            mode: "A",
            travel_style: "⚡ 알찬 핵심 투어 / 주요 랜드마크 정복"
        }
    };

    const friendlyLoadingSteps = [
        {
            emoji: "🌤️",
            badge: "여행 기후 & 날씨 분석 중",
            msg: "여행 기간의 기온과 일교차를 체크해서 딱 어울리는 옷차림과 준비물을 챙겨드릴게요 🧣",
            step: 1
        },
        {
            emoji: "🎉",
            badge: "시즌 대표 축제 & 이벤트 탐색 중",
            msg: "여행자님이 가시는 날짜에만 열리는 핫한 지역 축제와 시즌 명소를 찾고 있어요 🎊",
            step: 1
        },
        {
            emoji: "🍽️",
            badge: "AI 여행사가 맞춤 맛집 고민 중",
            msg: "AI 여행사가 여행자님의 입맛과 취향에 꼭 맞는 찐 로컬 맛집과 디저트를 고민 중입니다 😋",
            step: 2
        },
        {
            emoji: "☕",
            badge: "감성 디저트 & 시그니처 카페 매칭 중",
            msg: "일정 중간에 달콤하게 쉬어갈 현지 인기 감성 카페와 특산 디저트를 고르고 있어요 🍰",
            step: 2
        },
        {
            emoji: "🚗",
            badge: "스마트 최적 동선 설계 중",
            msg: "출발부터 도착까지 길 위에서 버리는 시간 없도록 10~15분 거리 밀착 동선을 다듬고 있어요 🗺️",
            step: 3
        },
        {
            emoji: "🏨",
            badge: "평점 4.6+ 검증 숙소 매칭 중",
            msg: "동선과 완벽히 이어지는 구글 지도 평점 4.6점 이상의 감성 숙소 3곳을 엄선하고 있어요 🛌",
            step: 4
        },
        {
            emoji: "🏷️",
            badge: "사전 예매 할인 & 예약 팁 정리 중",
            msg: "캐치테이블·테이블링 예약 팁과 현장 대기 없는 모바일 할인 패스를 꼼꼼히 챙겨드려요 🎫",
            step: 4
        },
        {
            emoji: "✨",
            badge: "맞춤 여행 계획서 완성 중",
            msg: "거의 다 준비되었어요! 여행자님만의 완벽하고 설레는 맞춤 일정이 곧 완성됩니다 ✈️",
            step: 4
        }
    ];

    const loadingTips = friendlyLoadingSteps.map(s => s.msg);

    /**
     * 1. 여행 기조 & 스타일 초이스 및 직접 입력 처리
     */
    function setTravelStyle(styleText, modeValue = "A") {
        if (travelStyleInput && styleText) {
            travelStyleInput.value = styleText;
        }
        if (travelModeInput && modeValue) {
            travelModeInput.value = modeValue;
        }

        // 일치하는 추천 칩 하이라이트
        styleChips.forEach((chip) => {
            if (chip.dataset.style === styleText || (styleText && styleText.includes(chip.textContent.trim()))) {
                chip.classList.add("active");
            } else {
                chip.classList.remove("active");
            }
        });
    }

    function setMode(modeValue) {
        if (modeValue === "B") {
            setTravelStyle("🌿 여유로운 힐링 / 쉼이 있는 로컬 감성 여행", "B");
        } else {
            setTravelStyle("⚡ 알찬 핵심 투어 / 주요 랜드마크 정복", "A");
        }
    }

    styleChips.forEach((chip) => {
        chip.addEventListener("click", () => {
            styleChips.forEach((c) => c.classList.remove("active"));
            chip.classList.add("active");
            const styleVal = chip.dataset.style;
            const modeVal = chip.dataset.mode || "A";
            setTravelStyle(styleVal, modeVal);

            // 입력창 시각적 피드백
            if (travelStyleInput) {
                travelStyleInput.classList.add("input-synced");
                setTimeout(() => travelStyleInput.classList.remove("input-synced"), 400);
            }
        });
    });

    if (travelStyleInput) {
        travelStyleInput.addEventListener("input", () => {
            const val = travelStyleInput.value.trim();
            let matched = false;
            styleChips.forEach((chip) => {
                if (chip.dataset.style === val) {
                    chip.classList.add("active");
                    matched = true;
                    if (travelModeInput) travelModeInput.value = chip.dataset.mode || "A";
                } else {
                    chip.classList.remove("active");
                }
            });
            if (!matched && travelModeInput) {
                if (val.includes("힐링") || val.includes("여유") || val.includes("휴식") || val.includes("부모님") || val.includes("가족") || val.includes("인생샷")) {
                    travelModeInput.value = "B";
                } else {
                    travelModeInput.value = "A";
                }
            }
        });
    }

    /**
     * 2. 지역 및 카테고리 교차 필터링 핵심 함수 (2차원 동시 필터링 + 찜 목록 지원)
     */
    function filterProducts() {
        const emptyNotice = document.getElementById("productEmptyNotice");
        const emptyNoticeTitle = document.getElementById("emptyNoticeTitle");
        const emptyNoticeSub = document.getElementById("emptyNoticeSub");
        let visibleCount = 0;

        productCards.forEach((card) => {
            const cardDest = card.dataset.dest || "";
            const cardCat = card.dataset.category || "";
            const cardTitle = card.querySelector(".card-title")?.textContent.trim() || "";
            const isWishlisted = wishlist.some((item) => item.title === cardTitle);

            let matchCity = (!currentCityKey || currentCityKey === "all") || cardDest.includes(currentCityKey);
            let matchCat = false;

            if (currentCategory === "wishlist") {
                // 저장한 여행지 탭: 하트를 누른 모든 여행지 노출
                matchCat = isWishlisted;
                matchCity = true;
            } else {
                matchCat = (currentCategory === "all") || (cardCat === currentCategory);
            }

            if (matchCity && matchCat) {
                card.style.display = "flex";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        if (emptyNotice) {
            if (visibleCount === 0) {
                emptyNotice.style.display = "flex";
                if (emptyNoticeTitle) {
                    if (currentCategory === "wishlist") {
                        emptyNoticeTitle.textContent = "아직 저장한 여행지가 없습니다";
                        if (emptyNoticeSub) {
                            emptyNoticeSub.textContent = "마음에 드는 여행지 카드의 하트(♡)를 누르면 이곳에서 한눈에 모아서 확인할 수 있습니다.";
                        }
                    } else {
                        const catBtn = document.querySelector(`.cat-item[data-category="${currentCategory}"] .cat-label`);
                        const catLabel = catBtn ? catBtn.textContent.trim() : "해당 테마";
                        const displayCity = currentCityKey === "all" ? "선택하신 지역" : currentCityKey;
                        emptyNoticeTitle.textContent = `${displayCity}의 '${catLabel}' 추천 코스를 준비 중입니다`;
                        if (emptyNoticeSub) {
                            emptyNoticeSub.textContent = "선택하신 지역과 테마의 상품을 준비 중입니다. 대신 Gemini AI에게 이 조건으로 맞춤 여행 일정을 바로 만들어 달라고 요청해보세요!";
                        }
                    }
                }
            } else {
                emptyNotice.style.display = "none";
            }
        }
    }

    /**
     * 2-1. 카테고리 탭 클릭 시 교차 필터링 및 체크 배지 표시
     */
    categoryButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            categoryButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            currentCategory = btn.dataset.category || "all";
            const label = btn.querySelector(".cat-label")?.textContent.trim();

            // 칩 업데이트
            if (chipCategory) {
                const textEl = chipCategory.querySelector(".chip-text");
                if (textEl) textEl.textContent = label;
                chipCategory.style.display = "inline-flex";
            }

            // 관심사 기본 추천어 채우기
            if (currentCategory !== "all" && label) {
                const cityName = (!currentCityKey || currentCityKey === "all") ? "현지" : currentCityKey;
                interestsInput.value = `${cityName} ${label} 중심 맞춤 여행, 인기 명소 탐방`;
            }

            filterProducts();
        });
    });

    /**
     * 3. 상단 검색바 기능
     */
    function applySearch() {
        const query = topSearchInput.value.trim();
        if (!query) return;

        destinationInput.value = query;
        currentCityKey = (query === "전체" || query === "전체 추천") ? "all" : query;

        // 프리셋 버튼 active 상태 동기화
        presetButtons.forEach((b) => {
            const pKey = b.dataset.preset;
            if (presets[pKey] && query.includes(presets[pKey].keyword)) {
                b.classList.add("active");
            } else {
                b.classList.remove("active");
            }
        });

        // 칩 업데이트
        if (chipDestination) {
            const textEl = chipDestination.querySelector(".chip-text");
            if (textEl) textEl.textContent = query;
            chipDestination.style.display = "inline-flex";
        }

        filterProducts();
        destinationInput.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    topSearchBtn.addEventListener("click", applySearch);
    topSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            applySearch();
        }
    });

    /**
     * 4. 칩 제거 버튼
     */
    document.querySelectorAll(".chip-remove").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const chip = e.target.closest(".filter-chip");
            if (chip) {
                chip.style.display = "none";
                if (chip.id === "chipDestination") {
                    currentCityKey = "all";
                    presetButtons.forEach((b) => b.classList.remove("active"));
                } else if (chip.id === "chipCategory") {
                    currentCategory = "all";
                    categoryButtons.forEach((b) => b.classList.remove("active"));
                    const allCat = document.querySelector('.cat-item[data-category="all"]');
                    if (allCat) allCat.classList.add("active");
                }
                filterProducts();
            }
        });
    });

    /**
     * 5. 폼 초기화 버튼 (헤더 및 사이드바 공통)
     */
    function resetAll() {
        currentCityKey = "제주";
        currentCategory = "all";

        destinationInput.value = "제주도 서귀포 & 애월";
        durationInput.value = "2박 3일";
        budgetInput.value = "2인 총 120만원";
        updatePeopleCount(2, false);
        interestsInput.value = "오션뷰 감성 카페, 애월 해안도로, 흑돼지 맛집, 사려니숲길 힐링";
        companionsInput.value = "연인과 둘이서";
        transportationInput.value = "렌터카 (전기차)";
        accommodationInput.value = "동선에 맞춘 오션뷰 감성 숙소";
        if (dietaryInput) dietaryInput.value = "";
        allergyChips.forEach(c => c.classList.remove("active"));
        setTravelStyle("🌿 여유로운 힐링 / 쉼이 있는 로컬 감성 여행", "B");

        if (typeof initDatePickers === "function") {
            initDatePickers();
        }
        if (entryTransportSelect) entryTransportSelect.value = "✈️ 공항 (항공편 도착)";
        if (exitTransportSelect) exitTransportSelect.value = "✈️ 공항 (항공편 출발)";
        if (typeof updateHubChipsActiveState === "function") {
            updateHubChipsActiveState();
        }

        topSearchInput.value = "제주도";
        priceRange.value = 1200000;
        priceMax.textContent = "₩ 1,200,000";

        if (chipDestination) {
            const textEl = chipDestination.querySelector(".chip-text");
            if (textEl) textEl.textContent = "제주도";
            chipDestination.style.display = "inline-flex";
        }
        if (chipCategory) {
            const textEl = chipCategory.querySelector(".chip-text");
            if (textEl) textEl.textContent = "전체 추천";
            chipCategory.style.display = "inline-flex";
        }

        categoryButtons.forEach((b) => b.classList.remove("active"));
        const firstCat = document.querySelector('.cat-item[data-category="all"]');
        if (firstCat) firstCat.classList.add("active");

        presetButtons.forEach((b) => b.classList.remove("active"));
        const firstPreset = document.querySelector('.preset-btn[data-preset="jeju"]');
        if (firstPreset) firstPreset.classList.add("active");

        filterProducts();

        hideError();
        resultWrapper.style.display = "none";
        travelForm.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (headerResetBtn) headerResetBtn.addEventListener("click", resetAll);
    if (resetFiltersBtn) resetFiltersBtn.addEventListener("click", resetAll);

    const headerLockBtn = document.getElementById("headerLockBtn");
    if (headerLockBtn) {
        headerLockBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if ('caches' in window) {
                caches.keys().then((names) => {
                    names.forEach((name) => caches.delete(name));
                });
            }
            window.location.replace("/?action=logout&t=" + Date.now());
        });
    }

    /**
     * 6. 예산 슬라이더와 AI 맞춤 조건 폼 양방향 실시간 연동
     */
    function formatKoreanBudget(val) {
        const man = Math.floor(val / 10000);
        const rest = val % 10000;
        if (rest === 0) {
            return `${man}만원`;
        }
        return `${man}만 ${rest.toLocaleString("ko-KR")}원`;
    }

    // 인원수 및 예산 연동 상태 (기본 2인 기준)
    let currentPeopleCount = 2;

    function parseTotalBudgetWon(text) {
        if (!text) return 1200000;
        const matchMan = text.match(/(\d+)\s*만/);
        if (matchMan) {
            return parseInt(matchMan[1], 10) * 10000;
        }
        const digits = text.replace(/[^0-9]/g, "");
        if (digits) {
            const num = parseInt(digits, 10);
            return num > 10000 ? num : num * 10000;
        }
        return 1200000;
    }

    function updatePerPersonDisplay() {
        if (!budgetPerPersonText || !budgetInput) return;
        const totalWon = parseTotalBudgetWon(budgetInput.value);
        const people = Math.max(1, currentPeopleCount || 1);
        const perPersonWon = Math.round(totalWon / people);
        const perPersonMan = (perPersonWon / 10000).toFixed(perPersonWon % 10000 === 0 ? 0 : 1);
        const totalMan = Math.round(totalWon / 10000);
        budgetPerPersonText.textContent = `1인당 약 ${perPersonMan}만원 기준 (총 ${totalMan}만원)`;
    }

    function updatePeopleCount(newCount, autoAdjustBudget = true) {
        newCount = Math.max(1, Math.min(20, parseInt(newCount, 10) || 1));
        const prevCount = Math.max(1, currentPeopleCount || 2);

        let currentTotalWon = parseTotalBudgetWon(budgetInput ? budgetInput.value : "");
        let perPersonWon = Math.round(currentTotalWon / prevCount);
        if (perPersonWon < 50000) perPersonWon = 600000; // 지나치게 작으면 기본 60만원/인 기준

        currentPeopleCount = newCount;

        if (autoAdjustBudget && budgetInput) {
            const newTotalWon = perPersonWon * newCount;
            const newTotalMan = Math.round(newTotalWon / 10000);
            budgetInput.value = `${newCount}인 총 ${newTotalMan}만원`;
            syncSliderFromText(budgetInput.value);
        }

        // 뱃지 및 스텝퍼 표시 동기화
        if (budgetPersonBadge) {
            budgetPersonBadge.textContent = `(${newCount}인 기준)`;
            budgetPersonBadge.classList.add("badge-updated");
            setTimeout(() => budgetPersonBadge.classList.remove("badge-updated"), 350);
        }
        if (peopleCountDisplay) {
            peopleCountDisplay.textContent = `${newCount}인`;
        }
        if (peopleSelect) {
            const hasOption = Array.from(peopleSelect.options).some(opt => opt.value == newCount);
            if (hasOption) {
                peopleSelect.value = String(newCount);
            }
        }

        updatePerPersonDisplay();

        // 동행자(companions) 입력창 스마트 자동 추천 동기화
        if (companionsInput) {
            const cur = companionsInput.value.trim();
            if (newCount === 1) {
                companionsInput.value = "혼자서 (1인 자유여행)";
            } else if (newCount === 2 && (cur.includes("1인") || cur.includes("혼자") || cur.includes("3인") || cur.includes("4인"))) {
                companionsInput.value = "연인과 둘이서";
            } else if (newCount === 3) {
                companionsInput.value = "친구들과 3인";
            } else if (newCount === 4) {
                companionsInput.value = "가족과 4인";
            } else if (newCount >= 5) {
                companionsInput.value = `${newCount}인 소모임/단체`;
            }
        }

        renderWishlistUI();
        if (typeof checkBudgetOver === "function") {
            checkBudgetOver();
        }
    }

    // 인원수 증감 스텝퍼 이벤트
    if (btnPeopleMinus) {
        btnPeopleMinus.addEventListener("click", () => {
            updatePeopleCount(currentPeopleCount - 1, true);
        });
    }

    if (btnPeoplePlus) {
        btnPeoplePlus.addEventListener("click", () => {
            updatePeopleCount(currentPeopleCount + 1, true);
        });
    }

    // 인원수 셀렉트 드롭다운 이벤트
    if (peopleSelect) {
        peopleSelect.addEventListener("change", (e) => {
            const val = parseInt(e.target.value, 10);
            if (val) updatePeopleCount(val, true);
        });
    }

    function syncBudgetFromSlider() {
        if (!priceRange || !budgetInput) return;
        const val = parseInt(priceRange.value, 10);
        const formattedWon = val.toLocaleString("ko-KR");
        const koreanText = formatKoreanBudget(val);

        if (priceMax) {
            priceMax.textContent = `₩ ${formattedWon}`;
        }

        // 현재 설정된 인원수를 반영하여 예산 텍스트 갱신
        if (currentPeopleCount > 1) {
            budgetInput.value = `${currentPeopleCount}인 총 ${koreanText}`;
        } else {
            budgetInput.value = `1인 총 ${koreanText}`;
        }

        updatePerPersonDisplay();

        // 시각적 강조 애니메이션 (파란색 테두리 하이라이트)
        budgetInput.classList.add("input-synced");
        clearTimeout(budgetInput._syncTimer);
        budgetInput._syncTimer = setTimeout(() => {
            budgetInput.classList.remove("input-synced");
        }, 500);

        // 예산 슬라이더 변경 시 저장된 여행지들의 예산 초과 배지 상태 실시간 동기화
        renderWishlistUI();
        if (typeof checkBudgetOver === "function") {
            checkBudgetOver();
        }
    }

    function syncSliderFromText(budgetText) {
        if (!priceRange || !priceMax || !budgetText) return;
        const matchMan = budgetText.match(/(\d+)\s*만/);
        if (matchMan) {
            const parsedVal = parseInt(matchMan[1], 10) * 10000;
            const minVal = parseInt(priceRange.min, 10);
            const maxVal = parseInt(priceRange.max, 10);
            const clamped = Math.max(minVal, Math.min(maxVal, parsedVal));
            priceRange.value = clamped;
            priceMax.textContent = `₩ ${clamped.toLocaleString("ko-KR")}`;
        }
    }

    if (priceRange) {
        priceRange.addEventListener("input", syncBudgetFromSlider);
    }

    if (budgetInput) {
        budgetInput.addEventListener("input", () => {
            syncSliderFromText(budgetInput.value);

            // 텍스트 내에서 'N인' 감지 시 인원수 동기화 (예산 텍스트는 덮어쓰지 않고 인원수/배지만 동기화)
            const matchPeople = budgetInput.value.match(/(\d+)\s*인/);
            if (matchPeople) {
                const detectedCount = parseInt(matchPeople[1], 10);
                if (detectedCount > 0 && detectedCount !== currentPeopleCount) {
                    updatePeopleCount(detectedCount, false);
                    return;
                }
            }
            updatePerPersonDisplay();
        });
    }

    /**
     * 6-1. 여행 날짜(달력) & 기간 계산 & 교통 거점 컨트롤러
     */
    function formatYMD(date) {
        if (!date || isNaN(date.getTime())) return "";
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    function parseYMD(str) {
        if (!str || typeof str !== "string") return null;
        const parts = str.split("-");
        if (parts.length !== 3) return null;
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const dt = new Date(y, m, d);
        return isNaN(dt.getTime()) ? null : dt;
    }

    function calculateSeason(month) {
        if (month >= 3 && month <= 5) return "🌸 봄 여행";
        if (month >= 6 && month <= 8) return "☀️ 여름 여행";
        if (month >= 9 && month <= 11) return "🍁 가을 여행";
        return "❄️ 겨울 여행";
    }

    function updateDurationFromDates(syncDurationField = true) {
        if (!startDateInput || !endDateInput) return;
        const sVal = startDateInput.value;
        const eVal = endDateInput.value;
        if (!sVal || !eVal) return;

        let s = parseYMD(sVal);
        let e = parseYMD(eVal);
        if (!s || !e) return;

        if (e < s) {
            e = new Date(s);
            endDateInput.value = formatYMD(e);
        }

        const diffTime = e.getTime() - s.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

        let durationText = "";
        if (diffDays <= 1) {
            durationText = "당일치기";
        } else {
            durationText = `${diffDays - 1}박 ${diffDays}일`;
        }

        if (durationDisplay) {
            durationDisplay.textContent = durationText;
        }
        if (durationInput && syncDurationField) {
            durationInput.value = durationText;
        }

        const seasonText = calculateSeason(s.getMonth() + 1);
        if (seasonDisplay) {
            seasonDisplay.textContent = seasonText;
        }

        quickDurationChips.forEach(chip => {
            const chipDays = parseInt(chip.dataset.days, 10);
            if (chipDays === diffDays) {
                chip.classList.add("active");
            } else {
                chip.classList.remove("active");
            }
        });
    }

    function setDurationFromDays(days) {
        days = parseInt(days, 10) || 1;
        let s = parseYMD(startDateInput ? startDateInput.value : "");
        if (!s) {
            s = new Date();
            s.setDate(s.getDate() + 7);
            if (startDateInput) startDateInput.value = formatYMD(s);
        }
        const e = new Date(s);
        e.setDate(s.getDate() + (days - 1));
        if (endDateInput) {
            endDateInput.value = formatYMD(e);
        }
        updateDurationFromDates();
    }

    function setDatesFromDurationText(durationText) {
        if (!durationText || typeof durationText !== "string") return;
        const matchDays = durationText.match(/(\d+)\s*일/);
        const matchNights = durationText.match(/(\d+)\s*박/);
        if (matchDays) {
            setDurationFromDays(parseInt(matchDays[1], 10));
        } else if (matchNights) {
            setDurationFromDays(parseInt(matchNights[1], 10) + 1);
        } else if (durationText.includes("당일")) {
            setDurationFromDays(1);
        }
    }

    function initDatePickers() {
        if (!startDateInput || !endDateInput) return;
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() + 7);
        const end = new Date(start);
        end.setDate(start.getDate() + 2);

        const todayStr = formatYMD(today);
        startDateInput.min = todayStr;
        endDateInput.min = todayStr;

        if (!startDateInput.value) startDateInput.value = formatYMD(start);
        if (!endDateInput.value) endDateInput.value = formatYMD(end);

        updateDurationFromDates();
    }

    if (startDateInput) {
        startDateInput.addEventListener("change", () => {
            if (endDateInput && startDateInput.value) {
                endDateInput.min = startDateInput.value;
                if (endDateInput.value && endDateInput.value < startDateInput.value) {
                    endDateInput.value = startDateInput.value;
                }
            }
            updateDurationFromDates();
        });
    }

    if (endDateInput) {
        endDateInput.addEventListener("change", () => {
            if (startDateInput && endDateInput.value && startDateInput.value) {
                if (endDateInput.value < startDateInput.value) {
                    startDateInput.value = endDateInput.value;
                }
            }
            updateDurationFromDates();
        });
    }

    quickDurationChips.forEach(chip => {
        chip.addEventListener("click", () => {
            const days = parseInt(chip.dataset.days, 10);
            if (!isNaN(days)) {
                setDurationFromDays(days);
            }
        });
    });

    function updateHubChipsActiveState() {
        if (!entryTransportSelect || !exitTransportSelect) return;
        const entryVal = entryTransportSelect.value || "";
        const exitVal = exitTransportSelect.value || "";

        const isFlight = entryVal.includes("공항") && exitVal.includes("공항");
        const isShip = entryVal.includes("항구") && exitVal.includes("항구");

        if (btnHubRoundFlight) {
            btnHubRoundFlight.classList.toggle("active", isFlight);
        }
        if (btnHubRoundShip) {
            btnHubRoundShip.classList.toggle("active", isShip);
        }
    }

    if (btnHubRoundFlight) {
        btnHubRoundFlight.addEventListener("click", () => {
            if (entryTransportSelect) entryTransportSelect.value = "✈️ 공항 (항공편 도착)";
            if (exitTransportSelect) exitTransportSelect.value = "✈️ 공항 (항공편 출발)";
            updateHubChipsActiveState();
        });
    }

    if (btnHubRoundShip) {
        btnHubRoundShip.addEventListener("click", () => {
            if (entryTransportSelect) entryTransportSelect.value = "🚢 항구 / 여객터미널 (선박 도착)";
            if (exitTransportSelect) exitTransportSelect.value = "🚢 항구 / 여객터미널 (선박 출발)";
            updateHubChipsActiveState();
        });
    }

    if (entryTransportSelect) {
        entryTransportSelect.addEventListener("change", updateHubChipsActiveState);
    }
    if (exitTransportSelect) {
        exitTransportSelect.addEventListener("change", updateHubChipsActiveState);
    }

    /**
     * 7. 빠른 도시 프리셋 버튼
     */
    presetButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            presetButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            const presetKey = btn.dataset.preset;
            const data = presets[presetKey];
            if (data) {
                destinationInput.value = data.destination;
                durationInput.value = data.duration;
                setDatesFromDurationText(data.duration);
                budgetInput.value = data.budget;
                syncSliderFromText(data.budget);
                const matchPresetPeople = (data.budget || "").match(/(\d+)\s*인/);
                if (matchPresetPeople) {
                    updatePeopleCount(parseInt(matchPresetPeople[1], 10), false);
                } else {
                    updatePerPersonDisplay();
                }
                interestsInput.value = data.interests;
                companionsInput.value = data.companions;
                transportationInput.value = data.transportation;
                accommodationInput.value = data.accommodation;
                if (data.travel_style) {
                    setTravelStyle(data.travel_style, data.mode);
                } else {
                    setMode(data.mode);
                }

                topSearchInput.value = data.shortName;
                if (chipDestination) {
                    chipDestination.querySelector(".chip-text").textContent = data.shortName;
                    chipDestination.style.display = "inline-flex";
                }

                currentCityKey = data.keyword;
                filterProducts();

                travelForm.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    /**
     * 7-1. 빠른 도시 프리셋 가로 스크롤 컨트롤러 (좌우 화살표 버튼 & 마우스 휠 지원)
     */
    const quickPresetChipsContainer = document.getElementById("quickPresetChips");
    const btnPresetScrollLeft = document.getElementById("btnPresetScrollLeft");
    const btnPresetScrollRight = document.getElementById("btnPresetScrollRight");

    if (quickPresetChipsContainer) {
        // 좌측 이동 버튼
        if (btnPresetScrollLeft) {
            btnPresetScrollLeft.addEventListener("click", () => {
                quickPresetChipsContainer.scrollBy({ left: -280, behavior: "smooth" });
            });
        }

        // 우측 이동 버튼
        if (btnPresetScrollRight) {
            btnPresetScrollRight.addEventListener("click", () => {
                quickPresetChipsContainer.scrollBy({ left: 280, behavior: "smooth" });
            });
        }

        // 데스크톱 마우스 휠 스크롤 지원 (Shift 키 없이 휠만 굴려도 좌우 스크롤)
        quickPresetChipsContainer.addEventListener("wheel", (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                quickPresetChipsContainer.scrollLeft += e.deltaY;
            }
        }, { passive: false });
    }

    // 상단 카테고리 캐러셀도 마우스 휠로 가로 스크롤 가능하도록 지원
    const categoryCarouselContainer = document.querySelector(".category-carousel");
    if (categoryCarouselContainer) {
        categoryCarouselContainer.addEventListener("wheel", (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                categoryCarouselContainer.scrollLeft += e.deltaY;
            }
        }, { passive: false });
    }

    /**
     * 8. 상품 카드 클릭 시 폼에 상세 정보 자동 완성
     */
    productCards.forEach((card) => {
        card.addEventListener("click", (e) => {
            if (e.target.closest(".card-wishlist")) return;

            const dest = card.dataset.dest;
            const dur = card.dataset.dur;
            const budget = card.dataset.budget;
            const transport = card.dataset.transport;
            const theme = card.dataset.theme;

            if (dest) destinationInput.value = dest;
            if (dur) {
                durationInput.value = dur;
                setDatesFromDurationText(dur);
            }
            if (budget) {
                budgetInput.value = budget;
                syncSliderFromText(budget);
                const matchCardPeople = budget.match(/(\d+)\s*인/);
                if (matchCardPeople) {
                    updatePeopleCount(parseInt(matchCardPeople[1], 10), false);
                } else {
                    updatePerPersonDisplay();
                }
            }
            if (transport) transportationInput.value = transport;
            if (theme) interestsInput.value = theme;

            // 시각적 강조 피드백
            card.style.transform = "scale(0.98)";
            card.style.borderColor = "var(--agoda-blue)";
            setTimeout(() => {
                card.style.transform = "";
                card.style.borderColor = "";
            }, 300);

            travelForm.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    });

    /**
     * 9. 저장한 여행지 (위시리스트) UI 동기화 및 렌더링 함수
     */
    function renderWishlistUI() {
        const topCount = document.getElementById("topWishlistCount");
        const sidebarCount = document.getElementById("sidebarWishlistCount");
        const miniList = document.getElementById("wishlistMiniItems");
        const emptyMsg = document.getElementById("wishlistEmptyMsg");
        const footer = document.getElementById("wishlistSidebarFooter");
        const count = wishlist.length;

        // 1) 상단 배지 동기화
        if (topCount) {
            topCount.textContent = count;
            if (count > 0) {
                topCount.classList.add("visible");
            } else {
                topCount.classList.remove("visible");
            }
        }

        // 2) 사이드바 카운트 배지 동기화
        if (sidebarCount) {
            sidebarCount.textContent = count;
        }

        // 3) 페이지 내 모든 상품 카드의 하트 버튼 상태 동기화
        document.querySelectorAll(".agoda-card").forEach((card) => {
            const title = card.querySelector(".card-title")?.textContent.trim() || "";
            const heartBtn = card.querySelector(".card-wishlist");
            if (heartBtn && title) {
                const isSaved = wishlist.some((item) => item.title === title);
                if (isSaved) {
                    heartBtn.classList.add("active");
                    heartBtn.textContent = "❤️";
                    heartBtn.style.color = "var(--agoda-red)";
                } else {
                    heartBtn.classList.remove("active");
                    heartBtn.textContent = "♡";
                    heartBtn.style.color = "";
                }
            }
        });

        // 4) 사이드바 미니 리스트 렌더링
        if (miniList && emptyMsg && footer) {
            if (count === 0) {
                emptyMsg.style.display = "flex";
                miniList.style.display = "none";
                footer.style.display = "none";
                miniList.innerHTML = "";
            } else {
                emptyMsg.style.display = "none";
                miniList.style.display = "flex";
                footer.style.display = "block";

                const currentBudgetVal = priceRange ? parseInt(priceRange.value, 10) : 1000000;

                miniList.innerHTML = wishlist.map((item, idx) => {
                    const itemBudgetVal = parseBudgetNumber(item.budget) || parseBudgetNumber(item.price);
                    const isOver = itemBudgetVal > currentBudgetVal && itemBudgetVal > 0;
                    const overDiff = Math.round((itemBudgetVal - currentBudgetVal) / 10000);

                    return `
                        <div class="wishlist-mini-item" data-index="${idx}">
                            <img src="${item.img || ''}" alt="" class="wishlist-mini-thumb" onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=100&q=80'">
                            <div class="wishlist-mini-info">
                                <div class="wishlist-mini-title">${item.title}</div>
                                <div class="wishlist-mini-meta">
                                    <span>📍 ${item.dest || '추천지'}</span>
                                    <span class="wishlist-mini-price">₩ ${item.price || ''}</span>
                                </div>
                                ${isOver ? `<span class="wishlist-over-badge" title="현재 예산보다 약 ${overDiff}만원 초과">⚠️ 예산 초과 (+${overDiff}만)</span>` : ''}
                            </div>
                            <button type="button" class="wishlist-mini-remove" data-title="${encodeURIComponent(item.title)}" title="삭제">✕</button>
                        </div>
                    `;
                }).join("");

                // 미니 아이템 클릭 시 폼에 해당 코스 자동 반영 및 예산 초과 감지
                miniList.querySelectorAll(".wishlist-mini-item").forEach((el) => {
                    el.addEventListener("click", (e) => {
                        if (e.target.closest(".wishlist-mini-remove")) return;
                        const idx = parseInt(el.dataset.index, 10);
                        const item = wishlist[idx];
                        if (item) {
                            if (item.dest) destinationInput.value = item.dest;
                            if (item.dur) {
                                durationInput.value = item.dur;
                                setDatesFromDurationText(item.dur);
                            }
                            if (item.transport) transportationInput.value = item.transport;
                            if (item.theme) interestsInput.value = item.theme;

                            // 예산 초과 검사 및 배너 표시
                            const isOver = checkAndShowBudgetOverload(item.budget, item.title);
                            if (isOver) {
                                interestsInput.value = `[저장 코스 예산 초과 가성비 대체 추천] ${item.theme} (⚠️ 희망 코스가 현재 예산보다 높으므로, 감성은 동일하고 더 저렴한 가성비 대체 코스로 제안해 주세요)`;
                            }

                            travelForm.scrollIntoView({ behavior: "smooth", block: "center" });
                            travelForm.classList.add("form-focus-pulse");
                            setTimeout(() => travelForm.classList.remove("form-focus-pulse"), 1000);
                        }
                    });
                });

                // 미니 아이템 삭제(✕) 버튼 클릭
                miniList.querySelectorAll(".wishlist-mini-remove").forEach((rmBtn) => {
                    rmBtn.addEventListener("click", (e) => {
                        e.stopPropagation();
                        const title = decodeURIComponent(rmBtn.dataset.title);
                        wishlist = wishlist.filter((w) => w.title !== title);
                        localStorage.setItem("ai_travel_wishlist", JSON.stringify(wishlist));
                        renderWishlistUI();
                        if (currentCategory === "wishlist") {
                            filterProducts();
                        }
                    });
                });
            }
        }
    }

    /**
     * 예산 문자열에서 숫자 금액(원 단위)을 추출하는 헬퍼
     */
    function parseBudgetNumber(text) {
        if (!text) return 0;
        const manMatch = text.match(/(\d+)\s*만/);
        if (manMatch) return parseInt(manMatch[1], 10) * 10000;
        const cleanDigits = text.replace(/[^0-9]/g, "");
        if (cleanDigits) {
            const val = parseInt(cleanDigits, 10);
            if (val < 1000) return val * 10000;
            return val;
        }
        return 0;
    }

    /**
     * 저장한 여행지 코스 예산 초과(오버) 감지 및 배너 표시
     */
    function checkAndShowBudgetOverload(itemBudgetStr, courseTitle = "") {
        const budgetOverBanner = document.getElementById("budgetOverBanner");
        const budgetOverDesc = document.getElementById("budgetOverDesc");
        if (!budgetOverBanner || !budgetOverDesc) return false;

        const currentBudgetVal = priceRange ? parseInt(priceRange.value, 10) : 1000000;
        const itemBudgetVal = parseBudgetNumber(itemBudgetStr);

        if (itemBudgetVal > currentBudgetVal && itemBudgetVal > 0) {
            const overDiff = Math.round((itemBudgetVal - currentBudgetVal) / 10000);
            const itemMan = Math.round(itemBudgetVal / 10000);
            const currentMan = Math.round(currentBudgetVal / 10000);

            budgetOverDesc.innerHTML = `
                선택하신 <strong>${courseTitle ? courseTitle + ' ' : ''}저장 코스 비용(약 ${itemMan}만원)</strong>이 현재 설정 예산(<strong>${currentMan}만원</strong>)보다 <strong style="color:#b45309; text-decoration: underline;">약 ${overDiff}만원 초과(오버)</strong>됩니다.
            `;
            const bannerTip = document.querySelector(".over-banner-tip");
            if (bannerTip) {
                bannerTip.innerHTML = "💡 분위기는 그대로 유지하면서 더 저렴한 가성비 대체 코스로 추천해 드립니다.";
                bannerTip.style.color = "#78350f";
            }
            if (btnApplyCheaperAlt) btnApplyCheaperAlt.style.display = "inline-block";
            budgetOverBanner.style.display = "block";
            return true;
        } else {
            budgetOverBanner.style.display = "none";
            return false;
        }
    }

    /**
     * 예산 초과 시 '더 저렴한 대체 코스로 적용하기' 버튼 동작
     */
    const btnApplyCheaperAlt = document.getElementById("btnApplyCheaperAlt");
    if (btnApplyCheaperAlt) {
        btnApplyCheaperAlt.addEventListener("click", () => {
            setTravelStyle("⚡ 알찬 가성비 투어 / 주요 랜드마크 정복", "A");
            if (interestsInput) {
                const currentVal = interestsInput.value.replace(/\(⚠️[^\)]+\)/g, "").trim();
                interestsInput.value = `${currentVal} (💡 예산 초과 방지: 동일 감성의 무료 뷰포인트 & 현지 도민 가성비 맛집으로 대체 추천)`;
            }
            const bannerTip = document.querySelector(".over-banner-tip");
            if (bannerTip) {
                bannerTip.innerHTML = "✅ <strong>가성비 알뜰 대체 모드가 적용되었습니다!</strong> 아래 일정 생성 버튼을 눌러주세요.";
                bannerTip.style.color = "#059669";
            }
            btnApplyCheaperAlt.style.display = "none";

            submitBtn.scrollIntoView({ behavior: "smooth", block: "center" });
            submitBtn.classList.add("btn-pulse");
            setTimeout(() => submitBtn.classList.remove("btn-pulse"), 1500);
        });
    }

    /**
     * 알레르기 안심 체크 빠른 칩 토글 이벤트
     */
    if (allergyChips.length > 0 && dietaryInput) {
        allergyChips.forEach((chip) => {
            chip.addEventListener("click", () => {
                chip.classList.toggle("active");
                const allergyName = chip.dataset.allergy;
                let currentVal = dietaryInput.value.trim();
                let items = currentVal ? currentVal.split(/[,，·]+/).map(s => s.trim()).filter(Boolean) : [];

                if (chip.classList.contains("active")) {
                    if (!items.includes(allergyName)) {
                        items.push(allergyName);
                    }
                } else {
                    items = items.filter(s => s !== allergyName);
                }
                dietaryInput.value = items.join(", ");
            });
        });

        dietaryInput.addEventListener("input", () => {
            const val = dietaryInput.value;
            allergyChips.forEach((chip) => {
                if (val.includes(chip.dataset.allergy)) {
                    chip.classList.add("active");
                } else {
                    chip.classList.remove("active");
                }
            });
        });
    }

    /**
     * 9-1. 카드 내 위시리스트 하트 토글 클릭 이벤트
     */
    wishlistButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const card = btn.closest(".agoda-card");
            if (!card) return;

            const title = card.querySelector(".card-title")?.textContent.trim() || "";
            const img = card.querySelector(".card-img")?.getAttribute("src") || "";
            const price = card.querySelector(".card-price-area .amount")?.textContent.trim() || "";
            const dest = card.dataset.dest || "";
            const dur = card.dataset.dur || "";
            const budget = card.dataset.budget || "";
            const transport = card.dataset.transport || "";
            const theme = card.dataset.theme || "";

            const isAlreadySaved = wishlist.some((w) => w.title === title);
            if (!isAlreadySaved) {
                wishlist.push({ title, img, price, dest, dur, budget, transport, theme });
                btn.classList.add("active");
                btn.textContent = "❤️";
                btn.style.color = "var(--agoda-red)";
            } else {
                wishlist = wishlist.filter((w) => w.title !== title);
                btn.classList.remove("active");
                btn.textContent = "♡";
                btn.style.color = "";
            }

            localStorage.setItem("ai_travel_wishlist", JSON.stringify(wishlist));
            renderWishlistUI();

            if (currentCategory === "wishlist") {
                filterProducts();
            }
        });
    });

    /**
     * 9-2. 좌측 사이드바 '찜 모아보기' 버튼 클릭 시 바로 찜 탭 활성화
     */
    const btnViewWishlistOnly = document.getElementById("btnViewWishlistOnly");
    if (btnViewWishlistOnly) {
        btnViewWishlistOnly.addEventListener("click", () => {
            currentCategory = "wishlist";
            categoryButtons.forEach((b) => b.classList.remove("active"));
            const catWishlistTab = document.getElementById("catWishlistTab");
            if (catWishlistTab) catWishlistTab.classList.add("active");

            if (chipCategory) {
                const textEl = chipCategory.querySelector(".chip-text");
                if (textEl) textEl.textContent = "저장한 여행지";
                chipCategory.style.display = "inline-flex";
            }

            filterProducts();
            document.getElementById("productsSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    /**
     * 9-3. '✨ 찜한 코스로 일정 채우기' 버튼 클릭 시 폼에 일괄 자동 완성 및 예산 초과 분석
     */
    const btnPlanWithWishlist = document.getElementById("btnPlanWithWishlist");
    if (btnPlanWithWishlist) {
        btnPlanWithWishlist.addEventListener("click", () => {
            if (wishlist.length === 0) return;
            const uniqueDests = [...new Set(wishlist.map((w) => w.dest).filter(Boolean))].join(" & ");
            const themes = wishlist.map((w) => w.theme).filter(Boolean).slice(0, 3).join(", ");
            const maxBudgetItem = wishlist.reduce((max, w) => {
                const bVal = parseBudgetNumber(w.budget) || parseBudgetNumber(w.price);
                return bVal > max.val ? { val: bVal, budget: w.budget, title: w.title } : max;
            }, { val: 0, budget: "", title: "" });

            if (uniqueDests) destinationInput.value = uniqueDests;
            if (themes) interestsInput.value = `[저장한 추천 코스] ${themes}`;

            // 예산 초과 여부 확인
            const isOver = checkAndShowBudgetOverload(maxBudgetItem.budget, maxBudgetItem.title);
            if (isOver) {
                interestsInput.value += ` (⚠️ 저장 코스 예산 초과: 분위기는 같고 더 저렴한 가성비 대체 계획으로 추천)`;
            }

            travelForm.scrollIntoView({ behavior: "smooth", block: "center" });
            travelForm.classList.add("form-focus-pulse");
            submitBtn.classList.add("btn-pulse");
            setTimeout(() => {
                travelForm.classList.remove("form-focus-pulse");
                submitBtn.classList.remove("btn-pulse");
            }, 1200);
        });
    }

    /**
     * 10. AI 여행 일정표 생성 요청
     */
    travelForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const destination = destinationInput.value.trim();
        const duration = durationInput.value.trim();
        const startDate = startDateInput ? startDateInput.value.trim() : "";
        const endDate = endDateInput ? endDateInput.value.trim() : "";
        const entryTransport = entryTransportSelect ? entryTransportSelect.value.trim() : "";
        const exitTransport = exitTransportSelect ? exitTransportSelect.value.trim() : "";
        const budget = budgetInput.value.trim();
        const interests = interestsInput.value.trim();
        const companions = companionsInput.value.trim();
        const transportation = transportationInput.value.trim();
        const accommodation = accommodationInput.value.trim();
        const mode = travelModeInput ? travelModeInput.value : (document.querySelector('input[name="mode"]:checked')?.value || "A");
        const travel_style = travelStyleInput ? travelStyleInput.value.trim() : "";
        const dietary_info = dietaryInput ? dietaryInput.value.trim() : "";

        if (!destination || !duration || !budget || !interests) {
            showError("목적지, 여행 기간, 예산, 여행 테마는 필수 입력 항목입니다.");
            return;
        }

        hideError();
        showLoading();
        submitBtn.disabled = true;

        const payload = {
            destination,
            duration,
            start_date: startDate,
            end_date: endDate,
            entry_transport: entryTransport,
            exit_transport: exitTransport,
            budget,
            interests,
            companions,
            transportation,
            accommodation,
            mode,
            travel_style,
            dietary_info
        };

        try {
            const response = await fetch("/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "일정표 생성에 실패했습니다.");
            }

            currentPlanMarkdown = data.plan;
            renderResult(data, destination, duration, payload);

        } catch (err) {
            console.error("AI Generation Error:", err);
            showError(err.message || "서버와 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            hideLoading();
            submitBtn.disabled = false;
        }
    });

    function updateLoadingStep(stepObj) {
        if (!stepObj) return;

        const mainEmojiEl = document.getElementById("loadingMainEmoji");
        const badgeEl = document.getElementById("loadingStepBadge");
        const tipEl = document.getElementById("loadingTip");

        if (mainEmojiEl) {
            mainEmojiEl.textContent = stepObj.emoji;
            mainEmojiEl.style.transform = "scale(1.25)";
            setTimeout(() => {
                if (mainEmojiEl) mainEmojiEl.style.transform = "scale(1)";
            }, 300);
        }

        if (badgeEl) {
            badgeEl.textContent = stepObj.badge;
        }

        if (tipEl) {
            tipEl.classList.add("fade-out");
            setTimeout(() => {
                tipEl.textContent = stepObj.msg;
                tipEl.classList.remove("fade-out");
                tipEl.classList.add("fade-in");
                setTimeout(() => {
                    tipEl.classList.remove("fade-in");
                }, 300);
            }, 250);
        }

        // 진행 단계 칩 활성화 상태 동기화
        for (let i = 1; i <= 4; i++) {
            const chip = document.getElementById(`stepChip${i}`);
            if (chip) {
                if (i === stepObj.step) {
                    chip.classList.add("active");
                } else {
                    chip.classList.remove("active");
                }
            }
        }
    }

    function showLoading() {
        loadingState.style.display = "block";
        resultWrapper.style.display = "none";
        loadingState.scrollIntoView({ behavior: "smooth", block: "start" });

        const loadingTitleEl = document.getElementById("loadingTitle");
        if (loadingTitleEl) {
            loadingTitleEl.textContent = "여행자님만을 위한 특별한 여행 일정을 그리고 있어요 ✨";
        }

        let stepIndex = 0;
        updateLoadingStep(friendlyLoadingSteps[0]);

        if (loadingInterval) {
            clearInterval(loadingInterval);
        }
        loadingInterval = setInterval(() => {
            stepIndex = (stepIndex + 1) % friendlyLoadingSteps.length;
            updateLoadingStep(friendlyLoadingSteps[stepIndex]);
        }, 2100);
    }

    function hideLoading() {
        loadingState.style.display = "none";
        if (loadingInterval) {
            clearInterval(loadingInterval);
            loadingInterval = null;
        }
    }

    function showError(msg) {
        errorAlert.style.display = "block";
        errorMessage.textContent = msg;
        errorAlert.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function hideError() {
        errorAlert.style.display = "none";
    }

    // ==========================================
    // 🗺️ 스마트 인터랙티브 여행 동선 지도 & 카카오맵/구글맵 연동 모듈
    // ==========================================
    const DEST_COORDS = {
        // 국내 5개 도시
        "제주": { lat: 33.3617, lng: 126.5292, zoom: 10 },
        "부산": { lat: 35.1796, lng: 129.0756, zoom: 12 },
        "강릉": { lat: 37.7519, lng: 128.8761, zoom: 12 },
        "속초": { lat: 38.2070, lng: 128.5918, zoom: 12 },
        "경주": { lat: 35.8562, lng: 129.2247, zoom: 12 },
        "여수": { lat: 34.7604, lng: 127.6622, zoom: 12 },
        "서울": { lat: 37.5665, lng: 126.9780, zoom: 12 },
        // 해외 - 아시아 8개 도시
        "오사카": { lat: 34.6937, lng: 135.5023, zoom: 12 },
        "교토": { lat: 35.0116, lng: 135.7681, zoom: 12 },
        "도쿄": { lat: 35.6762, lng: 139.6503, zoom: 12 },
        "후쿠오카": { lat: 33.5904, lng: 130.4017, zoom: 12 },
        "유후인": { lat: 33.2644, lng: 131.3556, zoom: 13 },
        "삿포로": { lat: 43.0618, lng: 141.3545, zoom: 12 },
        "오타루": { lat: 43.1907, lng: 140.9947, zoom: 13 },
        "비에이": { lat: 43.5900, lng: 142.4633, zoom: 12 },
        "방콕": { lat: 13.7563, lng: 100.5018, zoom: 12 },
        "파타야": { lat: 12.9276, lng: 100.8771, zoom: 12 },
        "다낭": { lat: 16.0544, lng: 108.2022, zoom: 12 },
        "호이안": { lat: 15.8801, lng: 108.3380, zoom: 13 },
        "타이베이": { lat: 25.0330, lng: 121.5654, zoom: 12 },
        "싱가포르": { lat: 1.3521, lng: 103.8198, zoom: 12 },
        "발리": { lat: -8.4095, lng: 115.1889, zoom: 11 },
        "우붓": { lat: -8.5069, lng: 115.2625, zoom: 13 },
        // 해외 - 미주/유럽 7개 도시
        "괌": { lat: 13.4443, lng: 144.7937, zoom: 12 },
        "투몬": { lat: 13.5147, lng: 144.8058, zoom: 13 },
        "파리": { lat: 48.8566, lng: 2.3522, zoom: 12 },
        "런던": { lat: 51.5074, lng: -0.1278, zoom: 12 },
        "로마": { lat: 41.9028, lng: 12.4964, zoom: 12 },
        "바르셀로나": { lat: 41.3851, lng: 2.1734, zoom: 12 },
        "뉴욕": { lat: 40.7128, lng: -74.0060, zoom: 12 },
        "맨해튼": { lat: 40.7831, lng: -73.9712, zoom: 12 }
    };

    const SPOT_COORDS = {
        // 제주 스팟
        "제주공항": { lat: 33.5113, lng: 126.4930 },
        "애월": { lat: 33.4628, lng: 126.3117 },
        "한담해변": { lat: 33.4621, lng: 126.3093 },
        "한담해안산책로": { lat: 33.4618, lng: 126.3105 },
        "협재": { lat: 33.3941, lng: 126.2397 },
        "협재해수욕장": { lat: 33.3941, lng: 126.2397 },
        "금능해수욕장": { lat: 33.3905, lng: 126.2345 },
        "한림공원": { lat: 33.3892, lng: 126.2394 },
        "오설록": { lat: 33.3059, lng: 126.2894 },
        "오설록 티뮤지엄": { lat: 33.3059, lng: 126.2894 },
        "산방산": { lat: 33.2415, lng: 126.3130 },
        "용머리해안": { lat: 33.2325, lng: 126.3146 },
        "중문": { lat: 33.2483, lng: 126.4132 },
        "중문관광단지": { lat: 33.2483, lng: 126.4132 },
        "천제연폭포": { lat: 33.2525, lng: 126.4184 },
        "주상절리": { lat: 33.2376, lng: 126.4250 },
        "대포주상절리": { lat: 33.2376, lng: 126.4250 },
        "서귀포": { lat: 33.2541, lng: 126.5601 },
        "올레시장": { lat: 33.2504, lng: 126.5638 },
        "서귀포 매일올레시장": { lat: 33.2504, lng: 126.5638 },
        "천지연폭포": { lat: 33.2448, lng: 126.5596 },
        "정방폭포": { lat: 33.2449, lng: 126.5718 },
        "이중섭거리": { lat: 33.2488, lng: 126.5645 },
        "쇠소깍": { lat: 33.2524, lng: 126.6231 },
        "사려니숲길": { lat: 33.4077, lng: 126.6430 },
        "비자림": { lat: 33.4913, lng: 126.8114 },
        "성산일출봉": { lat: 33.4586, lng: 126.9427 },
        "섭지코지": { lat: 33.4243, lng: 126.9311 },
        "우도": { lat: 33.5042, lng: 126.9541 },
        "우도 해안도로": { lat: 33.5042, lng: 126.9541 },
        "우도봉": { lat: 33.4988, lng: 126.9602 },
        "검멀레 해변": { lat: 33.5002, lng: 126.9625 },
        "하고수동 해수욕장": { lat: 33.5145, lng: 126.9580 },
        "광치기해변": { lat: 33.4608, lng: 126.9248 },
        "자매국수": { lat: 33.5085, lng: 126.5312 },
        "자매국수 본점": { lat: 33.5085, lng: 126.5312 },
        "칠돈가": { lat: 33.5032, lng: 126.5298 },
        "칠돈가 본점": { lat: 33.5032, lng: 126.5298 },
        "숙성도": { lat: 33.4862, lng: 126.4880 },
        "숙성도 본점": { lat: 33.4862, lng: 126.4880 },
        "해비치 호텔": { lat: 33.3228, lng: 126.8447 },
        "신신호텔": { lat: 33.2480, lng: 126.5620 },
        "신라호텔": { lat: 33.2475, lng: 126.4085 },
        "롯데호텔": { lat: 33.2482, lng: 126.4105 },
        "아르떼뮤지엄": { lat: 33.3965, lng: 126.3475 },
        "스누피가든": { lat: 33.4352, lng: 126.7788 },
        "에코랜드": { lat: 33.4568, lng: 126.6685 },
        "휴애리": { lat: 33.3085, lng: 126.6340 },
        "산굼부리": { lat: 33.4332, lng: 126.6875 },
        "이호테우": { lat: 33.4982, lng: 126.4528 },
        "이호테우해수욕장": { lat: 33.4982, lng: 126.4528 },
        "곽지해수욕장": { lat: 33.4507, lng: 126.3105 },
        "판포포구": { lat: 33.3668, lng: 126.2005 },
        "신창풍차해안도로": { lat: 33.3445, lng: 126.1738 },
        "풍차해안도로": { lat: 33.3445, lng: 126.1738 },
        "수월봉": { lat: 33.2975, lng: 126.1628 },
        "송악산": { lat: 33.2038, lng: 126.2905 },
        "함덕": { lat: 33.5434, lng: 126.6692 },
        "함덕해수욕장": { lat: 33.5434, lng: 126.6692 },
        "동문시장": { lat: 33.5126, lng: 126.5283 },
        "용두암": { lat: 33.5163, lng: 126.5123 },
        "카멜리아힐": { lat: 33.2897, lng: 126.3697 },

        // 괌 스팟 (🌟 괌 주요 관광지 및 비치 완벽 매핑)
        "괌공항": { lat: 13.4834, lng: 144.7959 },
        "앤토니오 B. 원 팻 국제공항": { lat: 13.4834, lng: 144.7959 },
        "투몬비치": { lat: 13.5147, lng: 144.8058 },
        "사랑의 절벽": { lat: 13.5332, lng: 144.8028 },
        "이파오 비치": { lat: 13.5050, lng: 144.7925 },
        "아가냐 대성당": { lat: 13.4735, lng: 144.7523 },
        "스페인 광장": { lat: 13.4731, lng: 144.7519 },
        "괌 프리미엄 아울렛": { lat: 13.4988, lng: 144.7766 },
        "GPO": { lat: 13.4988, lng: 144.7766 },
        "마이크로네시아몰": { lat: 13.5228, lng: 144.8184 },
        "T갤러리아": { lat: 13.5169, lng: 144.8080 },
        "탈로포포 폭포": { lat: 13.3242, lng: 144.7554 },
        "메리조 부두": { lat: 13.2676, lng: 144.6713 },
        "우마탁 마을": { lat: 13.2982, lng: 144.6623 },
        "세티만 전망대": { lat: 13.3197, lng: 144.6601 },
        "이나라한 자연수영장": { lat: 13.2778, lng: 144.7508 },

        // 여수 스팟
        "여수엑스포역": { lat: 34.7528, lng: 127.7486 },
        "돌산대교": { lat: 34.7298, lng: 127.7348 },
        "오동도": { lat: 34.7454, lng: 127.7667 },
        "여수 해상케이블카": { lat: 34.7431, lng: 127.7552 },
        "낭만포차": { lat: 34.7397, lng: 127.7423 },
        "하멜등대": { lat: 34.7408, lng: 127.7441 },
        "향일암": { lat: 34.5933, lng: 127.8086 },

        // 싱가포르 스팟
        "창이공항": { lat: 1.3644, lng: 103.9915 },
        "마리나베이샌즈": { lat: 1.2838, lng: 103.8591 },
        "가든스바이더베이": { lat: 1.2815, lng: 103.8636 },
        "센토사": { lat: 1.2494, lng: 103.8303 },
        "유니버설스튜디오 싱가포르": { lat: 1.2540, lng: 103.8238 },
        "머라이언파크": { lat: 1.2868, lng: 103.8545 },
        "클락키": { lat: 1.2887, lng: 103.8465 },

        // 발리 스팟
        "응우라라이공항": { lat: -8.7481, lng: 115.1672 },
        "우붓 왕궁": { lat: -8.5069, lng: 115.2625 },
        "뜨갈랄랑": { lat: -8.4334, lng: 115.2798 },
        "몽키포레스트": { lat: -8.5190, lng: 115.2587 },
        "울루와투 사원": { lat: -8.8291, lng: 115.0849 },
        "짱구 비치": { lat: -8.6542, lng: 115.1309 },
        "스미냑": { lat: -8.6913, lng: 115.1682 },

        // 삿포로 & 오타루 스팟
        "신치토세공항": { lat: 42.7752, lng: 141.6923 },
        "스스키노": { lat: 43.0552, lng: 141.3533 },
        "오도리공원": { lat: 43.0598, lng: 141.3563 },
        "삿포로 맥주박물관": { lat: 43.0716, lng: 141.3688 },
        "오타루 운하": { lat: 43.1993, lng: 141.0021 },
        "오르골당": { lat: 43.1907, lng: 141.0076 },
        "청의 호수": { lat: 43.4934, lng: 142.6143 },
        "흰수염 폭포": { lat: 43.4754, lng: 142.6415 },

        // 런던 스팟
        "히드로공항": { lat: 51.4700, lng: -0.4543 },
        "빅벤": { lat: 51.5007, lng: -0.1246 },
        "런던아이": { lat: 51.5033, lng: -0.1195 },
        "타워브릿지": { lat: 51.5055, lng: -0.0754 },
        "대영박물관": { lat: 51.5194, lng: -0.1270 },
        "버킹엄궁전": { lat: 51.5014, lng: -0.1419 },

        // 로마 스팟
        "피우미치노공항": { lat: 41.8003, lng: 12.2389 },
        "콜로세움": { lat: 41.8902, lng: 12.4922 },
        "트레비분수": { lat: 41.9009, lng: 12.4833 },
        "바티칸": { lat: 41.9029, lng: 12.4534 },
        "판테온": { lat: 41.8986, lng: 12.4769 },
        "스페인광장": { lat: 41.9057, lng: 12.4823 },

        // 파리 스팟
        "에펠탑": { lat: 48.8584, lng: 2.2945 },
        "루브르박물관": { lat: 48.8606, lng: 2.3376 },
        "개선문": { lat: 48.8738, lng: 2.2950 },
        "샹젤리제": { lat: 48.8698, lng: 2.3075 },
        "오르세미술관": { lat: 48.8599, lng: 2.3265 },
        "몽마르뜨": { lat: 48.8867, lng: 2.3431 },

        // 뉴욕 스팟
        "타임스퀘어": { lat: 40.7580, lng: -73.9855 },
        "센트럴파크": { lat: 40.7851, lng: -73.9683 },
        "엠파이어스테이트빌딩": { lat: 40.7484, lng: -73.9857 },
        "탑오브더락": { lat: 40.7590, lng: -73.9794 },
        "자유의여신상": { lat: 40.6892, lng: -74.0445 },
        "브루클린브릿지": { lat: 40.7061, lng: -73.9969 },

        // 바르셀로나 스팟
        "사그라다파밀리아": { lat: 41.4036, lng: 2.1744 },
        "구엘공원": { lat: 41.4145, lng: 2.1527 },
        "카사바트요": { lat: 41.3916, lng: 2.1648 },
        "람블라스": { lat: 41.3813, lng: 2.1730 },
        "보케리아시장": { lat: 41.3817, lng: 2.1715 },

        // 오사카 스팟
        "도톤보리": { lat: 34.6687, lng: 135.5013 },
        "난바": { lat: 34.6660, lng: 135.5003 },
        "신사이바시": { lat: 34.6751, lng: 135.5005 },
        "유니버설 스튜디오": { lat: 34.6654, lng: 135.4323 },
        "오사카성": { lat: 34.6873, lng: 135.5262 },
        "우메다 스카이빌딩": { lat: 34.7053, lng: 135.4900 },
        "하루카스300": { lat: 34.6459, lng: 135.5140 },

        // 도쿄 스팟
        "신주쿠": { lat: 35.6938, lng: 139.7034 },
        "시부야": { lat: 35.6580, lng: 139.7016 },
        "시부야 스카이": { lat: 35.6585, lng: 139.7022 },
        "아사쿠사": { lat: 35.7148, lng: 139.7967 },
        "센소지": { lat: 35.7148, lng: 139.7967 },
        "도쿄타워": { lat: 35.6586, lng: 139.7454 },
        "긴자": { lat: 35.6719, lng: 139.7649 },

        // 후쿠오카 스팟
        "하카타": { lat: 33.5902, lng: 130.4207 },
        "텐진": { lat: 33.5916, lng: 130.3989 },
        "후쿠오카 타워": { lat: 33.5933, lng: 130.3515 },
        "모모치 해변": { lat: 33.5954, lng: 130.3519 },
        "다자이후": { lat: 33.5215, lng: 130.5349 },

        // 방콕 스팟
        "카오산로드": { lat: 13.7589, lng: 100.4974 },
        "왓아룬": { lat: 13.7437, lng: 100.4889 },
        "아이콘시암": { lat: 13.7267, lng: 100.5108 },

        // 주요 공항 스팟 (모든 여행지 1일차 공항 출발 지원)
        "제주공항": { lat: 33.5113, lng: 126.4930 },
        "제주국제공항": { lat: 33.5113, lng: 126.4930 },
        "간사이공항": { lat: 34.4320, lng: 135.2304 },
        "간사이국제공항": { lat: 34.4320, lng: 135.2304 },
        "하네다공항": { lat: 35.5494, lng: 139.7798 },
        "나리타공항": { lat: 35.7720, lng: 140.3929 },
        "후쿠오카공항": { lat: 33.5859, lng: 130.4507 },
        "수완나품공항": { lat: 13.6900, lng: 100.7501 },
        "수완나품국제공항": { lat: 13.6900, lng: 100.7501 },
        "다낭공항": { lat: 16.0538, lng: 108.1994 },
        "다낭국제공항": { lat: 16.0538, lng: 108.1994 },
        "타오위안공항": { lat: 25.0797, lng: 121.2342 },
        "타오위안국제공항": { lat: 25.0797, lng: 121.2342 },
        "샤를드골공항": { lat: 49.0097, lng: 2.5479 },
        "샤를드골국제공항": { lat: 49.0097, lng: 2.5479 },
        "JFK공항": { lat: 40.6413, lng: -73.7781 },
        "존F케네디국제공항": { lat: 40.6413, lng: -73.7781 },
        "엘프랏공항": { lat: 41.2974, lng: 2.0833 },
        "바르셀로나공항": { lat: 41.2974, lng: 2.0833 },
        "인천공항": { lat: 37.4602, lng: 126.4407 },
        "김포공항": { lat: 37.5587, lng: 126.7945 },
        "김해공항": { lat: 35.1795, lng: 128.9382 },
        "김해국제공항": { lat: 35.1795, lng: 128.9382 },

        // 다낭 스팟
        "미케비치": { lat: 16.0601, lng: 108.2464 },
        "바나힐": { lat: 15.9989, lng: 107.9866 },
        "호이안": { lat: 15.8801, lng: 108.3380 },

        // 국내 주요 도시 스팟
        "경복궁": { lat: 37.5796, lng: 126.9770 },
        "명동": { lat: 37.5636, lng: 126.9827 },
        "해운대": { lat: 35.1587, lng: 129.1604 },
        "광안리": { lat: 35.1532, lng: 129.1189 }
    };

    let leafletMap = null;
    let mapMarkerLayerGroup = null;
    let mapPolylineLayerGroup = null;
    let currentMapDayFilter = "all";

    const DAY_COLOR_MAP = {
        1: "#2563eb",
        2: "#059669",
        3: "#7c3aed",
        4: "#ea580c"
    };

    /**
     * AI 계획서 텍스트에서 '평균', '접이식 전기차' 같은 비장소 단어를 걸러내고 실제 명소/식당/상호명만 추출
     */
    function cleanPlaceName(rawContent, currentDay) {
        if (!rawContent) return null;
        let text = rawContent.trim();

        // 1. 꿀팁, 이동시간, 예상 경비, 주의사항 등 정보성 텍스트는 원천 제외
        if (/(꿀팁|소요시간|이동시간|예상\s*경비|경비|비용|이동\s*정보|준비물|주의사항|환전|안내사항)/i.test(text)) {
            return null;
        }

        // 2. 괄호 안의 부가설명(가격, 대기시간, 세부사항 등) 제거
        text = text.replace(/\([^\)]*\)/g, " ").replace(/（[^）]*）/g, " ");

        // 3. 이동 화살표(➜, →, ->, ~>) 동선에서 메인 목적지 세그먼트 분리
        if (/[➜→\->~>]/.test(text)) {
            const segs = text.split(/[➜→\->~>]+/).map(s => s.trim()).filter(Boolean);
            let targetSeg = segs[segs.length - 1];
            // 마지막 세그먼트가 단순 '이동/도착/출발'이면 바로 앞의 명소 선택
            if (/^(이동|출발|도착|체크인|복귀)$/.test(targetSeg) && segs.length > 1) {
                targetSeg = segs[segs.length - 2];
            }
            text = targetSeg || text;
        }

        // 4. 마크다운 기호 제거
        text = text.replace(/[\*\_`~\[\]]/g, " ").trim();

        // 5. 렌터카, 접이식 전기차, 셔틀버스 등 이동수단/대여 접두어 제거
        text = text.replace(/^(?:접이식\s*전기차|전기차|전동\s*바이크|전동\s*스쿠터|전기자전거|자전거|렌터카|렌트카|셔틀버스|대중교통|차량)\s*(?:대여|탑승|이용|픽업|인수)?\s*(?:및|후|로|타고)?\s*/gi, "");

        // 6. 평균, 대략, 약, 맛집, 명소 등 일반 수식어 제거
        text = text.replace(/^(?:평균|대략|약|최고의|인기|유명|대표|시그니처|추천|로컬|숨은|필수|감성|힐링)\s*(?:맛집|명소|식당|카페|투어|코스|만찬|체험|관광)?\s*[:：\-·]?\s*/gi, "");

        // 7. SPOT_COORDS 중에서 긴 이름 순으로 포함 여부 최우선 탐색
        const spotKeys = Object.keys(SPOT_COORDS).sort((a, b) => b.length - a.length);
        for (const key of spotKeys) {
            if (text.includes(key) || rawContent.includes(key)) {
                return key;
            }
        }

        // 8. 쉼표, 슬래시 등으로 분리 후 첫 번째 명소명 추출
        const chunks = text.split(/[,/·&|및\s+➜→]+/);
        let candidate = chunks[0] ? chunks[0].trim() : text;

        // 9. 서술어/동사 접미사 제거 (예: "성산일출봉 탐방" -> "성산일출봉", "우도 해안도로 라이딩" -> "우도 해안도로")
        candidate = candidate.replace(/\s*(?:탐방|관람|산책|산책로\s*걷기|등반|라이딩|투어|체험|일주|구경|방문|식사|시식|만찬|즐기기|힐링|휴식|숙박|체크인|체크아웃|이동|도착|출발|인수|반납|대여)$/gi, "").trim();

        // 10. 문맥 조사 제거 (에서, 으로, 에게, 에서부터)
        candidate = candidate.replace(/(?:에서|으로|에게|에서부터)\s*$/g, "").trim();

        // 11. 무효 키워드 블랙리스트 체크 (평균, 접이식 전기차 등)
        const INVALID_WORDS = new Set([
            "평균", "접이식", "전기차", "접이식 전기차", "전동스쿠터", "전기자전거", "자전거",
            "렌터카", "렌트카", "셔틀", "셔틀버스", "대중교통", "차량", "소요", "시간",
            "소요시간", "이동시간", "경비", "예상", "비용", "대기", "웨이팅", "대기시간",
            "확인", "필요", "주의", "참고", "안내", "꿀팁", "팁", "준비물",
            "추천", "인기", "최고", "유명", "로컬", "식사", "만찬", "체크인", "체크아웃",
            "휴식", "자유", "일정", "코스", "동선", "루트", "약", "대략", "최소", "최대", "총", "기준",
            "오전", "점심", "오후", "저녁", "숙소", "도착", "출발", "이동", "탑승", "첫코스"
        ]);

        if (!candidate || candidate.length < 2 || INVALID_WORDS.has(candidate)) {
            return null;
        }

        // 숫자나 금액으로 시작하는 경우 제외
        if (/^(약|대략|평균|총|최소|최대)?\s*\d+/.test(candidate) || /^\d+/.test(candidate)) {
            return null;
        }

        if (candidate.length > 15) {
            candidate = candidate.split(/\s+/).slice(0, 3).join(" ");
        }

        return candidate;
    }

    function extractPlacesFromPlan(markdown, destination, transportType) {
        if (!markdown) return [];
        const places = [];

        let center = { lat: 33.3617, lng: 126.5292 }; // 기본 제주
        for (const [key, coords] of Object.entries(DEST_COORDS)) {
            if (destination.includes(key)) {
                center = coords;
                break;
            }
        }

        // 일자별 구분 정규식 (### 🌟 [Day 1], #### ■ 1일차, ### Day 1 등 모두 유연하게 지원)
        const daySections = markdown.split(/(?=###\s*🌟?\s*\[?Day\s*\d+|####\s*■\s*\d+일차|####\s*■\s*Day\s*\d+|###\s*■?\s*\d+일차)/gi);
        let dayIndex = 1;

        daySections.forEach((sec) => {
            const dayMatch = sec.match(/(?:Day\s*|■\s*)(\d+)|(\d+)일차/i);
            const currentDay = dayMatch ? parseInt(dayMatch[1] || dayMatch[2], 10) : dayIndex;

            const lines = sec.split('\n');
            let orderInDay = 1;

            lines.forEach((line) => {
                // 정보성 불릿(팁, 이동시간, 경비 등)은 장소 추출 원천 차단
                if (/^[-*]\s*(?:💡|🚗|⏱️|💰|ℹ️|⚠️)/.test(line) || /(꿀팁|소요시간|이동시간|예상\s*경비|경비|비용|이동\s*정보|준비물|주의사항)/i.test(line)) {
                    return;
                }

                // 장소/방문지/미식/숙소 관련 라인 매칭
                const timeMatch = line.match(/(?:[-*]\s*(?:📍|🍴|🎯|🌙|🏨|🌅|✈️|🚢|🚄)?\s*\*\*?(도착\s*&?\s*첫\s*코스|첫\s*목적지|추천\s*미식|핵심\s*관광[^:]*|방문\s*장소|핵심\s*명소|저녁\s*만찬|점심\s*식사|숙소\s*체크인|숙소|동선\/출국수속|관광\s*지)\*\*?:\s*|[-*]\s*(?:📍|🍴|🎯|🌙|🏨)\s*(?:\[[^\]]+\])?\s*)([^\r\n]+)/i);
                if (timeMatch) {
                    const rawContent = (timeMatch[2] ? timeMatch[2].trim() : (timeMatch[1] || "")).trim();
                    const placeName = cleanPlaceName(rawContent, currentDay);

                    if (placeName && !places.some(p => p.day === currentDay && p.name === placeName)) {
                        let spotCoord = SPOT_COORDS[placeName];
                        if (!spotCoord) {
                            for (const [sKey, sVal] of Object.entries(SPOT_COORDS)) {
                                if (rawContent.includes(sKey)) {
                                    spotCoord = sVal;
                                    break;
                                }
                            }
                        }

                        if (!spotCoord) {
                            const angle = ((currentDay * 80 + orderInDay * 55) % 360) * (Math.PI / 180);
                            const radius = 0.035 + (orderInDay * 0.02);
                            spotCoord = {
                                lat: center.lat + Math.sin(angle) * radius,
                                lng: center.lng + Math.cos(angle) * (radius * 1.3)
                            };
                        }

                        places.push({
                            day: currentDay,
                            order: orderInDay,
                            name: placeName,
                            desc: rawContent,
                            lat: spotCoord.lat,
                            lng: spotCoord.lng
                        });
                        orderInDay++;
                    }
                }
            });

            dayIndex++;
        });

        // 🌟 모든 여행지의 1일차 첫 출발지는 항상 해당 여행지 '공항'으로 보장
        const airportMap = {
            "제주": { name: "제주국제공항", lat: 33.5113, lng: 126.4930 },
            "부산": { name: "김해국제공항", lat: 35.1795, lng: 128.9382 },
            "강릉": { name: "강릉역 KTX (출발지)", lat: 37.7645, lng: 128.8996 },
            "속초": { name: "속초 고속버스터미널 (출발지)", lat: 38.1905, lng: 128.5986 },
            "경주": { name: "신경주역 KTX (출발지)", lat: 35.7981, lng: 129.1396 },
            "여수": { name: "여수엑스포역 KTX (출발지)", lat: 34.7528, lng: 127.7486 },
            "서울": { name: "김포국제공항", lat: 37.5587, lng: 126.7945 },
            "오사카": { name: "간사이국제공항", lat: 34.4320, lng: 135.2304 },
            "도쿄": { name: "하네다국제공항", lat: 35.5494, lng: 139.7798 },
            "후쿠오카": { name: "후쿠오카공항", lat: 33.5859, lng: 130.4507 },
            "삿포로": { name: "신치토세국제공항", lat: 42.7752, lng: 141.6923 },
            "방콕": { name: "수완나품국제공항", lat: 13.6900, lng: 100.7501 },
            "다낭": { name: "다낭국제공항", lat: 16.0538, lng: 108.1994 },
            "타이베이": { name: "타오위안국제공항", lat: 25.0797, lng: 121.2342 },
            "싱가포르": { name: "싱가포르 창이국제공항", lat: 1.3644, lng: 103.9915 },
            "발리": { name: "발리 응우라라이국제공항", lat: -8.7481, lng: 115.1672 },
            "괌": { name: "괌 앤토니오 B. 원팻 국제공항", lat: 13.4834, lng: 144.7959 },
            "파리": { name: "샤를드골국제공항", lat: 49.0097, lng: 2.5479 },
            "런던": { name: "런던 히드로국제공항", lat: 51.4700, lng: -0.4543 },
            "로마": { name: "로마 레오나르도 다빈치(피우미치노)공항", lat: 41.8003, lng: 12.2389 },
            "바르셀로나": { name: "바르셀로나 엘프랏국제공항", lat: 41.2974, lng: 2.0833 },
            "뉴욕": { lat: 40.6413, lng: -73.7781, name: "존F케네디(JFK)국제공항" }
        };

        let targetAirport = null;
        for (const [k, ap] of Object.entries(airportMap)) {
            if (destination.includes(k)) {
                targetAirport = ap;
                break;
            }
        }
        if (!targetAirport) {
            targetAirport = { name: `${destination} 공항/역 (출발)`, lat: center.lat + 0.02, lng: center.lng - 0.02 };
        }

        // 1일차 장소 목록 중 공항이 이미 있는지 확인
        const hasDay1Airport = places.some(p => p.day === 1 && (p.name.includes("공항") || p.name.includes("Airport") || p.name.includes("역")));
        const isTransit = (transportType || "").includes("대중교통") || (transportType || "").includes("버스") || (transportType || "").includes("지하철");
        if (!hasDay1Airport) {
            // 맨 앞에 1일차 출발지(공항) 삽입
            places.unshift({
                day: 1,
                order: 1,
                name: targetAirport.name,
                desc: isTransit ? "공항 도착 및 대중교통(급행/간선/지하철) 탑승 / 여정 시작" : "공항 도착 및 렌터카 픽업 / 여정 시작",
                lat: targetAirport.lat,
                lng: targetAirport.lng
            });
        }

        // 각 Day별 order 번호 1부터 순차 재정렬
        const dayCounts = {};
        places.forEach(p => {
            dayCounts[p.day] = (dayCounts[p.day] || 0) + 1;
            p.order = dayCounts[p.day];
        });

        if (places.length === 0) {
            places.push(
                { day: 1, order: 1, name: targetAirport.name, desc: "공항 도착 및 첫날 일정 시작", lat: targetAirport.lat, lng: targetAirport.lng },
                { day: 1, order: 2, name: `${destination} 대표 감성 명소`, desc: "첫날 오후 시그니처 랜드마크", lat: center.lat - 0.02, lng: center.lng - 0.04 },
                { day: 2, order: 1, name: `${destination} 자연 & 힐링 코스`, desc: "둘째날 메인 힐링 투어", lat: center.lat - 0.05, lng: center.lng + 0.03 },
                { day: 2, order: 2, name: `${destination} 로컬 찐맛집 탐방`, desc: "둘째날 저녁 미식 및 야경 명소", lat: center.lat + 0.01, lng: center.lng + 0.04 }
            );
        }

        return places;
    }

    // 모바일 카카오맵 앱(Deep Link) 직접 실행 및 미설치 시 웹 폴백 핸들러
    window.openKakaoMap = function(event, lat, lng, encodedName, mode) {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (!isMobile) {
            // PC 환경: 기본 a 태그 href 웹 링크로 새 탭에서 열기
            return true;
        }

        if (event) event.preventDefault();

        let appScheme = "";
        let webFallback = "";

        if (mode === "transit") {
            // 카카오맵 앱 대중교통 길찾기 스킴
            appScheme = `kakaomap://route?ep=${lat},${lng}&by=PUBLICTRANSIT`;
            webFallback = `https://map.kakao.com/?eName=${encodedName}&ep=${lat},${lng}&target=transit`;
        } else if (mode === "search") {
            // 카카오맵 앱 장소 검색 스킴
            appScheme = `kakaomap://search?q=${encodedName}`;
            webFallback = `https://map.kakao.com/link/search/${encodedName}`;
        } else {
            // 카카오맵 앱 자동차 길찾기/내비 스킴
            appScheme = `kakaomap://route?ep=${lat},${lng}&by=CAR`;
            webFallback = `https://map.kakao.com/link/to/${encodedName},${lat},${lng}`;
        }

        const startTime = Date.now();
        window.location.href = appScheme;

        // 카카오맵 앱 미설치 시 1.2초 후 모바일 웹 페이지로 자동 폴백
        setTimeout(() => {
            if (Date.now() - startTime < 2000 && !document.hidden) {
                window.location.href = webFallback;
            }
        }, 1200);

        return false;
    };

    function drawMapLayers(places, filterDay, destName, transportType) {
        if (!leafletMap || !mapMarkerLayerGroup || !mapPolylineLayerGroup) return;

        mapMarkerLayerGroup.clearLayers();
        mapPolylineLayerGroup.clearLayers();

        const filtered = filterDay === "all" ? places : places.filter(p => String(p.day) === String(filterDay));
        if (filtered.length === 0) return;

        const bounds = [];
        // 국내 6개 도시 외에는 모두 해외 지역으로 판별하여 구글 지도로 최적화
        const DOMESTIC_CITIES = ["제주", "부산", "강릉", "속초", "경주", "여수", "서울"];
        const isDomestic = DOMESTIC_CITIES.some(c => destName.includes(c));
        const isTransit = (transportType || "").includes("대중교통") || (transportType || "").includes("버스") || (transportType || "").includes("지하철");
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        // 지도 상단 안내 배지 및 설명글도 국내/해외에 맞춰 동적 전환
        const mapNavEngineBadge = document.getElementById("mapNavEngineBadge");
        if (mapNavEngineBadge) {
            if (isDomestic) {
                mapNavEngineBadge.className = "map-kakao-tag";
                mapNavEngineBadge.textContent = "💛 카카오맵 원클릭 길찾기";
            } else {
                mapNavEngineBadge.className = "map-google-tag";
                mapNavEngineBadge.textContent = "🌐 구글 지도(Google Maps) 글로벌 길찾기";
            }
        }
        const mapSectionLinkService = document.getElementById("mapSectionLinkService");
        if (mapSectionLinkService) {
            mapSectionLinkService.textContent = isDomestic ? "카카오맵 길찾기" : "구글 지도(Google Maps) 길찾기";
        }

        filtered.forEach((p) => {
            bounds.push([p.lat, p.lng]);
            const dayColorClass = `pin-day-${Math.min(4, p.day)}`;
            const pinColor = DAY_COLOR_MAP[p.day] || "#6366f1";

            const customIcon = L.divIcon({
                className: "map-pin-custom",
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -30],
                html: `
                    <div class="pin-badge ${dayColorClass}" title="${p.name}">
                        <span class="pin-number">${p.order}</span>
                    </div>
                `
            });

            // 카카오맵 웹 URL (국내 전용)
            const encodedName = encodeURIComponent(p.name);
            const kakaoTransitUrl = `https://map.kakao.com/?eName=${encodedName}&ep=${p.lat},${p.lng}&target=transit`;
            const kakaoNavUrl = `https://map.kakao.com/link/to/${encodedName},${p.lat},${p.lng}`;
            const kakaoSearchUrl = `https://map.kakao.com/link/search/${encodedName}`;

            // 구글 지도 웹 URL (해외 지역 또는 구글맵 우선)
            const googleNavUrl = isTransit
                ? `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=transit`
                : `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
            const googleSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodedName}`;

            const targetNavUrl = isDomestic
                ? (isTransit ? kakaoTransitUrl : kakaoNavUrl)
                : googleNavUrl;

            // 모바일/PC 버튼 텍스트
            const navBtnText = isDomestic
                ? (isMobile
                    ? (isTransit ? '🚌 카카오맵 앱으로 대중교통 길찾기' : '🚗 카카오맵 앱으로 길찾기')
                    : (isTransit ? '🚌 카카오맵 대중교통 길찾기' : '🚗 카카오맵 내비/길찾기'))
                : (isTransit ? '🌐 구글맵 대중교통 길찾기' : '🌐 구글맵 경로 안내');

            const searchBtnText = isDomestic
                ? (isMobile ? '📍 카카오맵 앱에서 검색' : '📍 카카오맵에서 상세 검색')
                : '🗺️ 구글 지도에서 위치·사진 보기';

            const navOnclick = isDomestic ? `onclick="return window.openKakaoMap(event, '${p.lat}', '${p.lng}', '${encodedName}', '${isTransit ? 'transit' : 'car'}');"` : '';
            const searchOnclick = isDomestic ? `onclick="return window.openKakaoMap(event, '${p.lat}', '${p.lng}', '${encodedName}', 'search');"` : '';

            const popupContent = `
                <div class="kakao-map-popup">
                    <span class="popup-day-tag" style="background-color: ${pinColor};">${p.day}일차 #${p.order}</span>
                    <h4 class="popup-title">${p.name}</h4>
                    <p class="popup-desc">${p.desc || ''}</p>
                    <div class="popup-actions">
                        <a href="${targetNavUrl}" ${navOnclick} target="_blank" rel="noopener noreferrer" class="btn-kakao-nav ${isTransit ? 'btn-transit-mode' : ''} ${!isDomestic ? 'btn-google-mode' : ''}">
                            <span>${navBtnText}</span>
                        </a>
                        <a href="${isDomestic ? kakaoSearchUrl : googleSearchUrl}" ${searchOnclick} target="_blank" rel="noopener noreferrer" class="btn-kakao-search">
                            <span>${searchBtnText}</span>
                        </a>
                    </div>
                </div>
            `;

            const marker = L.marker([p.lat, p.lng], { icon: customIcon }).bindPopup(popupContent);
            mapMarkerLayerGroup.addLayer(marker);
        });

        const groupedByDay = {};
        filtered.forEach(p => {
            if (!groupedByDay[p.day]) groupedByDay[p.day] = [];
            groupedByDay[p.day].push([p.lat, p.lng]);
        });

        Object.entries(groupedByDay).forEach(([day, latlngs]) => {
            if (latlngs.length >= 2) {
                const color = DAY_COLOR_MAP[day] || "#6366f1";
                const polyline = L.polyline(latlngs, {
                    color: color,
                    weight: 4,
                    opacity: 0.8,
                    dashArray: "6, 8",
                    lineJoin: "round"
                });
                mapPolylineLayerGroup.addLayer(polyline);
            }
        });

        if (bounds.length > 0) {
            leafletMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        }
    }

    function renderPlanMapForPlan(plan) {
        const mapSection = document.getElementById("planMapSection");
        const mapCanvas = document.getElementById("planInteractiveMap");
        if (!mapSection || !mapCanvas || !window.L) return;

        const places = extractPlacesFromPlan(plan.markdown, plan.dest, plan.transportation);
        if (places.length === 0) {
            mapSection.style.display = "none";
            return;
        }
        mapSection.style.display = "block";

        if (!leafletMap) {
            leafletMap = L.map("planInteractiveMap", {
                scrollWheelZoom: false
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
            }).addTo(leafletMap);

            mapMarkerLayerGroup = L.layerGroup().addTo(leafletMap);
            mapPolylineLayerGroup = L.layerGroup().addTo(leafletMap);

            // 지도 직접 클릭 시 숙소/경유지 추가 이벤트
            leafletMap.on("click", (e) => {
                if (!isMapPickingMode) return;
                const clickedLat = e.latlng.lat;
                const clickedLng = e.latlng.lng;
                const customWaypointName = document.getElementById("customWaypointName");
                const customWaypointDay = document.getElementById("customWaypointDay");
                const defaultName = customWaypointName && customWaypointName.value.trim() ? customWaypointName.value.trim() : "지도 지정 숙소";
                const day = customWaypointDay ? parseInt(customWaypointDay.value, 10) : 1;

                const spotName = prompt(`[Day ${day}] 선택한 지도 좌표에 추가할 숙소 또는 장소 이름을 입력하세요:`, defaultName);
                if (spotName && spotName.trim()) {
                    addCustomWaypointToActivePlan(spotName.trim(), day, { lat: clickedLat, lng: clickedLng });
                    if (customWaypointName) customWaypointName.value = "";
                }

                // 픽업 모드 자동 해제
                isMapPickingMode = false;
                const btnPickOnMap = document.getElementById("btnPickOnMap");
                const mapPickNotice = document.getElementById("mapPickNotice");
                if (btnPickOnMap) {
                    btnPickOnMap.classList.remove("active");
                    btnPickOnMap.innerHTML = "<span>📍 지도에서 위치 찍기</span>";
                }
                if (mapPickNotice) mapPickNotice.style.display = "none";
                if (leafletMap) leafletMap.getContainer().style.cursor = "";
            });
        }

        mapMarkerLayerGroup.clearLayers();
        mapPolylineLayerGroup.clearLayers();

        const days = Array.from(new Set(places.map(p => p.day))).sort((a, b) => a - b);
        const mapDayFilters = document.getElementById("mapDayFilters");
        if (mapDayFilters) {
            let filterHtml = `<button type="button" class="btn-map-filter ${currentMapDayFilter === 'all' ? 'active' : ''}" data-day="all">📍 전체 동선</button>`;
            days.forEach(d => {
                const color = DAY_COLOR_MAP[d] || "#6366f1";
                const isAct = String(currentMapDayFilter) === String(d);
                filterHtml += `
                    <button type="button" class="btn-map-filter filter-day-${Math.min(4, d)} ${isAct ? 'active' : ''}" data-day="${d}">
                        <span class="chip-dot" style="background-color: ${color};"></span>
                        <span>${d}일차 코스</span>
                    </button>
                `;
            });
            mapDayFilters.innerHTML = filterHtml;

            mapDayFilters.querySelectorAll(".btn-map-filter").forEach(btn => {
                btn.addEventListener("click", () => {
                    mapDayFilters.querySelectorAll(".btn-map-filter").forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    currentMapDayFilter = btn.dataset.day;
                    drawMapLayers(places, currentMapDayFilter, plan.dest, plan.transportation);
                    renderSummaryChips(currentMapDayFilter);
                });
            });
        }

        drawMapLayers(places, currentMapDayFilter, plan.dest, plan.transportation);

        // 주요 방문지 가로 스크롤 트랙 렌더링 (일차 필터 연동, 1/2/3/4 순차 정렬, 좌우 넘김 버튼 & 마우스 휠 지원)
        function renderSummaryChips(dayFilter = "all") {
            const summaryEl = document.getElementById("mapPlacesSummary");
            if (!summaryEl) return;

            const DOMESTIC_CITIES = ["제주", "부산", "강릉", "속초", "경주", "여수", "서울"];
            const isDomesticPlan = DOMESTIC_CITIES.some(c => (plan.dest || "").includes(c));
            const isTransit = (plan.transportation || "").includes("대중교통") || (plan.transportation || "").includes("버스") || (plan.transportation || "").includes("지하철");
            const filterLabel = dayFilter === "all" ? "전체 일정" : `${dayFilter}일차`;

            const filteredPlaces = dayFilter === "all"
                ? places
                : places.filter(p => String(p.day) === String(dayFilter));

            // Day 및 방문 순서(order: 1, 2, 3, 4...)대로 정확히 순차 정렬
            const sortedPlaces = filteredPlaces.slice().sort((a, b) => {
                const dayA = Number(a.day) || 1;
                const dayB = Number(b.day) || 1;
                if (dayA !== dayB) return dayA - dayB;
                const orderA = Number(a.order) || 1;
                const orderB = Number(b.order) || 1;
                return orderA - orderB;
            });

            let chipsTrackHtml = "";
            sortedPlaces.forEach(p => {
                const globalIdx = places.indexOf(p);
                const color = DAY_COLOR_MAP[p.day] || "#6366f1";
                const dayClass = `chip-day-${Math.min(4, p.day)}`;
                chipsTrackHtml += `
                    <button type="button" class="map-place-chip ${dayClass}" data-idx="${globalIdx}" title="${p.name} (클릭 시 지도 이동 및 길찾기 안내)">
                        <span class="chip-order-badge" style="background-color: ${color};">${p.order}</span>
                        <span class="chip-label-text"><strong class="chip-day-tag">[Day ${p.day}]</strong> ${p.name}</span>
                    </button>
                `;
            });

            const linkServiceLabel = isDomesticPlan
                ? (isTransit ? '대중교통 길찾기' : '카카오맵 바로가기')
                : (isTransit ? '구글맵 대중교통 길찾기' : '구글 지도(Google Maps) 바로가기');

            summaryEl.innerHTML = `
                <div class="map-places-summary-header">
                    <span class="map-places-title">
                        📍 주요 방문지 클릭 시 ${linkServiceLabel}
                        <strong class="map-places-badge">(${filterLabel} ${sortedPlaces.length}곳)</strong>
                    </span>
                    <span class="map-places-hint">👉 좌우 화살표 또는 스크롤로 이동</span>
                </div>
                <div class="map-places-track-wrapper">
                    <button type="button" class="places-scroll-arrow arrow-left" id="btnPlacesScrollLeft" aria-label="이전 주요 방문지 보기">‹</button>
                    <div class="map-places-scroll-track" id="mapPlacesTrack">
                        ${chipsTrackHtml || '<span style="font-size:12px; color:#94a3b8; padding:6px 0;">해당 일차의 방문지가 없습니다.</span>'}
                    </div>
                    <button type="button" class="places-scroll-arrow arrow-right" id="btnPlacesScrollRight" aria-label="다음 주요 방문지 보기">›</button>
                </div>
            `;

            // 칩 클릭 시 지도 중심 이동 및 마커 팝업 오픈
            summaryEl.querySelectorAll(".map-place-chip").forEach(chip => {
                chip.addEventListener("click", () => {
                    const idx = parseInt(chip.dataset.idx, 10);
                    const targetPlace = places[idx];
                    if (targetPlace && leafletMap) {
                        leafletMap.setView([targetPlace.lat, targetPlace.lng], 14, { animate: true });
                        mapMarkerLayerGroup.eachLayer(layer => {
                            if (layer.getLatLng && Math.abs(layer.getLatLng().lat - targetPlace.lat) < 0.0001 && Math.abs(layer.getLatLng().lng - targetPlace.lng) < 0.0001) {
                                layer.openPopup();
                            }
                        });
                    }
                });
            });

            // 좌우 넘김 버튼 및 마우스 휠 스크롤 인터랙션
            const btnPlacesScrollLeft = summaryEl.querySelector("#btnPlacesScrollLeft");
            const btnPlacesScrollRight = summaryEl.querySelector("#btnPlacesScrollRight");
            const placesTrack = summaryEl.querySelector("#mapPlacesTrack");

            if (btnPlacesScrollLeft && placesTrack) {
                btnPlacesScrollLeft.addEventListener("click", () => {
                    placesTrack.scrollBy({ left: -240, behavior: "smooth" });
                });
            }
            if (btnPlacesScrollRight && placesTrack) {
                btnPlacesScrollRight.addEventListener("click", () => {
                    placesTrack.scrollBy({ left: 240, behavior: "smooth" });
                });
            }
            if (placesTrack) {
                placesTrack.addEventListener("wheel", (e) => {
                    if (e.deltaY !== 0) {
                        e.preventDefault();
                        placesTrack.scrollLeft += e.deltaY;
                    }
                }, { passive: false });
            }
        }

        renderSummaryChips(currentMapDayFilter);


        setTimeout(() => {
            if (leafletMap) leafletMap.invalidateSize();
        }, 250);
    }

    /**
     * AI 플랜에서 가격 & 활동 핵심 지표 추출 (정규식 기반 마크다운 테이블 파싱 및 폴백)
     */
    function extractPlanHighlights(plan) {
        const md = plan.markdown || "";

        let totalCost = plan.budget || "예산 확인 필요";
        let accommodation = plan.accommodation || "숙소 정보 확인 필요";
        let activities = [];
        let food = [];
        let transport = plan.transportation || "대중교통 또는 렌터카";

        // 1) 생성된 분석표(| **항목** | [내용] |) 추출 시도
        const costMatch = md.match(/\|\s*\*\*💰[^*]*\*\*\s*\|\s*([^|\r\n]+)\|/);
        if (costMatch && costMatch[1].trim()) {
            totalCost = costMatch[1].trim();
        }

        const hotelMatch = md.match(/\|\s*\*\*🏨[^*]*\*\*\s*\|\s*([^|\r\n]+)\|/);
        if (hotelMatch && hotelMatch[1].trim()) {
            accommodation = hotelMatch[1].trim();
        }

        const actMatch = md.match(/\|\s*\*\*🎯[^*]*\*\*\s*\|\s*([^|\r\n]+)\|/);
        if (actMatch && actMatch[1].trim()) {
            activities = actMatch[1].trim().split(/[,•\n]/).map(s => s.trim()).filter(Boolean);
        }

        const foodMatch = md.match(/\|\s*\*\*🍽️[^*]*\*\*\s*\|\s*([^|\r\n]+)\|/);
        if (foodMatch && foodMatch[1].trim()) {
            food = foodMatch[1].trim().split(/[,•\n]/).map(s => s.trim()).filter(Boolean);
        }

        const transMatch = md.match(/\|\s*\*\*🚶[^*]*\*\*\s*\|\s*([^|\r\n]+)\|/);
        if (transMatch && transMatch[1].trim()) {
            transport = transMatch[1].trim();
        }

        // 2) 폴백 (마크다운 분석표가 없거나 비어있는 경우)
        if (activities.length === 0 && plan.interests) {
            activities = plan.interests.split(/[,，]/).map(s => s.trim()).filter(Boolean);
        }
        if (activities.length === 0) {
            activities = ["현지 대표 랜드마크 탐방", "자연 & 감성 명소 힐링"];
        }
        if (food.length === 0) {
            food = ["지역 대표 특산 미식", "전망 좋은 카페 방문"];
        }

        return {
            totalCost,
            accommodation,
            activities: activities.slice(0, 4),
            food: food.slice(0, 3),
            transport
        };
    }

    /**
     * 비교 대상에 포함될 모든 계획 (생성된 계획 + 저장된 계획) 조회
     */
    function getAllPlansForComparison() {
        const map = new Map();
        generatedPlans.forEach(p => map.set(p.id, p));
        savedPlans.forEach(sp => {
            if (!map.has(sp.id)) {
                map.set(sp.id, { ...sp, isSaved: true });
            }
        });
        return Array.from(map.values());
    }

    /**
     * 상단 생성 및 저장된 계획 탭 렌더링
     */
    function renderPlanTabs() {
        if (!planTabsScroll) return;
        const allPlans = getAllPlansForComparison();
        if (allPlans.length === 0) {
            if (planTabsBar) planTabsBar.style.display = "none";
            return;
        }
        if (planTabsBar) planTabsBar.style.display = "flex";

        planTabsScroll.innerHTML = allPlans.map((p) => {
            const isActive = p.id === activePlanId && !isCompareMode;
            const isSaved = p.isSaved || savedPlans.some(sp => sp.id === p.id);
            return `
                <button type="button" class="plan-tab-btn ${isActive ? 'active' : ''}" data-id="${p.id}" title="${p.title}">
                    <span>${isSaved ? '📌 ' : ''}${p.shortTitle}</span>
                    <span class="plan-tab-budget">${p.budget || ''}</span>
                </button>
            `;
        }).join("");

        planTabsScroll.querySelectorAll(".plan-tab-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const planId = btn.dataset.id;
                setActivePlan(planId);
            });
        });
    }

    // ==========================================
    // 🗺️ 숙소 및 사용자 경유지 지도 픽업 & 동선 실시간 추가 모듈
    // ==========================================
    let isMapPickingMode = false;
    let currentActivePlanRef = null;

    function setupMapWaypointControls() {
        const btnPickOnMap = document.getElementById("btnPickOnMap");
        const btnAddWaypoint = document.getElementById("btnAddWaypoint");
        const customWaypointName = document.getElementById("customWaypointName");
        const customWaypointDay = document.getElementById("customWaypointDay");
        const mapPickNotice = document.getElementById("mapPickNotice");

        if (btnPickOnMap) {
            btnPickOnMap.onclick = () => {
                isMapPickingMode = !isMapPickingMode;
                if (isMapPickingMode) {
                    btnPickOnMap.classList.add("active");
                    btnPickOnMap.innerHTML = "<span>🛑 지도 클릭 대기 중...</span>";
                    if (mapPickNotice) mapPickNotice.style.display = "block";
                    if (leafletMap) leafletMap.getContainer().style.cursor = "crosshair";
                } else {
                    btnPickOnMap.classList.remove("active");
                    btnPickOnMap.innerHTML = "<span>📍 지도에서 위치 찍기</span>";
                    if (mapPickNotice) mapPickNotice.style.display = "none";
                    if (leafletMap) leafletMap.getContainer().style.cursor = "";
                }
            };
        }

        if (btnAddWaypoint) {
            btnAddWaypoint.onclick = () => {
                const name = customWaypointName ? customWaypointName.value.trim() : "";
                const day = customWaypointDay ? parseInt(customWaypointDay.value, 10) : 1;
                if (!name) {
                    alert("추가할 숙소명 또는 장소명을 입력해 주세요!");
                    if (customWaypointName) customWaypointName.focus();
                    return;
                }
                addCustomWaypointToActivePlan(name, day);
                if (customWaypointName) customWaypointName.value = "";
            };
        }
    }

    function addCustomWaypointToActivePlan(name, day, coords = null) {
        if (!currentActivePlanRef) return;
        const plan = currentActivePlanRef;

        // 1) 마크다운 문서 내 해당 일자의 저녁/숙소 섹션 또는 일자 끝에 항목 추가
        const dayHeaderRegex = new RegExp(`(###\\s*🌟?\\s*\\[?Day\\s*${day}[\\s\\S]*?)(?=###\\s*🌟?\\s*\\[?Day\\s*\\d+|###\\s*🍽️|$)`, "i");
        const match = plan.markdown.match(dayHeaderRegex);

        const newEntry = `\n- 🏨 **[사용자 지정 숙소/경유지]**: **${name}** (동선 경유지로 추가됨 - 확인 필요)\n`;

        if (match) {
            const originalDayBlock = match[1];
            let updatedDayBlock = originalDayBlock;
            if (updatedDayBlock.includes("#### 🏨 [숙소 휴식]")) {
                updatedDayBlock = updatedDayBlock.replace("#### 🏨 [숙소 휴식]", `#### 🏨 [숙소 휴식]${newEntry}`);
            } else {
                updatedDayBlock += newEntry;
            }
            plan.markdown = plan.markdown.replace(originalDayBlock, updatedDayBlock);
        } else {
            plan.markdown += `\n### 🌟 [Day ${day}] 추가 경유지 일정\n${newEntry}`;
        }

        // 2) SPOT_COORDS에 사용자 좌표 저장 (지도 핀 정확도 반영)
        if (coords) {
            SPOT_COORDS[name] = coords;
        }

        // 3) 화면 리렌더링
        setActivePlan(plan.id);
        alert(`✅ [${day}일차] 에 "${name}" 이(가) 숙소/경유지로 성공적으로 추가되었습니다! 동선 지도와 일정표에 즉시 반영됩니다.`);
    }

    /**
     * 🏨 3-2. 맞춤 숙소 예약 포털 링크 & 구글 지도 유명 숙소 렌더러
     */
    const hotelCatalog = {
        jeju: [
            {
                name: "제주 신라 호텔",
                tag: "럭셔리 호캉스",
                tagClass: "luxury",
                rating: "4.8 (리뷰 3,420개)",
                loc: "서귀포시 중문관광로 (중문 해변 도보 5분)",
                features: [
                    "전 객실 최고급 침구 & 프라이빗 발코니",
                    "사계절 야외 온수풀 & 풀사이드 바",
                    "더 파크뷰 조식 뷔페 & 글램핑 카바나"
                ],
                price: "1박 약 38~55만원"
            },
            {
                name: "다인오세아노 호텔",
                tag: "오션뷰 & 인피니티풀",
                tagClass: "healing",
                rating: "4.7 (리뷰 1,890개)",
                loc: "제주시 애월읍 애월해안로 (한담산책로 인접)",
                features: [
                    "사계절 루프탑 인피니티 온수풀 & 일몰 뷰",
                    "전 객실 스파 욕조 & 시원한 바다 파노라마",
                    "1층 카페 & 흑돼지 전문점 도보 3분"
                ],
                price: "1박 약 16~24만원"
            },
            {
                name: "신라스테이 제주",
                tag: "가성비 & 공항 10분",
                tagClass: "value",
                rating: "4.6 (리뷰 4,120개)",
                loc: "제주시 노연로 (제주국제공항 차로 8분)",
                features: [
                    "모던하고 청결한 침실 & 비즈니스 라운지",
                    "공항 및 렌터카 하우스 최적의 접근성",
                    "가성비 높은 뷔페식 조식 & 쾌적한 피트니스"
                ],
                price: "1박 약 9~14만원"
            }
        ],
        osaka: [
            {
                name: "스위소텔 난카이 오사카",
                tag: "난바역 직결 5성급",
                tagClass: "luxury",
                rating: "4.7 (리뷰 5,120개)",
                loc: "오사카 난바역 직결 (간사이 공항 라피트 38분)",
                features: [
                    "난바역 개찰구 엘리베이터 직결 (비 안 맞고 이동)",
                    "36층 최상층 스카이라운지 조식 & 도심 야경",
                    "도톤보리 먹거리 골목 도보 5분"
                ],
                price: "1박 약 22~35만원"
            },
            {
                name: "온야도 노노 난바 내추럴 핫 스프링",
                tag: "천연 온천 & 가성비",
                tagClass: "healing",
                rating: "4.8 (리뷰 3,890개)",
                loc: "오사카 닛폰바시역 도보 1분 (도톤보리 3분)",
                features: [
                    "전통 다다미 바닥 & 천연 온천 대욕장 사우나",
                    "매일 밤 투숙객 무료 야식 라멘(요나키소바) 제공",
                    "구로몬 시장 및 도톤보리 도보 3분 최강 입지"
                ],
                price: "1박 약 15~22만원"
            },
            {
                name: "호텔 한큐 레스파이어 오사카",
                tag: "우메다 쇼핑 최적",
                tagClass: "value",
                rating: "4.6 (리뷰 4,500개)",
                loc: "오사카 우메다 요도바시 타워 (오사카역 도보 3분)",
                features: [
                    "지하철/JR/한큐선 3개 노선 교차 최강 교통",
                    "대형 쇼핑몰 링크스 우메다 상층부 위치",
                    "쾌적한 신축 룸 컨디션 & 9층 일본식 정원"
                ],
                price: "1박 약 18~28만원"
            }
        ],
        tokyo: [
            {
                name: "시부야 스트림 엑셀 호텔 도큐",
                tag: "시부야역 직결",
                tagClass: "luxury",
                rating: "4.7 (리뷰 2,650개)",
                loc: "도쿄 시부야 스트림 빌딩 (시부야역 지하 연결)",
                features: [
                    "시부야 스크램블 교차로 및 쇼핑가 도보 3분",
                    "감각적인 빈티지 모던 인테리어 & 도심 야경",
                    "건물 내 인기 미식 핫플 & 블루보틀 커피"
                ],
                price: "1박 약 26~40만원"
            },
            {
                name: "온센 료칸 유엔 신주쿠",
                tag: "도심 속 노천 온천",
                tagClass: "healing",
                rating: "4.8 (리뷰 3,200개)",
                loc: "도쿄 신주쿠구 신주쿠역 도보 10분",
                features: [
                    "하코네에서 매일 공수해오는 최상층 천연 노천탕",
                    "도심 속 고즈넉한 전통 일본 료칸 분위기",
                    "신주쿠 스카이라인이 내려다보이는 파노라마 뷰"
                ],
                price: "1박 약 19~28만원"
            },
            {
                name: "호텔 그레이서리 신주쿠",
                tag: "가부키초 랜드마크",
                tagClass: "value",
                rating: "4.6 (리뷰 6,800개)",
                loc: "신주쿠역 동쪽 출구 도보 5분 (고질라 로드)",
                features: [
                    "신주쿠 상징 거대 고질라 헤드 테라스 보유",
                    "주변 맛집/이자카야/돈키호테 도보 1분",
                    "독립된 욕실 & 쾌적한 방음 시설"
                ],
                price: "1박 약 14~22만원"
            }
        ],
        fukuoka: [
            {
                name: "미야코 호텔 하카타",
                tag: "하카타역 직결 & 루프탑",
                tagClass: "luxury",
                rating: "4.8 (리뷰 3,100개)",
                loc: "후쿠오카 하카타역 동쪽 출구 지하 직결",
                features: [
                    "하카타역 지하 통로 연결 (비 안 맞고 이동)",
                    "최상층 야외 온천 수영장 & 온천 자쿠지 스파",
                    "전 객실 30㎡ 이상 넓고 쾌적한 룸 스케일"
                ],
                price: "1박 약 24~36만원"
            },
            {
                name: "도미인 프리미엄 하카타 캐널시티마에",
                tag: "천연 온천 & 캐널시티",
                tagClass: "healing",
                rating: "4.7 (리뷰 4,200개)",
                loc: "캐널시티 하카타 바로 맞은편 (도보 1분)",
                features: [
                    "천연 온천 대욕장 & 건식 사우나 완비",
                    "저녁 무료 소바 & 온천 후 무료 아이스크림/요구르트",
                    "하카타역 및 나카스 포장마차 도보 이동 가능"
                ],
                price: "1박 약 12~18만원"
            },
            {
                name: "유후인 바이엔 (온천 료칸)",
                tag: "유후인 힐링 료칸",
                tagClass: "luxury",
                rating: "4.9 (리뷰 1,450개)",
                loc: "오이타현 유후인 유후다케 전망",
                features: [
                    "만 평 규모의 사계절 일본 정원 & 프라이빗 노천탕",
                    "정갈하고 화려한 제철 가이세키 코스 요리 석식",
                    "유후인역 무료 송영 셔틀버스 제공"
                ],
                price: "1박 약 35~55만원 (조/석식 포함)"
            }
        ],
        bangkok: [
            {
                name: "아난타라 리버사이드 방콕 리조트",
                tag: "도심 속 휴양 리조트",
                tagClass: "healing",
                rating: "4.8 (리뷰 5,800개)",
                loc: "방콕 짜오프라야 강변 (사톤 피어 무료 셔틀보트)",
                features: [
                    "열대 야자수 정원 & 방콕 최대 규모 야외 수영장",
                    "강바람을 맞으며 즐기는 리버뷰 테라스 조식",
                    "아이콘시암 및 아시아티크 무료 셔틀보트 운항"
                ],
                price: "1박 약 18~28만원"
            },
            {
                name: "이스틴 그랜드 호텔 사톤",
                tag: "인피니티 풀 & 역 직결",
                tagClass: "value",
                rating: "4.8 (리뷰 7,200개)",
                loc: "BTS 수라삭역 전용 스카이브릿지 직결",
                features: [
                    "방콕 도심이 한눈에 보이는 14층 인피니티 풀",
                    "지상철역 다리 직결로 트래픽 잼 없는 최강 이동",
                    "가성비와 퀄리티를 모두 잡은 글래스하우스 조식"
                ],
                price: "1박 약 14~20만원"
            },
            {
                name: "칼튼 호텔 방콕 수쿰빗",
                tag: "신축 5성급 럭셔리",
                tagClass: "luxury",
                rating: "4.7 (리뷰 3,400개)",
                loc: "아속역 & 프롬퐁역 사이 (도보 5분)",
                features: [
                    "싱가포르 칼튼 그룹 5성급 럭셔리 침구",
                    "34층 쿨링보 루프탑 바 & 탁 트인 도심 전망",
                    "미슐랭 플레이트 중식당 왁유크보우 보유"
                ],
                price: "1박 약 20~30만원"
            }
        ],
        busan: [
            {
                name: "시그니엘 부산",
                tag: "해운대 럭셔리 호캉스",
                tagClass: "luxury",
                rating: "4.8 (리뷰 3,600개)",
                loc: "부산 해운대 엘시티 타워 (해운대 해변 1열)",
                features: [
                    "전 객실 발코니에서 바라보는 해운대 바다 파노라마",
                    "사계절 야외 인피니티 온수풀 & 투숙객 전용 라운지 무료",
                    "미슐랭 3스타 셰프 감수의 최고급 다이닝"
                ],
                price: "1박 약 38~58만원"
            },
            {
                name: "아난티 앳 부산 코브",
                tag: "기장 오션뷰 힐링",
                tagClass: "healing",
                rating: "4.7 (리뷰 4,100개)",
                loc: "부산 기장군 기장해안로 (오시리아 관광단지)",
                features: [
                    "압도적인 바다 절경의 인피니티 풀 & 워터하우스 온천",
                    "해안 산책로와 아난티 타운 서점/카페 라이프스타일",
                    "전 객실 오션뷰 프라이빗 발코니 테라스"
                ],
                price: "1박 약 30~48만원"
            },
            {
                name: "호텔 포레 더 스파 부산",
                tag: "히노끼 스파 & 가성비",
                tagClass: "value",
                rating: "4.6 (리뷰 2,100개)",
                loc: "부산 초량역 도보 3분 (부산역 1정거장)",
                features: [
                    "객실 내 프라이빗 편백나무(히노끼) 스파 욕조 완비",
                    "KTX 부산역 접근성 우수 & 조용한 주택가",
                    "편안한 힐링 테라피 & 합리적인 숙박 요금"
                ],
                price: "1박 약 8~13만원"
            }
        ],
        gangneung: [
            {
                name: "스카이베이 호텔 경포",
                tag: "경포 인피니티 풀",
                tagClass: "healing",
                rating: "4.6 (리뷰 5,800개)",
                loc: "강릉 경포로 (경포해변과 경포호수 사이)",
                features: [
                    "지상 20층 최상층 루프탑 인피니티 온수풀",
                    "동해 바다와 경포호수를 동시에 즐기는 더블 뷰",
                    "경포 해변 모래사장 도보 1분 직결"
                ],
                price: "1박 약 13~24만원"
            },
            {
                name: "씨마크 호텔",
                tag: "최고급 5성급 럭셔리",
                tagClass: "luxury",
                rating: "4.8 (리뷰 2,400개)",
                loc: "강릉 강문동 (경포대 해변 언덕 위)",
                features: [
                    "세계적 건축가 리처드 마이어 설계 백색의 미학",
                    "바다와 맞닿은 야외 인피니티 온수풀 클럽 인피니티",
                    "최고급 올데이 다이닝 & 친환경 어메니티"
                ],
                price: "1박 약 45~65만원"
            },
            {
                name: "세인트존스 호텔",
                tag: "강문해변 앞 복합 리조트",
                tagClass: "value",
                rating: "4.5 (리뷰 7,900개)",
                loc: "강릉 창해로 (강문해변 & 해송 숲 앞)",
                features: [
                    "피톤치드 해송 숲길과 동해안 바다 도보 산책",
                    "파인풀 & 오션풀 2개의 대형 인피니티 풀",
                    "반려견 동반 펫 룸 및 다양한 엔터테인먼트 시설"
                ],
                price: "1박 약 11~19만원"
            }
        ],
        gyeongju: [
            {
                name: "라한셀렉트 경주",
                tag: "보문호수 뷰 호캉스",
                tagClass: "healing",
                rating: "4.7 (리뷰 4,600개)",
                loc: "경주시 보문로 (보문호수 바로 앞)",
                features: [
                    "보문호수 전망 프라이빗 발코니 & 산책로 직결",
                    "실내외 수영장, 북스토어 & 키즈 플레이그라운드",
                    "경주 주요 역사 유적 지구 차로 10~15분"
                ],
                price: "1박 약 16~26만원"
            },
            {
                name: "힐튼 경주",
                tag: "5성급 패밀리 리조트",
                tagClass: "luxury",
                rating: "4.7 (리뷰 3,800개)",
                loc: "경주시 보문로 (우양미술관 인접)",
                features: [
                    "유라시아 실내외 수영장 & 스쿼시/사우나",
                    "신라 천년의 고도 품격이 깃든 조경 및 객실",
                    "황리단길 & 첨성대 차로 12분"
                ],
                price: "1박 약 20~32만원"
            },
            {
                name: "황리단길 감성 한옥 스테이",
                tag: "전통 한옥 독채",
                tagClass: "value",
                rating: "4.9 (리뷰 1,100개)",
                loc: "경주 포석로 (황리단길 중심가 도보 2분)",
                features: [
                    "고즈넉한 서까래와 안마당 자쿠지 노천스파",
                    "황리단길 감성 카페 및 로컬 맛집 도보 2분",
                    "정갈한 다도 세트 및 아침 조식 바구니"
                ],
                price: "1박 약 15~25만원"
            }
        ],
        guam: [
            {
                name: "두짓타니 괌 리조트",
                tag: "투몬비치 럭셔리 5성급",
                tagClass: "luxury",
                rating: "4.8 (리뷰 4,200개)",
                loc: "괌 투몬 베이 중심가 (쇼핑 & 해변 직결)",
                features: [
                    "에메랄드빛 투몬 비치 파노라마 오션프론트 뷰",
                    "야외 인피니티 풀 & 풀사이드 카바나 & 럭셔리 스파",
                    "더 플라자 쇼핑몰 & T갤러리아 실내 연결"
                ],
                price: "1박 약 38~55만원"
            },
            {
                name: "호텔 닛코 괌",
                tag: "건비치 오션뷰 & 워터슬라이드",
                tagClass: "healing",
                rating: "4.7 (리뷰 3,600개)",
                loc: "괌 건비치 앞 (사랑의 절벽 인접)",
                features: [
                    "전 객실 환상적인 건비치 에메랄드 오션뷰 발코니",
                    "72m 괌 최장 야외 워터슬라이드 & 스노클링 포인트",
                    "선셋 바비큐 & 크리스탈 채플 전망"
                ],
                price: "1박 약 22~32만원"
            },
            {
                name: "PIC 괌 (퍼시픽 아일랜드 클럽)",
                tag: "올인클루시브 & 워터파크",
                tagClass: "value",
                rating: "4.6 (리뷰 5,100개)",
                loc: "괌 투몬 만 (이파오 비치 인접)",
                features: [
                    "70여 가지 액티비티를 즐기는 초대형 워터파크",
                    "가족 & 키즈 전용 클럽메이트 케어 프로그램",
                    "무제한 스노클링, 윈드서핑, 양궁 레슨 포함"
                ],
                price: "1박 약 26~38만원"
            }
        ],
        danang: [
            {
                name: "인터컨티넨탈 다낭 선 페닌슐라 리조트",
                tag: "세계 최고 럭셔리",
                tagClass: "luxury",
                rating: "4.9 (리뷰 3,100개)",
                loc: "다낭 손트라 반도 (프라이빗 베이)",
                features: [
                    "빌 벤슬리 디자인 몽환적인 자연 절경 속 리조트",
                    "프라이빗 비치 & 롱풀 인피니티 수영장",
                    "미슐랭 3스타 셰프 레스토랑 라 메종 1888"
                ],
                price: "1박 약 55~85만원"
            },
            {
                name: "TMS 호텔 다낭 비치",
                tag: "미케비치 1열 가성비",
                tagClass: "value",
                rating: "4.7 (리뷰 4,800개)",
                loc: "다낭 미케비치 바로 앞",
                features: [
                    "25층 최상층 탁 트인 미케비치 파노라마 루프탑 풀",
                    "길 건너면 바로 백사장 직결 최강 입지",
                    "쾌적한 오션뷰 스위트 & 무료 애프터눈 티"
                ],
                price: "1박 약 8~14만원"
            }
        ]
    };

    function getHotelsForDestination(dest) {
        const d = (dest || "").toLowerCase();
        if (d.includes("괌")) return hotelCatalog.guam;
        if (d.includes("다낭")) return hotelCatalog.danang;
        if (d.includes("제주")) return hotelCatalog.jeju;
        if (d.includes("오사카")) return hotelCatalog.osaka;
        if (d.includes("도쿄")) return hotelCatalog.tokyo;
        if (d.includes("후쿠오카") || d.includes("유후인")) return hotelCatalog.fukuoka;
        if (d.includes("방콕")) return hotelCatalog.bangkok;
        if (d.includes("부산")) return hotelCatalog.busan;
        if (d.includes("강릉") || d.includes("속초")) return hotelCatalog.gangneung;
        if (d.includes("경주")) return hotelCatalog.gyeongju;

        const cleanDest = dest.replace(/[0-9&·\-_/]/g, "").trim() || "여행지";
        return [
            {
                name: `${cleanDest} 센트럴 파크 호텔 & 스위트`,
                tag: "시내 중심 & 랜드마크 뷰",
                tagClass: "luxury",
                rating: "4.8 (리뷰 2,150개)",
                loc: `${cleanDest} 중심가 (주요 관광지 & 역세권)`,
                features: [
                    "파노라마 랜드마크 전망 객실 & 최고급 침구",
                    "정갈한 조식 뷔페 & 피트니스/비즈니스 센터",
                    "주변 맛집과 대중교통 도보 3분 이내"
                ],
                price: "1박 약 18~28만원"
            },
            {
                name: `${cleanDest} 감성 부티크 스테이`,
                tag: "프라이빗 힐링 & 독채",
                tagClass: "healing",
                rating: "4.9 (리뷰 980개)",
                loc: `${cleanDest} 감성 힐링 스팟 인근`,
                features: [
                    "프라이빗 테라스 & 독립된 스파 욕조",
                    "현지 감성이 가득한 모던 인테리어 & 웰컴 티",
                    "한적한 휴식과 인생샷을 위한 최적의 공간"
                ],
                price: "1박 약 16~25만원"
            },
            {
                name: `${cleanDest} 프리미엄 비즈니스 호텔`,
                tag: "가성비 최고 & 교통 요충지",
                tagClass: "value",
                rating: "4.7 (리뷰 3,420개)",
                loc: `${cleanDest} 교통 거점 도보 5분`,
                features: [
                    "합리적인 가격의 청결하고 쾌적한 룸 컨디션",
                    "빠른 체크인/체크아웃 & 무료 고속 Wi-Fi",
                    "편의점 및 로컬 식당 인접 가성비 1등"
                ],
                price: "1박 약 8~14만원"
            }
        ];
    }

    function renderAccommodationBookingSection(plan) {
        if (!accommodationBookingSection) return;

        const dest = plan?.dest || destinationInput?.value.trim() || "제주도";
        const startDate = plan?.startDate || startDateInput?.value || "";
        const endDate = plan?.endDate || endDateInput?.value || "";
        const dateRangeStr = startDate && endDate ? `${startDate} ~ ${endDate}` : (plan?.dur || "2박 3일");

        // 1. 헤더 안내 텍스트 갱신
        if (bookingDestName) bookingDestName.textContent = dest;
        if (bookingDateSpan) bookingDateSpan.textContent = dateRangeStr;
        if (bookingDateBadge) bookingDateBadge.textContent = `📅 ${dateRangeStr} 자동 연동`;

        const DOMESTIC_CITIES = ["제주", "부산", "강릉", "속초", "경주", "여수", "서울"];
        const isDomesticDest = DOMESTIC_CITIES.some(c => dest.includes(c));

        // 2. 국내는 여기어때, 해외는 아고다/글로벌 호텔 예약 링크 자동 적용
        let primaryPortalUrl = "";
        let primaryPortalName = isDomesticDest ? "여기어때로 예약하기" : "아고다(Agoda)로 예약하기";
        let primaryBtnClass = isDomesticDest ? "btn-yeogi-link" : "btn-agoda-link";
        let primaryBtnText = isDomesticDest ? "🏨 여기어때 확인" : "🏨 아고다 확인";

        if (isDomesticDest) {
            if (startDate && endDate) {
                primaryPortalUrl = `https://www.yeogi.com/domestic-accommodations?keyword=${encodeURIComponent(dest)}&checkIn=${startDate}&checkOut=${endDate}`;
            } else {
                primaryPortalUrl = `https://www.yeogi.com/search?keyword=${encodeURIComponent(dest)}`;
            }
        } else {
            // 해외: 아고다 글로벌 예약 검색
            primaryPortalUrl = `https://www.agoda.com/ko-kr/search?city=${encodeURIComponent(dest)}`;
        }

        if (linkYeogiPortal) {
            linkYeogiPortal.href = primaryPortalUrl;
            const strongEl = linkYeogiPortal.querySelector("strong");
            if (strongEl) strongEl.textContent = primaryPortalName;
            const subEl = document.getElementById("subYeogi");
            if (subEl) subEl.textContent = `${dest} · ${dateRangeStr} ${isDomesticDest ? '최저가' : '글로벌 특가'}`;
        }

        // 3. 에어비앤비 링크 (유저가 제공한 기본 추적 파라미터 + dest, checkin, checkout 자동 삽입)
        let airbnbUrl = `https://www.airbnb.co.kr/s/${encodeURIComponent(dest)}/homes?`;
        const airbnbParams = [];
        if (startDate) airbnbParams.push(`checkin=${startDate}`);
        if (endDate) airbnbParams.push(`checkout=${endDate}`);
        airbnbParams.push("c=.pi0.pk23067405305_191699516049&gad_source=1&gad_campaignid=23067405305");
        airbnbUrl += airbnbParams.join("&");

        if (linkAirbnbPortal) {
            linkAirbnbPortal.href = airbnbUrl;
            const subEl = document.getElementById("subAirbnb");
            if (subEl) subEl.textContent = `${dest} 감성 숙소 · ${dateRangeStr}`;
        }

        // 4. 구글 지도 링크 (지역 및 숙소 검색어 자동 연동)
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest + ' 숙소 호텔')}`;
        if (linkGoogleMapsPortal) {
            linkGoogleMapsPortal.href = googleMapsUrl;
            const subEl = document.getElementById("subGoogle");
            if (subEl) subEl.textContent = `${dest} 실시간 평점 & 리뷰`;
        }

        // 5. 구글 지도 기반 유명 숙소 카드 목록 렌더링
        if (famousHotelsGrid) {
            const hotels = getHotelsForDestination(dest);
            famousHotelsGrid.innerHTML = hotels.map(hotel => {
                const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + ' ' + dest)}`;
                const hotelPrimaryUrl = isDomesticDest
                    ? (startDate && endDate
                        ? `https://www.yeogi.com/domestic-accommodations?keyword=${encodeURIComponent(hotel.name)}&checkIn=${startDate}&checkOut=${endDate}`
                        : `https://www.yeogi.com/search?keyword=${encodeURIComponent(hotel.name)}`)
                    : `https://www.agoda.com/ko-kr/search?keyword=${encodeURIComponent(hotel.name + ' ' + dest)}`;
                const airbnbHotelUrl = `https://www.airbnb.co.kr/s/${encodeURIComponent(dest + ' ' + hotel.name)}/homes?${startDate ? `checkin=${startDate}&` : ''}${endDate ? `checkout=${endDate}&` : ''}c=.pi0.pk23067405305_191699516049`;

                return `
                    <div class="hotel-card">
                        <div>
                            <div class="hotel-card-tag-row">
                                <span class="hotel-tag ${hotel.tagClass}">${hotel.tag}</span>
                                <span class="hotel-rating">⭐ ${hotel.rating}</span>
                            </div>
                            <h5 class="hotel-name">${hotel.name}</h5>
                            <p class="hotel-loc">📍 ${hotel.loc}</p>
                            <ul class="hotel-features">
                                ${hotel.features.map(f => `<li class="hotel-feature-item">${f}</li>`).join('')}
                            </ul>
                        </div>
                        <div>
                            <div class="hotel-price-row">
                                <span class="hotel-price-lbl">예상 1박 요금</span>
                                <strong class="hotel-price-val">${hotel.price}</strong>
                            </div>
                            <div class="hotel-btn-group">
                                <a href="${mapSearchUrl}" target="_blank" rel="noopener noreferrer" class="btn-hotel-link btn-map-link" title="구글 지도에서 위치, 평점, 사진, 사용자 후기 확인">
                                    🗺️ 구글 지도에서 위치·실시간 후기 보기
                                </a>
                                <a href="${hotelPrimaryUrl}" target="_blank" rel="noopener noreferrer" class="btn-hotel-link ${primaryBtnClass}" title="${primaryBtnText}">
                                    ${primaryBtnText}
                                </a>
                                <a href="${airbnbHotelUrl}" target="_blank" rel="noopener noreferrer" class="btn-hotel-link btn-airbnb-link" title="에어비앤비에서 숙소 확인">
                                    🏡 에어비앤비 확인
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            }).join("");
        }

        accommodationBookingSection.style.display = "block";
    }

    /**
     * 일자별(Day 1, 2, 3) 및 시간대별(오전/점심/오후/저녁/숙소) 일정 카드 시각적 가독성 강화 + 추가/삭제 버튼
     */
     function enhanceDailyPlanLayout(container) {
         if (!container) return;

         // 1) H3 태그 중 Day 1, Day 2, Day 3... 또는 1일차, 2일차 감지하여 카드 헤더 스타일 적용
         container.querySelectorAll("h3").forEach((h3) => {
             const txt = h3.textContent || "";
             const m = txt.match(/Day\s*(\d+)|(\d+)일차/i);
             if (m) {
                 const dayNum = parseInt(m[1] || m[2], 10);
                 const colorIndex = Math.min(4, Math.max(1, dayNum));
                 h3.classList.add("day-card-header", `day-header-${colorIndex}`);
             }
         });

         // 2) H4 태그 중 시간대(오전, 점심, 오후, 저녁, 숙소) 감지하여 시간 블록 스타일 적용 및 시간대별 빠른 추가 버튼
         container.querySelectorAll("h4").forEach((h4) => {
             const txt = h4.textContent || "";
             let slotType = "";
             if (txt.includes("오전") || txt.includes("🌅")) {
                 h4.classList.add("time-morning");
                 slotType = "오전 일정";
             } else if (txt.includes("점심") || txt.includes("🍴")) {
                 h4.classList.add("time-lunch");
                 slotType = "점심 맛집";
             } else if (txt.includes("오후") || txt.includes("🎯")) {
                 h4.classList.add("time-afternoon");
                 slotType = "오후 명소";
             } else if (txt.includes("저녁") || txt.includes("야경") || txt.includes("🌙")) {
                 h4.classList.add("time-dinner");
                 slotType = "저녁 & 야경";
             } else if (txt.includes("숙소") || txt.includes("휴식") || txt.includes("🏨")) {
                 h4.classList.add("time-hotel");
                 slotType = "숙소/호텔";
             }

             // 시간대 헤더 우측에 [+ 이 시간대 계획 추가] 버튼 부착
             if (slotType && !h4.querySelector(".btn-slot-quick-add")) {
                 const addBtn = document.createElement("button");
                 addBtn.type = "button";
                 addBtn.className = "btn-slot-quick-add";
                 addBtn.innerHTML = `<span>➕ ${slotType} 추가</span>`;
                 addBtn.onclick = (e) => {
                     e.stopPropagation();
                     const newSpot = prompt(`[${slotType}]에 추가할 장소나 활동을 입력하세요:`, "");
                     if (newSpot && newSpot.trim()) {
                         const parentList = h4.nextElementSibling;
                         if (parentList && parentList.tagName === "UL") {
                             const newLi = document.createElement("li");
                             newLi.innerHTML = `📍 **방문 코스**: <strong>${newSpot.trim()}</strong> (사용자 직접 추가)`;
                             parentList.appendChild(newLi);
                             setupItemRowActions(newLi);
                         } else {
                             const newUl = document.createElement("ul");
                             const newLi = document.createElement("li");
                             newLi.innerHTML = `📍 **방문 코스**: <strong>${newSpot.trim()}</strong> (사용자 직접 추가)`;
                             newUl.appendChild(newLi);
                             h4.parentNode.insertBefore(newUl, h4.nextSibling);
                             setupItemRowActions(newLi);
                         }

                         // 동선 지도에도 즉시 추가 반영
                         if (currentActivePlanRef) {
                             currentActivePlanRef.markdown += `\n- 📍 **추가 코스**: **${newSpot.trim()}**\n`;
                             renderPlanMapForPlan(currentActivePlanRef);
                         }
                     }
                 };
                 h4.appendChild(addBtn);
             }
         });

         // 3) 일정표 내 세부 불릿 리스트(li)에 수정/삭제/추가 액션 툴바 부착
         container.querySelectorAll("ul > li").forEach((li) => {
             setupItemRowActions(li);
         });

         // 4) 마크다운 표(Table) 가로 스크롤 래퍼 자동 부착 (화면 우측 잘림 방지)
         container.querySelectorAll("table").forEach((tbl) => {
             if (!tbl.parentElement.classList.contains("table-responsive-wrapper")) {
                 const wrap = document.createElement("div");
                 wrap.className = "table-responsive-wrapper";
                 tbl.parentNode.insertBefore(wrap, tbl);
                 wrap.appendChild(tbl);
             }
         });
     }

     function setupItemRowActions(li) {
         if (!li || li.querySelector(".plan-item-actions")) return;
         if (li.querySelector(":scope > ul, :scope > ol")) return;

         li.classList.add("plan-item-row");

         // 1) 기존 내용물 전체를 하나의 content 래퍼로 안전하게 묶어 글자가 우측으로 밀리는 현상 원천 방지
         const contentWrap = document.createElement("span");
         contentWrap.className = "plan-item-content";
         while (li.firstChild) {
             contentWrap.appendChild(li.firstChild);
         }
         li.appendChild(contentWrap);

         const actionsWrap = document.createElement("span");
         actionsWrap.className = "plan-item-actions";

         // ➕ 바로 아래 항목 추가 버튼
         const btnAdd = document.createElement("button");
         btnAdd.type = "button";
         btnAdd.className = "btn-item-action btn-item-add";
         btnAdd.title = "이 일정 바로 아래에 새 방문지 추가";
         btnAdd.textContent = "➕ 추가";
         btnAdd.onclick = (e) => {
             e.stopPropagation();
             const newName = prompt("추가할 장소나 계획 내용을 입력하세요:", "");
             if (newName && newName.trim()) {
                 const newLi = document.createElement("li");
                 newLi.innerHTML = `📍 <strong>추가 방문지</strong>: ${newName.trim()} (사용자 추가)`;
                 li.parentNode.insertBefore(newLi, li.nextSibling);
                 setupItemRowActions(newLi);

                 if (currentActivePlanRef) {
                     currentActivePlanRef.markdown += `\n- 📍 **추가 방문지**: **${newName.trim()}**\n`;
                     renderPlanMapForPlan(currentActivePlanRef);
                 }
             }
         };

         // 🗑️ 항목 삭제 버튼
         const btnDel = document.createElement("button");
         btnDel.type = "button";
         btnDel.className = "btn-item-action btn-item-delete";
         btnDel.title = "이 일정 항목 삭제하기";
         btnDel.textContent = "🗑️ 삭제";
         btnDel.onclick = (e) => {
             e.stopPropagation();
             const removedText = contentWrap.textContent || li.textContent;
             if (confirm(`"${removedText.slice(0, 30)}..." 일정을 삭제하시겠습니까?`)) {
                 li.remove();

                 // 마크다운에서 해당 장소명 지우고 지도 갱신
                 if (currentActivePlanRef) {
                     const tokens = removedText.split(/[:\n]/);
                     const spotWord = (tokens[1] || tokens[0] || "").trim().slice(0, 8);
                     if (spotWord) {
                         currentActivePlanRef.markdown = currentActivePlanRef.markdown.split('\n').filter(line => !line.includes(spotWord)).join('\n');
                         renderPlanMapForPlan(currentActivePlanRef);
                     }
                 }
             }
         };

         actionsWrap.appendChild(btnAdd);
         actionsWrap.appendChild(btnDel);
         li.appendChild(actionsWrap);
     }

    /**
     * 특정 플랜을 활성화하여 상세 보기 렌더링
     */
    function setActivePlan(id) {
        const allPlans = getAllPlansForComparison();
        const plan = allPlans.find((p) => p.id === id);
        if (!plan) return;

        activePlanId = id;
        currentActivePlanRef = plan;
        isCompareMode = false;
        currentPlanMarkdown = plan.markdown;

        if (resultHeaderTitle) {
            resultHeaderTitle.textContent = `${plan.dest} ${plan.dur} 맞춤 여행 일정표`;
        }
        if (resultMeta) {
            const isSaved = plan.isSaved || savedPlans.some(sp => sp.id === plan.id);
            resultMeta.textContent = `⚡ AI 엔진: ${plan.model} · 소요 시간: ${plan.elapsed}초 · 생성 시각: ${plan.createdAt} ${isSaved ? '· 📌 보관함 저장됨' : ''}`;
        }

        if (window.marked && planOutput) {
            planOutput.innerHTML = window.marked.parse(plan.markdown);
            enhanceDailyPlanLayout(planOutput);
        } else if (planOutput) {
            planOutput.textContent = plan.markdown;
        }

        // 3-1. 스마트 인터랙티브 여행 동선 지도 & 카카오맵 연동 렌더링
        renderPlanMapForPlan(plan);
        setupMapWaypointControls();

        // 3-2. 맞춤 숙소 예약 포털 & 구글 지도 추천 숙소 렌더링
        renderAccommodationBookingSection(plan);

        if (planCompareDashboard) planCompareDashboard.style.display = "none";
        if (planDetailView) planDetailView.style.display = "block";

        if (btnToggleCompare) {
            btnToggleCompare.classList.remove("active-mode");
            btnToggleCompare.innerHTML = '<span class="compare-icon">⚖️</span><span class="compare-btn-text">가격 &amp; 활동 비교 모드</span>';
        }

        if (btnSaveCurrentPlan) {
            const isSaved = plan.isSaved || savedPlans.some(sp => sp.id === plan.id || sp.title === plan.title && sp.dest === plan.dest && sp.dur === plan.dur);
            if (isSaved) {
                btnSaveCurrentPlan.innerHTML = '<span class="action-icon">✅</span> 저장된 계획 (비교 가능)';
                btnSaveCurrentPlan.classList.add("saved-active");
            } else {
                btnSaveCurrentPlan.innerHTML = '<span class="action-icon">📌</span> 이 계획 저장하기';
                btnSaveCurrentPlan.classList.remove("saved-active");
            }
        }

        renderPlanTabs();
    }

    /**
     * 비교 모드 토글 (단일 일정표 ↔ 가격 & 활동 비교 모드)
     */
    function toggleCompareMode(forceState) {
        if (forceState !== undefined) {
            isCompareMode = forceState;
        } else {
            isCompareMode = !isCompareMode;
        }

        if (isCompareMode) {
            if (planDetailView) planDetailView.style.display = "none";
            if (planCompareDashboard) planCompareDashboard.style.display = "block";
            if (btnToggleCompare) {
                btnToggleCompare.classList.add("active-mode");
                btnToggleCompare.innerHTML = '<span class="compare-icon">📄</span><span class="compare-btn-text">단일 일정표 보기</span>';
            }
            renderComparisonView();
            planCompareDashboard.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            const allPlans = getAllPlansForComparison();
            if (activePlanId) {
                setActivePlan(activePlanId);
            } else if (allPlans.length > 0) {
                setActivePlan(allPlans[allPlans.length - 1].id);
            }
        }
        renderPlanTabs();
    }

    /**
     * 예산 초과(오버) 여부 및 정확한 초과 금액(만원) 정밀 분석 헬퍼
     */
    function getOverbudgetInfo(plan, userBudgetWon, hl) {
        const md = plan.markdown || "";
        const planWon = parseTotalBudgetWon(hl?.totalCost || plan.budget || "");

        // 1) AI가 본문 텍스트에 직접 명시한 초과 금액 추출
        // 예: "약 30만원 초과", "약 25만원 오버", "15만원 초과(오버)", "약 20만원 오버됩니다"
        let detectedMan = 0;
        const match1 = md.match(/(?:약\s*)?(\d+)\s*만\s*원?\s*(?:초과|오버|추가\s*지출)/i);
        const match2 = md.match(/초과(?:된\s*금액|액|분)?\s*[:：]?\s*(?:약\s*)?(\d+)\s*만/i);
        const match3 = md.match(/예산\s*(?:보다|대비)?\s*(?:약\s*)?(\d+)\s*만\s*원?\s*(?:더\s*소요|초과|오버)/i);

        if (match1 && match1[1]) {
            detectedMan = parseInt(match1[1], 10);
        } else if (match2 && match2[1]) {
            detectedMan = parseInt(match2[1], 10);
        } else if (match3 && match3[1]) {
            detectedMan = parseInt(match3[1], 10);
        }

        // 2) 플랜 금액과 사용자 설정 예산의 계산 차이
        const calcDiffWon = planWon - userBudgetWon;
        const calcDiffMan = Math.round(calcDiffWon / 10000);

        // 3) 초과 금액 결정
        let diffMan = 0;
        if (detectedMan > 0) {
            diffMan = detectedMan;
        } else if (calcDiffMan > 0) {
            diffMan = calcDiffMan;
        }

        // 4) 초과 여부 판별 (키워드 또는 3% 초과)
        const hasOverKeyword = md.includes("예산 초과") || md.includes("초과(오버)") || md.includes("예산 오버");
        const isOver = diffMan > 0 || (planWon > userBudgetWon * 1.03) || hasOverKeyword;

        // 초과인데 diffMan이 0이면 계산값 또는 15만원 기본값으로 보정하여 '약 초과' 같은 빈 문구 방지
        if (isOver && diffMan <= 0) {
            diffMan = calcDiffMan > 0 ? calcDiffMan : 15;
        }

        return {
            isOver,
            diffMan,
            cardBadgeText: isOver ? `⚠️ 예산 ${diffMan}만원 초과` : `✅ 예산 내 적정`,
            tableBadgeText: isOver ? `⚠️ ${diffMan}만원 초과` : `✅ 예산 범위 내`,
            analysisText: isOver ? `⚠️ 설정 예산 대비 약 ${diffMan}만원 초과` : `✅ 안정적 (설정 예산 내 완벽 소화)`
        };
    }

    /**
     * 1:1 비교 카드 렌더링 헬퍼 (예산 초과 분석 포함)
     */
    function renderSingleCompareCard(plan, badgeLetter, badgeClass, label) {
        const hl = extractPlanHighlights(plan);
        const isSaved = plan.isSaved || savedPlans.some(sp => sp.id === plan.id);

        const userBudgetWon = parseTotalBudgetWon(budgetInput ? budgetInput.value : "");
        const overInfo = getOverbudgetInfo(plan, userBudgetWon, hl);

        return `
            <div class="compare-card card-${badgeLetter.toLowerCase()} ${overInfo.isOver ? 'card-overbudget' : ''}">
                <div class="compare-card-header">
                    <div>
                        <span class="compare-card-tag ${badgeClass}">${label} · ${plan.shortTitle}${isSaved ? ' (📌 저장됨)' : ''}</span>
                        <h3 class="compare-card-title">${plan.dest} (${plan.dur})</h3>
                    </div>
                    <button type="button" class="btn-action-outline btn-view-single" data-id="${plan.id}" style="font-size:11px; padding:4px 9px;">
                        상세 보기 ➔
                    </button>
                </div>

                <!-- 가격 및 예산 비교 영역 -->
                <div class="compare-section section-price ${overInfo.isOver ? 'section-price-over' : ''}">
                    <div class="compare-section-title">
                        <span>💰</span>
                        <span>예산 &amp; 경비 구조</span>
                        <span class="${overInfo.isOver ? 'badge-budget-over' : 'badge-budget-safe'}">${overInfo.cardBadgeText}</span>
                    </div>
                    <div class="compare-price-highlight">
                        <span>${hl.totalCost}</span>
                    </div>

                    ${overInfo.isOver ? `
                        <div class="compare-overbudget-alert">
                            <span>🚨</span>
                            <div>
                                <strong>설정 예산 대비 초과 안내</strong><br>
                                희망 예산보다 <strong>${overInfo.diffMan}만원 초과</strong>되었습니다. 가성비 대체 계획이나 할인 팁을 확인해 보세요.
                            </div>
                        </div>
                    ` : ''}

                    <ul class="compare-list">
                        <li class="compare-list-item">
                            <span class="compare-bullet">🏨</span>
                            <span><strong>숙소:</strong> ${hl.accommodation}</span>
                        </li>
                        <li class="compare-list-item">
                            <span class="compare-bullet">🚗</span>
                            <span><strong>교통:</strong> ${hl.transport}</span>
                        </li>
                    </ul>
                </div>

                <!-- 활동 & 액티비티 비교 영역 -->
                <div class="compare-section section-activity">
                    <div class="compare-section-title">
                        <span>🎯</span>
                        <span>핵심 활동 &amp; 여행 기조 (${plan.style ? plan.style.split('/')[0].trim() : '맞춤'})</span>
                    </div>
                    <ul class="compare-list">
                        ${hl.activities.map(act => `
                            <li class="compare-list-item">
                                <span class="compare-bullet">✔</span>
                                <span>${act}</span>
                            </li>
                        `).join("")}
                        ${hl.food.length > 0 ? `
                            <li class="compare-list-item">
                                <span class="compare-bullet">🍽️</span>
                                <span><strong>미식:</strong> ${hl.food.join(", ")}</span>
                            </li>
                        ` : ''}
                    </ul>
                </div>
            </div>
        `;
    }

    /**
     * 상세 항목별 비교 매트릭스 표 렌더링 헬퍼 (예산 초과 분석 포함)
     */
    function renderCompareMatrixTable(planA, planB) {
        const hlA = extractPlanHighlights(planA);
        const hlB = extractPlanHighlights(planB);

        const userBudgetWon = parseTotalBudgetWon(budgetInput ? budgetInput.value : "");
        const overInfoA = getOverbudgetInfo(planA, userBudgetWon, hlA);
        const overInfoB = getOverbudgetInfo(planB, userBudgetWon, hlB);

        return `
            <table class="compare-table">
                <thead>
                    <tr>
                        <th class="th-item">비교 항목</th>
                        <th class="th-plan-a">계획 A: ${planA.shortTitle}${planA.isSaved ? ' (📌 저장됨)' : ''}</th>
                        <th class="th-plan-b">계획 B: ${planB.shortTitle}${planB.isSaved ? ' (📌 저장됨)' : ''}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="td-item">💰 총 예상 경비</td>
                        <td>
                            <strong style="color: #ea580c; font-size: 14px;">${hlA.totalCost}</strong>
                            <div class="${overInfoA.isOver ? 'badge-budget-over' : 'badge-budget-safe'}" style="margin-top:4px;">${overInfoA.tableBadgeText}</div>
                        </td>
                        <td>
                            <strong style="color: #ea580c; font-size: 14px;">${hlB.totalCost}</strong>
                            <div class="${overInfoB.isOver ? 'badge-budget-over' : 'badge-budget-safe'}" style="margin-top:4px;">${overInfoB.tableBadgeText}</div>
                        </td>
                    </tr>
                    <tr>
                        <td class="td-item">⚠️ 예산 오버 여부 &amp; 분석</td>
                        <td>
                            ${overInfoA.isOver ? `<span style="color:#dc2626; font-weight:700;">${overInfoA.analysisText}</span><br><small style="color:#64748b;">고급 숙소/특정 액티비티로 인한 추가 지출 필요</small>` : `<span style="color:#16a34a; font-weight:700;">✅ 안정적 (설정 예산 내 완벽 소화)</span>`}
                        </td>
                        <td>
                            ${overInfoB.isOver ? `<span style="color:#dc2626; font-weight:700;">${overInfoB.analysisText}</span><br><small style="color:#64748b;">고급 숙소/특정 액티비티로 인한 추가 지출 필요</small>` : `<span style="color:#16a34a; font-weight:700;">✅ 안정적 (설정 예산 내 완벽 소화)</span>`}
                        </td>
                    </tr>
                    <tr>
                        <td class="td-item">🎨 여행 기조 및 스타일</td>
                        <td>${planA.style || '표준'}</td>
                        <td>${planB.style || '표준'}</td>
                    </tr>
                    <tr>
                        <td class="td-item">🏨 숙소 형태 및 등급</td>
                        <td>${hlA.accommodation}</td>
                        <td>${hlB.accommodation}</td>
                    </tr>
                    <tr>
                        <td class="td-item">🎯 주요 액티비티 &amp; 코스</td>
                        <td>
                            <ul style="margin:0; padding-left:18px;">
                                ${hlA.activities.map(a => `<li>${a}</li>`).join("")}
                            </ul>
                        </td>
                        <td>
                            <ul style="margin:0; padding-left:18px;">
                                ${hlB.activities.map(a => `<li>${a}</li>`).join("")}
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class="td-item">🍽️ 대표 추천 미식</td>
                        <td>${hlA.food.join(", ")}</td>
                        <td>${hlB.food.join(", ")}</td>
                    </tr>
                    <tr>
                        <td class="td-item">🚶 이동 수단 &amp; 동선 템포</td>
                        <td>${hlA.transport}</td>
                        <td>${hlB.transport}</td>
                    </tr>
                    <tr>
                        <td class="td-item">👥 추천 동행자</td>
                        <td>${planA.companions || '자유 동행'}</td>
                        <td>${planB.companions || '자유 동행'}</td>
                    </tr>
                </tbody>
            </table>
        `;
    }

    /**
     * 비교 대상 계획 즉시 생성 (퀵 버튼 클릭 시)
     */
    function quickGenerateComparePlan(targetStyle, targetMode) {
        if (typeof setTravelStyle === "function") {
            setTravelStyle(targetStyle, targetMode);
        }

        // 예산 자동 차등화 (가성비면 낮게, 힐링/미식이면 조금 높게)
        if (targetStyle.includes("알찬") || targetStyle.includes("가성비")) {
            const curVal = parseInt(priceRange.value, 10) || 1000000;
            const newVal = Math.max(300000, curVal - 200000);
            priceRange.value = newVal;
            priceMax.textContent = `₩ ${newVal.toLocaleString()}`;
            budgetInput.value = `1인당 ${Math.round(newVal / 10000)}만원 (가성비 절약형)`;
        } else if (targetStyle.includes("힐링") || targetStyle.includes("미식")) {
            const curVal = parseInt(priceRange.value, 10) || 1000000;
            const newVal = Math.min(3000000, curVal + 200000);
            priceRange.value = newVal;
            priceMax.textContent = `₩ ${newVal.toLocaleString()}`;
            budgetInput.value = `1인당 ${Math.round(newVal / 10000)}만원 (여유/미식형)`;
        }

        travelForm.scrollIntoView({ behavior: "smooth", block: "center" });
        travelForm.classList.add("form-focus-pulse");
        submitBtn.classList.add("btn-pulse");
        setTimeout(() => {
            travelForm.classList.remove("form-focus-pulse");
            submitBtn.classList.remove("btn-pulse");
            travelForm.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }, 300);
    }

    /**
     * 비교 대시보드 뷰 업데이트
     */
    function renderComparisonView() {
        if (!planCompareDashboard) return;

        const allPlans = getAllPlansForComparison();

        // 셀렉트 박스 갱신 (저장된 계획 및 생성된 계획 통합 옵션)
        if (compareSelectA && compareSelectB) {
            const optionsHtml = allPlans.map((p) => {
                const isSaved = p.isSaved || savedPlans.some(sp => sp.id === p.id);
                return `<option value="${p.id}">${isSaved ? '📌 [저장됨] ' : ''}${p.shortTitle} (${p.budget || ''})</option>`;
            }).join("");

            compareSelectA.innerHTML = optionsHtml;
            compareSelectB.innerHTML = optionsHtml;

            if (!comparePlanIdA || !allPlans.some(p => p.id === comparePlanIdA)) {
                comparePlanIdA = allPlans[0]?.id || null;
            }
            if (!comparePlanIdB || !allPlans.some(p => p.id === comparePlanIdB)) {
                if (allPlans.length >= 2) {
                    comparePlanIdB = allPlans[1]?.id;
                } else {
                    comparePlanIdB = null;
                }
            }

            if (comparePlanIdA) compareSelectA.value = comparePlanIdA;
            if (comparePlanIdB) compareSelectB.value = comparePlanIdB;
        }

        const planA = allPlans.find(p => p.id === comparePlanIdA) || allPlans[0];
        let planB = allPlans.find(p => p.id === comparePlanIdB);

        // 만약 planB가 아직 없고, 다른 계획이나 저장된 계획이 있으면 자동으로 기본 선택
        if (!planB && allPlans.length > 1) {
            planB = allPlans.find(p => p.id !== planA?.id);
            if (planB) {
                comparePlanIdB = planB.id;
                if (compareSelectB) compareSelectB.value = planB.id;
            }
        }

        // 1) 2열 비교 카드 렌더링
        if (compareGrid) {
            const cardAHtml = planA ? renderSingleCompareCard(planA, "A", "tag-plan-a", "계획 A") : "";
            let cardBHtml = "";

            if (planB && planB.id !== planA?.id) {
                cardBHtml = renderSingleCompareCard(planB, "B", "tag-plan-b", "계획 B");
            } else if (planB && planB.id === planA?.id && allPlans.length > 1) {
                const otherPlan = allPlans.find(p => p.id !== planA.id);
                if (otherPlan) {
                    comparePlanIdB = otherPlan.id;
                    if (compareSelectB) compareSelectB.value = otherPlan.id;
                    cardBHtml = renderSingleCompareCard(otherPlan, "B", "tag-plan-b", "계획 B");
                }
            } else {
                // 비교 대상(계획 B)이 없는 경우 안내 및 퀵 생성/저장된 플랜 비교 버튼 제공
                const candidateSaved = savedPlans.find(sp => sp.id !== planA?.id);
                cardBHtml = `
                    <div class="compare-card card-b">
                        <div class="compare-card-header">
                            <div>
                                <span class="compare-card-tag tag-plan-b">계획 B (비교 대상 필요)</span>
                                <h3 class="compare-card-title">또 다른 여행 계획을 추가해보세요</h3>
                            </div>
                        </div>
                        <div class="compare-empty-prompt">
                            <div class="compare-empty-icon">💡</div>
                            <div class="compare-empty-title">비교할 두 번째 계획이 아직 없습니다</div>
                            <p class="compare-empty-desc">
                                저장해둔 계획을 불러오거나 다른 조건으로 즉시 생성하여<br>
                                가격과 활동을 1:1로 비교 분석해 보세요!
                            </p>
                            <div class="compare-quick-btns">
                                ${candidateSaved ? `
                                    <button type="button" class="btn-quick-compare btn-compare-saved" data-saved-id="${candidateSaved.id}" style="background-color:#eef2ff; border-color:#a5b4fc; color:#4338ca; font-weight:800;">
                                        📌 저장된 [${candidateSaved.shortTitle || candidateSaved.title}]과 1:1 비교하기
                                    </button>
                                ` : ''}
                                <button type="button" class="btn-quick-compare" data-style="⚡ 알찬 핵심 투어 / 주요 랜드마크 정복" data-mode="A">
                                    ⚡ 알찬 가성비 투어로 비교 계획 생성
                                </button>
                                <button type="button" class="btn-quick-compare" data-style="🌿 여유로운 힐링 / 쉼이 있는 로컬 감성 여행" data-mode="B">
                                    🌿 여유로운 힐링으로 비교 계획 생성
                                </button>
                                <button type="button" class="btn-quick-compare" data-style="🍽️ 웨이팅 필수 현지 찐맛집 &amp; 미식 탐방" data-mode="A">
                                    🍽️ 로컬 미식 탐방으로 비교 계획 생성
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }

            compareGrid.innerHTML = cardAHtml + cardBHtml;

            // 상세 보기 버튼 이벤트
            compareGrid.querySelectorAll(".btn-view-single").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const planId = btn.dataset.id;
                    setActivePlan(planId);
                });
            });

            // 저장된 계획과 1:1 비교 버튼 이벤트
            compareGrid.querySelectorAll(".btn-compare-saved").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const savedId = btn.dataset.savedId;
                    comparePlanIdB = savedId;
                    renderComparisonView();
                });
            });

            // 퀵 생성 버튼 이벤트
            compareGrid.querySelectorAll(".btn-quick-compare:not(.btn-compare-saved)").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const targetStyle = btn.dataset.style;
                    const targetMode = btn.dataset.mode || "A";
                    quickGenerateComparePlan(targetStyle, targetMode);
                });
            });
        }

        // 2) 상세 비교 매트릭스 표 렌더링
        if (compareTableResponsive) {
            if (planA && planB && planA.id !== planB.id) {
                compareTableResponsive.innerHTML = renderCompareMatrixTable(planA, planB);
            } else {
                compareTableResponsive.innerHTML = `
                    <div style="text-align: center; padding: 24px; color: #64748b; font-size: 14px;">
                        ℹ️ 상단 셀렉트 박스에서 저장된 계획이나 비교할 두 번째 계획을 선택하면 상세 매트릭스 표가 자동으로 표시됩니다.
                    </div>
                `;
            }
        }
    }

    /**
     * 비교 모드 상호작용 이벤트 바인딩
     */
    if (btnToggleCompare) {
        btnToggleCompare.addEventListener("click", () => {
            toggleCompareMode();
        });
    }

    if (btnCloseCompare) {
        btnCloseCompare.addEventListener("click", () => {
            toggleCompareMode(false);
        });
    }

    if (compareSelectA) {
        compareSelectA.addEventListener("change", (e) => {
            comparePlanIdA = e.target.value;
            renderComparisonView();
        });
    }

    if (compareSelectB) {
        compareSelectB.addEventListener("change", (e) => {
            comparePlanIdB = e.target.value;
            renderComparisonView();
        });
    }

    function renderResult(data, dest, dur, payload) {
        const stylePrefix = payload?.travel_style ? payload.travel_style.split('/')[0].replace(/[🌿⚡🍽️📸👨‍👩‍👧‍👦🎒]/g, '').trim() : '맞춤';
        const planIndex = generatedPlans.length + 1;

        const newPlan = {
            id: "plan_" + Date.now(),
            title: `${dest} ${dur} (${stylePrefix})`,
            shortTitle: `계획 ${planIndex}: ${stylePrefix}`,
            dest: dest,
            dur: dur,
            budget: payload?.budget || "예산 확인 필요",
            style: payload?.travel_style || "표준 여행",
            interests: payload?.interests || "",
            companions: payload?.companions || "",
            transportation: payload?.transportation || "",
            accommodation: payload?.accommodation || "",
            mode: payload?.mode || "A",
            dietary_info: payload?.dietary_info || "",
            startDate: payload?.start_date || "",
            endDate: payload?.end_date || "",
            entryTransport: payload?.entry_transport || "",
            exitTransport: payload?.exit_transport || "",
            markdown: data.plan,
            model: data.model ? (data.model.includes("3.5") ? "Gemini 3.5 Flash" : (data.model.startsWith("gemini") ? data.model.replace("gemini-", "Gemini ") : data.model)) : "Gemini 3.5 Flash",
            elapsed: data.elapsed_seconds || "5.2",
            createdAt: new Date().toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit' })
        };

        // 최대 5개 유지
        if (generatedPlans.length >= 5) {
            generatedPlans.shift();
        }
        generatedPlans.push(newPlan);
        activePlanId = newPlan.id;

        if (generatedPlans.length >= 2) {
            comparePlanIdA = generatedPlans[generatedPlans.length - 2].id;
            comparePlanIdB = newPlan.id;
        } else if (savedPlans.length > 0) {
            comparePlanIdA = savedPlans[0].id;
            comparePlanIdB = newPlan.id;
        } else {
            comparePlanIdA = newPlan.id;
            comparePlanIdB = null;
        }

        // 결과 래퍼 표시
        resultWrapper.style.display = "block";

        if (isCompareMode) {
            renderPlanTabs();
            renderComparisonView();
            planCompareDashboard.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            setActivePlan(newPlan.id);
            resultWrapper.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    /**
     * 11. 카카오톡 등 모바일 메신저/채팅 앱 공유에 최적화된 포맷 생성
     * (맨 처음에 장소, 가격, 핵심 활동을 일목요연하게 요약하고, 웹 바로가기 링크 및 비밀번호 안내 포함)
     */
    function formatPlanForChat(plan, shareUrl = "") {
        if (!plan) return "";
        const hl = extractPlanHighlights(plan);
        const md = plan.markdown || "";

        let output = `✈️ [${plan.dest} ${plan.dur} 맞춤 여행 일정표]\n`;
        if (shareUrl) {
            output += `📱 [웹에서 친구가 짠 일정표 & 지도 바로보기]\n`;
            output += `👉 ${shareUrl}\n`;
            output += `✨ 링크를 누르면 친구가 작성한 일정표와 동선이 바로 열립니다!\n`;
        }
        output += `━━━━━━━━━━━━━━━━━━━━\n`;
        output += `📍 여행 장소: ${plan.dest}\n`;
        if (plan.startDate && plan.endDate) {
            output += `📅 여행 기간: ${plan.startDate} ~ ${plan.endDate} (${plan.dur})\n`;
        }
        if (plan.entryTransport || plan.exitTransport) {
            output += `🛫 출도착 거점: ${plan.entryTransport || '출발'} ➜ ${plan.exitTransport || '귀국'}\n`;
        }
        output += `💰 총 예상 가격: ${hl.totalCost}\n`;
        output += `🎯 핵심 활동: ${hl.activities.join(", ") || plan.interests}\n`;
        output += `🏨 추천 숙소: ${hl.accommodation}\n`;
        output += `🚗 이동 수단: ${hl.transport}\n`;
        if (plan.dietary_info) {
            output += `🍽️ 음식/알레르기: ${plan.dietary_info} (안심 대체식 안내)\n`;
        }
        output += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        // 마크다운 표 및 문법 기호를 모바일 채팅창에 알맞게 정제
        let cleanText = md;

        // 마크다운 표 제거 (모바일에서 줄바꿈 왜곡 방지)
        cleanText = cleanText.replace(/\|[^\r\n]+\|/g, "");

        // 마크다운 헤더 기호 변환
        cleanText = cleanText.replace(/^####\s*■\s*/gm, "\n■ ");
        cleanText = cleanText.replace(/^####\s*/gm, "\n■ ");
        cleanText = cleanText.replace(/^###\s*/gm, "\n▶ ");
        cleanText = cleanText.replace(/^##\s*/gm, "\n【 ");
        cleanText = cleanText.replace(/^#\s+[^\r\n]+/gm, "");

        // 볼드/이탤릭 기호 제거
        cleanText = cleanText.replace(/\*\*([^*]+)\*\*/g, "$1");
        cleanText = cleanText.replace(/\*([^*]+)\*/g, "$1");

        // 인용부호 제거
        cleanText = cleanText.replace(/^>\s+/gm, "");

        // 글머리 기호 정리
        cleanText = cleanText.replace(/^\s*-\s+/gm, "• ");

        // 연속된 공백 및 줄바꿈 정리
        cleanText = cleanText.replace(/[ \t]+/g, " ");
        cleanText = cleanText.replace(/\n{3,}/g, "\n\n").trim();

        output += cleanText;

        if (shareUrl) {
            output += `\n\n━━━━━━━━━━━━━━━━━━━━\n`;
            output += `👉 [웹에서 인터랙티브 동선 지도 & 숙소 예약 바로가기]\n`;
            output += `${shareUrl}\n`;
            output += `✨ 링크를 누르면 친구가 작성한 전체 일정표가 바로 열립니다!`;
        }

        return output + "\n\n💡 *실시간 요금 및 운영시간은 방문 전 확인 필요*";
    }

    async function createShareUrl(plan) {
        if (!plan) return window.location.href;
        try {
            let res = await fetch("/api/share", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan })
            });
            if (!res.ok) {
                res = await fetch("/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ plan })
                });
            }
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.share_url) {
                    return data.share_url;
                }
            }
        } catch (e) {
            console.warn("서버 공유 링크 생성 실패:", e);
        }


        const host = window.location.origin;
        return `${host}/?share=${encodeURIComponent(plan.id || "plan")}`;
    }

    /**
     * 11-0. '이 계획 저장하기' 버튼 동작
     * (현재 보고 있는 여행 계획을 브라우저 로컬 저장소에 영구 저장하여 나중에 언제든 다른 계획과 1:1 비교 가능)
     */
    if (btnSaveCurrentPlan) {
        btnSaveCurrentPlan.addEventListener("click", () => {
            const allPlans = getAllPlansForComparison();
            let plan = allPlans.find((p) => p.id === activePlanId);

            // 혹시 generatedPlans에 아직 없는 경우 현재 폼과 마크다운으로 계획 객체 생성
            if (!plan && currentPlanMarkdown) {
                plan = {
                    id: "plan_" + Date.now(),
                    title: `${destinationInput.value.trim()} ${durationInput.value.trim()}`,
                    shortTitle: `저장 계획: ${destinationInput.value.trim()}`,
                    dest: destinationInput.value.trim(),
                    dur: durationInput.value.trim(),
                    budget: budgetInput.value.trim(),
                    style: travelStyleInput.value.trim(),
                    interests: interestsInput.value.trim(),
                    companions: companionsInput.value.trim(),
                    transportation: transportationInput.value.trim(),
                    accommodation: accommodationInput.value.trim(),
                    markdown: currentPlanMarkdown,
                    model: "Gemini 3.5 Flash",
                    elapsed: "5.0",
                    createdAt: new Date().toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit' }),
                    isSaved: true
                };
                generatedPlans.push(plan);
                activePlanId = plan.id;
            }

            if (!plan) {
                alert("저장할 여행 계획 내용이 없습니다. 먼저 여행 일정을 생성해 주세요.");
                return;
            }

            const isAlreadySaved = savedPlans.some(sp => sp.id === plan.id || (sp.title === plan.title && sp.dest === plan.dest && sp.dur === plan.dur));

            if (isAlreadySaved) {
                const wantRemove = confirm(`[${plan.title}] 계획이 이미 영구 저장 목록에 있습니다.\n\n이 계획을 보관함에서 삭제하시겠습니까?`);
                if (wantRemove) {
                    savedPlans = savedPlans.filter(sp => sp.id !== plan.id && !(sp.title === plan.title && sp.dest === plan.dest && sp.dur === plan.dur));
                    plan.isSaved = false;
                    localStorage.setItem("ai_travel_saved_plans", JSON.stringify(savedPlans));
                    btnSaveCurrentPlan.innerHTML = '<span class="action-icon">📌</span> 이 계획 저장하기';
                    btnSaveCurrentPlan.classList.remove("saved-active");
                    renderPlanTabs();
                    renderComparisonView();
                }
                return;
            }

            // 신규 영구 저장
            plan.isSaved = true;
            savedPlans.unshift(plan);
            // 최대 20개까지 로컬 저장소 유지
            localStorage.setItem("ai_travel_saved_plans", JSON.stringify(savedPlans.slice(0, 20)));

            btnSaveCurrentPlan.innerHTML = '<span class="action-icon">✅</span> 저장된 계획 (비교 가능)';
            btnSaveCurrentPlan.classList.add("saved-active");

            // 탭 및 비교 뷰 동기화
            renderPlanTabs();
            renderComparisonView();

            // 비교 모드 버튼 시각 효과 (사용자에게 비교 기능 활성화 안내)
            if (btnToggleCompare) {
                btnToggleCompare.classList.add("btn-pulse");
                setTimeout(() => btnToggleCompare.classList.remove("btn-pulse"), 1800);
            }
        });
    }

    /**
     * 11-1. 카톡/채팅 공유용 복사 버튼 (웹 링크 자동 생성 및 포함)
     */
    if (copyChatBtn) {
        copyChatBtn.addEventListener("click", async () => {
            const plan = generatedPlans.find((p) => p.id === activePlanId) || {
                dest: destinationInput?.value.trim() || "여행지",
                dur: durationInput?.value.trim() || "2박 3일",
                startDate: startDateInput?.value || "",
                endDate: endDateInput?.value || "",
                entryTransport: entryTransportSelect?.value || "",
                exitTransport: exitTransportSelect?.value || "",
                budget: budgetInput?.value.trim() || "",
                interests: interestsInput?.value.trim() || "",
                accommodation: accommodationInput?.value.trim() || "",
                transportation: transportationInput?.value.trim() || "",
                markdown: currentPlanMarkdown
            };

            const originalHtml = copyChatBtn.innerHTML;
            copyChatBtn.innerHTML = "<span>🔗 웹 링크 생성 중...</span>";

            try {
                const shareUrl = await createShareUrl(plan);
                const chatText = formatPlanForChat(plan, shareUrl);
                if (!chatText) return;

                await navigator.clipboard.writeText(chatText);
                copyChatBtn.innerHTML = "<span>✅ 카톡 복사 완료! (웹 링크 포함)</span>";
                copyChatBtn.style.backgroundColor = "#e6ca00";

                setTimeout(() => {
                    copyChatBtn.innerHTML = originalHtml;
                    copyChatBtn.style.backgroundColor = "";
                }, 2200);
            } catch (err) {
                alert("클립보드 접근 권한이 필요합니다. 내용을 직접 복사해 주세요.");
                copyChatBtn.innerHTML = originalHtml;
            }
        });
    }

    /**
     * 11-1-2. 웹 전용 공유 링크 복사 버튼
     */
    if (btnShareLink) {
        btnShareLink.addEventListener("click", async () => {
            const plan = generatedPlans.find((p) => p.id === activePlanId) || {
                dest: destinationInput?.value.trim() || "여행지",
                dur: durationInput?.value.trim() || "2박 3일",
                startDate: startDateInput?.value || "",
                endDate: endDateInput?.value || "",
                entryTransport: entryTransportSelect?.value || "",
                exitTransport: exitTransportSelect?.value || "",
                budget: budgetInput?.value.trim() || "",
                interests: interestsInput?.value.trim() || "",
                accommodation: accommodationInput?.value.trim() || "",
                transportation: transportationInput?.value.trim() || "",
                markdown: currentPlanMarkdown
            };

            const origHtml = btnShareLink.innerHTML;
            btnShareLink.innerHTML = "<span>🔗 링크 생성 중...</span>";

            try {
                const shareUrl = await createShareUrl(plan);
                await navigator.clipboard.writeText(shareUrl);
                btnShareLink.innerHTML = "<span>✅ 링크 복사 완료!</span>";
                btnShareLink.style.borderColor = "var(--agoda-blue)";
                btnShareLink.style.color = "var(--agoda-blue)";
                alert(`🔗 친구에게 보낼 여행 계획 웹 링크가 복사되었습니다!\n\n${shareUrl}\n\n(카톡이나 문자로 친구에게 보내면, 친구도 이 계획과 지도, 추천 숙소를 그대로 볼 수 있습니다)`);
                setTimeout(() => {
                    btnShareLink.innerHTML = origHtml;
                    btnShareLink.style.borderColor = "";
                    btnShareLink.style.color = "";
                }, 2500);
            } catch (err) {
                alert("링크 복사 실패: 클립보드 권한을 확인해 주세요.");
                btnShareLink.innerHTML = origHtml;
            }
        });
    }

    if (btnCloseSharedBanner) {
        btnCloseSharedBanner.addEventListener("click", () => {
            if (sharedPlanBanner) sharedPlanBanner.style.display = "none";
        });
    }

    /**
     * 11-4. 공유 링크 감지 시 원본 여행 계획 자동 복원 및 렌더링
     */
    async function checkAndLoadSharedPlan() {
        const urlParams = new URLSearchParams(window.location.search);
        let shareId = urlParams.get("s") || urlParams.get("share");
        const token = urlParams.get("d") || urlParams.get("token");

        // URL 경로가 /s/<id> 또는 /share/<id> 인 경우 처리
        const pathParts = window.location.pathname.split("/").filter(Boolean);
        if (!shareId && pathParts.length >= 2 && (pathParts[0] === "s" || pathParts[0] === "share")) {
            shareId = pathParts[1];
        }

        if (!shareId && !token) return;

        try {
            showLoading();
            const badgeEl = document.getElementById("loadingStepBadge");
            const loadingTitleEl = document.getElementById("loadingTitle");
            if (badgeEl) badgeEl.textContent = "공유 여행 계획 동기화 중";
            if (loadingTitleEl) loadingTitleEl.textContent = "친구가 보낸 소중한 여행 계획을 불러오고 있어요 📬";
            if (loadingTip) {
                loadingTip.textContent = "친구가 설계한 일정표와 추천 동선을 안전하게 가져오는 중입니다...";
            }

            let sharedPlan = null;

            // 1. shareId가 있으면 공유 API (서버 캐시 / 글로벌 클라우드 저장소) 조회
            if (shareId) {
                try {
                    let res = await fetch(`/api/share/${encodeURIComponent(shareId)}${token ? `?d=${encodeURIComponent(token)}` : ''}`);
                    if (!res.ok) {
                        res = await fetch(`/?action=share&share=${encodeURIComponent(shareId)}${token ? `&d=${encodeURIComponent(token)}` : ''}`, {
                            headers: { "Accept": "application/json" }
                        });
                    }
                    if (res.ok) {
                        const data = await res.json();
                        if (data.success && data.plan) {
                            sharedPlan = data.plan;
                        }
                    }
                } catch (e) {
                    console.warn("공유 계획 API 호출 실패:", e);
                }
            }

            // 2. shareId 조회가 안 되었고 압축 토큰(token)이 있는 경우 무손실 디코드 시도
            if (!sharedPlan && token) {
                try {
                    let resToken = await fetch(`/api/share/decode?d=${encodeURIComponent(token)}`);
                    if (!resToken.ok) {
                        resToken = await fetch(`/?action=decode&d=${encodeURIComponent(token)}`);
                    }
                    if (!resToken.ok) {
                        resToken = await fetch("/", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ token })
                        });
                    }
                    if (resToken.ok) {
                        const dataToken = await resToken.json();
                        if (dataToken.success && dataToken.plan) {
                            sharedPlan = dataToken.plan;
                        }
                    }
                } catch (eToken) {
                    console.warn("압축 토큰 디코드 실패:", eToken);
                }
            }

            if (sharedPlan) {
                if (destinationInput && sharedPlan.dest) destinationInput.value = sharedPlan.dest;
                if (durationInput && sharedPlan.dur) durationInput.value = sharedPlan.dur;
                if (startDateInput && sharedPlan.startDate) startDateInput.value = sharedPlan.startDate;
                if (endDateInput && sharedPlan.endDate) endDateInput.value = sharedPlan.endDate;
                if (entryTransportSelect && sharedPlan.entryTransport) entryTransportSelect.value = sharedPlan.entryTransport;
                if (exitTransportSelect && sharedPlan.exitTransport) exitTransportSelect.value = sharedPlan.exitTransport;
                if (budgetInput && sharedPlan.budget) budgetInput.value = sharedPlan.budget;
                if (interestsInput && sharedPlan.interests) interestsInput.value = sharedPlan.interests;
                if (companionsInput && sharedPlan.companions) companionsInput.value = sharedPlan.companions;
                if (transportationInput && sharedPlan.transportation) transportationInput.value = sharedPlan.transportation;
                if (accommodationInput && sharedPlan.accommodation) accommodationInput.value = sharedPlan.accommodation;

                updateDurationFromDates();
                updateHubChipsActiveState();

                currentPlanMarkdown = sharedPlan.markdown;
                renderResult({
                    plan: sharedPlan.markdown,
                    model: sharedPlan.model || "Gemini 3.5 Flash",
                    elapsed_seconds: sharedPlan.elapsed || "4.8"
                }, sharedPlan.dest, sharedPlan.dur, sharedPlan);

                if (sharedPlanBanner) {
                    sharedPlanBanner.style.display = "flex";
                }
            }
        } catch (err) {
            console.error("공유 계획 복원 중 오류:", err);
        } finally {
            hideLoading();
        }
    }

    /**
     * 11-2. 원문 마크다운 전체 복사 버튼
     */
    copyBtn.addEventListener("click", async () => {
        if (!currentPlanMarkdown) return;
        try {
            await navigator.clipboard.writeText(currentPlanMarkdown);
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = "<span>✅ 전체 복사 완료!</span>";
            copyBtn.style.borderColor = "var(--agoda-green)";
            copyBtn.style.color = "var(--agoda-green)";

            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.style.borderColor = "";
                copyBtn.style.color = "";
            }, 2000);
        } catch (err) {
            alert("클립보드 복사 실패: 내용을 직접 복사해 주세요.");
        }
    });

    /**
     * 12. .md 파일 다운로드
     */
    downloadBtn.addEventListener("click", () => {
        if (!currentPlanMarkdown) return;
        const dest = destinationInput.value.trim() || "여행일정";
        const dateStr = new Date().toISOString().slice(0, 10);
        const fileName = `${dest}_맞춤일정표_${dateStr}.md`;

        const blob = new Blob([currentPlanMarkdown], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    /**
     * 13. 빈 결과 안내 카드의 'AI 일정 생성' 버튼 동작
     */
    const btnEmptyGenerate = document.getElementById("btnEmptyGenerate");
    if (btnEmptyGenerate) {
        btnEmptyGenerate.addEventListener("click", () => {
            travelForm.scrollIntoView({ behavior: "smooth", block: "center" });
            travelForm.classList.add("form-focus-pulse");
            setTimeout(() => travelForm.classList.remove("form-focus-pulse"), 1200);
        });
    }

    // 14. 페이지 첫 진입 시 위시리스트 동기화 및 기본 선택 지역(제주) 필터링 1회 실행
    renderWishlistUI();
    filterProducts();
    updatePerPersonDisplay();

    // 14-1. 이전에 브라우저에 저장해둔 여행 계획이 있다면 복원하여 즉시 비교 및 확인 가능
    if (savedPlans && savedPlans.length > 0) {
        renderPlanTabs();
        if (!activePlanId) {
            activePlanId = savedPlans[0].id;
            setActivePlan(savedPlans[0].id);
            resultWrapper.style.display = "block";
        }
    }

    /**
     * 15. 이미지 로드 실패 또는 미등록 시 '관련 사진 없음' 대체 UI 적용 (글자 삐죽 방지)
     */
    function setupImageFallbacks() {
        document.querySelectorAll(".card-img").forEach((img) => {
            function handleImgError() {
                const parent = img.closest(".card-img-wrap");
                if (!parent) return;
                img.style.display = "none";
                if (!parent.querySelector(".img-fallback-placeholder")) {
                    const fallback = document.createElement("div");
                    fallback.className = "img-fallback-placeholder";
                    fallback.innerHTML = `
                        <span class="placeholder-icon">🖼️</span>
                        <span class="placeholder-badge">관련 사진 준비 중</span>
                    `;
                    parent.appendChild(fallback);
                }
            }

            img.addEventListener("error", handleImgError);
            if (img.complete && img.naturalHeight === 0) {
                handleImgError();
            }
        });
    }

    setupImageFallbacks();

    // PWA 서비스 워커 등록
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("/sw.js")
                .then(reg => {
                    console.log("PWA Service Worker 등록 성공 (Scope):", reg.scope);
                })
                .catch(err => {
                    console.warn("PWA Service Worker 등록 실패:", err);
                });
        });
    }

    // ==========================================
    // PWA 앱 설치 배너 & 버튼 인터랙션 제어
    // ==========================================
    let deferredInstallPrompt = null;

    function initPwaInstall() {
        const pwaInstallBanner = document.getElementById("pwaInstallBanner");
        const pwaInstallBtn = document.getElementById("pwaInstallBtn");
        const pwaCloseBtn = document.getElementById("pwaCloseBtn");
        const pwaHeaderBtn = document.getElementById("pwaHeaderBtn");

        const mobileBottomInstallBar = document.getElementById("mobileBottomInstallBar");
        const mobileBottomInstallBtn = document.getElementById("mobileBottomInstallBtn");
        const mobileBottomCloseBtn = document.getElementById("mobileBottomCloseBtn");

        const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
        if (isStandalone) {
            console.log("PWA 이미 설치된 독립 실행형(Standalone) 모드입니다.");
            return;
        }

        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 768;
        const isBannerDismissed = sessionStorage.getItem("pwa_banner_dismissed") === "true";
        const isMobileBottomDismissed = sessionStorage.getItem("pwa_mobile_bottom_dismissed") === "true";

        function showInstallUi() {
            if (pwaHeaderBtn) pwaHeaderBtn.style.display = "inline-flex";
            if (isMobile) {
                if (pwaInstallBanner) pwaInstallBanner.style.display = "none";
                if (mobileBottomInstallBar && !isMobileBottomDismissed) {
                    mobileBottomInstallBar.style.display = "block";
                }
            } else {
                if (pwaInstallBanner && !isBannerDismissed) {
                    pwaInstallBanner.style.display = "block";
                }
            }
        }

        function hideInstallUi() {
            if (pwaInstallBanner) pwaInstallBanner.style.display = "none";
            if (pwaHeaderBtn) pwaHeaderBtn.style.display = "none";
            if (mobileBottomInstallBar) mobileBottomInstallBar.style.display = "none";
        }

        // Chrome, Edge, Android PWA 설치 이벤트 감지
        window.addEventListener("beforeinstallprompt", (e) => {
            e.preventDefault();
            deferredInstallPrompt = e;
            console.log("PWA beforeinstallprompt 이벤트 감지: 설치 가능");
            showInstallUi();
        });

        // 이미 설치 완료된 경우 처리
        window.addEventListener("appinstalled", () => {
            console.log("PWA 앱이 설치되었습니다.");
            deferredInstallPrompt = null;
            hideInstallUi();
            alert("AI Travel Planner 앱이 성공적으로 설치되었습니다! 홈 화면이나 앱 서랍에서 이용하실 수 있습니다.");
        });

        async function handleInstallClick() {
            if (deferredInstallPrompt) {
                deferredInstallPrompt.prompt();
                const choiceResult = await deferredInstallPrompt.userChoice;
                if (choiceResult && choiceResult.outcome === "accepted") {
                    console.log("사용자가 PWA 앱 설치를 수락했습니다.");
                } else {
                    console.log("사용자가 PWA 앱 설치를 취소했습니다.");
                }
                deferredInstallPrompt = null;
                hideInstallUi();
            } else {
                const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                if (isIos) {
                    alert("📱 iOS(아이폰/아이패드) 앱 설치 안내:\n\n1. Safari 브라우저 하단의 [공유] 버튼(네모+화살표)을 누릅니다.\n2. 메뉴에서 [홈 화면에 추가]를 선택하시면 앱으로 설치됩니다!");
                } else {
                    alert("📱 앱 설치 안내:\n\n브라우저 주소창 우측의 [앱 설치] 아이콘(컴퓨터 모니터/다운로드 모양)을 클릭하거나 브라우저 메뉴(⋮)에서 [앱 설치]를 선택해 주세요.");
                }
            }
        }

        if (pwaInstallBtn) pwaInstallBtn.addEventListener("click", handleInstallClick);
        if (pwaHeaderBtn) pwaHeaderBtn.addEventListener("click", handleInstallClick);
        if (mobileBottomInstallBtn) mobileBottomInstallBtn.addEventListener("click", handleInstallClick);

        if (pwaCloseBtn) {
            pwaCloseBtn.addEventListener("click", () => {
                if (pwaInstallBanner) pwaInstallBanner.style.display = "none";
                sessionStorage.setItem("pwa_banner_dismissed", "true");
            });
        }

        if (mobileBottomCloseBtn) {
            mobileBottomCloseBtn.addEventListener("click", () => {
                if (mobileBottomInstallBar) mobileBottomInstallBar.style.display = "none";
                sessionStorage.setItem("pwa_mobile_bottom_dismissed", "true");
            });
        }

        // 로드 0.6초 후 설치 UI 노출 시도
        setTimeout(() => {
            if (!isStandalone) {
                showInstallUi();
            }
        }, 600);
    }

    initDatePickers();
    initPwaInstall();
    checkAndLoadSharedPlan();
});
