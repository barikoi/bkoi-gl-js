// Enhanced mock for maplibre-gl-draw
const mockMapboxDraw = jest.fn().mockImplementation((options) => {
  const mockInstance = {
    options: options || {},
    // Drawing methods
    add: jest.fn(function(feature) {
      this.features = this.features || [];
      this.features.push(feature);
      return this;
    }),
    delete: jest.fn(function(id) {
      if (this.features) {
        this.features = this.features.filter(f => f.id !== id);
      }
      return this;
    }),
    deleteAll: jest.fn(function() {
      this.features = [];
      return this;
    }),
    get: jest.fn(function(id) {
      if (this.features) {
        return this.features.find(f => f.id === id);
      }
      return null;
    }),
    getAll: jest.fn(function() {
      return {
        features: this.features || []
      };
    }),
    // Control methods
    onAdd: jest.fn(function(map) {
      this.map = map;
      const container = document.createElement('div');
      container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
      
      // Add control buttons based on options
      if (this.options.controls && this.options.controls.polygon) {
        const polygonBtn = document.createElement('button');
        polygonBtn.className = 'mapbox-gl-draw_polygon';
        polygonBtn.setAttribute('title', 'Draw a polygon');
        container.appendChild(polygonBtn);
      }
      
      if (this.options.controls && this.options.controls.trash) {
        const trashBtn = document.createElement('button');
        trashBtn.className = 'mapbox-gl-draw_trash';
        trashBtn.setAttribute('title', 'Delete selected features');
        container.appendChild(trashBtn);
      }
      
      return container;
    }),
    onRemove: jest.fn(function() {
      this.map = null;
      return this;
    }),
    // Event handling
    on: jest.fn(function(event, callback) {
      this.eventListeners = this.eventListeners || {};
      this.eventListeners[event] = this.eventListeners[event] || [];
      this.eventListeners[event].push(callback);
      return this;
    }),
    off: jest.fn(function(event, callback) {
      if (this.eventListeners && this.eventListeners[event]) {
        this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
      }
      return this;
    }),
    fire: jest.fn(function(event, data) {
      if (this.eventListeners && this.eventListeners[event]) {
        this.eventListeners[event].forEach(callback => callback(data));
      }
      return this;
    }),
    // Feature management
    features: [],
    set: jest.fn(function(feature) {
      if (!this.features) this.features = [];
      const existingIndex = this.features.findIndex(f => f.id === feature.id);
      if (existingIndex >= 0) {
        this.features[existingIndex] = feature;
      } else {
        this.features.push(feature);
      }
      return this;
    }),
    // Drawing state
    changeMode: jest.fn(function(mode) {
      this.currentMode = mode;
      return this;
    }),
    getMode: jest.fn(function() {
      return this.currentMode || 'simple_select';
    }),
    // Selection
    getSelected: jest.fn(function() {
      return {
        features: this.features.filter(f => f.selected) || []
      };
    }),
    getSelectedIds: jest.fn(function() {
      return (this.features.filter(f => f.selected) || []).map(f => f.id);
    }),
    // Utility
    _ctx: {
      store: {
        getAll: jest.fn(() => ({
          features: this.features || []
        }))
      }
    }
  };
  
  return mockInstance;
});

module.exports = mockMapboxDraw;
