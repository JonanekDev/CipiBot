import { ref, watch, type Ref } from 'vue';
import { z } from 'zod';

export function useValidation<T>(
  schema: z.ZodType<T>,
  data: Ref<T | undefined>,
  options: { mode: 'eager' | 'lazy' } = { mode: 'lazy' },
) {
  const errors = ref<Record<string, string>>({});
  const isValid = ref(true);

  const validate = () => {
    if (!data.value) return false;

    const result = schema.safeParse(data.value);

    if (result.success) {
      errors.value = {};
      isValid.value = true;
      return true;
    } else {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        newErrors[path] = issue.message;
      });
      errors.value = newErrors;
      isValid.value = false;
      return false;
    }
  };

  if (options.mode === 'eager') {
    watch(
      data,
      () => {
        validate();
      },
      { deep: true },
    );
  } else {
    watch(
      data,
      () => {
        if (!isValid.value) {
          validate();
        }
      },
      { deep: true },
    );
  }

  return {
    errors,
    isValid,
    validate,
    clearErrors: () => {
      errors.value = {};
      isValid.value = true;
    },
  };
}
