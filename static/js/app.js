/**
 * AI Travel Planner - Modern Frontend Application Logic
 */

document.addEventListener("DOMContentLoaded", () => {
    // 폼 및 입력 요소
    const travelForm = document.getElementById("travelForm");
    const submitBtn = document.getElementById("submitBtn");
    const modeCards = document.querySelectorAll(".style-card");
    const presetButtons = document.querySelectorAll(".preset-chip");

    // 상태 영역 요소
    const emptyState = document.getElementById("emptyState");
    const loadingState = document.getElementById("loadingState");
    const loadingTip = document.getElementById("loadingTip");
    const errorAlert = document.getElementById("errorAlert");
    const errorMessage = document.getElementById("errorMessage");
    const resultWrapper = document.getElementById("resultWrapper");
    const resultMeta = document.getElementById("resultMeta");
    const planOutput = document.getElementById("planOutput");
    const actionButtons = document.getElementById("actionButtons");
    const copyBtn = document.getElementById("copyBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const resultStatusDesc = document.getElementById("resultStatusDesc");

    // 상태 변수
    let currentPlanMarkdown = "";
    let currentDestination = "여행";
    let loadingInterval = null;

    // 프리셋 데이터 사전
    const presets = {
        osaka: {
            destination: "일본 오사카 & 교토",
            duration: "3박 4일",
            budget: "1인당 100만 원",
            interests: "도톤보리 미식 투어, 교토 청수사/아라시야마, 우메다 스카이빌딩 야경, 쇼핑",
            companions: "친구와 둘이서",
            transportation: "대중교통 (지하철, 한큐 패스)",
            accommodation: "난바역 근처 가성비 비즈니스 호텔",
            mode: "A"
        },
        jeju: {
            destination: "제주도 서귀포 & 애월",
            duration: "2박 3일",
            budget: "2인 총 120만 원",
            interests: "오션뷰 감성 카페, 애월 해안도로 산책, 흑돼지/갈치조림 맛집, 사려니숲길 힐링",
            companions: "연인과 함께",
            transportation: "렌터카 (전기차)",
            accommodation: "서귀포 바다 전망 감성 숙소",
            mode: "B"
        },
        paris: {
            destination: "프랑스 파리",
            duration: "5박 6일",
            budget: "1인당 300만 원",
            interests: "루브르 & 오르세 미술관, 에펠탑 야경, 센강 바토무슈, 몽마르트르 골목 카페",
            companions: "혼자 떠나는 여행",
            transportation: "대중교통 (파리 메트로) 및 도보",
            accommodation: "시내 중심 치안 좋은 3성급 부티크 호텔",
            mode: "B"
        },
        bangkok: {
            destination: "태국 방콕",
            duration: "4박 5일",
            budget: "1인당 90만 원",
            interests: "쩟페어 야시장 먹거리, 왓아룬 사원 뷰 루프탑 바, 1일 1마사지, 아이콘시암 쇼핑",
            companions: "친구 2명",
            transportation: "대중교통 (BTS/MRT) 및 그랩(Grab)",
            accommodation: "차오프라야 강변 가성비 4성급 호텔",
            mode: "A"
        }
    };

    // 로딩 시 순환 문구
    const loadingTips = [
        "선택하신 도시의 최적 이동 동선과 환승 팁을 계산하고 있습니다...",
        "가성비 높은 현지인 추천 식당과 인기 명소를 선별하고 있습니다...",
        "일자별 세밀한 시간표와 예상 경비 분석표를 작성 중입니다...",
        "놓치기 쉬운 필수 준비물 체크리스트와 안전 수칙을 정리하고 있습니다..."
    ];

    /**
     * 스타일 모드(Prompt A/B) 선택 UI 전환
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
     * 프리셋 칩 클릭 시 입력값 자동 채우기
     */
    presetButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const key = btn.getAttribute("data-preset");
            const data = presets[key];
            if (!data) return;

            document.getElementById("destination").value = data.destination;
            document.getElementById("duration").value = data.duration;
            document.getElementById("budget").value = data.budget;
            document.getElementById("interests").value = data.interests;
            document.getElementById("companions").value = data.companions;
            document.getElementById("transportation").value = data.transportation;
            document.getElementById("accommodation").value = data.accommodation;
            setMode(data.mode);

            // 시각적 강조 효과
            btn.style.transform = "scale(0.95)";
            setTimeout(() => {
                btn.style.transform = "";
            }, 150);

            hideError();
        });
    });

    /**
     * 오류 배너 표시
     */
    function showError(msg) {
        errorMessage.textContent = msg;
        errorAlert.style.display = "block";
        errorAlert.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    /**
     * 오류 배너 숨김
     */
    function hideError() {
        errorAlert.style.display = "none";
        errorMessage.textContent = "";
    }

    /**
     * 로딩 상태 시작
     */
    function startLoading() {
        hideError();
        emptyState.style.display = "none";
        resultWrapper.style.display = "none";
        actionButtons.style.display = "none";
        loadingState.style.display = "block";
        if (resultStatusDesc) resultStatusDesc.textContent = "AI가 맞춤형 여행 일정을 설계하는 중입니다...";

        submitBtn.disabled = true;
        submitBtn.querySelector(".btn-text").textContent = "AI 여행 일정 설계 중...";

        let tipIdx = 0;
        loadingTip.textContent = loadingTips[0];
        loadingInterval = setInterval(() => {
            tipIdx = (tipIdx + 1) % loadingTips.length;
            loadingTip.textContent = loadingTips[tipIdx];
        }, 2600);
    }

    /**
     * 로딩 상태 종료
     */
    function stopLoading() {
        if (loadingInterval) {
            clearInterval(loadingInterval);
            loadingInterval = null;
        }
        loadingState.style.display = "none";
        submitBtn.disabled = false;
        submitBtn.querySelector(".btn-text").textContent = "AI 맞춤 여행 일정표 생성하기";
    }

    /**
     * 폼 제출 처리
     */
    travelForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // 1. 값 수집
        const destination = document.getElementById("destination").value.trim();
        const duration = document.getElementById("duration").value.trim();
        const budget = document.getElementById("budget").value.trim();
        const interests = document.getElementById("interests").value.trim();
        const companions = document.getElementById("companions").value.trim();
        const transportation = document.getElementById("transportation").value.trim();
        const accommodation = document.getElementById("accommodation").value.trim();
        const modeInput = document.querySelector('input[name="mode"]:checked');
        const mode = modeInput ? modeInput.value : "A";

        // 2. 유효성 검사
        if (!destination) {
            showError("여행지를 입력해 주세요 (예: 오사카, 제주도)");
            document.getElementById("destination").focus();
            return;
        }
        if (!duration) {
            showError("여행 기간을 입력해 주세요 (예: 3박 4일)");
            document.getElementById("duration").focus();
            return;
        }
        if (!budget) {
            showError("예산 정보를 입력해 주세요 (예: 1인 100만 원)");
            document.getElementById("budget").focus();
            return;
        }
        if (!interests) {
            showError("주요 관심사나 여행 테마를 입력해 주세요 (예: 맛집 탐방, 사진 스팟)");
            document.getElementById("interests").focus();
            return;
        }
        if (!companions) {
            showError("동행자 정보를 입력해 주세요 (예: 친구 2명, 부모님 모시고)");
            document.getElementById("companions").focus();
            return;
        }
        if (!transportation) {
            showError("이동수단을 입력해 주세요 (예: 대중교통, 렌터카)");
            document.getElementById("transportation").focus();
            return;
        }
        if (!accommodation) {
            showError("숙소 선호 유형을 입력해 주세요 (예: 역세권 호텔, 료칸)");
            document.getElementById("accommodation").focus();
            return;
        }

        currentDestination = destination;
        const requestPayload = {
            destination,
            duration,
            budget,
            interests,
            companions,
            transportation,
            accommodation,
            mode
        };

        // 3. 로딩 개시
        startLoading();

        // 4. API 요청
        try {
            const response = await fetch("/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestPayload)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                const err = data.error || `서버 오류 (상태 코드: ${response.status})`;
                showError(err);
                stopLoading();
                emptyState.style.display = "block";
                return;
            }

            // 5. 마크다운 렌더링
            currentPlanMarkdown = data.plan;

            if (typeof marked !== "undefined" && marked.parse) {
                planOutput.innerHTML = marked.parse(currentPlanMarkdown);
            } else {
                planOutput.textContent = currentPlanMarkdown;
            }

            // 메타 정보 표시
            const time = data.elapsed_seconds ? `${data.elapsed_seconds}초` : "완료";
            const model = data.model || "Gemini";
            resultMeta.textContent = `⚡ 소요 시간: ${time}  |  🤖 생성 모델: ${model}  |  📍 ${destination}`;

            if (resultStatusDesc) resultStatusDesc.textContent = "AI가 작성한 여행 계획표입니다. 자유롭게 복사하거나 다운로드하세요.";

            // UI 표시 전환
            stopLoading();
            resultWrapper.style.display = "block";
            actionButtons.style.display = "flex";

            // 부드러운 스크롤
            resultWrapper.scrollIntoView({ behavior: "smooth", block: "start" });

        } catch (netErr) {
            console.error("통신 장애:", netErr);
            showError("서버와의 통신에 실패했습니다. Flask 서버가 켜져 있는지 확인해 주세요.");
            stopLoading();
            emptyState.style.display = "block";
        }
    });

    /**
     * 일정 복사 기능
     */
    copyBtn.addEventListener("click", async () => {
        if (!currentPlanMarkdown) return;

        try {
            await navigator.clipboard.writeText(currentPlanMarkdown);
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span class="tool-icon">✅</span><span class="tool-text">복사 완료!</span>';
            copyBtn.style.background = "#dcfce7";
            copyBtn.style.borderColor = "#86efac";
            copyBtn.disabled = true;

            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.style.background = "";
                copyBtn.style.borderColor = "";
                copyBtn.disabled = false;
            }, 2000);
        } catch (err) {
            console.error("복사 오류:", err);
            alert("클립보드 복사에 실패했습니다.");
        }
    });

    /**
     * 마크다운(.md) 파일 다운로드 기능
     */
    downloadBtn.addEventListener("click", () => {
        if (!currentPlanMarkdown) return;

        const blob = new Blob([currentPlanMarkdown], { type: "text/markdown;charset=utf-8" });
        const downloadUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        const safeName = currentDestination.replace(/[^a-zA-Z0-9가-힣]/g, "_");

        anchor.href = downloadUrl;
        anchor.download = `${safeName}_AI여행일정표.md`;
        document.body.appendChild(anchor);
        anchor.click();

        document.body.removeChild(anchor);
        URL.revokeObjectURL(downloadUrl);
    });
});
