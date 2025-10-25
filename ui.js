/**
 * ui.js
 * * Handles all interactions with the UI input form.
 * Its primary job is to read and validate user input.
 */

/**
 * Reads and validates the simulation parameters from the input form.
 * @returns {object|null} An object {numFrames, referenceString} if inputs are valid, or null if invalid.
 */
export function handleFormSubmit() {
    // Read the raw values from the input fields
    const numFrames = document.getElementById('num-frames').value;
    const referenceString = document.getElementById('reference-string').value;
    
    // --- Validation ---
    
    // 1. Check if fields are empty
    if (!numFrames || !referenceString) {
        console.error('Missing required fields');
        alert('Please fill all fields.');
        return null; // Stop execution and return null
    }
    
    // 2. Validate the reference string format
    const referenceArray = referenceString.split(',').map(item => {
        // Trim whitespace and convert to a number
        const num = parseInt(item.trim());
        // If conversion fails (e.g., "a" or ""), return null
        return isNaN(num) ? null : num;
    });
    
    // 3. Check if any part of the string was invalid
    if (referenceArray.includes(null)) {
        console.error('Invalid reference string');
        alert('Reference string must be comma-separated numbers.');
        return null; // Stop execution and return null
    }
    
    // If all checks pass, return the valid data
    return { 
        numFrames: parseInt(numFrames), 
        referenceString: referenceString // Return the original valid string
    };
}

