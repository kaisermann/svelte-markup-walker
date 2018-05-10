import MagicString from 'magic-string';
import { walk, WalkerOptions, parse } from 'svelte/compiler';
import { PreprocessorGroup } from 'svelte/types/compiler/preprocess';

type WalkerWrapper = ({
  content,
  filename,
}: {
  content: MagicString;
  filename: string;
}) => WalkerOptions;

interface WalkerWrappers {
  html?: WalkerWrapper;
  css?: WalkerWrapper;
  instance?: WalkerWrapper;
  module?: WalkerWrapper;
}

export default ({
  html,
  css,
  instance: instanceScript,
  module: moduleScript,
}: WalkerWrappers): Pick<PreprocessorGroup, 'markup'> => {
  return {
    markup({ content, filename }) {
      const parsed = parse(content);
      const magicContent = new MagicString(content);

      if (typeof html === 'function') {
        walk(parsed.html, html({ filename, content: magicContent }));
      }

      if (typeof css === 'function') {
        walk(parsed.css, css({ filename, content: magicContent }));
      }

      if (typeof instanceScript === 'function') {
        walk(
          parsed.instance,
          instanceScript({ filename, content: magicContent }),
        );
      }

      if (typeof moduleScript === 'function') {
        walk(parsed.module, moduleScript({ filename, content: magicContent }));
      }

      return {
        code: magicContent.toString(),
        map: magicContent.generateMap({ source: filename }).toString(),
      };
    },
  };
};
