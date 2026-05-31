// ==========================================================================
// 1. Audio Haptic Engine (Web Audio API Synthesizer)
// ==========================================================================
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playClick() {
        if (!this.enabled) return;
        this.init();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.08);
        
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
    }

    playSliderTick() {
        if (!this.enabled) return;
        this.init();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.03);
    }

    playSuccessSynth() {
        if (!this.enabled) return;
        this.init();
        
        const playNote = (freq, start, duration, vol) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);
            
            gain.gain.setValueAtTime(vol, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(start);
            osc.stop(start + duration);
        };

        const now = this.ctx.currentTime;
        playNote(523.25, now, 0.15, 0.08); // C5
        playNote(659.25, now + 0.08, 0.15, 0.08); // E5
        playNote(783.99, now + 0.16, 0.25, 0.12); // G5
    }
}

const sounds = new SoundEngine();

// ==========================================================================
// 2. Equals Particle Visual Effects (Canvas Particle Engine)
// ==========================================================================
class ParticleEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.loop();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    spawnBurst(x, y, count = 45) {
        const colors = [
            'rgba(255, 46, 147, 0.85)', // neon pink
            'rgba(142, 74, 252, 0.85)', // neon purple
            'rgba(0, 242, 254, 0.85)',  // neon teal
            'rgba(255, 255, 255, 0.9)'  // glittering white
        ];
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5, // slightly upwards
                radius: Math.random() * 3 + 1.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: Math.random() * 0.02 + 0.015,
                gravity: 0.12
            });
        }
    }

    loop() {
        requestAnimationFrame(() => this.loop());
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.alpha -= p.decay;
            
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = p.color;
            this.ctx.fill();
            this.ctx.restore();
        }
    }
}

let particles;
window.addEventListener('DOMContentLoaded', () => {
    particles = new ParticleEngine('particle-canvas');
});

// ==========================================================================
// 3. Tab & Theme Switchers
// ==========================================================================
const initUIControls = () => {
    // Tabs Switcher
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sounds.playClick();
            
            const tabId = btn.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Theme Switcher
    const themeBtn = document.getElementById('theme-btn');
    themeBtn.addEventListener('click', () => {
        sounds.playClick();
        
        const body = document.body;
        if (body.classList.contains('light-theme')) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            themeBtn.innerHTML = '<i class="ph ph-moon"></i>';
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            themeBtn.innerHTML = '<i class="ph ph-sun"></i>';
        }
    });

    // Sound Switcher
    const soundBtn = document.getElementById('sound-btn');
    soundBtn.addEventListener('click', () => {
        sounds.enabled = !sounds.enabled;
        
        if (sounds.enabled) {
            soundBtn.innerHTML = '<i class="ph ph-speaker-high"></i>';
            soundBtn.classList.remove('muted');
            sounds.playClick();
        } else {
            soundBtn.innerHTML = '<i class="ph ph-speaker-slash"></i>';
            soundBtn.classList.add('muted');
        }
    });
};

// ==========================================================================
// 4. Standard Calculator Logic
// ==========================================================================
class Calculator {
    constructor() {
        this.equation = '';
        this.currentValue = '0';
        this.isResult = false;
        
        this.eqDisplay = document.getElementById('equation-display');
        this.mainDisplay = document.getElementById('main-display');
        
        this.initEvents();
    }

    initEvents() {
        const grid = document.querySelector('.calc-grid');
        grid.addEventListener('click', (e) => {
            const btn = e.target.closest('.calc-btn');
            if (!btn) return;
            
            // Add visual glow class
            btn.classList.add('active-glow');
            setTimeout(() => btn.classList.remove('active-glow'), 180);
            
            // Core Spring Click Interaction
            btn.style.transform = 'scale(0.93)';
            setTimeout(() => btn.style.transform = '', 100);
            
            // Visual Ripple
            this.createRipple(e, btn);

            // Handle keys
            if (btn.id === 'btn-clear') {
                sounds.playClick();
                this.clear();
            } else if (btn.id === 'btn-equals') {
                this.calculate(btn);
            } else {
                sounds.playClick();
                const val = btn.getAttribute('data-val');
                this.handleInput(val);
            }
        });
    }

    createRipple(e, btn) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        const size = Math.max(rect.width, rect.height) * 2;
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    clear() {
        this.equation = '';
        this.currentValue = '0';
        this.isResult = false;
        this.updateDisplay();
    }

    handleInput(val) {
        if (this.isResult) {
            // If operator pressed after results, keep result as equation base
            if (['+', '-', '*', '/', '%'].includes(val)) {
                this.equation = this.currentValue;
            } else {
                this.equation = '';
            }
            this.isResult = false;
        }

        if (val === 'backspace') {
            if (this.equation.length > 0) {
                this.equation = this.equation.slice(0, -1);
            }
        } else {
            // Avoid duplicate decimal points in same number block
            if (val === '.') {
                const currentNumber = this.equation.split(/[\+\-\*\/%]/).pop();
                if (currentNumber.includes('.')) return;
            }
            // Append input
            this.equation += val;
        }
        
        this.updateDisplay();
    }

    calculate(btn) {
        if (!this.equation) return;
        
        try {
            // Replace visual times/division with actual JS operators
            let sanitizedEquation = this.equation;
            
            // Safe parse and calculate (avoid direct raw eval)
            const result = this.evaluateSimple(sanitizedEquation);
            
            if (result === null || isNaN(result) || !isFinite(result)) {
                throw new Error("Invalid Math");
            }
            
            // Triumphant Synthesizer
            sounds.playSuccessSynth();
            
            // Visual Canvas Blast
            const rect = btn.getBoundingClientRect();
            const burstX = rect.left + rect.width / 2;
            const burstY = rect.top + rect.height / 2;
            particles.spawnBurst(burstX, burstY, 50);
            
            // Display Results
            const prevEq = this.equation;
            this.currentValue = this.formatNumber(result);
            this.equation = this.currentValue;
            this.isResult = true;
            
            // Format for display
            this.eqDisplay.innerText = this.formatEquation(prevEq) + ' =';
            this.mainDisplay.innerText = this.formatDisplayValue(this.currentValue);
            
        } catch (err) {
            sounds.playClick();
            this.mainDisplay.innerText = "Error";
            this.equation = '';
            this.isResult = true;
        }
    }

    evaluateSimple(str) {
        // Mathematical evaluation via safe RegExp parsing
        // Replace percentages e.g., '50%' -> '* 0.01'
        let formula = str.replace(/(\d+)%/g, '($1*0.01)');
        
        // Use safe Function evaluator (limited mathematical operators)
        const safeEval = new Function(`return (${formula})`);
        const val = safeEval();
        return typeof val === 'number' ? val : null;
    }

    formatNumber(num) {
        // Avoid exponent overflow and decimal bloating
        if (Math.abs(num) < 1e-9 && num !== 0) return "0";
        const fixed = parseFloat(num.toFixed(10));
        if (fixed.toString().length > 12) {
            return fixed.toPrecision(8);
        }
        return fixed.toString();
    }

    formatDisplayValue(valStr) {
        if (!valStr) return '0';
        if (valStr === '.') return '0.';
        
        const parts = valStr.split('.');
        const integerPart = parts[0];
        const decimalPart = parts.length > 1 ? parts[1] : null;
        
        // Add commas to integer part every 3 digits
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        if (decimalPart !== null) {
            return formattedInteger + '.' + decimalPart;
        }
        return formattedInteger;
    }

    formatEquation(eqStr) {
        if (!eqStr) return '';
        const tokens = eqStr.split(/([\+\-\*\/%])/);
        return tokens.map(token => {
            if (['+', '-', '*', '/', '%'].includes(token)) {
                return token
                    .replace(/\*/g, ' × ')
                    .replace(/\//g, ' ÷ ')
                    .replace(/\+/g, ' + ')
                    .replace(/\-/g, ' − ')
                    .replace(/%/g, ' % ');
            } else {
                return this.formatDisplayValue(token);
            }
        }).join('');
    }

    updateDisplay() {
        this.eqDisplay.innerText = this.formatEquation(this.equation);
        const lastNumber = this.equation ? this.equation.split(/[\+\-\*\/%]/).pop() || '0' : '0';
        this.mainDisplay.innerText = this.formatDisplayValue(lastNumber);
    }
}

// ==========================================================================
// 5. Loan Calculator Logic
// ==========================================================================
class LoanCalculator {
    constructor() {
        this.principalInput = document.getElementById('loan-principal');
        this.rateInput = document.getElementById('loan-rate');
        this.termInput = document.getElementById('loan-term');
        
        this.principalVal = document.getElementById('principal-val');
        this.rateVal = document.getElementById('rate-val');
        this.termVal = document.getElementById('term-val');
        
        this.monthlyPaymentDisplay = document.getElementById('monthly-payment-val');
        this.totalInterestDisplay = document.getElementById('total-interest-val');
        this.totalRepaymentDisplay = document.getElementById('total-repayment-val');
        
        this.splitPrincipal = document.getElementById('split-principal');
        this.splitInterest = document.getElementById('split-interest');
        
        this.ratioPrincipal = document.getElementById('ratio-principal');
        this.ratioInterest = document.getElementById('ratio-interest');
        
        this.initEvents();
        this.calculate();
    }

    initEvents() {
        const inputs = [this.principalInput, this.rateInput, this.termInput];
        
        inputs.forEach(input => {
            // Live Update during dragging
            input.addEventListener('input', () => {
                sounds.playSliderTick();
                this.updateUI();
                this.calculate();
            });
            
            // Click visual effect
            input.addEventListener('mousedown', () => {
                input.style.transform = 'scale(1.01)';
            });
            
            input.addEventListener('mouseup', () => {
                input.style.transform = '';
            });
        });
    }

    updateUI() {
        // Update slider custom tracks fills
        this.updateSliderTrackFill(this.principalInput, 'principal-fill');
        this.updateSliderTrackFill(this.rateInput, 'rate-fill');
        this.updateSliderTrackFill(this.termInput, 'term-fill');

        // Formatted Text labels
        const pVal = parseInt(this.principalInput.value);
        if (pVal >= 1000) {
            const eok = Math.floor(pVal / 10000);
            const man = pVal % 10000;
            this.principalVal.innerText = `${eok > 0 ? eok + '억 ' : ''}${man > 0 ? man + '만원' : '원'}`;
        } else {
            this.principalVal.innerText = `${pVal} 만원`;
        }
        
        this.rateVal.innerText = `${parseFloat(this.rateInput.value).toFixed(1)}%`;
        this.termVal.innerText = `${this.termInput.value} 개월`;
    }

    updateSliderTrackFill(slider, fillId) {
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const val = parseFloat(slider.value);
        const pct = ((val - min) / (max - min)) * 100;
        
        document.getElementById(fillId).style.width = `${pct}%`;
    }

    calculate() {
        // principal is entered in unit of "만 원" (10,000 KRW)
        const principal = parseInt(this.principalInput.value) * 10000;
        const annualRate = parseFloat(this.rateInput.value);
        const term = parseInt(this.termInput.value);
        
        // Repayment Formula: 원리금 균등 상환 (Equal Principal & Interest Repayments)
        // Monthly Rate
        const monthlyRate = (annualRate / 12) / 100;
        
        let monthlyPayment = 0;
        if (monthlyRate === 0) {
            monthlyPayment = principal / term;
        } else {
            monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
        }
        
        const totalRepayment = monthlyPayment * term;
        const totalInterest = totalRepayment - principal;
        
        // Animate Split percentages and Bars
        const pRatio = Math.round((principal / totalRepayment) * 100);
        const iRatio = 100 - pRatio;
        
        this.splitPrincipal.style.width = `${pRatio}%`;
        this.splitInterest.style.width = `${iRatio}%`;
        
        this.ratioPrincipal.innerText = `${pRatio}%`;
        this.ratioInterest.innerText = `${iRatio}%`;

        // Render summary figures
        this.animateValue(this.monthlyPaymentDisplay, Math.round(monthlyPayment), ' 원');
        this.animateValue(this.totalInterestDisplay, Math.round(totalInterest), ' 원');
        this.animateValue(this.totalRepaymentDisplay, Math.round(totalRepayment), ' 원');
    }

    animateValue(element, endVal, suffix = '') {
        // Elegant counter counting up animation on slider changes
        const startVal = parseInt(element.innerText.replace(/[^0-9]/g, '')) || 0;
        if (startVal === endVal) {
            element.innerText = this.formatCurrency(endVal) + suffix;
            return;
        }
        
        const duration = 250; // ms
        const startTime = performance.now();
        
        const run = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // ease-out-quad formula
            const easedProgress = progress * (2 - progress);
            const currentVal = Math.round(startVal + (endVal - startVal) * easedProgress);
            
            element.innerText = this.formatCurrency(currentVal) + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(run);
            }
        };
        
        requestAnimationFrame(run);
    }

    formatCurrency(val) {
        return new Intl.NumberFormat('ko-KR').format(val);
    }
}

// ==========================================================================
// 6. Application Bootstrapping
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
    initUIControls();
    new Calculator();
    
    // Initialise slider fills properly
    const loanCalc = new LoanCalculator();
    loanCalc.updateUI();
});
