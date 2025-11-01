LRU Page Replacement Algorithm Visualizer

This is a standalone, client-side web application that provides a real-time, interactive visualization of the Least Recently Used (LRU) page replacement algorithm. This tool is designed to help students and developers understand how the LRU algorithm manages memory, handles page faults, and tracks page recency.

This project is built with vanilla HTML, CSS, and JavaScript (ES6+), using the Canvas API for all rendering. It has zero dependencies and runs entirely in the browser.

Link to Live Deployment: 
Click here to try the visualizer live! - https://parth-05122005.github.io/LRU-Algorithm-Page-Replacement-Simulator/

Features

Interactive Simulation: Input any number of frames and a custom reference string to see how the algorithm performs.

Step-by-Step Control: Play, pause, step forward, and step backward through the entire execution trace.

Dynamic Speed Control: Use the speed slider to watch the animation in real-time or slow it down to analyze each step.

Timeline Scrubbing: Jump to any point in the simulation by dragging the timeline slider.

Responsive Canvas: The visualization is fully responsive and adapts to your screen size.

Clear Color-Coding:

<span style="color: #7cf57c;">Green:</span> Indicates a Page Hit.

<span style="color: #ff5f5f;">Red:</span> Indicates a Page Fault and shows the replaced frame.

<span style="color: #00ccff;">Blue:</span> Represents a standard, occupied frame.

Eviction Visualization: On a page fault, a clear (Old Page) -> (New Page) graphic appears to show exactly which page was evicted.

Detailed Statistics: Get instant feedback on total Page Faults, Page Hits, and the final Hit/Miss Ratio.

Export Data:

Export Screenshot: Download a .png of the current visualization.

Export Execution Trace: Download a .txt file detailing the state of memory and the algorithm's actions at every single step.

How to Use

This application runs locally in any modern browser. No server or setup is required.

Clone the Repository:

git clone [https://github.com/parth-05122005/LRU-Page-Replacement-Simulator.git](https://github.com/parth-05122005/LRU-Page-Replacement-Simulator.git)


Navigate to the Directory:

cd LRU-Page-Replacement-Simulator


Open the File:

Simply double-click the index.html file to open it in your default browser.

Project Structure

The source code is organized into a modular, easy-to-understand structure.

index.html: The main HTML file containing the page structure and all UI elements.

style.css: The stylesheet responsible for the layout, dark theme, and all visual styling.

main.js: The main entry point. It connects all modules and sets up the event listeners.

ui.js: A module responsible for reading and validating all user input from the form.

algorithm.js: The "brain" of the project. It contains the runLRUAlgorithm function, which performs the core logic and generates the step-by-step simulation data.

animation.js: The "renderer." This module takes the data from algorithm.js and draws everything onto the HTML canvas. It also manages all animation controls (play, pause, etc.).