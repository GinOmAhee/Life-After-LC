import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAQNThNeCaMD7Z8O8mhCGsYyXbg2X8bpms",
  authDomain: "life-after-loop-catcher.firebaseapp.com",
  projectId: "life-after-loop-catcher",
  storageBucket: "life-after-loop-catcher.appspot.com",
  messagingSenderId: "664318439902",
  appId: "1:664318439902:web:93748f55f1cb547bbead4f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const ideaId = urlParams.get('id');
const ideaTitle = urlParams.get('title');

// Global variables
let userSettings = null;
let currentUser = null;
let showingAllTools = false;
let matchedCategories = [];

// Tool categories with keywords
const toolCategories = {
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

// Storage URLs
const storageUrls = {
  'gdrive': 'https://drive.google.com',
  'onedrive': 'https://onedrive.live.com',
  'dropbox': 'https://www.dropbox.com',
  'box': 'https://www.box.com',
  'amazon': 'https://www.amazon.com/photos',
  'mega': 'https://mega.io',
  'pcloud': 'https://www.pcloud.com',
  'sync': 'https://www.sync.com',
  'tresorit': 'https://tresorit.com',
  'icedrive': 'https://icedrive.net'
};

// Load user settings
async function loadUserSettings() {
  if (!currentUser) return;

  try {
    const settingsDoc = await getDoc(doc(db, 'userSettings', currentUser.uid));
    if (settingsDoc.exists()) {
      userSettings = settingsDoc.data();
      console.log('✅ User settings loaded', userSettings);
    }
  } catch (err) {
    console.error('Error loading user settings:', err);
  }
}

// ✅ FIXED SKIP LOGIC
async function loadAndSuggestTools() {
  if (!ideaId || !db) {
    showNoSuggestions('No idea ID found');
    return;
  }

  try {
    const ideaDoc = await getDoc(doc(db, 'items', ideaId));
    
    if (!ideaDoc.exists()) {
      showNoSuggestions('Idea not found');
      return;
    }

    const ideaData = ideaDoc.data();
    
    // ✅ RULE 1: User has preferred tools → show ONLY preferred tools (highest priority)
    if (userSettings?.preferredTools && userSettings.preferredTools.length > 0) {
      console.log('🎯 Showing user preferred tools (overriding all rules)');
      document.getElementById('toolsSubtitle').textContent = 'Your preferred tools';
      hideNoSuggestions();
      renderPreferredToolsOnly();
      return;
    }
    
    // ✅ RULE 2: User skipped prep → show ALL tools
    if (ideaData.prepSkipped === true) {
      console.log('📋 Prep was skipped - showing all tools');
      document.getElementById('toolsSubtitle').textContent = 'You skipped prep, here are all available tools';
      hideNoSuggestions();
      renderAllTools();
      return;
    }
    
    // Get minimum version
    const minVersion = ideaData.firstTest?.minVersion?.toLowerCase() || '';
    
    // ✅ RULE 3: User answered prep but left Minimum Version empty → show message
    if (!minVersion || minVersion.trim() === '') {
      console.log('⚠️ No minimum version provided');
      showNoSuggestions('No tool suggestions to show. Please indicate the target Minimum Version for this creation.');
      return;
    }
    
    // ✅ RULE 4: User entered Minimum Version → match keywords
    console.log('🔍 Matching keywords from minimum version:', minVersion);
    matchedCategories = [];
    
    for (const [key, category] of Object.entries(toolCategories)) {
      const hasMatch = category.keywords.some(keyword => 
        minVersion.includes(keyword.toLowerCase())
      );
      if (hasMatch) {
        matchedCategories.push(category);
      }
    }
    
    // If keywords matched, show suggested tools
    if (matchedCategories.length > 0) {
      console.log(`✅ Found ${matchedCategories.length} matching tool categories`);
      document.getElementById('toolsSubtitle').textContent = 'Based on your prep answers, here are some tools that might help:';
      hideNoSuggestions();
      renderTools(matchedCategories);
      return;
    }
    
    // If no keywords matched, show all tools
    console.log('📋 No keyword matches - showing all tools');
    document.getElementById('toolsSubtitle').textContent = 'Browse all available tools';
    hideNoSuggestions();
    renderAllTools();

  } catch (err) {
    console.error('Error loading idea data:', err);
    showNoSuggestions('Error loading idea data');
  }
}

// Show "no suggestions" message
function showNoSuggestions(message) {
  const noSuggestionsEl = document.getElementById('noSuggestions');
  noSuggestionsEl.innerHTML = `<p>${message}</p>`;
  noSuggestionsEl.classList.remove('hidden');
  document.getElementById('toolsList').innerHTML = '';
}

// Hide "no suggestions" message
function hideNoSuggestions() {
  document.getElementById('noSuggestions').classList.add('hidden');
}

// Render preferred tools ONLY (no other categories)
function renderPreferredToolsOnly() {
  const toolsList = document.getElementById('toolsList');
  toolsList.innerHTML = '';

  const preferredCategory = document.createElement('div');
  preferredCategory.className = 'tool-category';
  
  preferredCategory.innerHTML = `
    <h3>⭐ My Preferred Tools</h3>
    <div class="tool-list">
      ${userSettings.preferredTools.map(tool => {
        if (!tool.name || !tool.url) return '';
        const cleanUrl = tool.url.replace(/^https?:\/\//, '');
        return `
          <a href="${tool.url.startsWith('http') ? tool.url : 'https://' + tool.url}" 
             target="_blank" 
             class="tool-item" 
             data-tool-name="${tool.name.toLowerCase()}">
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

// Render suggested tools
function renderTools(categories) {
  const toolsList = document.getElementById('toolsList');
  toolsList.innerHTML = '';

  categories.forEach(category => {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'tool-category';
    categoryDiv.dataset.category = category.title.toLowerCase();
    
    categoryDiv.innerHTML = `
      <h3>${category.emoji} ${category.title}</h3>
      <div class="tool-list">
        ${category.tools.map(tool => `
          <a href="https://${tool.url}" 
             target="_blank" 
             class="tool-item" 
             data-tool-name="${tool.name.toLowerCase()}">
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

// Render all tool categories
function renderAllTools() {
  const toolsList = document.getElementById('toolsList');
  toolsList.innerHTML = '';

  Object.values(toolCategories).forEach(category => {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'tool-category';
    categoryDiv.dataset.category = category.title.toLowerCase();
    
    categoryDiv.innerHTML = `
      <h3>${category.emoji} ${category.title}</h3>
      <div class="tool-list">
        ${category.tools.map(tool => `
          <a href="https://${tool.url}" 
             target="_blank" 
             class="tool-item" 
             data-tool-name="${tool.name.toLowerCase()}">
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

// Handle storage selection
async function handleStorageSelection(type) {
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
  document.getElementById('fileLocationModal').classList.add('hidden');

  // Handle local or open URL
  if (type === 'local') {
    setTimeout(() => {
      alert('💡 Tip: Open your file explorer to access your local files');
    }, 300);
  } else if (storageUrls[type]) {
    window.open(storageUrls[type], '_blank');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  console.log('✅ Capture page loaded');
  
  // Set idea title
  if (ideaTitle) {
    document.getElementById('ideaTitle').textContent = `Creating: ${decodeURIComponent(ideaTitle)}`;
  }
  
  // Wait for auth
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      await loadUserSettings();
      await loadAndSuggestTools();
    }
  });
  
  // View All Tools button
  document.getElementById('viewAllBtn').addEventListener('click', () => {
    showingAllTools = !showingAllTools;
    const btn = document.getElementById('viewAllBtn');
    
    if (showingAllTools) {
      btn.textContent = 'View Suggested Only';
      renderAllTools();
    } else {
      btn.textContent = 'View All Tools';
      if (matchedCategories.length > 0) {
        renderTools(matchedCategories);
      } else {
        loadAndSuggestTools(); // Reload original logic
      }
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
  
  // Review output button
  document.getElementById('reviewOutputBtn').addEventListener('click', () => {
    if (userSettings?.defaultStorage && userSettings.defaultStorage !== '') {
      handleStorageSelection(userSettings.defaultStorage);
    } else {
      document.getElementById('fileLocationModal').classList.remove('hidden');
    }
  });
  
  // Close modal button
  document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('fileLocationModal').classList.add('hidden');
  });
  
  // Handle location option clicks
  document.querySelectorAll('.location-option').forEach(option => {
    option.addEventListener('click', (e) => {
      e.preventDefault();
      const type = option.dataset.type;
      handleStorageSelection(type);
    });
  });
  
  console.log('✅ Capture page initialized');
});
