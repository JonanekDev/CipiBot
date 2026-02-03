import { onBeforeRouteLeave } from 'vue-router';
import { onBeforeUnmount, onMounted, Ref, unref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

export function useUnsavedChanges(hasChanges: Ref<boolean> | (() => boolean)) {
  const { t } = useI18n();

  const check = () => unref(hasChanges);

  // Browser navigation (close tab, refresh, back/forward)
  const onBeforeUnload = (e: BeforeUnloadEvent) => {
    if (check()) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  onMounted(() => {
    window.addEventListener('beforeunload', onBeforeUnload);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', onBeforeUnload);
  });

  // Vue Router navigation
  onBeforeRouteLeave((to, from, next) => {
    if (check()) {
      const confirmMessage = t('common.unsavedChangesConfirm');
      if (window.confirm(confirmMessage)) {
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  });
}
