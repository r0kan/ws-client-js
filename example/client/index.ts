import { createElement } from 'react';
import { render } from 'react-dom';

import { App } from './App';

const container = document.querySelector('#app');
if (container) {
  render(createElement(App), container);
}
