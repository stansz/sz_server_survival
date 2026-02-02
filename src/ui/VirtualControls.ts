import { AdvancedDynamicTexture, Button, StackPanel, Control } from '@babylonjs/gui';

/**
 * Virtual control action
 */
export enum VirtualControlAction {
  ZOOM_IN = 'zoom_in',
  ZOOM_OUT = 'zoom_out',
  ROTATE_LEFT = 'rotate_left',
  ROTATE_RIGHT = 'rotate_right',
  PAN_UP = 'pan_up',
  PAN_DOWN = 'pan_down',
  PAN_LEFT = 'pan_left',
  PAN_RIGHT = 'pan_right',
  PAUSE = 'pause',
  BUILD = 'build',
  STATS = 'stats',
}

/**
 * Virtual control callback
 */
export type VirtualControlCallback = (action: VirtualControlAction) => void;

/**
 * VirtualControls - Touch controls for mobile devices
 */
export class VirtualControls {
  private texture: AdvancedDynamicTexture | null = null;
  private isDisposed: boolean = false;

  // UI elements
  private controlsPanel: StackPanel | null = null;

  // Control buttons
  private zoomInButton: Button | null = null;
  private zoomOutButton: Button | null = null;
  private rotateLeftButton: Button | null = null;
  private rotateRightButton: Button | null = null;
  private panUpButton: Button | null = null;
  private panDownButton: Button | null = null;
  private panLeftButton: Button | null = null;
  private panRightButton: Button | null = null;
  private pauseButton: Button | null = null;
  private buildButton: Button | null = null;
  private statsButton: Button | null = null;

  // State
  private isVisible: boolean = false;
  private isTouchDevice: boolean = false;

  // Callbacks
  private onControlAction: VirtualControlCallback | null = null;

  constructor() {
    // Virtual controls will be initialized when scene is ready
    this.isTouchDevice = this.detectTouchDevice();
  }

  /**
   * Detect if device is touch-enabled
   */
  private detectTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Initialize virtual controls
   */
  initialize(scene: any): void {
    // Only show on touch devices
    if (!this.isTouchDevice) {
      console.log('Not a touch device, virtual controls disabled');
      return;
    }

    // Create full-screen UI texture
    this.texture = AdvancedDynamicTexture.CreateFullscreenUI('VirtualControls', true, scene);

    // Create main controls panel
    this.controlsPanel = this.createControlsPanel();
    this.controlsPanel.isVisible = false;
    this.texture.addControl(this.controlsPanel);

    // Create control buttons
    this.createControlButtons();
  }

  /**
   * Create controls panel
   */
  private createControlsPanel(): StackPanel {
    const panel = new StackPanel();
    panel.width = '100%';
    panel.height = '100%';
    panel.isVertical = false;
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    panel.paddingBottom = '20px';

    return panel;
  }

  /**
   * Create control buttons
   */
  private createControlButtons(): void {
    // Create zoom controls
    this.createZoomControls();

    // Create rotation controls
    this.createRotationControls();

    // Create pan controls
    this.createPanControls();

    // Create action buttons
    this.createActionButtons();
  }

  /**
   * Create zoom controls
   */
  private createZoomControls(): void {
    const zoomPanel = new StackPanel();
    zoomPanel.width = '80px';
    zoomPanel.height = '160px';
    zoomPanel.isVertical = true;
    zoomPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    zoomPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    zoomPanel.paddingRight = '20px';

    // Zoom in button
    this.zoomInButton = this.createCircleButton('+', '#00aaff', () => {
      this.handleAction(VirtualControlAction.ZOOM_IN);
    });
    this.zoomInButton.width = '60px';
    this.zoomInButton.height = '60px';
    zoomPanel.addControl(this.zoomInButton);

    // Zoom out button
    this.zoomOutButton = this.createCircleButton('-', '#00aaff', () => {
      this.handleAction(VirtualControlAction.ZOOM_OUT);
    });
    this.zoomOutButton.width = '60px';
    this.zoomOutButton.height = '60px';
    zoomPanel.addControl(this.zoomOutButton);

    this.controlsPanel?.addControl(zoomPanel);
  }

  /**
   * Create rotation controls
   */
  private createRotationControls(): void {
    const rotatePanel = new StackPanel();
    rotatePanel.width = '80px';
    rotatePanel.height = '160px';
    rotatePanel.isVertical = true;
    rotatePanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    rotatePanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    rotatePanel.paddingLeft = '20px';

    // Rotate left button
    this.rotateLeftButton = this.createCircleButton('◀', '#ffaa00', () => {
      this.handleAction(VirtualControlAction.ROTATE_LEFT);
    });
    this.rotateLeftButton.width = '60px';
    this.rotateLeftButton.height = '60px';
    rotatePanel.addControl(this.rotateLeftButton);

    // Rotate right button
    this.rotateRightButton = this.createCircleButton('▶', '#ffaa00', () => {
      this.handleAction(VirtualControlAction.ROTATE_RIGHT);
    });
    this.rotateRightButton.width = '60px';
    this.rotateRightButton.height = '60px';
    rotatePanel.addControl(this.rotateRightButton);

    this.controlsPanel?.addControl(rotatePanel);
  }

  /**
   * Create pan controls
   */
  private createPanControls(): void {
    const panPanel = new StackPanel();
    panPanel.width = '120px';
    panPanel.height = '120px';
    panPanel.isVertical = true;
    panPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    panPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    panPanel.paddingBottom = '100px';

    // Pan up button
    this.panUpButton = this.createCircleButton('▲', '#00aaff', () => {
      this.handleAction(VirtualControlAction.PAN_UP);
    });
    this.panUpButton.width = '50px';
    this.panUpButton.height = '50px';
    panPanel.addControl(this.panUpButton);

    // Pan down button
    this.panDownButton = this.createCircleButton('▼', '#00aaff', () => {
      this.handleAction(VirtualControlAction.PAN_DOWN);
    });
    this.panDownButton.width = '50px';
    this.panDownButton.height = '50px';
    panPanel.addControl(this.panDownButton);

    // Pan left button
    this.panLeftButton = this.createCircleButton('◀', '#00aaff', () => {
      this.handleAction(VirtualControlAction.PAN_LEFT);
    });
    this.panLeftButton.width = '50px';
    this.panLeftButton.height = '50px';
    panPanel.addControl(this.panLeftButton);

    // Pan right button
    this.panRightButton = this.createCircleButton('▶', '#00aaff', () => {
      this.handleAction(VirtualControlAction.PAN_RIGHT);
    });
    this.panRightButton.width = '50px';
    this.panRightButton.height = '50px';
    panPanel.addControl(this.panRightButton);

    this.controlsPanel?.addControl(panPanel);
  }

  /**
   * Create action buttons
   */
  private createActionButtons(): void {
    const actionPanel = new StackPanel();
    actionPanel.width = '200px';
    actionPanel.height = '60px';
    actionPanel.isVertical = false;
    actionPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    actionPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    actionPanel.paddingBottom = '20px';

    // Pause button
    this.pauseButton = this.createButton('⏸', '#ff4444', () => {
      this.handleAction(VirtualControlAction.PAUSE);
    });
    this.pauseButton.width = '80px';
    this.pauseButton.height = '50px';
    actionPanel.addControl(this.pauseButton);

    // Build button
    this.buildButton = this.createButton('🔨', '#00ff00', () => {
      this.handleAction(VirtualControlAction.BUILD);
    });
    this.buildButton.width = '80px';
    this.buildButton.height = '50px';
    actionPanel.addControl(this.buildButton);

    // Stats button
    this.statsButton = this.createButton('📊', '#00aaff', () => {
      this.handleAction(VirtualControlAction.STATS);
    });
    this.statsButton.width = '80px';
    this.statsButton.height = '50px';
    actionPanel.addControl(this.statsButton);

    this.controlsPanel?.addControl(actionPanel);
  }

  /**
   * Create circle button
   */
  private createCircleButton(text: string, color: string, onClick: () => void): Button {
    const button = Button.CreateSimpleButton(`circle-${text}`, text);
    button.width = '60px';
    button.height = '60px';
    button.color = '#ffffff';
    button.background = color;
    button.fontSize = '24px';
    button.fontWeight = 'bold';
    button.cornerRadius = 30;

    button.onPointerDownObservable.add(() => {
      button.background = this.lightenColor(color, 0.3);
    });

    button.onPointerUpObservable.add(() => {
      button.background = color;
      onClick();
    });

    return button;
  }

  /**
   * Create rectangular button
   */
  private createButton(text: string, color: string, onClick: () => void): Button {
    const button = Button.CreateSimpleButton(`button-${text}`, text);
    button.color = '#ffffff';
    button.background = color;
    button.fontSize = '20px';
    button.fontWeight = 'bold';
    button.cornerRadius = 10;

    button.onPointerDownObservable.add(() => {
      button.background = this.lightenColor(color, 0.3);
    });

    button.onPointerUpObservable.add(() => {
      button.background = color;
      onClick();
    });

    return button;
  }

  /**
   * Lighten color
   */
  private lightenColor(color: string, amount: number): string {
    // Simple color lightening
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const newR = Math.min(255, Math.floor(r + (255 - r) * amount));
    const newG = Math.min(255, Math.floor(g + (255 - g) * amount));
    const newB = Math.min(255, Math.floor(b + (255 - b) * amount));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  /**
   * Handle control action
   */
  private handleAction(action: VirtualControlAction): void {
    if (this.onControlAction) {
      this.onControlAction(action);
    }
  }

  /**
   * Show virtual controls
   */
  show(): void {
    this.isVisible = true;
    if (this.controlsPanel) {
      this.controlsPanel.isVisible = true;
    }
  }

  /**
   * Hide virtual controls
   */
  hide(): void {
    this.isVisible = false;
    if (this.controlsPanel) {
      this.controlsPanel.isVisible = false;
    }
  }

  /**
   * Toggle virtual controls visibility
   */
  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Set control action callback
   */
  setOnControlAction(callback: VirtualControlCallback): void {
    this.onControlAction = callback;
  }

  /**
   * Check if virtual controls are visible
   */
  areControlsVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Check if device is touch-enabled
   */
  isTouchEnabled(): boolean {
    return this.isTouchDevice;
  }

  /**
   * Check if HUD is initialized
   */
  isInitialized(): boolean {
    return this.texture !== null;
  }

  /**
   * Dispose virtual controls
   */
  dispose(): void {
    if (this.isDisposed) return;
    
    this.isDisposed = true;
    
    if (this.texture) {
      this.texture.dispose();
      this.texture = null;
    }
    
    this.controlsPanel = null;
    this.zoomInButton = null;
    this.zoomOutButton = null;
    this.rotateLeftButton = null;
    this.rotateRightButton = null;
    this.panUpButton = null;
    this.panDownButton = null;
    this.panLeftButton = null;
    this.panRightButton = null;
    this.pauseButton = null;
    this.buildButton = null;
    this.statsButton = null;
    this.onControlAction = null;
  }
}
