// Academic Image Generator - Main Application Logic

// Global error handler to catch unhandled errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  console.error('Error message:', event.message);
  console.error('Error source:', event.filename, 'line:', event.lineno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

class AcademicImageGenerator {
  constructor() {
    // State
    this.state = {
      taskDescription: '',
      codeContent: '',
      interpreterModel: 'anthropic/claude-opus-4.5',
      imageModel: 'google/gemini-3-pro-image-preview',
      imageTemperature: 0.7,
      maxIterations: 2,
      currentIteration: 0,
      conversationHistory: [],
      generatedPrompt: '',
      currentImage: null,
      imageHistory: [],
      isProcessing: false,
      galleryIndex: 0,
      selectedImageForReview: null,
      reviews: {}  // Store reviews keyed by image version
    };

    // DOM Elements
    this.elements = {};
    
    // Initialize
    this.init();
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.setupFileUpload();
  }

  cacheElements() {
    // Input section
    this.elements.taskDescription = document.getElementById('task-description');
    this.elements.codeContent = document.getElementById('code-content');
    this.elements.codeUpload = document.getElementById('code-upload');
    this.elements.fileUploadArea = document.getElementById('file-upload-area');
    this.elements.uploadedFiles = document.getElementById('uploaded-files');
    this.elements.interpreterModel = document.getElementById('interpreter-model');
    this.elements.imageModel = document.getElementById('image-model');
    this.elements.iterations = document.getElementById('iterations');
    this.elements.iterationValue = document.getElementById('iteration-value');
    this.elements.temperature = document.getElementById('temperature');
    this.elements.temperatureValue = document.getElementById('temperature-value');
    this.elements.startGeneration = document.getElementById('start-generation');

    // Sections
    this.elements.inputSection = document.getElementById('input-section');
    this.elements.processingSection = document.getElementById('processing-section');
    this.elements.resultsSection = document.getElementById('results-section');

    // Progress
    this.elements.progressBarFill = document.getElementById('progress-bar-fill');
    this.elements.progressText = document.getElementById('progress-text');
    this.elements.stepInterpret = document.getElementById('step-interpret');
    this.elements.stepGenerate = document.getElementById('step-generate');
    this.elements.stepRefine = document.getElementById('step-refine');
    this.elements.stepReview = document.getElementById('step-review');

    // Processing section
    this.elements.promptContainer = document.getElementById('prompt-container');
    this.elements.generatedPrompt = document.getElementById('generated-prompt');
    this.elements.promptLabel = document.getElementById('prompt-label');
    this.elements.currentImageContainer = document.getElementById('current-image-container');
    this.elements.currentImage = document.getElementById('current-image');
    this.elements.imagePlaceholder = document.getElementById('image-placeholder');
    this.elements.versionBadge = document.getElementById('version-badge');
    this.elements.downloadCurrentImage = document.getElementById('download-current-image');
    this.elements.feedbackSection = document.getElementById('feedback-section');
    this.elements.userFeedback = document.getElementById('user-feedback');
    this.elements.submitFeedback = document.getElementById('submit-feedback');
    this.elements.skipToFinal = document.getElementById('skip-to-final');
    this.elements.currentIteration = document.getElementById('current-iteration');
    this.elements.totalIterations = document.getElementById('total-iterations');
    this.elements.analysisContainer = document.getElementById('analysis-container');
    this.elements.analysisContent = document.getElementById('analysis-content');
    this.elements.refinementSection = document.getElementById('refinement-section');
    this.elements.refinementPromptEditor = document.getElementById('refinement-prompt-editor');
    this.elements.applyRefinement = document.getElementById('apply-refinement');
    this.elements.editFeedback = document.getElementById('edit-feedback');

    // Gallery section
    this.elements.imageGalleryContainer = document.getElementById('image-gallery-container');
    this.elements.galleryImage = document.getElementById('gallery-image');
    this.elements.galleryVersionBadge = document.getElementById('gallery-version-badge');
    this.elements.galleryPrompt = document.getElementById('gallery-prompt');
    this.elements.galleryDots = document.getElementById('gallery-dots');
    this.elements.galleryPrev = document.getElementById('gallery-prev');
    this.elements.galleryNext = document.getElementById('gallery-next');
    this.elements.downloadSelected = document.getElementById('download-selected');
    this.elements.reviewSelected = document.getElementById('review-selected');
    this.elements.restartPipeline = document.getElementById('restart-pipeline');
    
    // Review section (inline within gallery)
    this.elements.inlineReviewContainer = document.getElementById('inline-review-container');
    this.elements.reviewedVersion = document.getElementById('reviewed-version');
    this.elements.scoresGrid = document.getElementById('scores-grid');
    this.elements.reviewModel = document.getElementById('review-model');

    // Overlays and modals
    this.elements.loadingOverlay = document.getElementById('loading-overlay');
    this.elements.loadingText = document.getElementById('loading-text');
    this.elements.errorModal = document.getElementById('error-modal');
    this.elements.errorMessage = document.getElementById('error-message');
    this.elements.errorClose = document.getElementById('error-close');
  }

  bindEvents() {
    // Input events
    this.elements.iterations.addEventListener('input', () => {
      this.elements.iterationValue.textContent = this.elements.iterations.value;
    });
    
    this.elements.temperature.addEventListener('input', () => {
      const tempValue = (this.elements.temperature.value / 100).toFixed(2);
      this.elements.temperatureValue.textContent = tempValue;
    });

    this.elements.startGeneration.addEventListener('click', () => this.startPipeline());

    // Feedback events
    this.elements.submitFeedback.addEventListener('click', () => this.submitFeedback());
    this.elements.skipToFinal.addEventListener('click', () => this.skipToFinalReview());

    // Refinement events
    this.elements.applyRefinement.addEventListener('click', () => this.applyRefinement());
    this.elements.editFeedback.addEventListener('click', () => this.backToFeedback());

    // Download current image
    this.elements.downloadCurrentImage.addEventListener('click', () => this.downloadCurrentImage());

    // Gallery events
    this.elements.galleryPrev.addEventListener('click', () => this.navigateGallery(-1));
    this.elements.galleryNext.addEventListener('click', () => this.navigateGallery(1));
    this.elements.downloadSelected.addEventListener('click', () => this.downloadGalleryImage());
    this.elements.reviewSelected.addEventListener('click', () => this.reviewSelectedImage());
    this.elements.restartPipeline.addEventListener('click', () => this.restart());

    // Modal events
    this.elements.errorClose.addEventListener('click', () => this.hideError());

    // Collapsible sections
    document.querySelectorAll('.collapsible-header').forEach(header => {
      header.addEventListener('click', () => {
        header.parentElement.classList.toggle('open');
      });
    });
  }

  setupFileUpload() {
    const area = this.elements.fileUploadArea;
    const input = this.elements.codeUpload;

    area.addEventListener('click', () => input.click());
    
    area.addEventListener('dragover', (e) => {
      e.preventDefault();
      area.classList.add('dragover');
    });

    area.addEventListener('dragleave', () => {
      area.classList.remove('dragover');
    });

    area.addEventListener('drop', (e) => {
      e.preventDefault();
      area.classList.remove('dragover');
      this.handleFiles(e.dataTransfer.files);
    });

    input.addEventListener('change', () => {
      this.handleFiles(input.files);
    });
  }

  async handleFiles(files) {
    const uploadedFiles = this.elements.uploadedFiles;
    
    for (const file of files) {
      // Read file content
      const content = await this.readFile(file);
      
      // Add to code content
      const currentCode = this.elements.codeContent.value;
      this.elements.codeContent.value = currentCode + 
        (currentCode ? '\n\n' : '') +
        `// === ${file.name} ===\n${content}`;

      // Show file in UI
      const fileEl = document.createElement('div');
      fileEl.className = 'uploaded-file';
      fileEl.innerHTML = `
        <span class="file-name">
          <i class="fa-solid fa-file-code"></i>
          ${file.name}
        </span>
        <span class="remove-file" data-filename="${file.name}">
          <i class="fa-solid fa-times"></i>
        </span>
      `;
      uploadedFiles.appendChild(fileEl);

      // Remove file handler
      fileEl.querySelector('.remove-file').addEventListener('click', (e) => {
        fileEl.remove();
      });
    }
  }

  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  // Pipeline methods
  async startPipeline() {
    // Validate input
    const taskDescription = this.elements.taskDescription.value.trim();
    if (!taskDescription) {
      this.showError('Please provide a task description.');
      return;
    }

    // Initialize state
    this.state.taskDescription = taskDescription;
    this.state.codeContent = this.elements.codeContent.value.trim();
    this.state.interpreterModel = this.elements.interpreterModel.value;
    this.state.imageModel = this.elements.imageModel.value;
    this.state.imageTemperature = parseInt(this.elements.temperature.value) / 100;
    this.state.maxIterations = parseInt(this.elements.iterations.value);
    this.state.currentIteration = 0;
    this.state.conversationHistory = [];
    this.state.imageHistory = [];

    // Update UI
    this.elements.inputSection.classList.add('hidden');
    this.elements.processingSection.classList.remove('hidden');
    this.elements.totalIterations.textContent = this.state.maxIterations;
    this.elements.feedbackSection.classList.add('hidden');

    // Start the pipeline
    try {
      await this.runInterpretStep();
      await this.runGenerateStep();
      this.showFeedbackSection();
    } catch (error) {
      console.error('Pipeline error:', error);
      this.showError(error.message || 'An error occurred during processing.');
    }
  }

  async runInterpretStep() {
    this.updateProgress('interpret', 'Generating detailed prompt...', 10);
    this.showLoading('Generating detailed prompt from your description...');

    try {
      console.log('Calling interpret API with:', {
        taskDescription: this.state.taskDescription.substring(0, 100) + '...',
        codeContent: this.state.codeContent ? 'provided' : 'none',
        interpreterModel: this.state.interpreterModel
      });

      let response;
      try {
        response = await fetch('/api/interpret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskDescription: this.state.taskDescription,
            codeContent: this.state.codeContent,
            interpreterModel: this.state.interpreterModel
          })
        });
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        throw new Error(`Network error: ${fetchError.message}. Check DevTools Network tab for details.`);
      }

      console.log('Interpret API response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      let responseText;
      try {
        responseText = await response.text();
      } catch (textError) {
        console.error('Error reading response:', textError);
        throw new Error(`Error reading response: ${textError.message}`);
      }
      console.log('Interpret API response:', responseText.substring(0, 500));

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('JSON parse error:', e);
        throw new Error('Invalid JSON from server: ' + responseText.substring(0, 200));
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate prompt' + (data.details ? ': ' + data.details : ''));
      }

      this.state.generatedPrompt = data.prompt;
      this.state.conversationHistory = data.conversationHistory;

      // Update UI - show prompt before image is generated
      this.elements.generatedPrompt.textContent = data.prompt;
      this.elements.promptLabel.textContent = 'Prompt for Image Generation';
      this.elements.promptContainer.classList.add('open');

      this.updateProgress('interpret', 'Prompt generated!', 25);
    } finally {
      this.hideLoading();
    }
  }

  async runGenerateStep() {
    // Calculate progress based on current iteration
    const imageCount = this.state.imageHistory.length;
    const totalImages = this.state.maxIterations + 1;
    const baseProgress = 25; // After interpret step
    const generateProgress = baseProgress + ((imageCount + 1) / totalImages) * 50;
    
    this.updateProgress('generate', `Generating image (v${imageCount + 1})...`, Math.min(generateProgress, 75));
    this.showLoading('Creating your academic figure...');

    try {
      // Use generatedPrompt for first image, refinementPrompt for subsequent
      const promptToUse = this.state.imageHistory.length === 0 
        ? this.state.generatedPrompt 
        : this.state.refinementPrompt;

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          imageModel: this.state.imageModel,
          temperature: this.state.imageTemperature
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate image');
      }

      const data = await response.json();
      
      // Debug: log the response to console
      console.log('Image generation response:', data);
      
      // Check if the API returned success: false
      if (data.success === false) {
        const errorMsg = data.error || 'Image generation failed';
        const details = data.details || '';
        
        console.error('API returned error:', data);
        
        // Build detailed error message with debug info
        let errorDetails = `${errorMsg}\n\n${details}`;
        
        // Add debug info if available
        if (data.debug) {
          errorDetails += '\n\n=== DEBUG INFO ===';
          
          if (data.debug.imagesEndpoint) {
            errorDetails += `\n\n[/images/generations endpoint]\nStatus: ${data.debug.imagesEndpoint.status}\nResponse: ${data.debug.imagesEndpoint.response}`;
          }
          
          if (data.debug.chatEndpoint) {
            errorDetails += `\n\n[/chat/completions with response_format]\nStatus: ${data.debug.chatEndpoint.status}\nResponse: ${data.debug.chatEndpoint.response}`;
          }
          
          if (data.debug.chatEndpoint2) {
            errorDetails += `\n\n[/chat/completions standard]\nStatus: ${data.debug.chatEndpoint2.status}\nResponse: ${data.debug.chatEndpoint2.response}`;
          }
          
          if (data.debug.textResponse) {
            errorDetails += `\n\n[Model text response]: ${data.debug.textResponse}`;
          }
        }
        
        throw new Error(errorDetails);
      }
      
      // Handle image data
      if (data.image) {
        // Validate that the image data is a valid URL or data URI
        const imageData = data.image;
        
        if (typeof imageData !== 'string') {
          throw new Error('Invalid image data type: ' + typeof imageData);
        }
        
        // Check if it's a valid image format
        const isDataUri = imageData.startsWith('data:image/');
        const isHttpUrl = imageData.startsWith('http://') || imageData.startsWith('https://');
        
        if (!isDataUri && !isHttpUrl) {
          // Log what we received for debugging
          console.error('Invalid image format received:', imageData.substring(0, 200));
          throw new Error('Invalid image format. Expected URL or data URI, received: ' + imageData.substring(0, 100) + '...');
        }
        
        this.state.currentImage = imageData;
      } else if (data.error) {
        // API returned an error
        console.error('API error:', data);
        throw new Error(data.error + (data.details ? ': ' + data.details : ''));
      } else {
        // Unknown response format
        console.error('Unknown response format:', data);
        throw new Error('No image was generated. Response: ' + JSON.stringify(data).substring(0, 200));
      }

      // Save to history
      this.state.imageHistory.push({
        version: this.state.imageHistory.length + 1,
        image: this.state.currentImage,
        prompt: promptToUse
      });

      // Update UI
      this.displayCurrentImage();
      
      // Update progress based on iteration
      const newImageCount = this.state.imageHistory.length;
      const totalImages = this.state.maxIterations + 1;
      const completionProgress = 25 + (newImageCount / totalImages) * 60;
      this.updateProgress('generate', `Image v${newImageCount} generated!`, Math.min(completionProgress, 85));
    } finally {
      this.hideLoading();
    }
  }

  async runSuperviseStep(feedback) {
    const imageCount = this.state.imageHistory.length;
    const totalImages = this.state.maxIterations + 1;
    const superviseProgress = 25 + (imageCount / totalImages) * 60 + 5;
    
    this.updateProgress('refine', `Analyzing image v${imageCount}...`, Math.min(superviseProgress, 85));
    this.showLoading('Analyzing your image with AI supervisor...');

    try {
      const response = await fetch('/api/supervise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: this.state.currentImage,
          userFeedback: feedback,
          conversationHistory: this.state.conversationHistory,
          originalTask: this.state.taskDescription,
          iterationNumber: this.state.currentIteration + 1,
          interpreterModel: this.state.interpreterModel
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to analyze image');
      }

      const data = await response.json();
      this.state.conversationHistory = data.conversationHistory;
      this.state.refinementPrompt = data.refinementPrompt;

      // Update UI with analysis
      this.elements.analysisContent.innerHTML = this.renderMarkdown(data.analysis);
      this.elements.analysisContainer.classList.add('open');

      const analyzeProgress = 25 + (this.state.imageHistory.length / (this.state.maxIterations + 1)) * 60 + 10;
      this.updateProgress('refine', 'Analysis complete!', Math.min(analyzeProgress, 85));
    } finally {
      this.hideLoading();
    }
  }

  showFeedbackSection() {
    // currentIteration represents which refinement we're about to do
    // imageHistory.length is the number of images already generated
    const imageCount = this.state.imageHistory.length;
    const refinementNumber = imageCount; // After v1, we're doing refinement 1
    
    this.elements.currentIteration.textContent = refinementNumber;
    
    // Remove hidden class and show feedback section
    this.elements.feedbackSection.classList.remove('hidden');
    this.elements.feedbackSection.style.display = 'block';
    this.elements.refinementSection.classList.add('hidden');
    this.elements.refinementSection.style.display = 'none';
    this.elements.analysisContainer.classList.add('hidden');
    this.elements.analysisContainer.style.display = 'none';
    this.elements.userFeedback.value = '';
    this.elements.userFeedback.focus();
  }

  async submitFeedback() {
    const feedback = this.elements.userFeedback.value.trim();
    
    // Check if we've already done all refinements
    // With maxIterations=N, we want N refinements (N+1 total images)
    // imageHistory.length tells us how many images we have
    // If we have N+1 images, all refinements are done
    if (this.state.imageHistory.length > this.state.maxIterations) {
      // All refinement iterations complete - go to gallery
      this.showGalleryPage();
      return;
    }

    try {
      // Run supervision to get analysis and refinement prompt
      await this.runSuperviseStep(feedback);
      
      // Show the refinement prompt for user to review/edit
      this.showRefinementSection();
    } catch (error) {
      console.error('Feedback error:', error);
      this.showError(error.message || 'An error occurred during refinement.');
    }
  }

  showRefinementSection() {
    // Hide feedback, show only refinement editor (not the analysis collapsible)
    this.elements.feedbackSection.classList.add('hidden');
    this.elements.feedbackSection.style.display = 'none';
    this.elements.analysisContainer.classList.add('hidden');
    this.elements.analysisContainer.style.display = 'none';
    this.elements.refinementSection.classList.remove('hidden');
    this.elements.refinementSection.style.display = 'block';
    
    // Populate the editor with the refinement prompt
    this.elements.refinementPromptEditor.value = this.state.refinementPrompt;
    this.elements.refinementPromptEditor.focus();
  }

  backToFeedback() {
    // Go back to feedback section
    this.elements.refinementSection.classList.add('hidden');
    this.elements.refinementSection.style.display = 'none';
    this.elements.analysisContainer.classList.add('hidden');
    this.elements.analysisContainer.style.display = 'none';
    this.elements.feedbackSection.classList.remove('hidden');
    this.elements.feedbackSection.style.display = 'block';
    this.elements.userFeedback.focus();
  }

  async applyRefinement() {
    try {
      // Get the (possibly edited) refinement prompt
      this.state.refinementPrompt = this.elements.refinementPromptEditor.value.trim();
      
      if (!this.state.refinementPrompt) {
        this.showError('Please provide a refinement prompt.');
        return;
      }

      // Hide refinement section
      this.elements.refinementSection.style.display = 'none';
      this.elements.analysisContainer.style.display = 'none';
      
      // Generate new image with the refinement prompt
      await this.runGenerateStep();
      
      // Check if we've completed all refinement iterations
      // With maxIterations=N, we want N+1 total images (1 original + N refinements)
      if (this.state.imageHistory.length > this.state.maxIterations) {
        // All iterations complete, show gallery for user to select image for review
        this.showGalleryPage();
      } else {
        // Show feedback section for next iteration
        this.showFeedbackSection();
      }
    } catch (error) {
      console.error('Apply refinement error:', error);
      this.showError(error.message || 'An error occurred during image generation.');
    }
  }

  skipToFinalReview() {
    // Skip remaining iterations and go to gallery
    this.showGalleryPage();
  }

  downloadCurrentImage() {
    if (!this.state.currentImage) {
      this.showError('No image to download.');
      return;
    }
    const link = document.createElement('a');
    link.href = this.state.currentImage;
    link.download = `academic-figure-v${this.state.imageHistory.length}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Gallery Methods
  showGalleryPage() {
    // Hide processing section elements
    this.elements.feedbackSection.classList.add('hidden');
    this.elements.feedbackSection.style.display = 'none';
    this.elements.refinementSection.classList.add('hidden');
    this.elements.refinementSection.style.display = 'none';
    this.elements.analysisContainer.classList.add('hidden');
    this.elements.analysisContainer.style.display = 'none';
    
    // Hide processing section, show results section
    this.elements.processingSection.classList.add('hidden');
    this.elements.resultsSection.classList.remove('hidden');
    
    // Show gallery
    this.elements.imageGalleryContainer.classList.remove('hidden');
    
    // Initialize gallery at the last image
    this.state.galleryIndex = this.state.imageHistory.length - 1;
    this.renderGallery();
    
    // Show review for current image if one exists
    this.showReviewForCurrentImage();
    
    this.updateProgress('review', 'All images generated! Select one for review.', 90);
  }

  renderGallery() {
    const history = this.state.imageHistory;
    const index = this.state.galleryIndex;
    const item = history[index];
    
    if (!item) return;
    
    // Update image and prompt
    this.elements.galleryImage.src = item.image;
    this.elements.galleryVersionBadge.textContent = `v${item.version}`;
    this.elements.galleryPrompt.textContent = item.prompt;
    
    // Update navigation buttons
    this.elements.galleryPrev.disabled = index === 0;
    this.elements.galleryNext.disabled = index === history.length - 1;
    
    // Update dots
    const dotsHTML = history.map((_, i) => `
      <div class="gallery-dot ${i === index ? 'active' : ''}" data-index="${i}"></div>
    `).join('');
    this.elements.galleryDots.innerHTML = dotsHTML;
    
    // Add click handlers to dots
    this.elements.galleryDots.querySelectorAll('.gallery-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        this.state.galleryIndex = parseInt(dot.dataset.index);
        this.renderGallery();
        // Show review for current image if it exists
        this.showReviewForCurrentImage();
      });
    });
  }

  navigateGallery(direction) {
    const newIndex = this.state.galleryIndex + direction;
    if (newIndex >= 0 && newIndex < this.state.imageHistory.length) {
      this.state.galleryIndex = newIndex;
      this.renderGallery();
      // Show review for current image if it exists
      this.showReviewForCurrentImage();
    }
  }

  downloadGalleryImage() {
    const item = this.state.imageHistory[this.state.galleryIndex];
    if (!item) {
      this.showError('No image to download.');
      return;
    }
    const link = document.createElement('a');
    link.href = item.image;
    link.download = `academic-figure-v${item.version}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async reviewSelectedImage() {
    // Store the selected image for review
    this.state.selectedImageForReview = this.state.imageHistory[this.state.galleryIndex];
    
    // Run the review for the selected image
    await this.runFinalReviewForImage(this.state.selectedImageForReview);
  }

  hideInlineReview() {
    // Hide the inline review section
    this.elements.inlineReviewContainer.classList.add('hidden');
  }

  showReviewForCurrentImage() {
    // Get current image version
    const currentItem = this.state.imageHistory[this.state.galleryIndex];
    if (!currentItem) return;
    
    const version = currentItem.version;
    const reviewData = this.state.reviews[version];
    
    if (reviewData) {
      // Review exists for this image - show it
      this.elements.inlineReviewContainer.classList.remove('hidden');
      this.elements.reviewedVersion.textContent = `v${version}`;
      this.displayReviewResults(reviewData);
    } else {
      // No review for this image - hide the review section
      this.elements.inlineReviewContainer.classList.add('hidden');
    }
  }

  async runFinalReviewForImage(imageItem) {
    this.updateProgress('review', 'Generating professional review...', 95);
    this.showLoading('Creating professional review...');

    // Get selected review model
    const reviewModel = this.elements.reviewModel.value;

    try {
      const response = await fetch('/api/final-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageItem.image,
          originalTask: this.state.taskDescription,
          conversationHistory: this.state.conversationHistory,
          totalIterations: this.state.imageHistory.length,
          interpreterModel: reviewModel  // Use selected review model
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate review');
      }

      const data = await response.json();
      
      // Store the review in state (keyed by image version)
      this.state.reviews[imageItem.version] = data;
      
      // Show inline review below the gallery (don't hide gallery)
      this.elements.inlineReviewContainer.classList.remove('hidden');
      
      // Update reviewed version label
      this.elements.reviewedVersion.textContent = `v${imageItem.version}`;
      
      // Display review results
      this.displayReviewResults(data);
      
      // Scroll to review section
      this.elements.inlineReviewContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      this.updateProgress('review', 'Review complete!', 100);
    } catch (error) {
      console.error('Final review error:', error);
      this.showError(error.message || 'An error occurred during review.');
    } finally {
      this.hideLoading();
    }
  }

  displayReviewResults(reviewData) {
    // Display scores
    const scores = reviewData.scores || {};
    const formatScore = (score) => score !== undefined && score !== null ? score : '-';
    const scoresHTML = `
      <div class="score-card">
        <div class="score-value">${formatScore(scores.requirements)}/10</div>
        <div class="score-label">Requirements</div>
      </div>
      <div class="score-card">
        <div class="score-value">${formatScore(scores.rigor)}/10</div>
        <div class="score-label">Academic Rigor</div>
      </div>
      <div class="score-card">
        <div class="score-value">${formatScore(scores.accuracy)}/10</div>
        <div class="score-label">Accuracy</div>
      </div>
      <div class="score-card">
        <div class="score-value">${formatScore(scores.clarity)}/10</div>
        <div class="score-label">Visual Clarity</div>
      </div>
      <div class="score-card overall">
        <div class="score-value">${formatScore(scores.overall)}/10</div>
        <div class="score-label">Overall</div>
      </div>
    `;
    this.elements.scoresGrid.innerHTML = scoresHTML;

    // Display publication status
    const overall = scores.overall || 0;
    let statusClass, statusText, statusIcon;
    if (overall >= 8) {
      statusClass = 'excellent';
      statusText = 'Publication Ready';
      statusIcon = 'fa-check-circle';
    } else if (overall >= 6) {
      statusClass = 'good';
      statusText = 'Minor Revisions Needed';
      statusIcon = 'fa-edit';
    } else {
      statusClass = 'needs-work';
      statusText = 'Needs Improvement';
      statusIcon = 'fa-exclamation-triangle';
    }
    
    const publicationStatus = document.getElementById('publication-status');
    publicationStatus.innerHTML = `
      <div class="publication-badge ${statusClass}">
        <i class="fa-solid ${statusIcon}"></i>
        <span>${statusText}</span>
      </div>
    `;

    // Parse and display review sections
    const review = reviewData.review || '';
    this.parseAndDisplayReviewSections(review);
  }

  displayCurrentImage() {
    const img = this.elements.currentImage;
    const placeholder = this.elements.imagePlaceholder;
    
    if (this.state.currentImage) {
      img.src = this.state.currentImage;
      img.classList.add('visible');
      placeholder.classList.add('hidden');
      
      const version = this.state.imageHistory.length;
      this.elements.versionBadge.textContent = `v${version}`;
      
      // Update the prompt display with the corresponding prompt
      const currentHistoryItem = this.state.imageHistory[version - 1];
      if (currentHistoryItem) {
        this.elements.generatedPrompt.textContent = currentHistoryItem.prompt;
        
        // Update the prompt label
        if (version === 1) {
          this.elements.promptLabel.textContent = `Current Prompt (v1 - Original)`;
        } else {
          this.elements.promptLabel.textContent = `Current Prompt (v${version} - Refinement ${version - 1})`;
        }
      }
    }
  }

  parseAndDisplayReviewSections(review) {
    // Extract sections from the review markdown
    const sections = {
      assessment: '',
      strengths: '',
      improvements: '',
      recommendations: ''
    };

    // Split by headers
    const lines = review.split('\n');
    let currentSection = null;
    let currentContent = [];

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Check for section headers
      if (lowerLine.includes('overall assessment') || lowerLine.includes('overall evaluation')) {
        if (currentSection && currentContent.length) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = 'assessment';
        currentContent = [];
      } else if (lowerLine.includes('strength')) {
        if (currentSection && currentContent.length) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = 'strengths';
        currentContent = [];
      } else if (lowerLine.includes('areas for improvement') || lowerLine.includes('weaknesses') || lowerLine.includes('areas to improve')) {
        if (currentSection && currentContent.length) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = 'improvements';
        currentContent = [];
      } else if (lowerLine.includes('recommendation') || lowerLine.includes('suggestion')) {
        if (currentSection && currentContent.length) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = 'recommendations';
        currentContent = [];
      } else if (lowerLine.includes('publication readiness')) {
        // Skip publication readiness section - we handle it separately
        if (currentSection && currentContent.length) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = null;
        currentContent = [];
      } else if (lowerLine.includes('scores') && lowerLine.includes('1-10')) {
        // Skip scores section
        if (currentSection && currentContent.length) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = null;
        currentContent = [];
      } else if (currentSection) {
        // Skip header lines (starting with #)
        if (!line.trim().startsWith('#')) {
          currentContent.push(line);
        }
      }
    }

    // Don't forget the last section
    if (currentSection && currentContent.length) {
      sections[currentSection] = currentContent.join('\n');
    }

    // Populate the UI
    const assessmentEl = document.getElementById('assessment-content');
    const strengthsEl = document.getElementById('strengths-content');
    const improvementsEl = document.getElementById('improvements-content');
    const recommendationsEl = document.getElementById('recommendations-content');

    assessmentEl.innerHTML = this.renderMarkdown(sections.assessment) || '<p>No assessment provided.</p>';
    strengthsEl.innerHTML = this.renderMarkdown(sections.strengths) || '<p>No strengths listed.</p>';
    improvementsEl.innerHTML = this.renderMarkdown(sections.improvements) || '<p>No improvements needed.</p>';
    recommendationsEl.innerHTML = this.renderMarkdown(sections.recommendations) || '<p>No specific recommendations.</p>';

    // Show/hide cards based on content
    document.getElementById('review-assessment').style.display = sections.assessment ? 'block' : 'none';
    document.getElementById('review-strengths').style.display = sections.strengths ? 'block' : 'none';
    document.getElementById('review-improvements').style.display = sections.improvements ? 'block' : 'none';
    document.getElementById('review-recommendations').style.display = sections.recommendations ? 'block' : 'none';
  }

  restart() {
    // Reset state
    this.state = {
      taskDescription: '',
      codeContent: '',
      interpreterModel: 'anthropic/claude-opus-4.5',
      imageModel: 'google/gemini-3-pro-image-preview',
      imageTemperature: 0.7,
      maxIterations: 2,
      currentIteration: 0,
      conversationHistory: [],
      generatedPrompt: '',
      currentImage: null,
      imageHistory: [],
      isProcessing: false,
      galleryIndex: 0,
      selectedImageForReview: null,
      reviews: {}  // Clear all stored reviews
    };
    
    // Reset prompt label
    this.elements.promptLabel.textContent = 'Current Prompt (v1 - Original)';

    // Reset UI
    this.elements.resultsSection.classList.add('hidden');
    this.elements.processingSection.classList.add('hidden');
    this.elements.inputSection.classList.remove('hidden');
    
    // Clear inputs
    this.elements.taskDescription.value = '';
    this.elements.codeContent.value = '';
    this.elements.uploadedFiles.innerHTML = '';
    this.elements.userFeedback.value = '';
    this.elements.refinementPromptEditor.value = '';
    
    // Hide sections
    this.elements.feedbackSection.style.display = 'none';
    this.elements.refinementSection.style.display = 'none';
    this.elements.analysisContainer.style.display = 'none';
    
    // Reset gallery and inline review
    this.elements.imageGalleryContainer.classList.remove('hidden');
    this.elements.inlineReviewContainer.classList.add('hidden');
    this.elements.galleryDots.innerHTML = '';
    
    // Reset progress
    this.resetProgress();
    
    // Clear image displays
    this.elements.currentImage.src = '';
    this.elements.currentImage.classList.remove('visible');
    this.elements.imagePlaceholder.classList.remove('hidden');
    this.elements.galleryImage.src = '';
    
    // Close collapsibles
    document.querySelectorAll('.collapsible').forEach(c => c.classList.remove('open'));
  }

  // UI Helper methods
  updateProgress(step, text, percentage) {
    // Update progress bar
    this.elements.progressBarFill.style.width = `${percentage}%`;
    this.elements.progressText.textContent = text;

    // Update step indicators
    const steps = ['interpret', 'generate', 'refine', 'review'];
    const stepElements = [
      this.elements.stepInterpret,
      this.elements.stepGenerate,
      this.elements.stepRefine,
      this.elements.stepReview
    ];

    const currentIndex = steps.indexOf(step);
    
    stepElements.forEach((el, index) => {
      el.classList.remove('active', 'completed');
      if (index < currentIndex) {
        el.classList.add('completed');
      } else if (index === currentIndex) {
        el.classList.add('active');
      }
    });
  }

  resetProgress() {
    this.elements.progressBarFill.style.width = '0%';
    this.elements.progressText.textContent = 'Initializing...';
    
    [this.elements.stepInterpret, this.elements.stepGenerate, 
     this.elements.stepRefine, this.elements.stepReview].forEach(el => {
      el.classList.remove('active', 'completed');
    });
  }

  showLoading(text) {
    this.elements.loadingText.textContent = text;
    this.elements.loadingOverlay.classList.remove('hidden');
  }

  hideLoading() {
    this.elements.loadingOverlay.classList.add('hidden');
  }

  showError(message) {
    this.elements.errorMessage.textContent = message;
    this.elements.errorModal.classList.remove('hidden');
  }

  hideError() {
    this.elements.errorModal.classList.add('hidden');
  }

  renderMarkdown(text) {
    if (!text) return '';
    
    // Simple markdown rendering
    return text
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Lists
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AcademicImageGenerator();
});
