import Navbar from './Navbar';
import Footer from './Footer';
import Toast from './Toast';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import { useUI } from '../stores/ui';

export default function Layout(props) {
  const ui = useUI();

  return (
    <>
      <Navbar />
      <main>{props.children}</main>
      <Footer />
      <Toast />
      <LoginModal
        show={ui.activeModal() === 'loginModal'}
        closeModal={ui.closeModal}
        switchModal={ui.switchModal}
      />
      <RegisterModal
        show={ui.activeModal() === 'registerModal'}
        closeModal={ui.closeModal}
        switchModal={ui.switchModal}
      />
    </>
  );
}
