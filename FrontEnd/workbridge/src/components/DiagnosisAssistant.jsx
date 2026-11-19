import { useRef, useState } from "react";
import axios from "axios";
import servicesData from "../data/serviceData";
import "./DiagnosisAssistant.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const MAX_MESSAGE_LENGTH = 1500;
const MAX_CONVERSATION_MESSAGES = 20;
const DUPLICATE_REQUEST_WINDOW_MS = 500;

const COPY = {
  en: {
    title: "AI Problem Diagnosis Assistant",
    intro: "Describe the problem in your own words. The assistant may ask questions before suggesting job details.",
    language: "Conversation language",
    english: "English",
    hindi: "Hindi",
    placeholder: "For example: water is leaking under my kitchen sink...",
    send: "Send",
    thinking: "Thinking...",
    welcome: "Start by describing what is happening.",
    possibleIssue: "Possible issue",
    category: "Suggested service",
    noCategory: "No catalog category matched. Please select a service manually.",
    titleLabel: "Suggested title",
    summary: "Suggested summary",
    apply: "Apply suggestions",
    applied: "Suggestions applied. Review and edit the Post Job fields before posting.",
    error: "The assistant could not respond. Please try again.",
    notConfigured: "AI diagnosis is not configured. Add GEMINI_API_KEY to BackEnd/.env and restart the backend.",
    providerAuthError: "Gemini rejected the backend credentials. Check GEMINI_API_KEY and its API access in BackEnd/.env.",
    providerQuota: "The Gemini API rate limit or usage quota is unavailable. Check your Google AI Studio project or try again later.",
    providerRateLimit: "The Gemini API rate limit or usage quota is unavailable. Please try again later.",
    providerError: "Gemini could not process the request. Check the backend's Gemini configuration and model access.",
    timeout: "The assistant took too long to respond. Please try again.",
    privacy: "Only this conversation and the service catalog are sent for diagnosis.",
  },
  hi: {
    title: "AI समस्या पहचान सहायक",
    intro: "समस्या को अपने शब्दों में बताएं। नौकरी का सुझाव देने से पहले सहायक कुछ सवाल पूछ सकता है।",
    language: "बातचीत की भाषा",
    english: "English",
    hindi: "हिन्दी",
    placeholder: "उदाहरण: रसोई के सिंक के नीचे पानी रिस रहा है...",
    send: "भेजें",
    thinking: "सोच रहा है...",
    welcome: "क्या हो रहा है, यह बताकर शुरू करें।",
    possibleIssue: "संभावित समस्या",
    category: "सुझाई गई सेवा",
    noCategory: "कोई उपयुक्त सेवा श्रेणी नहीं मिली। कृपया सेवा स्वयं चुनें।",
    titleLabel: "सुझाया गया शीर्षक",
    summary: "सुझाया गया विवरण",
    apply: "सुझाव लागू करें",
    applied: "सुझाव लागू हो गए। पोस्ट करने से पहले फ़ॉर्म देखें और बदलाव करें।",
    error: "सहायक जवाब नहीं दे सका। कृपया फिर कोशिश करें।",
    notConfigured: "AI पहचान सेवा कॉन्फ़िगर नहीं है। BackEnd/.env में GEMINI_API_KEY सेट करके बैकएंड रीस्टार्ट करें।",
    providerAuthError: "Gemini ने बैकएंड प्रमाण-पत्र स्वीकार नहीं किए। BackEnd/.env में GEMINI_API_KEY और API पहुँच जाँचें।",
    providerQuota: "Gemini API की अनुरोध सीमा या उपयोग कोटा उपलब्ध नहीं है। अपने Google AI Studio प्रोजेक्ट की जाँचें या बाद में फिर कोशिश करें।",
    providerRateLimit: "Gemini API की अनुरोध सीमा या उपयोग कोटा उपलब्ध नहीं है। कृपया बाद में फिर कोशिश करें।",
    providerError: "Gemini अनुरोध पूरा नहीं कर सका। बैकएंड की Gemini सेटिंग और मॉडल की उपलब्धता जाँचें।",
    timeout: "सहायक को जवाब देने में अधिक समय लगा। कृपया फिर कोशिश करें।",
    privacy: "पहचान के लिए केवल यह बातचीत और सेवाओं की सूची भेजी जाती है।",
  },
};

const CATEGORY_CATALOG = Object.entries(servicesData).map(([key, service]) => ({
  key,
  name: service.name,
  description: service.description,
  subServices: service.subServices,
}));

function isValidSuggestion(suggestion) {
  return (
    suggestion &&
    typeof suggestion.possibleIssue === "string" &&
    typeof suggestion.title === "string" &&
    typeof suggestion.summary === "string" &&
    (suggestion.serviceCategoryKey === null ||
      (typeof suggestion.serviceCategoryKey === "string" &&
        Object.prototype.hasOwnProperty.call(servicesData, suggestion.serviceCategoryKey)))
  );
}

function DiagnosisAssistant({ onApply }) {
  const [language, setLanguage] = useState("en");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const [applied, setApplied] = useState(false);
  const requestInFlight = useRef(false);
  const lastRequest = useRef({ content: "", time: 0 });
  const copy = COPY[language];

  const handleSend = async () => {
    const content = input.trim();
    const now = Date.now();
    if (
      !content ||
      pending ||
      requestInFlight.current ||
      (content === lastRequest.current.content &&
        now - lastRequest.current.time < DUPLICATE_REQUEST_WINDOW_MS)
    ) {
      return;
    }

    const conversation = [
      ...messages,
      { role: "user", content },
    ].slice(-MAX_CONVERSATION_MESSAGES);

    lastRequest.current = { content, time: now };
    requestInFlight.current = true;
    setPending(true);
    setError("");
    setSuggestion(null);
    setApplied(false);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/diagnosis/chat`, {
        language,
        messages: conversation,
        categories: CATEGORY_CATALOG,
      });

      const result = response.data?.data;
      if (
        response.data?.success !== true ||
        !result ||
        typeof result.reply !== "string" ||
        !["needs_more_info", "ready_for_review"].includes(result.state)
      ) {
        throw new Error("Invalid diagnosis response");
      }

      let nextSuggestion = null;
      if (result.state === "ready_for_review") {
        if (!isValidSuggestion(result.suggestion)) {
          throw new Error("Invalid diagnosis suggestion");
        }
        nextSuggestion = result.suggestion;
      }

      setMessages([
        ...conversation,
        { role: "assistant", content: result.reply },
      ]);
      setSuggestion(nextSuggestion);
      setInput("");
    } catch (requestError) {
      const errorCode = requestError.response?.data?.error?.code;
      if (errorCode === "AI_PROVIDER_NOT_CONFIGURED") {
        setError(copy.notConfigured);
      } else if (errorCode === "AI_PROVIDER_AUTH_FAILED") {
        setError(copy.providerAuthError);
      } else if (errorCode === "AI_PROVIDER_QUOTA_EXCEEDED") {
        setError(copy.providerQuota);
      } else if (errorCode === "AI_PROVIDER_RATE_LIMITED") {
        setError(copy.providerRateLimit);
      } else if (errorCode === "AI_PROVIDER_ERROR" || errorCode === "AI_PROVIDER_UNAVAILABLE") {
        setError(copy.providerError);
      } else if (errorCode === "AI_PROVIDER_TIMEOUT") {
        setError(copy.timeout);
      } else {
        setError(copy.error);
      }
    } finally {
      requestInFlight.current = false;
      setPending(false);
    }
  };

  const handleApply = () => {
    if (!suggestion) return;
    onApply(suggestion);
    setSuggestion(null);
    setApplied(true);
  };

  return (
    <section className="diagnosis-assistant" aria-labelledby="diagnosis-assistant-title">
      <div className="diagnosis-assistant-heading">
        <div>
          <span className="diagnosis-assistant-eyebrow">WORKBRIDGE AI</span>
          <h3 id="diagnosis-assistant-title">{copy.title}</h3>
          <p>{copy.intro}</p>
        </div>
        <span className="diagnosis-assistant-icon" aria-hidden="true">✦</span>
      </div>

      <fieldset className="diagnosis-language">
        <legend>{copy.language}</legend>
        <button
          type="button"
          className={language === "en" ? "active" : ""}
          aria-pressed={language === "en"}
          onClick={() => setLanguage("en")}
          disabled={pending}
        >
          {copy.english}
        </button>
        <button
          type="button"
          className={language === "hi" ? "active" : ""}
          aria-pressed={language === "hi"}
          onClick={() => setLanguage("hi")}
          disabled={pending}
        >
          {copy.hindi}
        </button>
      </fieldset>

      <div className="diagnosis-conversation" role="log" aria-live="polite">
        {messages.length === 0 && (
          <p className="diagnosis-welcome">{copy.welcome}</p>
        )}
        {messages.map((message, index) => (
          <p
            className={`diagnosis-message ${message.role}`}
            key={`${message.role}-${index}`}
          >
            {message.content}
          </p>
        ))}
        {pending && (
          <p className="diagnosis-message assistant" role="status">
            {copy.thinking}
          </p>
        )}
      </div>

      {error && <p className="diagnosis-error" role="alert">{error}</p>}

      {suggestion && (
        <div className="diagnosis-suggestion">
          <h4>{copy.possibleIssue}</h4>
          <p>{suggestion.possibleIssue}</p>
          <dl>
            <div>
              <dt>{copy.category}</dt>
              <dd>
                {suggestion.serviceCategoryKey
                  ? servicesData[suggestion.serviceCategoryKey].name
                  : copy.noCategory}
              </dd>
            </div>
            <div>
              <dt>{copy.titleLabel}</dt>
              <dd>{suggestion.title}</dd>
            </div>
            <div>
              <dt>{copy.summary}</dt>
              <dd>{suggestion.summary}</dd>
            </div>
          </dl>
          <button type="button" className="diagnosis-apply" onClick={handleApply}>
            {copy.apply}
          </button>
        </div>
      )}

      {applied && <p className="diagnosis-applied" role="status">{copy.applied}</p>}

      <div className="diagnosis-input-form">
        <label className="sr-only" htmlFor="diagnosis-message">{copy.title}</label>
        <textarea
          id="diagnosis-message"
          value={input}
          onChange={(event) => setInput(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
          placeholder={copy.placeholder}
          maxLength={MAX_MESSAGE_LENGTH}
          rows={3}
        />
        <button type="button" onClick={handleSend} disabled={pending || !input.trim()}>
          {pending ? copy.thinking : copy.send}
        </button>
      </div>
      <small className="diagnosis-privacy">{copy.privacy}</small>
    </section>
  );
}

export default DiagnosisAssistant;
