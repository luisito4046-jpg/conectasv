import { createContext, useContext, createSignal } from 'solid-js';

const UIContext = createContext();

export function UIProvider(props) {
  const [activeModal, setActiveModal] = createSignal(null);

  const openModal = (id) => setActiveModal(id);
  const closeModal = () => setActiveModal(null);
  const switchModal = (closeId, openId) => {
    closeModal();
    setTimeout(() => setActiveModal(openId), 300);
  };

  return (
    <UIContext.Provider value={{ activeModal, openModal, closeModal, switchModal }}>
      {props.children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}
