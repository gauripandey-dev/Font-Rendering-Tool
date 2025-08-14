// Advanced Font Rendering Engine - Enhanced JavaScript Implementation
// Fully responsive with mobile optimizations and accessibility features

class FontRenderingEngine {
    constructor() {
        this.renderedText = document.getElementById('renderedText');
        this.textInput = document.getElementById('textInput');
        this.currentAlignment = 'left';
        this.activeFeatures = new Set(['kerning']);
        this.layoutOptimization = false;
        this.hyphenation = false;
        this.isFullscreen = false;
        this.isMobileControlsOpen = false;
        
        // Performance tracking
        this.renderStartTime = 0;
        this.layoutScore = 100;
        
        // Responsive breakpoints
        this.breakpoints = {
            mobile: 480,
            tablet: 768,
            desktop: 1024
        };
        
        // Sample texts for testing
        this.sampleTexts = {
            pangram: "The quick brown fox jumps over the lazy dog. PACK MY BOX WITH FIVE DOZEN LIQUOR JUGS!",
            lorem: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            typography: "Typography is the art and technique of arranging type to make written language legible, readable, and appealing. Ligatures: fi fl ffi ffl ft. Kerning pairs: AV Ta We Yo. Numbers: 1234567890 ½ ¾ ¼ ⅛. Small caps: LOREM IPSUM dolor sit amet, CONSECTETUR adipiscing elit.",
            numbers: "Regular numbers: 1234567890. Oldstyle figures: 1234567890. Tabular numbers: 1234567890. Fractions: 1/2 3/4 5/8 7/16 13/32. Superscript: E=mc² H₂O CO₂. Mathematical symbols: ∑∆π∞±≠≤≥∫√∂",
            ligatures: "The office traffic was awful during the staff meeting. We flew to fifty different places for the conference. The waffle was very effective for breakfast, and the coffee was perfectly sufficient."
        };
        
        // Initialize the application
        this.initializeEventListeners();
        this.initializeResponsiveFeatures();
        this.updateRendering();
        this.setupKeyboardNavigation();
    }
    
    initializeEventListeners() {
        // Mobile navigation toggle
        const toggleBtn = document.getElementById('toggleControls');
        const controlsWrapper = document.getElementById('controlsWrapper');
        
        if (toggleBtn && controlsWrapper) {
            toggleBtn.addEventListener('click', () => {
                this.toggleMobileControls();
            });
        }
        
        // Font controls with debouncing for better performance
        this.addEventListenerWithDebounce('fontSelect', 'change', () => this.updateRendering());
        this.addRangeListener('fontSize', 'fontSizeValue', 'px');
        this.addEventListenerWithDebounce('fontWeight', 'change', () => this.updateRendering());
        this.addRangeListener('letterSpacing', 'letterSpacingValue', 'px');
        this.addRangeListener('lineHeight', 'lineHeightValue', '');
        this.addRangeListener('wordSpacing', 'wordSpacingValue', 'px');
        
        // OpenType feature checkboxes
        const featureCheckboxes = [
            'kerning', 'ligatures', 'smallCaps', 'oldstyleNums', 
            'tabularNums', 'fractions'
        ];
        
        featureCheckboxes.forEach(feature => {
            const checkbox = document.getElementById(feature);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        this.activeFeatures.add(feature);
                    } else {
                        this.activeFeatures.delete(feature);
                    }
                    this.updateRendering();
                });
            }
        });
        
        // Text alignment buttons
        document.querySelectorAll('.align-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveAlignment(e.target, e.target.dataset.align);
            });
        });
        
        // Advanced layout options
        this.addEventListenerWithDebounce('hyphenation', 'change', (e) => {
            this.hyphenation = e.target.checked;
            this.updateRendering();
        });
        
        this.addEventListenerWithDebounce('optimizeLayout', 'change', (e) => {
            this.layoutOptimization = e.target.checked;
            this.updateRendering();
        });
        
        // Sample text buttons
        document.querySelectorAll('.sample-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sampleType = e.target.dataset.sample;
                this.loadSampleText(sampleType);
            });
        });
        
        // Text input with debouncing for better performance
        let inputTimeout;
        this.textInput.addEventListener('input', () => {
            clearTimeout(inputTimeout);
            inputTimeout = setTimeout(() => this.updateRendering(), 150);
        });
        
        // Fullscreen toggle
        const fullscreenBtn = document.getElementById('fullscreenToggle');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }
        
        // Export buttons
        document.getElementById('exportCSS')?.addEventListener('click', () => this.exportCSS());
        document.getElementById('exportImage')?.addEventListener('click', () => this.exportAsImage());
        document.getElementById('copyText')?.addEventListener('click', () => this.copyFormattedText());
        
        // Window resize handler
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
        
        // Escape key to exit fullscreen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isFullscreen) {
                this.toggleFullscreen();
            }
        });
    }
    
    initializeResponsiveFeatures() {
        // Set initial mobile controls state
        this.updateMobileControlsState();
        
        // Initialize intersection observer for performance
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        }
        
        // Initialize touch event handlers for mobile
        this.setupTouchHandlers();
    }
    
    setupKeyboardNavigation() {
        // Add keyboard navigation for accessibility
        document.addEventListener('keydown', (e) => {
            if (e.target.matches('input[type="range"]')) {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    // Debounce range input updates
                    setTimeout(() => this.updateRendering(), 50);
                }
            }
        });
    }
    
    setupTouchHandlers() {
        // Improve touch interactions on mobile devices
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        // Prevent pull-to-refresh on the rendering canvas
        this.renderedText.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                e.preventDefault();
            }
        });
    }
    
    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, options);
        
        // Observe all major sections
        document.querySelectorAll('.controls-panel, .opentype-features, .text-alignment, .sample-texts, .rendering-area, .metrics-panel, .export-panel').forEach(el => {
            observer.observe(el);
        });
    }
    
    toggleMobileControls() {
        const controlsWrapper = document.getElementById('controlsWrapper');
        const toggleBtn = document.getElementById('toggleControls');
        
        this.isMobileControlsOpen = !this.isMobileControlsOpen;
        
        if (this.isMobileControlsOpen) {
            controlsWrapper.classList.add('show');
            toggleBtn.classList.add('active');
        } else {
            controlsWrapper.classList.remove('show');
            toggleBtn.classList.remove('active');
        }
        
        // Update aria attributes for accessibility
        controlsWrapper.setAttribute('aria-hidden', !this.isMobileControlsOpen);
        toggleBtn.setAttribute('aria-expanded', this.isMobileControlsOpen);
    }
    
    updateMobileControlsState() {
        const isMobile = window.innerWidth <= this.breakpoints.tablet;
        const controlsWrapper = document.getElementById('controlsWrapper');
        
        if (!isMobile && controlsWrapper) {
            controlsWrapper.classList.add('show');
            controlsWrapper.setAttribute('aria-hidden', 'false');
        }
    }
    
    handleResize() {
        this.updateMobileControlsState();
        this.updateRendering(); // Re-calculate metrics after resize
    }
    
    addEventListenerWithDebounce(id, event, callback, delay = 100) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, this.debounce(callback, delay));
        }
    }
    
    addRangeListener(inputId, displayId, unit) {
        const input = document.getElementById(inputId);
        const display = document.getElementById(displayId);
        
        if (input && display) {
            const updateValue = () => {
                display.textContent = input.value + unit;
                this.updateRendering();
            };
            
            input.addEventListener('input', this.debounce(updateValue, 50));
        }
    }
    
    setActiveAlignment(button, alignment) {
        document.querySelectorAll('.align-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        this.currentAlignment = alignment;
        this.updateRendering();
    }
    
    loadSampleText(sampleType) {
        if (this.sampleTexts[sampleType]) {
            this.textInput.value = this.sampleTexts[sampleType];
            this.updateRendering();
            
            // Scroll to rendering area on mobile
            if (window.innerWidth <= this.breakpoints.tablet) {
                document.querySelector('.rendering-area').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    }
    
    updateRendering() {
        this.renderStartTime = performance.now();
        
        const text = this.textInput.value || "Type your text here to see advanced font rendering...";
        
        // Get all control values
        const controls = this.getControlValues();
        
        // Apply basic styling with CSS custom properties for better performance
        this.applyBasicStyling(controls);
        
        // Apply OpenType features
        this.applyOpenTypeFeatures();
        
        // Apply advanced layout optimizations
        this.applyLayoutOptimizations(text);
        
        // Update text content
        this.renderedText.textContent = text;
        
        // Update metrics
        this.updateMetrics(text);
        
        // Calculate and display performance
        this.updatePerformanceMetrics();
    }
    
    getControlValues() {
        return {
            fontFamily: document.getElementById('fontSelect')?.value || 'serif',
            fontSize: document.getElementById('fontSize')?.value || '18',
            fontWeight: document.getElementById('fontWeight')?.value || '400',
            letterSpacing: document.getElementById('letterSpacing')?.value || '0',
            lineHeight: document.getElementById('lineHeight')?.value || '1.4',
            wordSpacing: document.getElementById('wordSpacing')?.value || '0'
        };
    }
    
    applyBasicStyling(controls) {
        const style = this.renderedText.style;
        style.fontFamily = controls.fontFamily;
        style.fontSize = controls.fontSize + 'px';
        style.fontWeight = controls.fontWeight;
        style.letterSpacing = controls.letterSpacing + 'px';
        style.lineHeight = controls.lineHeight;
        style.wordSpacing = controls.wordSpacing + 'px';
        style.textAlign = this.currentAlignment;
    }
    
    applyOpenTypeFeatures() {
        const features = [];
        const featureMap = {
            'kerning': '"kern" 1',
            'ligatures': '"liga" 1, "clig" 1',
            'smallCaps': '"smcp" 1',
            'oldstyleNums': '"onum" 1',
            'tabularNums': '"tnum" 1, "lnum" 1',
            'fractions': '"frac" 1'
        };
        
        this.activeFeatures.forEach(feature => {
            if (featureMap[feature]) {
                features.push(featureMap[feature]);
            }
        });
        
        this.renderedText.style.fontFeatureSettings = features.join(', ') || 'normal';
        
        // Update active features count
        const activeCount = document.getElementById('activeFeatures');
        if (activeCount) {
            activeCount.textContent = this.activeFeatures.size;
        }
    }
    
    applyLayoutOptimizations(text) {
        const style = this.renderedText.style;
        
        // Apply hyphenation
        if (this.hyphenation) {
            style.hyphens = 'auto';
            style.hyphenateCharacter = '‐';
        } else {
            style.hyphens = 'manual';
        }
        
        // Apply layout optimization
        if (this.layoutOptimization) {
            style.textRendering = 'optimizeLegibility';
            style.fontOpticalSizing = 'auto';
            style.fontVariantLigatures = 'common-ligatures contextual';
        } else {
            style.textRendering = 'auto';
            style.fontOpticalSizing = 'none';
            style.fontVariantLigatures = 'normal';
        }
        
        // Calculate layout score based on various factors
        this.calculateLayoutScore(text);
    }
    
    calculateLayoutScore(text) {
        let score = 100;
        
        // Penalty for very long lines (reduces readability)
        const avgLineLength = text.length / (text.split('\n').length || 1);
        if (avgLineLength > 80) score -= 10;
        
        // Bonus for optimal line height
        const lineHeight = parseFloat(document.getElementById('lineHeight').value);
        if (lineHeight >= 1.4 && lineHeight <= 1.6) score += 5;
        
        // Bonus for using ligatures with appropriate text
        if (this.activeFeatures.has('ligatures') && this.hasCommonLigatures(text)) {
            score += 5;
        }
        
        // Penalty for extreme letter spacing
        const letterSpacing = parseFloat(document.getElementById('letterSpacing').value);
        if (Math.abs(letterSpacing) > 2) score -= 5;
        
        this.layoutScore = Math.max(0, Math.min(100, score));
    }
    
    hasCommonLigatures(text) {
        const commonLigatures = ['fi', 'fl', 'ff', 'ffi', 'ffl'];
        return commonLigatures.some(lig => text.includes(lig));
    }
    
    updateMetrics(text) {
        const metrics = this.calculateTextMetrics(text);
        
        // Update metric displays
        this.updateMetricDisplay('charCount', metrics.characters);
        this.updateMetricDisplay('wordCount', metrics.words);
        this.updateMetricDisplay('lineCount', metrics.lines);
        this.updateMetricDisplay('layoutScore', this.layoutScore);
    }
    
    calculateTextMetrics(text) {
        // More accurate word counting that handles various languages
        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        
        // Calculate approximate line count based on container width
        const containerWidth = this.renderedText.offsetWidth;
        const fontSize = parseInt(document.getElementById('fontSize').value);
        const avgCharWidth = fontSize * 0.6; // Approximate character width
        const charsPerLine = Math.floor(containerWidth / avgCharWidth) || 1;
        const lines = Math.ceil(text.length / charsPerLine) || 1;
        
        return {
            characters: text.length,
            words: words,
            lines: lines
        };
    }
    
    updateMetricDisplay(id, value) {
        const element = document.getElementById(id);
        if (element) {
            // Animate number changes
            const currentValue = parseInt(element.textContent) || 0;
            if (currentValue !== value) {
                this.animateValue(element, currentValue, value, 300);
            }
        }
    }
    
    animateValue(element, start, end, duration) {
        const startTime = performance.now();
        const difference = end - start;
        
        const updateValue = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = Math.round(start + (difference * this.easeOutQuart(progress)));
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        };
        
        requestAnimationFrame(updateValue);
    }
    
    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }
    
    updatePerformanceMetrics() {
        const renderTime = Math.round(performance.now() - this.renderStartTime);
        this.updateMetricDisplay('renderTime', renderTime + 'ms');
    }
    
    toggleFullscreen() {
        const renderingArea = document.querySelector('.rendering-area');
        const fullscreenBtn = document.getElementById('fullscreenToggle');
        
        if (!this.isFullscreen) {
            renderingArea.classList.add('fullscreen-mode');
            fullscreenBtn.textContent = '⛞';
            fullscreenBtn.setAttribute('aria-label', 'Exit fullscreen');
            this.isFullscreen = true;
        } else {
            renderingArea.classList.remove('fullscreen-mode');
            fullscreenBtn.textContent = '⛶';
            fullscreenBtn.setAttribute('aria-label', 'Enter fullscreen');
            this.isFullscreen = false;
        }
    }
    
    exportCSS() {
        const controls = this.getControlValues();
        const features = Array.from(this.activeFeatures);
        
        const css = this.generateCSS(controls, features);
        
        this.downloadFile('font-styles.css', css, 'text/css');
        this.showNotification('CSS exported successfully!');
    }
    
    generateCSS(controls, features) {
        const featureMap = {
            'kerning': '"kern" 1',
            'ligatures': '"liga" 1, "clig" 1',
            'smallCaps': '"smcp" 1',
            'oldstyleNums': '"onum" 1',
            'tabularNums': '"tnum" 1, "lnum" 1',
            'fractions': '"frac" 1'
        };
        
        const fontFeatures = features
            .map(feature => featureMap[feature])
            .filter(Boolean)
            .join(', ');
            
        return `/* Advanced Font Rendering Styles */
.custom-typography {
    font-family: ${controls.fontFamily};
    font-size: ${controls.fontSize}px;
    font-weight: ${controls.fontWeight};
    letter-spacing: ${controls.letterSpacing}px;
    line-height: ${controls.lineHeight};
    word-spacing: ${controls.wordSpacing}px;
    text-align: ${this.currentAlignment};
    ${fontFeatures ? `font-feature-settings: ${fontFeatures};` : ''}
    ${this.hyphenation ? 'hyphens: auto;' : ''}
    ${this.layoutOptimization ? `
    text-rendering: optimizeLegibility;
    font-optical-sizing: auto;
    font-variant-ligatures: common-ligatures contextual;` : ''}
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .custom-typography {
        font-size: ${Math.max(14, parseInt(controls.fontSize) * 0.9)}px;
        line-height: ${Math.max(1.2, parseFloat(controls.lineHeight) * 0.95)};
    }
}

@media (max-width: 480px) {
    .custom-typography {
        font-size: ${Math.max(12, parseInt(controls.fontSize) * 0.8)}px;
        letter-spacing: ${Math.max(0, parseFloat(controls.letterSpacing) * 0.8)}px;
    }
}`;
    }
    
    exportAsImage() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const renderingCanvas = document.querySelector('.rendering-canvas');
        const text = this.textInput.value || "Sample text";
        
        // Set canvas size based on content
        const devicePixelRatio = window.devicePixelRatio || 1;
        canvas.width = renderingCanvas.offsetWidth * devicePixelRatio;
        canvas.height = renderingCanvas.offsetHeight * devicePixelRatio;
        
        // Scale context for high DPI displays
        ctx.scale(devicePixelRatio, devicePixelRatio);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Set background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width / devicePixelRatio, canvas.height / devicePixelRatio);
        
        // Apply text styles
        const controls = this.getControlValues();
        ctx.font = `${controls.fontWeight} ${controls.fontSize}px ${controls.fontFamily}`;
        ctx.fillStyle = '#2c3e50';
        ctx.textBaseline = 'top';
        
        // Draw text with proper line wrapping
        this.drawWrappedText(ctx, text, 20, 20, canvas.width / devicePixelRatio - 40, parseInt(controls.fontSize) * parseFloat(controls.lineHeight));
        
        // Convert to blob and download
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'font-rendering-preview.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Image exported successfully!');
        }, 'image/png', 0.9);
    }
    
    drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && i > 0) {
                ctx.fillText(line, x, currentY);
                line = words[i] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    }
    
    copyFormattedText() {
        const text = this.textInput.value;
        if (!text) {
            this.showNotification('No text to copy!', 'warning');
            return;
        }
        
        // Create a temporary element with the same styling
        const tempDiv = document.createElement('div');
        tempDiv.style.cssText = this.renderedText.style.cssText;
        tempDiv.textContent = text;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);
        
        // Try to copy both plain text and HTML
        if (navigator.clipboard && window.ClipboardItem) {
            const htmlBlob = new Blob([tempDiv.outerHTML], { type: 'text/html' });
            const textBlob = new Blob([text], { type: 'text/plain' });
            
            const clipboardItem = new ClipboardItem({
                'text/html': htmlBlob,
                'text/plain': textBlob
            });
            
            navigator.clipboard.write([clipboardItem]).then(() => {
                this.showNotification('Text copied with formatting!');
            }).catch(() => {
                this.fallbackCopyText(text);
            });
        } else {
            this.fallbackCopyText(text);
        }
        
        document.body.removeChild(tempDiv);
    }
    
    fallbackCopyText(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showNotification('Text copied!');
        } catch (err) {
            this.showNotification('Copy failed. Please select and copy manually.', 'error');
        }
        
        document.body.removeChild(textArea);
    }
    
    downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    showNotification(message, type = 'success') {
        // Create notification element if it doesn't exist
        let notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 24px;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                font-size: 14px;
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                max-width: 300px;
                word-wrap: break-word;
            `;
            document.body.appendChild(notification);
        }
        
        // Set notification style based on type
        const colors = {
            success: '#28a745',
            warning: '#ffc107',
            error: '#dc3545',
            info: '#17a2b8'
        };
        
        notification.style.backgroundColor = colors[type] || colors.success;
        notification.textContent = message;
        
        // Show notification
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
        }, 3000);
    }
    
    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Performance monitoring
    measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${name}: ${end - start}ms`);
        return result;
    }
    
    // Initialize accessibility features
    initializeAccessibility() {
        // Add ARIA labels to controls
        const controls = document.querySelectorAll('input, select, button');
        controls.forEach(control => {
            if (!control.getAttribute('aria-label') && !control.getAttribute('aria-labelledby')) {
                const label = control.closest('.control-group')?.querySelector('label');
                if (label) {
                    const labelId = 'label-' + Math.random().toString(36).substr(2, 9);
                    label.id = labelId;
                    control.setAttribute('aria-labelledby', labelId);
                }
            }
        });
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.exportCSS();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.exportAsImage();
                        break;
                    case 'c':
                        if (e.shiftKey) {
                            e.preventDefault();
                            this.copyFormattedText();
                        }
                        break;
                }
            }
            
            // Toggle fullscreen with F11
            if (e.key === 'F11') {
                e.preventDefault();
                this.toggleFullscreen();
            }
        });
        
        // Announce changes to screen readers
        this.setupScreenReaderAnnouncements();
    }
    
    setupScreenReaderAnnouncements() {
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(announcer);
        
        this.announcer = announcer;
    }
    
    announce(message) {
        if (this.announcer) {
            this.announcer.textContent = message;
        }
    }
    
    // Initialize theme detection
    initializeThemeDetection() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleThemeChange = (e) => {
            document.body.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            this.announce(`Theme changed to ${e.matches ? 'dark' : 'light'} mode`);
        };
        
        // Set initial theme
        handleThemeChange(mediaQuery);
        
        // Listen for changes
        mediaQuery.addListener(handleThemeChange);
    }
    
    // Initialize reduced motion detection
    initializeMotionDetection() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        const handleMotionChange = (e) => {
            document.body.setAttribute('data-reduced-motion', e.matches ? 'true' : 'false');
            if (e.matches) {
                this.announce('Reduced motion enabled');
            }
        };
        
        handleMotionChange(mediaQuery);
        mediaQuery.addListener(handleMotionChange);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const fontEngine = new FontRenderingEngine();
    
    // Initialize accessibility features
    fontEngine.initializeAccessibility();
    fontEngine.initializeThemeDetection();
    fontEngine.initializeMotionDetection();
    
    // Make the engine globally available for debugging
    window.fontEngine = fontEngine;
    
    // Add service worker for offline functionality (if available)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.log('Service Worker registration failed:', err);
        });
    }
    
    // Initialize error handling
    window.addEventListener('error', (e) => {
        console.error('Application error:', e.error);
        fontEngine.showNotification('An error occurred. Please refresh the page.', 'error');
    });
    
    // Add loading state management
    document.body.classList.add('loaded');
    
    // Log performance metrics in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setTimeout(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
            console.log('DOM content loaded:', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'ms');
        }, 1000);
    }
});