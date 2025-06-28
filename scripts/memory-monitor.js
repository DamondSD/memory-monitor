let memoryMonitorInterval = null;
let memoryMonitorElement = null;
let updatePosition = null;

// Create and start the memory monitor
function createMemoryMonitor() {
  if (!performance.memory) {
    ui.notifications.warn("Memory Monitor: performance.memory not supported in this environment.");
    return;
  }

  if (memoryMonitorElement) return; // Already active

  const playerContainer = document.getElementById("players");
  if (!playerContainer) {
    console.warn("Memory Monitor: Could not find #players container.");
    return;
  }

  memoryMonitorElement = document.createElement("div");
  memoryMonitorElement.id = "memory-monitor";
  document.body.appendChild(memoryMonitorElement); // Attach to body, above players

  updatePosition = () => {
    const rect = playerContainer.getBoundingClientRect();
    memoryMonitorElement.style.position = "fixed";
    memoryMonitorElement.style.left = `${rect.left}px`;
    memoryMonitorElement.style.top = `${rect.top - 28}px`; // 28px above
  };

  updatePosition();
  window.addEventListener("resize", updatePosition);

  function updateMemory() {
    const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
    const usedMB = (usedJSHeapSize / 1048576).toFixed(2);
    const totalMB = (totalJSHeapSize / 1048576).toFixed(2);
    memoryMonitorElement.innerHTML = `Memory: ${usedMB} MB / ${totalMB} MB`;
  }

  updateMemory();
  memoryMonitorInterval = setInterval(updateMemory, 5000);
}

// Stop and remove the memory monitor
function destroyMemoryMonitor() {
  if (memoryMonitorElement) {
    window.removeEventListener("resize", updatePosition);
    memoryMonitorElement.remove();
    memoryMonitorElement = null;
  }

  if (memoryMonitorInterval) {
    clearInterval(memoryMonitorInterval);
    memoryMonitorInterval = null;
  }
}

// Update monitor visibility based on setting
function updateMonitorState(enabled) {
  if (enabled) {
    createMemoryMonitor();
  } else {
    destroyMemoryMonitor();
  }
}

// Register the toggle setting
Hooks.once("init", () => {
  game.settings.register("memory-monitor", "enabled", {
    name: "Enable Memory Monitor",
    hint: "Toggle whether the memory monitor is displayed during gameplay.",
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: value => updateMonitorState(value) // Live update
  });
});

// Initialize on ready and listen for hotkey toggle
Hooks.once("ready", () => {
  const isEnabled = game.settings.get("memory-monitor", "enabled");
  updateMonitorState(isEnabled);

  // Hotkey toggle: Ctrl + M
  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key.toLowerCase() === "m") {
      const current = game.settings.get("memory-monitor", "enabled");
      game.settings.set("memory-monitor", "enabled", !current);
    }
  });
});
