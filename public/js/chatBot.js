// Function to send user message
function sendUserMessage(userMessage) {
  const chatBox = document.getElementById("chat-box");

  // Add user message to chat
  const userMessageDiv = document.createElement("div");
  userMessageDiv.classList.add("message", "bg-blue-100", "p-2", "rounded-lg", "max-w-full", "self-end", "text-left");
  userMessageDiv.textContent = userMessage;
  chatBox.appendChild(userMessageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Send message to backend for bot processing (simulate bot response)
  fetch('/api/get_data')
    .then(response => response.json())
    .then(data => {
      const botMessageDiv = document.createElement("div");
      botMessageDiv.classList.add("message", "bg-gray-300", "p-2", "rounded-lg", "max-w-full", "text-left");

      const sensorData = data.data;

      // Check for specific sensor data queries first
      if (userMessage.toLowerCase().includes("max temperature")) {
        const maxTemperature = Math.max(...sensorData.map(data => data.temperature)); // Get max temperature
        botMessageDiv.textContent = `The maximum temperature recorded is ${maxTemperature}°C.`;
      } else if (userMessage.toLowerCase().includes("min temperature")) {
        const minTemperature = Math.min(...sensorData.map(data => data.temperature)); // Get min temperature
        botMessageDiv.textContent = `The minimum temperature recorded is ${minTemperature}°C.`;
      } else if (userMessage.toLowerCase().includes("average temperature")) {
        const avgTemperature = sensorData.reduce((sum, data) => sum + data.temperature, 0) / sensorData.length;
        botMessageDiv.textContent = `The average temperature is ${avgTemperature.toFixed(2)}°C.`;
      } else if (userMessage.toLowerCase().includes("max humidity")) {
        const maxHumidity = Math.max(...sensorData.map(data => data.humidity));
        botMessageDiv.textContent = `The maximum humidity recorded is ${maxHumidity}%.`;
      } else if (userMessage.toLowerCase().includes("min humidity")) {
        const minHumidity = Math.min(...sensorData.map(data => data.humidity));
        botMessageDiv.textContent = `The minimum humidity recorded is ${minHumidity}%.`;
      } else if (userMessage.toLowerCase().includes("average humidity")) {
        const avgHumidity = sensorData.reduce((sum, data) => sum + data.humidity, 0) / sensorData.length;
        botMessageDiv.textContent = `The average humidity is ${avgHumidity.toFixed(2)}%.`;
      } else if (userMessage.toLowerCase().includes("max dust density")) {
        const maxDustDensity = Math.max(...sensorData.map(data => data.dustDensity));
        botMessageDiv.textContent = `The maximum dust density recorded is ${maxDustDensity} µg/m³.`;
      } else if (userMessage.toLowerCase().includes("min dust density")) {
        const minDustDensity = Math.min(...sensorData.map(data => data.dustDensity));
        botMessageDiv.textContent = `The minimum dust density recorded is ${minDustDensity} µg/m³.`;
      } else if (userMessage.toLowerCase().includes("average dust density")) {
        const avgDustDensity = sensorData.reduce((sum, data) => sum + data.dustDensity, 0) / sensorData.length;
        botMessageDiv.textContent = `The average dust density is ${avgDustDensity.toFixed(2)} µg/m³.`;
      } else if (userMessage.toLowerCase().includes("max air quality")) {
        const maxAirQuality = Math.max(...sensorData.map(data => data.MQ135));
        botMessageDiv.textContent = `The maximum air quality (MQ135) recorded is ${maxAirQuality}.`;
      } else if (userMessage.toLowerCase().includes("min air quality")) {
        const minAirQuality = Math.min(...sensorData.map(data => data.MQ135));
        botMessageDiv.textContent = `The minimum air quality (MQ135) recorded is ${minAirQuality}.`;
      } else if (userMessage.toLowerCase().includes("average air quality")) {
        const avgAirQuality = sensorData.reduce((sum, data) => sum + data.MQ135, 0) / sensorData.length;
        botMessageDiv.textContent = `The average air quality (MQ135) is ${avgAirQuality.toFixed(2)}.`;
      } else if (userMessage.toLowerCase().includes("temperature")) {
        const latestSensorData = sensorData[0]; // Get the latest sensor data
        botMessageDiv.textContent = `The latest temperature is ${latestSensorData.temperature}°C.`;
      } else if (userMessage.toLowerCase().includes("humidity")) {
        const latestSensorData = sensorData[0];
        botMessageDiv.textContent = `The latest humidity is ${latestSensorData.humidity}%.`;
      } else if (userMessage.toLowerCase().includes("dust")) {
        const latestSensorData = sensorData[0];
        botMessageDiv.textContent = `The latest dust density is ${latestSensorData.dustDensity} µg/m³.`;
      } else if (userMessage.toLowerCase().includes("air quality")) {
        const latestSensorData = sensorData[0];
        botMessageDiv.textContent = `The latest air quality (MQ135) is ${latestSensorData.MQ135}.`;
      } else {
        botMessageDiv.textContent = "I can help with sensor data queries like temperature, humidity, dust density, and air quality.";
      }

      chatBox.appendChild(botMessageDiv);
      chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch(error => {
      console.error('Error:', error);
      const errorMessageDiv = document.createElement("div");
      errorMessageDiv.classList.add("message", "bg-red-100", "p-2", "rounded-lg", "max-w-full", "text-left");
      errorMessageDiv.textContent = "Sorry, I couldn't fetch the sensor data. Please try again later.";
      chatBox.appendChild(errorMessageDiv);
      chatBox.scrollTop = chatBox.scrollHeight;
    });
}

// Event listener for send button
document.getElementById("send-btn").addEventListener("click", () => {
  const userMessage = document.getElementById("user-input").value;
  if (userMessage) {
    sendUserMessage(userMessage);
    document.getElementById("user-input").value = '';  // Clear input field
  }
});

// Allow pressing Enter to send message
document.getElementById("user-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const userMessage = document.getElementById("user-input").value;
    if (userMessage) {
      sendUserMessage(userMessage);
      document.getElementById("user-input").value = '';  // Clear input field
    }
  }
});
