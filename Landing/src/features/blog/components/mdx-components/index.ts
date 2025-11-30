import { CTAButton } from './CTAButton';
import { Screenshot } from './Screenshot';
import { FeatureHighlight } from './FeatureHighlight';
import { VideoEmbed } from './VideoEmbed';

/**
 * Registry of custom MDX components available in blog posts.
 * These components can be used directly in MDX files without imports.
 */
export const mdxComponents = {
  CTAButton,
  Screenshot,
  FeatureHighlight,
  VideoEmbed,
};

export { CTAButton, Screenshot, FeatureHighlight, VideoEmbed };
