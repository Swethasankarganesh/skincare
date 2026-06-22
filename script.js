// State management
let currentUser = null
let messageCount = 0
let userMessageCount = 0
let skinInfoCollected = 0
let chatHistory = []
let userSkinProfile = {
  skinType: null,
  concerns: [],
  products: [],
  routine: null,
  sensitivities: [],
  age: null,
  climate: null,
  budget: null,
}
const MAX_USER_MESSAGES = 5
let isAdmin = false
let conversationContext = []
let finalRecommendationGenerated = false

// DOM Elements
const landingPage = document.getElementById("landing-page")
const homePage = document.getElementById("home-page")
const dashboardPage = document.getElementById("dashboard-page")
const authModal = document.getElementById("auth-modal")
const userProfile = document.getElementById("user-profile")
const authButtons = document.getElementById("auth-buttons")
const userDetails = document.getElementById("user-details")
const dashboardDetails = document.getElementById("dashboard-details")
const chatMessages = document.getElementById("chat-messages")
const userInput = document.getElementById("user-input")
const sendBtn = document.getElementById("send-btn")
const premiumModal = document.getElementById("premium-modal")
const recommendationModal = document.getElementById("recommendation-modal")
const progressFill = document.getElementById("progress-fill")
const progressCount = document.getElementById("progress-count")

// Knowledge base for skincare
const skincareKnowledge = {
  ingredients: {
    "hyaluronic acid":
      "A powerful humectant that can hold up to 1000x its weight in water, making it excellent for hydration.",
    retinol:
      "A vitamin A derivative that promotes cell turnover and stimulates collagen production, helping with anti-aging.",
    "vitamin c":
      "An antioxidant that brightens skin, protects from environmental damage, and promotes collagen production.",
    niacinamide: "Vitamin B3 that regulates oil production, reduces pore appearance, and improves skin texture.",
    "salicylic acid": "A BHA that exfoliates inside pores, making it excellent for acne-prone skin.",
    "glycolic acid": "An AHA that exfoliates the skin surface, improving texture and tone.",
    ceramides: "Lipids that help maintain the skin barrier and retain moisture.",
    peptides: "Amino acid chains that signal skin to produce collagen.",
    "centella asiatica": "Also known as cica, it soothes irritation and supports skin healing.",
    bakuchiol: "A natural alternative to retinol with similar benefits but less irritation.",
  },
  skinTypes: {
    dry: {
      characteristics: "Feels tight, may have flaking, lacks oil, prone to fine lines",
      recommendations:
        "Use hydrating cleansers, rich moisturizers, and facial oils. Look for ingredients like hyaluronic acid, glycerin, ceramides, and fatty acids.",
    },
    oily: {
      characteristics: "Shiny appearance, enlarged pores, prone to acne and blackheads",
      recommendations:
        "Use gentle foaming cleansers, lightweight oil-free moisturizers, and ingredients like niacinamide, salicylic acid, and clay masks.",
    },
    combination: {
      characteristics: "Oily T-zone (forehead, nose, chin) but dry or normal cheeks",
      recommendations:
        "Use different products for different areas or balanced formulas. Gel moisturizers work well, and targeted treatments for specific concerns.",
    },
    normal: {
      characteristics: "Balanced, not too oily or dry, small pores, good circulation",
      recommendations:
        "Focus on maintenance with gentle cleansers, balanced moisturizers, and preventative care like antioxidants and sunscreen.",
    },
    sensitive: {
      characteristics: "Easily irritated, may have redness, stinging, or burning sensations",
      recommendations:
        "Use fragrance-free products with soothing ingredients like centella asiatica, aloe vera, and oat extract. Avoid harsh ingredients and always patch test.",
    },
  },
  concerns: {
    acne: {
      causes: "Excess oil, bacteria, inflammation, and clogged pores",
      treatments: "Salicylic acid, benzoyl peroxide, retinoids, niacinamide, and non-comedogenic products",
    },
    aging: {
      causes: "Sun damage, loss of collagen and elastin, environmental factors, genetics",
      treatments: "Retinoids, peptides, antioxidants, sunscreen, and hydration",
    },
    hyperpigmentation: {
      causes: "Sun exposure, inflammation, hormones, and skin injuries",
      treatments: "Vitamin C, alpha arbutin, kojic acid, niacinamide, AHAs, and sunscreen",
    },
    redness: {
      causes: "Sensitivity, rosacea, irritation, or damaged skin barrier",
      treatments: "Centella asiatica, green tea, azelaic acid, and gentle, fragrance-free products",
    },
    dryness: {
      causes: "Lack of natural oils, environmental factors, hot water, harsh products",
      treatments: "Hyaluronic acid, ceramides, glycerin, facial oils, and gentle cleansing",
    },
  },
  routineSteps: {
    cleansing: "Removes dirt, oil, makeup, and pollutants. Use gentle cleansers appropriate for your skin type.",
    toning: "Balances pH, adds hydration, and prepares skin for treatments. Look for alcohol-free formulas.",
    treatment: "Targets specific concerns with active ingredients like retinol, vitamin C, or acids.",
    moisturizing: "Hydrates and seals in moisture. Everyone needs moisturizer, regardless of skin type.",
    "sun protection": "Prevents sun damage, aging, and skin cancer. Use SPF 30+ daily, even when cloudy.",
  },
}

// Initialize
window.onload = () => {
  addBotMessage("Welcome! Please sign in to start chatting about your skincare needs.")
  updateProgressBar(0)
}

// Show auth modal
function showAuthModal(tab = "signin") {
  authModal.style.display = "flex"
  switchTab(tab)
}

// Switch between sign in and sign up tabs
function switchTab(tab) {
  const signinTab = document.getElementById("signin-tab")
  const signupTab = document.getElementById("signup-tab")
  const signinForm = document.getElementById("signin-form")
  const signupForm = document.getElementById("signup-form")

  if (tab === "signin") {
    signinTab.classList.add("active")
    signupTab.classList.remove("active")
    signinForm.classList.remove("hidden")
    signupForm.classList.add("hidden")
  } else {
    signinTab.classList.remove("active")
    signupTab.classList.add("active")
    signinForm.classList.add("hidden")
    signupForm.classList.remove("hidden")
  }
}

// Handle form submissions
document.getElementById("signin-form").addEventListener("submit", (e) => {
  e.preventDefault()
  const email = e.target.elements[0].value
  const password = e.target.elements[1].value

  // Check if admin login
  if (email === "admin@skincare.com" && password === "admin123") {
    isAdmin = true
  }

  handleSignIn(email)
})

document.getElementById("signup-form").addEventListener("submit", (e) => {
  e.preventDefault()
  const name = e.target.elements[0].value
  const email = e.target.elements[1].value
  handleSignUp(name, email)
})

// Authentication handlers
function handleSignIn(email) {
  currentUser = {
    name: email.split("@")[0],
    email: email,
    isPremium: false,
  }
  updateUIAfterAuth()
}

function handleSignUp(name, email) {
  currentUser = {
    name: name,
    email: email,
    isPremium: false,
  }
  updateUIAfterAuth()
}

function updateUIAfterAuth() {
  authModal.style.display = "none"
  landingPage.classList.add("hidden")
  homePage.classList.remove("hidden")
  authButtons.classList.add("hidden")
  userProfile.classList.remove("hidden")
  document.getElementById("profile-name").textContent = currentUser.name
  document.getElementById("profile-email").textContent = currentUser.email
  userInput.disabled = false
  sendBtn.disabled = false

  // Update dashboard info
  document.getElementById("dashboard-name").textContent = currentUser.name
  document.getElementById("dashboard-email").textContent = currentUser.email
  document.getElementById("profile-name-value").textContent = currentUser.name
  document.getElementById("profile-email-value").textContent = currentUser.email
  document.getElementById("profile-type-value").textContent = currentUser.isPremium ? "Premium" : "Free"
  document.getElementById("profile-messages-value").textContent = MAX_USER_MESSAGES - userMessageCount

  // Show admin tab if admin
  if (isAdmin) {
    document.getElementById("admin-tab").classList.remove("hidden")
  }

  // Reset chat
  chatMessages.innerHTML = ""
  updateProgressBar(0)

  // Welcome message with user's name
  addBotMessage(`Hi ${currentUser.name}! 👋 I'm your personal skincare assistant. I'll ask you 5 questions to create a personalized skincare routine for you.

Let's start with the basics:

1️⃣ How would you describe your skin type? (dry, oily, combination, normal, or sensitive)`)
}

// Toggle user details
function toggleUserDetails() {
  userDetails.classList.toggle("active")
}

// Toggle dashboard details
function toggleDashboardDetails() {
  dashboardDetails.classList.toggle("active")
}

// View dashboard
function viewDashboard() {
  homePage.classList.add("hidden")
  dashboardPage.classList.remove("hidden")
  userDetails.classList.remove("active")

  // Update dashboard info
  document.getElementById("profile-messages-value").textContent = MAX_USER_MESSAGES - userMessageCount

  // Load chat history
  loadChatHistory()

  // Update recommendations if available
  if (userSkinProfile.routine) {
    document.getElementById("recommendations-container").innerHTML = userSkinProfile.routine.replace(/\n/g, "<br>")
  }
}

// Return to chat
function returnToChat() {
  dashboardPage.classList.add("hidden")
  homePage.classList.remove("hidden")
  dashboardDetails.classList.remove("active")
}

// Switch dashboard tabs
function switchDashboardTab(tab) {
  // Hide all tabs
  document.getElementById("profile-tab").classList.add("hidden")
  document.getElementById("history-tab").classList.add("hidden")
  document.getElementById("recommendations-tab").classList.add("hidden")
  document.getElementById("admin-tab-content").classList.add("hidden")

  // Remove active class from all sidebar items
  const sidebarItems = document.querySelectorAll(".dashboard-sidebar li")
  sidebarItems.forEach((item) => item.classList.remove("active"))

  // Show selected tab
  document.getElementById(`${tab}-tab${tab === "admin" ? "-content" : ""}`).classList.remove("hidden")

  // Add active class to selected sidebar item
  document.querySelector(`.dashboard-sidebar li[onclick="switchDashboardTab('${tab}')"]`).classList.add("active")
}

// Load chat history
function loadChatHistory() {
  const historyContainer = document.getElementById("chat-history-container")
  historyContainer.innerHTML = ""

  if (chatHistory.length === 0) {
    historyContainer.innerHTML = "<p>No chat history yet.</p>"
    return
  }

  // Group by date
  const today = new Date().toLocaleDateString()

  // Add today's date
  const dateDiv = document.createElement("div")
  dateDiv.className = "chat-date"
  dateDiv.textContent = "Today"
  historyContainer.appendChild(dateDiv)

  // Add messages
  chatHistory.forEach((chat) => {
    const messageDiv = document.createElement("div")
    messageDiv.className = `message ${chat.role}`
    messageDiv.innerHTML = chat.content.replace(/\n/g, "<br>")
    historyContainer.appendChild(messageDiv)
  })
}

// Sign out
function signOut() {
  currentUser = null
  messageCount = 0
  userMessageCount = 0
  skinInfoCollected = 0
  chatHistory = []
  userSkinProfile = {
    skinType: null,
    concerns: [],
    products: [],
    routine: null,
    sensitivities: [],
    age: null,
    climate: null,
    budget: null,
  }
  conversationContext = []
  finalRecommendationGenerated = false
  isAdmin = false

  userProfile.classList.add("hidden")
  authButtons.classList.remove("hidden")
  userInput.disabled = true
  sendBtn.disabled = true
  userDetails.classList.remove("active")

  // Reset UI
  homePage.classList.add("hidden")
  dashboardPage.classList.add("hidden")
  landingPage.classList.remove("hidden")

  // Clear chat
  chatMessages.innerHTML = ""
  updateProgressBar(0)
}

// Update progress bar
function updateProgressBar(count) {
  progressCount.textContent = count
  const percentage = (count / MAX_USER_MESSAGES) * 100
  progressFill.style.width = `${percentage}%`
}

// Chat functionality
function sendMessage() {
  const message = userInput.value.trim()
  if (!message) return

  // Add user message
  addUserMessage(message)
  userInput.value = ""

  // Increment user message count
  userMessageCount++
  updateProgressBar(userMessageCount)

  // Show typing indicator
  const typingIndicator = document.createElement("div")
  typingIndicator.className = "message bot typing"
  typingIndicator.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>'
  chatMessages.appendChild(typingIndicator)
  chatMessages.scrollTop = chatMessages.scrollHeight

  // Add message to conversation context
  conversationContext.push({ role: "user", content: message })

  // Simulate bot response with typing delay
  setTimeout(() => {
    typingIndicator.remove()

    // Process message and update skin profile
    processUserMessage(message)

    // Generate response based on user message count
    let botResponse

    if (userMessageCount < MAX_USER_MESSAGES) {
      botResponse = generateQuestionResponse(userMessageCount)
    } else if (userMessageCount === MAX_USER_MESSAGES && !finalRecommendationGenerated) {
      // Generate final recommendation after 5th user message
      botResponse =
        "Thank you for providing all this information! I'm now creating your personalized skincare routine..."

      // Show final recommendation after a delay
      setTimeout(() => {
        showFinalRecommendation()
      }, 2000)

      finalRecommendationGenerated = true
    } else {
      botResponse =
        "Your personalized skincare routine has been created! You can view it in your dashboard under 'Recommendations'."
    }

    addBotMessage(botResponse)

    // Add bot response to conversation context
    conversationContext.push({ role: "assistant", content: botResponse })

    // Increment message count
    messageCount++
  }, 1500)
}

// Generate question based on user message count
function generateQuestionResponse(count) {
  switch (count) {
    case 1:
      return `Thanks for sharing your skin type! 

2️⃣ What are your main skin concerns? (acne, aging, hyperpigmentation, dryness, etc.)`
    case 2:
      return `Got it! Those are common concerns.

3️⃣ What skincare products are you currently using, if any?`
    case 3:
      return `Thanks for sharing your current routine.

4️⃣ Do you have any known skin sensitivities or allergies to ingredients?`
    case 4:
      return `Thank you for all this information!

5️⃣ Last question: What's your budget range for skincare products? (low/drugstore, mid-range, high-end)`
    default:
      return "Could you tell me more about your skin?"
  }
}

// Enhanced natural language processing
function processUserMessage(message) {
  message = message.toLowerCase()

  // Extract skin type information
  extractSkinType(message)

  // Extract skin concerns
  extractSkinConcerns(message)

  // Extract product usage
  extractProductUsage(message)

  // Extract sensitivities
  extractSensitivities(message)

  // Extract age information
  extractAgeInfo(message)

  // Extract climate information
  extractClimateInfo(message)

  // Extract budget information
  extractBudgetInfo(message)
}

function extractSkinType(message) {
  // Check for direct skin type mentions
  const skinTypeKeywords = {
    dry: ["dry", "flaky", "tight", "dehydrated", "rough"],
    oily: ["oily", "greasy", "shiny", "slick", "excess oil"],
    combination: ["combination", "t-zone", "oily t zone", "mixed"],
    normal: ["normal", "balanced", "neither oily nor dry"],
    sensitive: ["sensitive", "irritated", "reactive", "easily irritated"],
  }

  if (!userSkinProfile.skinType) {
    for (const [type, keywords] of Object.entries(skinTypeKeywords)) {
      if (keywords.some((keyword) => message.includes(keyword))) {
        userSkinProfile.skinType = type
        skinInfoCollected++
        break
      }
    }
  }

  // Check for descriptions that imply skin type
  if (!userSkinProfile.skinType) {
    if (message.includes("skin feels tight") || message.includes("flakes") || message.includes("need more moisture")) {
      userSkinProfile.skinType = "dry"
      skinInfoCollected++
    } else if (
      message.includes("too much oil") ||
      message.includes("always shiny") ||
      message.includes("large pores")
    ) {
      userSkinProfile.skinType = "oily"
      skinInfoCollected++
    } else if (message.includes("oily in some places") || message.includes("dry in some areas")) {
      userSkinProfile.skinType = "combination"
      skinInfoCollected++
    }
  }
}

function extractSkinConcerns(message) {
  const concernKeywords = {
    acne: ["acne", "pimple", "breakout", "zit", "blemish", "spot"],
    aging: ["aging", "wrinkle", "fine line", "crow's feet", "sagging", "mature"],
    hyperpigmentation: ["dark spot", "hyperpigmentation", "discoloration", "uneven tone", "melasma", "sun spot"],
    redness: ["redness", "flush", "rosacea", "irritation", "inflammation"],
    dryness: ["dryness", "dehydration", "flaking", "tight feeling"],
    oiliness: ["oiliness", "shine", "greasy", "sebum"],
    texture: ["texture", "rough", "bumpy", "uneven", "smooth"],
    pores: ["pore", "enlarged pores", "visible pores", "blackhead", "whitehead"],
    sensitivity: ["sensitivity", "irritation", "reaction", "burning", "stinging"],
  }

  for (const [concern, keywords] of Object.entries(concernKeywords)) {
    if (keywords.some((keyword) => message.includes(keyword)) && !userSkinProfile.concerns.includes(concern)) {
      userSkinProfile.concerns.push(concern)
      skinInfoCollected++
    }
  }
}

function extractProductUsage(message) {
  if (message.includes("use") || message.includes("using") || message.includes("apply")) {
    const productTypes = [
      "cleanser",
      "face wash",
      "moisturizer",
      "cream",
      "lotion",
      "serum",
      "sunscreen",
      "spf",
      "toner",
      "mask",
      "exfoliant",
      "scrub",
      "oil",
      "retinol",
      "vitamin c",
      "acid",
      "essence",
      "ampoule",
    ]

    productTypes.forEach((product) => {
      if (message.includes(product) && !userSkinProfile.products.includes(product)) {
        userSkinProfile.products.push(product)
        skinInfoCollected++
      }
    })
  }
}

function extractSensitivities(message) {
  if (
    message.includes("sensitive") ||
    message.includes("allergy") ||
    message.includes("allergic") ||
    message.includes("react") ||
    message.includes("irritate") ||
    message.includes("burn") ||
    message.includes("sting")
  ) {
    const sensitiveIngredients = [
      "fragrance",
      "perfume",
      "alcohol",
      "essential oil",
      "paraben",
      "sulfate",
      "retinol",
      "acid",
      "benzoyl",
      "salicylic",
      "exfoliant",
      "preservative",
      "dye",
      "colorant",
      "lanolin",
      "propylene glycol",
    ]

    sensitiveIngredients.forEach((ingredient) => {
      if (message.includes(ingredient) && !userSkinProfile.sensitivities.includes(ingredient)) {
        userSkinProfile.sensitivities.push(ingredient)
        skinInfoCollected++
      }
    })
  }
}

function extractAgeInfo(message) {
  // Extract age information
  const ageRegex = /\b(i am|i'm|im)\s+(\d+)\s+(years old|year old|yo)\b/i
  const ageMatch = message.match(ageRegex)

  if (ageMatch && ageMatch[2]) {
    userSkinProfile.age = Number.parseInt(ageMatch[2])
    skinInfoCollected++
  }

  // Extract age range
  const ageRanges = {
    teens: ["teen", "teenager", "adolescent"],
    "20s": ["20s", "twenties", "early twenties", "late twenties"],
    "30s": ["30s", "thirties", "early thirties", "late thirties"],
    "40s": ["40s", "forties", "early forties", "late forties"],
    "50s": ["50s", "fifties", "early fifties", "late fifties"],
    "60+": ["60", "70", "senior", "mature skin"],
  }

  if (!userSkinProfile.age) {
    for (const [range, keywords] of Object.entries(ageRanges)) {
      if (keywords.some((keyword) => message.includes(keyword))) {
        userSkinProfile.age = range
        skinInfoCollected++
        break
      }
    }
  }
}

function extractClimateInfo(message) {
  const climateKeywords = {
    dry: ["dry climate", "desert", "arid", "low humidity"],
    humid: ["humid", "tropical", "high humidity", "moisture in the air"],
    cold: ["cold", "winter", "freezing", "below freezing"],
    hot: ["hot", "summer", "heat", "warm climate"],
  }

  for (const [climate, keywords] of Object.entries(climateKeywords)) {
    if (keywords.some((keyword) => message.includes(keyword))) {
      userSkinProfile.climate = climate
      skinInfoCollected++
      break
    }
  }
}

function extractBudgetInfo(message) {
  // Check for budget mentions
  const budgetKeywords = {
    low: ["cheap", "affordable", "budget", "inexpensive", "drugstore", "low cost"],
    medium: ["mid-range", "moderate", "middle", "not too expensive"],
    high: ["high-end", "luxury", "expensive", "premium", "willing to spend"],
  }

  for (const [budget, keywords] of Object.entries(budgetKeywords)) {
    if (keywords.some((keyword) => message.includes(keyword))) {
      userSkinProfile.budget = budget
      skinInfoCollected++
      break
    }
  }
}

// Add user message to chat
function addUserMessage(message) {
  const messageDiv = document.createElement("div")
  messageDiv.className = "message user"
  messageDiv.textContent = message
  chatMessages.appendChild(messageDiv)
  chatMessages.scrollTop = chatMessages.scrollHeight

  // Add to chat history
  chatHistory.push({
    role: "user",
    content: message,
  })
}

// Add bot message to chat
function addBotMessage(message) {
  const messageDiv = document.createElement("div")
  messageDiv.className = "message bot"
  messageDiv.innerHTML = message.replace(/\n/g, "<br>")
  chatMessages.appendChild(messageDiv)
  chatMessages.scrollTop = chatMessages.scrollHeight

  // Add to chat history
  chatHistory.push({
    role: "bot",
    content: message,
  })
}

// Add system message to chat
function addSystemMessage(message) {
  const messageDiv = document.createElement("div")
  messageDiv.className = "message system"
  messageDiv.textContent = message
  chatMessages.appendChild(messageDiv)
  chatMessages.scrollTop = chatMessages.scrollHeight
}

// Show final recommendation
function showFinalRecommendation() {
  const finalRecommendation = generateFinalRecommendation()

  // Display in modal
  document.getElementById("final-recommendation").innerHTML = finalRecommendation.replace(/\n/g, "<br>")
  recommendationModal.classList.remove("hidden")

  // Save recommendation to profile
  userSkinProfile.routine = finalRecommendation

  // Update recommendations in dashboard
  document.getElementById("recommendations-container").innerHTML = finalRecommendation.replace(/\n/g, "<br>")
}

// Close recommendation modal
function closeRecommendationModal() {
  recommendationModal.classList.add("hidden")
}

// Save recommendation
function saveRecommendation() {
  addSystemMessage("Your personalized skincare routine has been saved to your profile!")
  closeRecommendationModal()
}

// Generate final recommendation based on collected skin info
function generateFinalRecommendation() {
  let recommendation = `✨ PERSONALIZED SKINCARE ROUTINE FOR ${currentUser.name.toUpperCase()} ✨\n\n`

  // Morning routine
  recommendation += `🌞 MORNING ROUTINE:\n`
  recommendation += `1️⃣ Cleanser: `

  if (userSkinProfile.skinType === "dry") {
    recommendation += `Hydrating, cream-based cleanser (look for ceramides and glycerin)\n`
  } else if (userSkinProfile.skinType === "oily") {
    recommendation += `Gentle foaming cleanser with salicylic acid\n`
  } else if (userSkinProfile.skinType === "combination") {
    recommendation += `Balanced pH gel cleanser\n`
  } else if (userSkinProfile.skinType === "sensitive") {
    recommendation += `Fragrance-free, milky cleanser with soothing ingredients\n`
  } else {
    recommendation += `Gentle gel or cream cleanser\n`
  }

  // Toner
  recommendation += `2️⃣ Toner: `
  if (userSkinProfile.skinType === "dry") {
    recommendation += `Hydrating toner with hyaluronic acid\n`
  } else if (userSkinProfile.skinType === "oily") {
    recommendation += `Balancing toner with witch hazel (alcohol-free)\n`
  } else if (userSkinProfile.concerns.includes("acne")) {
    recommendation += `BHA toner with salicylic acid (use 2-3 times per week)\n`
  } else {
    recommendation += `Alcohol-free hydrating toner\n`
  }

  // Serum
  recommendation += `3️⃣ Serum: `
  if (
    userSkinProfile.concerns.includes("aging") ||
    userSkinProfile.concerns.includes("wrinkle") ||
    userSkinProfile.concerns.includes("fine line")
  ) {
    recommendation += `Vitamin C serum for antioxidant protection and brightening\n`
  } else if (userSkinProfile.concerns.includes("dark spot") || userSkinProfile.concerns.includes("hyperpigmentation")) {
    recommendation += `Brightening serum with niacinamide or alpha arbutin\n`
  } else if (userSkinProfile.concerns.includes("acne")) {
    recommendation += `Niacinamide serum to regulate oil and reduce inflammation\n`
  } else {
    recommendation += `Hydrating serum with hyaluronic acid\n`
  }

  // Moisturizer
  recommendation += `4️⃣ Moisturizer: `
  if (userSkinProfile.skinType === "dry") {
    recommendation += `Rich cream with ceramides and fatty acids\n`
  } else if (userSkinProfile.skinType === "oily") {
    recommendation += `Lightweight, oil-free gel moisturizer\n`
  } else if (userSkinProfile.skinType === "combination") {
    recommendation += `Balanced lotion or gel-cream hybrid\n`
  } else if (userSkinProfile.skinType === "sensitive") {
    recommendation += `Fragrance-free moisturizer with soothing ingredients\n`
  } else {
    recommendation += `Medium-weight moisturizer\n`
  }

  // Sunscreen
  recommendation += `5️⃣ Sunscreen: SPF 30+ broad-spectrum `
  if (userSkinProfile.skinType === "oily") {
    recommendation += `oil-free, mattifying formula\n\n`
  } else if (userSkinProfile.skinType === "sensitive") {
    recommendation += `mineral-based (zinc oxide/titanium dioxide)\n\n`
  } else {
    recommendation += `suited to your skin type\n\n`
  }

  // Evening routine
  recommendation += `🌙 EVENING ROUTINE:\n`
  recommendation += `1️⃣ Cleanser: Same as morning, or double cleanse with oil cleanser followed by water-based cleanser\n`

  // Treatment
  recommendation += `2️⃣ Treatment: `
  if (
    userSkinProfile.concerns.includes("aging") ||
    userSkinProfile.concerns.includes("wrinkle") ||
    userSkinProfile.concerns.includes("fine line")
  ) {
    recommendation += `Retinol serum (start with low concentration 1-2 times per week)\n`
  } else if (userSkinProfile.concerns.includes("dark spot") || userSkinProfile.concerns.includes("hyperpigmentation")) {
    recommendation += `AHA serum (glycolic or lactic acid) 2-3 times per week\n`
  } else if (userSkinProfile.concerns.includes("acne")) {
    recommendation += `BHA treatment with salicylic acid or benzoyl peroxide spot treatment\n`
  } else {
    recommendation += `Hydrating or repairing serum\n`
  }

  // Night moisturizer
  recommendation += `3️⃣ Moisturizer: `
  if (userSkinProfile.skinType === "dry") {
    recommendation += `Rich night cream or sleeping mask\n\n`
  } else if (userSkinProfile.skinType === "oily") {
    recommendation += `Lightweight gel moisturizer or oil-free night treatment\n\n`
  } else {
    recommendation += `Slightly richer version of your daytime moisturizer\n\n`
  }

  // Weekly treatments
  recommendation += `🔄 WEEKLY TREATMENTS:\n`
  if (userSkinProfile.skinType === "dry") {
    recommendation += `- Hydrating mask 1-2 times per week\n`
  } else if (userSkinProfile.skinType === "oily" || userSkinProfile.concerns.includes("acne")) {
    recommendation += `- Clay mask 1-2 times per week\n`
  }

  if (userSkinProfile.skinType !== "sensitive") {
    recommendation += `- Gentle exfoliation 1-2 times per week (avoid if using retinol or acids)\n\n`
  }

  // Tips
  recommendation += `💡 TIPS:\n`
  recommendation += `- Introduce new products one at a time, waiting 1-2 weeks before adding another\n`
  recommendation += `- Always patch test new products, especially if you have sensitive skin\n`
  recommendation += `- Consistency is key - stick with your routine for at least 4-6 weeks to see results\n`
  recommendation += `- Drink plenty of water and maintain a balanced diet for skin health\n`

  if (userSkinProfile.sensitivities.length > 0) {
    recommendation += `- Avoid products containing: ${userSkinProfile.sensitivities.join(", ")}\n`
  }

  // Budget recommendations
  if (userSkinProfile.budget) {
    recommendation += `\n💰 BUDGET RECOMMENDATIONS (${userSkinProfile.budget.toUpperCase()}):\n`

    if (userSkinProfile.budget === "low") {
      recommendation += `Look for brands like CeraVe, The Ordinary, The Inkey List, and Neutrogena for affordable yet effective options.`
    } else if (userSkinProfile.budget === "medium") {
      recommendation += `Consider brands like Paula's Choice, La Roche-Posay, Kiehl's, and First Aid Beauty for mid-range quality products.`
    } else if (userSkinProfile.budget === "high") {
      recommendation += `Luxury brands like Drunk Elephant, Tatcha, Sunday Riley, and Skinceuticals offer premium formulations with high-quality ingredients.`
    }
  }

  return recommendation
}

// Premium modal
function showPremiumModal() {
  premiumModal.classList.remove("hidden")
}

function closePremiumModal() {
  premiumModal.classList.add("hidden")
}

// Add event listener for Enter key in chat input
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage()
  }
})

