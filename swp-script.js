/**
 * SWP Interactive Demo Script - ETSI TS 102 613 Compliant
 * Accurate visualization of Single Wire Protocol per specification
 */

class SWPDemo {
    constructor() {
        // Canvas and context
        this.canvas = null;
        this.ctx = null;
        
        // Animation state
        this.isTransmitting = false;
        this.currentBit = 0;
        this.animationId = null;
        this.animationProgress = 0;
        
        // Channel data
        this.s1Data = [0, 1, 0, 1, 0, 1, 0, 1];
        this.s0Data = [1, 0, 1, 0, 1, 1, 0, 0];
        
        // Voltage levels for S1 (Class C: 1.8V)
        this.vcc = 1.8; // Class C operation
        this.s1VoltageHigh = 0.85 * this.vcc; // VOH min = 0.85 x VCC
        this.s1VoltageLow = 0; // VOL
        
        // Current levels for S2 (in mA)
        this.s2CurrentHigh = 0.8; // IH: 600-1000 μA (using 800 μA)
        this.s2CurrentLow = 0.01; // IL: 0-20 μA (using 10 μA)
        
        // Bit timing (PWM encoding)
        this.bitDuration = 2; // T = 2μs (within 1-5μs range)
        this.th1Ratio = 0.75; // Logical 1: 75% high
        this.th0Ratio = 0.25; // Logical 0: 25% high
        
        // Resistance for current-to-voltage conversion (for display)
        this.resistance = 50; // Ohms
        
        // Drawing constants
        this.padding = { top: 60, right: 100, bottom: 100, left: 80 };
        this.graphHeight = 0;
        this.graphWidth = 0;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.drawIdleState();
        this.resetReadings();
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('swp-canvas');
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size for high DPI displays
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        
        // Store logical dimensions
        this.canvasWidth = rect.width;
        this.canvasHeight = rect.height;
        
        // Calculate graph dimensions
        this.graphWidth = this.canvasWidth - this.padding.left - this.padding.right;
        this.graphHeight = this.canvasHeight - this.padding.top - this.padding.bottom;
    }
    
    setupEventListeners() {
        // Bit buttons
        document.querySelectorAll('.bit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleBitClick(e));
        });
        
        // Control buttons
        const startBtn = document.getElementById('start-transmission');
        const resetBtn = document.getElementById('reset-demo');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startTransmission());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }
        
        // Window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            if (!this.isTransmitting) {
                this.drawIdleState();
            }
        });
    }
    
    handleBitClick(e) {
        if (this.isTransmitting) return; // Don't allow changes during transmission
        
        const btn = e.target;
        const channel = btn.dataset.channel;
        const index = parseInt(btn.dataset.index);
        
        // Toggle bit value
        const currentBit = parseInt(btn.dataset.bit);
        const newBit = currentBit === 1 ? 0 : 1;
        
        // Update data array
        if (channel === 's1') {
            this.s1Data[index] = newBit;
        } else {
            this.s0Data[index] = newBit;
        }
        
        // Update button display
        btn.textContent = newBit;
        btn.dataset.bit = newBit;
        btn.classList.toggle('active', newBit === 1);
        
        // Redraw
        this.drawIdleState();
    }
    
    startTransmission() {
        if (this.isTransmitting) return;
        
        this.isTransmitting = true;
        this.currentBit = 0;
        this.animationProgress = 0;
        
        // Update state display
        this.updateState('TRANSMITTING');
        
        // Disable start button
        const startBtn = document.getElementById('start-transmission');
        if (startBtn) {
            startBtn.disabled = true;
        }
        
        // Highlight first bits
        this.highlightBitButton('s1', 0);
        this.highlightBitButton('s0', 0);
        
        this.animate();
    }
    
    animate() {
        if (!this.isTransmitting) return;
        
        // Update progress
        this.animationProgress += 0.02; // Slower, smoother animation
        
        if (this.animationProgress >= 1) {
            this.animationProgress = 0;
            this.currentBit++;
            
            if (this.currentBit >= this.s1Data.length) {
                this.stopTransmission();
                return;
            }
            
            // Highlight current bits
            this.highlightBitButton('s1', this.currentBit);
            this.highlightBitButton('s0', this.currentBit);
        }
        
        // Draw current state
        this.drawTransmission();
        
        // Update readings
        this.updateReadings();
        
        // Schedule next frame
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    highlightBitButton(channel, index) {
        // Remove previous highlights
        document.querySelectorAll(`.bit-btn[data-channel="${channel}"]`).forEach(btn => {
            btn.classList.remove('transmitting');
        });
        
        // Add highlight to current
        const currentBtn = document.querySelector(`.bit-btn[data-channel="${channel}"][data-index="${index}"]`);
        if (currentBtn) {
            currentBtn.classList.add('transmitting');
        }
    }
    
    drawIdleState() {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Draw background
        this.drawBackground();
        
        // Draw all signals at initial state
        this.drawCompleteSignals(0);
    }
    
    drawTransmission() {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Draw background
        this.drawBackground();
        
        // Draw signals up to current progress
        const progress = this.currentBit + this.animationProgress;
        this.drawCompleteSignals(progress);
    }
    
    drawBackground() {
        // Title
        this.ctx.fillStyle = '#00d9ff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SWP Signal Visualization (ETSI TS 102 613)', this.canvasWidth / 2, 30);
        
        // Draw axes
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        
        // Y-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding.left, this.padding.top);
        this.ctx.lineTo(this.padding.left, this.canvasHeight - this.padding.bottom);
        this.ctx.stroke();
        
        // X-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding.left, this.canvasHeight - this.padding.bottom);
        this.ctx.lineTo(this.canvasWidth - this.padding.right, this.canvasHeight - this.padding.bottom);
        this.ctx.stroke();
        
        // Grid lines
        this.drawGrid();
        
        // Axis labels
        this.ctx.fillStyle = '#a0a0a0';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        
        // X-axis label
        this.ctx.fillText('Time (bit periods)', this.canvasWidth / 2, this.canvasHeight - 20);
        
        // Y-axis label (left side - voltage)
        this.ctx.save();
        this.ctx.translate(20, this.canvasHeight / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('S1 Voltage (V)', 0, 0);
        this.ctx.restore();
        
        // Y-axis label (right side - current)
        this.ctx.save();
        this.ctx.translate(this.canvasWidth - 20, this.canvasHeight / 2);
        this.ctx.rotate(Math.PI / 2);
        this.ctx.fillText('S2 Current (mA)', 0, 0);
        this.ctx.restore();
    }
    
    drawGrid() {
        const maxVoltage = 2.0; // Slightly above VCC for headroom
        const voltageStep = 0.2;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = '#a0a0a0';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'right';
        
        // Horizontal grid lines (voltage levels)
        for (let v = 0; v <= maxVoltage; v += voltageStep) {
            const y = this.canvasHeight - this.padding.bottom - (v / maxVoltage) * this.graphHeight;
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding.left, y);
            this.ctx.lineTo(this.canvasWidth - this.padding.right, y);
            this.ctx.stroke();
            
            // Voltage label (left)
            this.ctx.fillText(v.toFixed(1) + 'V', this.padding.left - 10, y + 4);
        }
        
        // Current scale on right side
        const maxCurrent = 1.0; // 1 mA
        const currentStep = 0.2;
        this.ctx.textAlign = 'left';
        
        for (let i = 0; i <= maxCurrent; i += currentStep) {
            const y = this.canvasHeight - this.padding.bottom - (i / maxCurrent) * this.graphHeight;
            this.ctx.fillText(i.toFixed(1) + 'mA', this.canvasWidth - this.padding.right + 10, y + 4);
        }
        
        // Vertical grid lines (bit positions)
        const bitWidth = this.graphWidth / this.s1Data.length;
        this.ctx.textAlign = 'center';
        
        for (let i = 0; i <= this.s1Data.length; i++) {
            const x = this.padding.left + i * bitWidth;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.padding.top);
            this.ctx.lineTo(x, this.canvasHeight - this.padding.bottom);
            this.ctx.stroke();
            
            if (i < this.s1Data.length) {
                this.ctx.fillText(`Bit ${i}`, x + bitWidth / 2, this.canvasHeight - this.padding.bottom + 20);
            }
        }
        
        // Mark key levels
        this.drawVoltageMarker(this.s1VoltageHigh, '#ff6b6b', 'S1 High (0.85×VCC)');
        this.drawCurrentMarker(this.s2CurrentHigh, '#4ecdc4', 'S2 High (0.8mA)');
    }
    
    drawVoltageMarker(voltage, color, label) {
        const maxVoltage = 2.0;
        const y = this.canvasHeight - this.padding.bottom - (voltage / maxVoltage) * this.graphHeight;
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding.left, y);
        this.ctx.lineTo(this.canvasWidth - this.padding.right, y);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
        
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 11px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(label, this.canvasWidth - this.padding.right + 10, y + 4);
    }
    
    drawCurrentMarker(current, color, label) {
        const maxCurrent = 1.0;
        const y = this.canvasHeight - this.padding.bottom - (current / maxCurrent) * this.graphHeight;
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([3, 3]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding.left, y);
        this.ctx.lineTo(this.canvasWidth - this.padding.right, y);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
    }
    
    drawCompleteSignals(progress) {
        const maxVoltage = 2.0;
        const maxCurrent = 1.0;
        const bitWidth = this.graphWidth / this.s1Data.length;
        
        // Draw S1 Channel (Voltage - PWM encoded)
        this.drawS1Signal(progress, maxVoltage, bitWidth);
        
        // Draw S2 Channel (Current - only valid when S1 is HIGH)
        this.drawS2Signal(progress, maxCurrent, bitWidth);
    }
    
    drawS1Signal(progress, maxVoltage, bitWidth) {
        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'square';
        this.ctx.lineJoin = 'miter';
        
        this.ctx.beginPath();
        
        const baseY = this.canvasHeight - this.padding.bottom;
        const startX = this.padding.left;
        const highY = baseY - (this.s1VoltageHigh / maxVoltage) * this.graphHeight;
        const lowY = baseY;
        
        for (let i = 0; i < this.s1Data.length && i < Math.floor(progress) + 1; i++) {
            const bitValue = this.s1Data[i];
            const x1 = startX + i * bitWidth;
            const x2 = startX + (i + 1) * bitWidth;
            
            // PWM encoding: 75% high for '1', 25% high for '0'
            const highRatio = bitValue === 1 ? this.th1Ratio : this.th0Ratio;
            const transitionX = x1 + bitWidth * highRatio;
            
            // Adjust for partial bit
            const isPartialBit = i === Math.floor(progress) && progress < this.s1Data.length;
            const endX = isPartialBit ? x1 + (progress - i) * bitWidth : x2;
            
            if (i === 0) {
                this.ctx.moveTo(x1, lowY);
            }
            
            // Rising edge
            this.ctx.lineTo(x1, highY);
            
            // High period
            if (endX <= transitionX) {
                this.ctx.lineTo(endX, highY);
            } else {
                this.ctx.lineTo(transitionX, highY);
                // Falling edge
                this.ctx.lineTo(transitionX, lowY);
                // Low period
                if (endX > transitionX) {
                    this.ctx.lineTo(Math.min(endX, x2), lowY);
                }
            }
        }
        
        this.ctx.stroke();
        
        // Draw bit values
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        
        for (let i = 0; i < this.s1Data.length && i <= progress; i++) {
            const x = startX + i * bitWidth + bitWidth / 2;
            this.ctx.fillText(this.s1Data[i].toString(), x, highY - 15);
        }
    }
    
    drawS2Signal(progress, maxCurrent, bitWidth) {
        this.ctx.strokeStyle = '#4ecdc4';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'square';
        this.ctx.lineJoin = 'miter';
        
        this.ctx.beginPath();
        
        const baseY = this.canvasHeight - this.padding.bottom;
        const startX = this.padding.left;
        const highY = baseY - (this.s2CurrentHigh / maxCurrent) * this.graphHeight;
        const lowY = baseY - (this.s2CurrentLow / maxCurrent) * this.graphHeight;
        
        let firstPoint = true;
        
        for (let i = 0; i < this.s0Data.length && i < Math.floor(progress) + 1; i++) {
            const s1BitValue = this.s1Data[i];
            const s2BitValue = this.s0Data[i];
            
            const x1 = startX + i * bitWidth;
            const x2 = startX + (i + 1) * bitWidth;
            
            // S2 is only valid when S1 is HIGH
            const s1HighRatio = s1BitValue === 1 ? this.th1Ratio : this.th0Ratio;
            const s1TransitionX = x1 + bitWidth * s1HighRatio;
            
            const isPartialBit = i === Math.floor(progress) && progress < this.s0Data.length;
            const endX = isPartialBit ? x1 + (progress - i) * bitWidth : x2;
            
            const currentY = s2BitValue === 1 ? highY : lowY;
            
            if (firstPoint) {
                this.ctx.moveTo(x1, baseY);
                firstPoint = false;
            }
            
            // S2 rises with S1
            this.ctx.lineTo(x1, currentY);
            
            // S2 stays at level while S1 is high
            if (endX <= s1TransitionX) {
                this.ctx.lineTo(endX, currentY);
            } else {
                this.ctx.lineTo(s1TransitionX, currentY);
                // S2 falls when S1 falls
                this.ctx.lineTo(s1TransitionX, baseY);
                // S2 stays low while S1 is low
                if (endX > s1TransitionX) {
                    this.ctx.lineTo(Math.min(endX, x2), baseY);
                }
            }
        }
        
        this.ctx.stroke();
        
        // Draw bit values
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        
        for (let i = 0; i < this.s0Data.length && i <= progress; i++) {
            const x = startX + i * bitWidth + bitWidth / 2;
            const s2BitValue = this.s0Data[i];
            const y = s2BitValue === 1 ? highY - 15 : baseY + 20;
            this.ctx.fillText(this.s0Data[i].toString(), x, y);
        }
    }
    
    updateReadings() {
        const bitIndex = Math.min(this.currentBit, this.s1Data.length - 1);
        
        const s1Bit = this.s1Data[bitIndex];
        const s2Bit = this.s0Data[bitIndex];
        
        // S1 voltage (during high phase)
        const s1Voltage = s1Bit === 1 ? this.s1VoltageHigh : this.s1VoltageHigh;
        
        // S2 current (only meaningful when S1 is high)
        const s2Current = s2Bit === 1 ? this.s2CurrentHigh : this.s2CurrentLow;
        
        // Update displays
        const voltageDisplay = document.getElementById('voltage-reading');
        const currentDisplay = document.getElementById('current-reading');
        
        if (voltageDisplay) {
            voltageDisplay.textContent = `${s1Voltage.toFixed(2)}V`;
            voltageDisplay.style.color = s1Bit === 1 ? '#ff6b6b' : '#00d9ff';
        }
        
        if (currentDisplay) {
            currentDisplay.textContent = `${s2Current.toFixed(2)}mA`;
            currentDisplay.style.color = s2Bit === 1 ? '#4ecdc4' : '#00d9ff';
        }
        
        // Update channel indicators
        const s1Indicator = document.getElementById('s1-indicator');
        const s0Indicator = document.getElementById('s0-indicator');
        
        if (s1Indicator) {
            s1Indicator.textContent = this.s1Data[bitIndex];
        }
        
        if (s0Indicator) {
            s0Indicator.textContent = this.s0Data[bitIndex];
        }
    }
    
    updateState(state) {
        const stateDisplay = document.getElementById('state-reading');
        if (stateDisplay) {
            stateDisplay.textContent = state;
            stateDisplay.style.color = state === 'TRANSMITTING' ? '#00ff88' : '#00d9ff';
        }
    }
    
    stopTransmission() {
        this.isTransmitting = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Remove all highlights
        document.querySelectorAll('.bit-btn.transmitting').forEach(btn => {
            btn.classList.remove('transmitting');
        });
        
        // Update state
        this.updateState('COMPLETE');
        
        // Re-enable start button
        const startBtn = document.getElementById('start-transmission');
        if (startBtn) {
            startBtn.disabled = false;
        }
        
        setTimeout(() => {
            this.updateState('IDLE');
            this.resetReadings();
        }, 2000);
    }
    
    reset() {
        this.stopTransmission();
        
        // Reset bit position
        this.currentBit = 0;
        this.animationProgress = 0;
        
        // Reset to default pattern (alternating)
        this.s1Data = [0, 1, 0, 1, 0, 1, 0, 1];
        this.s0Data = [1, 0, 1, 0, 1, 1, 0, 0];
        
        // Reset all bit buttons
        document.querySelectorAll('.bit-btn[data-channel="s1"]').forEach((btn, index) => {
            const bit = this.s1Data[index];
            btn.textContent = bit;
            btn.dataset.bit = bit;
            btn.classList.toggle('active', bit === 1);
            btn.classList.remove('transmitting');
        });
        
        document.querySelectorAll('.bit-btn[data-channel="s0"]').forEach((btn, index) => {
            const bit = this.s0Data[index];
            btn.textContent = bit;
            btn.dataset.bit = bit;
            btn.classList.toggle('active', bit === 1);
            btn.classList.remove('transmitting');
        });
        
        // Redraw idle state
        this.drawIdleState();
        this.resetReadings();
        this.updateState('IDLE');
    }
    
    resetReadings() {
        const voltageDisplay = document.getElementById('voltage-reading');
        const currentDisplay = document.getElementById('current-reading');
        const s1Indicator = document.getElementById('s1-indicator');
        const s0Indicator = document.getElementById('s0-indicator');
        
        if (voltageDisplay) {
            voltageDisplay.textContent = '0.00V';
            voltageDisplay.style.color = '#00d9ff';
        }
        
        if (currentDisplay) {
            currentDisplay.textContent = '0.00mA';
            currentDisplay.style.color = '#00d9ff';
        }
        
        if (s1Indicator) {
            s1Indicator.textContent = this.s1Data[0];
        }
        
        if (s0Indicator) {
            s0Indicator.textContent = this.s0Data[0];
        }
    }
}

// Initialize demo when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SWPDemo();
});