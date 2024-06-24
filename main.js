document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const files = document.getElementById('fileInput').files;
    const formData = new FormData();
    for (const file of files) {
        formData.append('files', file);
    }

    fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData
    }).then(response => {
        if (response.ok) {
            response.json().then(() => {
                loadFiles(); // Reload the file list after uploading
            });
        }
    });
});

function groupFilesByExtension(files) {
    const groups = {};
    files.forEach(file => {
        const ext = file.folder; // Using the folder as the extension
        if (!groups[ext]) {
            groups[ext] = [];
        }
        groups[ext].push(file);
    });
    return groups;
}

function displayFileGroups(groups) {
    const container = document.getElementById('fileGroups');
    container.innerHTML = '';
    for (const ext in groups) {
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('mb-4');
        groupDiv.innerHTML = `<h2 class="text-xl font-bold mb-2">${ext.toUpperCase()} Files</h2>`;
        const list = document.createElement('ul');
        list.classList.add('list-disc', 'list-inside');
        groups[ext].forEach(file => {
            const listItem = document.createElement('li');
            listItem.classList.add('flex', 'justify-between', 'items-center');
            listItem.innerHTML = `
                <span>${file.file}</span>
                <i class="fas fa-trash-alt text-black cursor-pointer" onclick="deleteFile('${file.folder}', '${file.file}', this)"></i>
            `;
            list.appendChild(listItem);
        });
        groupDiv.appendChild(list);
        container.appendChild(groupDiv);
    }
}

function loadFiles() {
    fetch('http://localhost:3000/files').then(response => {
        return response.json();
    }).then(files => {
        const fileGroups = groupFilesByExtension(files);
        displayFileGroups(fileGroups);
    });
}

function deleteFile(folder, filename, iconElement) {
    fetch(`http://localhost:3000/delete/${folder}/${filename}`, {
        method: 'DELETE'
    }).then(response => {
        if (response.ok) {
            const listItem = iconElement.parentElement;
            const list = listItem.parentElement;
            list.removeChild(listItem);
            if (list.children.length === 0) {
                const groupDiv = list.parentElement;
                const container = groupDiv.parentElement;
                container.removeChild(groupDiv);
            }
        }
    });
}

loadFiles();
