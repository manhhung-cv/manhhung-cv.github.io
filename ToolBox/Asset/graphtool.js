// Chạy toàn bộ mã sau khi cây DOM đã được tải hoàn toàn
document.addEventListener('DOMContentLoaded', function() {
    
    // Hàm này sử dụng Clipboard API hiện đại để sao chép văn bản.
    // Nó trả về một Promise, hữu ích cho việc xử lý thành công hoặc thất bại.
    function copyToClipboard(text) {
        if (!navigator.clipboard) {
            // Fallback cho các trình duyệt cũ hơn (ít phổ biến hơn)
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed'; // Ngăn cuộn trang khi focus
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error('Không thể sao chép văn bản: ', err);
            }
            document.body.removeChild(textArea);
            return;
        }
        navigator.clipboard.writeText(text).catch(err => {
            console.error('Không thể sao chép văn bản: ', err);
        });
    }

    function initOpenGraphGenerator() {
        const container = document.getElementById('open-graph-tool');
        if (!container) return;

        const elements = {
            inputs: {
                title: document.getElementById('og-title'),
                description: document.getElementById('og-description'),
                image: document.getElementById('og-image'),
                url: document.getElementById('og-url'),
                siteName: document.getElementById('og-site-name'),
                type: document.getElementById('og-type')
            },
            preview: {
                image: document.getElementById('preview-image'),
                url: document.getElementById('preview-url'),
                title: document.getElementById('preview-title'),
                description: document.getElementById('preview-description')
            },
            urlToCheckInput: document.getElementById('url-to-check'),
            checkUrlButton: document.getElementById('check-url-button'),
            statusMessage: document.getElementById('status-message'),
            generatedCodeEl: document.getElementById('generated-code'),
            copyButton: document.getElementById('og-copy-button')
        };

        function ensureProtocol(url) {
            const trimmedUrl = url.trim();
            if (!trimmedUrl) return '';
            if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) return trimmedUrl;
            if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('#') || trimmedUrl.startsWith('mailto:')) return trimmedUrl;
            if (trimmedUrl.includes('.') && !trimmedUrl.includes(' ')) return `https://` + trimmedUrl;
            return trimmedUrl;
        }

        function updateAll() {
            const values = {
                title: elements.inputs.title.value || 'Tiêu đề của bạn',
                description: elements.inputs.description.value || 'Mô tả của bạn sẽ ở đây.',
                image: elements.inputs.image.value,
                url: elements.inputs.url.value,
                siteName: elements.inputs.siteName.value,
                type: elements.inputs.type.value
            };
            const baseUrl = ensureProtocol(values.url);
            elements.preview.title.textContent = values.title;
            elements.preview.description.textContent = values.description;
            let absoluteImageUrl = values.image;
            if (values.image && baseUrl && !values.image.startsWith('http')) {
                try { absoluteImageUrl = new URL(values.image, baseUrl).href; } catch (e) { absoluteImageUrl = values.image; }
            }
            elements.preview.image.src = absoluteImageUrl || 'https://placehold.co/500x261/E5E7EB/B0B0B0?text=Hình+ảnh+của+bạn';
            elements.preview.image.onerror = () => { elements.preview.image.src = 'https://placehold.co/500x261/f03a3a/ffffff?text=Lỗi+tải+ảnh'; };
            if (baseUrl) {
                try { elements.preview.url.textContent = new URL(baseUrl).hostname; } catch (e) { elements.preview.url.textContent = 'URL không hợp lệ'; }
            } else {
                elements.preview.url.textContent = 'example.com';
            }
            let htmlCode = '';
            const escapeHtml = (unsafe) => unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
            if (values.title) htmlCode += `&lt;meta property="og:title" content="${escapeHtml(values.title)}"&gt;\n`;
            if (values.description) htmlCode += `&lt;meta property="og:description" content="${escapeHtml(values.description)}"&gt;\n`;
            if (absoluteImageUrl) htmlCode += `&lt;meta property="og:image" content="${escapeHtml(absoluteImageUrl)}"&gt;\n`;
            if (baseUrl) htmlCode += `&lt;meta property="og:url" content="${escapeHtml(baseUrl)}"&gt;\n`;
            if (values.siteName) htmlCode += `&lt;meta property="og:site_name" content="${escapeHtml(values.siteName)}"&gt;\n`;
            if (values.type) htmlCode += `&lt;meta property="og:type" content="${escapeHtml(values.type)}"&gt;\n`;
            if (htmlCode) {
                htmlCode += `\n&lt;!-- Twitter Card Meta Tags --&gt;\n`;
                htmlCode += `&lt;meta name="twitter:card" content="summary_large_image"&gt;\n`;
                if (baseUrl) {
                    try {
                        const urlObject = new URL(baseUrl);
                        htmlCode += `&lt;meta property="twitter:domain" content="${escapeHtml(urlObject.hostname)}"&gt;\n`;
                        htmlCode += `&lt;meta property="twitter:url" content="${escapeHtml(baseUrl)}"&gt;\n`;
                    } catch (e) { }
                }
                if (values.title) htmlCode += `&lt;meta name="twitter:title" content="${escapeHtml(values.title)}"&gt;\n`;
                if (values.description) htmlCode += `&lt;meta name="twitter:description" content="${escapeHtml(values.description)}"&gt;\n`;
                if (absoluteImageUrl) htmlCode += `&lt;meta name="twitter:image" content="${escapeHtml(absoluteImageUrl)}"&gt;\n`;
            }
            elements.generatedCodeEl.innerHTML = htmlCode || '';
        }

        Object.values(elements.inputs).forEach(input => {
            if (input) input.addEventListener('input', updateAll);
        });

        function autoCorrectUrl(event) {
            const inputElement = event.target;
            const correctedUrl = ensureProtocol(inputElement.value);
            if (inputElement.value !== correctedUrl) {
                inputElement.value = correctedUrl;
                inputElement.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
        elements.urlToCheckInput.addEventListener('blur', autoCorrectUrl);
        elements.inputs.url.addEventListener('blur', autoCorrectUrl);

        elements.copyButton.addEventListener('click', () => {
            const codeToCopy = elements.generatedCodeEl.textContent.trim();

            if (!codeToCopy) {
                // Đã xóa showToast() vì nó không được định nghĩa.
                // Bạn có thể thêm một thư viện thông báo toast và gọi nó ở đây nếu muốn.
                console.log('Không có mã để sao chép!');
                return;
            };

            const button = elements.copyButton;
            const originalText = button.innerHTML;

            copyToClipboard(codeToCopy); // Gọi hàm đã định nghĩa ở trên

            button.innerHTML = '<i class="fas fa-check mr-1"></i> Đã chép!';
            button.disabled = true;
            setTimeout(() => { 
                button.innerHTML = originalText; 
                button.disabled = false;
            }, 2000);
        });

        elements.checkUrlButton.addEventListener('click', async () => {
            const url = ensureProtocol(elements.urlToCheckInput.value);
            elements.urlToCheckInput.value = url;
            if (!url) {
                elements.statusMessage.textContent = 'Vui lòng nhập một URL.';
                elements.statusMessage.style.color = '#dc2626'; // text-red-600
                return;
            }
            elements.checkUrlButton.disabled = true;
            elements.checkUrlButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang kiểm tra...';
            elements.statusMessage.textContent = 'Đang tìm nạp và phân tích cú pháp URL...';
            elements.statusMessage.style.color = '#2563eb'; // text-blue-600
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            try {
                const response = await fetch(proxyUrl);
                if (!response.ok) throw new Error(`Lỗi mạng: ${response.statusText}`);
                const data = await response.json();
                if (!data.contents) throw new Error('Không thể lấy nội dung HTML từ URL.');
                const parser = new DOMParser();
                const doc = parser.parseFromString(data.contents, 'text/html');
                const getMetaContent = (prop) => {
                    const el = doc.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`);
                    return el ? el.getAttribute('content') : '';
                };
                let imageUrl = getMetaContent('og:image');
                if (imageUrl && !imageUrl.startsWith('http')) {
                    try { imageUrl = new URL(imageUrl, url).href; } catch (e) { }
                }
                const ogData = {
                    title: getMetaContent('og:title') || doc.querySelector('title')?.textContent || '',
                    description: getMetaContent('og:description') || getMetaContent('description'),
                    image: imageUrl,
                    url: getMetaContent('og:url') || url,
                    siteName: getMetaContent('og:site_name'),
                    type: getMetaContent('og:type') || 'website'
                };
                let foundTags = false;
                Object.keys(ogData).forEach(key => {
                    const inputElement = elements.inputs[key];
                    if (inputElement && ogData[key]) {
                        // Cập nhật giá trị cho cả input và select
                        if (inputElement.tagName.toLowerCase() === 'select') {
                            // Đối với thẻ select, tìm option có giá trị trùng khớp
                            let optionExists = Array.from(inputElement.options).some(opt => opt.value === ogData[key]);
                            if (optionExists) {
                                inputElement.value = ogData[key];
                            } else {
                                // Nếu không có, tạo và thêm một option mới
                                const newOption = new Option(ogData[key], ogData[key], true, true);
                                inputElement.add(newOption);
                            }
                        } else {
                            inputElement.value = ogData[key];
                        }
                        foundTags = true;
                    }
                });
                if (foundTags) {
                    elements.statusMessage.textContent = 'Đã tìm thấy và điền các thẻ meta!';
                    elements.statusMessage.style.color = '#16a34a'; // text-green-600
                } else {
                    elements.statusMessage.textContent = 'Không tìm thấy thẻ Open Graph nào.';
                    elements.statusMessage.style.color = '#ca8a04'; // text-yellow-600
                }
                updateAll();
            } catch (error) {
                elements.statusMessage.textContent = `Lỗi: ${error.message}.`;
                elements.statusMessage.style.color = '#dc2626'; // text-red-600
            } finally {
                elements.checkUrlButton.disabled = false;
                elements.checkUrlButton.innerHTML = '<i class="fas fa-search"></i> Kiểm tra';
            }
        });

        updateAll();
    }
    
    // Gọi hàm khởi tạo chính để bắt đầu chạy công cụ
    initOpenGraphGenerator();
});