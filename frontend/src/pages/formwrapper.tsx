// src/pages/FormWrapper.tsx
import { useState } from 'react';
import Page1 from './page1';

const FormWrapper = () => {
  const [formId, setFormId] = useState<string | null>(null);

  return <Page1 formId={formId} setFormId={setFormId} />;
};

export default FormWrapper;
