import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAQNThNeCaMD7Z8O8mhCGsYyXbg2X8bpms",
  authDomain: "life-after-loop-catcher.firebaseapp.com",
  projectId: "life-after-loop-catcher",
  storageBucket: "life-after-loop-catcher.appspot.com",
  messagingSenderId: "664318439902",
  appId: "1:664318439902:web:93748f55f1cb547bbead4f"
};

const isFirebaseConfigured = !Object.values(firebaseConfig).includes("REPLACE");

let db = null;
let app = null;
let auth = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase connected');
  } catch (err) {
    console.warn('Firebase initialization failed:', err);
    document.getElementById('firebaseWarning').classList.remove('hidden');
  }
} else {
  console.warn('Firebase not configured - running in demo mode');
  document.getElementById('firebaseWarning').classList.remove('hidden');
}

if (auth && isFirebaseConfigured) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      console.log('No user logged in, redirecting to login...');
      window.location.href = 'index.html';
    } else {
      console.log('✅ User logged in:', user.email);
    }
  });
} else {
  console.log('Auth check skipped - Firebase not configured');
}

const logoutBtn = document.getElementById('logoutBtn');
const settingsBtn = document.getElementById('settingsBtn');

settingsBtn.addEventListener('click', () => {
  window.location.href = 'settings.html';
});

logoutBtn.addEventListener('click', async () => {
  if (!auth) {
    alert('Firebase Auth not configured');
    return;
  }
  
  if (confirm('Are you sure you want to logout?')) {
    try {
      await signOut(auth);
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error logging out: ' + error.message);
    }
  }
});

// Output category detection triggers
const outputTriggers = {
  "🧱 Physical/Tangible": ["build", "make", "object", "thing", "device", "material", "ingredient", "recipe", "craft", "model", "prototype", "diy", "tool", "wearable", "machine", "consume", "gadget", "physical", "equipment"],
  "🎪 Service/Experience": ["help", "offer", "support", "guide", "teach", "learn", "session", "group", "retreat", "event", "experience", "in-person", "activity", "therapy", "workshop", "training", "class", "consult"],
  "🎨 Media/Content": ["write", "film", "record", "video", "audio", "song", "story", "post", "article", "podcast", "comic", "art", "illustration", "graphic", "animation", "presentation", "report", "case study", "newsletter", "essay", "photo", "meme"],
  "🖥️ Digital Product/Tech": ["app", "software", "website", "dashboard", "portal", "platform", "plugin", "api", "automation", "bot", "ai", "model", "script", "spreadsheet", "calculator", "database", "vr", "ar", "simulation", "code", "framework", "template"],
  "🧠 System/Method/Process": ["method", "system", "workflow", "process", "framework", "routine", "tactic", "strategy", "blueprint", "protocol", "procedure", "plan", "checklist", "metrics", "evaluation", "infrastructure", "architecture", "operating model"],
  "🏢 Organization/Group": ["company", "business", "team", "group", "community", "movement", "organization", "foundation", "startup", "brand", "collective", "association", "enterprise", "school", "society", "club"],
  "🎯 Skill/Capability": ["learn", "ability", "skill", "competency", "train", "master", "develop", "practice", "improve", "capability"],
  "🧩 Idea/Theory": ["concept", "idea", "theory", "hypothesis", "model", "lens", "analysis", "interpretation", "critique", "belief", "principle", "framework", "taxonomy", "classification", "equation", "formula", "philosophy", "argument"],
  "🌱 Mindset/Identity": ["identity", "mindset", "worldview", "values", "lifestyle", "persona", "behavior", "trait", "coping", "norm", "culture", "tradition", "custom"],
  "👥 Social Connection": ["relationship", "connection", "partnership", "collab", "community", "audience", "fanbase", "tribe", "scene", "meetup", "network", "conversation", "dialogue", "legacy", "lineage"],
  "⚖️ Legal/Policy": ["policy", "law", "regulation", "rule", "treaty", "agreement", "contract", "bylaw", "charter", "permit", "license", "certification", "standard", "ip", "patent", "trademark", "copyright"],
  "🌟 Vision/Mission/Purpose/Goal": ["goal", "vision", "mission", "purpose", "dream", "aspiration", "hope", "intention", "commitment", "transformation", "shift", "potential", "opportunity", "change", "innovation", "spark", "challenge", "obstacle", "breakthrough", "trend", "wave", "impact"],
  "🕒 Tiny Task": ["quick", "right now", "small", "simple", "micro", "fast", "just a step", "test", "try", "sketch", "mock", "draft", "send", "check", "note", "lookup"],
  "🗂️ Long-Term Project": ["build", "develop", "over time", "multi-step", "ongoing", "create fully", "launch", "construct", "produce", "design", "fund", "scale", "plan out", "research"],
  "🌪️ Random Thought": ["idk", "just thinking", "vibes", "weird idea", "random", "chaotic", "maybe", "feels like", "what if", "no clue what this is"]
};

function detectOutput(term) {
  const lowerTerm = term.toLowerCase();
  let bestMatch = null;
  let maxScore = 0;
  
  for (const [category, triggers] of Object.entries(outputTriggers)) {
    let score = 0;
    for (const trigger of triggers) {
      if (lowerTerm.includes(trigger)) {
        score++;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = category;
    }
  }
  
  return bestMatch;
}

const priorityMap = {
  "✨ Relevant to Current Concerns🧠 Be Clear": "HIGH",
  "✨ Relevant to Current Concerns🌱 Store Potential Innovations": "HIGH",
  "✨ Relevant to Current Concerns📚 To Refine/Expand Knowledge": "HIGH",
  "🏗️ Too Important/Foundational to Ignore🧠 Be Clear": "HIGH",
  "🏗️ Too Important/Foundational to Ignore🌱 Store Potential Innovations": "MEDIUM",
  "🏗️ Too Important/Foundational to Ignore📚 To Refine/Expand Knowledge": "MEDIUM",
  "🌱 Interesting, But Not Urgent🧠 Be Clear": "MEDIUM",
  "🌱 Interesting, But Not Urgent🌱 Store Potential Innovations": "LOW",
  "🌱 Interesting, But Not Urgent📚 To Refine/Expand Knowledge": "LOW",
  "👽 Not Related/Can Save for Later🧠 Be Clear": "LOW",
  "👽 Not Related/Can Save for Later🌱 Store Potential Innovations": "VERY LOW",
  "👽 Not Related/Can Save for Later📚 To Refine/Expand Knowledge": "VERY LOW"
};

const destMap = {
  "HIGH": "🚀 Act Now",
  "MEDIUM": "🌿 Build Momentum",
  "LOW": "⏳ Later, But Worth It",
  "VERY LOW": "📦 Parked Potential"
};

const viewsEl = document.getElementById('views');
const listEl = document.getElementById('list');
const newItemBtn = document.getElementById('newItemBtn');
const modal = document.getElementById('modal');
const itemForm = document.getElementById('itemForm');
const cancelBtn = document.getElementById('cancelBtn');
const inputSheetEl = document.getElementById('input-sheet');
const inputBodyEl = document.getElementById('input-body');
const addRowBtn = document.getElementById('add-row');

const rowCountModal = document.getElementById('rowCountModal');
const rowCountInput = document.getElementById('rowCountInput');
const confirmRowCount = document.getElementById('confirmRowCount');
const cancelRowCount = document.getElementById('cancelRowCount');

let cachedItems = [];
let currentView = "🤔 Idea Board";

function formatDate(timestamp) {
  if (!timestamp) return '';
  
  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date(timestamp);
  }
  
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ✅ GLOBALS
let userSettings = {};
let toolCategories = {};
let showingAllTools = false;
let matchedCategories = [];
let skippedPrep = false;

// For Create page DOM refs (will be null on other pages)
let toolsSectionEl = null;
let toolsListEl = null;
let noSuggestionsEl = null;
let toolSearchEl = null;
let viewAllBtnEl = null;
let fileLocationModal = null;
let reviewOutputBtn = null;
let closeModalBtn = null;

toolCategories = {
  writing: {
    keywords: ['write', 'draft', 'compose', 'outline', 'summarize', 'clarify', 'edit', 'document', 'note', 'list', 'jot', 'quick draft', 'practice writing'],
    emoji: '✍️',
    title: 'Text Editors & Documentation',
    tools: [
      { name: 'Google Docs', url: 'docs.google.com', emoji: '📄' },
      { name: 'Microsoft Word Online', url: 'office.com/word', emoji: '📝' },
      { name: 'Notion', url: 'notion.so', emoji: '📓' },
      { name: 'Evernote', url: 'evernote.com', emoji: '🗒️' },
      { name: 'Obsidian', url: 'obsidian.md', emoji: '💎' },
      { name: 'Process Street', url: 'process.st', emoji: '📋' },
      { name: 'SweetProcess', url: 'sweetprocess.com', emoji: '🍬' },
      { name: 'Confluence', url: 'atlassian.com/software/confluence', emoji: '🌊' }
    ]
  },
  design: {
    keywords: ['design', 'illustrate', 'sketch', 'render', 'mockup', 'storyboard', 'doodle', 'quick sketch', 'sample image', 'prototype'],
    emoji: '🎨',
    title: 'Design & Visual Tools',
    tools: [
      { name: 'Canva', url: 'canva.com', emoji: '🎨' },
      { name: 'Adobe Photoshop', url: 'adobe.com/photoshop', emoji: '🖼️' },
      { name: 'Figma', url: 'figma.com', emoji: '🔷' },
      { name: 'Miro', url: 'miro.com', emoji: '🗺️' },
      { name: 'Whimsical', url: 'whimsical.com', emoji: '✨' }
    ]
  },
  data: {
    keywords: ['analyze', 'calculate', 'chart', 'graph', 'compare', 'measure', 'assess', 'check numbers', 'quick review', 'sample calc', 'test data'],
    emoji: '📊',
    title: 'Data & Analytics',
    tools: [
      { name: 'Microsoft Excel', url: 'office.com/excel', emoji: '📗' },
      { name: 'Google Sheets', url: 'sheets.google.com', emoji: '📊' },
      { name: 'Tableau', url: 'tableau.com', emoji: '📈' },
      { name: 'Power BI', url: 'powerbi.microsoft.com', emoji: '📉' },
      { name: 'Looker Studio', url: 'lookerstudio.google.com', emoji: '📋' }
    ]
  },
  research: {
    keywords: ['research', 'discover', 'explore', 'investigate', 'validate', 'gather', 'quick search', 'look up', 'skim', 'check one source'],
    emoji: '🔍',
    title: 'Research & Discovery',
    tools: [
      { name: 'Google Search', url: 'google.com', emoji: '🔍' },
      { name: 'Bing with Copilot', url: 'bing.com', emoji: '🤖' },
      { name: 'Google Scholar', url: 'scholar.google.com', emoji: '🎓' },
      { name: 'Perplexity AI', url: 'perplexity.ai', emoji: '🧠' },
      { name: 'Semantic Scholar', url: 'semanticscholar.org', emoji: '📚' }
    ]
  },
  shopping: {
    keywords: ['buy', 'shop', 'compare', 'review', 'recommend', 'suggest', 'evaluate', 'check one item', 'quick browse', 'sample product'],
    emoji: '🛒',
    title: 'Shopping & E-commerce',
    tools: [
      { name: 'Amazon', url: 'amazon.com', emoji: '📦' },
      { name: 'Shopee', url: 'shopee.ph', emoji: '🛍️' },
      { name: 'Lazada', url: 'lazada.com.ph', emoji: '🏪' },
      { name: 'Google Shopping', url: 'shopping.google.com', emoji: '🔍' }
    ]
  },
  location: {
    keywords: ['locate', 'map', 'directions', 'explore', 'recommend', 'discover', 'check nearby', 'quick lookup', 'one location', 'sample route'],
    emoji: '🗺️',
    title: 'Maps & Travel',
    tools: [
      { name: 'Google Maps', url: 'maps.google.com', emoji: '🗺️' },
      { name: 'Waze', url: 'waze.com', emoji: '🚗' },
      { name: 'TripAdvisor', url: 'tripadvisor.com', emoji: '✈️' },
      { name: 'Booking.com', url: 'booking.com', emoji: '🏨' }
    ]
  },
  video: {
    keywords: ['watch', 'learn', 'demonstrate', 'record', 'stream', 'tutorial', 'walkthrough', 'quick clip', 'sample video', 'test recording', 'short demo'],
    emoji: '🎥',
    title: 'Video & Streaming',
    tools: [
      { name: 'YouTube', url: 'youtube.com', emoji: '📺' },
      { name: 'Loom', url: 'loom.com', emoji: '🎬' },
      { name: 'Vimeo', url: 'vimeo.com', emoji: '🎞️' },
      { name: 'OBS Studio', url: 'obsproject.com', emoji: '📹' }
    ]
  },
  communication: {
    keywords: ['share', 'notify', 'message', 'update', 'collaborate', 'connect', 'mentor', 'send one email', 'post once', 'quick reply', 'test message'],
    emoji: '💬',
    title: 'Communication & Collaboration',
    tools: [
      { name: 'Gmail', url: 'gmail.com', emoji: '📧' },
      { name: 'Slack', url: 'slack.com', emoji: '💬' },
      { name: 'Microsoft Teams', url: 'teams.microsoft.com', emoji: '👥' },
      { name: 'Discord', url: 'discord.com', emoji: '🎮' }
    ]
  },
  management: {
    keywords: ['manage', 'schedule', 'invoice', 'track', 'organize', 'plan', 'optimize', 'check one invoice', 'log one expense', 'sample schedule'],
    emoji: '📋',
    title: 'Project & Business Management',
    tools: [
      { name: 'Trello', url: 'trello.com', emoji: '📋' },
      { name: 'Asana', url: 'asana.com', emoji: '✅' },
      { name: 'ClickUp', url: 'clickup.com', emoji: '🎯' },
      { name: 'Monday.com', url: 'monday.com', emoji: '📅' },
      { name: 'Notion', url: 'notion.so', emoji: '📓' }
    ]
  },
  brainstorm: {
    keywords: ['brainstorm', 'imagine', 'innovate', 'prototype', 'experiment', 'try', 'test', 'start', 'pilot', 'smallest version', 'quick attempt'],
    emoji: '💡',
    title: 'Brainstorming & Prototyping',
    tools: [
      { name: 'Miro', url: 'miro.com', emoji: '🗺️' },
      { name: 'Whimsical', url: 'whimsical.com', emoji: '✨' },
      { name: 'Figma', url: 'figma.com', emoji: '🔷' },
      { name: 'Notion', url: 'notion.so', emoji: '📓' },
      { name: 'Obsidian', url: 'obsidian.md', emoji: '💎' }
    ]
  }
};

const storageUrls = {
  gdrive: 'https://drive.google.com',
  onedrive: 'https://onedrive.live.com',
  dropbox: 'https://www.dropbox.com',
  box: 'https://www.box.com',
  amazon: 'https://www.amazon.com/photos',
  mega: 'https://mega.io',
  pcloud: 'https://www.pcloud.com',
  sync: 'https://www.sync.com',
  tresorit: 'https://tresorit.com',
  icedrive: 'https://icedrive.net'
};

async function handleStorageSelection(type) {
  const db = window.db;
  const ideaId = window.ideaId;

  if (ideaId && db) {
    try {
      await updateDoc(doc(db, 'items', ideaId), {
        createCompleted: true,
        createCompletedAt: serverTimestamp(),
        reviewCompleted: true,
        reviewCompletedAt: serverTimestamp(),
        fileLocation: type
      });
      console.log('✅ Progress updated');
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  }

  if (fileLocationModal) {
    fileLocationModal.classList.add('hidden');
  }

  if (type === 'local') {
    setTimeout(() => {
      alert('Tip: Open your file explorer to access your local files');
    }, 300);
  } else if (storageUrls[type]) {
    window.open(storageUrls[type], '_blank');
  }
}

// ✅ FUNCTIONS MOVED FROM capture.html
async function loadAndSuggestTools() {
  if (!ideaId || !db) {
    document.getElementById('noSuggestions').classList.remove('hidden');
    return;
  }

  try {
    const ideaDoc = await getDoc(doc(db, 'items', ideaId));
    
    if (!ideaDoc.exists()) {
      document.getElementById('noSuggestions').classList.remove('hidden');
      return;
    }

    const ideaData = ideaDoc.data();
    const minVersion = ideaData.firstTest?.minVersion?.toLowerCase() || "";
    const prepSkipped = ideaData.prepSkipped === true;

    // ✅ CASE 1: Preferred tools override everything
    if (userSettings?.preferredTools && userSettings.preferredTools.length > 0) {
      document.getElementById('noSuggestions').classList.add('hidden');
      renderTools([{ title: "Preferred", tools: userSettings.preferredTools, emoji: "⭐" }]);
      return;
    }

    // ✅ CASE 3: User skipped prep → show ALL tools
    if (prepSkipped || minVersion === "__skipped__") {
      document.getElementById('noSuggestions').classList.add('hidden');
      renderTools([]); // all tools
      return;
    }

    // ✅ CASE 2: Prep answered but Minimum Version empty → show NO suggestions
    if (!minVersion || minVersion.trim() === "") {
      const msg = document.getElementById('noSuggestions');
      msg.innerHTML = `
        <p>Set the Minimum Version you can accomplish to see suggested tools, or view all tools.</p>
      `;
      msg.classList.remove('hidden');
      return;
    }

    // ✅ Detect matching categories
    matchedCategories = [];
    for (const [key, category] of Object.entries(toolCategories)) {
      const hasMatch = category.keywords.some(keyword =>
        minVersion.includes(keyword.toLowerCase())
      );
      if (hasMatch) matchedCategories.push(category);
    }

    // ✅ If Minimum Version provided but no matches → show ALL tools
    if (matchedCategories.length === 0) {
      document.getElementById('noSuggestions').classList.add('hidden');
      renderTools([]); // all tools
      return;
    }

    // ✅ Otherwise show suggested categories
    renderTools(matchedCategories);

  } catch (err) {
    console.error('Error loading idea data:', err);
    document.getElementById('noSuggestions').classList.remove('hidden');
  }
}

function renderTools(categories) {
  const toolsList = document.getElementById('toolsList');
  toolsList.innerHTML = '';

  // ✅ If categories is empty → show ALL tools
  if (!categories || categories.length === 0) {
    document.getElementById('noSuggestions').classList.add('hidden');
    renderAllTools();
    return;
  }

  // ✅ Hide "no suggestions" because we have categories
  document.getElementById('noSuggestions').classList.add('hidden');

  // First, render preferred tools if user has them
  if (userSettings?.preferredTools && userSettings.preferredTools.length > 0) {
    const preferredCategory = document.createElement('div');
    preferredCategory.className = 'tool-category';
    preferredCategory.dataset.category = 'preferred';
        
    preferredCategory.innerHTML = `
      <h3>⭐ My Preferred Tools</h3>
      <div class="tool-list">
        ${userSettings.preferredTools.map(tool => {
          if (!tool.name || !tool.url) return '';
          const cleanUrl = tool.url.replace(/^https?:\/\//, '');
          return `
            <a href="${tool.url.startsWith('http') ? tool.url : 'https://' + tool.url}" target="_blank" class="tool-item" data-tool-name="${tool.name.toLowerCase()}">
              <span class="tool-emoji">⭐</span>
              <div class="tool-text">
                <span class="tool-name">${tool.name}</span>
                <span class="tool-url">${cleanUrl}</span>
              </div>
            </a>
          `;
        }).join('')}
      </div>
    `;
        
    toolsList.appendChild(preferredCategory);
  }

  // Then render suggested/all categories
  categories.forEach(category => {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'tool-category';
    categoryDiv.dataset.category = category.title.toLowerCase();
        
    categoryDiv.innerHTML = `
      <h3>${category.emoji} ${category.title}</h3>
      <div class="tool-list">
        ${category.tools.map(tool => `
          <a href="https://${tool.url}" target="_blank" class="tool-item" data-tool-name="${tool.name.toLowerCase()}">
            <span class="tool-emoji">${tool.emoji}</span>
            <div class="tool-text">
              <span class="tool-name">${tool.name}</span>
              <span class="tool-url">${tool.url}</span>
            </div>
          </a>
        `).join('')}
      </div>
    `;
        
    toolsList.appendChild(categoryDiv);
  });
}

function renderAllTools() {
  const toolsList = document.getElementById('toolsList');
  toolsList.innerHTML = '';

  document.getElementById('noSuggestions').classList.add('hidden');

  Object.values(toolCategories).forEach(category => {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'tool-category';
    categoryDiv.dataset.category = category.title.toLowerCase();

    categoryDiv.innerHTML = `
      <h3>${category.emoji} ${category.title}</h3>
      <div class="tool-list">
        ${category.tools.map(tool => `
          <a href="https://${tool.url}" target="_blank" class="tool-item" data-tool-name="${tool.name.toLowerCase()}">
            <span class="tool-emoji">${tool.emoji}</span>
            <div class="tool-text">
              <span class="tool-name">${tool.name}</span>
              <span class="tool-url">${tool.url}</span>
            </div>
          </a>
        `).join('')}
      </div>
    `;

    toolsList.appendChild(categoryDiv);
  });
}

async function handleStorageSelection(type) {
  // Mark stages as complete silently
  if (ideaId && db) {
    try {
      await updateDoc(doc(db, 'items', ideaId), {
        createCompleted: true,
        createCompletedAt: serverTimestamp(),
        reviewCompleted: true,
        reviewCompletedAt: serverTimestamp(),
        fileLocation: type
      });
      console.log('✅ Progress updated');
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  }

  // Close modal
  fileLocationModal.classList.add('hidden');

  // Handle local or open URL
  if (type === 'local') {
    setTimeout(() => {
      alert('💡 Tip: Open your file explorer to access your local files');
    }, 300);
  } else if (storageUrls[type]) {
    window.open(storageUrls[type], '_blank');
  }
}    

async function loadUserSettingsSafely() {
  try {
    const stored = localStorage.getItem("userSettings");
    return stored ? JSON.parse(stored) : {};
  } catch (err) {
    console.error("Error loading user settings:", err);
    return {};
  }
}

async function autoSaveRow(row) {
  if (!db) {
    console.log('Firebase not configured - skipping auto-save');
    return;
  }

  const termInput = row.querySelector('.term-input');
  const outputSelect = row.querySelector('.output-select');
  const cueSelect = row.querySelector('.cue-select');
  const goalSelect = row.querySelector('.goal-select');

  const term = termInput.value.trim();
  const output = outputSelect.value;
  const cue = cueSelect.value;
  const goal = goalSelect.value;

  if (!term || !output || !cue || !goal) {
    return;
  }

  const key = `${cue}${goal}`;
  const newPriority = priorityMap[key];
  
  if (!newPriority) {
    console.warn('Invalid cue+goal combination');
    return;
  }

  const status = destMap[newPriority];
  const now = serverTimestamp();
  
  const payload = {
    term,
    output,
    cue,
    goal,
    priority: newPriority,
    status,
    createdAt: now,
    updatedAt: now,
    dateAdded: now
  };

  try {
    row.classList.add('saving');
    await addDoc(collection(db, 'items'), payload);
    row.classList.remove('saving');
    row.classList.add('saved');
    
    setTimeout(() => {
      clearRow(row);
      row.classList.remove('saved');
    }, 500);
    
    console.log('✅ Auto-saved:', term);
  } catch (err) {
    row.classList.remove('saving');
    console.error('Auto-save failed:', err);
  }
}

function setupAutoSave(row) {
  const termInput = row.querySelector('.term-input');
  const outputSelect = row.querySelector('.output-select');
  const cueSelect = row.querySelector('.cue-select');
  const goalSelect = row.querySelector('.goal-select');
  const saveBtn = row.querySelector('.save-quick-btn');
  const clearBtn = row.querySelector('.clear-row-btn');

  // Auto-clear other fields when term is deleted
  termInput.addEventListener('input', () => {
    if (termInput.value.trim() === '') {
      outputSelect.value = '';
      cueSelect.value = '';
      goalSelect.value = '';
    }
  });

  // Auto-detect output when term changes
  const debouncedDetect = debounce(() => {
    const term = termInput.value.trim();
    if (term && !outputSelect.value) {
      const detected = detectOutput(term);
      if (detected) {
        outputSelect.value = detected;
        outputSelect.style.borderColor = 'var(--accent)';
        setTimeout(() => {
          outputSelect.style.borderColor = '';
        }, 1000);
      }
    }
  }, 500);

  termInput.addEventListener('input', debouncedDetect);

  const debouncedSave = debounce(() => autoSaveRow(row), 1000);

  termInput.addEventListener('input', debouncedSave);
  outputSelect.addEventListener('change', () => autoSaveRow(row));
  cueSelect.addEventListener('change', () => autoSaveRow(row));
  goalSelect.addEventListener('change', () => autoSaveRow(row));
  
  // Quick save button (saves to Parked Potential without other fields)
  saveBtn.addEventListener('click', async () => {
    const term = termInput.value.trim();
    const output = outputSelect.value;
    
    if (!term) {
      alert('Please enter a term');
      return;
    }
    
    if (!db) {
      alert('Firebase not configured');
      return;
    }
    
    const now = serverTimestamp();
    const payload = {
      term,
      output: output || 'Not specified',
      cue: '',
      goal: '',
      priority: 'VERY LOW',
      status: '📦 Parked Potential',
      createdAt: now,
      updatedAt: now,
      dateAdded: now
    };
    
    try {
      row.classList.add('saving');
      await addDoc(collection(db, 'items'), payload);
      row.classList.remove('saving');
      row.classList.add('saved');
      
      setTimeout(() => {
        clearRow(row);
        row.classList.remove('saved');
      }, 500);
      
      console.log('✅ Quick saved to Parked Potential:', term);
    } catch (err) {
      row.classList.remove('saving');
      console.error('Quick save failed:', err);
      alert('Error saving: ' + err.message);
    }
  });

  // Clear button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearRow(row);
    });
  }
}

// Clear all fields in a row
function clearRow(row) {
  row.querySelector('.term-input').value = '';
  row.querySelector('.output-select').value = '';
  row.querySelector('.cue-select').value = '';
  row.querySelector('.goal-select').value = '';
}

function addSingleRow() {
  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td><input type="text" class="term-input" placeholder="Enter term"></td>
    <td>
      <select class="output-select">
        <option value="">Auto-detect...</option>
        <option value="🧱 Physical/Tangible">🧱 Physical/Tangible</option>
        <option value="🎪 Service/Experience">🎪 Service/Experience</option>
        <option value="🎨 Media/Content">🎨 Media/Content</option>
        <option value="🖥️ Digital Product/Tech">🖥️ Digital Product/Tech</option>
        <option value="🧠 System/Method/Process">🧠 System/Method/Process</option>
        <option value="🏢 Organization/Group">🏢 Organization/Group</option>
        <option value="🎯 Skill/Capability">🎯 Skill/Capability</option>
        <option value="🧩 Idea/Theory">🧩 Idea/Theory</option>
        <option value="🌱 Mindset/Identity">🌱 Mindset/Identity</option>
        <option value="👥 Social Connection">👥 Social Connection</option>
        <option value="⚖️ Legal/Policy">⚖️ Legal/Policy</option>
        <option value="🌟 Vision/Purpose/Goal">🌟 Vision/Purpose/Goal</option>
        <option value="🕒 Tiny Task">🕒 Tiny Task</option>
        <option value="🗂️ Long-Term Project">🗂️ Long-Term Project</option>
        <option value="🌪️ Random Thought">🌪️ Random Thought</option>
      </select>
    </td>
    <td>
      <select class="cue-select">
        <option value="">Select cue</option>
        <option value="✨ Relevant to Current Concerns">✨ Relevant to Current Concerns</option>
        <option value="🏗️ Too Important/Foundational to Ignore">🏗️ Too Important/Foundational</option>
        <option value="🌱 Interesting, But Not Urgent">🌱 Interesting, But Not Urgent</option>
        <option value="👽 Not Related/Can Save for Later">👽 Not Related/Can Save for Later</option>
      </select>
    </td>
    <td>
      <select class="goal-select">
        <option value="">Select goal</option>
        <option value="🧠 Be Clear">🧠 Be Clear</option>
        <option value="🌱 Store Potential Innovations">🌱 Store Potential Innovations</option>
        <option value="📚 To Refine/Expand Knowledge">📚 To Refine/Expand Knowledge</option>
      </select>
    </td>
    <td>
      <button class="save-quick-btn">Save</button>
      <button class="clear-row-btn">Clear</button>
    </td>
  `;
  inputBodyEl.appendChild(newRow);
  setupAutoSave(newRow);
}

function openRowCountModal() {
  rowCountModal.classList.remove('hidden');
  rowCountInput.focus();
}

function closeRowCountModal() {
  rowCountModal.classList.add('hidden');
}

function openLaunchModal(ideaId, ideaTerm) {
  const modal = document.createElement('div');
  modal.className = 'launch-modal';
  modal.innerHTML = `
    <div class="launch-modal-content">
      <h2>🚀 Launch "${escapeHtml(ideaTerm)}"</h2>
      <p style="color: var(--text-muted); margin-bottom: 24px;">Choose what happens next:</p>
      
      <div class="launch-options">
        <button class="launch-option" data-action="archive">
          <div class="option-icon">📦</div>
          <div class="option-text">
            <strong>Launched & Archive</strong>
            <span>Mark as complete and archive this idea</span>
          </div>
        </button>
        
        <button class="launch-option" data-action="testing">
          <div class="option-icon">🧪</div>
          <div class="option-text">
            <strong>Launched & Move to User Testing</strong>
            <span>Continue with user feedback phase</span>
          </div>
        </button>
      </div>
      
      <div style="text-align: center; margin-top: 24px;">
        <button class="btn btn-secondary" onclick="this.closest('.launch-modal').remove()">Cancel</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelectorAll('.launch-option').forEach(btn => {
    btn.addEventListener('click', async () => {
      const action = btn.dataset.action;
      await handleLaunch(ideaId, action);
      modal.remove();
    });
  });
}

async function handleLaunch(ideaId, action) {
  if (!db) {
    alert('Firebase not configured');
    return;
  }

  try {
    const updateData = {
      launchCompleted: true,
      launchCompletedAt: serverTimestamp(),
      launchAction: action
    };

    if (action === 'archive') {
      updateData.status = '📦 Archived';
      updateData.archived = true;
    } else if (action === 'testing') {
      updateData.status = '🧪 User Testing';
      updateData.inTesting = true;
    }

    await updateDoc(doc(db, 'items', ideaId), updateData);
    
    const actionText = action === 'archive' ? 'archived' : 'moved to user testing';
    alert(`✅ Successfully launched and ${actionText}!`);
    
    console.log(`🚀 Launched: ${ideaId} - Action: ${action}`);
  } catch (err) {
    console.error('Launch error:', err);
    alert('Error launching: ' + err.message);
  }
}

function openModal(item = null) {
  modal.classList.remove('hidden');
  itemForm.reset();
  itemForm.querySelector('[name=id]').value = item?.id || '';
  itemForm.querySelector('[name=term]').value = item?.term || '';
  itemForm.querySelector('[name=output]').value = item?.output || '';
  itemForm.querySelector('[name=cue]').value = item?.cue || '';
  itemForm.querySelector('[name=goal]').value = item?.goal || '';
  document.getElementById('modalTitle').textContent = item ? 'Edit Item' : 'New Item';
}

function closeModal() {
  modal.classList.add('hidden');
  itemForm.reset();
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]);
}

// ✅ EVENT LISTENERS MOVED FROM capture.html
// View All Tools button
document.getElementById('viewAllBtn').addEventListener('click', () => {
  showingAllTools = !showingAllTools;
  const btn = document.getElementById('viewAllBtn');
      
  if (showingAllTools) {
    btn.textContent = 'View Suggested Only';
    renderTools([]); // empty array = show ALL tools
  } else {
    btn.textContent = 'View All Tools';
    renderTools(matchedCategories.length > 0 ? matchedCategories : []);
  }
});

// Search functionality
document.getElementById('toolSearch').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
      
  document.querySelectorAll('.tool-category').forEach(category => {
    const tools = category.querySelectorAll('.tool-item');
    let hasVisibleTool = false;
        
    tools.forEach(tool => {
      const toolName = tool.dataset.toolName;
      if (toolName.includes(searchTerm)) {
        tool.style.display = 'flex';
        hasVisibleTool = true;
      } else {
        tool.style.display = 'none';
      }
    });

    category.classList.toggle('hidden', !hasVisibleTool);
  });
});

// Handle location option clicks
document.querySelectorAll('.location-option').forEach(option => {
  option.addEventListener('click', async (e) => {
    e.preventDefault();
    const type = option.dataset.type;
    handleStorageSelection(type);
  });
});

document.querySelectorAll('#input-body tr').forEach(row => {
  setupAutoSave(row);
});


newItemBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (currentView === "🤔 Idea Board") {
    openRowCountModal();
  } else {
    openModal();
  }
});

addRowBtn.addEventListener('click', (e) => {
  e.preventDefault();
  addSingleRow();
});

confirmRowCount.addEventListener('click', () => {
  const count = parseInt(rowCountInput.value) || 1;
  if (count < 1 || count > 20) {
    alert('Please enter a number between 1 and 20');
    return;
  }
  for (let i = 0; i < count; i++) {
    addSingleRow();
  }
  closeRowCountModal();
});

cancelRowCount.addEventListener('click', () => {
  closeRowCountModal();
});

cancelBtn.addEventListener('click', (e) => {
  e.preventDefault();
  closeModal();
});

itemForm.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  
  if (!db) {
    alert('Firebase not configured. Please update Firebase config to save items.');
    return;
  }
  
  const form = new FormData(itemForm);
  const term = form.get('term').trim();
  const output = form.get('output').trim();
  const cue = form.get('cue').trim();
  const goal = form.get('goal').trim();
  const id = form.get('id');

  if (!term || !output || !cue || !goal) return alert('Fill all fields');

  const key = `${cue}${goal}`;
  const newPriority = priorityMap[key];
  if (!newPriority) return alert('Invalid cue+goal combo');

  const status = destMap[newPriority];
  const now = serverTimestamp();
  
  const payload = { 
    term,
    output,
    cue, 
    goal, 
    priority: newPriority, 
    status, 
    updatedAt: now
  };
  
  if (!id) {
    payload.createdAt = now;
    payload.dateAdded = now;
  }

  try {
    if (id) {
      await updateDoc(doc(db, 'items', id), payload);
    } else {
      await addDoc(collection(db, 'items'), payload);
    }
    closeModal();
  } catch (err) {
    console.error(err);
    alert('Error saving item');
  }
});

if (db) {
  const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
  onSnapshot(q, snapshot => {
    cachedItems = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    renderView(currentView, cachedItems);
  });
}

function selectView(view) {
  currentView = view;
  setActiveNav(view);
  renderView(view, cachedItems);
}

function setActiveNav(view) {
  document.querySelectorAll('#views button').forEach(b => {
    b.classList.toggle('active', b.dataset.view === view);
  });
}

function renderView(view = currentView, items = []) {
  currentView = view;
  setActiveNav(view);

  if (view === "🤔 Idea Board") {
    inputSheetEl.classList.remove('hidden');
    listEl.classList.add('hidden');
    newItemBtn.textContent = '+ Add Rows';
    return;
  } else {
    inputSheetEl.classList.add('hidden');
    listEl.classList.remove('hidden');
    newItemBtn.textContent = '+ New Item';
  }

  if (!items.length) {
    listEl.innerHTML = '<p style="color:var(--text-muted)">No items yet. Add some from the Idea Board!</p>';
    return;
  }

  const filtered = items.filter(it => it.status === view);
  if (!filtered.length) {
    listEl.innerHTML = `<p style="color:var(--text-muted)">no items in "${view}" — add one!</p>`;
    return;
  }

  listEl.innerHTML = '';
  filtered.forEach((it, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    
    const dateText = formatDate(it.dateAdded || it.createdAt);
    
    // Calculate progress percentage
    let completedStages = 0;
    const totalStages = 4;
    
    if (it.prepCompleted || it.prepSkipped) completedStages++;
    if (it.createCompleted) completedStages++;
    if (it.reviewCompleted) completedStages++;
    if (it.launchCompleted) completedStages++;
    
    const progressPercentage = (completedStages / totalStages) * 100;
    
    card.innerHTML = `
      <div class="meta">
        <h3>${escapeHtml(it.term)}</h3>
        <p><strong>This idea becomes:</strong> ${escapeHtml(it.output || 'Not specified')}</p>
        <p style="color:var(--text-muted);font-size:12px">
          ${dateText ? 'Added ' + dateText : ''}
        </p>
        
        <div class="progress-container">
          <div class="progress-label">
            <span style="font-size: 11px; color: var(--text-muted);">Progress</span>
            <span style="font-size: 11px; color: var(--accent); font-weight: 600;">${Math.round(progressPercentage)}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${progressPercentage}%"></div>
          </div>
          <div class="progress-stages">
            <span class="stage ${it.prepCompleted || it.prepSkipped ? 'completed' : ''}" title="Prep">📋</span>
            <span class="stage ${it.createCompleted ? 'completed' : ''}" title="Create">🎨</span>
            <span class="stage ${it.reviewCompleted ? 'completed' : ''}" title="Review">📂</span>
            <span class="stage ${it.launchCompleted ? 'completed' : ''}" title="Launch">🚀</span>
          </div>
        </div>
      </div>
      <div class="actions">
        ${!it.launchCompleted ? `<button class="small get-started" data-id="${it.id}" data-term="${escapeHtml(it.term)}">Get Started</button>` : ''}
        ${it.reviewCompleted && !it.launchCompleted ? `<button class="small launch-btn" data-id="${it.id}" data-term="${escapeHtml(it.term)}">Launch</button>` : ''}
        ${it.launchCompleted ? `<span class="status-badge">✅ Launched</span>` : ''}
        <button class="small edit" data-id="${it.id}">Edit</button>
        <button class="small delete" data-id="${it.id}">Delete</button>
      </div>
    `;
    listEl.appendChild(card);

    const getStartedBtn = card.querySelector('.get-started');
    
    if (getStartedBtn) {
      if (it.prepCompleted || it.prepSkipped) {
        getStartedBtn.textContent = 'Resume';
        getStartedBtn.style.background = 'rgba(34, 197, 94, 0.2)';
        getStartedBtn.style.color = '#22c55e';
        getStartedBtn.style.borderColor = 'rgba(34, 197, 94, 0.5)';
        
        getStartedBtn.onclick = () => {
          if (it.createCompleted && it.reviewCompleted) {
            alert('All stages complete! Ready to launch.');
          } else if (it.createCompleted) {
            alert('Create complete! Click "Choose File Location" in the create page to mark review as done.');
            window.location.href = `capture.html?id=${it.id}&title=${encodeURIComponent(it.term)}`;
          } else if (it.prepCompleted || it.prepSkipped) {
            window.location.href = `capture.html?id=${it.id}&title=${encodeURIComponent(it.term)}`;
          } else {
            window.location.href = `prep.html?id=${it.id}&title=${encodeURIComponent(it.term)}`;
          }
        };
      } else {
        getStartedBtn.onclick = () => {
          window.location.href = `prep.html?id=${it.id}&title=${encodeURIComponent(it.term)}`;
        };
      }
    }

    const launchBtn = card.querySelector('.launch-btn');
    if (launchBtn) {
      launchBtn.onclick = () => openLaunchModal(it.id, it.term);
    }

    card.querySelector('.edit').onclick = () => openModal(it);
    card.querySelector('.delete').onclick = async () => {
      if (!db) {
        alert('Firebase not configured');
        return;
      }
      if (confirm(`Delete "${it.term}"?`)) {
        try {
          await deleteDoc(doc(db, 'items', it.id));
          console.log('✅ Deleted:', it.term);
        } catch (err) {
          console.error('Delete failed:', err);
          alert('Error deleting item');
        }
      }
    };
  });
}

// ✅ INITIALIZER
document.addEventListener("DOMContentLoaded", async () => {
  userSettings = await loadUserSettingsSafely();
  await loadAndSuggestTools();
});

document.addEventListener("DOMContentLoaded", async () => {
  // This runs for all pages, so guard by currentPage
  if (window.currentPage === 'capture') {
    toolsSectionEl = document.getElementById('toolsSection');
    toolsListEl = document.getElementById('toolsList');
    noSuggestionsEl = document.getElementById('noSuggestions');
    toolSearchEl = document.getElementById('toolSearch');
    viewAllBtnEl = document.getElementById('viewAllBtn');
    fileLocationModal = document.getElementById('fileLocationModal');
    reviewOutputBtn = document.getElementById('reviewOutputBtn');
    closeModalBtn = document.getElementById('closeModalBtn');

    // Load user settings from localStorage
    userSettings = await loadUserSettingsSafely();
    console.log("✅ User settings loaded in Create page:", userSettings);

    // Event listeners
    if (viewAllBtnEl) {
      viewAllBtnEl.addEventListener('click', () => {
        showingAllTools = !showingAllTools;
        if (showingAllTools) {
          viewAllBtnEl.textContent = 'View Suggested Only';
          renderTools([]); // show ALL tools
        } else {
          viewAllBtnEl.textContent = 'View All Tools';
          renderTools(matchedCategories.length > 0 ? matchedCategories : []);
        }
      });
    }

    if (toolSearchEl) {
      toolSearchEl.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.tool-category').forEach(category => {
          const tools = category.querySelectorAll('.tool-item');
          let hasVisibleTool = false;

          tools.forEach(tool => {
            const toolName = tool.dataset.toolName;
            if (toolName.includes(searchTerm)) {
              tool.style.display = 'flex';
              hasVisibleTool = true;
            } else {
              tool.style.display = 'none';
            }
          });

          category.classList.toggle('hidden', !hasVisibleTool);
        });
      });
    }

    if (reviewOutputBtn && fileLocationModal) {
      reviewOutputBtn.addEventListener('click', () => {
        if (userSettings?.defaultStorage && userSettings.defaultStorage !== '') {
          handleStorageSelection(userSettings.defaultStorage);
        } else {
          fileLocationModal.classList.remove('hidden');
        }
      });
    }

    if (closeModalBtn && fileLocationModal) {
      closeModalBtn.addEventListener('click', () => {
        fileLocationModal.classList.add('hidden');
      });
    }

    document.querySelectorAll('.location-option').forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        const type = option.dataset.type;
        handleStorageSelection(type);
      });
    });

    // Finally, load tool suggestions
    await loadAndSuggestTools();
  }

  console.log('✅ App initialized');
});
