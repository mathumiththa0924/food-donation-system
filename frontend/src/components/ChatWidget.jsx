import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";

const SOCKET_URL = "http://localhost:5000";

import LiveTracker from "./LiveTracker";

const ChatWidget = ({ 
  requestId, moneyRequestId, currentUserId, otherUserId, 
  compact = false, title = "Chat with NGO",
  currentUserRole, donorLocation
}) => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [showTracker, setShowTracker] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  const roomId = moneyRequestId ? `fund-${moneyRequestId}` : requestId;
  const messagesUrl = moneyRequestId
    ? `${SOCKET_URL}/api/messages/fund/${moneyRequestId}`
    : `${SOCKET_URL}/api/messages/${requestId}`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!roomId) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(messagesUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setMessages(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching messages", error);
      }
    };
    fetchMessages();

    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit("join_room", roomId);

    socketRef.current.on("receive_message", (data) => {
      const sameRoom = moneyRequestId
        ? String(data.moneyRequestId) === String(moneyRequestId)
        : String(data.requestId) === String(requestId);
      if (sameRoom) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId, messagesUrl, requestId, moneyRequestId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (currentMessage.trim() === "" || !socketRef.current) return;

    const messageData = {
      senderId: currentUserId,
      receiverId: otherUserId,
      text: currentMessage.trim(),
      ...(moneyRequestId ? { moneyRequestId } : { requestId })
    };

    socketRef.current.emit("send_message", messageData);
    setCurrentMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const bodyHeight = compact ? 180 : 260;

  return (
    <div className="chat-widget-container" style={compact ? { marginTop: 12, borderRadius: 12 } : undefined}>
      <div className="chat-widget-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4>{title}</h4>
        {!moneyRequestId && currentUserRole && (
          <button 
            onClick={() => setShowTracker(!showTracker)}
            style={{ 
              background: showTracker ? "#e74c3c" : "#2ecc71", 
              color: "white", border: "none", padding: "6px 12px", 
              borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "bold"
            }}
          >
            {showTracker ? "Close Map" : "📍 Live Track"}
          </button>
        )}
      </div>
      
      {showTracker ? (
        <div style={{ padding: "10px" }}>
          <LiveTracker 
            roomId={roomId} 
            currentUserRole={currentUserRole} 
            donorLocation={donorLocation} 
          />
        </div>
      ) : (
        <>
          <div className="chat-widget-body" style={{ maxHeight: bodyHeight }}>
            {messages.length === 0 && (
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, textAlign: "center", margin: "20px 0" }}>
                Start a conversation about this donation.
              </p>
            )}
            {messages.map((msg, index) => {
              const senderId = String(msg.senderId?._id || msg.senderId);
              const isMe = senderId === String(currentUserId);
              return (
                <div
                  key={msg._id || index}
                  className={`chat-message ${isMe ? "chat-message-right" : "chat-message-left"}`}
                >
                  <div className="chat-bubble">
                    <p>{msg.text}</p>
                    <span className="chat-timestamp">
                      {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-widget-footer">
            <input
              type="text"
              value={currentMessage}
              placeholder="Type a message..."
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={sendMessage} className="chat-send-btn">
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWidget;
