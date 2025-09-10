// GPS Provider Platform JavaScript

class GPSProviderSystem {
    constructor() {
        this.currentPage = 'dashboard';
        this.isSidebarOpen = false;
        this.map = null;
        this.currentMapType = 'street';
        this.equipment = [];
        this.clients = [];
        this.vehicles = [];
        this.installations = [];
        this.technicians = [];
        
        this.init();
    }

    init() {
        console.log('GPS Provider System initializing...');
        this.bindEvents();
        this.loadSampleData();
        this.setInitialFocus();
        console.log('GPS Provider System initialized successfully');
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Navigation
        const navItems = document.querySelectorAll('.nav-item');
        if (navItems.length > 0) {
            navItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    const page = e.currentTarget.dataset.page;
                    this.navigateToPage(page);
                });
            });
        }

        // Map type selector - only if no onclick is present
        document.querySelectorAll('.map-type-btn:not([onclick])').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                if (type) {
                    this.changeMapType(type);
                }
            });
        });
    }

    setInitialFocus() {
        // Set focus on username field when page loads
        const usernameField = document.getElementById('username');
        if (usernameField) {
            usernameField.focus();
            console.log('Focus set on username field');
        } else {
            console.log('Username field not found');
        }
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Simple demo login
        if (username === 'admin' && password === 'admin') {
            this.showMainApp();
            this.showNotification('Bienvenido al sistema GPS Provider', 'success');
        } else {
            this.showNotification('Usuario o contraseña incorrectos', 'error');
        }
    }

    showMainApp() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
    }

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
        const sidebar = document.getElementById('sidebar');
        if (this.isSidebarOpen) {
            sidebar.classList.add('open');
        } else {
            sidebar.classList.remove('open');
        }
    }

    navigateToPage(page) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Update page content
        document.querySelectorAll('.page').forEach(pageEl => {
            pageEl.classList.remove('active');
        });
        document.getElementById(`${page}-page`).classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            equipment: 'Equipos GPS',
            stock: 'Control de Stock',
            config: 'Configuración',
            clients: 'Clientes',
            vehicles: 'Vehículos',
            sims: 'SIMs',
            installations: 'Instalaciones',
            technicians: 'Técnicos',
            maintenance: 'Mantenimiento',
            tracking: 'Seguimiento',
            testing: 'Pruebas',
            reports: 'Reportes',
            history: 'Historial',
            users: 'Usuarios',
            settings: 'Configuración'
        };
        document.getElementById('page-title').textContent = titles[page];

        this.currentPage = page;

        // Initialize map when navigating to tracking page
        if (page === 'tracking') {
            if (!this.map) {
                console.log('Initializing map for tracking page...');
                setTimeout(() => {
                    this.initializeMap();
                }, 100);
            } else {
                console.log('Map already exists, refreshing...');
                this.map.invalidateSize();
            }
        }

        // Close sidebar on mobile after navigation
        if (window.innerWidth <= 768) {
            this.isSidebarOpen = false;
            document.getElementById('sidebar').classList.remove('open');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Map Functions
    initializeMap() {
        // Check if map is already initialized
        if (this.map) {
            console.log('Map already initialized, skipping...');
            return;
        }

        // Check if the map container already has a map
        const mapContainer = document.getElementById('map');
        if (mapContainer && mapContainer._leaflet_id) {
            console.log('Map container already has a map, removing it...');
            // Remove existing map from container
            mapContainer._leaflet_id = null;
            mapContainer.innerHTML = '';
        }

        console.log('Initializing map...');

        // Initialize map centered on Buenos Aires
        this.map = L.map('map').setView([-34.6037, -58.3816], 11);

        // Add tile layer based on current map type
        this.updateMapTiles();

        // Load installation data and add markers
        this.loadInstallationData();
        this.addInstallationMarkers();
        
        // Initialize mobile controls
        this.initializeMobileControls();
        
        // Center map on installation bounds after initialization
        setTimeout(() => {
            if (this.map && this.installations && this.installations.length > 0) {
                // Calculate bounds from all installations
                const installationBounds = this.installations.map(installation => [installation.lat, installation.lng]);
                const bounds = L.latLngBounds(installationBounds);
                this.map.fitBounds(bounds, { padding: [50, 50] });
                console.log('Map initialized and centered on', this.installations.length, 'installations');
            } else if (this.map) {
                // Fallback to Buenos Aires if no installations
                this.map.setView([-34.6037, -58.3816], 11);
                console.log('Map initialized and centered on Buenos Aires (no installations)');
            }
        }, 1000);
    }

    initializeMobileControls() {
        // Ensure map is properly initialized
        if (this.map) {
            this.map.invalidateSize();
        }
        // Debug: Log mobile controls initialization
        const mobileControls = document.querySelectorAll('.mobile-control-btn');
        console.log('Mobile controls initialized:', mobileControls.length);
    }

    updateMapTiles() {
        console.log('updateMapTiles called, current type:', this.currentMapType);
        if (this.map) {
            try {
                // Remove existing tile layers safely
                this.map.eachLayer((layer) => {
                    if (layer && layer instanceof L.TileLayer) {
                        this.map.removeLayer(layer);
                    }
                });

                let tileLayer;
                if (this.currentMapType === 'satellite') {
                    console.log('Adding satellite tiles');
                    tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    });
                } else {
                    console.log('Adding street tiles');
                    tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    });
                }

                tileLayer.addTo(this.map);
                console.log('Tiles updated successfully');
            } catch (error) {
                console.error('Error updating tiles:', error);
            }
        } else {
            console.error('Map not available for tile update');
        }
    }

    changeMapType(type) {
        console.log('AVLSystem.changeMapType called with:', type);
        
        if (!this.map) {
            console.error('Map not initialized');
            return;
        }
        
        this.currentMapType = type;
        
        // Update button states
        document.querySelectorAll('.map-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const targetBtn = document.querySelector(`[data-type="${type}"]`);
        if (targetBtn) {
            targetBtn.classList.add('active');
            console.log('Button state updated for:', type);
        }

        // Update map tiles
        this.updateMapTiles();
    }

    loadInstallationData() {
        // Sample installation data for Buenos Aires
        this.installations = [
            {
                id: 'INST-001',
                equipmentId: 'GPS-2024-001',
                clientId: 'CLI-001',
                vehicleId: 'VEH-001',
                technicianId: 'TEC-001',
                lat: -34.6037,
                lng: -58.3816,
                address: 'Av. Corrientes 1234, CABA',
                status: 'installed',
                installationDate: '2024-01-15',
                technician: 'Carlos Mendoza',
                client: 'Transportes del Norte',
                vehicle: 'ABC-123'
            },
            {
                id: 'INST-002',
                equipmentId: 'GPS-2024-002',
                clientId: 'CLI-002',
                vehicleId: 'VEH-002',
                technicianId: 'TEC-002',
                lat: -34.6118,
                lng: -58.3960,
                address: 'Av. Santa Fe 5678, CABA',
                status: 'pending',
                installationDate: '2024-01-20',
                technician: 'María González',
                client: 'Logística Sur',
                vehicle: 'XYZ-789'
            },
            {
                id: 'INST-003',
                equipmentId: 'GPS-2024-003',
                clientId: 'CLI-003',
                vehicleId: 'VEH-003',
                technicianId: 'TEC-001',
                lat: -34.5955,
                lng: -58.3731,
                address: 'Av. 9 de Julio 9012, CABA',
                status: 'maintenance',
                installationDate: '2024-01-10',
                technician: 'Carlos Mendoza',
                client: 'Fletes del Este',
                vehicle: 'DEF-456'
            }
        ];
    }

    addInstallationMarkers() {
        if (!this.map) return;

        this.installations.forEach(installation => {
            const icon = this.createInstallationIcon(installation.status);
            const marker = L.marker([installation.lat, installation.lng], { icon })
                .bindPopup(this.createInstallationPopup(installation))
                .addTo(this.map);

            // Add custom label
            const label = this.createInstallationLabel(installation);
            marker.bindTooltip(label, {
                permanent: true,
                direction: 'bottom',
                offset: [0, 20],
                className: 'installation-label'
            });
        });
    }

    createInstallationIcon(status) {
        const colors = {
            installed: '#10b981',
            pending: '#f59e0b',
            maintenance: '#64748b',
            defective: '#ef4444'
        };

        return L.divIcon({
            className: 'installation-marker',
            html: `<div style="
                width: 20px;
                height: 20px;
                background: ${colors[status]};
                border: 2px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
    }

    createInstallationPopup(installation) {
        return `
            <div class="installation-popup">
                <h4>${installation.equipmentId}</h4>
                <p><strong>Cliente:</strong> ${installation.client}</p>
                <p><strong>Vehículo:</strong> ${installation.vehicle}</p>
                <p><strong>Técnico:</strong> ${installation.technician}</p>
                <p><strong>Estado:</strong> <span class="status-${installation.status}">${this.getStatusText(installation.status)}</span></p>
                <p><strong>Dirección:</strong> ${installation.address}</p>
                <p><strong>Fecha:</strong> ${installation.installationDate}</p>
            </div>
        `;
    }

    createInstallationLabel(installation) {
        return `
            <div class="installation-label-content">
                <strong>${installation.equipmentId}</strong><br>
                <small>${installation.client}</small>
            </div>
        `;
    }

    getStatusText(status) {
        const statusTexts = {
            installed: 'Instalado',
            pending: 'Pendiente',
            maintenance: 'Mantenimiento',
            defective: 'Defectuoso'
        };
        return statusTexts[status] || status;
    }

    loadSampleData() {
        // Load sample equipment data
        this.equipment = [
            {
                id: 'GPS-2024-001',
                model: 'GPS Pro',
                imei: '123456789012345',
                status: 'installed',
                clientId: 'CLI-001',
                vehicleId: 'VEH-001',
                installationDate: '2024-01-15'
            },
            {
                id: 'GPS-2024-002',
                model: 'GPS Basic',
                imei: '123456789012346',
                status: 'stock',
                clientId: null,
                vehicleId: null,
                receivedDate: '2024-01-20'
            }
        ];

        // Load sample clients data
        this.clients = [
            {
                id: 'CLI-001',
                name: 'Transportes del Norte',
                contact: 'Juan Pérez',
                email: 'juan@transportesnorte.com',
                phone: '+54 11 1234-5678',
                address: 'Av. Corrientes 1234, CABA',
                vehicles: 15,
                installations: 12
            },
            {
                id: 'CLI-002',
                name: 'Logística Sur',
                contact: 'María González',
                email: 'maria@logisticasur.com',
                phone: '+54 11 2345-6789',
                address: 'Av. Santa Fe 5678, CABA',
                vehicles: 8,
                installations: 6
            }
        ];

        // Load sample technicians data
        this.technicians = [
            {
                id: 'TEC-001',
                name: 'Carlos Mendoza',
                email: 'carlos@gpsprovider.com',
                phone: '+54 11 3456-7890',
                specializations: ['GPS Pro', 'GPS Basic'],
                activeInstallations: 3,
                completedInstallations: 45
            },
            {
                id: 'TEC-002',
                name: 'María González',
                email: 'maria@gpsprovider.com',
                phone: '+54 11 4567-8901',
                specializations: ['GPS Premium', 'GPS Pro'],
                activeInstallations: 2,
                completedInstallations: 32
            }
        ];
    }
}

// Global functions for map controls
function changeMapType(type) {
    console.log('changeMapType called with:', type);
    if (window.gpsProviderSystem && window.gpsProviderSystem.map) {
        window.gpsProviderSystem.changeMapType(type);
        console.log('Map type changed to:', type);
    } else {
        console.error('GPS Provider System or map not available');
    }
}

function centerMap() {
    console.log('centerMap called');
    
    if (window.gpsProviderSystem && window.gpsProviderSystem.map && window.gpsProviderSystem.installations) {
        // Calculate bounds from all installations
        const installationBounds = window.gpsProviderSystem.installations.map(installation => [installation.lat, installation.lng]);
        
        if (installationBounds.length > 0) {
            // Create bounds and fit map to show all installations with padding
            const bounds = L.latLngBounds(installationBounds);
            window.gpsProviderSystem.map.fitBounds(bounds, { padding: [50, 50] });
            console.log('Map centered on', installationBounds.length, 'installations');
        } else {
            // Fallback to Buenos Aires if no installations
            window.gpsProviderSystem.map.setView([-34.6037, -58.3816], 11);
            console.log('No installations found, centered on Buenos Aires');
        }
    } else {
        console.error('Map or installations not available');
    }
}

function searchItems() {
    const searchInput = document.querySelector('.search-box input');
    const query = searchInput.value.toLowerCase();
    
    if (query.length < 2) {
        window.gpsProviderSystem.showNotification('Ingrese al menos 2 caracteres para buscar', 'warning');
        return;
    }
    
    // Search logic would go here
    window.gpsProviderSystem.showNotification(`Buscando: "${query}"`, 'info');
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.password-toggle i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing GPS Provider System...');
    window.gpsProviderSystem = new GPSProviderSystem();
    
    // Make functions globally available immediately
    window.changeMapType = function(type) {
        console.log('changeMapType called with:', type);
        if (window.gpsProviderSystem && window.gpsProviderSystem.map) {
            window.gpsProviderSystem.changeMapType(type);
            console.log('Map type changed to:', type);
        } else {
            console.error('GPS Provider System or map not available');
        }
    };
    
    window.centerMap = function() {
        console.log('centerMap called');
        
        if (window.gpsProviderSystem && window.gpsProviderSystem.map && window.gpsProviderSystem.installations) {
            // Calculate bounds from all installations
            const installationBounds = window.gpsProviderSystem.installations.map(installation => [installation.lat, installation.lng]);
            
            if (installationBounds.length > 0) {
                // Create bounds and fit map to show all installations with padding
                const bounds = L.latLngBounds(installationBounds);
                window.gpsProviderSystem.map.fitBounds(bounds, { padding: [50, 50] });
                console.log('Map centered on', installationBounds.length, 'installations');
            } else {
                // Fallback to Buenos Aires if no installations
                window.gpsProviderSystem.map.setView([-34.6037, -58.3816], 11);
                console.log('No installations found, centered on Buenos Aires');
            }
        } else {
            console.error('Map or installations not available');
        }
    };
    
    console.log('Global functions registered');
    
    // Set focus on username field after a short delay
    setTimeout(() => {
        const usernameField = document.getElementById('username');
        if (usernameField) {
            usernameField.focus();
            console.log('Focus set on username field');
        }
    }, 500);
    
    // Debug function
    window.debugGPS = function() {
        console.log('=== GPS Provider System Debug ===');
        console.log('GPS Provider System exists:', !!window.gpsProviderSystem);
        console.log('Map exists:', !!(window.gpsProviderSystem && window.gpsProviderSystem.map));
        console.log('Installations loaded:', window.gpsProviderSystem ? window.gpsProviderSystem.installations.length : 0);
        console.log('Current map type:', window.gpsProviderSystem ? window.gpsProviderSystem.currentMapType : 'N/A');
        console.log('Current page:', window.gpsProviderSystem ? window.gpsProviderSystem.currentPage : 'N/A');
        if (window.gpsProviderSystem && window.gpsProviderSystem.map) {
            console.log('Map center:', window.gpsProviderSystem.map.getCenter());
            console.log('Map zoom:', window.gpsProviderSystem.map.getZoom());
        }
        console.log('========================');
    };
    
    // Force initialize map function
    window.forceInitMap = function() {
        console.log('Force initializing map...');
        if (window.gpsProviderSystem) {
            // Clear existing map reference
            if (window.gpsProviderSystem.map) {
                console.log('Removing existing map reference...');
                window.gpsProviderSystem.map = null;
            }
            
            // Clear map container
            const mapContainer = document.getElementById('map');
            if (mapContainer) {
                mapContainer.innerHTML = '';
                mapContainer._leaflet_id = null;
            }
            
            window.gpsProviderSystem.initializeMap();
            console.log('Map initialization forced');
        } else {
            console.error('GPS Provider System not available');
        }
    };
});
