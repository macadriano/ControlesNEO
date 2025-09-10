// AVL System JavaScript
class AVLSystem {
    constructor() {
        this.currentPage = 'dashboard';
        this.favorites = this.loadFavorites();
        this.isSidebarOpen = false;
        this.map = null;
        this.vehicleMarkers = [];
        this.vehicles = [];
        this.currentMapType = 'street';
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderFavorites();
        this.loadSampleData();
        this.setInitialFocus();
    }

    bindEvents() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Sidebar toggle
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            this.toggleSidebar();
        });

        document.getElementById('mobile-menu-btn').addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Add favorite form
        document.getElementById('add-favorite-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addFavorite();
        });

        // Close modal when clicking outside
        document.getElementById('add-favorite-modal').addEventListener('click', (e) => {
            if (e.target.id === 'add-favorite-modal') {
                this.closeAddFavoriteModal();
            }
        });

        // Map type selector - only if no onclick is present
        document.querySelectorAll('.map-type-btn:not([onclick])').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                if (type) {
                    this.changeMapType(type);
                }
            });
        });

        // Vehicle filter
        document.getElementById('status-filter').addEventListener('change', (e) => {
            this.filterVehicles(e.target.value);
        });

        // Vehicle search
        document.getElementById('vehicle-search').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.searchVehicle();
            }
        });

        // Username field - move to password on Enter
        document.getElementById('username').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('password').focus();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAddFavoriteModal();
            }
        });
    }

    setInitialFocus() {
        // Set focus on username field when page loads
        setTimeout(() => {
            const usernameField = document.getElementById('username');
            if (usernameField) {
                usernameField.focus();
                console.log('Focus set on username field');
            } else {
                console.log('Username field not found');
            }
        }, 200);
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Simulate login process
        if (username && password) {
            // Show loading state
            const loginBtn = document.querySelector('.login-btn');
            const originalText = loginBtn.innerHTML;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
            loginBtn.disabled = true;

            // Simulate API call
            setTimeout(() => {
                document.getElementById('login-screen').style.display = 'none';
                document.getElementById('main-app').style.display = 'flex';
                this.showNotification('¡Bienvenido al sistema AVL!', 'success');
            }, 1500);
        } else {
            this.showNotification('Por favor, complete todos los campos', 'error');
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        this.isSidebarOpen = !this.isSidebarOpen;
        
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
            vehicles: 'Vehículos',
            routes: 'Rutas',
            alerts: 'Alertas',
            tracking: 'Seguimiento',
            reports: 'Reportes',
            history: 'Historial',
            users: 'Usuarios',
            settings: 'Configuración'
        };
        document.getElementById('page-title').textContent = titles[page];

        this.currentPage = page;

        // Initialize map when navigating to tracking page
        if (page === 'tracking') {
            setTimeout(() => {
                this.initializeMap();
            }, 100);
        }

        // Close sidebar on mobile after navigation
        if (window.innerWidth <= 768) {
            this.isSidebarOpen = false;
            document.getElementById('sidebar').classList.remove('open');
        }
    }

    showAddFavoriteModal() {
        document.getElementById('add-favorite-modal').classList.add('active');
        document.getElementById('favorite-name').focus();
    }

    closeAddFavoriteModal() {
        document.getElementById('add-favorite-modal').classList.remove('active');
        document.getElementById('add-favorite-form').reset();
    }

    addFavorite() {
        const form = document.getElementById('add-favorite-form');
        const formData = new FormData(form);
        
        const favorite = {
            id: Date.now(),
            name: formData.get('name'),
            type: formData.get('type'),
            description: formData.get('description'),
            createdAt: new Date().toISOString()
        };

        this.favorites.push(favorite);
        this.saveFavorites();
        this.renderFavorites();
        this.closeAddFavoriteModal();
        this.showNotification('Favorito agregado exitosamente', 'success');
    }

    removeFavorite(id) {
        this.favorites = this.favorites.filter(fav => fav.id !== id);
        this.saveFavorites();
        this.renderFavorites();
        this.showNotification('Favorito eliminado', 'info');
    }

    renderFavorites() {
        const container = document.getElementById('favorites-grid');
        if (!container) return;
        
        // Get favorites from localStorage (new system)
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        if (favorites.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-star" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>No tienes favoritos configurados</p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem;">Agrega elementos frecuentemente utilizados para acceso rápido</p>
                    <button class="btn btn-primary" onclick="showAddFavoriteModal()" style="margin-top: 1rem;">
                        <i class="fas fa-plus"></i> Agregar Favorito
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = favorites.map(favorite => `
            <div class="favorite-item" onclick="navigateToFavorite('${favorite.id}')">
                <div class="favorite-icon" style="background: ${this.getFavoriteColor(favorite.category)}">
                    <i class="${favorite.icon}"></i>
                </div>
                <div class="favorite-name">${favorite.name}</div>
                <div class="favorite-description">${favorite.description || 'Acceso rápido'}</div>
                <div class="favorite-category">${this.getCategoryDisplayName(favorite.category)}</div>
                <button class="favorite-remove" onclick="event.stopPropagation(); removeFavorite('${favorite.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    getCategoryDisplayName(category) {
        const categoryNames = {
            'reports': '📊 Reportes',
            'tracking': '🗺️ Seguimiento',
            'alerts': '🚨 Alertas',
            'vehicles': '🚛 Vehículos',
            'routes': '🛣️ Rutas',
            'users': '👥 Usuarios',
            'settings': '⚙️ Configuración',
            'history': '📋 Historial'
        };
        return categoryNames[category] || '⭐ Favorito';
    }

    getFavoriteIcon(type) {
        const icons = {
            vehicle: 'fas fa-car',
            route: 'fas fa-route',
            zone: 'fas fa-map-marker-alt',
            report: 'fas fa-chart-bar',
            dashboard: 'fas fa-tachometer-alt'
        };
        return icons[type] || 'fas fa-star';
    }

    getFavoriteColor(category) {
        const colors = {
            'reports': 'var(--info-color)',
            'tracking': 'var(--primary-color)',
            'alerts': 'var(--warning-color)',
            'vehicles': 'var(--success-color)',
            'routes': 'var(--primary-color)',
            'users': 'var(--secondary-color)',
            'settings': 'var(--text-secondary)',
            'history': 'var(--info-color)'
        };
        return colors[category] || 'var(--secondary-color)';
    }

    getFavoriteTypeText(type) {
        const texts = {
            vehicle: 'Vehículo',
            route: 'Ruta',
            zone: 'Zona',
            report: 'Reporte',
            dashboard: 'Dashboard'
        };
        return texts[type] || 'Favorito';
    }

    openFavorite(type) {
        const pageMap = {
            vehicle: 'vehicles',
            route: 'routes',
            zone: 'alerts',
            report: 'reports',
            dashboard: 'dashboard'
        };
        
        const page = pageMap[type];
        if (page) {
            this.navigateToPage(page);
        }
    }

    loadSampleData() {
        // Add some sample favorites if none exist
        if (this.favorites.length === 0) {
            const sampleFavorites = [
                {
                    id: 1,
                    name: 'Ruta Principal',
                    type: 'route',
                    description: 'Ruta más utilizada',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'Vehículos Críticos',
                    type: 'vehicle',
                    description: 'Monitoreo especial',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    name: 'Reporte Diario',
                    type: 'report',
                    description: 'Resumen de actividades',
                    createdAt: new Date().toISOString()
                }
            ];
            
            this.favorites = sampleFavorites;
            this.saveFavorites();
            this.renderFavorites();
        }
    }

    saveFavorites() {
        localStorage.setItem('avl-favorites', JSON.stringify(this.favorites));
    }

    loadFavorites() {
        const saved = localStorage.getItem('avl-favorites');
        return saved ? JSON.parse(saved) : [];
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add notification styles if not already added
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    padding: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    z-index: 3000;
                    min-width: 300px;
                    animation: slideIn 0.3s ease-out;
                }
                
                .notification-success {
                    border-left: 4px solid var(--success-color);
                }
                
                .notification-error {
                    border-left: 4px solid var(--danger-color);
                }
                
                .notification-info {
                    border-left: 4px solid var(--info-color);
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex: 1;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    padding: 0.25rem;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

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
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };
        return icons[type] || 'fa-info-circle';
    }

    // Map Functions
    initializeMap() {
        if (this.map) {
            this.map.remove();
        }

        // Initialize map centered on Buenos Aires
        this.map = L.map('map').setView([-34.6037, -58.3816], 11);

        // Add tile layer based on current map type
        this.updateMapTiles();

        // Load vehicle data and add markers
        this.loadVehicleData();
        this.addVehicleMarkers();
        this.renderVehicleList();
        
        // Initialize mobile controls
        this.initializeMobileControls();
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
        if (this.map) {
            this.map.eachLayer((layer) => {
                if (layer instanceof L.TileLayer) {
                    this.map.removeLayer(layer);
                }
            });

            let tileLayer;
            if (this.currentMapType === 'satellite') {
                tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                });
            } else {
                tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                });
            }

            tileLayer.addTo(this.map);
        }
    }

    changeMapType(type) {
        this.currentMapType = type;
        
        // Update button states
        document.querySelectorAll('.map-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const targetBtn = document.querySelector(`[data-type="${type}"]`);
        if (targetBtn) {
            targetBtn.classList.add('active');
        }

        // Update map tiles
        this.updateMapTiles();
    }

    loadVehicleData() {
        // Sample vehicle data for Buenos Aires
        this.vehicles = [
            {
                id: 1,
                name: 'Camión ABC-123',
                lat: -34.6037,
                lng: -58.3816,
                status: 'ontime',
                speed: 45,
                direction: 'Norte',
                driver: 'Carlos Mendoza',
                address: 'Av. Corrientes 1234, CABA',
                lastUpdate: '15:30',
                route: 'Ruta Norte',
                fuel: 75,
                temperature: 22
            },
            {
                id: 2,
                name: 'Camión XYZ-789',
                lat: -34.6118,
                lng: -58.3960,
                status: 'delayed',
                speed: 0,
                direction: 'Este',
                driver: 'María González',
                address: 'Av. Santa Fe 5678, CABA',
                lastUpdate: '15:25',
                route: 'Ruta Centro',
                fuel: 45,
                temperature: 24
            },
            {
                id: 3,
                name: 'Camión DEF-456',
                lat: -34.5950,
                lng: -58.3731,
                status: 'stopped',
                speed: 0,
                direction: 'Sur',
                driver: 'Roberto Silva',
                address: 'Av. 9 de Julio 9012, CABA',
                lastUpdate: '15:20',
                route: 'Ruta Sur',
                fuel: 90,
                temperature: 20
            },
            {
                id: 4,
                name: 'Camión GHI-321',
                lat: -34.5875,
                lng: -58.3974,
                status: 'ontime',
                speed: 38,
                direction: 'Oeste',
                driver: 'Ana Rodríguez',
                address: 'Av. Córdoba 3456, CABA',
                lastUpdate: '15:28',
                route: 'Ruta Oeste',
                fuel: 60,
                temperature: 23
            },
            {
                id: 5,
                name: 'Camión JKL-654',
                lat: -34.6200,
                lng: -58.3700,
                status: 'offline',
                speed: 0,
                direction: 'N/A',
                driver: 'Luis Fernández',
                address: 'Av. Rivadavia 7890, CABA',
                lastUpdate: '14:45',
                route: 'Ruta Norte',
                fuel: 30,
                temperature: 0
            },
            {
                id: 6,
                name: 'Camión MNO-987',
                lat: -34.5800,
                lng: -58.4100,
                status: 'ontime',
                speed: 52,
                direction: 'Noreste',
                driver: 'Patricia López',
                address: 'Av. Belgrano 2468, CABA',
                lastUpdate: '15:32',
                route: 'Ruta Este',
                fuel: 85,
                temperature: 21
            }
        ];
    }

    addVehicleMarkers() {
        // Clear existing markers
        this.vehicleMarkers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.vehicleMarkers = [];

        // Add markers for each vehicle
        this.vehicles.forEach(vehicle => {
            const icon = this.createVehicleIcon(vehicle.status);
            const marker = L.marker([vehicle.lat, vehicle.lng], { icon: icon })
                .bindPopup(this.createVehiclePopup(vehicle))
                .on('click', () => {
                    this.selectVehicle(vehicle.id);
                });

            // Add vehicle label below the marker
            const label = this.createVehicleLabel(vehicle);
            label.addTo(this.map);

            this.vehicleMarkers.push(marker);
            this.vehicleMarkers.push(label);
            marker.addTo(this.map);
        });
    }

    createVehicleIcon(status) {
        const colors = {
            ontime: '#10b981',
            delayed: '#f59e0b',
            stopped: '#ef4444',
            offline: '#64748b'
        };

        const color = colors[status] || '#64748b';

        return L.divIcon({
            className: 'vehicle-marker',
            html: `
                <div style="
                    width: 30px;
                    height: 30px;
                    background: ${color};
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    color: white;
                ">
                    <i class="fas fa-truck"></i>
                </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
    }

    createVehicleLabel(vehicle) {
        const statusColors = {
            ontime: '#10b981',
            delayed: '#f59e0b',
            stopped: '#ef4444',
            offline: '#64748b'
        };

        const color = statusColors[vehicle.status] || '#64748b';
        
        // Extract vehicle name without "Camión" prefix
        const vehicleName = vehicle.name.replace('Camión ', '');
        
        // Get direction icon
        const directionIcon = this.getDirectionIcon(vehicle.direction);

        return L.marker([vehicle.lat, vehicle.lng], {
            icon: L.divIcon({
                className: 'vehicle-label',
                html: `
                    <div style="
                        background: white;
                        border: 2px solid ${color};
                        border-radius: 6px;
                        padding: 4px 8px;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                        font-size: 11px;
                        font-weight: 600;
                        color: #1e293b;
                        white-space: nowrap;
                        text-align: center;
                        min-width: 60px;
                        transform: translateY(20px);
                    ">
                        <div style="font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 4px;">
                            <span style="font-size: 12px; color: ${color}; font-weight: bold; text-shadow: 0 0 2px rgba(0,0,0,0.3);">${directionIcon}</span>
                            ${vehicleName}
                        </div>
                    </div>
                `,
                iconSize: [80, 25],
                iconAnchor: [40, -5]
            })
        });
    }

    getDirectionIcon(direction) {
        const directionIcons = {
            'Norte': '↑',
            'Sur': '↓',
            'Este': '→',
            'Oeste': '←',
            'Noreste': '↗',
            'Noroeste': '↖',
            'Sureste': '↘',
            'Suroeste': '↙',
            'N/A': '●'
        };
        
        return directionIcons[direction] || '●';
    }

    createVehiclePopup(vehicle) {
        return `
            <div style="min-width: 200px;">
                <h3 style="margin: 0 0 10px 0; color: #1e293b;">${vehicle.name}</h3>
                <div style="font-size: 14px; line-height: 1.4;">
                    <p style="margin: 4px 0;"><strong>Conductor:</strong> ${vehicle.driver}</p>
                    <p style="margin: 4px 0;"><strong>Dirección:</strong> ${vehicle.address}</p>
                    <p style="margin: 4px 0;"><strong>Velocidad:</strong> ${vehicle.speed} km/h</p>
                    <p style="margin: 4px 0;"><strong>Rumbo:</strong> ${vehicle.direction}</p>
                    <p style="margin: 4px 0;"><strong>Ruta:</strong> ${vehicle.route}</p>
                    <p style="margin: 4px 0;"><strong>Combustible:</strong> ${vehicle.fuel}%</p>
                    <p style="margin: 4px 0;"><strong>Última actualización:</strong> ${vehicle.lastUpdate}</p>
                    <p style="margin: 4px 0;"><strong>Coordenadas:</strong> ${vehicle.lat.toFixed(6)}, ${vehicle.lng.toFixed(6)}</p>
                </div>
            </div>
        `;
    }

    selectVehicle(vehicleId) {
        // Update vehicle list selection
        document.querySelectorAll('.vehicle-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelector(`[data-vehicle-id="${vehicleId}"]`).classList.add('selected');

        // Center map on selected vehicle
        const vehicle = this.vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
            this.map.setView([vehicle.lat, vehicle.lng], 15);
        }
    }

    renderVehicleList() {
        const container = document.getElementById('vehicle-list-content');
        
        container.innerHTML = this.vehicles.map(vehicle => {
            const statusText = {
                ontime: 'En tiempo',
                delayed: 'Demorado',
                stopped: 'Detenido',
                offline: 'Sin señal'
            };

            return `
                <div class="vehicle-item" data-vehicle-id="${vehicle.id}" onclick="avlSystem.selectVehicle(${vehicle.id})">
                    <div class="vehicle-status ${vehicle.status}"></div>
                    <div class="vehicle-info">
                        <div class="vehicle-name">${vehicle.name}</div>
                        <div class="vehicle-details">
                            <div>${vehicle.driver}</div>
                            <div>${vehicle.route}</div>
                            <div class="vehicle-speed">${vehicle.speed} km/h</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    filterVehicles(status) {
        const filteredVehicles = status === 'all' ? this.vehicles : this.vehicles.filter(v => v.status === status);
        
        // Update vehicle list
        const container = document.getElementById('vehicle-list-content');
        container.innerHTML = filteredVehicles.map(vehicle => {
            const statusText = {
                ontime: 'En tiempo',
                delayed: 'Demorado',
                stopped: 'Detenido',
                offline: 'Sin señal'
            };

            return `
                <div class="vehicle-item" data-vehicle-id="${vehicle.id}" onclick="avlSystem.selectVehicle(${vehicle.id})">
                    <div class="vehicle-status ${vehicle.status}"></div>
                    <div class="vehicle-info">
                        <div class="vehicle-name">${vehicle.name}</div>
                        <div class="vehicle-details">
                            <div>${vehicle.driver}</div>
                            <div>${vehicle.route}</div>
                            <div class="vehicle-speed">${vehicle.speed} km/h</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Update map markers
        this.vehicleMarkers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.vehicleMarkers = [];

        filteredVehicles.forEach(vehicle => {
            const icon = this.createVehicleIcon(vehicle.status);
            const marker = L.marker([vehicle.lat, vehicle.lng], { icon: icon })
                .bindPopup(this.createVehiclePopup(vehicle))
                .on('click', () => {
                    this.selectVehicle(vehicle.id);
                });

            // Add vehicle label below the marker
            const label = this.createVehicleLabel(vehicle);
            label.addTo(this.map);

            this.vehicleMarkers.push(marker);
            this.vehicleMarkers.push(label);
            marker.addTo(this.map);
        });
    }

    searchVehicle() {
        const searchTerm = document.getElementById('vehicle-search').value.trim().toLowerCase();
        
        if (!searchTerm) {
            this.showNotification('Ingrese un término de búsqueda', 'warning');
            return;
        }

        // Search in vehicle names, drivers, and routes
        const foundVehicle = this.vehicles.find(vehicle => 
            vehicle.name.toLowerCase().includes(searchTerm) ||
            vehicle.driver.toLowerCase().includes(searchTerm) ||
            vehicle.route.toLowerCase().includes(searchTerm)
        );

        if (foundVehicle) {
            // Center map on found vehicle with zoom for ~10 blocks
            this.map.setView([foundVehicle.lat, foundVehicle.lng], 15);
            
            // Select the vehicle in the list
            this.selectVehicle(foundVehicle.id);
            
            // Show success message
            this.showNotification(`Vehículo encontrado: ${foundVehicle.name}`, 'success');
            
            // Clear search input
            document.getElementById('vehicle-search').value = '';
        } else {
            this.showNotification('No se encontró ningún vehículo con ese criterio', 'error');
        }
    }
}

// Utility functions
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
}

// Global functions for HTML onclick handlers
function showAddFavoriteModal() {
    window.avlSystem.showAddFavoriteModal();
}

function closeAddFavoriteModal() {
    window.avlSystem.closeAddFavoriteModal();
}

function addFavorite() {
    window.avlSystem.addFavorite();
}

// Global functions for map controls
function changeMapType(type) {
    if (window.avlSystem) {
        window.avlSystem.changeMapType(type);
    }
}

function centerMap() {
    if (window.avlSystem && window.avlSystem.map) {
        // Center on Buenos Aires with appropriate zoom
        window.avlSystem.map.setView([-34.6037, -58.3816], 11);
    }
}

function searchVehicle() {
    if (window.avlSystem) {
        window.avlSystem.searchVehicle();
    }
}

// Initialize the system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.avlSystem = new AVLSystem();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        document.getElementById('sidebar').classList.remove('open');
        window.avlSystem.isSidebarOpen = false;
    }
});

// Add some interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Add click animation to stat cards
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // Add hover effects to activity items
    document.querySelectorAll('.activity-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'var(--light-color)';
            this.style.borderRadius = 'var(--border-radius)';
            this.style.paddingLeft = '1rem';
            this.style.paddingRight = '1rem';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
            this.style.borderRadius = '';
            this.style.paddingLeft = '';
            this.style.paddingRight = '';
        });
    });
});

// Mobile-specific functions for map controls
function toggleVehicleList() {
    const vehicleList = document.getElementById('vehicle-list');
    const toggleBtn = document.querySelector('.vehicle-list-toggle i');
    
    if (vehicleList && toggleBtn) {
        if (vehicleList.classList.contains('collapsed')) {
            vehicleList.classList.remove('collapsed');
            toggleBtn.className = 'fas fa-chevron-up';
        } else {
            vehicleList.classList.add('collapsed');
            toggleBtn.className = 'fas fa-chevron-down';
        }
    }
}

function toggleMapType() {
    if (window.avlSystem) {
        const currentType = window.avlSystem.currentMapType;
        const newType = currentType === 'street' ? 'satellite' : 'street';
        window.avlSystem.changeMapType(newType);
        
        // Update mobile control button
        const mapTypeBtn = document.querySelector('.mobile-control-btn[onclick="toggleMapType()"]');
        if (mapTypeBtn) {
            mapTypeBtn.classList.toggle('active', newType === 'satellite');
        }
        
        // Update main map type buttons
        document.querySelectorAll('.map-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const targetBtn = document.querySelector(`[data-type="${newType}"]`);
        if (targetBtn) {
            targetBtn.classList.add('active');
        }
    }
}

// Enhanced favorite functions with demo data
function showAddFavoriteModal() {
    const modal = document.getElementById('addFavoriteModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Pre-fill with demo data for better UX
        const demoData = [
            { name: 'Reporte de Velocidad Semanal', description: 'Análisis de excesos de velocidad', category: 'reports', icon: 'fas fa-tachometer-alt' },
            { name: 'Alertas Críticas', description: 'Monitoreo de alertas importantes', category: 'alerts', icon: 'fas fa-exclamation-triangle' },
            { name: 'Vehículos Activos', description: 'Lista de vehículos en operación', category: 'vehicles', icon: 'fas fa-truck' },
            { name: 'Rutas Principales', description: 'Gestión de rutas frecuentes', category: 'routes', icon: 'fas fa-route' }
        ];
        
        const randomDemo = demoData[Math.floor(Math.random() * demoData.length)];
        document.getElementById('favoriteName').placeholder = randomDemo.name;
        document.getElementById('favoriteDescription').placeholder = randomDemo.description;
        document.getElementById('favoriteCategory').value = randomDemo.category;
        document.getElementById('favoriteIcon').value = randomDemo.icon;
    }
}

function closeAddFavoriteModal() {
    const modal = document.getElementById('addFavoriteModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function addFavorite() {
    const name = document.getElementById('favoriteName').value;
    const description = document.getElementById('favoriteDescription').value;
    const category = document.getElementById('favoriteCategory').value;
    const icon = document.getElementById('favoriteIcon').value;
    
    if (name) {
        const favorite = { 
            id: Date.now(), // Unique ID
            name, 
            description: description || 'Acceso rápido',
            category,
            icon,
            url: getPageUrlFromCategory(category),
            timestamp: new Date().toISOString()
        };
        
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        favorites.push(favorite);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        // Refresh favorites display
        if (window.avlSystem) {
            window.avlSystem.renderFavorites();
            window.avlSystem.showNotification('Favorito agregado exitosamente', 'success');
        }
        
        closeAddFavoriteModal();
        document.getElementById('addFavoriteForm').reset();
    } else {
        if (window.avlSystem) {
            window.avlSystem.showNotification('Por favor ingrese un nombre para el favorito', 'warning');
        }
    }
}

// Helper function to get page URL from category
function getPageUrlFromCategory(category) {
    const categoryMap = {
        'reports': 'reports-page',
        'tracking': 'tracking-page', 
        'alerts': 'alerts-page',
        'vehicles': 'vehicles-page',
        'routes': 'routes-page',
        'users': 'users-page',
        'settings': 'settings-page',
        'history': 'history-page'
    };
    return categoryMap[category] || 'dashboard-page';
}

// Demo data fill function for favorite suggestions
function fillDemoData(type) {
    const demoData = {
        speed: {
            name: 'Reporte de Velocidad Semanal',
            description: 'Análisis detallado de excesos de velocidad por vehículo',
            category: 'reports',
            icon: 'fas fa-tachometer-alt'
        },
        alerts: {
            name: 'Centro de Alertas Críticas',
            description: 'Monitoreo en tiempo real de alertas importantes',
            category: 'alerts',
            icon: 'fas fa-exclamation-triangle'
        },
        routes: {
            name: 'Gestión de Rutas Principales',
            description: 'Administración de rutas más utilizadas',
            category: 'routes',
            icon: 'fas fa-route'
        }
    };
    
    const data = demoData[type];
    if (data) {
        document.getElementById('favoriteName').value = data.name;
        document.getElementById('favoriteDescription').value = data.description;
        document.getElementById('favoriteCategory').value = data.category;
        document.getElementById('favoriteIcon').value = data.icon;
    }
}

// Navigation function for favorites
function navigateToFavorite(favoriteId) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const favorite = favorites.find(f => f.id == favoriteId);
    
    if (favorite && window.avlSystem) {
        // Navigate to the page
        window.avlSystem.showPage(favorite.url.replace('#', ''));
        
        // Show notification
        window.avlSystem.showNotification(`Navegando a: ${favorite.name}`, 'info');
    }
}

// Remove favorite function
function removeFavorite(favoriteId) {
    if (confirm('¿Estás seguro de que quieres eliminar este favorito?')) {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const updatedFavorites = favorites.filter(f => f.id != favoriteId);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        
        // Refresh favorites display
        if (window.avlSystem) {
            window.avlSystem.renderFavorites();
            window.avlSystem.showNotification('Favorito eliminado', 'info');
        }
    }
}
