import React, { useState, useRef, useEffect } from "react";
import {
  FiMessageCircle,
  FiMic,
  FiVolumeX,
  FiVolume2,
} from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import { motion } from "framer-motion";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  const synthRef = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);
  const lastSpokenRef = useRef("");
  const chatRef = useRef();

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-IN";
      recognitionRef.current.continuous = false;

      recognitionRef.current.onresult = (e) => {
        const voiceInput = e.results[0][0].transcript;
        setInput((prev) => prev + " " + voiceInput);
      };

      recognitionRef.current.onend = () => setListening(false);
      recognitionRef.current.onerror = () => setListening(false);
    }
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const reply = data.reply;

      animateTyping(reply);
      if (soundOn) speakText(reply);
    } catch {
      const failMsg = "❌ Failed to get response.";
      setMessages((prev) => [...prev, { role: "bot", text: failMsg }]);
      if (soundOn) speakText(failMsg);
    } finally {
      setLoading(false);
    }
  };

  const animateTyping = (text) => {
    let index = 0;
    const chars = [];

    const interval = setInterval(() => {
      index++;
      chars.push(text[index - 1]);
      if (index === text.length) {
        clearInterval(interval);
        setMessages((prev) => [...prev, { role: "bot", text }]);
        lastSpokenRef.current = text;
      }
    }, 20);
  };

  const speakText = (text) => {
    if (lastSpokenRef.current === text) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    synthRef.current.speak(utterance);
    lastSpokenRef.current = text;
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch {
        console.error("🎤 Mic is already in use");
      }
    }
  };

  const toggleSound = () => {
    setSoundOn((prev) => {
      if (prev) synthRef.current.cancel();
      return !prev;
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <div className="flex flex-col items-center mb-2">
          <motion.div
            className="text-white text-sm bg-indigo-600 px-3 py-1 rounded-full shadow-lg mb-2"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            💬 Ask AI
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            onClick={() => setIsOpen(true)}
            className="bg-white/20 backdrop-blur-md border border-white/30 shadow-xl text-indigo-600 p-4 rounded-full"
            title="Chat with E-Shop AI"
          >
            <FiMessageCircle className="text-3xl" />
          </motion.button>
        </div>
      )}

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-[370px] max-h-[550px] flex flex-col rounded-xl shadow-2xl bg-white/30 backdrop-blur-xl border border-white/30 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-white/20 border-b border-white/30">
            <h2 className="text-indigo-800 font-bold text-lg">🤖 E-Shop AI</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSound}
                className={`transition p-1 rounded-full ${
                  soundOn
                    ? "text-indigo-700 bg-white hover:bg-indigo-100 animate-pulse"
                    : "text-red-500 bg-white hover:bg-red-100"
                }`}
                title={soundOn ? "Mute Voice" : "Unmute Voice"}
              >
                {soundOn ? <FiVolume2 size={18} /> : <FiVolumeX size={18} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-red-500"
                title="Close"
              >
                <AiOutlineClose size={22} />
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div
            ref={chatRef}
            className="flex-1 px-4 py-3 space-y-3 text-sm overflow-y-auto bg-white/20 text-white"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-xl max-w-[80%] shadow ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-white/80 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-gray-300 italic text-xs">Thinking...</div>
            )}
          </div>

          {/* Input Bar */}
          <div className="flex items-center gap-2 px-3 py-2 border-t border-white/30 bg-white/20">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type or press mic..."
              rows={1}
              className="flex-1 px-3 py-2 text-sm rounded-md bg-white/70 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={toggleListening}
              disabled={loading}
              className={`p-2 rounded-full transition ${
                listening
                  ? "bg-red-100 animate-pulse text-red-500"
                  : "bg-indigo-100 text-indigo-600"
              }`}
              title={listening ? "Stop Mic" : "Start Mic"}
            >
              <FiMic />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
