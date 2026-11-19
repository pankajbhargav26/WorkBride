import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api.js";
import "./DiagnosisChatbot.css";

const MAX_MESSAGES = 10;

const SUGGESTIONS = [
  "Mere ghar ka fan nahi chal raha",
  "Bathroom ke tap se paani leak ho raha hai",
  "AC cooling nahi kar raha",
];

export default function DiagnosisChatbot({ onDiagnosisComplete }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [diagnosis, setDiagnosis] = useState(null);
  const conversationRef = useRef(null);
  const conversationLimitReached = messages.length >= MAX_MESSAGES;

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [messages, pending]);

  const sendMessage = async (value) => {
    const content = value.trim();
    if (!content || pending || diagnosis || conversationLimitReached) return;

    const userMessage = { role: "user", content };
    const requestMessages = [...messages, userMessage];

    if (requestMessages.length > MAX_MESSAGES) {
      setErrorMessage("Chat bahut lambi ho gayi. Nayi diagnosis shuru karein.");
      return;
    }

    setPending(true);
    setErrorMessage("");

    try {
      const response = await axios.post(`${API_BASE_URL}/diagnosis`, {
        messages: requestMessages,
      });
      const result = response.data;

      if (
        result?.success !== true ||
        typeof result.reply !== "string" ||
        !result.reply.trim()
      ) {
        throw new Error("Diagnosis service se valid response nahi mila.");
      }

      const nextMessages = [
        ...requestMessages,
        { role: "assistant", content: result.reply },
      ];
      setMessages(nextMessages);
      setDraft("");

      if (result.complete === true) {
        const completedDiagnosis = {
          service: result.recommendedService,
          diagnosis: result.diagnosis,
        };
        setDiagnosis(completedDiagnosis);
        onDiagnosisComplete({
          ...completedDiagnosis,
          userMessages: requestMessages
            .filter((message) => message.role === "user")
            .map((message) => message.content),
        });
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          (error.code === "ERR_NETWORK"
            ? "Backend se connect nahi ho pa raha. Backend aur MongoDB start karke dobara try karein."
            : error.message) ||
          "Diagnosis abhi nahi ho paayi. Dobara try karein."
      );
    } finally {
      setPending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(draft);
  };

  const startNewDiagnosis = () => {
    setMessages([]);
    setDraft("");
    setErrorMessage("");
    setDiagnosis(null);
  };

  return (
    <section className="diagnosis-chat" aria-labelledby="diagnosis-chat-title">
      <header className="diagnosis-chat-header">
        <span className="diagnosis-chat-avatar" aria-hidden="true">✦</span>
        <div>
          <h2 id="diagnosis-chat-title">Not sure what service you need?</h2>
          <p>Tell us the symptoms. We’ll help identify the right service.</p>
        </div>
        <span className="diagnosis-chat-status">Service helper</span>
      </header>

      <div
        className="diagnosis-chat-conversation"
        ref={conversationRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-label="Symptom diagnosis conversation"
      >
        <div className="diagnosis-chat-message assistant">
          Namaste! Ghar mein kya problem aa rahi hai? Aap simple words mein bata sakte hain.
        </div>
        {messages.map((message, index) => (
          <div
            className={`diagnosis-chat-message ${message.role}`}
            key={`${message.role}-${index}`}
          >
            {message.content}
          </div>
        ))}
        {pending && (
          <div className="diagnosis-chat-message assistant" role="status">
            Symptoms check kar raha hoon…
          </div>
        )}
      </div>

      {diagnosis && (
        <div className="diagnosis-chat-result" role="status">
          <strong>Recommended service: {diagnosis.service}</strong>
          {diagnosis.diagnosis && <p>{diagnosis.diagnosis}</p>}
          <small>
            Service aur problem details neeche job form mein add ki hain. Post karne se pehle review kar lein.
          </small>
        </div>
      )}

      {errorMessage && (
        <p className="diagnosis-chat-error" role="alert">
          {errorMessage}
        </p>
      )}

      {!diagnosis && messages.length === 0 && (
        <div className="diagnosis-chat-suggestions" aria-label="Example problems">
          {SUGGESTIONS.map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => sendMessage(suggestion)}
              disabled={pending}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {conversationLimitReached && !diagnosis && (
        <p className="diagnosis-chat-error" role="status">
          Chat limit reached. Start a new chat to continue.
        </p>
      )}

      {diagnosis || conversationLimitReached ? (
        <button
          type="button"
          className="diagnosis-chat-restart"
          onClick={startNewDiagnosis}
        >
          {diagnosis ? "Start a new diagnosis" : "Start a new chat"}
        </button>
      ) : (
        <form className="diagnosis-chat-input" onSubmit={handleSubmit}>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value.slice(0, 500))}
            placeholder="Jaise: fan se awaaz aa rahi hai par ghoom nahi raha"
            maxLength={500}
            rows={2}
            aria-label="Describe the problem at home"
            disabled={pending}
          />
          <button type="submit" disabled={pending || !draft.trim()}>
            {pending ? "Checking..." : "Send"}
          </button>
        </form>
      )}
    </section>
  );
}
