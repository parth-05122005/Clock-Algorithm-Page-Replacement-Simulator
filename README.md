🕒 Clock Algorithm Page Replacement Visualizer
📘 Project Description

Clock Algorithm Page Replacement Visualizer is a standalone, client-side web application that provides an interactive, animated visualization of the Clock Page Replacement Algorithm.
Users can input a custom page reference string and number of memory frames to see a step-by-step simulation of how the algorithm manages page faults and hits.

Built entirely using HTML, CSS, and JavaScript, the app leverages the HTML Canvas API for real-time animations.
The architecture is fully modular, separating algorithm logic, canvas animation, and UI event handling for clarity and maintainability.

⚙️ Feature Overview
🔢 Interactive Parameter Input

Set the number of available memory frames.

Enter a custom page reference string.

🎬 Full Animation Controls

Play, pause, step forward, and step backward through the simulation.

🕓 Configurable Speed

Adjust the animation speed with an intuitive slider.

🎨 Real-Time Canvas Visualization

Displays all memory frames and their currently loaded pages.

Shows the Use Bit (Reference Bit) for each frame.

Animates the Clock Pointer to indicate which frame is being inspected.

📊 Step-by-Step Timeline

Jump to any specific step in the simulation using the timeline slider.

📈 Detailed Statistics

Track page faults, page hits, and final hit/miss ratios.

📤 Export Functionality

Screenshot Export: Save a PNG image of the current visualization.

Execution Trace Export: Download a .txt file logging each step, page request, fault/hit status, and memory state.

🧰 Technology Stack
Technology	Purpose
HTML5	Structures the web application
CSS3	Styles the layout, controls, and visual components
JavaScript (ES6+)	Implements application logic and algorithm behavior
HTML Canvas API	Renders animations and visualizations in real time
🧱 Code Architecture

The project follows a modular architecture for readability and scalability:

File	Description
index.html	Main HTML file defining the page structure
style.css	Contains all styling for layout and visuals
main.js	Entry point connecting UI events to logic
ui.js	Handles input reading and validation
algorithm.js	Core implementation of the Clock Page Replacement Algorithm; generates step data for visualization
animation.js	Renders and animates each simulation step using the Canvas API
🚀 Getting Started

Clone the repository

git clone https://github.com/your-username/clock-page-replacement-visualizer.git