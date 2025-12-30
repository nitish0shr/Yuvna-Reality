import IntakeMeeting from './IntakeMeeting';

interface SetupWizardProps {
    onNext: () => void;
}

export default function SetupWizard({ onNext }: SetupWizardProps) {
    return <IntakeMeeting onNext={onNext} />;
}
