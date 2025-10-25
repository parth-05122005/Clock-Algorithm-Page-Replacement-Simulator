/**
 * main.js
 * * This is the "brain" of the application.
 * It connects all the other modules (ui, algorithm, animation)
 * and sets up all the event listeners for the page.
 */

// --- Module Imports ---
// Import the form handler from the UI module
import { handleFormSubmit } from './ui.js'; 
// Import the core algorithm logic
import { runClockAlgorithm } from './algorithm.js'; 
// Import all the control functions from the animation module
import { 
    animateSimulation, 
    resetAnimation, 
    play, 
    pause, 
    stepForward, 
    stepBackward, 
    setSpeed, 
    jumpToStep, 
    exportScreenshot, 
    exportTrace 
} from './animation.js';

// --- Event Listeners ---

// Wait until the entire HTML document is loaded and parsed
document.addEventListener('DOMContentLoaded', () => {
    
    // Find the input form
    const form = document.getElementById('input-form');
    
    // --- Form Submission Handler ---
    // This is the main trigger for the simulation
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop the page from reloading on form submit
        
        // Get the validated user inputs from the UI module
        const params = handleFormSubmit(); 
        
        // Only proceed if the inputs were valid (not null)
        if (params) {
            // Convert the reference string (e.g., "1,2,3") into an array of numbers
            const pages = params.referenceString.split(',')
                .map(s => parseInt(s.trim()));
            
            // Run the algorithm with the user's parameters.
            // This 'simulationData' object contains all the steps and stats.
            const simulationData = runClockAlgorithm(pages, params.numFrames);
            
            // Prepare the animation module for a new simulation
            resetAnimation(); 
            // Send the new data to the animation module to be drawn
            animateSimulation(simulationData); 
            
            // Make the simulation controls (play, pause, etc.) visible
            document.getElementById('controls-section').style.display = 'block';
        } else {
            // If params were invalid, 'handleFormSubmit' already showed an alert
            console.error('Parameters invalid, simulation not started.');
        }
    });

    // --- Control Button Listeners ---
    // Hook up all the control buttons to their respective functions
    // from the animation.js module.
    
    document.getElementById('play-btn').addEventListener('click', play);
    document.getElementById('pause-btn').addEventListener('click', pause);
    document.getElementById('step-forward-btn').addEventListener('click', stepForward);
    document.getElementById('step-backward-btn').addEventListener('click', stepBackward);
    
    // Sliders send their value to the handler function
    document.getElementById('speed-slider').addEventListener('input', (e) => setSpeed(e.target.value));
    document.getElementById('timeline-slider').addEventListener('input', (e) => jumpToStep(parseInt(e.target.value)));
    
    // Export buttons
    document.getElementById('export-screenshot').addEventListener('click', exportScreenshot);
    document.getElementById('export-trace').addEventListener('click', exportTrace);
});

