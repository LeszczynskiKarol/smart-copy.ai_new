// frontend/src/types/google.d.ts

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: any) => void;
        renderButton: (element: HTMLElement | null, config: any) => void;
      };
    };
  };
}
