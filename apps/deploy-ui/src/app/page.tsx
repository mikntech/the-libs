// pages/index.tsx

import dynamic from 'next/dynamic';
import styles from './page.module.scss';

// Dynamically import the client component
const EditableFieldWrapper = dynamic(
  () => import('./components/EditableFieldWrapper'),
  {
    ssr: false, // Disable SSR for this component
  },
);

export default function HomePage() {
  const menuItems = ['Item 1', 'Item 2', 'Item 3'];

  return (
    <div className={styles.page}>
      {/* Static Menu (SSR) */}
      <ul>
        {menuItems.map((item) => (
          <li key={item}>
            <EditableFieldWrapper item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
