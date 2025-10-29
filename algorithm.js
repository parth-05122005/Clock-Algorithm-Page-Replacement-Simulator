/**
 * algorithm.js
 * * Contains the core logic for the LRU Page Replacement Algorithm.
 * This file does not interact with the DOM. It only performs calculations.
 */

/**
 * Executes the LRU Page Replacement algorithm.
 * @param {number[]} pages - An array of page numbers (e.g., [1, 2, 3, 2, 4]).
 * @param {number} frameCount - The total number of available frames in memory.
 * @returns {object} A simulation data object containing all steps and final stats.
 */
export function runLRUAlgorithm(pages, frameCount) {
    // --- Initialization ---
    // Represents physical memory frames, -1 is 'Empty'
    const frames = Array(frameCount).fill(-1);
    
    // Tracks the order of use. The item at index 0 is the LEAST recently used.
    // The item at the end is the MOST recently used.
    const recency = []; 
    
    let pageFaults = 0;
    let pageHits = 0;
    // Array to store the state at every single step for animation
    const steps = [];

    // Push the initial state (all frames empty) before processing any pages
    steps.push({
        frames: [...frames],
        recency: [...recency], // Capture recency state
        page: null,
        fault: false,
        faults: 0,
        hits: 0,
        hitIndex: -1,
        evictedPage: null // Page that was kicked out
    });

    // --- Process Each Page in the Reference String ---
    for (const page of pages) {
        let hit = false;
        let pageFoundIndex = -1;
        let evictedPage = null; // Track which page gets evicted on this step

        // 1. Check for a PAGE HIT
        pageFoundIndex = frames.indexOf(page);
        if (pageFoundIndex !== -1) {
            // Page is already in memory!
            hit = true;
            pageHits++;
            
            // Update recency: Move page to the "most recently used" (end of array)
            const recencyIndex = recency.indexOf(page);
            recency.splice(recencyIndex, 1); // Remove from its old position
            recency.push(page); // Add to the end
        }
        
        // 2. Handle PAGE FAULT (if 'hit' is false)
        if (!hit) {
            pageFaults++;
            
            // Check for an empty frame (frames.includes(-1))
            const emptyFrameIndex = frames.indexOf(-1);

            if (emptyFrameIndex !== -1) {
                // --- Fault with empty frame ---
                frames[emptyFrameIndex] = page; // Place page in the empty slot
                recency.push(page); // Add to most recently used
            } else {
                // --- Fault with no empty frames (eviction required) ---
                
                // Get the LEAST recently used page (from the front of 'recency')
                const lruPage = recency.shift(); // Remove LRU page from recency
                evictedPage = lruPage; // Mark this page as evicted
                
                // Find where the LRU page is in the 'frames' array
                const evictIndex = frames.indexOf(lruPage);
                
                // Replace it with the new page
                frames[evictIndex] = page;
                
                // Add the new page as the MOST recently used
                recency.push(page);
            }
        }

        // 3. Store a snapshot of the current state for animation
        steps.push({
            frames: [...frames],
            recency: [...recency],
            page: page,
            fault: !hit,
            hitIndex: pageFoundIndex, // -1 if fault, or the index of the hit
            faults: pageFaults,
            hits: pageHits,
            evictedPage: evictedPage // null if no eviction
        });
    }

    // --- Final Statistics Calculation ---
    const totalRequests = pages.length;
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

