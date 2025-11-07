
        // Game State
        let gameState = {
            year: 2025,
            season: 0, // 0: 봄, 1: 여름, 2: 가을, 3: 겨울
            population: 52000000,
            gdp: 380,
            gdpGrowth: 2.1,
            unemployment: 4.1,
            employment: 95.9,
            inflation: 2.8,
            debt: 240,
            debtRatio: 63.2,
            happiness: 68,
            creditRating: 'A-',
            approvalRating: 52,
            exports: 85,
            imports: 78,
            tradeBalance: 7,
            exchangeRate: 1320,
            forexReserve: 420,
            birthRate: 0.81,
            populationGrowth: 0.2,
            
            policies: {
                taxRate: 22,
                govSpending: 450,
                minWage: 2800,
                interestRate: 2.5,
                educationBudget: 4.5,
                rdInvestment: 2.8,
                infrastructure: 5.2,
                smeSupport: 150,
                unemploymentBenefit: 60,
                pensionRate: 9,
                healthCoverage: 85,
                basicLiving: 120,
                tariffRate: 8,
                exportPromotion: 100,
                foreignInvestment: 5,
                industrialComplex: 50,
                carbonTax: 15,
                renewableEnergy: 180,
                regulationLevel: '보통',
                birthIncentive: 30,
                immigration: '제한적',
                housingPolicy: '혼합형'
            },
            
            achievements: {
                economicMiracle: false,
                welfareState: false,
                tradePower: false,
                greenNation: false
            },
            
            consecutiveGrowthYears: 0,
            lowApprovalYears: 0,
            isAutoMode: false,
            autoInterval: null,
            gameEnded: false,
            
            newsHistory: []
        };
        
        const seasons = ['봄', '여름', '가을', '겨울'];
        
        const events = {
            economic: [
                {
                    name: '글로벌 금융위기',
                    probability: 0.03,
                    effects: { gdp: -12, unemployment: 3.5, debt: 50 },
                    description: '세계적인 금융 불안으로 딸꾹 경제에도 충격이 전해졌습니다.'
                },
                {
                    name: '기술혁신 붐',
                    probability: 0.08,
                    effects: { gdp: 8, rdBoost: 1.5, exports: 15 },
                    description: '딸꾹 기업들의 기술혁신이 세계적인 주목을 받고 있습니다.'
                },
                {
                    name: '원자재 가격 급등',
                    probability: 0.12,
                    effects: { inflation: 2.1, importCost: 1.3 },
                    description: '국제 원자재 가격 상승으로 물가 상승 압력이 높아졌습니다.'
                }
            ],
            political: [
                {
                    name: '대규모 시위',
                    probability: 0.06,
                    effects: { approval: -15, happiness: -8 },
                    description: '경제 정책에 대한 국민들의 대규모 시위가 발생했습니다.'
                },
                {
                    name: '정치 스캔들',
                    probability: 0.04,
                    effects: { approval: -25, creditRating: -1 },
                    description: '정부 고위직의 스캔들로 국정 신뢰도가 크게 하락했습니다.'
                },
                {
                    name: '성공적인 외교',
                    probability: 0.07,
                    effects: { approval: 10, exports: 8 },
                    description: '딸꾹 대통령의 성공적인 외교로 무역 기회가 확대되었습니다.'
                }
            ],
            social: [
                {
                    name: '전염병 확산',
                    probability: 0.02,
                    effects: { gdp: -8, healthSpending: 50, happiness: -12 },
                    description: '새로운 전염병 확산으로 경제활동이 위축되었습니다.'
                },
                {
                    name: '문화 한류 확산',
                    probability: 0.09,
                    effects: { exports: 12, happiness: 6, approval: 8 },
                    description: '딸꾹 문화 콘텐츠가 세계적인 인기를 얻어 수출이 증가했습니다.'
                }
            ]
        };
        
        // Initialize game
        function initGame() {
            updateDisplay();
            addNews('딸꾹 공화국 경제 시뮬레이터를 시작합니다!');
        }
        
        // Update policy values
        function updatePolicy(policyName, value) {
            const camelCaseName = policyName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            
            if (policyName.includes('level') || policyName === 'immigration' || policyName === 'housing-policy') {
                gameState.policies[camelCaseName] = value;
            } else {
                gameState.policies[camelCaseName] = parseFloat(value);
            }
            
            document.getElementById(policyName + '-value').textContent = value;
            
            // Show immediate policy feedback
            showPolicyFeedback(policyName, value);
        }
        
        function showPolicyFeedback(policyName, value) {
            const feedbacks = {
                'tax-rate': {
                    high: '높은 소득세율로 정부 수입이 증가하지만 소비가 위축될 수 있습니다.',
                    low: '낮은 소득세율로 소비가 활성화되지만 정부 수입이 감소합니다.'
                },
                'gov-spending': {
                    high: '적극적인 정부지출로 경기 부양 효과를 기대할 수 있습니다.',
                    low: '긴축적인 정부지출로 재정건전성이 개선될 수 있습니다.'
                },
                'min-wage': {
                    high: '최저임금 인상으로 근로자 소득이 증가하지만 고용에 부담을 줄 수 있습니다.',
                    low: '낮은 최저임금으로 고용이 증가하지만 소득 불평등이 우려됩니다.'
                }
            };
            
            const feedback = feedbacks[policyName];
            if (feedback) {
                const isHigh = parseFloat(value) > 50; // 임계값은 정책별로 다를 수 있음
                const message = isHigh ? feedback.high : feedback.low;
                addNews(message, '정책 피드백');
            }
        }
        
        // Progress to next year
        function nextYear() {
            if (gameState.gameEnded) return;
            
            // Calculate economic effects
            calculateEconomicEffects();
            
            // Check for events
            checkRandomEvents();
            
            // Update year and season
            gameState.season = (gameState.season + 1) % 4;
            if (gameState.season === 0) {
                gameState.year++;
            }
            
            // Check achievements
            checkAchievements();
            
            // Check game end conditions
            checkGameEnd();
            
            // Update display
            updateDisplay();
            
            // Add year summary news
            if (gameState.season === 0) {
                addNews(`${gameState.year - 1}년이 마무리되었습니다. GDP 성장률: ${gameState.gdpGrowth.toFixed(1)}%, 실업률: ${gameState.unemployment.toFixed(1)}%`, '연간 요약');
            }
        }
        
        function calculateEconomicEffects() {
            const policies = gameState.policies;
            
            // GDP Growth calculation
            let gdpGrowthEffect = 0;
            
            // Tax effects
            gdpGrowthEffect += (25 - policies.taxRate) * 0.1; // Lower tax = higher growth
            
            // Government spending effects
            gdpGrowthEffect += (policies.govSpending - 400) * 0.01;
            
            // Investment effects
            gdpGrowthEffect += policies.educationBudget * 0.3;
            gdpGrowthEffect += policies.rdInvestment * 0.5;
            gdpGrowthEffect += policies.infrastructure * 0.2;
            
            // Trade effects
            gdpGrowthEffect += (10 - policies.tariffRate) * 0.1;
            gdpGrowthEffect += policies.exportPromotion * 0.02;
            
            // Apply some randomness
            gdpGrowthEffect += (Math.random() - 0.5) * 2;
            
            gameState.gdpGrowth = Math.max(-15, Math.min(15, gdpGrowthEffect));
            
            // Update GDP
            gameState.gdp *= (1 + gameState.gdpGrowth / 100);
            
            // Unemployment calculation
            let unemploymentChange = 0;
            unemploymentChange -= gameState.gdpGrowth * 0.3; // Okun's law approximation
            unemploymentChange -= (policies.minWage - 2500) * 0.001;
            unemploymentChange -= policies.smeSupport * 0.01;
            unemploymentChange += (policies.interestRate - 2) * 0.5;
            
            gameState.unemployment = Math.max(1, Math.min(25, gameState.unemployment + unemploymentChange));
            gameState.employment = 100 - gameState.unemployment;
            
            // Inflation calculation
            let inflationChange = 0;
            inflationChange += policies.govSpending * 0.005;
            inflationChange += (policies.minWage - 2500) * 0.001;
            inflationChange -= (policies.interestRate - 2) * 0.5;
            inflationChange += policies.tariffRate * 0.1;
            
            gameState.inflation = Math.max(-2, Math.min(15, gameState.inflation + inflationChange));
            
            // Debt calculation
            let debtChange = policies.govSpending - policies.taxRate * 15; // Simplified budget balance
            debtChange += policies.educationBudget * gameState.gdp * 0.01;
            debtChange += policies.rdInvestment * gameState.gdp * 0.01;
            debtChange += policies.infrastructure * gameState.gdp * 0.01;
            
            gameState.debt = Math.max(0, gameState.debt + debtChange);
            gameState.debtRatio = (gameState.debt / gameState.gdp) * 100;
            
            // Happiness calculation
            let happinessChange = 0;
            happinessChange -= gameState.unemployment * 0.5;
            happinessChange += policies.healthCoverage * 0.1;
            happinessChange += policies.unemploymentBenefit * 0.1;
            happinessChange += policies.basicLiving * 0.02;
            happinessChange -= Math.max(0, gameState.inflation - 3) * 0.5;
            
            gameState.happiness = Math.max(0, Math.min(100, gameState.happiness + happinessChange));
            
            // Approval rating calculation
            let approvalChange = 0;
            approvalChange += gameState.gdpGrowth * 2;
            approvalChange -= gameState.unemployment;
            approvalChange -= Math.max(0, gameState.inflation - 2) * 2;
            approvalChange += (gameState.happiness - 70) * 0.2;
            
            gameState.approvalRating = Math.max(5, Math.min(95, gameState.approvalRating + approvalChange));
            
            // Trade balance
            let exportChange = policies.exportPromotion * 0.5 + policies.foreignInvestment * 2;
            let importChange = policies.tariffRate * -0.5 + gameState.gdpGrowth * 0.5;
            
            gameState.exports = Math.max(0, gameState.exports + exportChange);
            gameState.imports = Math.max(0, gameState.imports + importChange);
            gameState.tradeBalance = gameState.exports - gameState.imports;
            
            // Birth rate
            let birthRateChange = policies.birthIncentive * 0.002;
            if (policies.immigration === '개방적') birthRateChange += 0.05;
            if (policies.immigration === '폐쇄적') birthRateChange -= 0.02;
            
            gameState.birthRate = Math.max(0.3, Math.min(3.0, gameState.birthRate + birthRateChange));
            
            // Update credit rating
            updateCreditRating();
            
            // Track consecutive growth years
            if (gameState.gdpGrowth >= 5) {
                gameState.consecutiveGrowthYears++;
            } else {
                gameState.consecutiveGrowthYears = 0;
            }
            
            // Track low approval years
            if (gameState.approvalRating < 20) {
                gameState.lowApprovalYears++;
            } else {
                gameState.lowApprovalYears = 0;
            }
        }
        
        function updateCreditRating() {
            const ratings = ['D', 'C', 'B-', 'B', 'B+', 'BB-', 'BB', 'BB+', 'BBB-', 'BBB', 'BBB+', 'A-', 'A', 'A+', 'AA-', 'AA', 'AA+', 'AAA'];
            
            let ratingScore = 0;
            
            // GDP growth factor
            ratingScore += gameState.gdpGrowth * 2;
            
            // Debt ratio factor
            ratingScore += Math.max(0, 100 - gameState.debtRatio);
            
            // Unemployment factor
            ratingScore += Math.max(0, 20 - gameState.unemployment) * 2;
            
            // Inflation factor
            ratingScore += Math.max(0, 5 - Math.abs(gameState.inflation - 2)) * 5;
            
            // Approval rating factor
            ratingScore += gameState.approvalRating * 0.5;
            
            const ratingIndex = Math.max(0, Math.min(ratings.length - 1, Math.floor(ratingScore / 10)));
            gameState.creditRating = ratings[ratingIndex];
        }
        
        function checkRandomEvents() {
            const allEvents = [...events.economic, ...events.political, ...events.social];
            
            for (const event of allEvents) {
                if (Math.random() < event.probability) {
                    applyEvent(event);
                    showEventModal(event);
                    break; // Only one event per turn
                }
            }
        }
        
        function applyEvent(event) {
            const effects = event.effects;
            
            if (effects.gdp) gameState.gdp += effects.gdp;
            if (effects.unemployment) gameState.unemployment += effects.unemployment;
            if (effects.debt) gameState.debt += effects.debt;
            if (effects.approval) gameState.approvalRating = Math.max(5, Math.min(95, gameState.approvalRating + effects.approval));
            if (effects.happiness) gameState.happiness = Math.max(0, Math.min(100, gameState.happiness + effects.happiness));
            if (effects.exports) gameState.exports += effects.exports;
            if (effects.inflation) gameState.inflation += effects.inflation;
            
            addNews(event.description, '특별 이벤트');
        }
        
        function showEventModal(event) {
            document.getElementById('event-title').textContent = event.name;
            document.getElementById('event-description').textContent = event.description;
            
            let effectsText = '영향: ';
            const effects = event.effects;
            const effectsList = [];
            
            if (effects.gdp) effectsList.push(`GDP ${effects.gdp > 0 ? '+' : ''}${effects.gdp}조원`);
            if (effects.unemployment) effectsList.push(`실업률 ${effects.unemployment > 0 ? '+' : ''}${effects.unemployment}%`);
            if (effects.approval) effectsList.push(`지지율 ${effects.approval > 0 ? '+' : ''}${effects.approval}%`);
            if (effects.happiness) effectsList.push(`행복도 ${effects.happiness > 0 ? '+' : ''}${effects.happiness}점`);
            
            document.getElementById('event-effects').textContent = effectsText + effectsList.join(', ');
            document.getElementById('event-modal').classList.add('active');
        }
        
        function checkAchievements() {
            // Economic Miracle: 5 consecutive years of 5%+ growth
            if (gameState.consecutiveGrowthYears >= 5 && !gameState.achievements.economicMiracle) {
                gameState.achievements.economicMiracle = true;
                unlockAchievement('economic-miracle', '경제 기적 달성!');
                gameState.gdp *= 1.1; // 10% GDP boost
            }
            
            // Welfare State: Happiness > 90
            if (gameState.happiness > 90 && !gameState.achievements.welfareState) {
                gameState.achievements.welfareState = true;
                unlockAchievement('welfare-state', '복지국가 달성!');
            }
            
            // Trade Power: Exports > 500
            if (gameState.exports > 500 && !gameState.achievements.tradePower) {
                gameState.achievements.tradePower = true;
                unlockAchievement('trade-power', '무역강국 달성!');
            }
            
            // Green Nation: High environmental policies
            if (gameState.policies.carbonTax > 30 && gameState.policies.renewableEnergy > 250 && 
                gameState.policies.regulationLevel === '높음' && !gameState.achievements.greenNation) {
                gameState.achievements.greenNation = true;
                unlockAchievement('green-nation', '환경 선진국 달성!');
            }
        }
        
        function unlockAchievement(achievementId, message) {
            const achievement = document.querySelector(`[data-achievement="${achievementId}"]`);
            if (achievement) {
                achievement.classList.add('unlocked');
            }
            addNews(message, '업적 달성');
        }
        
        function checkGameEnd() {
            // Economic Collapse
            if (gameState.unemployment > 20 || gameState.debtRatio > 150 || gameState.approvalRating < 15) {
                endGame('collapse', '경제 붕괴', '딸꾹 공화국의 경제가 붕괴되었습니다. 높은 실업률과 부채, 낮은 지지율로 인해 정부가 무너졌습니다.');
                return;
            }
            
            // Dictatorship
            if (gameState.lowApprovalYears >= 3) {
                endGame('dictatorship', '독재국가', '장기간의 낮은 지지율로 인해 쿠데타가 발생했습니다. 딸꾹 공화국은 독재 체제로 전환되었습니다.');
                return;
            }
            
            // Developed Nation
            if (gameState.gdp > 1000 && gameState.happiness > 85 && gameState.creditRating.includes('AA')) {
                endGame('developed', '선진국 달성', '축하합니다! 딸꾹 공화국이 선진국 대열에 합류했습니다.');
                return;
            }
            
            // Superpower
            if (gameState.gdp > 1500 && gameState.happiness > 90 && gameState.creditRating === 'AAA' && 
                gameState.exports > 800 && gameState.unemployment < 3) {
                endGame('superpower', '세계 초강대국', '놀라운 성과입니다! 딸꾹 공화국이 세계 초강대국이 되었습니다.');
                return;
            }
        }
        
        function endGame(type, title, description) {
            gameState.gameEnded = true;
            if (gameState.autoInterval) {
                clearInterval(gameState.autoInterval);
                gameState.isAutoMode = false;
                document.getElementById('auto-btn').textContent = '자동 진행 시작';
            }
            
            document.getElementById('gameover-title').textContent = title;
            document.getElementById('gameover-description').textContent = description;
            
            const finalStats = `
                <div><strong>최종 통계:</strong></div>
                <div>• GDP: ${gameState.gdp.toFixed(1)}조원</div>
                <div>• GDP 성장률: ${gameState.gdpGrowth.toFixed(1)}%</div>
                <div>• 실업률: ${gameState.unemployment.toFixed(1)}%</div>
                <div>• 국민 행복도: ${gameState.happiness.toFixed(1)}점</div>
                <div>• 신용등급: ${gameState.creditRating}</div>
                <div>• 대통령 지지율: ${gameState.approvalRating.toFixed(1)}%</div>
                <div>• 최종 연도: ${gameState.year}년</div>
            `;
            
            document.getElementById('final-stats').innerHTML = finalStats;
            document.getElementById('gameover-modal').classList.add('active');
            
            addNews(`게임 종료: ${title}`, '게임 결과');
        }
        
        function toggleAutoMode() {
            if (gameState.gameEnded) return;
            
            if (gameState.isAutoMode) {
                clearInterval(gameState.autoInterval);
                gameState.isAutoMode = false;
                document.getElementById('auto-btn').textContent = '자동 진행 시작';
            } else {
                gameState.isAutoMode = true;
                document.getElementById('auto-btn').textContent = '자동 진행 중지';
                gameState.autoInterval = setInterval(() => {
                    nextYear();
                }, 2000); // 2 seconds per year
            }
        }
        
        function resetGame() {
            // Reset game state to initial values
            gameState = {
                year: 2025,
                season: 0,
                population: 52000000,
                gdp: 380,
                gdpGrowth: 2.1,
                unemployment: 4.1,
                employment: 95.9,
                inflation: 2.8,
                debt: 240,
                debtRatio: 63.2,
                happiness: 68,
                creditRating: 'A-',
                approvalRating: 52,
                exports: 85,
                imports: 78,
                tradeBalance: 7,
                exchangeRate: 1320,
                forexReserve: 420,
                birthRate: 0.81,
                populationGrowth: 0.2,
                
                policies: {
                    taxRate: 22,
                    govSpending: 450,
                    minWage: 2800,
                    interestRate: 2.5,
                    educationBudget: 4.5,
                    rdInvestment: 2.8,
                    infrastructure: 5.2,
                    smeSupport: 150,
                    unemploymentBenefit: 60,
                    pensionRate: 9,
                    healthCoverage: 85,
                    basicLiving: 120,
                    tariffRate: 8,
                    exportPromotion: 100,
                    foreignInvestment: 5,
                    industrialComplex: 50,
                    carbonTax: 15,
                    renewableEnergy: 180,
                    regulationLevel: '보통',
                    birthIncentive: 30,
                    immigration: '제한적',
                    housingPolicy: '혼합형'
                },
                
                achievements: {
                    economicMiracle: false,
                    welfareState: false,
                    tradePower: false,
                    greenNation: false
                },
                
                consecutiveGrowthYears: 0,
                lowApprovalYears: 0,
                isAutoMode: false,
                autoInterval: null,
                gameEnded: false,
                
                newsHistory: []
            };
            
            // Reset UI sliders
            Object.keys(gameState.policies).forEach(key => {
                const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                const element = document.getElementById(kebabKey);
                if (element) {
                    if (element.type === 'range') {
                        element.value = gameState.policies[key];
                    } else if (element.tagName === 'SELECT') {
                        element.value = gameState.policies[key];
                    }
                    
                    const valueElement = document.getElementById(kebabKey + '-value');
                    if (valueElement) {
                        valueElement.textContent = gameState.policies[key];
                    }
                }
            });
            
            // Reset achievements
            document.querySelectorAll('.achievement').forEach(achievement => {
                achievement.classList.remove('unlocked');
            });
            
            // Clear news
            gameState.newsHistory = [];
            document.getElementById('news-list').innerHTML = `
                <div class="news-item">
                    <div class="news-date">${gameState.year}년 1월</div>
                    <div>딸꾹 공화국, 새로운 경제 정책으로 ${gameState.year}년을 시작합니다. 국민들의 기대가 높아지고 있습니다.</div>
                </div>
            `;
            
            // Close modals
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
            
            if (gameState.autoInterval) {
                clearInterval(gameState.autoInterval);
                document.getElementById('auto-btn').textContent = '자동 진행 시작';
            }
            
            updateDisplay();
            addNews('새로운 게임을 시작했습니다!');
        }
        
        function showAchievements() {
            document.getElementById('achievements-modal').classList.add('active');
        }
        
        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
        }
        
        function updateDisplay() {
            // Update main indicators
            document.getElementById('current-year').textContent = gameState.year;
            document.getElementById('season').textContent = seasons[gameState.season];
            document.getElementById('gdp').textContent = gameState.gdp.toFixed(1);
            document.getElementById('gdp-growth').textContent = (gameState.gdpGrowth >= 0 ? '+' : '') + gameState.gdpGrowth.toFixed(1);
            document.getElementById('unemployment').textContent = gameState.unemployment.toFixed(1);
            document.getElementById('inflation').textContent = gameState.inflation.toFixed(1);
            document.getElementById('debt-ratio').textContent = gameState.debtRatio.toFixed(1);
            document.getElementById('happiness').textContent = gameState.happiness.toFixed(1);
            document.getElementById('credit-rating').textContent = gameState.creditRating;
            document.getElementById('approval').textContent = gameState.approvalRating.toFixed(1);
            document.getElementById('trade-balance').textContent = (gameState.tradeBalance >= 0 ? '+' : '') + gameState.tradeBalance.toFixed(1);
            document.getElementById('birth-rate').textContent = gameState.birthRate.toFixed(2);
            
            // Update economic status
            const economicStatus = document.getElementById('economic-status');
            let status = '보통';
            let statusClass = 'status-indicator--info';
            
            if (gameState.gdpGrowth > 5 && gameState.unemployment < 4 && gameState.happiness > 80) {
                status = '우수';
                statusClass = 'status-indicator--success';
            } else if (gameState.gdpGrowth > 3 && gameState.unemployment < 6 && gameState.happiness > 65) {
                status = '양호';
                statusClass = 'status-indicator--success';
            } else if (gameState.gdpGrowth < 0 || gameState.unemployment > 10 || gameState.happiness < 50) {
                status = '불안';
                statusClass = 'status-indicator--warning';
            } else if (gameState.gdpGrowth < -5 || gameState.unemployment > 15 || gameState.happiness < 30) {
                status = '위험';
                statusClass = 'status-indicator--danger';
            }
            
            economicStatus.textContent = status;
            economicStatus.className = `status-indicator ${statusClass}`;
            
            // Update credit rating color
            const creditElement = document.getElementById('credit-rating');
            creditElement.className = 'indicator-value credit-rating';
            
            if (gameState.creditRating.includes('AAA')) {
                creditElement.classList.add('credit-rating--aaa');
            } else if (gameState.creditRating.includes('AA')) {
                creditElement.classList.add('credit-rating--aa');
            } else if (gameState.creditRating.includes('A')) {
                creditElement.classList.add('credit-rating--a');
            } else if (gameState.creditRating.includes('BBB')) {
                creditElement.classList.add('credit-rating--bbb');
            } else if (gameState.creditRating.includes('BB')) {
                creditElement.classList.add('credit-rating--bb');
            } else if (gameState.creditRating.includes('B')) {
                creditElement.classList.add('credit-rating--b');
            } else if (gameState.creditRating.includes('C')) {
                creditElement.classList.add('credit-rating--c');
            } else {
                creditElement.classList.add('credit-rating--d');
            }
        }
        
        function addNews(message, category = '뉴스') {
            const newsItem = {
                date: `${gameState.year}년 ${gameState.season + 1}분기`,
                message: message,
                category: category
            };
            
            gameState.newsHistory.unshift(newsItem);
            
            // Keep only last 10 news items
            if (gameState.newsHistory.length > 10) {
                gameState.newsHistory = gameState.newsHistory.slice(0, 10);
            }
            
            updateNewsDisplay();
        }
        
        function updateNewsDisplay() {
            const newsList = document.getElementById('news-list');
            newsList.innerHTML = gameState.newsHistory.map(news => `
                <div class="news-item">
                    <div class="news-date">${news.date} - ${news.category}</div>
                    <div>${news.message}</div>
                </div>
            `).join('');
        }
        
        // Initialize the game when page loads
        document.addEventListener('DOMContentLoaded', initGame);
        
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });
    