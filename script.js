// Wizard functionality
class ControlWizard {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.recipients = [];
        this.controlData = {
            controls: {},
            recipients: [],
            criteria: {},
            reports: {}
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateNavigation();
        this.loadSavedData();
    }

    bindEvents() {
        // Step navigation
        document.querySelectorAll('.step').forEach(step => {
            step.addEventListener('click', (e) => {
                const stepNumber = parseInt(e.currentTarget.dataset.step);
                this.goToStep(stepNumber);
            });
        });

        // Navigation buttons
        document.getElementById('prev-btn').addEventListener('click', () => {
            this.previousStep();
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('finish-btn').addEventListener('click', () => {
            this.finishWizard();
        });

        // Control options
        this.bindControlEvents();
        
        // Recipient form
        document.getElementById('recipient-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addRecipient();
        });

        // Auto-save functionality
        this.bindAutoSave();
    }

    bindControlEvents() {
        // Speed control options
        document.querySelectorAll('input[name="speed-control"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const speedSettings = document.querySelector('.speed-settings');
                const isChecked = Array.from(document.querySelectorAll('input[name="speed-control"]')).some(cb => cb.checked);
                speedSettings.style.display = isChecked ? 'block' : 'none';
                this.saveControlData();
            });
        });

        // Schedule control options
        document.querySelectorAll('input[name="schedule-control"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const scheduleSettings = document.querySelector('.schedule-settings');
                const isChecked = Array.from(document.querySelectorAll('input[name="schedule-control"]')).some(cb => cb.checked);
                scheduleSettings.style.display = isChecked ? 'block' : 'none';
                this.saveControlData();
            });
        });

        // All control checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.saveControlData();
            });
        });

        // All input fields
        document.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', () => {
                this.saveControlData();
            });
        });
    }

    bindAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            this.saveControlData();
        }, 30000);
    }

    goToStep(stepNumber) {
        if (stepNumber < 1 || stepNumber > this.totalSteps) return;
        
        // Hide current step
        document.querySelector('.step-content-panel.active').classList.remove('active');
        document.querySelector('.step.active').classList.remove('active');
        
        // Show new step
        document.getElementById(`step-${stepNumber}`).classList.add('active');
        document.querySelector(`[data-step="${stepNumber}"]`).classList.add('active');
        
        this.currentStep = stepNumber;
        this.updateNavigation();
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.goToStep(this.currentStep + 1);
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.goToStep(this.currentStep - 1);
        }
    }

    updateNavigation() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const finishBtn = document.getElementById('finish-btn');

        // Update previous button
        prevBtn.disabled = this.currentStep === 1;

        // Update next/finish buttons
        if (this.currentStep === this.totalSteps) {
            nextBtn.style.display = 'none';
            finishBtn.style.display = 'inline-block';
        } else {
            nextBtn.style.display = 'inline-block';
            finishBtn.style.display = 'none';
        }
    }

    addRecipient() {
        const form = document.getElementById('recipient-form');
        const formData = new FormData(form);
        
        const recipient = {
            id: Date.now(),
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            notificationType: formData.get('notification-type')
        };

        this.recipients.push(recipient);
        this.renderRecipients();
        form.reset();
        this.saveControlData();
        
        // Show success message
        this.showMessage('Destinatario agregado exitosamente', 'success');
    }

    removeRecipient(id) {
        this.recipients = this.recipients.filter(r => r.id !== id);
        this.renderRecipients();
        this.saveControlData();
        this.showMessage('Destinatario eliminado', 'info');
    }

    renderRecipients() {
        const container = document.getElementById('recipients-container');
        
        if (this.recipients.length === 0) {
            container.innerHTML = '<p style="color: #666; font-style: italic;">No hay destinatarios configurados</p>';
            return;
        }

        container.innerHTML = this.recipients.map(recipient => `
            <div class="recipient-item">
                <div class="recipient-info">
                    <h4>${recipient.name}</h4>
                    <p>${recipient.email} | ${recipient.phone || 'Sin teléfono'}</p>
                    <small>Tipo: ${this.getNotificationTypeText(recipient.notificationType)}</small>
                </div>
                <button class="btn-remove" onclick="wizard.removeRecipient(${recipient.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    getNotificationTypeText(type) {
        const types = {
            'email': 'Email',
            'sms': 'SMS',
            'both': 'Email y SMS'
        };
        return types[type] || type;
    }

    saveControlData() {
        // Save controls data
        this.controlData.controls = {
            speed: this.getSpeedControlData(),
            zone: this.getZoneControlData(),
            schedule: this.getScheduleControlData(),
            route: this.getRouteControlData()
        };

        // Save recipients
        this.controlData.recipients = this.recipients;

        // Save criteria
        this.controlData.criteria = this.getCriteriaData();

        // Save reports
        this.controlData.reports = this.getReportsData();

        // Save to localStorage
        localStorage.setItem('controlWizardData', JSON.stringify(this.controlData));
    }

    getSpeedControlData() {
        const speedControls = Array.from(document.querySelectorAll('input[name="speed-control"]:checked')).map(cb => cb.value);
        const speedLimit = document.querySelector('input[name="speed-limit"]').value;
        
        return {
            enabled: speedControls.length > 0,
            types: speedControls,
            limit: speedLimit ? parseInt(speedLimit) : null
        };
    }

    getZoneControlData() {
        return Array.from(document.querySelectorAll('input[name="zone-control"]:checked')).map(cb => cb.value);
    }

    getScheduleControlData() {
        const scheduleControls = Array.from(document.querySelectorAll('input[name="schedule-control"]:checked')).map(cb => cb.value);
        const startTime = document.querySelector('input[name="start-time"]').value;
        const endTime = document.querySelector('input[name="end-time"]').value;
        
        return {
            enabled: scheduleControls.length > 0,
            types: scheduleControls,
            startTime: startTime,
            endTime: endTime
        };
    }

    getRouteControlData() {
        return Array.from(document.querySelectorAll('input[name="route-control"]:checked')).map(cb => cb.value);
    }

    getCriteriaData() {
        return {
            days: Array.from(document.querySelectorAll('input[name="days"]:checked')).map(cb => cb.value),
            frequency: document.querySelector('select[name="frequency"]').value,
            priority: document.querySelector('select[name="priority"]').value,
            conditions: Array.from(document.querySelectorAll('input[name="conditions"]:checked')).map(cb => cb.value)
        };
    }

    getReportsData() {
        return {
            vehicleInfo: Array.from(document.querySelectorAll('input[name="vehicle-info"]:checked')).map(cb => cb.value),
            locationInfo: Array.from(document.querySelectorAll('input[name="location-info"]:checked')).map(cb => cb.value),
            eventInfo: Array.from(document.querySelectorAll('input[name="event-info"]:checked')).map(cb => cb.value),
            emailTemplate: document.querySelector('select[name="email-template"]').value,
            includeMap: document.querySelector('input[name="include-map"]').checked,
            includeHistory: document.querySelector('input[name="include-history"]').checked
        };
    }

    loadSavedData() {
        const savedData = localStorage.getItem('controlWizardData');
        if (savedData) {
            try {
                this.controlData = JSON.parse(savedData);
                this.recipients = this.controlData.recipients || [];
                this.renderRecipients();
                this.loadFormData();
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    }

    loadFormData() {
        // Load controls data
        if (this.controlData.controls) {
            this.loadSpeedControlData();
            this.loadScheduleControlData();
            this.loadZoneControlData();
            this.loadRouteControlData();
        }

        // Load criteria data
        if (this.controlData.criteria) {
            this.loadCriteriaData();
        }

        // Load reports data
        if (this.controlData.reports) {
            this.loadReportsData();
        }
    }

    loadSpeedControlData() {
        const speedData = this.controlData.controls.speed;
        if (speedData && speedData.enabled) {
            speedData.types.forEach(type => {
                const checkbox = document.querySelector(`input[name="speed-control"][value="${type}"]`);
                if (checkbox) checkbox.checked = true;
            });
            
            if (speedData.limit) {
                document.querySelector('input[name="speed-limit"]').value = speedData.limit;
            }
            
            document.querySelector('.speed-settings').style.display = 'block';
        }
    }

    loadScheduleControlData() {
        const scheduleData = this.controlData.controls.schedule;
        if (scheduleData && scheduleData.enabled) {
            scheduleData.types.forEach(type => {
                const checkbox = document.querySelector(`input[name="schedule-control"][value="${type}"]`);
                if (checkbox) checkbox.checked = true;
            });
            
            if (scheduleData.startTime) {
                document.querySelector('input[name="start-time"]').value = scheduleData.startTime;
            }
            if (scheduleData.endTime) {
                document.querySelector('input[name="end-time"]').value = scheduleData.endTime;
            }
            
            document.querySelector('.schedule-settings').style.display = 'block';
        }
    }

    loadZoneControlData() {
        const zoneData = this.controlData.controls.zone;
        if (zoneData) {
            zoneData.forEach(type => {
                const checkbox = document.querySelector(`input[name="zone-control"][value="${type}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
    }

    loadRouteControlData() {
        const routeData = this.controlData.controls.route;
        if (routeData) {
            routeData.forEach(type => {
                const checkbox = document.querySelector(`input[name="route-control"][value="${type}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
    }

    loadCriteriaData() {
        const criteriaData = this.controlData.criteria;
        if (criteriaData) {
            if (criteriaData.days) {
                criteriaData.days.forEach(day => {
                    const checkbox = document.querySelector(`input[name="days"][value="${day}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            
            if (criteriaData.frequency) {
                document.querySelector('select[name="frequency"]').value = criteriaData.frequency;
            }
            
            if (criteriaData.priority) {
                document.querySelector('select[name="priority"]').value = criteriaData.priority;
            }
            
            if (criteriaData.conditions) {
                criteriaData.conditions.forEach(condition => {
                    const checkbox = document.querySelector(`input[name="conditions"][value="${condition}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        }
    }

    loadReportsData() {
        const reportsData = this.controlData.reports;
        if (reportsData) {
            if (reportsData.vehicleInfo) {
                reportsData.vehicleInfo.forEach(info => {
                    const checkbox = document.querySelector(`input[name="vehicle-info"][value="${info}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            
            if (reportsData.locationInfo) {
                reportsData.locationInfo.forEach(info => {
                    const checkbox = document.querySelector(`input[name="location-info"][value="${info}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            
            if (reportsData.eventInfo) {
                reportsData.eventInfo.forEach(info => {
                    const checkbox = document.querySelector(`input[name="event-info"][value="${info}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            
            if (reportsData.emailTemplate) {
                document.querySelector('select[name="email-template"]').value = reportsData.emailTemplate;
            }
            
            if (reportsData.includeMap !== undefined) {
                document.querySelector('input[name="include-map"]').checked = reportsData.includeMap;
            }
            
            if (reportsData.includeHistory !== undefined) {
                document.querySelector('input[name="include-history"]').checked = reportsData.includeHistory;
            }
        }
    }

    finishWizard() {
        // Validate required fields
        if (!this.validateWizard()) {
            return;
        }

        // Save final data
        this.saveControlData();

        // Show completion message
        this.showMessage('¡Configuración completada exitosamente!', 'success');
        
        // In a real application, you would send this data to a server
        console.log('Final control configuration:', this.controlData);
        
        // Optionally redirect or show summary
        setTimeout(() => {
            this.showSummary();
        }, 2000);
    }

    validateWizard() {
        // Check if at least one control is enabled
        const hasControls = Object.values(this.controlData.controls).some(control => {
            if (Array.isArray(control)) {
                return control.length > 0;
            }
            return control && (control.enabled || control.length > 0);
        });

        if (!hasControls) {
            this.showMessage('Debe configurar al menos un tipo de control', 'error');
            this.goToStep(1);
            return false;
        }

        // Check if at least one recipient is configured
        if (this.recipients.length === 0) {
            this.showMessage('Debe configurar al menos un destinatario', 'error');
            this.goToStep(2);
            return false;
        }

        return true;
    }

    showSummary() {
        const summary = `
            <div style="background: #f8f9fa; padding: 2rem; border-radius: 8px; margin: 2rem 0;">
                <h3>Resumen de Configuración</h3>
                <div style="margin-top: 1rem;">
                    <p><strong>Controles configurados:</strong> ${this.getEnabledControlsCount()}</p>
                    <p><strong>Destinatarios:</strong> ${this.recipients.length}</p>
                    <p><strong>Prioridad:</strong> ${this.controlData.criteria.priority || 'No especificada'}</p>
                    <p><strong>Frecuencia:</strong> ${this.controlData.criteria.frequency || 'No especificada'}</p>
                </div>
                <button class="btn btn-primary" onclick="wizard.resetWizard()" style="margin-top: 1rem;">
                    Crear Nueva Configuración
                </button>
            </div>
        `;
        
        document.querySelector('.content').innerHTML = summary;
    }

    getEnabledControlsCount() {
        let count = 0;
        Object.values(this.controlData.controls).forEach(control => {
            if (Array.isArray(control)) {
                count += control.length;
            } else if (control && control.enabled) {
                count += 1;
            }
        });
        return count;
    }

    resetWizard() {
        if (confirm('¿Está seguro de que desea crear una nueva configuración? Se perderán los datos actuales.')) {
            localStorage.removeItem('controlWizardData');
            location.reload();
        }
    }

    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        
        // Style the message
        Object.assign(messageEl.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '4px',
            color: 'white',
            fontWeight: '500',
            zIndex: '1000',
            maxWidth: '300px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
        });

        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };
        messageEl.style.backgroundColor = colors[type] || colors.info;

        // Add to page
        document.body.appendChild(messageEl);

        // Remove after 3 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 3000);
    }
}

// Initialize wizard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.wizard = new ControlWizard();
});

// Add some utility functions
function exportConfiguration() {
    const data = JSON.parse(localStorage.getItem('controlWizardData') || '{}');
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'control-configuration.json';
    link.click();
}

function importConfiguration(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                localStorage.setItem('controlWizardData', JSON.stringify(data));
                location.reload();
            } catch (error) {
                alert('Error al importar el archivo. Verifique que sea un archivo JSON válido.');
            }
        };
        reader.readAsText(file);
    }
}
