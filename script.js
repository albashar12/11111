const DEFAULT_PIN = "ALBASHAR123456789"; 

const lockScreen = document.getElementById('lockScreen');
const appContainer = document.getElementById('appContainer');
const pinInput = document.getElementById('pinInput');
const unlockBtn = document.getElementById('unlockBtn');
const lockBtn = document.getElementById('lockBtn');
const errorMsg = document.getElementById('errorMsg');

const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const fileCount = document.getElementById('fileCount');

let filesVault = [];
let db;

// ১. IndexedDB ডাটাবেস ওপেন করা (ডাটা স্থায়ীভাবে সেভ রাখার জন্য)
const dbRequest = indexedDB.open("FileVaultDB", 1);

dbRequest.onupgradeneeded = (e) => {
  db = e.target.result;
  if (!db.objectStoreNames.contains("files")) {
    db.createObjectStore("files", { keyPath: "id" });
  }
};

dbRequest.onsuccess = (e) => {
  db = e.target.result;
  loadFilesFromDB(); // আগের সেভ হওয়া ফাইল লোড করবে
};

dbRequest.onerror = () => {
  console.error("Database error!");
};

// ২. পাসওয়ার্ড ভেরিফিকেশন
unlockBtn.addEventListener('click', checkPIN);
pinInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') checkPIN();
});

function checkPIN() {
  if (pinInput.value === DEFAULT_PIN) {
    lockScreen.classList.add('hidden');
    appContainer.classList.remove('hidden');
    errorMsg.innerText = '';
    pinInput.value = '';
  } else {
    errorMsg.innerText = 'ভুল পাসওয়ার্ড! সঠিক Password দিন।';
    pinInput.value = '';
  }
}

// ৩. অ্যাপ পুনরায় লক করা
lockBtn.addEventListener('click', () => {
  appContainer.classList.add('hidden');
  lockScreen.classList.remove('hidden');
});

// ৪. ফাইল আপলোড ও ডাটাবেসে সেভ করা
fileInput.addEventListener('change', (e) => {
  const selectedFiles = Array.from(e.target.files);

  selectedFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const fileObj = {
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type,
        data: event.target.result // ফাইল ডাটা ArrayBuffer হিসেবে সেভ হবে
      };

      // IndexedDB-তে সেভ
      const tx = db.transaction("files", "readwrite");
      const store = tx.objectStore("files");
      store.add(fileObj);

      tx.oncomplete = () => {
        loadFilesFromDB(); // আপডেটেড লিস্ট দেখাবে
      };
    };
    reader.readAsArrayBuffer(file);
  });

  fileInput.value = '';
});

// ৫. ডাটাবেস থেকে ফাইল লোড করা
function loadFilesFromDB() {
  if (!db) return;
  const tx = db.transaction("files", "readonly");
  const store = tx.objectStore("files");
  const request = store.getAll();

  request.onsuccess = () => {
    filesVault = request.result;
    updateVaultUI();
  };
}

// ৬. ফাইল স্ক্রিনে প্রদর্শন করা
function updateVaultUI() {
  fileList.innerHTML = '';
  fileCount.innerText = filesVault.length;

  if (filesVault.length === 0) {
    fileList.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b; font-size: 0.85rem;">ভল্ট খালি রয়েছে!</p>`;
    return;
  }

  filesVault.forEach(file => {
    const card = document.createElement('div');
    card.className = 'file-card';

    // অডিও/ভিডিও/ছবির ফাইল লিংক তৈরি
    const blob = new Blob([file.data], { type: file.type });
    const fileUrl = URL.createObjectURL(blob);

    let iconClass = 'fa-file';
    if (file.type.startsWith('image/')) iconClass = 'fa-file-image';
    else if (file.type.startsWith('video/')) iconClass = 'fa-file-video';
    else if (file.type.startsWith('audio/')) iconClass = 'fa-file-audio';
    else if (file.type.includes('pdf')) iconClass = 'fa-file-pdf';

    card.innerHTML = `
      <i class="fa-solid ${iconClass} file-icon"></i>
      <div class="file-name" title="${file.name}">${file.name}</div>
      <div class="card-actions">
        <a href="${fileUrl}" download="${file.name}" class="btn-action" title="Download">
          <i class="fa-solid fa-download"></i>
        </a>
        <button onclick="deleteFile(${file.id})" class="btn-action" title="Delete">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;

    fileList.appendChild(card);
  });
}

// ৭. ফাইল ডাটাবেস থেকে ডিলিট করা
function deleteFile(id) {
  const tx = db.transaction("files", "readwrite");
  const store = tx.objectStore("files");
  store.delete(id);

  tx.oncomplete = () => {
    loadFilesFromDB();
  };
}
