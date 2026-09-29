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
    const interestsInput = document.getElementById("interests");
    const companionsInput = document.getElementById("companions");
    const transportationInput = document.getElementById("transportation");
    const accommodationInput = document.getElementById("accommodation");

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
    const copyBtn = document.getElementById("copyBtn");
    const downloadBtn = document.getElementById("downloadBtn");

    // 상태 관리 변수
    let currentPlanMarkdown = "";
    let loadingInterval = null;
    let currentCityKey = "제주";
    let currentCategory = "all";

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
            mode: "B"
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
            mode: "A"
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
            mode: "A"
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
            mode: "B"
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
            mode: "A"
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
            mode: "B"
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
            mode: "A"
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
            mode: "B"
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
            mode: "A"
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
            mode: "B"
        }
    };

    const loadingTips = [
        "선택하신 여행지의 최적 이동 동선과 교통편 정보를 분석하고 있습니다...",
        "가성비 높은 평점 4.8+ 인기 맛집과 관광지를 추천 목록에 선별 중입니다...",
        "일자별 세밀한 시간표와 예상 경비 분석표를 계산하고 있습니다...",
        "놓치기 쉬운 필수 준비물 및 스마트 여행 꿀팁을 정리하고 있습니다..."
    ];

    /**
     * 1. 모드(A/B) 라디오 카드 선택 처리
     */
    function setMode(modeValue) {
        modeCards.forEach((card) => {
            const input = card.querySelector('input[type="radio"]');
            if (input && input.value === modeValue) {
                card.classList.add("active");
                input.checked = true;
            } else {
                card.classList.remove("active");
            }
        });
    }

    modeCards.forEach((card) => {
        card.addEventListener("click", () => {
            const radio = card.querySelector('input[type="radio"]');
            if (radio) setMode(radio.value);
        });
    });

    /**
     * 2. 지역 및 카테고리 교차 필터링 핵심 함수 (2차원 동시 필터링)
     */
    function filterProducts() {
        const emptyNotice = document.getElementById("productEmptyNotice");
        const emptyNoticeTitle = document.getElementById("emptyNoticeTitle");
        let visibleCount = 0;

        productCards.forEach((card) => {
            const cardDest = card.dataset.dest || "";
            const cardCat = card.dataset.category || "";

            const matchCity = (!currentCityKey || currentCityKey === "all") || cardDest.includes(currentCityKey);
            const matchCat = (currentCategory === "all") || (cardCat === currentCategory);

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
                    const catBtn = document.querySelector(`.cat-item[data-category="${currentCategory}"] .cat-label`);
                    const catLabel = catBtn ? catBtn.textContent.trim() : "해당 테마";
                    const displayCity = currentCityKey === "all" ? "선택하신 지역" : currentCityKey;
                    emptyNoticeTitle.textContent = `${displayCity}의 '${catLabel}' 추천 코스를 준비 중입니다`;
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
        interestsInput.value = "오션뷰 감성 카페, 애월 해안도로, 흑돼지 맛집, 사려니숲길 힐링";
        companionsInput.value = "연인과 둘이서";
        transportationInput.value = "렌터카 (전기차)";
        accommodationInput.value = "서귀포 바다 전망 감성 숙소";
        setMode("B");

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

    function syncBudgetFromSlider() {
        if (!priceRange || !budgetInput) return;
        const val = parseInt(priceRange.value, 10);
        const formattedWon = val.toLocaleString("ko-KR");
        const koreanText = formatKoreanBudget(val);

        if (priceMax) {
            priceMax.textContent = `₩ ${formattedWon}`;
        }

        // 기존에 "2인", "1인당" 등 수식어가 붙어있으면 자연스럽게 보존하여 연동
        const currentText = budgetInput.value.trim();
        if (currentText.includes("2인")) {
            budgetInput.value = `2인 총 ${koreanText}`;
        } else if (currentText.includes("1인당") || currentText.includes("1인")) {
            budgetInput.value = `1인당 ${koreanText}`;
        } else {
            budgetInput.value = `총 ${koreanText}`;
        }

        // 시각적 강조 애니메이션 (파란색 테두리 하이라이트)
        budgetInput.classList.add("input-synced");
        clearTimeout(budgetInput._syncTimer);
        budgetInput._syncTimer = setTimeout(() => {
            budgetInput.classList.remove("input-synced");
        }, 500);
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
                interestsInput.value = data.interests;
                companionsInput.value = data.companions;
                transportationInput.value = data.transportation;
                accommodationInput.value = data.accommodation;
                setMode(data.mode);

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
     * 9. 위시리스트 하트 토글
     */
    wishlistButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            btn.classList.toggle("active");
            if (btn.classList.contains("active")) {
                btn.textContent = "❤️";
                btn.style.color = "var(--agoda-red)";
            } else {
                btn.textContent = "♡";
                btn.style.color = "";
            }
        });
    });

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
        const mode = document.querySelector('input[name="mode"]:checked')?.value || "A";

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
            mode
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
            renderResult(data, destination, duration);

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

    function renderResult(data, dest, dur) {
        resultHeaderTitle.textContent = `${dest} ${dur} 맞춤 여행 일정표`;
        resultMeta.textContent = `⚡ AI 엔진: ${data.model || "Gemini 2.5 Flash"} · 소요 시간: ${data.elapsed_seconds || "5.2"}초 · 생성 완료`;

        if (window.marked) {
            planOutput.innerHTML = window.marked.parse(data.plan);
        } else {
            planOutput.textContent = data.plan;
        }

        resultWrapper.style.display = "block";
        resultWrapper.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    /**
     * 11. 클립보드 복사
     */
    copyBtn.addEventListener("click", async () => {
        if (!currentPlanMarkdown) return;
        try {
            await navigator.clipboard.writeText(currentPlanMarkdown);
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = "<span>✅ 복사 완료!</span>";
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

    // 14. 페이지 첫 진입 시 기본 선택 지역(제주) 및 카테고리(전체) 교차 필터링 1회 실행
    filterProducts();
});
