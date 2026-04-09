import React, { useState, useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import style from "./Chat.module.scss"

interface ChatProps {
  socket: Socket;
  roomId: string;
}

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderNickname: string;
}

const Chat: React.FC<ChatProps> = ({ socket, roomId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    socket.on("receive_message", (message: ChatMessage) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [socket]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    socket.emit("send_message", { roomId, text: inputValue });
    setInputValue("");
  };

  return (
    <div className={style.chatContainer}>
      <div className={style.messagesArea}>
        {messages.map((msg) => {
          const isMine = msg.senderId === socket.id;

          return (
            <div key={msg.id} style={{justifyContent: isMine ? "flex-end" : "flex-start",}} className={style.messageWrapper}>
                <div style={{backgroundColor: isMine ? "#dcf8c6" : "#ffffff",border: "1px solid #ccc"}} className={style.messageBubble}>
                {!isMine && (
                  <span className={style.nickname}>{msg.senderNickname}</span>
                )}
                <span className={style.msgText}>{msg.text}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className={style.inputArea}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Написати повідомлення..."
          className={style.input}
        />
        <button type="submit" className={style.button}>
          ➤
        </button>
      </form>
    </div>
  );
};


export default Chat;