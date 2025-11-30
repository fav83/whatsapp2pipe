import type { TOCItem } from '../types';
import { useActiveSection } from '../hooks/useActiveSection';

interface TableOfContentsProps {
  items: TOCItem[];
}

/**
 * Sticky sidebar table of contents with active section highlighting.
 */
export function TableOfContents({ items }: TableOfContentsProps) {
  // Flatten all heading IDs for the active section hook
  const allIds = items.flatMap((item) => [
    item.id,
    ...(item.children?.map((child) => child.id) || []),
  ]);

  const activeId = useActiveSection(allIds);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Scroll with offset for fixed header
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // Update URL hash
      window.history.pushState(null, '', `#${id}`);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="sticky top-24">
      <h4 className="text-sm font-semibold text-gray-900 mb-4">
        On This Page
      </h4>
      <ul className="space-y-1 border-l-2 border-gray-200">
        {items.map((item) => (
          <TOCLink
            key={item.id}
            item={item}
            activeId={activeId}
            onItemClick={handleClick}
          />
        ))}
      </ul>
    </nav>
  );
}

interface TOCLinkProps {
  item: TOCItem;
  activeId: string | null;
  onItemClick: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}

function TOCLink({ item, activeId, onItemClick }: TOCLinkProps) {
  const isActive = activeId === item.id;

  return (
    <li>
      <a
        href={`#${item.id}`}
        onClick={(e) => onItemClick(e, item.id)}
        className={`
          block py-1.5 pl-4 text-sm transition-colors duration-150
          ${isActive
            ? 'text-button-primary font-semibold border-l-4 border-button-primary -ml-[2px]'
            : 'text-gray-500 hover:text-gray-900'
          }
        `}
      >
        {item.text}
      </a>
      {item.children && item.children.length > 0 && (
        <ul className="ml-4">
          {item.children.map((child) => (
            <li key={child.id}>
              <a
                href={`#${child.id}`}
                onClick={(e) => onItemClick(e, child.id)}
                className={`
                  block py-1 pl-4 text-sm transition-colors duration-150
                  ${activeId === child.id
                    ? 'text-button-primary font-semibold'
                    : 'text-gray-400 hover:text-gray-700'
                  }
                `}
              >
                {child.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
