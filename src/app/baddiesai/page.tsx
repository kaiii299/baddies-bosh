"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

// Message type definition
type Message = {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
};

// Sample questions and answers about tools
const toolQA = [
  {
    question: "What is the next calibration date for the AIKOH Dial Push Pull Gauge?",
    answer: "The AIKOH Dial Push Pull Gauge (Model ANF-500N) was last calibrated on 6-Dec-2024. The next calibration is due on 6-Dec-2026. The person in charge (PIC) is RK."
  },
  {
    question: "Which tools are due for calibration this month?",
    answer: "Here are the tools with calibration due this month:\n- Digital Caliper (Mitutoyo, Model CD-15AX) - Calibration Due: 28-Feb-2025\n  PIC: - Micrometer (Mitutoyo, Model M110-25) - Calibration Due: 25-Feb-2025\n  PIC: \n\nLet me know if you want the full list."
  },
  {
    question: "Show me all tools by the brand Mitutoyo.",
    answer: "Here are the tools from Mitutoyo:\n- Digital Caliper (Model CD-15AX) - Serial: 12345 - Calibration Due: 28-Feb-2025\n- Micrometer (Model M110-25) - Serial: 67890 - Calibration Due: 25-Feb-2025\n- Dial Indicator (Model 2046S) - Serial: 78901 - Calibration Due: 12-May-2025\n\nWould you like to filter by category or PIC?"
  },
  {
    question: "What is the calibration interval for the Torque Wrench?",
    answer: "The calibration interval for the Torque Wrench (TONE Model T3-1000N) is 12 months. The last calibration was done on 15-Mar-2024 and the next calibration is due on 15-Mar-2025. The person in charge (PIC) is Tom Lee."
  },
  {
    question: "Which tools are marked as 'In Use'?",
    answer: "Here are the tools currently in use:\n- AIKOH Dial Push Pull Gauge (Model ANF-500N) - Serial: 126881Di\n- Mitutoyo Digital Caliper (Model CD-15AX) - Serial: 12345\n- Mitutoyo Micrometer (Model M110-25) - Serial: 67890\n\nThere are 14 tools in total marked as in use. Would you like to see the full list?"
  },
  {
    question: "Who is responsible for the calibration of the Dial Indicator?",
    answer: "The Dial Indicator (Mitutoyo, Model 2046S) is managed by PIC: Sarah Tan. The next calibration is due on 12-May-2025."
  },
  {
    question: "Are there any tools overdue for calibration?",
    answer: "Here are tools that are overdue for calibration:\n- Torque Wrench (TONE, Model T3-1000N) - Calibration was due on 15-Jan-2024\n- Surface Plate (Sanko, Model S600) - Calibration was due on 5-Feb-2024\n\nThere are 3 overdue tools. Would you like a detailed report?"
  },
  {
    question: "Show me tools calibrated by Key Solutions.",
    answer: "Here are tools calibrated by Key Solutions:\n- Dial Push Pull Gauge (AIKOH, Model ANF-500N)\n  Last Calibration: 6-Dec-2024\n  Next Calibration: 6-Dec-2026\n  PIC: RK\n\nWould you like to filter by date or category?"
  },
  {
    question: "What is the risk level for tools due in the next 3 months?",
    answer: "The following tools are due for calibration within the next 3 months, flagged with their risk levels:\n- Digital Caliper (Mitutoyo, Model CD-15AX) - Due: 28-Feb-2025 - Risk: High\n- Micrometer (Mitutoyo, Model M110-25) - Due: 25-Feb-2025 - Risk: High\n- Pressure Gauge (WIKA, Model PG-100) - Due: 15-Mar-2025 - Risk: Medium\n\nWould you like to schedule reminders for these?"
  },
  {
    question: "Show me all tools under category 'Measurement Equipment'.",
    answer: "Here are tools under Measurement Equipment:\n- Digital Caliper (Mitutoyo) - Serial: 12345\n- Dial Indicator (Mitutoyo) - Serial: 78901\n- Torque Wrench (TONE) - Serial: 99887\n\nWould you like to sort by calibration due date?"
  }
];

// Suggested reply sets
const suggestedReplySets = [
  // Initial suggestions
  [
    "Show me overdue calibrations",
    "Which tools are in use?",
    "Show Mitutoyo tools"
  ],
  // After asking about calibrations
  [
    "Show tools by brand",
    "Who is responsible for Dial Indicator?",
    "Tools due in next 3 months"
  ],
  // After asking about tools in use
  [
    "Tools needing calibration soon",
    "Show measurement equipment",
    "Calibration date for Torque Wrench"
  ],
  // Generic follow-ups
  [
    "Generate calibration report",
    "Search by PIC",
    "Show high risk tools"
  ]
];

// Function to find the best matching answer
function findBestAnswer(userInput: string): string {
  // Convert to lowercase for better matching
  const normalizedInput = userInput.toLowerCase();
  
  // Find best match by simple keyword matching
  // In a real app, this would use more sophisticated NLP
  for (const qa of toolQA) {
    const normalizedQuestion = qa.question.toLowerCase();
    
    // Look for significant overlap or keywords
    if (
      normalizedQuestion.includes(normalizedInput) || 
      normalizedInput.includes(normalizedQuestion) ||
      normalizedInput.split(" ").some(word => 
        word.length > 3 && normalizedQuestion.includes(word)
      )
    ) {
      return qa.answer;
    }
  }
  
  // Check for common themes
  if (normalizedInput.includes("calibrat")) {
    return "I can help with calibration information. Try asking about specific tools, upcoming calibrations, or overdue items.";
  }
  
  if (normalizedInput.includes("tool") || normalizedInput.includes("equipment")) {
    return "I can provide information about our tools inventory. You can ask about specific brands, models, or categories.";
  }

  // Default response if no match found
  return "I don't have specific information about that. Try asking about tool calibration dates, specific brands like Mitutoyo, or tools that are currently in use.";
}

// Save messages to localStorage
const saveMessagesToStorage = (messages: Message[]) => {
  if (typeof window === 'undefined') return;
  
  try {
    // Convert Date objects to strings to avoid JSON serialization issues
    const messagesToSave = messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString()
    }));
    localStorage.setItem('baddiesAI_messages', JSON.stringify(messagesToSave));
  } catch (error) {
    console.error('Failed to save messages to localStorage:', error);
  }
};

// Load messages from localStorage
const loadMessagesFromStorage = (): Message[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const savedMessages = localStorage.getItem('baddiesAI_messages');
    if (!savedMessages) return [];
    
    // Convert timestamp strings back to Date objects
    return JSON.parse(savedMessages).map((msg: Record<string, unknown>) => ({
      ...msg,
      timestamp: new Date(msg.timestamp as string)
    }));
  } catch (error) {
    console.error('Failed to load messages from localStorage:', error);
    return [];
  }
};

export default function BaddiesAIPage() {
  // Default welcome message
  const welcomeMessage: Message = {
    id: "welcome",
    content: "Hello! I'm your tool assistant. Ask me about calibration dates, tool inventory, or equipment status.",
    sender: "bot",
    timestamp: new Date(),
  };
  
  // Initialize with just the welcome message for server rendering
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>(suggestedReplySets[0]);
  
  // Reference to message container for scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize messages from localStorage after component mounts (client-side only)
  useEffect(() => {
    const savedMessages = loadMessagesFromStorage();
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
    }
    setIsInitialized(true);
  }, []);
  
  // Save messages to localStorage whenever they change, but only after initialization
  useEffect(() => {
    if (isInitialized) {
      saveMessagesToStorage(messages);
    }
  }, [messages, isInitialized]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update suggested replies based on conversation context
  useEffect(() => {
    if (messages.length <= 1) {
      setSuggestedReplies(suggestedReplySets[0]);
      return;
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.sender === "bot") {
      // Rotate through suggestion sets based on message count
      const setIndex = Math.min(
        Math.floor((messages.length - 1) / 2) % suggestedReplySets.length,
        suggestedReplySets.length - 1
      );
      setSuggestedReplies(suggestedReplySets[setIndex]);
    }
  }, [messages]);

  // Clear chat history
  // const clearHistory = () => {
  //   setMessages([welcomeMessage]);
  //   setSuggestedReplies(suggestedReplySets[0]);
  //   localStorage.removeItem('baddiesAI_messages');
  // };
  
  // Process a message from suggestion
  const processMessage = (messageText: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: messageText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Calculate a variable thinking time between 2.5-3.5 seconds
    const thinkingTime = 3000 + Math.random() * 1000;

    // Find appropriate answer with tolerance for mistakes
    setTimeout(() => {
      const botResponse = findBestAnswer(messageText);
      
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, thinkingTime);
  };

  // Handle clicking a suggested reply
  const handleSuggestedReply = (reply: string) => {
    if (isLoading) return;
    processMessage(reply);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-150px)]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Baddies AI - Tool Assistant <span className="text-sm text-slate-400">(using N8N as RAG)</span></h2>
        {/* <Button 
          variant="outline" 
          size="sm" 
          onClick={clearHistory}
          className="flex items-center gap-1"
        >
          <Trash2 className="h-4 w-4" />
          Clear History
        </Button> */}
      </div>
      
      <Card className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 flex items-start gap-3 ${
                    message.sender === "user"
                      ? "bg-slate-600 text-white"
                      : "bg-muted"
                  }`}
                >
                  {message.sender === "bot" && (
                    <Bot className="h-5 w-5 mt-1 flex-shrink-0" />
                  )}
                  <div>
                    <p className="whitespace-pre-line">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {message.sender === "user" && (
                    <User className="h-5 w-5 mt-1 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-4 bg-muted flex items-center">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {/* Pulsing circle behind bot icon */}
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-0 bg-slate-300 rounded-full"
                      />
                      <Bot className="h-5 w-5 relative z-10" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-slate-500 font-medium">Thinking...</div>
                      <div className="flex space-x-2">
                        {/* Animated dots with varying delays */}
                        <motion.div 
                          animate={{ y: [0, -5, 0] }}
                          transition={{ 
                            duration: 0.6, 
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut" 
                          }}
                          className="h-2 w-2 bg-slate-600 rounded-full"
                        />
                        <motion.div 
                          animate={{ y: [0, -5, 0] }}
                          transition={{ 
                            duration: 0.6, 
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                            delay: 0.15 
                          }}
                          className="h-2 w-2 bg-slate-600 rounded-full"
                        />
                        <motion.div 
                          animate={{ y: [0, -5, 0] }}
                          transition={{ 
                            duration: 0.6, 
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                            delay: 0.3 
                          }}
                          className="h-2 w-2 bg-slate-600 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Suggested replies as the only way to interact */}
        <div className="p-4 border-t">
          <div className="flex flex-wrap gap-2">
            {suggestedReplies.map((reply, index) => (
              <Button 
                key={index} 
                variant="outline" 
                size="sm"
                className="text-sm"
                onClick={() => handleSuggestedReply(reply)}
                disabled={isLoading}
              >
                {reply}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
} 