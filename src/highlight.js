import * as hljs from 'highlight.js/lib/highlight.js';
import 'highlight.js/styles/atom-one-light.css';

hljs.registerLanguage(
  'javascript',
  require('highlight.js/lib/languages/javascript'),
);
hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'));

export default hljs;
