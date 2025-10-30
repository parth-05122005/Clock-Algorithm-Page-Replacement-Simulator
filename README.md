LRU Page Replacement Algorithm Visualizer

A web-based, interactive visualizer for the LRU (Least Recently Used) page replacement algorithm. This tool is built with pure HTML, CSS, and JavaScript, using the Canvas API for all animations. It's designed to help students and developers understand how the LRU algorithm works by providing a clear, step-by-step animated simulation.

(Tip: Take a screenshot of your finished project, upload it to your repo, and replace the URL above to show it here!)

✨ Features

Interactive Input: Enter any number of frames and a custom page reference string.

Full Animation Control: Play, pause, step forward, and step backward through the simulation.

Real-time Statistics: Watch live updates for Page Faults, Page Hits, Miss Ratio, and Hit Ratio.

Speed Control: Adjust the animation speed from slow (for learning) to fast (for quick results).

Clear State Visualization: See the state of memory before and after each step with side-by-side "Previous Frames" and "Current Frames" queues.

Color-Coded Feedback:

<span style="color: #7cf57c;">Green:</span> Page Hit

<span style="color: #ff5f5f;">Red:</span> Page Fault (with evicted page)

Export Screenshot: Save a PNG image of the current visualizer state.

Export Trace: Download a complete, step-by-step text log of the entire simulation, including the recency list for each step.

🚀 How to Use

Live Demo

Click here to try the visualizer live! - https://parth-05122005.github.io/LRU-Algorithm-Page-Replacement-Simulator/

Enter Frames: Input the number of available memory frames (e.g., 3).

Enter Reference String: Type your page reference string, separated by commas (e.g., 1,2,3,4,1,2,5,1,2,3,4,5).

Click "Start Simulation".

Control the animation using the play, pause, and step buttons.

Running Locally

This is a standalone, client-side application. No server or dependencies are needed.

Clone this repository:

git clone [https://github.com/parth-05122005/LRU-Page-Replacement-Simulator.git](https://github.com/parth-05122005/LRU-Page-Replacement-Simulator.git)


Navigate to the project directory:

cd LRU-Page-Replacement-Simulator


Open the index.html file in any modern web browser (Chrome, Firefox, Edge, etc.).

💻 Technology Stack

HTML5: For the core structure of the application.

CSS3: For all styling, the dark theme, and the responsive flexbox layout.

JavaScript (ES6+): For all algorithm logic, DOM manipulation, and interactivity. The project is built with modules.

HTML5 Canvas API: For rendering all animated frames, text, and visual elements.

📁 Project Structure

The code is modular by design to separate concerns:

index.html: The main HTML file for the page structure.

style.css: Contains all styles for the application.

main.js: The "brain" of the app. It connects all other modules and attaches event listeners.

ui.js: Manages reading and validating user input from the form.

algorithm.js: Contains only the core runLRUAlgorithm logic. It takes inputs and returns a data object.

animation.js: The "rendering engine." It takes the data from algorithm.js and draws it on the canvas.