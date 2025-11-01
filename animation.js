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
let resizeTimeout; // Timer for debouncing the resize event

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
        
        // Add a resize listener *once* when the canvas is first found
        // This makes the canvas responsive to window size changes
        window.addEventListener('resize', handleResize);
    }

    // Set the canvas's internal bitmap size to match its display size.
    updateCanvasSize();

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
        // Also update size on reset in case window changed while no sim was active
        updateCanvasSize(); 
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

// --- New Helper Functions for Responsiveness ---

/**
 * Updates the canvas's internal size to match its CSS size.
 * This prevents the drawing from becoming blurry or stretched.
 */
function updateCanvasSize() {
    if (!canvas) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

/**
 * Handles the window's resize event to redraw the canvas.
 * Uses a "debounce" timer to avoid redrawing too frequently, which hurts performance.
 */
function handleResize() {
    // Clear the old timeout to prevent it from firing
    clearTimeout(resizeTimeout);
    
    // Set a new timeout
    resizeTimeout = setTimeout(() => {
        // Only run if the simulation is active
        if (simulationData && canvas) {
            updateCanvasSize(); // Update the canvas dimensions
            drawFrame(); // Redraw the current step
        }
    }, 100); // Wait 100ms after the user stops resizing
}


// --- Main Drawing Function ---

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
    const startY = (canvas.height - frameHeight) / 2;

    // --- Draw Main Frames ---
    // Loop through each frame in the current state
    state.frames.forEach((page, index) => {
        const x = startX + index * (frameWidth + gap);

        // Default color
        let strokeColor = "#00ccff"; // Standard blue/cyan

        // --- Color Coding Logic ---
        if (currentStep > 0) {
            if (state.fault && state.replacedIndex === index) {
                // A fault just happened, and this is the frame that was *replaced*.
                strokeColor = "#ff5f5f"; // Red = Replaced
            } else if (!state.fault && state.hitIndex === index) {
                // A hit just happened. Highlight the frame that was hit.
                strokeColor = "#7cf57c"; // Green = Hit
            }
        }

        // Draw the frame box
        ctx.lineWidth = 3;
        ctx.fillStyle = "#1e2b3b";
        ctx.strokeStyle = strokeColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = strokeColor;
        ctx.beginPath();
        ctx.roundRect(x, startY, frameWidth, frameHeight, 10);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow

        // Draw the Page Number (e.g., "5" or "-")
        ctx.fillStyle = "#ffffff";
        ctx.font = `${Math.min(24, frameWidth * 0.4)}px Arial`; // Scale font size
        ctx.textAlign = "center";
        ctx.fillText(page === -1 ? "-" : page, x + frameWidth / 2, startY + frameHeight / 2 + 8);
    });

    // --- Draw Top Status Text (e.g., "HIT on Page 2") ---
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    if (state.page !== null) { // 'page' is null only on step 0
        ctx.fillStyle = state.fault ? "#ff5f5f" : "#7cf57c";
        // Show evicted page number if it was a fault
        const statusText = state.fault ?
            `FAULT on Page ${state.page} (Evicted Page ${state.evictedPage})` :
            `HIT on Page ${state.page}`;
        ctx.fillText(statusText, canvas.width / 2, 50);
    } else {
        ctx.fillStyle = "#facc15";
        ctx.fillText("Initial State", canvas.width / 2, 50);
    }

    // --- Draw Eviction Graphic (Bottom) ---
    // Only draw this if it was a page fault
    if (currentStep > 0 && state.fault) {
        drawEvictionGraphic(state.evictedPage, state.page, canvas.height - 60);
    }


    // --- Update UI Elements ---
    updateStats(state);
    updateTimeline();
}

/**
 * Draws the (Old Page) -> (New Page) graphic.
 * @param {number} oldPage - The page number that was evicted.
 * @param {number} newPage - The new page number that replaced it.
 * @param {number} y - The y-coordinate to draw at.
 */
function drawEvictionGraphic(oldPage, newPage, y) {
    const boxSize = 40;
    const arrowPadding = 20;
    const arrowLength = 30;
    const totalWidth = boxSize * 2 + arrowPadding * 2 + arrowLength;
    const startX = (canvas.width - totalWidth) / 2;
    
    const oldBoxX = startX;
    const newBoxX = startX + boxSize + arrowPadding * 2 + arrowLength;
    const arrowX = oldBoxX + boxSize + arrowPadding;
    
    // Draw "Old Page" box
    ctx.strokeStyle = "#ff5f5f"; // Red
    ctx.lineWidth = 2;
    ctx.fillStyle = "#1e2b3b";
    ctx.beginPath();
    ctx.roundRect(oldBoxX, y, boxSize, boxSize, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(oldPage, oldBoxX + boxSize / 2, y + boxSize / 2 + 6);
    
    // Draw "New Page" box
    ctx.strokeStyle = "#7cf57c"; // Green
    ctx.lineWidth = 2;
    ctx.fillStyle = "#1e2b3b";
    ctx.beginPath();
    ctx.roundRect(newBoxX, y, boxSize, boxSize, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(newPage, newBoxX + boxSize / 2, y + boxSize / 2 + 6);
    
    // Draw Arrow
    drawArrow(arrowX, y + boxSize / 2, arrowX + arrowLength, y + boxSize / 2, "#facc15");
    
    // Draw labels
    ctx.fillStyle = "#facc15";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Evicted", oldBoxX + boxSize / 2, y - 5);
    ctx.fillText("Added", newBoxX + boxSize / 2, y - 5);
}

/**
 * Helper function to draw an arrow.
 */
function drawArrow(fromX, fromY, toX, toY, color) {
    const headLength = 10;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
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
        traceContent += `Step ${index}:\n`;
        traceContent += `  - Referencing Page: ${step.page === null ? 'N/A' : step.page}\n`;
        traceContent += `  - Result: ${index === 0 ? 'Initial State' : (step.fault ? `Page Fault (Evicted ${step.evictedPage})` : 'Page Hit')}\n`;
        traceContent += `  - Frames: [${step.frames.join(', ')}]\n`; // Show frame contents
        traceContent += `  - Recency (LRU -> MRU): [${step.recency.join(', ')}]\n\n`;
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

