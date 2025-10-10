// AES-128 implementation for educational visualization (standard compliant)
const SBOX = [
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
];

const INV_SBOX = [
    0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
    0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
    0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
    0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
    0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
    0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
    0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
    0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
    0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
    0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
    0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
    0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
    0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
    0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
    0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
    0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d
];

const RCON = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

let state = [];
let roundKeys = [];
let currentRound = 0;
let isAnimating = false;
let isDecryptMode = false;

const plaintextInput = document.getElementById('plaintext');
const keyInput = document.getElementById('encrypt-key');
const ciphertextInput = document.getElementById('ciphertext');
const decryptKeyInput = document.getElementById('decrypt-key');
const encryptBtn = document.getElementById('encrypt-btn');
const decryptBtn = document.getElementById('decrypt-btn');
const resetBtn = document.getElementById('reset-btn');
const stateMatrix = document.getElementById('state-matrix');
const stepTitle = document.getElementById('step-title');
const stepDescription = document.getElementById('step-description');
const roundCounter = document.getElementById('round-counter');
const encryptedOutput = document.getElementById('encrypted-output');

const encryptModeBtn = document.getElementById('encrypt-mode-btn');
const decryptModeBtn = document.getElementById('decrypt-mode-btn');
const encryptionInputs = document.getElementById('encryption-inputs');
const decryptionInputs = document.getElementById('decryption-inputs');
const processTitle = document.getElementById('process-title');
const outputTitle = document.getElementById('output-title');

// Initialize matrix display
function initializeMatrix() {
    stateMatrix.innerHTML = '';
    for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        cell.className = 'matrix-cell';
        cell.textContent = '00';
        stateMatrix.appendChild(cell);
    }
}

// PKCS#7 Padding
function pkcs7Pad(data) {
    const paddingLength = 16 - (data.length % 16);
    const padding = new Array(paddingLength).fill(paddingLength);
    return [...data, ...padding];
}

// PKCS#7 Unpadding
function pkcs7Unpad(data) {
    const paddingLength = data[data.length - 1];
    return data.slice(0, data.length - paddingLength);
}

// Update matrix display - AES uses column-major order
function updateMatrix(highlightCells = []) {
    const cells = stateMatrix.children;
    for (let i = 0; i < 16; i++) {
        const row = i % 4;
        const col = Math.floor(i / 4);
        const value = state[row][col];
        cells[i].textContent = value.toString(16).padStart(2, '0').toUpperCase();
        
        cells[i].classList.remove('active', 'changed');
        if (highlightCells.includes(i)) {
            cells[i].classList.add('active');
        }
    }
}

// Convert string to state array (column-major order) with PKCS#7 padding
function stringToState(str) {
    const encoder = new TextEncoder();
    const bytes = Array.from(encoder.encode(str));
    const paddedBytes = pkcs7Pad(bytes);
    
    state = [
        [paddedBytes[0], paddedBytes[4], paddedBytes[8], paddedBytes[12]],
        [paddedBytes[1], paddedBytes[5], paddedBytes[9], paddedBytes[13]],
        [paddedBytes[2], paddedBytes[6], paddedBytes[10], paddedBytes[14]],
        [paddedBytes[3], paddedBytes[7], paddedBytes[11], paddedBytes[15]]
    ];
}

// Convert hex string to state array
function hexToState(hexStr) {
    const bytes = [];
    for (let i = 0; i < hexStr.length; i += 2) {
        bytes.push(parseInt(hexStr.substr(i, 2), 16));
    }
    
    state = [
        [bytes[0], bytes[4], bytes[8], bytes[12]],
        [bytes[1], bytes[5], bytes[9], bytes[13]],
        [bytes[2], bytes[6], bytes[10], bytes[14]],
        [bytes[3], bytes[7], bytes[11], bytes[15]]
    ];
}

// Convert state to bytes (column-major order)
function stateToBytes() {
    const bytes = [];
    for (let col = 0; col < 4; col++) {
        for (let row = 0; row < 4; row++) {
            bytes.push(state[row][col]);
        }
    }
    return bytes;
}

// SubBytes transformation
async function subBytes() {
    updateOperationBox('subbytes-box', true);
    stepTitle.textContent = 'SubBytes';
    stepDescription.textContent = 'Substituting each byte using the S-Box lookup table';
    
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            await sleep(100);
            const idx = col * 4 + row;
            updateMatrix([idx]);
            state[row][col] = SBOX[state[row][col]];
            const cells = stateMatrix.children;
            cells[idx].classList.add('changed');
        }
    }
    
    await sleep(500);
    updateMatrix();
    updateOperationBox('subbytes-box', false);
}

// Inverse SubBytes transformation
async function invSubBytes() {
    updateOperationBox('subbytes-box', true);
    stepTitle.textContent = 'Inverse SubBytes';
    stepDescription.textContent = 'Substituting each byte using the Inverse S-Box lookup table';
    
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            await sleep(100);
            const idx = col * 4 + row;
            updateMatrix([idx]);
            state[row][col] = INV_SBOX[state[row][col]];
            const cells = stateMatrix.children;
            cells[idx].classList.add('changed');
        }
    }
    
    await sleep(500);
    updateMatrix();
    updateOperationBox('subbytes-box', false);
}

// ShiftRows transformation
async function shiftRows() {
    updateOperationBox('shiftrows-box', true);
    stepTitle.textContent = 'ShiftRows';
    stepDescription.textContent = 'Cyclically shifting each row to the left';
    
    // Row 0: no shift
    // Row 1: shift left by 1
    await sleep(200);
    updateMatrix([1, 5, 9, 13]);
    const temp1 = state[1][0];
    state[1][0] = state[1][1];
    state[1][1] = state[1][2];
    state[1][2] = state[1][3];
    state[1][3] = temp1;
    
    // Row 2: shift left by 2
    await sleep(200);
    updateMatrix([2, 6, 10, 14]);
    const temp2a = state[2][0];
    const temp2b = state[2][1];
    state[2][0] = state[2][2];
    state[2][1] = state[2][3];
    state[2][2] = temp2a;
    state[2][3] = temp2b;
    
    // Row 3: shift left by 3 (or right by 1)
    await sleep(200);
    updateMatrix([3, 7, 11, 15]);
    const temp3 = state[3][3];
    state[3][3] = state[3][2];
    state[3][2] = state[3][1];
    state[3][1] = state[3][0];
    state[3][0] = temp3;
    
    await sleep(500);
    updateMatrix();
    updateOperationBox('shiftrows-box', false);
}

// Inverse ShiftRows transformation
async function invShiftRows() {
    updateOperationBox('shiftrows-box', true);
    stepTitle.textContent = 'Inverse ShiftRows';
    stepDescription.textContent = 'Cyclically shifting each row to the right';
    
    // Row 0: no shift
    // Row 1: shift right by 1
    await sleep(200);
    updateMatrix([1, 5, 9, 13]);
    const temp1 = state[1][3];
    state[1][3] = state[1][2];
    state[1][2] = state[1][1];
    state[1][1] = state[1][0];
    state[1][0] = temp1;
    
    // Row 2: shift right by 2
    await sleep(200);
    updateMatrix([2, 6, 10, 14]);
    const temp2a = state[2][0];
    const temp2b = state[2][1];
    state[2][0] = state[2][2];
    state[2][1] = state[2][3];
    state[2][2] = temp2a;
    state[2][3] = temp2b;
    
    // Row 3: shift right by 3 (or left by 1)
    await sleep(200);
    updateMatrix([3, 7, 11, 15]);
    const temp3 = state[3][0];
    state[3][0] = state[3][1];
    state[3][1] = state[3][2];
    state[3][2] = state[3][3];
    state[3][3] = temp3;
    
    await sleep(500);
    updateMatrix();
    updateOperationBox('shiftrows-box', false);
}

// Galois Field multiplication
function gmul(a, b) {
    let p = 0;
    for (let i = 0; i < 8; i++) {
        if (b & 1) p ^= a;
        const hi_bit_set = a & 0x80;
        a <<= 1;
        if (hi_bit_set) a ^= 0x1b;
        b >>= 1;
    }
    return p & 0xFF;
}

// MixColumns transformation
async function mixColumns() {
    updateOperationBox('mixcolumns-box', true);
    stepTitle.textContent = 'MixColumns';
    stepDescription.textContent = 'Mixing data within each column using Galois Field multiplication';
    
    for (let col = 0; col < 4; col++) {
        await sleep(400);
        const columnIndices = [col * 4, col * 4 + 1, col * 4 + 2, col * 4 + 3];
        updateMatrix(columnIndices);
        
        const s0 = state[0][col];
        const s1 = state[1][col];
        const s2 = state[2][col];
        const s3 = state[3][col];
        
        state[0][col] = gmul(0x02, s0) ^ gmul(0x03, s1) ^ s2 ^ s3;
        state[1][col] = s0 ^ gmul(0x02, s1) ^ gmul(0x03, s2) ^ s3;
        state[2][col] = s0 ^ s1 ^ gmul(0x02, s2) ^ gmul(0x03, s3);
        state[3][col] = gmul(0x03, s0) ^ s1 ^ s2 ^ gmul(0x02, s3);
        
        const cells = stateMatrix.children;
        columnIndices.forEach(idx => cells[idx].classList.add('changed'));
    }
    
    await sleep(500);
    updateMatrix();
    updateOperationBox('mixcolumns-box', false);
}

// Inverse MixColumns transformation
async function invMixColumns() {
    updateOperationBox('mixcolumns-box', true);
    stepTitle.textContent = 'Inverse MixColumns';
    stepDescription.textContent = 'Inversely mixing data within each column';
    
    for (let col = 0; col < 4; col++) {
        await sleep(400);
        const columnIndices = [col * 4, col * 4 + 1, col * 4 + 2, col * 4 + 3];
        updateMatrix(columnIndices);
        
        const s0 = state[0][col];
        const s1 = state[1][col];
        const s2 = state[2][col];
        const s3 = state[3][col];
        
        state[0][col] = gmul(0x0e, s0) ^ gmul(0x0b, s1) ^ gmul(0x0d, s2) ^ gmul(0x09, s3);
        state[1][col] = gmul(0x09, s0) ^ gmul(0x0e, s1) ^ gmul(0x0b, s2) ^ gmul(0x0d, s3);
        state[2][col] = gmul(0x0d, s0) ^ gmul(0x09, s1) ^ gmul(0x0e, s2) ^ gmul(0x0b, s3);
        state[3][col] = gmul(0x0b, s0) ^ gmul(0x0d, s1) ^ gmul(0x09, s2) ^ gmul(0x0e, s3);
        
        const cells = stateMatrix.children;
        columnIndices.forEach(idx => cells[idx].classList.add('changed'));
    }
    
    await sleep(500);
    updateMatrix();
    updateOperationBox('mixcolumns-box', false);
}

// AddRoundKey transformation
async function addRoundKey(round) {
    updateOperationBox('addroundkey-box', true);
    stepTitle.textContent = 'AddRoundKey';
    stepDescription.textContent = `XORing state with round key ${round}`;
    
    const roundKey = roundKeys[round];
    
    for (let col = 0; col < 4; col++) {
        for (let row = 0; row < 4; row++) {
            await sleep(80);
            const idx = col * 4 + row;
            updateMatrix([idx]);
            state[row][col] ^= roundKey[row][col];
            const cells = stateMatrix.children;
            cells[idx].classList.add('changed');
        }
    }
    
    await sleep(500);
    updateMatrix();
    updateOperationBox('addroundkey-box', false);
}

// Rotate word for key expansion
function rotWord(word) {
    return [word[1], word[2], word[3], word[0]];
}

// Substitute word for key expansion
function subWord(word) {
    return word.map(b => SBOX[b]);
}

// Key expansion (correct AES-128 implementation)
function keyExpansion(key) {
    const keyBytes = new TextEncoder().encode(key.padEnd(16, '\0'));
    
    // Convert key to 4x4 matrix (column-major)
    const w = [];
    for (let i = 0; i < 4; i++) {
        w[i] = [keyBytes[i * 4], keyBytes[i * 4 + 1], keyBytes[i * 4 + 2], keyBytes[i * 4 + 3]];
    }
    
    // Generate 40 more words (44 total for 11 round keys)
    for (let i = 4; i < 44; i++) {
        let temp = [...w[i - 1]];
        
        if (i % 4 === 0) {
            temp = rotWord(temp);
            temp = subWord(temp);
            temp[0] ^= RCON[(i / 4) - 1];
        }
        
        w[i] = [];
        for (let j = 0; j < 4; j++) {
            w[i][j] = w[i - 4][j] ^ temp[j];
        }
    }
    
    // Convert words to round keys
    roundKeys = [];
    for (let round = 0; round < 11; round++) {
        const roundKey = [[], [], [], []];
        for (let col = 0; col < 4; col++) {
            const word = w[round * 4 + col];
            for (let row = 0; row < 4; row++) {
                roundKey[row][col] = word[row];
            }
        }
        roundKeys.push(roundKey);
    }
}

// Update operation box visual state
function updateOperationBox(boxId, active) {
    const box = document.getElementById(boxId);
    if (active) {
        box.classList.add('active');
    } else {
        box.classList.remove('active');
    }
}

// Sleep function for animation
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main encryption process
async function encrypt() {
    if (isAnimating) return;
    
    const plaintext = plaintextInput.value;
    const key = keyInput.value;
    
    if (!plaintext || !key) {
        alert('Please enter both plaintext and key');
        return;
    }
    
    if (key.length !== 16) {
        alert('Key must be exactly 16 characters for AES-128');
        return;
    }
    
    isAnimating = true;
    encryptBtn.disabled = true;
    encryptedOutput.textContent = '';
    encryptedOutput.classList.remove('completed');
    
    // Initialize
    stringToState(plaintext);
    keyExpansion(key);
    updateMatrix();
    
    // Initial round
    currentRound = 0;
    roundCounter.textContent = `Round: ${currentRound}/10`;
    await addRoundKey(0);
    
    // Main rounds (1-9)
    for (let round = 1; round <= 9; round++) {
        currentRound = round;
        roundCounter.textContent = `Round: ${currentRound}/10`;
        
        await subBytes();
        await shiftRows();
        await mixColumns();
        await addRoundKey(round);
    }
    
    // Final round (10)
    currentRound = 10;
    roundCounter.textContent = `Round: ${currentRound}/10`;
    await subBytes();
    await shiftRows();
    await addRoundKey(10);
    
    // Display result
    stepTitle.textContent = 'Encryption Complete!';
    stepDescription.textContent = 'The plaintext has been successfully encrypted using PKCS#7 padding';
    const bytes = stateToBytes();
    const hexOutput = bytes.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    encryptedOutput.textContent = hexOutput;
    encryptedOutput.classList.add('completed');
    
    isAnimating = false;
    encryptBtn.disabled = false;
}

// Main decryption process
async function decrypt() {
    if (isAnimating) return;
    
    const ciphertext = ciphertextInput.value.replace(/\s/g, '');
    const key = decryptKeyInput.value;
    
    if (!ciphertext || !key) {
        alert('Please enter both ciphertext and key');
        return;
    }
    
    if (key.length !== 16) {
        alert('Key must be exactly 16 characters for AES-128');
        return;
    }
    
    if (ciphertext.length !== 32 || !/^[0-9A-Fa-f]+$/.test(ciphertext)) {
        alert('Ciphertext must be exactly 32 hexadecimal characters');
        return;
    }
    
    isAnimating = true;
    decryptBtn.disabled = true;
    encryptedOutput.textContent = '';
    encryptedOutput.classList.remove('completed');
    
    // Initialize
    hexToState(ciphertext);
    keyExpansion(key);
    updateMatrix();
    
    // Initial round (reverse order - start with round 10)
    currentRound = 10;
    roundCounter.textContent = `Round: ${currentRound}/10`;
    await addRoundKey(10);
    
    // Main rounds (9 down to 1)
    for (let round = 9; round >= 1; round--) {
        currentRound = round;
        roundCounter.textContent = `Round: ${currentRound}/10`;
        
        await invShiftRows();
        await invSubBytes();
        await addRoundKey(round);
        await invMixColumns();
    }
    
    // Final round (0)
    currentRound = 0;
    roundCounter.textContent = `Round: ${currentRound}/10`;
    await invShiftRows();
    await invSubBytes();
    await addRoundKey(0);
    
    // Display result
    stepTitle.textContent = 'Decryption Complete!';
    stepDescription.textContent = 'The ciphertext has been successfully decrypted';
    const bytes = stateToBytes();
    const unpaddedBytes = pkcs7Unpad(bytes);
    const decoder = new TextDecoder();
    const plaintext = decoder.decode(new Uint8Array(unpaddedBytes));
    encryptedOutput.textContent = plaintext;
    encryptedOutput.classList.add('completed');
    
    isAnimating = false;
    decryptBtn.disabled = false;
}

// Mode switching
function switchToEncryptMode() {
    isDecryptMode = false;
    encryptModeBtn.classList.add('active');
    decryptModeBtn.classList.remove('active');
    encryptionInputs.style.display = 'block';
    decryptionInputs.style.display = 'none';
    processTitle.textContent = 'Encryption Process';
    outputTitle.textContent = 'Encrypted Output (Hex)';
    stepTitle.textContent = 'Ready to Start';
    stepDescription.textContent = 'Enter your plaintext and key, then click "Start Encryption"';
    document.getElementById('subbytes-title').textContent = 'SubBytes';
    document.getElementById('subbytes-desc').textContent = 'Substitutes each byte using S-Box';
    document.getElementById('shiftrows-title').textContent = 'ShiftRows';
    document.getElementById('shiftrows-desc').textContent = 'Cyclically shifts rows';
    document.getElementById('mixcolumns-title').textContent = 'MixColumns';
    document.getElementById('mixcolumns-desc').textContent = 'Mixes column data';
}

function switchToDecryptMode() {
    isDecryptMode = true;
    decryptModeBtn.classList.add('active');
    encryptModeBtn.classList.remove('active');
    decryptionInputs.style.display = 'block';
    encryptionInputs.style.display = 'none';
    processTitle.textContent = 'Decryption Process';
    outputTitle.textContent = 'Decrypted Output (Text)';
    stepTitle.textContent = 'Ready to Start';
    stepDescription.textContent = 'Enter your ciphertext (hex) and key, then click "Start Decryption"';
    document.getElementById('subbytes-title').textContent = 'Inv SubBytes';
    document.getElementById('subbytes-desc').textContent = 'Inverse substitution';
    document.getElementById('shiftrows-title').textContent = 'Inv ShiftRows';
    document.getElementById('shiftrows-desc').textContent = 'Inverse row shifts';
    document.getElementById('mixcolumns-title').textContent = 'Inv MixColumns';
    document.getElementById('mixcolumns-desc').textContent = 'Inverse column mixing';
}

// Reset function
function reset() {
    if (isAnimating) return;
    
    plaintextInput.value = '';
    keyInput.value = '';
    ciphertextInput.value = '';
    decryptKeyInput.value = '';
    state = [];
    roundKeys = [];
    currentRound = 0;
    
    initializeMatrix();
    if (isDecryptMode) {
        stepTitle.textContent = 'Ready to Start';
        stepDescription.textContent = 'Enter your ciphertext (hex) and key, then click "Start Decryption"';
    } else {
        stepTitle.textContent = 'Ready to Start';
        stepDescription.textContent = 'Enter your plaintext and key, then click "Start Encryption"';
    }
    roundCounter.textContent = 'Round: 0/10';
    encryptedOutput.textContent = '';
    encryptedOutput.classList.remove('completed');
    
    document.querySelectorAll('.operation-box').forEach(box => {
        box.classList.remove('active');
    });
}

// Event listeners
encryptBtn.addEventListener('click', encrypt);
decryptBtn.addEventListener('click', decrypt);
resetBtn.addEventListener('click', reset);
encryptModeBtn.addEventListener('click', switchToEncryptMode);
decryptModeBtn.addEventListener('click', switchToDecryptMode);

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initializeMatrix();
});