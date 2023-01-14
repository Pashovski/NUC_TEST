import { html } from 'lit';
import '../src/shell-element.js';

export default {
  title: 'ShellElement',
  component: 'shell-element',
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

function Template({ title, backgroundColor }) {
  return html`
    <shell-element
      style="--shell-element-background-color: ${backgroundColor || 'white'}"
      .title=${title}
    >
    </shell-element>
  `;
}

export const App = Template.bind({});
App.args = {
  title: 'My app',
};
