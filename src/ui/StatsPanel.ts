import { AdvancedDynamicTexture, Rectangle, TextBlock, StackPanel, Control, Button } from '@babylonjs/gui';

/**
 * Stats data interface
 */
export interface StatsData {
  playTime: number;
  wavesCompleted: number;
  requestsProcessed: number;
  attacksBlocked: number;
  servicesBuilt: number;
  budget: number;
  reputation: number;
}

/**
 * StatsPanel - Statistics display panel
 */
export class StatsPanel {
  private texture: AdvancedDynamicTexture | null = null;
  private isDisposed: boolean = false;

  // UI elements
  private panel: Rectangle | null = null;
  private statsContainer: StackPanel | null = null;

  // Stats display elements
  private playTimeText: TextBlock | null = null;
  private wavesText: TextBlock | null = null;
  private requestsText: TextBlock | null = null;
  private attacksText: TextBlock | null = null;
  private servicesText: TextBlock | null = null;
  private budgetText: TextBlock | null = null;
  private reputationText: TextBlock | null = null;

  // State
  private isVisible: boolean = false;

  // Callbacks
  private onClose: (() => void) | null = null;

  constructor() {
    // Stats panel will be initialized when scene is ready
  }

  /**
   * Initialize stats panel
   */
  initialize(scene: any): void {
    // Create full-screen UI texture
    this.texture = AdvancedDynamicTexture.CreateFullscreenUI('StatsPanel', true, scene);

    // Create main panel
    this.panel = this.createMainPanel();
    this.panel.isVisible = false;
    this.texture.addControl(this.panel);

    // Create stats container
    this.statsContainer = this.createStatsContainer();
    this.panel.addControl(this.statsContainer);

    // Create stats rows
    this.createStatsRows();

    // Create close button
    this.createCloseButton();
  }

  /**
   * Create main panel
   */
  private createMainPanel(): Rectangle {
    const panel = new Rectangle();
    panel.width = '400px';
    panel.height = '500px';
    panel.background = 'rgba(20, 20, 40, 0.95)';
    panel.cornerRadius = 15;
    panel.thickness = 3;
    panel.color = '#00aaff';
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    panel.alpha = 0.95;

    return panel;
  }

  /**
   * Create stats container
   */
  private createStatsContainer(): StackPanel {
    const container = new StackPanel();
    container.width = '100%';
    container.height = '100%';
    container.isVertical = true;
    container.paddingTop = '20px';
    container.paddingBottom = '20px';
    container.paddingLeft = '20px';
    container.paddingRight = '20px';

    // Title
    const title = new TextBlock();
    title.text = 'Game Statistics';
    title.color = '#ffffff';
    title.fontSize = '24px';
    title.fontWeight = 'bold';
    title.height = '40px';
    title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    container.addControl(title);

    return container;
  }

  /**
   * Create stats rows
   */
  private createStatsRows(): void {
    const stats = [
      { label: 'Play Time', key: 'playTime', format: this.formatTime },
      { label: 'Waves Completed', key: 'waves', format: (v: number) => v.toString() },
      { label: 'Requests Processed', key: 'requests', format: (v: number) => v.toString() },
      { label: 'Attacks Blocked', key: 'attacks', format: (v: number) => v.toString() },
      { label: 'Services Built', key: 'services', format: (v: number) => v.toString() },
      { label: 'Current Budget', key: 'budget', format: (v: number) => `$${v.toFixed(0)}` },
      { label: 'Current Reputation', key: 'reputation', format: (v: number) => `${v.toFixed(0)}%` },
    ];

    stats.forEach((stat) => {
      const row = this.createStatRow(stat.label, stat.format(0));
      this.statsContainer?.addControl(row);

      // Store reference
      const valueText = row.children[1] as TextBlock;
      switch (stat.key) {
        case 'playTime':
          this.playTimeText = valueText;
          break;
        case 'waves':
          this.wavesText = valueText;
          break;
        case 'requests':
          this.requestsText = valueText;
          break;
        case 'attacks':
          this.attacksText = valueText;
          break;
        case 'services':
          this.servicesText = valueText;
          break;
        case 'budget':
          this.budgetText = valueText;
          break;
        case 'reputation':
          this.reputationText = valueText;
          break;
      }
    });
  }

  /**
   * Create stat row
   */
  private createStatRow(label: string, value: string): StackPanel {
    const row = new StackPanel();
    row.width = '100%';
    row.height = '40px';
    row.isVertical = false;
    row.paddingTop = '5px';
    row.paddingBottom = '5px';

    // Label
    const labelBlock = new TextBlock();
    labelBlock.text = label;
    labelBlock.color = '#aaaaaa';
    labelBlock.fontSize = '14px';
    labelBlock.width = '200px';
    labelBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    row.addControl(labelBlock);

    // Value
    const valueBlock = new TextBlock();
    valueBlock.text = value;
    valueBlock.color = '#00ff00';
    valueBlock.fontSize = '16px';
    valueBlock.fontWeight = 'bold';
    valueBlock.width = '150px';
    valueBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    row.addControl(valueBlock);

    return row;
  }

  /**
   * Create close button
   */
  private createCloseButton(): void {
    const closeButton = Button.CreateSimpleButton('close-stats', 'Close');
    closeButton.width = '100px';
    closeButton.height = '40px';
    closeButton.color = '#ffffff';
    closeButton.background = '#ff4444';
    closeButton.fontSize = '16px';
    closeButton.fontWeight = 'bold';
    closeButton.cornerRadius = 5;
    closeButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    closeButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    closeButton.paddingBottom = '10px';

    closeButton.onPointerUpObservable.add(() => {
      this.handleClose();
    });

    this.panel?.addControl(closeButton);
  }

  /**
   * Format time
   */
  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Update stats display
   */
  updateStats(stats: StatsData): void {
    if (this.playTimeText) {
      this.playTimeText.text = this.formatTime(stats.playTime);
    }
    if (this.wavesText) {
      this.wavesText.text = stats.wavesCompleted.toString();
    }
    if (this.requestsText) {
      this.requestsText.text = stats.requestsProcessed.toString();
    }
    if (this.attacksText) {
      this.attacksText.text = stats.attacksBlocked.toString();
    }
    if (this.servicesText) {
      this.servicesText.text = stats.servicesBuilt.toString();
    }
    if (this.budgetText) {
      this.budgetText.text = `$${stats.budget.toFixed(0)}`;
      
      // Change color based on budget
      if (stats.budget < 0) {
        this.budgetText.color = '#ff0000';
      } else if (stats.budget < 100) {
        this.budgetText.color = '#ffaa00';
      } else {
        this.budgetText.color = '#00ff00';
      }
    }
    if (this.reputationText) {
      this.reputationText.text = `${stats.reputation.toFixed(0)}%`;
      
      // Change color based on reputation
      if (stats.reputation < 20) {
        this.reputationText.color = '#ff0000';
      } else if (stats.reputation < 50) {
        this.reputationText.color = '#ffaa00';
      } else {
        this.reputationText.color = '#00ff00';
      }
    }
  }

  /**
   * Show stats panel
   */
  show(): void {
    this.isVisible = true;
    if (this.panel) {
      this.panel.isVisible = true;
    }
  }

  /**
   * Hide stats panel
   */
  hide(): void {
    this.isVisible = false;
    if (this.panel) {
      this.panel.isVisible = false;
    }
  }

  /**
   * Toggle stats panel visibility
   */
  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Handle close
   */
  private handleClose(): void {
    this.hide();
    
    if (this.onClose) {
      this.onClose();
    }
  }

  /**
   * Set close callback
   */
  setOnClose(callback: () => void): void {
    this.onClose = callback;
  }

  /**
   * Check if panel is visible
   */
  isPanelVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Check if HUD is initialized
   */
  isInitialized(): boolean {
    return this.texture !== null;
  }

  /**
   * Dispose stats panel
   */
  dispose(): void {
    if (this.isDisposed) return;
    
    this.isDisposed = true;
    
    if (this.texture) {
      this.texture.dispose();
      this.texture = null;
    }
    
    this.panel = null;
    this.statsContainer = null;
    this.playTimeText = null;
    this.wavesText = null;
    this.requestsText = null;
    this.attacksText = null;
    this.servicesText = null;
    this.budgetText = null;
    this.reputationText = null;
    this.onClose = null;
  }
}
