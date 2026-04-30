// Photo storage array
let uploadedPhotos = [];

// DOM Elements
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const photosGrid = document.getElementById('photosGrid');
const photoCount = document.getElementById('photoCount');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');

// Upload Box Click Handler
uploadBox.addEventListener('click', () => {
    fileInput.click();
});

// File Input Change Handler
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Drag and Drop Handlers
uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('dragover');
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('dragover');
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

// Handle File Upload
function handleFiles(files) {
    for (let file of files) {
        // Validate file is an image
        if (!file.type.startsWith('image/')) {
            alert(`${file.name} is not an image file`);
            continue;
        }

        // Read file as data URL
        const reader = new FileReader();
        reader.onload = (e) => {
            const photoData = {
                id: Date.now() + Math.random(), // Unique ID
                src: e.target.result,
                name: file.name
            };
            uploadedPhotos.push(photoData);
            renderPhotos();
        };
        reader.readAsDataURL(file);
    }
}

// Render Photos Grid
function renderPhotos() {
    if (uploadedPhotos.length === 0) {
        photosGrid.innerHTML = '<p class="empty-message">No photos uploaded yet</p>';
        photoCount.textContent = '0';
        generateBtn.disabled = true;
        clearBtn.disabled = true;
        return;
    }

    photosGrid.innerHTML = uploadedPhotos.map(photo => `
        <div class="photo-item">
            <img src="${photo.src}" alt="Uploaded photo">
            <button class="delete-btn" onclick="deletePhoto(${photo.id})" title="Delete photo">×</button>
        </div>
    `).join('');

    photoCount.textContent = uploadedPhotos.length;
    generateBtn.disabled = false;
    clearBtn.disabled = false;
}

// Delete Single Photo
function deletePhoto(id) {
    uploadedPhotos = uploadedPhotos.filter(photo => photo.id !== id);
    renderPhotos();
}

// Clear All Photos
clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to remove all photos?')) {
        uploadedPhotos = [];
        renderPhotos();
        fileInput.value = ''; // Reset file input
    }
});

// Generate PDF
generateBtn.addEventListener('click', generatePDF);

function generatePDF() {
    if (uploadedPhotos.length === 0) {
        alert('Please upload at least one photo');
        return;
    }

    // Show loading state
    generateBtn.classList.add('loading');
    generateBtn.disabled = true;

    // Create a container for all images
    const container = document.createElement('div');
    container.style.display = 'none';

    // Add each photo to the container
    uploadedPhotos.forEach((photo, index) => {
        const img = document.createElement('img');
        img.src = photo.src;
        img.style.width = '100%';
        img.style.marginBottom = index < uploadedPhotos.length - 1 ? '10px' : '0';
        img.style.pageBreakAfter = 'avoid';
        container.appendChild(img);
    });

    document.body.appendChild(container);

    // Generate PDF
    const opt = {
        margin: 10,
        filename: 'photos.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    html2pdf().set(opt).from(container).save().then(() => {
        // Remove container
        document.body.removeChild(container);

        // Remove loading state
        generateBtn.classList.remove('loading');
        generateBtn.disabled = false;

        // Success message
        alert('PDF generated successfully!');
    }).catch(err => {
        console.error('Error generating PDF:', err);
        document.body.removeChild(container);
        generateBtn.classList.remove('loading');
        generateBtn.disabled = false;
        alert('Error generating PDF. Please try again.');
    });
}

// Initialize
renderPhotos();