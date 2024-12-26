const API_BASE_URL = "http://localhost:8000/api";

// Helper function for API requests
async function fetchFromAPI(endpoint, method = "GET", body = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
    credentials: "include", // Ensure cookies are sent
  });

  // Handle 401 (Unauthorized) errors
  if (response.status === 401) {
    console.warn("Unauthorized! Please ensure you are logged in.");
    return null;
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Something went wrong");
  }

  return response.json();
}

// Fetch chat rooms
export async function getChatRooms() {
  return fetchFromAPI("/chat/rooms/");
}

// Fetch messages for a specific room
export async function getMessages(roomId) {
  return fetchFromAPI(`/chat/rooms/${roomId}/messages/`);
}

// Send a message to a chat room
export async function sendMessage(roomId, content) {
  return fetchFromAPI(`/chat/rooms/${roomId}/messages/`, "POST", {
    content,
    message_type: "text",
  });
}
