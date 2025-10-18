// Example remote Vue component that can be loaded via URL
// This is a simple UMD-style component that works with the view command
// Usage: view SimpleRemote --remote https://raw.githubusercontent.com/...

(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    global.SimpleRemoteComponent = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const { ref, h } = window.Vue || {};
  
  if (!h) {
    console.error('Vue not found! Make sure Vue is loaded before this component.');
    return {};
  }

  return {
    name: 'SimpleRemoteComponent',
    props: {
      message: {
        type: String,
        default: 'Hello from Remote Component!'
      },
      color: {
        type: String,
        default: '#0f0'
      }
    },
    setup(props) {
      const count = ref(0);
      
      const increment = () => {
        count.value++;
      };
      
      return () => h('div', {
        style: {
          padding: '1rem',
          border: `2px solid ${props.color}`,
          borderRadius: '4px',
          backgroundColor: 'rgba(0, 20, 0, 0.5)',
          color: props.color,
          fontFamily: 'monospace',
          margin: '0.5rem 0'
        }
      }, [
        h('h3', { style: { margin: '0 0 0.5rem 0' } }, 'Remote Component'),
        h('p', {}, props.message),
        h('button', {
          onClick: increment,
          style: {
            padding: '0.5rem 1rem',
            background: props.color,
            color: '#000',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontWeight: 'bold'
          }
        }, `Clicked ${count.value} times`)
      ]);
    }
  };
}));

