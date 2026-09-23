const DEFAULT_PIN = "ALBASHAR123456789"; // নির্দিষ্ট পাসওয়ার্ড

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

// ১. পাসওয়ার্ড ভেরিফিকেশন
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

// ২. অ্যাপ পুনরায় লক করা
lockBtn.addEventListener('click', () => {
  appContainer.classList.add('hidden');
  lockScreen.classList.remove('hidden');
});

// ৩. ফাইল আপলোড লজিক
fileInput.addEventListener('change', (e) => {
  const selectedFiles = Array.from(e.target.files);
  
  selectedFiles.forEach(file => {
    const fileObj = {
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file)
    };
    filesVault.push(fileObj);
  });

  updateVaultUI();
  fileInput.value = '';
});

// ৪. ফাইল প্রদর্শন
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

    let iconClass = 'fa-file';
    if (file.type.startsWith('image/')) iconClass = 'fa-file-image';
    else if (file.type.startsWith('video/')) iconClass = 'fa-file-video';
    else if (file.type.startsWith('audio/')) iconClass = 'fa-file-audio';
    else if (file.type.includes('pdf')) iconClass = 'fa-file-pdf';

    card.innerHTML = `
      <i class="fa-solid ${iconClass} file-icon"></i>
      <div class="file-name" title="${file.name}">${file.name}</div>
      <div class="card-actions">
        <a href="${file.url}" download="${file.name}" class="btn-action" title="Download">
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

function deleteFile(id) {
  filesVault = filesVault.filter(file => file.id !== id);
  updateVaultUI();
}

updateVaultUI();