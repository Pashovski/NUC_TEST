import { LitElement, html, css } from 'lit';
import { customStyles } from './styles/custom';

// const host = `192.168.1.230`;
const host = `localhost`;

const logo = new URL(
  '../assets/washing-machine-svgrepo-com.svg',
  import.meta.url
).href;

const dryImg = new URL('../assets/dry.jpeg', import.meta.url).href;

export class ShellElement extends LitElement {
  static get properties() {
    return {
      title: { type: String },
      washerStatus: { type: String },
      showImage: { type: Boolean },
      doneMessage: { type: String },
    };
  }

  static styles = [
    css`
      :host {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: calc(10px + 2vmin);
        color: #1a2b42;
        max-width: 100vw;
        margin: 0 auto;
        text-align: center;
        font-family: sans-serif;
      }
      main {
        flex-grow: 1;
        padding: 30px; /* add some padding */
      }
      #myVideo {
        width: 100vw;
        height: 100vh;
        object-fit: cover;
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: -1;
      }
    `,
    customStyles,
  ];

  constructor() {
    super();
    this.title = '221 Laundry';
    this.showImage = false;
    this.doneMessage = '';
    this.washerStatus = 'Washing';
  }

  updated(changedProperties) {
    if (changedProperties.has('washerStatus')) {
      this.shadowRoot.querySelector('video').load();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    let ws = new WebSocket(`ws://${host}:8000/ws/123`);

    ws.onopen = () => {
      ws.send('Hello, server!');
    };

    ws.onmessage = event => {
      let data;
      if (['idle', 'washing'].includes(event.data)) {
        data = capitalize(event.data);
      } else {
        data = JSON.parse(event.data)[0]['_value'];
      }
      if (data === 'Idle') {
        this.doneMessage = 'Load is finished';
      } else {
        this.doneMessage = 'Load is running';
      }
      this.washerStatus = data;
      this.showImage = !this.showImage;
    };

    let reconnect = () => {
      setTimeout(() => {
        ws = new WebSocket(`ws://${host}:8000/ws/123`);
      }, 5000);
    };
    function capitalize(word) {
      return word[0].toUpperCase() + word.substr(1);
    }
    ws.onclose = event => {
      console.log('WebSocket closed with code: ', event.code);
      reconnect();
    };
  }

  render() {
    return html`
      <video autoplay muted loop id="myVideo">
        <source src="../assets/${this.washerStatus}.mp4" type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>

      <main>
        <h1 class="title">${this.title}</h1>
        <h2>${this.washerStatus}</h2>
        <h3>${this.doneMessage}</h3>
      </main>
    `;
  }
}
