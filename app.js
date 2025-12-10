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

/* ========================================
   SPONSORED ADS CONFIGURATION (COMMENTED OUT)
   Uncomment when ready to use
   ======================================== */

/*
// Ad/Sponsorship Configuration
const sponsoredProducts = [
  {
    id: 'notion',
    title: 'Notion - All-in-One Workspace',
    description: 'Perfect for organizing your ideas and projects',
    emoji: '📝',
    link: 'https://notion.so',
    tag: 'Productivity'
  },
  {
    id: 'figma',
    title: 'Figma - Design Tool',
    description: 'Turn your ideas into visual designs',
    emoji: '🎨',
    link: 'https://figma.com',
    tag: 'Design'
  },
  {
    id: 'obsidian',
    title: 'Obsidian - Knowledge Base',
    description: 'Build your second brain',
    emoji: '🧠',
    link: 'https://obsidian.md',
    tag: 'Knowledge'
  },
  {
    id: 'linear',
    title: 'Linear - Project Management',
    description: 'Track progress on your big ideas',
    emoji: '🚀',
    link: 'https://linear.app',
    tag: 'Project Mgmt'
  }
];

let currentAdIndex = 0;

function rotateAd() {
  currentAdIndex = (currentAdIndex + 1) % sponsoredProducts.length;
  renderSidebarWidget();
}

function renderSidebarWidget() {
  const widget = document.getElementById('widgetContent');
  if (!widget) return;
  
  const product = sponsoredProducts[currentAdIndex];
  
  widget.innerHTML = `
    <a href="${product.link}" target="_blank" class="widget-ad" data-ad-id="${product.id}">
      <div class="widget-emoji">${product.emoji}</div>
      <div class="widget-text">
        <div class="widget-tag">Sponsored · ${product.tag}</div>
        <div class="widget-title">${product.title}</div>
        <div class="widget-desc">${product.description}</div>
      </div>
    </a>
  `;
  
  // Track clicks
  widget.querySelector('.widget-ad').addEventListener('click', () => {
    console.log('📊 Ad clicked:', product.id);
    // You can send this to analytics
  });
}

// Rotate ad every 15 seconds
setInterval(rotateAd, 15000);

// Initial render
setTimeout(renderSidebarWidget, 500);
*/

/* ======================================== */

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
      termInput.value = '';
      outputSelect.value = '';
      cueSelect.value = '';
      goalSelect.value = '';
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
        termInput.value = '';
        outputSelect.value = '';
        row.classList.remove('saved');
      }, 500);
      
      console.log('✅ Quick saved to Parked Potential:', term);
    } catch (err) {
      row.classList.remove('saving');
      console.error('Quick save failed:', err);
      alert('Error saving: ' + err.message);
    }
  });
}

document.querySelectorAll('#input-body tr').forEach(row => {
  setupAutoSave(row);
});

viewsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  selectView(btn.dataset.view);
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

function openRowCountModal() {
  rowCountModal.classList.remove('hidden');
  rowCountInput.focus();
}

function closeRowCountModal() {
  rowCountModal.classList.add('hidden');
}

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
        <option value="✨ Relevant to Current Task">✨ Relevant to Current Task</option>
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
    </td>
  `;
  inputBodyEl.appendChild(newRow);
  setupAutoSave(newRow);
}

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
    /* ========================================
       INLINE AD CARDS (COMMENTED OUT)
       Uncomment when ready to use
       ======================================== */
    /*
    // Insert sponsored ad card every 5 items
    if (index > 0 && index % 5 === 0) {
      const adProduct = sponsoredProducts[Math.floor(Math.random() * sponsoredProducts.length)];
      const adCard = document.createElement('div');
      adCard.className = 'card ad-card';
      adCard.innerHTML = `
        <div class="meta">
          <div class="sponsored-label">Sponsored</div>
          <h3>${adProduct.emoji} ${adProduct.title}</h3>
          <p>${adProduct.description}</p>
          <p style="color:var(--accent);font-size:12px;margin-top:8px">
            ${adProduct.tag} · Click to learn more →
          </p>
        </div>
      `;
      adCard.style.cursor = 'pointer';
      adCard.onclick = () => {
        console.log('📊 Inline ad clicked:', adProduct.id);
        window.open(adProduct.link, '_blank');
      };
      listEl.appendChild(adCard);
    }
    */
    
    const card = document.createElement('div');
    card.className = 'card';
    
    const dateText = formatDate(it.dateAdded || it.createdAt);
    
    // Calculate progress percentage
    let completedStages = 0;
    const totalStages = 4; // prep, create, review, launch
    
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
        
        <!-- Progress Bar -->
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

    // Get Started button - Check if prep completed, show Resume or Get Started
    const getStartedBtn = card.querySelector('.get-started');
    
    if (it.prepCompleted) {
      getStartedBtn.textContent = 'Resume';
      getStartedBtn.style.background = 'rgba(34, 197, 94, 0.2)';
      getStartedBtn.style.color = '#22c55e';
      getStartedBtn.style.borderColor = 'rgba(34, 197, 94, 0.5)';
      
      // Determine where to resume based on completion status
      getStartedBtn.onclick = () => {
        if (it.createCompleted) {
          // If create is done, show options modal or go to review
          alert('Create stage complete! Ready for review and launch.');
        } else if (it.prepCompleted) {
          // Resume at create page
          window.location.href = `capture.html?id=${it.id}&title=${encodeURIComponent(it.term)}`;
        } else {
          // Resume at prep page
          window.location.href = `prep.html?id=${it.id}&title=${encodeURIComponent(it.term)}`;
        }
      };
    } else {
      getStartedBtn.onclick = () => {
        window.location.href = `prep.html?id=${it.id}&title=${encodeURIComponent(it.term)}`;
      };
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

console.log('✅ App initialized');
