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
    const frames = Array(frameCount).fill(-1); // Physical memory frames
    
    // This is the "memory" of LRU. It stores page numbers in order of use.
    // Index 0 = Least Recently Used (LRU)
    // Index n-1 = Most Recently Used (MRU)
    const recency = []; 
    
    let pageFaults = 0;
    let pageHits = 0;
    const steps = []; // Stores the state at every step for animation

    // Push the initial state (all frames empty)
    steps.push({
        frames: [...frames],
        recency: [...recency],
        page: null,
        fault: false,
        evictedPage: null, // No page evicted yet
        faults: 0,
        hits: 0,
        prevState: null // No previous state
    });

    // --- Process Each Page in the Reference String ---
    for (const page of pages) {
        let hit = false;
        let evictedPage = null; // Track which page gets evicted on a fault

        // Store the state *before* processing this page
        const prevState = {
            frames: [...frames],
            recency: [...recency]
        };

        // 1. Check for a PAGE HIT
        const hitIndex = frames.indexOf(page);
        if (hitIndex !== -1) {
            // Page is already in memory!
            hit = true;
            pageHits++;
            // This is a "hit", so this page is now the Most Recently Used.
            // We must update its position in the recency list.
            // 1. Remove it from its old position
            recency.splice(recency.indexOf(page), 1);
            // 2. Add it to the end (MRU side)
            recency.push(page);
        } else {
            // 2. Handle PAGE FAULT
            pageFaults++;
            
            if (frames.includes(-1)) {
                // There is still empty space in memory
                const emptyIndex = frames.indexOf(-1);
                frames[emptyIndex] = page;
                recency.push(page); // This new page is now the MRU
            } else {
                // Memory is full. We must replace the LRU page.
                // The LRU page is at index 0 of the recency list.
                const lruPage = recency.shift(); // 1. Get and remove LRU page
                evictedPage = lruPage;           // Store its name for animation
                
                // 2. Find and replace it in the frames array
                const lruIndexInFrames = frames.indexOf(lruPage);
                frames[lruIndexInFrames] = page;
                
                // 3. Add the new page to the MRU side of the list
                recency.push(page);
            }
        }

        // 3. Store a snapshot of the current state
        steps.push({
            frames: [...frames],
            recency: [...recency],
            page: page,
            fault: !hit,
            evictedPage: evictedPage, // Will be null on a hit, or the page number
            faults: pageFaults,
            hits: pageHits,
            prevState: prevState // Add the state from before
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

