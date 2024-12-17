import { ReactNode, useEffect, useState } from 'react';
import { TODO } from '@the-libs/base-shared';
import { InstallModal } from '..';

interface PWAPrompterWrapperProps {
  children: ReactNode;
}

export const PWAPrompterWrapper = ({ children }: PWAPrompterWrapperProps) => {
  const [installPrompt, setInstallPrompt] = useState<TODO>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    window.addEventListener('appinstalled', () => {
      setIsAppInstalled(true);
    });
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: TODO) => {
      e.preventDefault();
      if (!isAppInstalled) {
        setInstallPrompt(e);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
    };
  }, [isAppInstalled]);

  const showInstallPrompt = () => {
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: TODO) => {
      if (choiceResult.outcome === 'accepted') {
      } else {
      }
      setInstallPrompt(null);
    });
  };

  return (
    <>
      {!dismissed && installPrompt && !isAppInstalled && (
        <InstallModal
          onInstallClicked={showInstallPrompt}
          dismiss={() => setDismissed(true)}
        />
      )}
      {children}
    </>
  );
};
