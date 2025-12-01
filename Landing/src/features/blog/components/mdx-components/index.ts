import { CTAButton } from './CTAButton';
import { ChromeStoreLink } from './ChromeStoreLink';
import { Screenshot } from './Screenshot';
import { FeatureHighlight } from './FeatureHighlight';
import { VideoEmbed } from './VideoEmbed';

/**
 * Registry of custom MDX components available in blog posts.
 * These components can be used directly in MDX files without imports.
 */
export const mdxComponents = {
  CTAButton,
  ChromeStoreLink,
  Screenshot,
  FeatureHighlight,
  VideoEmbed,
};

export { CTAButton, ChromeStoreLink, Screenshot, FeatureHighlight, VideoEmbed };
