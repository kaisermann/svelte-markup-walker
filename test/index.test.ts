import { resolve } from 'path';

import markupWalker from '../src';

const filename = resolve(__dirname, 'App.svelte');
const template = `
<div foo></div>
<script>
let a
</script>
<script context="module">
let a
</script>
<style>
div {}</style>
`;

test('should allow to transform the html', async () => {
  const processor = markupWalker({
    html({ content }) {
      return {
        enter(node) {
          if (node.type === 'Attribute') {
            content.overwrite(node.start, node.end, 'template-replace');
          }
        },
      };
    },
  });
  const processed = await processor.markup({ content: template, filename });
  expect(processed.code).toContain('<div template-replace');
});

test('should allow to transform the instance script', async () => {
  const processor = markupWalker({
    instance({ content }) {
      return {
        enter(node) {
          if (node.type === 'Identifier') {
            content.overwrite(node.start, node.end, 'FOO');
          }
        },
      };
    },
  });
  const processed = await processor.markup({ content: template, filename });
  expect(processed.code).toContain('let FOO');
});

test('should allow to transform the module script', async () => {
  const processor = markupWalker({
    module({ content }) {
      return {
        enter(node) {
          if (node.type === 'Identifier') {
            content.overwrite(node.start, node.end, 'BAR');
          }
        },
      };
    },
  });
  const processed = await processor.markup({ content: template, filename });
  expect(processed.code).toContain('let BAR');
});

test('should allow to transform the style', async () => {
  const processor = markupWalker({
    css({ content }) {
      return {
        enter(node) {
          if (node.type === 'Selector') {
            content.overwrite(node.start, node.end, 'h1');
          }
        },
      };
    },
  });
  const processed = await processor.markup({ content: template, filename });
  expect(processed.code).toContain('h1 {');
});
