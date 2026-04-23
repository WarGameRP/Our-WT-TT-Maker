class CreditTool {
  static get toolbox() {
    return {
      title: 'Credit',
      icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 0H45C20.186 0 0 20.186 0 45v186c0 24.814 20.186 45 45 45h246c24.814 0 45-20.186 45-45V45c0-24.814-20.186-45-45-45zm-81 126H96v-36h114v36zm114 90H96v-36h228v36zm0-90H222v-36h102v36z"/></svg>'
    };
  }

  constructor({ data, config, api }) {
    this.data = data || {};
    this.config = config || {};
    this.api = api;
    
    // Use global creditTypes if available (from config.json)
    this.creditTypes = window.creditTypes && window.creditTypes.length > 0 
      ? window.creditTypes 
      : [
        { id: 'infanterie', name: 'Crédits Infanterie', icon: '🪖', color: '#FFFFFF' },
        { id: 'blindes', name: 'Crédits Blindés', icon: '🛡️', color: '#D11B1B' },
        { id: 'mecanises', name: 'Crédits Mécanisés', icon: '🚛', color: '#B06EFF' },
        { id: 'motorises', name: 'Crédits Motorisés', icon: '🚗', color: '#A1A1A1' },
        { id: 'support', name: 'Crédits Support', icon: '🚑', color: '#70CC41' },
        { id: 'aeriens', name: 'Crédits Aériens', icon: '✈️', color: '#A6DEFF' },
        { id: 'invitation', name: 'Crédits d\'Invitations', icon: '✉️', color: '#FF8F00' }
      ];
    
    this.wrapper = undefined;
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('credit-wrapper');
    
    const textInput = document.createElement('input');
    textInput.classList.add('credit-text-input');
    textInput.type = 'text';
    textInput.placeholder = 'Text before credit (e.g., "image 1")';
    textInput.value = this.data.text || '';
    
    const typeSelect = document.createElement('select');
    typeSelect.classList.add('credit-type-select');
    this.creditTypes.forEach(type => {
      const option = document.createElement('option');
      option.value = type.id;
      option.textContent = type.icon ? `${type.icon} ${type.name}` : type.name;
      if (this.data.type === type.id) option.selected = true;
      typeSelect.appendChild(option);
    });
    
    const valueInput = document.createElement('input');
    valueInput.classList.add('credit-value-input');
    valueInput.type = 'number';
    valueInput.placeholder = 'Credit value';
    valueInput.value = this.data.value || '';
    
    this.wrapper.appendChild(textInput);
    this.wrapper.appendChild(typeSelect);
    this.wrapper.appendChild(valueInput);
    
    return this.wrapper;
  }

  save(blockContent) {
    const textInput = blockContent.querySelector('.credit-text-input');
    const typeSelect = blockContent.querySelector('.credit-type-select');
    const valueInput = blockContent.querySelector('.credit-value-input');
    
    const selectedType = this.creditTypes.find(t => t.id === typeSelect.value);
    
    return {
      text: textInput.value,
      type: typeSelect.value,
      value: parseFloat(valueInput.value) || 0,
      typeName: selectedType.name,
      icon: selectedType.icon,
      color: selectedType.color
    };
  }
}
