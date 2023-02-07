import { LitElement, html, css } from 'lit';

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
    };
  }

  static get styles() {
    return css`
      :host {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        font-size: calc(10px + 2vmin);
        color: #1a2b42;
        max-width: 960px;
        margin: 0 auto;
        text-align: center;
        background-color: #f9efea; /*change the background color*/
      }
      body {
        background-color: edede9;
      }

      main {
        flex-grow: 1;
        padding: 30px; /*add some padding */
      }

      .logo {
        margin-top: 36px;
        animation: app-logo-spin infinite 20s linear;
      }

      @keyframes app-logo-spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      h1 {
        font-size: 2.5em; /*increase the font size of the title */
        color: #9b8b7a; /*change the title color */
        text-transform: uppercase; /*change the title to uppercase */
        letter-spacing: 2px; /*add spacing between letters */
      }

      h2 {
        font-size: 1.5em; /*increase the font size of the status */
        color: #f5a623; /*change the status color to a softer orange */
        text-transform: capitalize; /*change the status to title case */
        margin-top: 20px; /*add some margin to the status */
      }
    `;
  }

  constructor() {
    super();
    this.title = '221 Laundry';
    this.showImage = false;
  }

  connectedCallback() {
    super.connectedCallback();
    let ws = new WebSocket('ws://192.168.1.230:8000/ws/123');
    // let ws = new WebSocket("ws://localhost:8000/ws/123");

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
      this.washerStatus = data;
      this.showImage = !this.showImage;
    };

    let reconnect = () => {
      setTimeout(() => {
        ws = new WebSocket('ws://192.168.1.230:8000/ws/123');
        // ws = new WebSocket("ws://localhost:8000/ws/123");
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
      <main>
        ${
          this.showImage
            ? html`<div><img alt="Dry Image" src=${dryImg} /></div>`
            : html`<div class="logo">
                <img alt="Washing machine Icon" src=${logo} />
              </div>`
        }
        </div>
        <h1>${this.title}</h1>
        <h2>${this.washerStatus}</h2>
      </main>
    `;
  }
}
