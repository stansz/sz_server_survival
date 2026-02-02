import { AdvancedDynamicTexture, Rectangle, TextBlock, Control, StackPanel } from '@babylonjs/gui';

/**
 * HUD - Heads-up display for game information
 */
export class HUD {
  private texture: AdvancedDynamicTexture | null = null;
  private isDisposed: boolean = false;

  // UI elements
  private budgetText: TextBlock | null = null;
  private reputationText: TextBlock | null = null;
  private waveText: TextBlock | null = null;
  private timeText: TextBlock | null = null;
  private eventNotification: Rectangle | null = null;

  // Data
  private budget: number = 0;
  private reputation: number = 100;
  private wave: number = 1;
  private playTime: number = 0;

  constructor() {
    // HUD will be initialized when scene is ready
  }

  /**
   * Initialize HUD
   */
  initialize(scene: any): void {
    // Create full-screen UI texture
    this.texture = AdvancedDynamicTexture.CreateFullscreenUI('HUD', true, scene);

    // Create main container
    const container = new StackPanel();
    container.width = '100%';
    container.height = '100%';
    container.isVertical = false;
    this.texture.addControl(container);

    // Create top bar
    const topBar = this.createTopBar();
    container.addControl(topBar);

    // Create event notification
    const eventNotification = this.createEventNotification();
    eventNotification.isVisible = false;
    this.texture.addControl(eventNotification);
  }

  /**
   * Create top bar with budget, reputation, wave, and time
   */
  private createTopBar(): StackPanel {
    const topBar = new StackPanel();
    topBar.width = '100%';
    topBar.height = '60px';
    topBar.isVertical = false;
    topBar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    topBar.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    topBar.paddingTop = '10px';
    topBar.background = 'rgba(0, 0, 0, 0.7)';
    topBar.alpha = 0.9;

    // Budget
    const budgetPanel = this.createStatPanel('Budget', '$0', '#00ff00');
    topBar.addControl(budgetPanel);
    this.budgetText = budgetPanel.children[1] as TextBlock;

    // Reputation
    const reputationPanel = this.createStatPanel('Reputation', '100%', '#ffaa00');
    topBar.addControl(reputationPanel);
    this.reputationText = reputationPanel.children[1] as TextBlock;

    // Wave
    const wavePanel = this.createStatPanel('Wave', '1', '#00aaff');
    topBar.addControl(wavePanel);
    this.waveText = wavePanel.children[1] as TextBlock;

    // Time
    const timePanel = this.createStatPanel('Time', '0:00', '#ffffff');
    topBar.addControl(timePanel);
    this.timeText = timePanel.children[1] as TextBlock;

    return topBar;
  }

  /**
   * Create stat panel with label and value
   */
  private createStatPanel(label: string, value: string, color: string): StackPanel {
    const panel = new StackPanel();
    panel.width = '120px';
    panel.height = '50px';
    panel.isVertical = true;
    panel.paddingLeft = '10px';
    panel.paddingRight = '10px';

    // Label
    const labelBlock = new TextBlock();
    labelBlock.text = label;
    labelBlock.color = '#aaaaaa';
    labelBlock.fontSize = '12px';
    labelBlock.height = '20px';
    panel.addControl(labelBlock);

    // Value
    const valueBlock = new TextBlock();
    valueBlock.text = value;
    valueBlock.color = color;
    valueBlock.fontSize = '20px';
    valueBlock.fontWeight = 'bold';
    valueBlock.height = '30px';
    panel.addControl(valueBlock);

    return panel;
  }

  /**
   * Create event notification
   */
  private createEventNotification(): Rectangle {
    const notification = new Rectangle();
    notification.width = '400px';
    notification.height = '50px';
    notification.background = 'rgba(255, 170, 0, 0.9)';
    notification.cornerRadius = 10;
    notification.thickness = 2;
    notification.color = '#ffffff';
    notification.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    notification.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    notification.alpha = 0;

    // Text
    const text = new TextBlock();
    text.text = '';
    text.color = '#ffffff';
    text.fontSize = '18px';
    text.fontWeight = 'bold';
    text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    text.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    notification.addControl(text);

    return notification;
  }

  /**
   * Update budget display
   */
  setBudget(budget: number): void {
    this.budget = budget;
    if (this.budgetText) {
      this.budgetText.text = `$${budget.toFixed(0)}`;
      
      // Change color based on budget
      if (budget < 0) {
        this.budgetText.color = '#ff0000';
      } else if (budget < 100) {
        this.budgetText.color = '#ffaa00';
      } else {
        this.budgetText.color = '#00ff00';
      }
    }
  }

  /**
   * Update reputation display
   */
  setReputation(reputation: number): void {
    this.reputation = reputation;
    if (this.reputationText) {
      this.reputationText.text = `${reputation.toFixed(0)}%`;
      
      // Change color based on reputation
      if (reputation < 20) {
        this.reputationText.color = '#ff0000';
      } else if (reputation < 50) {
        this.reputationText.color = '#ffaa00';
      } else {
        this.reputationText.color = '#00ff00';
      }
    }
  }

  /**
   * Update wave display
   */
  setWave(wave: number): void {
    this.wave = wave;
    if (this.waveText) {
      this.waveText.text = wave.toString();
    }
  }

  /**
   * Update play time display
   */
  setPlayTime(seconds: number): void {
    this.playTime = seconds;
    if (this.timeText) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      this.timeText.text = `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  /**
   * Show event notification
   */
  showEvent(event: string, duration: number = 3000): void {
    if (this.eventNotification) {
      const textBlock = this.eventNotification.children[0] as TextBlock;
      textBlock.text = event;
      this.eventNotification.isVisible = true;
      this.eventNotification.alpha = 1;

      // Fade out after duration
      setTimeout(() => {
        this.hideEvent();
      }, duration);
    }
  }

  /**
   * Hide event notification
   */
  private hideEvent(): void {
    if (this.eventNotification) {
      // Fade out
      const fadeOut = () => {
        if (this.eventNotification && this.eventNotification.alpha > 0) {
          this.eventNotification.alpha -= 0.05;
          requestAnimationFrame(fadeOut);
        } else if (this.eventNotification) {
          this.eventNotification.isVisible = false;
          this.eventNotification.alpha = 0;
        }
      };
      fadeOut();
    }
  }

  /**
   * Get budget
   */
  getBudget(): number {
    return this.budget;
  }

  /**
   * Get reputation
   */
  getReputation(): number {
    return this.reputation;
  }

  /**
   * Get wave
   */
  getWave(): number {
    return this.wave;
  }

  /**
   * Get play time
   */
  getPlayTime(): number {
    return this.playTime;
  }

  /**
   * Check if HUD is initialized
   */
  isInitialized(): boolean {
    return this.texture !== null;
  }

  /**
   * Update HUD
   * @param deltaTime Time since last frame in seconds
   */
  update(deltaTime: number): void {
    // Update play time
    this.setPlayTime(this.playTime + deltaTime);
  }

  /**
   * Dispose HUD
   */
  dispose(): void {
    if (this.isDisposed) return;

    this.isDisposed = true;

    if (this.texture) {
      this.texture.dispose();
      this.texture = null;
    }

    this.budgetText = null;
    this.reputationText = null;
    this.waveText = null;
    this.timeText = null;
    this.eventNotification = null;
  }
}
