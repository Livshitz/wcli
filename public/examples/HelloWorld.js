// Simple "Hello World" remote component example
// Usage: view HelloWorld --remote /examples/HelloWorld.js message="Your text here"

(function (global) {
  'use strict';

  // Get Vue from window (it will be exposed by the terminal)
  const Vue = window.Vue;
  
  if (!Vue || !Vue.h || !Vue.ref) {
    console.error('Vue not found! This component requires Vue 3 to be available.');
    global.HelloWorld = {
      template: '<div style="color: red;">Error: Vue not available</div>'
    };
    return;
  }

  const { h, ref } = Vue;

  global.HelloWorld = {
    name: 'HelloWorld',
    props: {
      message: {
        type: String,
        default: 'Hello from a remote component! 🚀'
      },
      bgColor: {
        type: String,
        default: 'rgba(0, 40, 0, 0.8)'
      },
      textColor: {
        type: String,
        default: '#0f0'
      }
    },
    setup(props) {
      const clicks = ref(0);
      const emoji = ref('👋');
      
      const emojis = ['👋', '🎉', '🚀', '⭐', '💚', '🔥', '✨'];
      
      const handleClick = () => {
        clicks.value++;
        emoji.value = emojis[clicks.value % emojis.length];
      };
      
      return () => h('div', {
        style: {
          padding: '1.5rem',
          margin: '1rem 0',
          border: `2px solid ${props.textColor}`,
          borderRadius: '8px',
          backgroundColor: props.bgColor,
          fontFamily: 'monospace',
          color: props.textColor,
          maxWidth: '600px'
        }
      }, [
        h('div', { 
          style: { 
            fontSize: '2rem', 
            marginBottom: '1rem',
            textAlign: 'center'
          } 
        }, emoji.value),
        h('h2', { 
          style: { 
            margin: '0 0 1rem 0',
            fontSize: '1.5rem',
            borderBottom: `1px solid ${props.textColor}`,
            paddingBottom: '0.5rem'
          } 
        }, 'Remote Component Demo'),
        h('p', { 
          style: { 
            fontSize: '1.1rem',
            marginBottom: '1rem',
            lineHeight: '1.6'
          } 
        }, props.message),
        h('button', {
          onClick: handleClick,
          style: {
            padding: '0.75rem 1.5rem',
            background: props.textColor,
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: '1rem',
            fontWeight: 'bold',
            transition: 'transform 0.1s',
            boxShadow: `0 2px 4px rgba(0, 0, 0, 0.3)`
          },
          onMouseover: (e) => {
            e.target.style.transform = 'scale(1.05)';
          },
          onMouseout: (e) => {
            e.target.style.transform = 'scale(1)';
          }
        }, `Clicked ${clicks.value} times`),
        h('div', {
          style: {
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '4px',
            fontSize: '0.9rem',
            borderLeft: `3px solid ${props.textColor}`
          }
        }, [
          h('div', { style: { fontWeight: 'bold', marginBottom: '0.5rem' } }, '💡 Tip:'),
          h('div', {}, 'This component was loaded remotely from /examples/HelloWorld.js'),
          h('div', { style: { marginTop: '0.25rem' } }, 
            'Try: view HelloWorld --remote /examples/HelloWorld.js message="Custom!" textColor="#ff0"'
          )
        ])
      ]);
    }
  };

}(typeof self !== 'undefined' ? self : this));

