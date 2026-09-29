/**
 * agoda AI Travel Planner - Frontend Application Logic
 * Integrates Agoda Activities & Tours UI with Gemini AI Planner API
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. 주요 폼 및 입력 요소
    const travelForm = document.getElementById("travelForm");
    const submitBtn = document.getElementById("submitBtn");
    const destinationInput = document.getElementById("destination");
    const durationInput = document.getElementById("duration");
    const budgetInput = document.getElementById("budget");
    const interestsInput = document.getElementById("interests");
    const companionsInput = document.getElementById("companions");
    const transportationInput = document.getElementById("transportation");
    const accommodationInput = document.getElementById("accommodation");

    // 상단 검색바
    const topSearchInput = document.getElementById("topSearchInput");
    const topSearchBtn = document.getElementById("topSearchBtn");

    // 필터 & 슬라이더
    const priceRange = document.getElementById("priceRange");
    const priceMax = document.getElementById("priceMax");
    const resetFiltersBtn = document.getElementById("resetFiltersBtn");
    const chipDestination = document.getElementById("chipDestination");
    const categoryButtons = document.querySelectorAll(".cat-item");
    const presetButtons = document.querySelectorAll(".preset-btn");
    const modeCards = document.querySelectorAll(".mode-card");

    // 상품 카드 & 위시리스트
    const productCards = document.querySelectorAll(".agoda-card");
    const wishlistButtons = document.querySelectorAll(".card-wishlist");

    // 상태 및 결과 출력 영역
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

    // 상태 변수
    let currentPlanMarkdown = "";
    let loadingInterval = null;

    // 프리셋 데이터 사전
    const presets = {
        jeju: {
            destination: "제주도 서귀포 & 애월",
            duration: "2박 3일",
            budget: "2인 총 120만원",
            interests: "오션뷰 감성 카페, 애월 해안도로, 흑돼지 맛집, 사려니숲길 힐링",
            companions: "연인과 둘이서",
            transportation: "렌터카 (전기차)",
            accommodation: "서귀포 바다 전망 감성 펜션",
            mode: "B"
        },
        osaka: {
            destination: "일본 오사카 & 교토",
            duration: "3박 4일",
            budget: "1인당 100만원",
            interests: "도톤보리 미식 투어, 교토 청수사/아라시야마, 우메다 스카이빌딩, 쇼핑",
            companions: "친구와 둘이서",
            transportation: "대중교통 (지하철, 라피트)",
            accommodation: "난바역 근처 가성비 비즈니스 호텔",
            mode: "A"
        },
        paris: {
            destination: "프랑스 파리",
            duration: "5박 6일",
            budget: "1인당 300만원",
            interests: "루브르 & 오르세 미술관, 에펠탑 야경, 세느강 바토무슈, 몽마르트르",
            companions: "혼자 떠나는 여행",
            transportation: "대중교통 (메트로) 및 도보",
            accommodation: "시내 중심 3성급 부티크 호텔",
            mode: "B"
        },
        bangkok: {
            destination: "태국 방콕",
            duration: "4박 5일",
            budget: "1인당 90만원",
            interests: "쩟페어 야시장 먹거리, 차오프라야 크루즈 디너, 왓아룬 사원 뷰 루프탑",
            companions: "친구 2명",
            transportation: "대중교통 (BTS/MRT) 및 그랩(Grab)",
            accommodation: "차오프라야 강변 가성비 4성급 호텔",
            mode: "A"
        }
    };

    // 로딩 시 순환 안내 문구
    const loadingTips = [
        "아고다 최적 이동 동선과 현지 교통편 정보를 분석하고 있습니다...",
        "가성비 높은 평점 4.8+ 인기 맛집과 관광지를 추천 목록에 선별 중입니다...",
        "일자별 세밀한 시간표와 예상 경비 분석표를 계산하고 있습니다...",
        "놓치기 쉬운 필수 준비물 및 아고다 예약 꿀팁을 정리하고 있습니다..."
    ];

    /**
     * 모드(A/B) 라디오 카드 선택 UI 처리
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
            if (radio) {
                setMode(radio.value);
            }
        });
    });

    /**
     * 상단 검색바 이벤트 처리
     */
    function handleTopSearch() {
        const query = topSearchInput.value.trim();
        if (query) {
            destinationInput.value = query;
            chipDestination.innerHTML = `${query} <button type="button" class="chip-remove">✕</button>`;
            chipDestination.style.display = "inline-flex";
            // 칩 삭제 버튼 재바인딩
            const removeBtn = chipDestination.querySelector(".chip-remove");
            if (removeBtn) {
                removeBtn.addEventListener("click", () => {
                    chipDestination.style.display = "none";
                    destinationInput.value = "";
                });
            }
            // 알림 효과
            destinationInput.scrollIntoView({ behavior: "smooth", block: "center" });
            destinationInput.focus();
        }
    }

    topSearchBtn.addEventListener("click", handleTopSearch);
    topSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleTopSearch();
        }
    });

    /**
     * 카테고리 캐러셀 탭 클릭 이벤트
     */
    categoryButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            categoryButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            const label = btn.querySelector(".cat-label")?.textContent.trim();
            if (label && label !== "모든 카테고리") {
                interestsInput.value = `${label} 중심 맞춤 여행, 인기 명소 투어`;
            }
        });
    });

    /**
     * 필터 초기화 버튼
     */
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener("click", () => {
            document.querySelectorAll(".filter-chip").forEach((chip) => {
                chip.style.display = "none";
            });
            destinationInput.value = "";
            priceRange.value = 1500000;
            priceMax.textContent = "₩ 1,500,000";
            budgetInput.value = "총 150만원";
        });
    }

    // 칩 삭제 버튼 이벤트
    document.querySelectorAll(".chip-remove").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const chip = e.target.closest(".filter-chip");
            if (chip) chip.style.display = "none";
        });
    });

    /**
     * 요금 슬라이더 이벤트
     */
    if (priceRange && priceMax) {
        priceRange.addEventListener("input", (e) => {
            const val = parseInt(e.target.value, 10);
            const formatted = val.toLocaleString("ko-KR");
            priceMax.textContent = `₩ ${formatted}`;
            budgetInput.value = `총 ${formatted}원`;
        });
    }

    /**
     * 추천 프리셋 버튼 클릭 이벤트
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
                interestsInput.value = data.interests;
                companionsInput.value = data.companions;
                transportationInput.value = data.transportation;
                accommodationInput.value = data.accommodation;
                setMode(data.mode);

                topSearchInput.value = data.destination;
                chipDestination.innerHTML = `${data.destination.split(" ")[0]} <button type="button" class="chip-remove">✕</button>`;
                chipDestination.style.display = "inline-flex";

                // 부드러운 스크롤 이동
                travelForm.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    /**
     * 아고다 여행 상품 카드 클릭 시 폼 자동 반영
     */
    productCards.forEach((card) => {
        card.addEventListener("click", (e) => {
            // 하트 버튼 클릭인 경우 카드 클릭 방지
            if (e.target.closest(".card-wishlist")) return;

            const dest = card.dataset.dest;
            const theme = card.dataset.theme;
            const title = card.querySelector(".card-title")?.textContent.trim();

            if (dest) destinationInput.value = dest;
            if (theme || title) {
                interestsInput.value = `${theme || title}, 현지 인기 명소 탐방`;
            }

            // 시각적 피드백
            card.style.borderColor = "var(--agoda-blue)";
            setTimeout(() => {
                card.style.borderColor = "";
            }, 600);

            // 입력 폼으로 포커스
            travelForm.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    });

    /**
     * 위시리스트 하트 버튼 토글
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
     * 폼 제출 및 AI 여행 일정표 생성
     */
    travelForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // 필수 값 검증
        const destination = destinationInput.value.trim();
        const duration = durationInput.value.trim();
        const budget = budgetInput.value.trim();
        const interests = interestsInput.value.trim();
        const companions = companionsInput.value.trim();
        const transportation = transportationInput.value.trim();
        const accommodation = accommodationInput.value.trim();
        const mode = document.querySelector('input[name="mode"]:checked')?.value || "A";

        if (!destination || !duration || !budget || !interests) {
            showError("목적지, 여행 기간, 예산, 관심사를 모두 입력해 주세요.");
            return;
        }

        // 로딩 상태 시작
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
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "일정 생성 중 문제가 발생했습니다.");
            }

            // 마크다운 파싱 및 결과 렌더링
            currentPlanMarkdown = data.plan;
            renderResult(data, destination, duration);

        } catch (err) {
            console.error("AI Generation Error:", err);
            showError(err.message || "서버와 통신할 수 없습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            hideLoading();
            submitBtn.disabled = false;
        }
    });

    /**
     * 로딩 화면 표시 및 팁 순환
     */
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
     * 결과 렌더링
     */
    function renderResult(data, dest, dur) {
        resultHeaderTitle.textContent = `${dest} ${dur} 맞춤 여행 일정표`;
        resultMeta.textContent = `⚡ 엔진: ${data.model || "Gemini 2.5 Flash"} · 소요 시간: ${data.elapsed_seconds || "5.2"}초 · 맞춤 생성 완료`;

        // marked.js 파싱
        if (window.marked) {
            planOutput.innerHTML = window.marked.parse(data.plan);
        } else {
            planOutput.textContent = data.plan;
        }

        resultWrapper.style.display = "block";
        resultWrapper.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    /**
     * 클립보드 복사 기능
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
            alert("클립보드 복사에 실패했습니다. 마크다운 내용을 직접 선택해 복사해 주세요.");
        }
    });

    /**
     * .md 파일 다운로드 기능
     */
    downloadBtn.addEventListener("click", () => {
        if (!currentPlanMarkdown) return;

        const dest = destinationInput.value.trim() || "여행계획";
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
});
