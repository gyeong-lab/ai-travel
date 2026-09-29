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
    const styleChips = document.querySelectorAll(".style-chip");

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
            accommodation: "서귀포 바다 전망 감성 숙소",
            mode: "B",
            travel_style: "🌿 여유로운 힐링 / 쉼이 있는 로컬 감성 여행"
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
        }
    };

    const loadingTips = [
        "선택하신 여행지의 최적 이동 동선과 교통편 정보를 분석하고 있습니다...",
        "할인 가능한 방법(얼리버드, 투어패스, 모바일 쿠폰)을 탐색 중입니다...",
        "예약 필수 명소 및 캐치테이블·테이블링 예약 꿀팁을 정리하고 있습니다...",
        "코스별 통합 예상 경비와 세부 일정표를 계산하고 있습니다..."
    ];

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
        accommodationInput.value = "서귀포 바다 전망 감성 숙소";
        setTravelStyle("🌿 여유로운 힐링 / 쉼이 있는 로컬 감성 여행", "B");

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
            if (dur) durationInput.value = dur;
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
                            if (item.dur) durationInput.value = item.dur;
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
        const budget = budgetInput.value.trim();
        const interests = interestsInput.value.trim();
        const companions = companionsInput.value.trim();
        const transportation = transportationInput.value.trim();
        const accommodation = accommodationInput.value.trim();
        const mode = travelModeInput ? travelModeInput.value : (document.querySelector('input[name="mode"]:checked')?.value || "A");
        const travel_style = travelStyleInput ? travelStyleInput.value.trim() : "";

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
            budget,
            interests,
            companions,
            transportation,
            accommodation,
            mode,
            travel_style
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

    function showLoading() {
        loadingState.style.display = "block";
        resultWrapper.style.display = "none";
        loadingState.scrollIntoView({ behavior: "smooth", block: "start" });

        let tipIndex = 0;
        loadingTip.textContent = loadingTips[0];
        loadingInterval = setInterval(() => {
            tipIndex = (tipIndex + 1) % loadingTips.length;
            loadingTip.textContent = loadingTips[tipIndex];
        }, 2200);
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

    /**
     * 특정 플랜을 활성화하여 상세 보기 렌더링
     */
    function setActivePlan(id) {
        const allPlans = getAllPlansForComparison();
        const plan = allPlans.find((p) => p.id === id);
        if (!plan) return;

        activePlanId = id;
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
        } else if (planOutput) {
            planOutput.textContent = plan.markdown;
        }

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
     * 1:1 비교 카드 렌더링 헬퍼
     */
    function renderSingleCompareCard(plan, badgeLetter, badgeClass, label) {
        const hl = extractPlanHighlights(plan);
        const isSaved = plan.isSaved || savedPlans.some(sp => sp.id === plan.id);
        return `
            <div class="compare-card card-${badgeLetter.toLowerCase()}">
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
                <div class="compare-section section-price">
                    <div class="compare-section-title">
                        <span>💰</span>
                        <span>예산 &amp; 경비 구조</span>
                    </div>
                    <div class="compare-price-highlight">${hl.totalCost}</div>
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
     * 상세 항목별 비교 매트릭스 표 렌더링 헬퍼
     */
    function renderCompareMatrixTable(planA, planB) {
        const hlA = extractPlanHighlights(planA);
        const hlB = extractPlanHighlights(planB);

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
                        <td><strong style="color: #ea580c; font-size: 14px;">${hlA.totalCost}</strong></td>
                        <td><strong style="color: #ea580c; font-size: 14px;">${hlB.totalCost}</strong></td>
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
            markdown: data.plan,
            model: data.model || "Gemini 2.5 Flash",
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
     * (맨 처음에 장소, 가격, 핵심 활동을 일목요연하게 요약하고, 1일차 2일차 상세 일정을 깔끔하게 연결)
     */
    function formatPlanForChat(plan) {
        if (!plan) return "";
        const hl = extractPlanHighlights(plan);
        const md = plan.markdown || "";

        let output = `✈️ [${plan.dest} ${plan.dur} 맞춤 여행 가이드]\n`;
        output += `━━━━━━━━━━━━━━━━━━━━\n`;
        output += `📍 여행 장소: ${plan.dest}\n`;
        output += `💰 예상 가격: ${hl.totalCost}\n`;
        output += `🎯 핵심 활동: ${hl.activities.join(", ") || plan.interests}\n`;
        output += `🏨 추천 숙소: ${hl.accommodation}\n`;
        output += `🚗 이동 수단: ${hl.transport}\n`;
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
        cleanText = cleanText.replace(/^#\s+[^\r\n]+/gm, ""); // 헤더 제목은 위 요약으로 대체

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

        return output + cleanText + "\n\n💡 *실시간 요금 및 운영시간은 방문 전 확인 필요*";
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
                    model: "Gemini 2.5 Flash",
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
     * 11-1. 카톡/채팅 공유용 복사 버튼
     */
    if (copyChatBtn) {
        copyChatBtn.addEventListener("click", async () => {
            const plan = generatedPlans.find((p) => p.id === activePlanId) || {
                dest: destinationInput.value.trim() || "여행지",
                dur: durationInput.value.trim() || "일정",
                budget: budgetInput.value.trim() || "",
                interests: interestsInput.value.trim() || "",
                accommodation: accommodationInput.value.trim() || "",
                transportation: transportationInput.value.trim() || "",
                markdown: currentPlanMarkdown
            };

            const chatText = formatPlanForChat(plan);
            if (!chatText) return;

            try {
                await navigator.clipboard.writeText(chatText);
                const originalHtml = copyChatBtn.innerHTML;
                copyChatBtn.innerHTML = "<span>✅ 카톡용 복사 완료!</span>";
                copyChatBtn.style.backgroundColor = "#e6ca00";

                setTimeout(() => {
                    copyChatBtn.innerHTML = originalHtml;
                    copyChatBtn.style.backgroundColor = "";
                }, 2000);
            } catch (err) {
                alert("클립보드 접근 권한이 필요합니다. 내용을 직접 복사해 주세요.");
            }
        });
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
});
