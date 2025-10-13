// asset/notes.js
document.addEventListener('DOMContentLoaded', () => {
    const notesTool = document.getElementById('notes-tool');
    if (!notesTool) return;

    // --- DOM Elements ---
    const notesListEl = document.getElementById('notes-list');
    const newNoteBtn = document.getElementById('new-note-btn');
    const deleteNoteBtn = document.getElementById('delete-note-btn');
    const copyNoteBtn = document.getElementById('copy-note-btn');
    const noteTitleInput = document.getElementById('note-title-input');
    const noteContentTextarea = document.getElementById('note-content-textarea');
    const saveStatus = document.getElementById('save-status');
    const editorContent = document.getElementById('note-editor-content');
    const editorPlaceholder = document.getElementById('note-editor-placeholder');
    const notesGridContainer = notesTool.querySelector('.notes-grid-container');

    // --- State ---
    let notes = [];
    let activeNoteId = null;
    let saveTimeout;

    // --- Functions ---

    // Tải ghi chú từ Local Storage
    function loadNotes() {
        const notesJSON = localStorage.getItem('multiNotes');
        notes = notesJSON ? JSON.parse(notesJSON) : [];
        notes.sort((a, b) => b.lastModified - a.lastModified);
    }

    // Lưu ghi chú vào Local Storage
    function saveNotes() {
        localStorage.setItem('multiNotes', JSON.stringify(notes));
    }

    // Hiển thị danh sách ghi chú
    function renderNoteList() {
        notesListEl.innerHTML = '';
        if (notes.length === 0) {
            notesListEl.innerHTML = '<li style="padding: 16px; text-align: center; color: var(--text-secondary);">Chưa có ghi chú</li>';
            return;
        }

        notes.forEach(note => {
            const li = document.createElement('li');
            li.className = 'note-item';
            li.dataset.noteId = note.id;
            if (note.id === activeNoteId) {
                li.classList.add('active');
            }
            const snippet = note.content.substring(0, 100) || 'Không có nội dung';
            li.innerHTML = `
                <div class="note-title">${note.title || 'Ghi chú không tiêu đề'}</div>
                <div class="note-snippet">${snippet}</div>
            `;
            notesListEl.appendChild(li);
        });
    }

    // Mở một ghi chú để xem và sửa
    function openNote(noteId) {
        const note = notes.find(n => n.id === noteId);
        if (!note) return;

        activeNoteId = note.id;
        noteTitleInput.value = note.title;
        noteContentTextarea.value = note.content;

        editorPlaceholder.style.display = 'none';
        editorContent.classList.remove('hidden');

        if (window.innerWidth <= 768) {
            notesGridContainer.classList.add('editing');
        }

        renderNoteList();
        noteTitleInput.focus();
    }

    // --- Event Listeners ---
    newNoteBtn.addEventListener('click', () => {
        const newNote = {
            id: Date.now(),
            title: '',
            content: '',
            lastModified: Date.now()
        };
        notes.unshift(newNote);
        saveNotes();
        openNote(newNote.id);
    });

    deleteNoteBtn.addEventListener('click', () => {
        if (!activeNoteId) return;

        // Sử dụng modal xác nhận mới
        showConfirmationModal(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa ghi chú này không? Hành động này không thể hoàn tác.',
            () => {
                // Hành động sẽ được thực thi khi người dùng nhấn "Xác nhận"
                notes = notes.filter(n => n.id !== activeNoteId);
                saveNotes();
                activeNoteId = null;
                editorContent.classList.add('hidden');
                editorPlaceholder.style.display = 'flex';
                if (window.innerWidth <= 768) {
                    notesGridContainer.classList.remove('editing');
                }
                renderNoteList();
                if (typeof showToast === 'function') {
                    showToast('success', 'Đã xóa', 'Ghi chú đã được xóa thành công.');
                }
            }
        );
    });

    copyNoteBtn.addEventListener('click', () => {
        if (!activeNoteId) return;
        const note = notes.find(n => n.id === activeNoteId);
        const textToCopy = `Tiêu đề: ${note.title}\n\nNội dung:\n${note.content}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            if (typeof showToast === 'function') {
                showToast('success', 'Đã sao chép!', 'Nội dung ghi chú đã được chép.');
            }
        });
    });

    notesListEl.addEventListener('click', (e) => {
        const targetItem = e.target.closest('.note-item');
        if (targetItem) {
            const noteId = parseInt(targetItem.dataset.noteId);
            openNote(noteId);
        }
    });

    // Hàm xử lý tự động lưu
    const handleInput = () => {
        if (!activeNoteId) return;
        clearTimeout(saveTimeout);
        saveStatus.textContent = 'Đang nhập...';

        saveTimeout = setTimeout(() => {
            const note = notes.find(n => n.id === activeNoteId);
            if (note) {
                note.title = noteTitleInput.value;
                note.content = noteContentTextarea.value;
                note.lastModified = Date.now();
                notes.sort((a, b) => b.lastModified - a.lastModified);
                saveNotes();
                renderNoteList();
                saveStatus.textContent = '✓ Đã lưu';
            }
        }, 500);
    };

    noteTitleInput.addEventListener('input', handleInput);
    noteContentTextarea.addEventListener('input', handleInput);

    // Xử lý nút quay lại trên mobile
    editorContent.querySelector('.note-editor-header').addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && e.target.matches('.note-editor-header::before')) {
            notesGridContainer.classList.remove('editing');
            activeNoteId = null;
            renderNoteList();
        }
    });

    // Khởi tạo
    loadNotes();
    renderNoteList();
});