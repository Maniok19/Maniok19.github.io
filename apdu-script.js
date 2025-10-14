/**
 * APDU Interactive Simulator - ISO/IEC 7816-4 Compliant
 * Educational tool for learning APDU command structure and smart card communication
 */

class APDUSimulator {
    constructor() {
        this.currentCommand = null;
        this.transactionHistory = [];
        this.cardState = {
            selected: '3F00', // MF (Master File)
            authenticated: false,
            pinTries: 3
        };
        
        // Virtual file system
        this.fileSystem = {
            '3F00': { name: 'MF', type: 'MF', data: null },
            '2F00': { name: 'EF.DIR', type: 'EF', parent: '3F00', data: '61194F10A0000000620101020304050607080150095465737420417070' },
            '7F10': { name: 'DF.TELECOM', type: 'DF', parent: '3F00' },
            '6F07': { name: 'EF.IMSI', type: 'EF', parent: '7F10', data: '081234567890123456' }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateVisualization();
        this.updateCardStatus();
    }
    
    setupEventListeners() {
        // INS select handling
        const insSelect = document.getElementById('ins');
        const insCustom = document.getElementById('ins-custom');
        
        if (insSelect) {
            insSelect.addEventListener('change', (e) => {
                if (e.target.value === 'CUSTOM') {
                    insCustom.style.display = 'block';
                    insCustom.focus();
                } else {
                    insCustom.style.display = 'none';
                }
            });
        }
        
        // Auto-calculate Lc based on data
        const dataInput = document.getElementById('data');
        const lcInput = document.getElementById('lc');
        
        if (dataInput && lcInput) {
            dataInput.addEventListener('input', () => {
                const cleanData = dataInput.value.replace(/\s/g, '');
                if (cleanData && /^[0-9A-Fa-f]*$/.test(cleanData)) {
                    lcInput.value = cleanData.length / 2;
                }
            });
        }
        
        // Hex input validation
        const hexInputs = document.querySelectorAll('.hex-input');
        hexInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
            });
        });
        
        // Build APDU button
        const buildBtn = document.getElementById('build-apdu');
        if (buildBtn) {
            buildBtn.addEventListener('click', () => {
                this.buildAPDU();
            });
        }
        
        // Send APDU button
        const sendBtn = document.getElementById('send-apdu');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.sendAPDU();
            });
        }
        
        // Reset button
        const resetBtn = document.getElementById('reset-builder');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetBuilder();
            });
        }
        
        // Clear log button
        const clearBtn = document.getElementById('clear-log');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearLog();
            });
        }
        
        // Template buttons
        document.querySelectorAll('.use-template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.loadTemplate(e.target.dataset.template);
            });
        });
    }
    
    buildAPDU() {
        const cla = document.getElementById('cla').value.padStart(2, '0');
        let ins = document.getElementById('ins').value;
        
        if (ins === 'CUSTOM') {
            ins = document.getElementById('ins-custom').value.padStart(2, '0');
        }
        
        const p1 = document.getElementById('p1').value.padStart(2, '0');
        const p2 = document.getElementById('p2').value.padStart(2, '0');
        const lc = parseInt(document.getElementById('lc').value) || 0;
        const data = document.getElementById('data').value.replace(/\s/g, '').toUpperCase();
        const le = parseInt(document.getElementById('le').value) || 0;
        
        // Build command
        let command = `${cla} ${ins} ${p1} ${p2}`;
        
        // Update visualization
        this.updateVisualization();
        
        // Determine APDU case
        const structure = document.getElementById('apdu-structure');
        structure.innerHTML = `
            <div class="apdu-byte mandatory active" data-field="cla">
                <div class="byte-label">CLA</div>
                <div class="byte-value">${cla}</div>
            </div>
            <div class="apdu-byte mandatory active" data-field="ins">
                <div class="byte-label">INS</div>
                <div class="byte-value">${ins}</div>
            </div>
            <div class="apdu-byte mandatory active" data-field="p1">
                <div class="byte-label">P1</div>
                <div class="byte-value">${p1}</div>
            </div>
            <div class="apdu-byte mandatory active" data-field="p2">
                <div class="byte-label">P2</div>
                <div class="byte-value">${p2}</div>
            </div>
        `;
        
        if (lc > 0 && data) {
            // Case 3 or 4
            command += ` ${lc.toString(16).padStart(2, '0').toUpperCase()}`;
            
            structure.innerHTML += `
                <div class="apdu-byte optional active" data-field="lc">
                    <div class="byte-label">Lc</div>
                    <div class="byte-value">${lc.toString(16).padStart(2, '0').toUpperCase()}</div>
                </div>
            `;
            
            // Add data bytes
            const dataBytes = data.match(/.{1,2}/g) || [];
            dataBytes.forEach((byte, i) => {
                command += ` ${byte}`;
                if (i < 8) { // Show first 8 bytes
                    structure.innerHTML += `
                        <div class="apdu-byte data active" data-field="data${i}">
                            <div class="byte-label">D${i}</div>
                            <div class="byte-value">${byte}</div>
                        </div>
                    `;
                }
            });
            
            if (dataBytes.length > 8) {
                structure.innerHTML += `
                    <div class="apdu-byte data" data-field="data-more">
                        <div class="byte-label">...</div>
                        <div class="byte-value">+${dataBytes.length - 8}</div>
                    </div>
                `;
            }
        }
        
        if (le > 0) {
            // Case 2 or 4
            const leHex = le === 256 ? '00' : le.toString(16).padStart(2, '0').toUpperCase();
            command += ` ${leHex}`;
            
            structure.innerHTML += `
                <div class="apdu-byte optional active" data-field="le">
                    <div class="byte-label">Le</div>
                    <div class="byte-value">${leHex}</div>
                </div>
            `;
        }
        
        // Update output
        document.getElementById('command-hex').textContent = command;
        
        // Enable send button
        this.currentCommand = { cla, ins, p1, p2, lc, data, le };
        document.getElementById('send-apdu').disabled = false;
    }
    
    sendAPDU() {
        if (!this.currentCommand) return;
        
        const { cla, ins, p1, p2, lc, data, le } = this.currentCommand;
        
        // Build command string
        let cmdStr = `${cla} ${ins} ${p1} ${p2}`;
        if (lc > 0) {
            cmdStr += ` ${lc.toString(16).padStart(2, '0').toUpperCase()} ${data}`;
        }
        if (le > 0) {
            const leHex = le === 256 ? '00' : le.toString(16).padStart(2, '0').toUpperCase();
            cmdStr += ` ${leHex}`;
        }
        
        // Log command
        this.logTransaction('command', cmdStr);
        
        // Process command and generate response
        const response = this.processCommand(ins, p1, p2, data);
        
        // Build response string
        let respStr = response.data ? response.data + ' ' : '';
        respStr += `${response.sw1} ${response.sw2}`;
        
        // Log response
        this.logTransaction('response', respStr, response.sw1, response.sw2);
        
        // Update card status
        this.updateCardStatus();
    }
    
    processCommand(ins, p1, p2, data) {
        // Simulate command processing
        switch(ins.toUpperCase()) {
            case 'A4': // SELECT
                return this.handleSelect(p1, p2, data);
            
            case 'B0': // READ BINARY
                return this.handleReadBinary(p1, p2);
            
            case 'D6': // UPDATE BINARY
                return this.handleUpdateBinary(p1, p2, data);
            
            case 'CA': // GET DATA
                return this.handleGetData(p1, p2);
            
            case '20': // VERIFY
                return this.handleVerify(p2, data);
            
            case '84': // GET CHALLENGE
                return this.handleGetChallenge();
            
            case '88': // INTERNAL AUTHENTICATE
                return { data: '', sw1: '69', sw2: '82' }; // Security status not satisfied
            
            default:
                return { data: '', sw1: '6D', sw2: '00' }; // INS not supported
        }
    }
    
    handleSelect(p1, p2, data) {
        const fileId = data ? data.substring(0, 4).toUpperCase() : '';
        
        if (this.fileSystem[fileId]) {
            this.cardState.selected = fileId;
            
            // Return FCI (File Control Information)
            const fci = '6F1A8402' + fileId + 'A514BF0C11C00660040301010101C1060601040120010101';
            return { data: fci, sw1: '90', sw2: '00' };
        }
        
        return { data: '', sw1: '6A', sw2: '82' }; // File not found
    }
    
    handleReadBinary(p1, p2) {
        const offset = (parseInt(p1, 16) << 8) | parseInt(p2, 16);
        const selectedFile = this.fileSystem[this.cardState.selected];
        
        if (selectedFile && selectedFile.data) {
            const data = selectedFile.data.substring(offset * 2, offset * 2 + 32);
            return { data, sw1: '90', sw2: '00' };
        }
        
        return { data: '', sw1: '69', sw2: '86' }; // Command not allowed
    }
    
    handleUpdateBinary(p1, p2, data) {
        if (!this.cardState.authenticated) {
            return { data: '', sw1: '69', sw2: '82' }; // Security status not satisfied
        }
        
        // Simulate successful update
        return { data: '', sw1: '90', sw2: '00' };
    }
    
    handleGetData(p1, p2) {
        // Simulate getting serial number or other data
        const dataObjects = {
            '0042': '123456789ABCDEF0', // Serial number
            '005A': '5A10123456789012345678' // Card number
        };
        
        const tag = (p1 + p2).toUpperCase();
        if (dataObjects[tag]) {
            return { data: dataObjects[tag], sw1: '90', sw2: '00' };
        }
        
        return { data: '', sw1: '6A', sw2: '88' }; // Referenced data not found
    }
    
    handleVerify(p2, pin) {
        if (!pin || pin.length !== 8) {
            return { data: '', sw1: '67', sw2: '00' }; // Wrong length
        }
        
        // Simulate PIN verification (correct PIN: 31323334 = "1234" in ASCII hex)
        if (pin.toUpperCase() === '31323334') {
            this.cardState.authenticated = true;
            this.cardState.pinTries = 3;
            return { data: '', sw1: '90', sw2: '00' };
        }
        
        this.cardState.pinTries--;
        if (this.cardState.pinTries === 0) {
            return { data: '', sw1: '69', sw2: '83' }; // Authentication blocked
        }
        
        return { data: '', sw1: '63', sw2: 'C' + this.cardState.pinTries.toString() }; // Verification failed, X tries left
    }
    
    handleGetChallenge() {
        // Generate random challenge
        const challenge = Array.from({length: 8}, () => 
            Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
        ).join('').toUpperCase();
        
        return { data: challenge, sw1: '90', sw2: '00' };
    }
    
    clearLog() {
        const log = document.getElementById('transaction-log');
        if (log) {
            log.innerHTML = '<div class="log-empty"><p>No transactions yet. Build and send a command to get started!</p></div>';
        }
        this.transactionHistory = [];
    }
    
    logTransaction(type, data, sw1 = null, sw2 = null) {
        const log = document.getElementById('transaction-log');
        if (!log) return;
        
        // Remove empty message if present
        const emptyMsg = log.querySelector('.log-empty');
        if (emptyMsg) {
            emptyMsg.remove();
        }
        
        const timestamp = new Date().toLocaleTimeString();
        
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        
        let statusHTML = '';
        if (sw1 && sw2) {
            const statusCode = sw1 + sw2;
            let statusClass = 'success';
            let statusText = 'Success - Command executed perfectly!';
            
            if (statusCode !== '9000') {
                if (sw1 === '61') {
                    statusClass = 'warning';
                    statusText = `More data available (${parseInt(sw2, 16)} bytes)`;
                } else if (sw1 === '62' || sw1 === '63') {
                    statusClass = 'warning';
                    statusText = 'Warning - Check the status code details';
                } else {
                    statusClass = 'error';
                    statusText = 'Error - Command failed';
                }
            }
            
            statusHTML = `<div class="log-status ${statusClass}">SW: ${sw1} ${sw2} - ${statusText}</div>`;
        }
        
        entry.innerHTML = `
            <div class="log-timestamp">${timestamp}</div>
            <div class="log-label">${type === 'command' ? '→ Command Sent' : '← Card Response'}</div>
            <div class="log-data">${data}</div>
            ${statusHTML}
        `;
        
        log.insertBefore(entry, log.firstChild);
        
        this.transactionHistory.push({ timestamp, type, data, sw1, sw2 });
    }
    
    updateVisualization() {
        // Animate card chip contacts on activity
        const contacts = document.querySelectorAll('.contact');
        contacts.forEach((contact, i) => {
            setTimeout(() => {
                contact.style.background = '#a38968';
                setTimeout(() => {
                    contact.style.background = '#8b7355';
                }, 100);
            }, i * 50);
        });
    }
    
    updateCardStatus() {
        const currentFileSpan = document.getElementById('current-file');
        const statusText = document.querySelector('.status-text');
        const pinTriesSpan = document.getElementById('pin-tries');
        
        if (currentFileSpan) {
            const selectedFile = this.fileSystem[this.cardState.selected];
            if (selectedFile) {
                currentFileSpan.textContent = `${selectedFile.name} (${this.cardState.selected})`;
            }
        }
        
        if (statusText) {
            if (this.cardState.authenticated) {
                statusText.textContent = 'Authenticated ✓';
            } else {
                statusText.textContent = 'Ready';
            }
        }
        
        if (pinTriesSpan) {
            pinTriesSpan.textContent = this.cardState.pinTries;
            if (this.cardState.pinTries === 0) {
                pinTriesSpan.style.color = '#ff4757';
            } else {
                pinTriesSpan.style.color = '#2ed573';
            }
        }
    }
    
    loadTemplate(templateName) {
        const templates = {
            'SELECT': {
                cla: '00',
                ins: 'A4',
                p1: '04',
                p2: '00',
                lc: 7,
                data: 'A0000000041010',
                le: 0
            },
            'READ': {
                cla: '00',
                ins: 'B0',
                p1: '00',
                p2: '00',
                lc: 0,
                data: '',
                le: 16
            },
            'UPDATE': {
                cla: '00',
                ins: 'D6',
                p1: '00',
                p2: '00',
                lc: 4,
                data: 'DEADBEEF',
                le: 0
            },
            'VERIFY': {
                cla: '00',
                ins: '20',
                p1: '00',
                p2: '01',
                lc: 4,
                data: '31323334',
                le: 0
            },
            'GET_DATA': {
                cla: '00',
                ins: 'CA',
                p1: '00',
                p2: '42',
                lc: 0,
                data: '',
                le: 16
            },
            'CHALLENGE': {
                cla: '00',
                ins: '84',
                p1: '00',
                p2: '00',
                lc: 0,
                data: '',
                le: 8
            }
        };
        
        const template = templates[templateName];
        if (template) {
            document.getElementById('cla').value = template.cla;
            document.getElementById('ins').value = template.ins;
            document.getElementById('p1').value = template.p1;
            document.getElementById('p2').value = template.p2;
            document.getElementById('lc').value = template.lc;
            document.getElementById('data').value = template.data;
            document.getElementById('le').value = template.le;
            
            this.buildAPDU();
        }
    }
    
    resetBuilder() {
        document.getElementById('cla').value = '00';
        document.getElementById('ins').value = 'A4';
        document.getElementById('p1').value = '00';
        document.getElementById('p2').value = '00';
        document.getElementById('lc').value = '0';
        document.getElementById('data').value = '';
        document.getElementById('le').value = '0';
        document.getElementById('send-apdu').disabled = true;
        
        // Reset visualization
        const structure = document.getElementById('apdu-structure');
        structure.innerHTML = `
            <div class="apdu-byte mandatory" data-field="cla">
                <div class="byte-label">CLA</div>
                <div class="byte-value">00</div>
            </div>
            <div class="apdu-byte mandatory" data-field="ins">
                <div class="byte-label">INS</div>
                <div class="byte-value">A4</div>
            </div>
            <div class="apdu-byte mandatory" data-field="p1">
                <div class="byte-label">P1</div>
                <div class="byte-value">00</div>
            </div>
            <div class="apdu-byte mandatory" data-field="p2">
                <div class="byte-label">P2</div>
                <div class="byte-value">00</div>
            </div>
        `;
        
        document.getElementById('command-hex').textContent = '00 A4 00 00';
        this.currentCommand = null;
    }
}

// Initialize simulator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new APDUSimulator();
});