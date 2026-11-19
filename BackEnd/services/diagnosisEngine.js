const SERVICE_RULES = [
  {
    service: "AC Repair",
    pattern: /\b(ac|air conditioner|air conditioning|cooling|thanda|thandak)\b|एसी|कूलिंग|ठंडा/i,
    question: "क्या AC चल रहा है लेकिन हवा ठंडी नहीं हो रही?",
    assessment: "फिल्टर में रुकावट, गैस या किसी दूसरे AC component की समस्या हो सकती है।"
  },
  {
    service: "Plumbing",
    pattern: /\b(pipe|tap|faucet|leak|leaking|drain|drainage|clog|blocked|flush|water|plumb)\b|nal|paani|pani|ris|leakage|जाम|टपक|पाइप|नल|पानी/i,
    question: "क्या पानी का रिसाव लगातार हो रहा है, या केवल नल/फ्लश इस्तेमाल करने पर?",
    assessment: "पाइप, जोड़ या drain में रुकावट/लीकेज हो सकती है।"
  },
  {
    service: "Electrical",
    pattern: /\b(fan|light|switch|socket|plug|wiring|wire|electric|electrical|power|spark|short circuit|bulb|regulator)\b|pankha|bijli|current|pankhe|पंखा|बिजली|करंट|चिंगारी/i,
    question: "क्या समस्या एक ही switch/socket/appliance में है या घर के कई हिस्सों में बिजली नहीं आ रही?",
    assessment: "पंखे में capacitor या motor की समस्या हो सकती है।"
  },
  {
    service: "Carpentry",
    pattern: /\b(door|wardrobe|cabinet|drawer|furniture|wood|hinge|carpenter)\b|darwaza|lakdi|दरवाज़ा|दरवाजा|लकड़ी/i,
    question: "क्या समस्या दरवाज़े/फर्नीचर के अटकने में है, या कोई हिस्सा ढीला/टूटा है?",
    assessment: "hinge, fitting या लकड़ी के हिस्से की मरम्मत की जरूरत हो सकती है।"
  },
  {
    service: "Painting",
    pattern: /\b(paint|painting|wall|repaint|colour|color)\b|rangai|दीवार|पेंट/i,
    question: "क्या आपको पूरी दीवार/कमरा paint कराना है, या केवल किसी हिस्से का touch-up चाहिए?",
    assessment: "दीवार की सतह देखकर painting या touch-up का काम तय किया जा सकता है।"
  },
  {
    service: "Cleaning",
    pattern: /\b(clean|cleaning|deep clean|dirty)\b|safai|सफाई|गंदगी/i,
    question: "किस जगह की सफाई चाहिए—पूरा घर, kitchen, bathroom या कोई खास हिस्सा?",
    assessment: "जगह और सफाई के स्तर के अनुसार cleaning service तय होगी।"
  },
  {
    service: "Shifting",
    pattern: /\b(shift|shifting|move house|packers|relocation)\b|ghar badal|samaan shift|शिफ्ट|घर बदल/i,
    question: "क्या आपको पूरा घर shift करना है या कुछ सामान ही ले जाना है?",
    assessment: "सामान की मात्रा और दूरी के अनुसार shifting की व्यवस्था होगी।"
  },
  {
    service: "Handyman",
    pattern: /\b(handyman|install|installation|assemble|assembly|mount|shelf|curtain rod)\b|chhota mota kaam|छोटा मोटा काम/i,
    question: "क्या आपको installation/assembly करानी है या किसी चीज़ की छोटी-मोटी मरम्मत?",
    assessment: "installation या छोटी-मोटी घरेलू मरम्मत के लिए handyman service उपयुक्त हो सकती है।"
  }
];

const getUserMessages = (messages) =>
  messages
    .filter((message) => message.role === "user")
    .map((message) => message.content.trim());

const findServiceRule = (text) =>
  SERVICE_RULES.find((rule) => rule.pattern.test(text));

const buildAssessment = (rule, text) => {
  if (rule.service === "Electrical" && /\b(fan|pankha|pankhe)\b|पंखा/i.test(text)) {
    const reportsNoise = /\b(haan|ha|yes|humming|noise|awaaz|awaz)\b|आवाज़ आ|आवाज आ/i.test(text) &&
      !/\b(no|nahi|nahin)\b.{0,15}\b(sound|noise|humming|awaaz|awaz)\b|\b(sound|noise|humming|awaaz|awaz)\b.{0,15}\b(nahi|nahin|not)\b|आवाज़ नहीं|आवाज नहीं/i.test(text);
    return reportsNoise
      ? "आवाज़ आने के बावजूद fan न घूमे तो capacitor की समस्या हो सकती है; motor की जाँच भी जरूरी है।"
      : "पंखे में power supply, regulator, capacitor या motor की समस्या हो सकती है।";
  }

  return rule.assessment;
};

const getFollowUpQuestion = (rule, text) => {
  if (rule.service === "Electrical" && /\b(fan|pankha|pankhe)\b|पंखा/i.test(text)) {
    return "क्या fan से humming/आवाज़ आती है, लेकिन उसके blades घूम नहीं रहे?";
  }

  return rule.question;
};

const getDiagnosisReply = (messages) => {
  const userMessages = getUserMessages(messages);
  const combinedText = userMessages.join(" ");
  const latestUserMessage = userMessages[userMessages.length - 1];
  const rule = findServiceRule(combinedText);
  const hasAskedQuestion = messages.some((message) => message.role === "assistant");

  if (!rule) {
    return {
      reply: "घर में किस चीज़ में समस्या आ रही है? थोड़ा और बताइए, जैसे fan, पानी का नल, AC या दरवाज़ा।",
      recommendedService: null,
      diagnosis: null,
      complete: false
    };
  }

  if (!hasAskedQuestion) {
    return {
      reply: getFollowUpQuestion(rule, combinedText),
      recommendedService: null,
      diagnosis: null,
      complete: false
    };
  }

  const diagnosis = buildAssessment(rule, `${combinedText} ${latestUserMessage}`);

  return {
    reply: `${diagnosis} Recommended service – ${rule.service}.`,
    recommendedService: rule.service,
    diagnosis,
    complete: true
  };
};

module.exports = { getDiagnosisReply };
