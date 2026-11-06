// Элементы DOM
const messageBox = document.getElementById('message');
const outputArea = document.getElementById('outputArea');
// локальный URL для тестирования из-под jsonserver
//const API_URL ='http://localhost:3000/posts'
const API_URL = 'https://jsonplaceholder.typicode.com/posts';


// --- Вспомогательные функции ---
function showMessage(text, type = 'loading') {
    messageBox.textContent = text;
    messageBox.className = `message ${type}`;
}

function hideMessage() {
    messageBox.className = 'message hidden';
}

function setLoading(isLoading, button) {
    button.disabled = isLoading;
    if (isLoading) {
        button.dataset.originalText = button.textContent;
        button.textContent = 'Загрузка...';
    } else {
        button.textContent = button.dataset.originalText;
    }
}

function clearOutput() {
    outputArea.innerHTML = '';
}

function renderPost(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    
    const title = document.createElement('h3');
    title.textContent = `ID: ${post.id} | ${post.title}`;
    
    const body = document.createElement('p');
    body.textContent = post.body;
    
    card.appendChild(title);
    card.appendChild(body);
    outputArea.appendChild(card);
}

// --- 1. GET: Загрузить 5 публикаций (Требование лабы, при тестировнаии с jsonserver убран лимит из-за того, что выводит пустой массив) ---
async function loadPosts(event) {
    const btn = event.currentTarget;
    setLoading(true, btn);
    showMessage('Загрузка 5 публикаций...', 'loading');
    clearOutput();

    try {
        const response = await fetch(`${API_URL}?_limit=5`); // лимит не работает с jsonserver
        //const response = await fetch(`${API_URL}`); // без лимита (тестирование на jsonserver)
        if (!response.ok) throw new Error(`HTTP ошибка: ${response.status}`);
        
        const posts = await response.json();
        console.log('Полученные данные:', posts); // тестовый вывод в консоль
        
        posts.forEach(renderPost);
        showMessage(`Успешно загружено ${posts.length} публикаций (HTTP ${response.status}).`, 'success');
    } catch (error) {
        showMessage(`Ошибка GET: ${error.message}`, 'error');
    } finally {
        setLoading(false, btn);
    }
}

// --- 2. GET: Загрузить по ID ---
async function loadPostById(event) {
    const btn = event.currentTarget;
    const id = document.getElementById('getByIdInput').value.trim();
    
    if (!id) {
        showMessage('Введите ID для поиска!', 'error');
        return;
    }

    setLoading(true, btn);
    showMessage(`Поиск публикации ID: ${id}...`, 'loading');
    clearOutput();

    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error(`Публикация с ID ${id} не найдена (HTTP ${response.status})`);
        
        const post = await response.json();
        renderPost(post);
        showMessage(`Публикация ID ${id} найдена.`, 'success');
    } catch (error) {
        showMessage(`Ошибка GET by ID: ${error.message}`, 'error');
    } finally {
        setLoading(false, btn);
    }
}

// --- 3. POST: Создать публикацию (Требование лабы) ---
async function createPost(event) {
    event.preventDefault();
    
    // Находим кнопку через форму, чтобы она точно заблокировалась
    const form = document.getElementById('postForm');
    const btn = form.querySelector('button');
    
    const title = document.getElementById('postTitle').value.trim();
    const body = document.getElementById('postBody').value.trim();

    // Строгая валидация по требованию лабы
    if (!title || !body) {
        showMessage('Ошибка: Заголовок и текст не могут быть пустыми!', 'error');
        return;
    }

    setLoading(true, btn);
    showMessage('Отправка POST запроса...', 'loading');
    clearOutput();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, body, userId: 1 })
        });
        
        if (!response.ok) throw new Error(`HTTP ошибка: ${response.status}`);
        
        const newPost = await response.json();
        renderPost(newPost);
        showMessage(`Успех! Создана публикация. ID: ${newPost.id} (HTTP ${response.status})`, 'success');
        
        form.reset(); 
        
    } catch (error) {
        showMessage(`Ошибка POST: ${error.message}`, 'error');
    } finally {
        setLoading(false, btn);
    }
}

// --- 4. PUT: Полное обновление ---
async function updatePost(event) {
    event.preventDefault();
    const btn = event.currentTarget.querySelector('button');
    
    const id = document.getElementById('putId').value.trim();
    const title = document.getElementById('putTitle').value.trim();
    const body = document.getElementById('putBody').value.trim();

    if (!id || !title || !body) {
        showMessage('Для PUT нужны ID, Заголовок и Текст!', 'error');
        return;
    }

    setLoading(true, btn);
    showMessage(`Полное обновление ID: ${id}...`, 'loading');
    clearOutput();

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, title, body, userId: 1 })
        });
        if (!response.ok) throw new Error(`HTTP ошибка: ${response.status}`);
        
        const updatedPost = await response.json();
        renderPost(updatedPost);
        showMessage(`Публикация ID ${id} полностью обновлена (HTTP ${response.status}).`, 'success');
    } catch (error) {
        showMessage(`Ошибка PUT: ${error.message}`, 'error');
    } finally {
        setLoading(false, btn);
    }
}

// --- 5. PATCH: Частичное обновление ---
async function patchPost(event) {
    event.preventDefault();
    const btn = event.currentTarget.querySelector('button');
    
    const id = document.getElementById('patchId').value.trim();
    const title = document.getElementById('patchTitle').value.trim();

    if (!id) {
        showMessage('Введите ID для PATCH!', 'error');
        return;
    }

    const patchData = {};
    if (title) patchData.title = title;
    
    if (Object.keys(patchData).length === 0) {
        showMessage('Введите хотя бы одно поле для обновления!', 'error');
        return;
    }

    setLoading(true, btn);
    showMessage(`Частичное обновление ID: ${id}...`, 'loading');
    clearOutput();

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patchData)
        });
        if (!response.ok) throw new Error(`HTTP ошибка: ${response.status}`);
        
        const patchedPost = await response.json();
        renderPost(patchedPost);
        showMessage(`Публикация ID ${id} частично обновлена (HTTP ${response.status}).`, 'success');
    } catch (error) {
        showMessage(`Ошибка PATCH: ${error.message}`, 'error');
    } finally {
        setLoading(false, btn);
    }
}

// --- 6. DELETE: Удаление ---
async function deletePost(event) {
    const btn = event.currentTarget;
    const id = document.getElementById('deleteIdInput').value.trim();

    if (!id) {
        showMessage('Введите ID для удаления!', 'error');
        return;
    }

    setLoading(true, btn);
    showMessage(`Удаление ID: ${id}...`, 'loading');
    clearOutput();

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error(`HTTP ошибка: ${response.status}`);
        
        showMessage(`Публикация ID ${id} успешно удалена (эмуляция) (HTTP ${response.status}).`, 'success');
    } catch (error) {
        showMessage(`Ошибка DELETE: ${error.message}`, 'error');
    } finally {
        setLoading(false, btn);
    }
}

// --- Назначение обработчиков событий ---
document.getElementById('loadBtn').addEventListener('click', loadPosts);
document.getElementById('getByIdBtn').addEventListener('click', loadPostById);
document.getElementById('postForm').addEventListener('submit', createPost);
document.getElementById('putForm').addEventListener('submit', updatePost);
document.getElementById('patchForm').addEventListener('submit', patchPost);
document.getElementById('deleteBtn').addEventListener('click', deletePost);