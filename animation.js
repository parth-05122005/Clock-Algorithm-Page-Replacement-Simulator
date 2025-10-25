/**
 * animation.js
 * * This is the "rendering engine." It's responsible for
 * drawing the simulation data onto the HTML canvas.
 * It also manages all the animation controls (play, pause, speed, etc.).
 */

// --- Module-Level Variables ---
let canvas, ctx; // Our drawing surface and its 2D context
let simulationData = null; // Will hold the 'steps' array from algorithm.js
let currentStep = 0; // The index of the step we are currently viewing
let animationInterval = null; // A timer ID for the 'play' function
let isPlaying = false;
let animationSpeed = 1000; // Default 1-second delay between steps


/**
 * Initializes the animation with new data.
 * This is called by main.js after the "Start" button is clicked.
 * @param {object} data - The full simulation data from algorithm.js.
 */
export function animateSimulation(data) {
    // Get the canvas element once
    if (!canvas) {
        canvas = document.getElementById("animation-canvas");
        ctx = canvas.getContext("2d");
    }
    
    // Set the canvas's internal bitmap size to match its display size.
    // This is CRITICAL to prevent the drawing from being blurry or pixelated.
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Store the data and reset the view
    simulationData = data;
    currentStep = 0;
    
    // Set the timeline slider's max value to the number of steps
    const timeline = document.getElementById('timeline-slider');
    timeline.max = simulationData.steps.length - 1;
    timeline.value = 0;
    
    drawFrame(); // Draw the very first frame (initial state)
}

/**
 * Resets the entire visualizer to a clean slate.
 * Called before a new simulation starts.
 */
export function resetAnimation() {
    pause(); // Stop any ongoing animation
    simulationData = null;
    currentStep = 0;
    if (ctx) { // Clear the canvas only if it exists
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    // Reset all the text in the stats box
    document.getElementById("page-faults").textContent = `Page Faults: 0`;
    document.getElementById("page-hits").textContent = `Page Hits: 0`;
    document.getElementById("miss-ratio").textContent = `Miss Ratio: 0%`;
    document.getElementById("hit-ratio").textContent = `Hit Ratio: 0%`;
    document.getElementById("timeline-label").textContent = `Step: 0`;
    document.getElementById("timeline-slider").value = 0;
    document.getElementById("timeline-slider").max = 0;
}

/**
 * Starts auto-playing the animation.
 */
export function play() {
    // Don't do anything if already playing or if there's no data
    if (isPlaying || !simulationData) return;
    isPlaying = true;
    
    // If at the end, restart from the beginning
    if (currentStep >= simulationData.steps.length - 1) {
        currentStep = 0;
    }
    
    // Start a timer that advances the frame
    animationInterval = setInterval(() => {
        if (currentStep < simulationData.steps.length - 1) {
            currentStep++;
            drawFrame(); // Advance and draw
        } else {
            pause(); // We've reached the end, so stop
        }
    }, animationSpeed); // 'animationSpeed' controls the delay
}

/**
 * Pauses the auto-play.
 */
export function pause() {
    clearInterval(animationInterval); // Stop the timer
    isPlaying = false;
}

/**
 * Manually moves one step forward.
 */
export function stepForward() {
    // Stop if at the end
    if (!simulationData || currentStep >= simulationData.steps.length - 1) return;
    pause(); // Always pause when stepping manually
    currentStep++;
    drawFrame();
}

/**
 * Manually moves one step backward.
 */
export function stepBackward() {
    // Stop if at the beginning
    if (!simulationData || currentStep <= 0) return;
    pause();
    currentStep--;
    drawFrame();
}

/**
 * Jumps to a specific step from the timeline slider.
 * @param {number} step - The step index to jump to.
 */
export function jumpToStep(step) {
    if (!simulationData) return;
    pause();
    currentStep = parseInt(step); // Ensure the value is a number
    drawFrame();
}

/**
 * Sets the animation speed from the speed slider.
 * @param {number} value - The raw value from the slider (100 to 2000).
 */
export function setSpeed(value) {
    // The slider is "speed" (higher = faster)
    // The interval is "delay" (lower = faster)
    // So we invert the value. (2100 - 2000 = 100ms, 2100 - 100 = 2000ms)
    animationSpeed = 2100 - parseInt(value);
    
    // If we're currently playing, restart the interval with the new speed
    if (isPlaying) {
        pause();
        play();
    }
}

/**
 * This is the master function that draws everything on the canvas
 * for the 'currentStep'.
 */
function drawFrame() {
    // Safety check, don't draw if data isn't ready
    if (!simulationData || !ctx) return;

    const state = simulationData.steps[currentStep]; // Get the data for this step
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // --- Dynamic Sizing Logic ---
    // This logic dynamically scales the frames to fit the canvas
    const numFrames = state.frames.length;
    const baseFrameWidth = 80;
    const baseGap = 40;
    const padding = 50; // Keep 50px padding on the sides
    const frameHeight = 80; // Frames are always 80px tall

    let frameWidth = baseFrameWidth;
    let gap = baseGap;

    // Calculate the total width our frames *want* to be
    let totalWidth = (numFrames * frameWidth) + ((numFrames - 1) * gap);

    // If that width is too big for the canvas, we need to scale down
    if (totalWidth > canvas.width - padding) {
        const scale = (canvas.width - padding) / totalWidth;
        frameWidth *= scale; // Scale down the width
        gap *= scale; // Scale down the gap
    }

    // Recalculate the centered starting X position
    totalWidth = (numFrames * frameWidth) + ((numFrames - 1) * gap);
    const startX = (canvas.width - totalWidth) / 2;
    // Vertically center the frames
    const startY = (canvas.height - frameHeight) / 2 + 20; 

    // --- Draw Frames ---
    // Loop through each frame in the current state
    state.frames.forEach((page, index) => {
        const x = startX + index * (frameWidth + gap);
        
        // Default color
        ctx.strokeStyle = "#00ccff"; // Standard blue/cyan
        
        // --- Color Coding Logic ---
        if (currentStep > 0 && state.fault) {
            // A fault just happened. We need to highlight the frame that was *replaced*.
            // The 'pointer' has already moved *past* the replaced frame,
            // so we look at the index *before* the current pointer.
            const replacedIndex = (state.pointer === 0) ? numFrames - 1 : state.pointer - 1;
            if (replacedIndex === index) {
                ctx.strokeStyle = "#ff5f5f"; // Red = Replaced
            }
        } else if (currentStep > 0 && !state.fault && state.hitIndex === index) {
            // A hit just happened. Highlight the frame that was hit.
            ctx.strokeStyle = "#7cf57c"; // Green = Hit
        }
        
        // Draw the frame box
        ctx.lineWidth = 3;
        ctx.fillStyle = "#1e293b";
        ctx.shadowBlur = 10;
        ctx.shadowColor = ctx.strokeStyle; // Use the (potentially modified) stroke color for the glow
        ctx.beginPath();
        ctx.roundRect(x, startY, frameWidth, frameHeight, 10); // Draw a rounded rectangle
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow

        // Draw the Page Number (e.g., "5" or "-")
        ctx.fillStyle = "#ffffff";
        ctx.font = `${Math.min(24, frameWidth * 0.4)}px Arial`; // Scale font size
        ctx.textAlign = "center";
        ctx.fillText(page === -1 ? "-" : page, x + frameWidth / 2, startY + frameHeight / 2 + 8);

        // Draw the Use Bit (e.g., "R:1")
        ctx.fillStyle = "#93c5fd";
        ctx.font = `${Math.min(16, frameWidth * 0.25)}px monospace`; // Scale font size
        ctx.fillText(`R:${state.useBits[index]}`, x + frameWidth / 2, startY + frameHeight + 20);
    });

    // --- Draw Clock Pointer (Yellow Arrow) ---
    // The pointer points to the *next* frame to be inspected
    const pointerX = startX + state.pointer * (frameWidth + gap) + frameWidth / 2;
    const pointerY = startY - 40;
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.moveTo(pointerX, pointerY);
    ctx.lineTo(pointerX - 10, pointerY - 20);
    ctx.lineTo(pointerX + 10, pointerY - 20);
    ctx.closePath();
    ctx.fill();

    // --- Draw Top Status Text (e.g., "HIT on Page 2") ---
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    if (state.page !== null) { // 'page' is null only on step 0
        ctx.fillStyle = state.fault ? "#ff5f5f" : "#7cf57c";
        ctx.fillText(`${state.fault ? 'FAULT' : 'HIT'} on Page ${state.page}`, canvas.width / 2, 50);
    } else {
        ctx.fillStyle = "#facc15";
        ctx.fillText("Initial State", canvas.width / 2, 50);
    }

    // --- Update UI Elements ---
    updateStats(state);
    updateTimeline();
}

/**
 * Updates the statistics display (faults, hits, ratios) in the HTML.
 * @param {object} state - The current simulation step object.
 */
function updateStats(state) {
    // Live update of counts based on the current step's data
    document.getElementById("page-faults").textContent = `Page Faults: ${state.faults}`;
    document.getElementById("page-hits").textContent = `Page Hits: ${state.hits}`;
    
    // Only show final ratios at the very last step
    if (currentStep === simulationData.steps.length - 1) {
        document.getElementById("miss-ratio").textContent = `Miss Ratio: ${simulationData.missRatio}%`;
        document.getElementById("hit-ratio").textContent = `Hit Ratio: ${simulationData.hitRatio}%`;
    } else {
        // Show N/A during simulation as ratios are misleading mid-run
        document.getElementById("miss-ratio").textContent = `Miss Ratio: N/A`;
        document.getElementById("hit-ratio").textContent = `Hit Ratio: N/A`;
    }
}

/**
 * Updates the timeline slider and step label to match the current step.
 */
function updateTimeline() {
    document.getElementById("timeline-slider").value = currentStep;
    document.getElementById("timeline-label").textContent = `Step: ${currentStep}`;
}

/**
 * Exports the current canvas state as a PNG image.
 */
export function exportScreenshot() {
    if (!canvas) return; // Don't export if canvas isn't ready
    const link = document.createElement('a');
    link.download = 'clock-algorithm-snapshot.png';
    link.href = canvas.toDataURL(); // Convert canvas to Base64 image data
    link.click(); // Programmatically click the link to trigger download
}

/**
 * Exports the entire simulation trace (all steps) as a TXT file.
 */
export function exportTrace() {
    if (!simulationData) return;
    
    let traceContent = "Clock Algorithm Execution Trace\n===================================\n";
    
    // Build a string by looping through every step
    simulationData.steps.forEach((step, index) => {
        traceContent += `Step ${index}:\n`;
        traceContent += `  - Referencing Page: ${step.page === null ? 'N/A' : step.page}\n`;
        traceContent += `  - Result: ${index === 0 ? 'Initial State' : (step.fault ? 'Page Fault' : 'Page Hit')}\n`;
        traceContent += `  - Frames: [${step.frames.join(', ')}]\n`; // Show frame contents
        traceContent += `  - Use Bits: [${step.useBits.join(', ')}]\n`; // Show use bits
        traceContent += `  - Clock Pointer at index: ${step.pointer}\n\n`;
    });

    // Create a "Blob" (Binary Large Object) from the text string
    const blob = new Blob([traceContent], { type: 'text/plain' });
    
    // Create a temporary link to download the blob
    const link = document.createElement('a');
    link.download = 'clock-algorithm-trace.txt';
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href); // Clean up the temporary URL
}

