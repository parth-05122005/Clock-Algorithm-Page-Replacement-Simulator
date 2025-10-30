/**
 * animation.js
 * * This is the "rendering engine" for the LRU Visualizer.
 * It draws the simulation data onto the HTML canvas and manages animation controls.
 */

// --- Module-Level Variables ---
let canvas, ctx;
let simulationData = null;
let currentStep = 0;
let animationInterval = null;
let isPlaying = false;
let animationSpeed = 1000;

/**
 * Initializes the animation with new data.
 * @param {object} data - The full simulation data from runLRUAlgorithm.
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
    // This logic dynamically scales the main frames to fit the canvas
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
    // Vertically center the main frames
    const startY = (canvas.height - frameHeight) / 2 - 20; // Move main frames up slightly

    // --- Draw Main Frames ---
    // Loop through each frame in the current state
    state.frames.forEach((page, index) => {
        const x = startX + index * (frameWidth + gap);
        
        // --- Color Coding Logic ---
        let color = "#00ccff"; // Default blue
        
        if (currentStep > 0) {
            // Check if this frame was the one that got replaced
            if (state.fault && state.evictedPage === state.prevState.frames[index] && page !== state.evictedPage) {
                color = "#ff5f5f"; // Red = Replaced
            } 
            // Check if this frame was the one that got hit
            else if (!state.fault && page === state.page) {
                color = "#7cf57c"; // Green = Hit
            }
        }

        // Draw the frame box
        drawFrameBox(x, startY, frameWidth, frameHeight, page, color);
    });

    // --- Draw Top Status Text (e.g., "HIT on Page 2") ---
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    if (state.page !== null) { // 'page' is null only on step 0
        if (state.fault) {
            ctx.fillStyle = "#ff5f5f"; // Red for fault
            let faultText = `FAULT on Page ${state.page}`;
            // If a page was evicted, add it to the text
            if (state.evictedPage !== null) {
                faultText += ` (Evicted Page ${state.evictedPage})`;
            }
            ctx.fillText(faultText, canvas.width / 2, 50);
        } else {
            ctx.fillStyle = "#7cf57c"; // Green for hit
            ctx.fillText(`HIT on Page ${state.page}`, canvas.width / 2, 50);
        }
    } else {
        ctx.fillStyle = "#facc15"; // Yellow for initial state
        ctx.fillText("Initial State", canvas.width / 2, 50);
    }

    // --- Draw "Previous" and "Current" Queues ---
    // Only draw these after step 0
    if (currentStep > 0 && state.prevState) {
        // --- Layout for side-by-side mini queues ---
        const miniW = 40;
        const miniH = 40;
        const miniGap = 10;
        const arrowWidth = 70; // Space for " -> " arrow
        const queueWidth = (numFrames * miniW) + ((numFrames - 1) * miniGap);
        const totalBlockWidth = (queueWidth * 2) + arrowWidth;
        
        const blockStartX = (canvas.width - totalBlockWidth) / 2;
        const queueY = startY + 160;

        const prevQueueX = blockStartX;
        const currQueueX = blockStartX + queueWidth + arrowWidth;
        
        // Draw the two queues
        drawMiniQueue("Previous Frames", state.prevState.frames, prevQueueX, queueY, miniW, miniH, miniGap);
        drawMiniQueue("Current Frames", state.frames, currQueueX, queueY, miniW, miniH, miniGap);

        // Draw the arrow between them
        const arrowY = queueY + miniH / 2; // Vertically center arrow
        const arrowStartX = prevQueueX + queueWidth + 20;
        const arrowEndX = currQueueX - 20;
        drawArrow(arrowStartX, arrowY, arrowEndX, arrowY);
    }
    
    // --- Update UI Elements ---
    updateStats(state);
    updateTimeline();
}

/**
 * Helper function to draw a single frame box (used for main frames).
 */
function drawFrameBox(x, y, w, h, text, color) {
    ctx.lineWidth = 3;
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color; // Use the color for the glow
    
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset shadow

    // Draw the Page Number (e.g., "5" or "-")
    ctx.fillStyle = "#ffffff";
    ctx.font = `${Math.min(24, w * 0.4)}px Arial`; // Scale font
    ctx.textAlign = "center";
    ctx.fillText(text === -1 ? "-" : text, x + w / 2, y + h / 2 + 8);
}

/**
 * Helper function to draw the "Previous" and "Current" mini-queues.
 */
function drawMiniQueue(title, frames, startX, y, w, h, gap) {
    const numFrames = frames.length;

    // Draw title
    const totalWidth = (numFrames * w) + ((numFrames - 1) * gap);
    ctx.fillStyle = "#facc15"; // Changed color to theme yellow
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(title, startX + totalWidth / 2, y - 15);

    // Draw mini-frames
    frames.forEach((page, index) => {
        const x = startX + index * (w + gap);
        let color = "#555"; // Default grey
        
        if (currentStep > 0) {
            const state = simulationData.steps[currentStep];
            // Highlight the *new* page on a fault
            if (title === "Current Frames" && state.fault && page === state.page) {
                color = "#ff5f5f";
            } 
            // Highlight the *hit* page
            else if (title === "Current Frames" && !state.fault && page === state.page) {
                color = "#7cf57c";
            } 
            // Highlight any non-empty frame
            else if (page !== -1) {
                color = "#00ccff";
            }
        }
        
        // Draw small box
        ctx.lineWidth = 2;
        ctx.fillStyle = "#1e293b";
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 5);
        ctx.fill();
        ctx.stroke();

        // Draw small text
        ctx.fillStyle = "#fff";
        ctx.font = "14px Arial";
        ctx.fillText(page === -1 ? "-" : page, x + w / 2, y + h / 2 + 5);
    });
}

/**
 * Helper function to draw an arrow.
 */
function drawArrow(x1, y1, x2, y2) {
    ctx.fillStyle = "#facc15"; // Changed color to theme yellow
    ctx.strokeStyle = "#facc15"; // Changed color to theme yellow
    ctx.lineWidth = 2;
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 10, y2 - 5);
    ctx.lineTo(x2 - 10, y2 + 5);
    ctx.closePath();
    ctx.fill();
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
    link.download = 'lru-algorithm-snapshot.png';
    link.href = canvas.toDataURL(); // Convert canvas to Base64 image data
    link.click(); // Programmatically click the link to trigger download
}

/**
 * Exports the entire simulation trace (all steps) as a TXT file.
 */
export function exportTrace() {
    if (!simulationData) return;
    
    let traceContent = "LRU Algorithm Execution Trace\n===================================\n";
    
    // Build a string by looping through every step
    simulationData.steps.forEach((step, index) => {
        // Handle the initial state (step 0)
        if (index === 0) {
            traceContent += `Step 0: Initial State\n`;
            traceContent += `  - Frames: [${step.frames.join(', ')}]\n\n`;
            return; // Skip to the next loop iteration
        }
        
        // Handle all subsequent steps
        traceContent += `Step ${index}:\n`;
        traceContent += `  - Referencing Page: ${step.page}\n`;
        traceContent += `  - Result: ${step.fault ? 'Page Fault' : 'Page Hit'}\n`;
        if (step.fault && step.evictedPage !== null) {
            traceContent += `  - Evicted Page: ${step.evictedPage}\n`;
        }
        traceContent += `  - Previous Frames: [${step.prevState.frames.join(', ')}]\n`;
        traceContent += `  - Current Frames: [${step.frames.join(', ')}]\n`;
        traceContent += `  - Recency (LRU to MRU): [${step.recency.join(' -> ')}]\n\n`;
    });

    // Create a "Blob" (Binary Large Object) from the text string
    const blob = new Blob([traceContent], { type: 'text/plain' });
    
    // Create a temporary link to download the blob
    const link = document.createElement('a');
    link.download = 'lru-algorithm-trace.txt';
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href); // Clean up the temporary URL
}

