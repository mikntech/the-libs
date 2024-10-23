// pages/EditableFieldWrapper.tsx
'use client'; // Mark this component as client-side

import { useState } from 'react';
import { EditableField } from '@the-libs/base-frontend';

export default function EditableFieldWrapper({ item }: { item: string }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div>
      <button onClick={() => setIsEditing(!isEditing)}>
        {isEditing ? `Cancel Edit ${item}` : `Edit ${item}`}
      </button>

      {isEditing && (
        <EditableField name={item} action={async () => {}} cb={() => {}} />
      )}
    </div>
  );
}
