import { AdvancedDynamicTexture, Button, StackPanel, Control } from '@babylonjs/gui';
import { ServiceType } from '../types/service.types';
import { SERVICES_CONFIG } from '../config/services.config';

/**
 * Service selection callback
 */
export type ServiceSelectedCallback = (type: ServiceType) => void;

/**
 * BuildMenu - Service selection and placement menu
 */
export class BuildMenu {
  private texture: AdvancedDynamicTexture | null = null;
  private isDisposed: boolean = false;

  // UI elements
  private menuPanel: StackPanel | null = null;
  private serviceButtons: Map<ServiceType, Button> = new Map();

  // State
  private selectedService: ServiceType | null = null;
  private isVisible: boolean = false;

  // Callbacks
  private onServiceSelected: ServiceSelectedCallback | null = null;

  constructor() {
    // Build menu will be initialized when scene is ready
  }

  /**
   * Initialize build menu
   */
  initialize(scene: any): void {
    // Create full-screen UI texture
    this.texture = AdvancedDynamicTexture.CreateFullscreenUI('BuildMenu', true, scene);

    // Create main menu panel
    this.menuPanel = this.createMenuPanel();
    this.menuPanel.isVisible = false;
    this.texture.addControl(this.menuPanel);

    // Create service buttons
    this.createServiceButtons();
  }

  /**
   * Create menu panel
   */
  private createMenuPanel(): StackPanel {
    const panel = new StackPanel();
    panel.width = '280px';
    panel.height = '100%';
    panel.isVertical = true;
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    panel.paddingRight = '20px';
    panel.paddingTop = '80px'; // Below HUD
    panel.background = 'rgba(0, 0, 0, 0.8)';
    panel.alpha = 0.9;

    // Title
    const title = Button.CreateSimpleButton('build-title', 'Build Services');
    title.width = '100%';
    title.height = '40px';
    title.color = '#ffffff';
    title.background = '#1a1a2e';
    title.fontSize = '18px';
    title.fontWeight = 'bold';
    title.isEnabled = false;
    panel.addControl(title);

    return panel;
  }

  /**
   * Create service buttons
   */
  private createServiceButtons(): void {
    const services: ServiceType[] = [
      ServiceType.FIREWALL,
      ServiceType.CDN,
      ServiceType.LOAD_BALANCER,
      ServiceType.CACHE,
      ServiceType.DATABASE,
      ServiceType.AUTO_SCALER,
    ];

    services.forEach((serviceType) => {
      const config = SERVICES_CONFIG[serviceType];
      if (config) {
        const button = this.createServiceButton(serviceType, config);
        this.serviceButtons.set(serviceType, button);
        this.menuPanel?.addControl(button);
      }
    });
  }

  /**
   * Create service button
   */
  private createServiceButton(serviceType: ServiceType, config: any): Button {
    const button = Button.CreateSimpleButton(`service-${serviceType}`, config.name);
    button.width = '100%';
    button.height = '60px';
    button.color = '#ffffff';
    button.background = this.getServiceColor(serviceType);
    button.fontSize = '16px';
    button.fontWeight = 'bold';
    button.cornerRadius = 5;
    button.paddingLeft = '10px';
    button.paddingRight = '10px';

    button.onPointerUpObservable.add(() => {
      this.selectService(serviceType);
    });

    return button;
  }

  /**
   * Get service color
   */
  private getServiceColor(serviceType: ServiceType): string {
    const config = SERVICES_CONFIG[serviceType];
    return config?.color || '#00aaff';
  }

  /**
   * Select a service
   */
  private selectService(serviceType: ServiceType): void {
    this.selectedService = serviceType;
    
    // Update button styles
    this.serviceButtons.forEach((button, type) => {
      const config = SERVICES_CONFIG[type];
      if (type === serviceType) {
        button.background = '#ffffff';
        button.color = config?.color || '#000000';
      } else {
        button.background = config?.color || '#00aaff';
        button.color = '#ffffff';
      }
    });

    // Emit event
    if (this.onServiceSelected) {
      this.onServiceSelected(serviceType);
    }
  }

  /**
   * Deselect current service
   */
  deselectService(): void {
    this.selectedService = null;

    // Reset button styles
    this.serviceButtons.forEach((button, type) => {
      const config = SERVICES_CONFIG[type];
      button.background = config?.color || '#00aaff';
      button.color = '#ffffff';
    });

    // Emit event
    if (this.onServiceSelected) {
      this.onServiceSelected(null as any);
    }
  }

  /**
   * Show build menu
   */
  show(): void {
    this.isVisible = true;
    if (this.menuPanel) {
      this.menuPanel.isVisible = true;
    }
  }

  /**
   * Hide build menu
   */
  hide(): void {
    this.isVisible = false;
    if (this.menuPanel) {
      this.menuPanel.isVisible = false;
    }
    this.deselectService();
  }

  /**
   * Toggle build menu visibility
   */
  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Set service selected callback
   */
  setOnServiceSelected(callback: ServiceSelectedCallback): void {
    this.onServiceSelected = callback;
  }

  /**
   * Get selected service
   */
  getSelectedService(): ServiceType | null {
    return this.selectedService;
  }

  /**
   * Get service cost
   */
  getServiceCost(serviceType: ServiceType): number {
    const config = SERVICES_CONFIG[serviceType];
    return config?.cost || 100;
  }

  /**
   * Get service description
   */
  getServiceDescription(serviceType: ServiceType): string {
    const config = SERVICES_CONFIG[serviceType];
    return config?.description || '';
  }

  /**
   * Check if menu is visible
   */
  isMenuVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Check if HUD is initialized
   */
  isInitialized(): boolean {
    return this.texture !== null;
  }

  /**
   * Dispose build menu
   */
  dispose(): void {
    if (this.isDisposed) return;
    
    this.isDisposed = true;
    
    if (this.texture) {
      this.texture.dispose();
      this.texture = null;
    }
    
    this.menuPanel = null;
    this.serviceButtons.clear();
    this.selectedService = null;
    this.onServiceSelected = null;
  }
}
