// Component information database
const componentInfo = {
    core: {
        title: "Processor Core",
        description: "The heart of the ARM Cortex-M microcontroller, implementing the ARMv6-M, ARMv7-M, or ARMv8-M architecture.",
        features: [
            { name: "Architecture", value: "RISC 32-bit" },
            { name: "Pipeline", value: "3-stage (M0/M0+) to 6-stage (M7)" },
            { name: "Instruction Set", value: "Thumb / Thumb-2" },
            { name: "Performance", value: "0.9 to 5.0 CoreMark/MHz" }
        ],
        details: [
            "Implements Harvard or von Neumann architecture",
            "Low power consumption with sleep modes",
            "Deterministic interrupt latency",
            "Optional hardware multiply and divide",
            "Fast interrupt handling (6-12 cycles)"
        ]
    },
    nvic: {
        title: "NVIC - Nested Vectored Interrupt Controller",
        description: "Manages all system exceptions and interrupts with hardware priority and automatic state saving.",
        features: [
            { name: "Interrupts", value: "Up to 240 external" },
            { name: "Priority Levels", value: "8 to 256 levels" },
            { name: "Tail-chaining", value: "6 cycle overhead" },
            { name: "Late-arrival", value: "Zero penalty" }
        ],
        details: [
            "Hardware priority management",
            "Automatic state saving and restoration",
            "Interrupt masking by priority",
            "Supports nested interrupts",
            "Tail-chaining for back-to-back interrupts",
            "Late-arrival optimization"
        ]
    },
    mpu: {
        title: "MPU - Memory Protection Unit",
        description: "Provides memory protection by defining memory regions with specific access permissions.",
        features: [
            { name: "Regions", value: "8 or 16 configurable" },
            { name: "Attributes", value: "Read/Write/Execute" },
            { name: "Granularity", value: "32 bytes minimum" },
            { name: "Background Region", value: "Optional default" }
        ],
        details: [
            "Prevents unauthorized access to memory",
            "Defines memory attributes (cacheable, bufferable)",
            "Supports overlapping regions with priority",
            "Essential for RTOS and safety applications",
            "Generates MemManage fault on violation"
        ]
    },
    bus: {
        title: "Bus Matrix",
        description: "High-performance multi-layer AHB and APB bus system for concurrent access to peripherals and memory.",
        features: [
            { name: "AHB", value: "Advanced High-performance Bus" },
            { name: "APB", value: "Advanced Peripheral Bus" },
            { name: "I-Code", value: "Instruction fetch" },
            { name: "D-Code", value: "Data access" }
        ],
        details: [
            "Separate instruction and data buses (Harvard)",
            "Enables concurrent access to memory and peripherals",
            "AHB for high-speed peripherals",
            "APB for low-power peripherals",
            "Multi-layer architecture reduces bottlenecks",
            "DMA-capable for efficient data transfer"
        ]
    },
    scb: {
        title: "SCB - System Control Block",
        description: "Provides system configuration and status information including CPUID, system control, and fault status.",
        features: [
            { name: "CPUID", value: "Processor identification" },
            { name: "System Control", value: "Power & clock config" },
            { name: "Fault Status", value: "Exception information" },
            { name: "Priority Group", value: "Interrupt grouping" }
        ],
        details: [
            "Configure interrupt priority grouping",
            "System reset control",
            "Power management configuration",
            "Fault status and address registers",
            "System handler priority configuration",
            "Vector table offset configuration"
        ]
    },
    systick: {
        title: "SysTick Timer",
        description: "24-bit system timer for RTOS tick generation and simple timing applications.",
        features: [
            { name: "Counter", value: "24-bit down counter" },
            { name: "Clock Source", value: "Core or external" },
            { name: "Interrupt", value: "On zero count" },
            { name: "Reload", value: "Automatic reload" }
        ],
        details: [
            "Dedicated for RTOS time base",
            "Generates periodic interrupts",
            "Can use processor or external clock",
            "Simple configuration and operation",
            "Always available on Cortex-M cores"
        ]
    },
    debug: {
        title: "Debug System - CoreSight",
        description: "Comprehensive debug and trace infrastructure based on ARM CoreSight technology.",
        features: [
            { name: "DWT", value: "Data Watchpoint & Trace" },
            { name: "ITM", value: "Instrumentation Trace" },
            { name: "FPB", value: "Flash Patch & Breakpoint" },
            { name: "TPIU", value: "Trace Port Interface" }
        ],
        details: [
            "Hardware breakpoints (4-8)",
            "Data watchpoints for memory access",
            "Program counter sampling",
            "Instrumentation trace (printf debugging)",
            "Exception and event trace",
            "Flash patching for on-the-fly fixes",
            "ETM (Embedded Trace Macrocell) on some variants"
        ]
    },
    fpu: {
        title: "FPU - Floating Point Unit",
        description: "Hardware floating-point unit implementing IEEE 754 single or double precision arithmetic.",
        features: [
            { name: "Precision", value: "Single or Double" },
            { name: "Standard", value: "IEEE 754 compliant" },
            { name: "Registers", value: "32 x 32-bit (S registers)" },
            { name: "Operations", value: "Add, Sub, Mul, Div, MAC" }
        ],
        details: [
            "Significantly faster than software emulation",
            "Single-precision on M4/M7",
            "Double-precision on M7",
            "Fused multiply-accumulate (MAC)",
            "Supports all IEEE 754 operations",
            "Lazy context save for interrupts",
            "Useful for DSP and control algorithms"
        ]
    },
    memory: {
        title: "Memory System",
        description: "Unified 4GB address space with optimized regions for code, SRAM, peripherals, and system components.",
        features: [
            { name: "Address Space", value: "4GB unified" },
            { name: "Code Region", value: "0x00000000 - 0x1FFFFFFF" },
            { name: "SRAM Region", value: "0x20000000 - 0x3FFFFFFF" },
            { name: "Peripherals", value: "0x40000000 - 0x5FFFFFFF" }
        ],
        details: [
            "Predefined memory map for compatibility",
            "Code region: Flash, ROM (512MB)",
            "SRAM region: On-chip RAM (512MB)",
            "Peripheral region: APB/AHB devices (512MB)",
            "External RAM region (1GB)",
            "System region: NVIC, SCB, Debug (512MB)",
            "Bit-banding support on some regions",
            "Cacheable and bufferable attributes"
        ]
    },
    sau: {
        title: "SAU - Security Attribution Unit",
        description: "TrustZone security extension for ARM Cortex-M33, dividing memory into Secure and Non-Secure regions.",
        features: [
            { name: "Regions", value: "8 configurable SAU regions" },
            { name: "Granularity", value: "32 bytes minimum" },
            { name: "Security", value: "Secure/Non-Secure split" },
            { name: "IDAU", value: "Implementation Defined Attribution" }
        ],
        details: [
            "Defines Secure and Non-Secure memory regions",
            "Works with MPU for fine-grained protection",
            "Supports secure/non-secure transitions",
            "Prevents unauthorized access to secure memory",
            "Essential for TrustZone implementation",
            "Configurable at runtime (Secure mode only)",
            "Supports nested secure/non-secure calls"
        ]
    },
    cache: {
        title: "Cache System",
        description: "Optional instruction and data cache for improved performance with external memory.",
        features: [
            { name: "I-Cache", value: "Up to 16KB" },
            { name: "D-Cache", value: "Up to 16KB" },
            { name: "Line Size", value: "32 bytes" },
            { name: "Associativity", value: "2-way set associative" }
        ],
        details: [
            "Reduces external memory access latency",
            "Configurable cache sizes",
            "Write-through or write-back policies",
            "Cache maintenance operations",
            "Improves code execution speed",
            "Optional on Cortex-M33 implementations",
            "Cache coherency support"
        ]
    }
};

// Component interaction
document.addEventListener('DOMContentLoaded', () => {
    const components = document.querySelectorAll('.component');
    const infoPanel = document.getElementById('info-panel');
    const infoTitle = document.getElementById('info-title');
    const infoContent = document.getElementById('info-content');
    const closeBtn = document.getElementById('close-info');

    components.forEach(component => {
        component.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Remove active class from all components
            components.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked component
            component.classList.add('active');
            
            // Get component data
            const componentId = component.dataset.component;
            const info = componentInfo[componentId];
            
            if (info) {
                showInfo(info);
            }
        });

        // Add hover effect to highlight connections
        component.addEventListener('mouseenter', () => {
            highlightConnections(component.dataset.component);
        });

        component.addEventListener('mouseleave', () => {
            resetConnections();
        });
    });

    closeBtn.addEventListener('click', () => {
        infoPanel.classList.remove('active');
        components.forEach(c => c.classList.remove('active'));
    });

    // Close info panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!infoPanel.contains(e.target) && !e.target.closest('.component')) {
            infoPanel.classList.remove('active');
            components.forEach(c => c.classList.remove('active'));
        }
    });

    function showInfo(info) {
        infoTitle.textContent = info.title;
        
        let contentHTML = `<p>${info.description}</p>`;
        
        // Features grid
        contentHTML += '<div class="feature-list">';
        info.features.forEach(feature => {
            contentHTML += `
                <div class="feature-item">
                    <strong>${feature.name}</strong>
                    <span>${feature.value}</span>
                </div>
            `;
        });
        contentHTML += '</div>';
        
        // Details list
        contentHTML += '<h4>Key Features</h4><ul>';
        info.details.forEach(detail => {
            contentHTML += `<li>${detail}</li>`;
        });
        contentHTML += '</ul>';
        
        infoContent.innerHTML = contentHTML;
        infoPanel.classList.add('active');
    }

    function highlightConnections(componentId) {
        const connectionMap = {
            'core': ['.debug-trace', '.interrupt-trace'],
            'nvic': ['.interrupt-trace'],
            'debug': ['.debug-trace'],
            'bus': ['.ahb-trace', '.apb-trace'],
            'memory': ['.flash-trace', '.sram-trace', '.ext-mem-bus']
        };

        const traces = connectionMap[componentId];
        if (traces) {
            traces.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    el.style.strokeWidth = '5';
                    el.style.opacity = '1';
                });
            });
        }
    }

    function resetConnections() {
        const traces = document.querySelectorAll('.connection-trace');
        traces.forEach(trace => {
            trace.style.strokeWidth = '3';
            trace.style.opacity = '';
        });
    }

    // Animate data flow through buses
    animateBusFlow();
    
    // Add random memory access flashes
    setInterval(randomMemoryAccess, 2000);
});

function animateBusFlow() {
    const busLines = document.querySelectorAll('.bus-line');
    
    busLines.forEach((line, index) => {
        line.style.strokeDasharray = '20 10';
        line.style.animation = `bus-flow 3s linear infinite ${index * 0.3}s`;
    });
}

function randomMemoryAccess() {
    const memoryRegions = document.querySelectorAll('#memory rect[x]');
    const randomRegion = memoryRegions[Math.floor(Math.random() * memoryRegions.length)];
    
    if (randomRegion && randomRegion.getAttribute('x') !== '500') {
        const originalFill = randomRegion.getAttribute('fill');
        randomRegion.setAttribute('fill', 'rgba(253,121,168,0.8)');
        
        setTimeout(() => {
            randomRegion.setAttribute('fill', originalFill);
        }, 200);
    }
}

// Add circuit pattern animation
function animateCircuitPattern() {
    const pattern = document.getElementById('circuitPattern');
    if (pattern) {
        const circles = pattern.querySelectorAll('circle');
        circles.forEach((circle, index) => {
            setInterval(() => {
                const currentOpacity = parseFloat(circle.getAttribute('fill').match(/[\d.]+\)$/)[0]);
                const newOpacity = currentOpacity === 0.2 ? 0.5 : 0.2;
                circle.setAttribute('fill', `rgba(0,217,255,${newOpacity})`);
            }, 2000 + index * 200);
        });
    }
}

// Initialize animations
animateCircuitPattern();