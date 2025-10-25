/**
 * algorithm.js
 * * Contains the core logic for the Clock Page Replacement Algorithm.
 * This file does not interact with the DOM. It only performs calculations.
 */

/**
 * Executes the Clock Page Replacement algorithm.
 * @param {number[]} pages - An array of page numbers (e.g., [1, 2, 3, 2, 4]).
 * @param {number} frameCount - The total number of available frames in memory.
 * @returns {object} A simulation data object containing all steps and final stats.
 */
export function runClockAlgorithm(pages, frameCount) {
    // --- Initialization ---
    // Represents physical memory frames, -1 is 'Empty'
    const frames = Array(frameCount).fill(-1);
    // The "Reference Bit" for each frame
    const useBits = Array(frameCount).fill(0);
    // The "clock hand" that points to the next frame to inspect
    let clockPointer = 0;
    let pageFaults = 0;
    let pageHits = 0;
    // Array to store the state at every single step for animation
    const steps = [];

    // Push the initial state (all frames empty) before processing any pages
    steps.push({
        frames: [...frames], // Use spread operator for a new copy
        useBits: [...useBits], 
        pointer: clockPointer,
        page: null,      // No page being processed yet
        fault: false,
        faults: 0,
        hits: 0
    });

    // --- Process Each Page in the Reference String ---
    for (const page of pages) {
        let hit = false;
        let pageFoundIndex = -1; // To track *which* frame was a hit

        // 1. Check for a PAGE HIT
        for (let j = 0; j < frameCount; j++) {
            if (frames[j] === page) {
                // Page is already in memory!
                useBits[j] = 1; // Set the reference bit to 1
                hit = true;
                pageHits++;
                pageFoundIndex = j;
                break; // Exit loop once page is found
            }
        }

        // 2. Handle PAGE FAULT (if 'hit' is still false)
        if (!hit) {
            pageFaults++;
            
            // This is the core "Clock" logic:
            // Find a frame to replace by checking the use bit.
            while (true) {
                if (useBits[clockPointer] === 0) {
                    // Found a frame to replace (Use Bit is 0)
                    frames[clockPointer] = page;
                    useBits[clockPointer] = 1; // Set use bit for the new page
                    // Move pointer to the *next* frame for the next inspection
                    clockPointer = (clockPointer + 1) % frameCount;
                    break; // Exit the while loop, replacement is done
                } else {
                    // This frame was referenced (Use Bit is 1)
                    // Give it a "second chance": set its bit to 0
                    useBits[clockPointer] = 0;
                    // Move pointer to the next frame to inspect
                    clockPointer = (clockPointer + 1) % frameCount;
                }
            }
        }

        // 3. Store a snapshot of the current state for animation
        // This happens after every single page, whether it was a hit or a fault
        steps.push({
            frames: [...frames],      // Copy of the frames array
            useBits: [...useBits],    // Copy of the use bits array
            pointer: clockPointer,
            page: page,               // The page we just processed
            fault: !hit,              // Boolean, true if it was a fault
            hitIndex: pageFoundIndex, // -1 if fault, or the index of the hit
            faults: pageFaults,       // Cumulative fault count
            hits: pageHits            // Cumulative hit count
        });
    }

    // --- Final Statistics Calculation ---
    const totalRequests = pages.length;
    // Calculate final ratios (as percentages, fixed to 2 decimal places)
    const hitRatio = totalRequests > 0 ? ((pageHits / totalRequests) * 100).toFixed(2) : 0;
    const missRatio = totalRequests > 0 ? ((pageFaults / totalRequests) * 100).toFixed(2) : 0;

    // Return the complete simulation data object
    return {
        steps,
        pageFaults,
        pageHits,
        hitRatio,
        missRatio,
        totalSteps: steps.length
    };
}

