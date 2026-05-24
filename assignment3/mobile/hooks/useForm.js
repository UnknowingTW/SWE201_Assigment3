// hooks/useForm.js
// Generic form hook that manages field values, validation errors, and submission.

import { useState, useCallback } from 'react';

/**
 * @param {Object}   initialValues - Initial field values.
 * @param {Function} validate      - Optional function(values) → errorObject.
 */
export function useForm(initialValues = {}, validate = null) {
  const [values, setValues]     = useState(initialValues);
  const [errors, setErrors]     = useState({});
  const [touched, setTouched]   = useState({});
  const [submitting, setSubmitting] = useState(false);

  /** Update a single field value. */
  const handleChange = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear the error for this field as the user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  /** Mark a field as touched (for showing errors on blur). */
  const handleBlur = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  /** Run validation and return true if the form is valid. */
  const validateForm = useCallback(() => {
    if (!validate) return true;
    const validationErrors = validate(values);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [validate, values]);

  /**
   * Wrap a submit handler with validation and loading state.
   * @param {Function} onSubmit - async function(values) called when form is valid.
   */
  const handleSubmit = useCallback(async (onSubmit) => {
    // Mark all fields as touched to surface any hidden errors
    const allTouched = Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  }, [values, validateForm]);

  /** Reset form back to initial values. */
  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return { values, errors, touched, submitting, handleChange, handleBlur, handleSubmit, reset, setValues };
}
